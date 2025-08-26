import React, { useState, useEffect, useRef } from 'react';
import { Requirement, Status, Priority } from '@/smartspecs/app-lib/interfaces/requirement';

interface RequirementRowProps {
  requirement: Requirement;
  index: number;
  isEditing: boolean;
  tempTitle: string;
  tempDescription: string;
  tempPriority: Priority;
  tempStatus: Status;
  tempResponsible: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: Priority) => void;
  onStatusChange: (value: Status) => void;
  onResponsibleChange: (value: string) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const RequirementRow: React.FC<RequirementRowProps> = ({
  requirement,
  index,
  isEditing,
  tempTitle,
  tempDescription,
  tempPriority,
  tempStatus,
  tempResponsible,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onStatusChange,
  onResponsibleChange,
  onEditClick,
  onDeleteClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  
  // Calculate position on hover/click
  useEffect(() => {
    if (showTooltip && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left - 320, // Position to the left of the icon
        y: rect.top - 20
      });
    }
  }, [showTooltip]);
  
  // Create tooltip directly in body using DOM API for maximum z-index control
  useEffect(() => {
    if (!showTooltip || !requirement.reason) return;
    
    // Create the tooltip element
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'requirement-tooltip';
    tooltipDiv.style.left = `${position.x}px`;
    tooltipDiv.style.top = `${position.y}px`;
    
    // Create title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'font-medium text-gray-900 mb-2';
    titleDiv.innerText = 'Reason:';
    
    // Create content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-gray-700 text-sm max-h-60 overflow-y-auto whitespace-pre-wrap';
    contentDiv.innerText = requirement.reason;
    
    // Append elements
    tooltipDiv.appendChild(titleDiv);
    tooltipDiv.appendChild(contentDiv);
    document.body.appendChild(tooltipDiv);
    
    // Cleanup function
    return () => {
      document.body.removeChild(tooltipDiv);
    };
  }, [showTooltip, requirement.reason, position]);
  
  return (
    <tr className="hover:bg-gray-50 text-sm">
      {/* # */}
      <td className="px-2 py-2 text-center text-gray-500">{index + 1}</td>

      {/* Título */}
      <td className="px-2 py-2">
        {isEditing ? (
          <textarea
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={tempTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            rows={3}
            style={{ minHeight: "60px" }}
          />
        ) : (
          <div className="font-medium text-gray-900">{requirement.title}</div>
        )}
      </td>

      {/* Descripción */}
      <td className="px-2 py-2">
        {isEditing ? (
          <textarea
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={tempDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={5}
            style={{ minHeight: "100px" }}
          />
        ) : (
          <div className="text-gray-500">{requirement.description}</div>
        )}
      </td>

      {/* Prioridad */}
      <td className="px-2 py-2">
        {isEditing ? (
          <select
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={tempPriority}
            onChange={(e) => onPriorityChange(e.target.value as Priority)}
          >
            <option value={Priority.LOW}>Baja</option>
            <option value={Priority.MEDIUM}>Media</option>
            <option value={Priority.HIGH}>Alta</option>
          </select>
        ) : (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${requirement.priority === Priority.HIGH
              ? 'bg-red-100 text-red-800'
              : requirement.priority === Priority.MEDIUM
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
            {requirement.priority === Priority.HIGH
              ? 'High'
              : requirement.priority === Priority.MEDIUM
                ? 'Medium'
                : 'Low'}
          </span>
        )}
      </td>

      {/* Estado */}
      <td className="px-2 py-2">
        {isEditing ? (
          <select
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={tempStatus}
            onChange={(e) => onStatusChange(e.target.value as Status)}
          >
            <option value={Status.IN_PROGRESS}>In Progress</option>
            <option value={Status.DONE}>Done</option>
            <option value={Status.PENDING}>Pending</option>
            <option value={Status.REJECTED}>Rejected</option>
          </select>
        ) : (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${requirement.status === Status.DONE
              ? 'bg-green-100 text-green-800'
              : requirement.status === Status.IN_PROGRESS
                ? 'bg-blue-100 text-blue-800'
                : requirement.status === Status.REJECTED
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
            {requirement.status === Status.DONE
              ? 'Done'
              : requirement.status === Status.IN_PROGRESS
                ? 'In Progress'
                : requirement.status === Status.REJECTED
                ? 'Rejected'
                : 'Pending'}
          </span>
        )}
      </td>

      {/* Responsable */}
      <td className="px-2 py-2 text-gray-700">
        {isEditing ? (
          <input
            type="text"
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={tempResponsible}
            onChange={(e) => onResponsibleChange(e.target.value)}
            placeholder="Assign responsible"
          />
        ) : (
          requirement.responsible || <span className="italic text-gray-400">No assigned</span>
        )}
      </td>

      {/* Origen */}
      <td className="px-2 py-2 text-gray-700">
        {requirement.origin ? (
          <div className="flex items-center space-x-2">
            <i className={`text-lg ${
              requirement.origin === 'Dify' 
                ? 'fas fa-robot text-green-600' 
                : 'fas fa-user text-blue-600'
            }`}></i>
            <span className="capitalize">{requirement.origin}</span>
          </div>
        ) : (
          <span className="italic text-gray-400">Not registered</span>
        )}
      </td>

      {/* Razón */}
      <td className="px-2 py-2 text-gray-700">
        {requirement.reason ? (
          <div 
            ref={iconRef}
            className="cursor-pointer text-blue-500"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <i className="fas fa-info-circle h-5 w-5"></i>
          </div>
        ) : (
          <span className="italic text-gray-400">No reason</span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-2 py-2">
        <div className="flex items-center space-x-1">
          <button
            className={`px-2 py-1 rounded-md text-sm font-medium ${isEditing ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              } transition-all`}
            onClick={onEditClick}
          >
            {isEditing ? <i className="fas fa-save"></i> : <i className="fas fa-edit"></i>}
          </button>
          <button
            className="px-2 py-1 bg-red-400 hover:bg-red-500 text-white rounded-md text-sm font-medium transition-all"
            onClick={onDeleteClick}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default RequirementRow;