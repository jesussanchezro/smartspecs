import { useState } from 'react';
import { deleteRequirement, updateRequirement } from '@/smartspecs/app-lib/redux/slices/RequirementsSlice';
import { useAppDispatch } from '@/smartspecs/app-lib/hooks/useAppDispatch';
import { Requirement, Status, Priority } from '@/smartspecs/app-lib/interfaces/requirement';
import { firestore } from '@/smartspecs/lib/config/firebase-settings';
import { doc, getDoc, collection, Timestamp, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '@/smartspecs/app-lib/redux/store';

export const useRequirementList = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempPriority, setTempPriority] = useState<Priority>(Priority.MEDIUM);
  const [tempStatus, setTempStatus] = useState<Status>(Status.IN_PROGRESS);
  const [tempResponsible, setTempResponsible] = useState("");
  const [tempTags, setTempTags] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useAppDispatch();
  const { currentUser } = useSelector((state: RootState) => state.users);

  const handleEditClick = async (req: Requirement) => {
    if (editingId === req.id) {
      // Actualizar el requerimiento sin modificar el reason
      dispatch(
        updateRequirement({
          id: req.id,
          updatedData: {
            title: tempTitle,
            description: tempDescription,
            priority: tempPriority as Priority,
            status: tempStatus,
            responsible: tempResponsible,
            tags: tempTags,
            origin: "Manual",
            // No incluimos reason aquí para mantener el original
            updatedAt: new Date().toISOString(),
          },
          historyReason: "Manual edit" // Pasamos el reason para el historial
        })
      );
      
      setEditingId(null);
    } else {
      setEditingId(req.id);
      setTempTitle(req.title);
      setTempDescription(req.description);
      setTempPriority(req.priority);
      setTempStatus(req.status);
      setTempResponsible(req.responsible || "");
      setTempTags(req.tags || []);
    }
  };

  const handleDeleteClick = (reqId: string) => {
    setDeleteId(reqId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    dispatch(deleteRequirement(deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTempTitle("");
    setTempDescription("");
    setTempPriority(Priority.MEDIUM);
    setTempStatus(Status.IN_PROGRESS);
    setTempResponsible("");
    setTempTags([]);
  };

  return {
    editingId,
    tempTitle,
    tempDescription,
    tempPriority,
    tempStatus,
    tempResponsible,
    tempTags,
    showDeleteModal,
    setTempTitle,
    setTempDescription,
    setTempPriority,
    setTempStatus,
    setTempResponsible,
    setTempTags,
    handleEditClick,
    handleCancelEdit,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
  };
}; 