import React, { useState, useEffect } from "react";
import { Requirement } from "@/smartspecs/app-lib/interfaces/requirement";

interface RequirementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle: string;
  requirements: Requirement[];
  onSend: (selectedRequirements: Requirement[]) => void;
}

const RequirementSelectionModal: React.FC<RequirementSelectionModalProps> = ({
  isOpen,
  onClose,
  meetingTitle,
  requirements,
  onSend,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectAll(false);
    }
  }, [isOpen]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = requirements.map(req => req.id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleRequirementToggle = (requirementId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(requirementId)) {
        const newSelected = prev.filter(id => id !== requirementId);
        setSelectAll(newSelected.length === requirements.length);
        return newSelected;
      } else {
        const newSelected = [...prev, requirementId];
        setSelectAll(newSelected.length === requirements.length);
        return newSelected;
      }
    });
  };

  const handleSend = () => {
    const selectedRequirements = requirements.filter(req => selectedIds.includes(req.id));
    onSend(selectedRequirements);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{meetingTitle}</h2>
            <p className="text-sm text-gray-600">Send Requirements</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-700">Select All</span>
          </label>
        </div>

        <div className="overflow-y-auto max-h-96 space-y-3">
          {requirements.map((requirement) => (
            <div
              key={requirement.id}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleRequirementToggle(requirement.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(requirement.id)}
                onChange={(e) => {
                  e.stopPropagation(); // Evitar que se ejecute el onClick del div padre
                  handleRequirementToggle(requirement.id);
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{requirement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                <div className="flex space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {requirement.priority}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {requirement.status}---
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send Selected ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementSelectionModal;
