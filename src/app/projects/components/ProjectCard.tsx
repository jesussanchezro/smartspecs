import React, { useState } from "react";
import Link from "next/link";
import { Project } from "@/smartspecs/app-lib/interfaces/project";

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

interface ProjectCardProps {
  project: Project;
  onDeleteClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDeleteClick }) => {

  return (
    <>
      <Link key={project.id} href={`/projects/${project.id}`}>
        <div className="bg-background shadow-md rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-border hover:border-primary/50 cursor-pointer group relative">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold text-xl group-hover:text-primary transition-colors duration-300">
              {project.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text/50">#{project.id}</span>
              <button
                onClick={onDeleteClick}
                className={"p-1.5 rounded-md transition-colors text-red-500 hover:bg-red-50"}
                title="Delete project"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text/70" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
            <p className="text-sm text-text/80">{project.client}</p>
          </div>
          
          <p className="text-sm text-text/80 line-clamp-2">{project.description}</p>
          
          <div className="flex justify-between text-xs text-text/60 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  </>
  );
};

export default ProjectCard; 