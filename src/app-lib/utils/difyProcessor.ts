import { AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { callDifyWorkflow } from "@/smartspecs/app-lib/utils/difyClient";
import { createRequirement, updateRequirement, loadRequirements } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";
import { Priority, Requirement, Status } from "@/smartspecs/app-lib/interfaces/requirement";

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
  status?: string;
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
      requirementsList,
      status
    );


    const newRequirementsList = (wfResp?.newRequirementsList ?? [])
        .map((requeriment, index) => ({
          ...requeriment,
          id: `temp_${Date.now()}_${index}`
        })
      );

    if (onShowModal && newRequirementsList.length > 0) {
      onShowModal(newRequirementsList, meetingTitle);
    }
    

  } catch (err) {
    console.error("Error en processDifyWorkflow:", err);
  }
}

export async function sendSelectedRequirements(
  dispatch: AppDispatch,
  projectId: string,
  meetingId: string,
  selectedRequirements: Requirement[]
) {
  try {
    console.log("🚀 Enviando requirements seleccionados:", selectedRequirements.length);
    console.log("📋 Requirements a procesar:", selectedRequirements);
    
    for (const req of selectedRequirements) {
      console.log("🔄 Procesando requirement:", req.title);
      
      if (req.id && req.id.startsWith('temp_')) {
        console.log("✅ Creando nuevo requirement:", req.title);
        const result = await dispatch(
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
        console.log("✅ Resultado creación:", result);
      } else {
        console.log("🔄 Actualizando requirement existente:", req.title);
        const result = await dispatch(
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
        console.log("🔄 Resultado actualización:", result);
      }
    }
    
    console.log("🔄 Recargando requirements del proyecto...");
    await dispatch(loadRequirements(projectId));
    console.log("✅ Requirements recargados exitosamente");
    
  } catch (error) {
    console.error("❌ Error en sendSelectedRequirements:", error);
  }
}