"use client";

import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/smartspecs/app-lib/components/modals/Modal";
import { useProjects } from "../../app-lib/hooks/projects/useProjects";
import ProjectsHeader from "./components/ProjectsHeader";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import ProjectsList from "./components/ProjectsList";
import { LoadingSpinner, Pagination } from "@/smartspecs/app-lib/components/common";
import ProjectForm from "@/smartspecs/app-lib/components/forms/ProjectForm";
import { useSelector } from "react-redux";
import { RootState } from "@/smartspecs/app-lib/redux/store";
import RequireAuth from "@/smartspecs/app-lib/components/auth/RequireAuth";

const ProjectsView: React.FC = () => {
  const { projects, loading, error } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentUser } = useSelector((state: RootState) => state.users);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const itemsPerPage = 12;

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return projects.slice(startIndex, endIndex);
  }, [projects, currentPage, itemsPerPage]);

  // Solo verificar si los datos están cargados
  useEffect(() => {
    if (!loading || error) {
      setIsPageLoading(false);
    }
  }, [loading, error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);


  return (
    <div className="min-h-screen flex flex-col items-center gap-6 bg-background text-text">
      <ProjectsHeader onAddProject={() => setIsModalOpen(true)} />

      {error && <ErrorState error={error} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProjectForm
          onCancel={() => setIsModalOpen(false)}
          onSaveSuccess={() => setIsModalOpen(false)}
        />
      </Modal>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ProjectsList projects={paginatedProjects} />
          <Pagination
            currentPage={currentPage}
            totalItems={projects.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            maxVisiblePages={5}
          />
        </>
      )}
    </div>
  );
};

export default function ProjectsPage() {
  return (
    <RequireAuth>
      <ProjectsView />
    </RequireAuth>
  );
}