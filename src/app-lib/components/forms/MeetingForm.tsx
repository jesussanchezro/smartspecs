import React from "react";
import { Meeting } from "@/smartspecs/app-lib/interfaces/meeting";
import { useMeetingForm } from "@/smartspecs/app-lib/hooks/meetings/useMeetingForm";

interface MeetingFormProps {
  onCancel: () => void;
  onSaveSuccess?: () => void;
  onProcessingStart?: () => void;
  onShowRequirementsModal?: (requirements: any[], meetingTitle: string) => void;

  // Si es edición, pasamos la meeting
  meeting?: Meeting;

  // Si es creación, pasamos lo siguiente
  projectId?: string;
  projectTitle?: string;
  projectDescription?: string;
  projectClient?: string;
  requirementsList?: object[];
}

const MeetingForm: React.FC<MeetingFormProps> = ({
  meeting,
  onCancel,
  onSaveSuccess,
  onProcessingStart,
  onShowRequirementsModal,
  projectId,
  projectTitle,
  projectDescription,
  projectClient,
  requirementsList,
}) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    transcription,
    setTranscription,
    firefliesTranscriptId,
    setFirefliesTranscriptId,
    isLoading,
    isLoadingFireflies,
    isDataLoadedFromFireflies,
    handleSubmit,
    handleLoadFromFireflies,
  } = useMeetingForm({
    meeting,
    projectId,
    projectTitle,
    projectDescription,
    projectClient,
    requirementsList,
    onSaveSuccess,
    onCancel,
    onProcessingStart,
    onShowRequirementsModal
  });

  // Para indicar si es edición en la UI
  const isEditMode = !!meeting;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      {/* Campo para Fireflies Transcript ID - Ahora es opcional */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Fireflies Transcript ID (opcional):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            value={firefliesTranscriptId}
            onChange={(e) => setFirefliesTranscriptId(e.target.value)}
            placeholder="Enter Fireflies transcript ID (e.g., transcript_12345...)"
          />
          <button
            type="button"
            onClick={handleLoadFromFireflies}
            disabled={!firefliesTranscriptId || isLoadingFireflies}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i className="fas fa-download"></i>
            {isLoadingFireflies ? "Loading..." : "Load meeting data"}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Puedes cargar automáticamente la información desde Fireflies o llenar los campos manualmente a continuación.
        </p>
        {transcription.includes("[Full transcription requires Fireflies paid plan") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Limited Fireflies Access</p>
                <p className="text-yellow-700 mt-1">
                  Basic meeting data loaded. For full transcript access, upgrade to a Fireflies paid plan or manually add the transcription below.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Separador visual */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Meeting Details</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span>:</label>
        <div className="relative">
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 ${
              isDataLoadedFromFireflies && title ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title"
            required
          />
          {isDataLoadedFromFireflies && title && (
            <div className="absolute right-2 top-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description: 
        </label>
        <textarea
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 ${
            isDataLoadedFromFireflies && description ? 'border-green-300 bg-green-50' : 'border-gray-300'
          }`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Meeting description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Transcription <span className="text-red-500">*</span>:
        </label>
        <div className="relative">
          <textarea
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 ${
              isDataLoadedFromFireflies && transcription ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Full meeting transcription"
            rows={8}
            required
          />
          {isDataLoadedFromFireflies && transcription && (
            <div className="absolute right-2 top-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fas fa-cancel"></i>
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isLoading || isLoadingFireflies || !title || !transcription}
        >
          <i className="fas fa-save"></i>
          {isLoading
            ? isEditMode
              ? "Saving..."
              : "Creating Meeting & Processing with Dify..."
            : isEditMode
            ? "Save Changes"
            : "Create Meeting"}
        </button>
      </div>
    </form>
  );
};

export default MeetingForm;