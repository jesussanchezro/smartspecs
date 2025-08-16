import { Requirement } from "@/smartspecs/app-lib/interfaces/requirement";

/**
 * Lanza el workflow de Dify con toda la info del proyecto y la reunión.
 * 
 * Devuelve:
 *   {
 *     updatedRequirementsList: Requirement[],
 *     newRequirementsList: Requirement[],
 *   }
 */
export async function callDifyWorkflow(
  projectId: string,
  meetingId: string,
  projectTitle: string,
  projectDescription: string,
  projectClient: string,
  meetingTitle: string,
  meetingDescription: string,
  meetingTranscription: string,
  requirementsList: Requirement[],
  requirementsListRejected: Requirement[],
  status: "new" | "updated"
): Promise<{
  updatedRequirementsList: Requirement[];
  newRequirementsList: Requirement[];
}> {
  try {
    const payload: any = {
      user: projectClient || "frontend-app",
      inputs: {
        project_id: projectId,
        project_title: projectTitle,
        project_description: projectDescription,
        project_client: projectClient,
        meeting_id: meetingId,
        meeting_title: meetingTitle,
        meeting_description: meetingDescription,
        meeting_transcription: meetingTranscription,
        requirements_list: requirementsList.length > 0
          ? JSON.stringify(requirementsList)
          : "[]",  // <- Esto garantiza siempre enviar un array válido
          requirements_list_rejected: (requirementsListRejected ?? []).length > 0
          ? JSON.stringify(requirementsListRejected)
          : "[]", 
          status
      },
    };

    const res = await fetch("/api/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`❌ Workflow error: ${res.status} – ${txt}`);
    }

    const data = await res.json();
    console.log("✅ Dify workflow raw result:", data);

    const outputs = data.data?.outputs || {};

    return {
      updatedRequirementsList: parseJSONSafely(outputs.updated_requirements_list),
      newRequirementsList: parseJSONSafely(outputs.new_requirements_list),
    };
  } catch (err) {
    console.error("❌ callDifyWorkflow failed:", err);
    throw err;
  }
}

function parseJSONSafely(input: string | any): any[] {
  if (typeof input !== "string") return Array.isArray(input) ? input : [];

  try {
    // Limpiar el string: quitar posibles ```json, ``` y saltos innecesarios
    const cleanedInput = input
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedInput);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("⚠️ Error parsing JSON string:", input);
    return [];
  }
}