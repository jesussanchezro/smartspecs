import React, { useState, useEffect } from "react";
import { Requirement, Status } from "@/smartspecs/app-lib/interfaces/requirement";

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
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSelectAll(false);
      setActiveTab('pending');
    }
  }, [isOpen]);

  // Filtrar requerimientos por estado
  const pendingRequirements = requirements.filter(req => req.status === Status.PENDING);
  const approvedRequirements = requirements.filter(req => req.status === Status.DONE);
  const rejectedRequirements = requirements.filter(req => req.status === Status.REJECTED);

  // Obtener requerimientos del tab activo
  const getActiveRequirements = () => {
    switch (activeTab) {
      case 'pending': return pendingRequirements;
      case 'approved': return approvedRequirements;
      case 'rejected': return rejectedRequirements;
      default: return pendingRequirements;
    }
  };

  const activeRequirements = getActiveRequirements();

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = activeRequirements.map(req => req.id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  };

  const handleRequirementToggle = (requirementId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(requirementId)) {
        const newSelected = prev.filter(id => id !== requirementId);
        setSelectAll(newSelected.length === activeRequirements.length);
        return newSelected;
      } else {
        const newSelected = [...prev, requirementId];
        setSelectAll(newSelected.length === activeRequirements.length);
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

        {/* Pestañas */}
        <div className="flex space-x-1 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending ({pendingRequirements.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'approved'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Approved ({approvedRequirements.length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'rejected'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Rejected ({rejectedRequirements.length})
          </button>
        </div>

        {/* Select All solo si hay requerimientos */}
        {activeRequirements.length > 0 && (
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
        )}

        {/* Lista de requerimientos */}
        <div className="overflow-y-auto max-h-96 space-y-3">
          {activeRequirements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {activeTab} requirements found.</p>
            </div>
          ) : (
            activeRequirements.map((requirement) => (
              <div
                key={requirement.id}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRequirementToggle(requirement.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(requirement.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleRequirementToggle(requirement.id);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{requirement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                  <div className="flex space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      requirement.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : requirement.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {requirement.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
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
