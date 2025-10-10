import { Requirement } from "@/smartspecs/app-lib/interfaces/requirement";
import axios from "axios";

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
  status: "new" | "refine"
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

    const res = await runWorkflowStreaming(payload);
    console.log("✅ Dify workflow raw result:", res);

    return {
      updatedRequirementsList: parseJSONSafely(res?.updated_requirements_list),
      newRequirementsList: parseJSONSafely(res?.new_requirements_list),
    };
  } catch (err) {
    console.error("❌ callDifyWorkflow failed:", err);
    throw err;
  }
}

async function runWorkflowStreaming(payload: any) {
  const res = await fetch("/api/workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.body) throw new Error("Sin body en la respuesta");
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buf = "";
  let finalOutputs: any = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    for (;;) {
      const sep = buf.indexOf("\n\n");
      if (sep === -1) break;
      const chunk = buf.slice(0, sep);
      buf = buf.slice(sep + 2);

      const lines = chunk.split("\n");
      const dataLine = lines.find(l => l.startsWith("data:"));
      if (!dataLine) continue;

      const raw = dataLine.slice(5).trim();
      if (!raw || raw === "[DONE]") continue;

      try {
        const evt = JSON.parse(raw);
        if (evt?.data?.outputs) finalOutputs = evt.data.outputs;
      } catch {
        // ignora trozos que no sean JSON (p.ej. pings)
      }
    }
  }

  return finalOutputs;
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