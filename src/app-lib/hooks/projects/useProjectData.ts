// src/app-lib/hooks/projects/useProjectData.ts

import { useEffect } from "react";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { AppDispatch, RootState } from "@/smartspecs/app-lib/redux/store";
import { usePathname } from "next/navigation";

// Acciones de Redux
import { getProject } from "@/smartspecs/app-lib/redux/slices/ProjectsSlice";
import { getMeetingsByProject } from "@/smartspecs/app-lib/redux/slices/MeetingsSlice";
import { getApprovedRequirementsByProject } from "@/smartspecs/app-lib/redux/slices/RequirementsSlice";

import { Project } from "@/smartspecs/app-lib/interfaces/project";

const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useProjectData = () => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const id = pathname ? pathname.split("/").pop() : null;

    // Estados en Redux para projects, meetings y requirements
    const { projects, loading, error } = useAppSelector((state) => state.projects);
    const {
        meetings,
        loading: meetingsLoading,
        error: meetingsError,
    } = useAppSelector((state) => state.meetings);
    const {
        requirements,
        loading: requirementsLoading,
        error: requirementsError,
    } = useAppSelector((state) => state.requirements);

    // Obtenemos del store el proyecto que coincida con 'id'
    const project = projects.find((p: Project) => p.id === id);

    // Al montar o cambiar el id, cargamos los datos
    useEffect(() => {
        if (id) {
            dispatch(getProject(id));
            dispatch(getMeetingsByProject(id));
            dispatch(getApprovedRequirementsByProject(id));
        }
    }, [id, dispatch]);

    // Si querés refrescar requerimientos cuando cambian las reuniones
    useEffect(() => {
        if (id) {
            dispatch(getApprovedRequirementsByProject(id));
        }
    }, [meetings, id, dispatch]);

    // Podrías crear un "loading" global combinando
    const combinedLoading = loading || meetingsLoading || requirementsLoading;

    return {
        project,
        projectMeetings: meetings.filter((m) => m.projectId === id),
        requirements,
        loading: combinedLoading,
        error,
        meetingsError,
        requirementsError,
    };
};