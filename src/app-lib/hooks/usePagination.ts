import { useMemo } from 'react';

interface UsePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  maxVisiblePages?: number;
}

interface PaginationInfo {
  totalPages: number;
  visiblePages: number[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startItem: number;
  endItem: number;
  totalItems: number;
}

export const usePagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  maxVisiblePages = 5
}: UsePaginationProps): PaginationInfo => {
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Calcular el rango de páginas visibles
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Generar array de páginas visibles
    const visiblePages = [];
    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }
    
    return {
      totalPages,
      visiblePages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      startItem: (currentPage - 1) * itemsPerPage + 1,
      endItem: Math.min(currentPage * itemsPerPage, totalItems),
      totalItems
    };
  }, [currentPage, totalItems, itemsPerPage, maxVisiblePages]);
  
  return paginationInfo;
};
