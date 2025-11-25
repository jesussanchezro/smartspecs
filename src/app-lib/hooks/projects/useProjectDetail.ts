// src/app-lib/hooks/projects/useProjectDetailUI.ts

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { deleteAllMeetingsByProject } from "@/smartspecs/app-lib/redux/slices/MeetingsSlice";
import { Project } from "@/smartspecs/app-lib/interfaces/project";
import { toast } from "react-toastify";

/**
 * Maneja estados de interfaz en la vista de "detalle de proyecto":
 * - isEditing
 * - mostrar o no la modal de reuniones
 * - mensajes de éxito al crear/actualizar
 * - lógica de "eliminar todas las reuniones"
 */
export const useProjectDetail = (project?: Project) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [isEditing, setIsEditing] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [isDeletingMeetings, setIsDeletingMeetings] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Ejemplo: si quisieras eliminar todo el proyecto desde acá, podrías
  // meterlo en un "useProjectActions.ts" con removeProject() y llamarlo aquí.

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateSuccessMsg("");
    setDeleteSuccessMsg("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateSuccessMsg("");
    setDeleteSuccessMsg("");
  };

  const handleSaveSuccess = (message: string) => {
    setIsEditing(false);
    setUpdateSuccessMsg(message);
  };

  const handleDeleteMeetingsClick = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleCancelDeleteMeetings = () => {
    setShowDeleteConfirmModal(false);
  };

  const handleConfirmDeleteMeetings = async () => {
    if (!project?.id) return;
    
    setShowDeleteConfirmModal(false);
    setIsDeletingMeetings(true);
    
    try {
      const resultAction = await dispatch(deleteAllMeetingsByProject(project.id));

      if (deleteAllMeetingsByProject.fulfilled.match(resultAction)) {
        toast.success("All meetings have been deleted successfully");
      } else {
        throw new Error("Error deleting meetings");
      }
    } catch (error) {
      console.error("❌ Error deleting meetings:", error);
      toast.error("Error deleting meetings");
    } finally {
      setIsDeletingMeetings(false);
    }
  };

  return {
    isEditing,
    deleteSuccessMsg,
    updateSuccessMsg,
    showMeetingModal,
    setShowMeetingModal,
    isDeletingMeetings,
    showDeleteConfirmModal,
    handleEdit,
    handleCancelEdit,
    handleSaveSuccess,
    handleDeleteMeetingsClick,
    handleCancelDeleteMeetings,
    handleConfirmDeleteMeetings,
  };
};