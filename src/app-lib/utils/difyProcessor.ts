import { AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { callDifyWorkflow } from "@/smartspecs/app-lib/utils/difyClient";
import { createRequirement, updateRequirement } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";
import { firestore } from "@/smartspecs/lib/config/firebase-settings";
import { Priority, Requirement, Status } from "@/smartspecs/app-lib/interfaces/requirement";
import { doc, getDoc, setDoc, collection, Timestamp, query, getDocs, where } from "firebase/firestore";

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
  requirementsListRejected?: Requirement[];
  onShowModal?: (
    requirements: Requirement[], 
    meetingTitle: string,
    meetingId: string,
    meetingDescription: string,
    meetingTranscription: string
  ) => void;
  status: "new" | "updated";
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
  requirementsListRejected,
  onShowModal,
  status
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
      requirementsList,
      requirementsListRejected || [],
      status
    );
    const updatedRequirementsList = wfResp?.updatedRequirementsList ?? [];
    const newRequirementsList = wfResp?.newRequirementsList ?? [];

    if (onShowModal && (updatedRequirementsList.length > 0 || newRequirementsList.length > 0)) {
      const allRequirements = [...updatedRequirementsList, ...newRequirementsList].map(requirement => {
        if(!requirement?.id) {
          requirement.status = Status.PENDING;
        }
        return requirement;
      })
      
      const requirementsNews = allRequirements.filter(requirement => !requirement.id);

      for (const requirement of requirementsNews) {
        try {
          const newRequirementResult = await dispatch(
            createRequirement({
              projectId,
              title: requirement.title,
              description: requirement.description,
              priority: requirement.priority ?? Priority.MEDIUM,
              status: Status.PENDING,
              responsible: requirement.responsible,
              origin: requirement.origin,
              reason: requirement.reason,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          );
        } catch (error) {
          console.error({ error });
        }
      }
      const requirements = await getProjectRequirements(projectId);
      onShowModal(requirements, meetingTitle, meetingId, meetingDescription, meetingTranscription);
    }

  } catch (err) {
    console.error("❌ Error en processDifyWorkflow:", err);
  }


}

export async function getProjectRequirements(projectId: string): Promise<Requirement[]> {
  try {
    const q = query(
      collection(firestore, "requirements"),
      where("projectId", "==", projectId)
    );

    const snap = await getDocs(q);

    const requirements = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: data.projectId,
        title: data.title,
        description: data.description ,
        priority: data.priority,
        status: data.status,
        responsible: data.responsible,
        reason: data.reason,
        origin: data.origin,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      } as Requirement;
    });
    return requirements;

  } catch (error) {
    console.error({error});
    throw error;
  }
}
