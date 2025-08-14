import { AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { callDifyWorkflow } from "@/smartspecs/app-lib/utils/difyClient";
import { createRequirement, updateRequirement, loadRequirements } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";
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
  onShowModal?: (requirements: Requirement[], meetingTitle: string) => void;
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
  onShowModal,
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

    console.log({updatedRequirementsList,newRequirementsList})
    
    // 🎯 Cargar requerimientos actualizados y mostrar confirmación
    const requerimientos = await dispatch(loadRequirements(projectId));
    
    // 🆕 Mostrar modal de selección si hay callback
    if (onShowModal && (updatedRequirementsList.length > 0 || newRequirementsList.length > 0)) {
      const allRequirements = [...updatedRequirementsList, ...newRequirementsList];
      onShowModal(allRequirements, meetingTitle);
      return; // Salir aquí, el modal se encargará de enviar los requirements
    }
    
    // Si no hay modal, enviar todos automáticamente
    const totalRequirements = updatedRequirementsList.length + newRequirementsList.length;
    if (totalRequirements > 0) {
      alert(`✅ Se han enviado ${totalRequirements} requirements a Firebase exitosamente!`);
    } else {
      alert("ℹ️ No se generaron nuevos requirements de esta reunión.");
    }

  } catch (err) {
    console.error("❌ Error en processDifyWorkflow:", err);
    alert("❌ Error al procesar los requirements con Dify");
  }
}

// 🆕 Función para enviar requirements seleccionados
export async function sendSelectedRequirements(
  dispatch: AppDispatch,
  projectId: string,
  meetingId: string,
  selectedRequirements: Requirement[]
) {
  try {
    console.log("🚀 Enviando requirements seleccionados:", selectedRequirements.length);
    
    for (const req of selectedRequirements) {
      if (req.id && req.id.startsWith('temp_')) {
        // Es un requirement nuevo
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
      } else {
        // Es un requirement existente que se actualiza
        await dispatch(
          updateRequirement({
            id: req.id,
            updatedData: {
              title: req.title,
              description: req.description,
              priority: req.priority as Priority,
              status: mapStatus(req.status),
              responsible: req.responsible || "",
              origin: req.origin || "Dify",
              reason: req.reason || "",
              updatedAt: new Date().toISOString(),
            },
          })
        );
      }
    }
    
    // Recargar requirements y mostrar confirmación
    await dispatch(loadRequirements(projectId));
    alert(`✅ Se han enviado ${selectedRequirements.length} requirements a Firebase exitosamente!`);
    
  } catch (err) {
    console.error("❌ Error enviando requirements seleccionados:", err);
    alert("❌ Error al enviar los requirements seleccionados");
  }
}