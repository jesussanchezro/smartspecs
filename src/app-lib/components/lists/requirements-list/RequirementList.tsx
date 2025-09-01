import React from "react";
import RequirementRow from "./RequirementRow";
import RequirementHistory from "./RequirementHistory";
import ConfirmModal from "../../modals/ConfirmModal";
import { Requirement, Priority } from "@/smartspecs/app-lib/interfaces/requirement";
import { useRequirementList } from "@/smartspecs/app-lib/hooks/requirements/useRequirementList";
import { useRequirementHistory } from "@/smartspecs/app-lib/hooks/requirements/useRequirementsHistory";

interface RequirementListProps {
  requirements: Requirement[];
}

const RequirementList: React.FC<RequirementListProps> = ({ requirements }) => {
  const {
    editingId,
    tempTitle,
    tempDescription,
    tempPriority,
    tempStatus,
    tempResponsible,
    showDeleteModal,
    setTempTitle,
    setTempDescription,
    setTempPriority,
    setTempStatus,
    setTempResponsible,
    handleEditClick,
    handleCancelEdit,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
  } = useRequirementList();

  const {
    expandedId,
    histories,
    toggleExpand,
  } = useRequirementHistory();

  const sortedRequirements = [...requirements].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (requirements.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 ease-in-out">
        <p className="text-gray-500 text-lg font-medium">No requirements registered for this project</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-50">
          <tr>
            <th className="w-12 px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase">#</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Responsible</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Origin</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
            <th className="px-2 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedRequirements.map((requirement, index) => (
            <React.Fragment key={requirement.id}>
              <RequirementRow
                requirement={requirement}
                index={index}
                isEditing={editingId === requirement.id}
                tempTitle={tempTitle}
                tempDescription={tempDescription}
                tempPriority={tempPriority}
                tempStatus={tempStatus}
                tempResponsible={tempResponsible}
                onTitleChange={setTempTitle}
                onDescriptionChange={setTempDescription}
                onPriorityChange={setTempPriority as (value: Priority) => void}
                onStatusChange={setTempStatus}
                onResponsibleChange={setTempResponsible}
                onEditClick={() => handleEditClick(requirement)}
                onCancelEdit={handleCancelEdit}
                onDeleteClick={() => handleDeleteClick(requirement.id)}
              />

              {/* Botón Ver Historial */}
              <tr className="bg-gray-50/50">
                <td colSpan={9} className="px-4 py-2 text-right">
                  <button
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                    onClick={() => toggleExpand(requirement.id)}
                  >
                    {expandedId === requirement.id ? (
                      <>
                        <span>Hide history</span>
                        <svg className="w-4 h-4 ml-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Show history</span>
                        <svg className="w-4 h-4 ml-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </td>
              </tr>

              {expandedId === requirement.id && (
                <tr className="bg-white">
                  <td colSpan={9} className="px-4 pb-4">
                    <div className="mt-2 bg-gray-50/50 rounded-lg p-4 transition-all duration-300 ease-in-out">
                      <RequirementHistory histories={histories[requirement.id] || []} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal Confirmación de Eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirm delete"
        message="Are you sure you want to delete this requirement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
      />
    </div>
  );
};

export default RequirementList;