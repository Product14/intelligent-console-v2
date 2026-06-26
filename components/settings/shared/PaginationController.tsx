import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationControllerProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (pageNumber: number) => void;
}

export const PaginationController: React.FC<PaginationControllerProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
}) => {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={() => handlePageChange(1)}
        disabled={isFirstPage}
        type="button"
        aria-label="First page"
        className={`flex items-center justify-center gap-0 rounded-md border border-gray-300 p-2 ${isFirstPage ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
      >
        <FaChevronLeft className="h-4 w-4" />
        <FaChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={isFirstPage}
        type="button"
        aria-label="Previous page"
        className={`p-2 ${isFirstPage ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
      >
        <FaChevronLeft className="h-4 w-4" />
      </button>

      {[...Array(totalPages)].map((_, index) => {
        const pageNumber = index + 1;
        if (
          pageNumber <= 3 ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        ) {
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              className={`flex h-6 w-6 items-center justify-center rounded-[24px] p-2 ${
                currentPage === pageNumber
                  ? 'bg-[#4600F2]/10 font-normal text-[#4600F2]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {pageNumber}
            </button>
          );
        } else if (pageNumber === 4 || pageNumber === currentPage + 2) {
          return (
            <span key={pageNumber} className="mx-1">
              ...
            </span>
          );
        }
        return null;
      })}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLastPage}
        type="button"
        aria-label="Next page"
        className={`p-2 ${isLastPage ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
      >
        <FaChevronRight className="h-4 w-4" />
      </button>
      <button
        onClick={() => handlePageChange(totalPages)}
        disabled={isLastPage}
        type="button"
        aria-label="Last page"
        className={`flex items-center justify-center gap-0 rounded-md border border-gray-300 p-2 ${isLastPage ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
      >
        <FaChevronRight className="h-4 w-4" />
        <FaChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
