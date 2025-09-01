import React from "react";
import { Priority, Status, Requirement } from "@/smartspecs/app-lib/interfaces/requirement";
import { Timestamp } from "firebase/firestore";
import { useAppDispatch } from "@/smartspecs/app-lib/hooks/useAppDispatch";
import { createRequirement, updateRequirement as updateRequirementAction } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";

interface RequirementFormProps {
  onCancel: () => void;
  onSaveSuccess?: () => void;
  onProcessingStart?: () => void;
  projectId: string;
  requirement?: Requirement;
}

const RequirementForm: React.FC<RequirementFormProps> = ({
  onCancel,
  onSaveSuccess,
  onProcessingStart,
  projectId,
  requirement,
}) => {
  const [title, setTitle] = React.useState(requirement?.title || "");
  const [description, setDescription] = React.useState(requirement?.description || "");
  const [priority, setPriority] = React.useState<Priority>(requirement?.priority || Priority.MEDIUM);
  const [status, setStatus] = React.useState<Status>(requirement?.status || Status.PENDING);
  const [responsible, setResponsible] = React.useState(requirement?.responsible || "");
  const [reason, setReason] = React.useState(requirement?.reason || "");
  const [origin, setOrigin] = React.useState(requirement?.origin || "");
  const [historyReason, setHistoryReason] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const dispatch = useAppDispatch();

  // Para indicar si es edición en la UI
  const isEditMode = !!requirement;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onProcessingStart?.();

    try {
      if (isEditMode && requirement) {
        // Update existing requirement
        const updatedRequirement: Requirement = {
          ...requirement,
          title,
          description,
          priority,
          status,
          responsible,
          origin,
        };
        
        await dispatch(updateRequirementAction({ 
          id: requirement.id, 
          updatedData: updatedRequirement,
          historyReason: historyReason || "Updated requirement"
        }));
      } else {
        // Create new requirement
        const now = new Date().toISOString();
        console.log({
          projectId,
          title,
          description,
          priority,
          status,
          responsible,
          reason,
          origin: origin || "Manual",
          createdAt: now,
          updatedAt: now
        })
        await dispatch(createRequirement({
          projectId,
          title,
          description,
          priority,
          status,
          responsible,
          reason,
          origin: origin || "Manual",
          createdAt: now,
          updatedAt: now
        }));
      }
      
      onSaveSuccess?.();
    } catch (error) {
      console.error("Error saving requirement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Title:</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Requirement title"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description: 
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the requirement"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Priority:</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Status:</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option value={Status.PENDING}>Pending</option>
            <option value={Status.IN_PROGRESS}>In Progress</option>
            <option value={Status.DONE}>Done</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Responsible Person:
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
          value={responsible}
          onChange={(e) => setResponsible(e.target.value)}
          placeholder="Person responsible for this requirement"
        />
      </div>

      {!isEditMode && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Reason:
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for this requirement"
            rows={2}
          />
        </div>
      )}

      {isEditMode && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Reason for this update:
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            value={historyReason}
            onChange={(e) => setHistoryReason(e.target.value)}
            placeholder="Reason for updating this requirement"
            rows={2}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Origin:
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Origin of this requirement (e.g., Meeting, Customer request)"
        />
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
          disabled={isLoading}
        >
          <i className="fas fa-save"></i>
          {isLoading
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
            ? "Save"
            : "Create"}
        </button>
      </div>
    </form>
  );
};

export default RequirementForm;
