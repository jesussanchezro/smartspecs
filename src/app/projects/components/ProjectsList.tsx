import React from 'react';
import ProjectCard from "@/smartspecs/app/projects/components/ProjectCard";
import { Project } from '@/smartspecs/app-lib/interfaces/project';
import ConfirmModal from "@/smartspecs/app-lib/components/modals/ConfirmModal";
import { useProjectActions } from "@/smartspecs/app-lib/hooks/projects/useProjectActions";

interface ProjectsListProps {
  projects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects }) => {
  const { showDeleteModal, setShowDeleteModal, confirmDelete, handleDeleteProject } = useProjectActions();

  return (
    <div className="w-full max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <div key={project.id} className="transform transition-all duration-300 hover:-translate-y-1">
            <ProjectCard 
              project={project} 
              onDeleteClick={() => handleDeleteProject(project.id)}
            />
          </div>
        ))}
      </div>
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete the project? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
      />
    </div>
  );
};

export default ProjectsList; 