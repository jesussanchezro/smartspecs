// src/app-lib/hooks/meetings/useMeetingForm.ts

import { useState, useEffect } from "react";
import { useDispatch, useStore } from "react-redux"; // 👈 Importamos useStore también
import { AppDispatch, RootState } from "@/smartspecs/app-lib/redux/store";
import {
  createMeeting,
  updateMeeting,
  getMeetingsByProject,
} from "@/smartspecs/app-lib/redux/slices/MeetingsSlice";
import { Meeting } from "@/smartspecs/app-lib/interfaces/meeting";
import { processDifyWorkflow } from "@/smartspecs/app-lib/utils/difyProcessor";
import { Requirement } from "@/smartspecs/app-lib/interfaces/requirement";
import { toast } from "react-toastify";

interface UseMeetingFormProps {
  meeting?: Meeting;
  projectId?: string;
  projectTitle?: string;
  projectDescription?: string;
  projectClient?: string;
  requirementsList?: object[];
  onSaveSuccess?: () => void;
  onCancel: () => void;
  onProcessingStart?: () => void; // Nueva función para notificar cuando comienza el procesamiento
  onShowRequirementsModal?: (
    requirements: any[], 
    meetingTitle: string,
    meetingId: string,
    meetingDescription: string,
    meetingTranscription: string
  ) => void;
}

export const useMeetingForm = ({
  meeting,
  projectId,
  projectTitle,
  projectDescription,
  projectClient,
  requirementsList,
  onSaveSuccess,
  onCancel,
  onProcessingStart,
  onShowRequirementsModal,
}: UseMeetingFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>(); // 👈 Creamos store

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transcription, setTranscription] = useState("");
  const [firefliesTranscriptId, setFirefliesTranscriptId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingFireflies, setIsLoadingFireflies] = useState(false);
  const [isDataLoadedFromFireflies, setIsDataLoadedFromFireflies] = useState(false);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title || "");
      setDescription(meeting.description || "");
      setTranscription(meeting.transcription || "");
    }
  }, [meeting]);

  // Función para cargar datos desde Fireflies
  const handleLoadFromFireflies = async () => {
    if (!firefliesTranscriptId.trim()) {
      toast.error("Please enter a Fireflies transcript ID");
      return;
    }

    setIsLoadingFireflies(true);
    try {
      toast.info("🔄 Loading meeting info...");
      
      const response = await fetch(`/api/fireflies/transcripts?id=${firefliesTranscriptId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Transcript not found. Please check the ID and try again.");
        } else if (response.status === 401) {
          throw new Error("Invalid API key. Please check your Fireflies API configuration.");
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Verificar si hay datos de transcript disponibles, incluso con errores de plan
      const transcript = data.data?.transcript;
      if (!transcript) {
        throw new Error("Transcript data not found in response");
      }


      // Extraer información básica disponible
      const meetingTitle = transcript.title || "Meeting";
      const meetingDate = transcript.dateString || transcript.date;
      const participants = transcript.participants || [];
      const sentences = transcript.sentences || [];
      
      // Construir la transcripción a partir de las sentences (si están disponibles)
      let fullTranscription = "";
      if (sentences && sentences.length > 0) {
        fullTranscription = sentences
          .map((sentence: any) => `${sentence.speaker_name || 'Speaker'}: ${sentence.text || ''}`)
          .join('\n');
      } else {
        // Si no hay sentences disponibles debido al plan, crear un placeholder
        fullTranscription = `Meeting: ${meetingTitle}\nDate: ${meetingDate}\nParticipants: ${participants.join(', ')}\n\n[Full transcription requires Fireflies paid plan - Please add manual transcription or upgrade your Fireflies plan]`;
      }

      // Construir descripción con información adicional
      const descriptionParts = [];
      if (meetingDate) {
        const dateStr = typeof meetingDate === 'number' 
          ? new Date(meetingDate).toLocaleString() 
          : meetingDate;
        descriptionParts.push(`Date: ${dateStr}`);
      }
      if (participants.length > 0) descriptionParts.push(`Participants: ${participants.join(', ')}`);
      if (transcript.duration) descriptionParts.push(`Duration: ${Math.round(transcript.duration / 60)} minutes`);
      if (transcript.host_email) descriptionParts.push(`Host: ${transcript.host_email}`);
      
      const meetingDescription = descriptionParts.join('\n');

      // Actualizar los campos del formulario
      setTitle(meetingTitle);
      setDescription(meetingDescription);
      setTranscription(fullTranscription);

      setIsDataLoadedFromFireflies(true);
      

      toast.success("Meeting data loaded successfully!");
      
      
    } catch (error) {
      toast.error("❌ Error loading from Fireflies: " + (error instanceof Error ? error.message : 'Unknown error occurred'));
    } finally {
      setIsLoadingFireflies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (meeting) {
        // === Edición de reunión ===
        const updatedData = { title, description, transcription };
        const updateAction = await dispatch(
          updateMeeting({ id: meeting.id, updatedData })
        );

        if (updateAction.meta.requestStatus === "fulfilled") {
          onSaveSuccess?.();
          onCancel();
        } else {
          toast.error("Error actualizando la reunión");
        }
      } else {
        // === Creación de reunión ===
        if (!projectId) {
          toast.error("No hay projectId para crear reunión");
          setIsLoading(false);
          return;
        }

        // Validar campos obligatorios
        if (!title.trim()) {
          toast.error("Please enter a meeting title");
          setIsLoading(false);
          return;
        }

        if (!transcription.trim()) {
          toast.error("Please enter the meeting transcription");
          setIsLoading(false);
          return;
        }

        const createResult = await dispatch(
          createMeeting({
            projectId,
            title,
            description,
            transcription,
          })
        );

        if (createResult.meta.requestStatus === "fulfilled") {
          const createdMeeting = createResult.payload as Meeting;
          
          // Notificar que empieza el procesamiento y cerrar modal
          setIsProcessing(true);
          if (onProcessingStart) {
            onProcessingStart();
          }

          // ⚡ Llamar al workflow de Dify
          await processDifyWorkflow({
            dispatch,
            //getState: store.getState, // 👈 pass getState
            projectId,
            meetingId: createdMeeting.id,
            projectTitle: projectTitle || "",
            projectDescription: projectDescription || "",
            projectClient: projectClient || "",
            meetingTitle: title,
            meetingDescription: description,
            meetingTranscription: transcription,
            requirementsList: requirementsList as Requirement[],
            onShowModal: onShowRequirementsModal ? 
              (requirements: any[], meetingTitle: string) => 
                onShowRequirementsModal(requirements, meetingTitle, createdMeeting.id, description, transcription)
              : undefined,
            status: "new"
          });

          // Refrescamos lista
          await dispatch(getMeetingsByProject(projectId));

          // Reseteamos formulario
          setTitle("");
          setDescription("");
          setTranscription("");
          setFirefliesTranscriptId("");

          onSaveSuccess?.();
          onCancel();
        } else {
          toast.error("Error creando la reunión");
        }
      }
    } catch (err) {
      toast.error("Error en handleSubmit: " + err);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    transcription,
    setTranscription,
    firefliesTranscriptId,
    setFirefliesTranscriptId,
    isLoading,
    isProcessing,
    isLoadingFireflies,
    isDataLoadedFromFireflies,
    handleSubmit,
    handleLoadFromFireflies,
  };
};