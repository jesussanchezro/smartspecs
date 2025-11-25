"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app-lib/redux/store";
import { Project as DomainProject } from "@/smartspecs/lib/domain";
import { Project as ReduxProject } from "@/smartspecs/app-lib/interfaces/project";
import { ProjectAdapter } from "@/smartspecs/lib/adapters/ProjectAdapter";

interface ProjectsState {
  projects: ReduxProject[];
  selectedProject: ReduxProject | null;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<ReduxProject[]>) => {
      state.projects = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<ReduxProject | null>) => {
      state.selectedProject = action.payload;
    },
  },
});

export const { setProjects, setSelectedProject } = projectsSlice.actions;

export const selectProjects = (state: RootState) => state.projects.projects;
export const selectSelectedProject = (state: RootState) =>
  state.projects.selectedProject;

export const useProjects = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const selectedProject = useSelector(selectSelectedProject);

  const updateProjects = (projects: DomainProject[]) => {
    dispatch(setProjects(projects.map(ProjectAdapter.toRedux)));
  };

  const updateSelectedProject = (project: DomainProject | null) => {
    dispatch(setSelectedProject(project ? ProjectAdapter.toRedux(project) : null));
  };

  return {
    projects: projects.map(ProjectAdapter.toDomain),
    selectedProject: selectedProject ? ProjectAdapter.toDomain(selectedProject) : null,
    updateProjects,
    updateSelectedProject,
  };
};

export default projectsSlice.reducer;
