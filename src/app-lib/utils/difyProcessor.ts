import { AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { callDifyWorkflow } from "@/smartspecs/app-lib/utils/difyClient";
import { createRequirement, updateRequirement } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";
import { firestore } from "@/smartspecs/lib/config/firebase-settings";
import { Priority, Requirement, Status } from "@/smartspecs/app-lib/interfaces/requirement";
import { doc, getDoc, setDoc, collection, Timestamp } from "firebase/firestore";

interface ProcessDifyParams {
  dispatch: AppDispatch;
  projectId: string;
  meetingId: string;
  projectTitle: string;
  projectDescription: string;
  projectClient: string;
  meetingTitle: string;
  meetingDescription: string;
  meetingTranscription: string;
  requirementsList: Requirement[];
}

function mapStatus(value: string): Status {
  switch (value) {
    case "in_progress":
      return Status.IN_PROGRESS;
    case "done":
      return Status.DONE;
    case "pending":
    default:
      return Status.PENDING;
  }
}

export async function processDifyWorkflow({
  dispatch,
  projectId,
  meetingId,
  projectTitle,
  projectDescription,
  projectClient,
  meetingTitle,
  meetingDescription,
  meetingTranscription,
  requirementsList,
}: ProcessDifyParams) {
  try {
    const wfResp = await callDifyWorkflow(
      projectId,
      meetingId,
      projectTitle,
      projectDescription,
      projectClient,
      meetingTitle,
      meetingDescription,
      meetingTranscription,
      requirementsList
    );

    const updatedRequirementsList = wfResp?.updatedRequirementsList ?? [];
    const newRequirementsList = wfResp?.newRequirementsList ?? [];

    for (const updated of updatedRequirementsList) {
      const docRef = doc(firestore, "requirements", updated.id);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        console.warn(`🚫 ID no encontrado en Firestore: ${updated.id}`);
        continue;
      }

      const previousData = snap.data();
      const previousState = {
        id: snap.id,
        projectId: previousData?.projectId || "",
        title: previousData?.title || "",
        description: previousData?.description || "",
        priority: previousData?.priority || Priority.MEDIUM,
        status: previousData?.status || Status.PENDING,
        responsible: previousData?.responsible || "",
        createdAt: previousData?.createdAt?.toDate().toISOString() || "",
        updatedAt: previousData?.updatedAt?.toDate().toISOString() || "",
      };

      await dispatch(
        updateRequirement({
          id: updated.id,
          updatedData: {
            title: updated.title,
            description: updated.description,
            priority: updated.priority as Priority,
            status: mapStatus(updated.status),
            responsible: updated.responsible || "",
            origin: updated.origin || "Dify",
            reason: updated.reason || "",
            updatedAt: new Date().toISOString(),
          },
        })
      );

      const historyRef = doc(collection(firestore, "requirements", updated.id, "history"));
      await setDoc(historyRef, {
        id: historyRef.id, // (opcional pero útil si querés guardar también el ID del historial)
        requirementId: updated.id, // ⬅️ Esta es la línea clave
        changedAt: Timestamp.now(),
        meetingId,
        origin: updated.origin || "Dify",
        reason: updated.reason || "",
        previousState,
        newState: {
          id: updated.id,
          projectId: updated.projectId,
          title: updated.title,
          description: updated.description,
          priority: updated.priority,
          status: updated.status,
          responsible: updated.responsible || "",
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    }

    for (const req of newRequirementsList) {
      if (!req.title || !req.description) {
        console.warn("⚠️ Requerimiento nuevo incompleto:", req);
        continue;
      }

      await dispatch(
        createRequirement({
          projectId,
          title: req.title,
          description: req.description,
          priority: req.priority ?? Priority.MEDIUM,
          status: mapStatus(req.status),
          responsible: req.responsible || "",
          origin: req.origin || "Dify",
          reason: req.reason || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    }
  } catch (err) {
    console.error("❌ Error en processDifyWorkflow:", err);
  }
}