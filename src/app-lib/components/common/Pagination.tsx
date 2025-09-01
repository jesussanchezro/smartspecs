import React from 'react';
import { usePagination } from '../../hooks/usePagination';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 5
}) => {
  const {
    totalPages,
    visiblePages,
    hasPreviousPage,
    hasNextPage,
    startItem,
    endItem
  } = usePagination({
    currentPage,
    totalItems,
    itemsPerPage,
    maxVisiblePages
  });

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const showFirstPage = visiblePages[0] > 1;
  const showLastPage = visiblePages[visiblePages.length - 1] < totalPages;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            hasPreviousPage
              ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              : 'text-gray-300 bg-white border border-gray-200 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        {showFirstPage && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700"
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="px-2 py-2 text-sm text-gray-500">...</span>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {page}
          </button>
        ))}

        {showLastPage && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 py-2 text-sm text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            hasNextPage
              ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              : 'text-gray-300 bg-white border border-gray-200 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};
