import React, { useState, useEffect } from "react";
import { Requirement, Status, RequirementAction } from "@/smartspecs/app-lib/interfaces/requirement";
import { useAppDispatch } from "@/smartspecs/app-lib/hooks/useAppDispatch";
import { updateRequirement } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";
import RequirementTags from "@/smartspecs/app-lib/components/lists/requirements-list/RequirementTags";

interface RequirementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingTitle: string;
  requirements: Requirement[];
  onSend: (selectedRequirements: Requirement[], hasRequirementsToRefine: boolean) => void;
}

const RequirementSelectionModal: React.FC<RequirementSelectionModalProps> = ({
  isOpen,
  onClose,
  meetingTitle,
  requirements,
  onSend,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [requirementActions, setRequirementActions] = useState<Record<string, RequirementAction>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab('pending');
      // Initialize all requirements with 'approve' as default action
      const defaultActions: Record<string, RequirementAction> = {};
      requirements.forEach(req => {
        // avoid to approve rejected previous requirements
        if (req.status === Status.PENDING) {
          defaultActions[req.id] = 'approve';
        }
      });
      setRequirementActions(defaultActions);
    }
  }, [isOpen, requirements]);

  const pendingRequirements = requirements.filter(req => req.status === Status.PENDING);
  const approvedRequirements = requirements.filter(req => req.status === Status.TO_DO);
  const rejectedRequirements = requirements.filter(req => req.status === Status.REJECTED);

  const getActiveRequirements = () => {
    switch (activeTab) {
      case 'pending': return pendingRequirements;
      case 'approved': return approvedRequirements;
      case 'rejected': return rejectedRequirements;
      default: return pendingRequirements;
    }
  };

  const activeRequirements = getActiveRequirements();

  const handleActionChange = (requirementId: string, action: RequirementAction) => {
    setRequirementActions(prev => ({
      ...prev,
      [requirementId]: action
    }));
  };

  const handleSend = async () => {
    try {
      setIsProcessing(true);      
      
      // get requirements marked with "reject" or "refine" to mark as rejected to firebase
      const unselectedRequirements = requirements
        .filter(requirement =>
              requirement.status === Status.PENDING
              && requirementActions[requirement.id] === 'reject' 
              || requirementActions[requirement.id] === 'refine'
        );

      for (const requirement of unselectedRequirements) {
        await dispatch(updateRequirement({
          id: requirement.id,
          updatedData: { 
            status: Status.REJECTED,
            origin: 'human'
          }
        }));
      }
      
      const selectedRequirements = requirements
        .filter(requirement => requirementActions[requirement.id] === 'approve');

      for (const requirement of selectedRequirements) {
        await dispatch(updateRequirement({
          id: requirement.id,
          updatedData: { 
            status: Status.TO_DO,
            origin: 'human'
          }
        }));
      }

      // get requirements marked with "refine" to send once again to Dify
      const requirementsToRefine = requirements
        .filter(requirement => requirementActions[requirement.id] === 'refine')
      
      // only send to dify the requirements to refine
      const hasRequirementsToRefine = requirementsToRefine.length > 0;
      onSend(requirementsToRefine, hasRequirementsToRefine); 
      
      onClose();
    } catch (error) {
      console.error({error});
    } finally {
      setIsProcessing(false);
    }
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

        <div className="overflow-y-auto max-h-96 space-y-3">
          {activeRequirements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {activeTab} requirements found.</p>
            </div>
          ) : (
            activeRequirements.map((requirement) => (
              <div
                key={requirement.id}
                className={`space-x-3 p-2 border border-gray-200 rounded-lg transition-colors ${
                  activeTab === 'pending' 
                    ? 'hover:bg-gray-50' 
                    : ''
                }`}
              >
                {activeTab !== 'pending' && (
                  <div className="w-4"></div>
                )}
                <div className="flex items-start space-x-2 p-2">
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        requirement.status === Status.DONE 
                          ? 'bg-green-100 text-green-800' 
                          : requirement.status === Status.REJECTED
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {requirement.status}
                      </span>
                    </div>
                  </div>
                  { activeTab === 'pending' &&
                    <div className="flex-shrink-0">
                      <select
                        value={requirementActions[requirement.id] || 'approve'}
                        onChange={(e) => handleActionChange(requirement.id, e.target.value as RequirementAction)}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1.5 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                          requirementActions[requirement.id] === 'approve'
                            ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-500'
                            : requirementActions[requirement.id] === 'reject'
                            ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-500'
                            : requirementActions[requirement.id] === 'refine'
                            ? 'border-blue-300 bg-blue-50 text-blue-700 focus:ring-blue-500'
                            : 'border-green-300 bg-green-50 text-green-700 focus:ring-green-500'
                        }`}
                      >
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="refine">Refine</option>
                      </select>
                    </div>
                  }
                </div>
                <div className="mt-2">
                  <RequirementTags
                    tags={requirement.tags || []}
                    isEditing={false}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-cancel"></i>
            Cancel
          </button>
          {activeTab === 'pending' && (
            <button
              onClick={handleSend}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <i className="fas fa-save"></i>
              {isProcessing ? "Processing..." : `Save Requirements`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementSelectionModal;
