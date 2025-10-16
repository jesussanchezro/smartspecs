// src/app-lib/hooks/projects/useProjectActions.ts

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { deleteProject } from "@/smartspecs/app-lib/redux/slices/ProjectsSlice";
import { useState } from "react";

const useAppDispatch = () => useDispatch<AppDispatch>();

export const useProjectActions = () => {
    const dispatch = useAppDispatch();
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteProject = async (projectId: string) => {
        setDeletingProjectId(projectId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deletingProjectId) return;
        dispatch(deleteProject(deletingProjectId))
        setShowDeleteModal(false);
        setDeletingProjectId(null);
    };

    return {
        handleDeleteProject,
        confirmDelete,
        showDeleteModal,
        setShowDeleteModal,
    };
};