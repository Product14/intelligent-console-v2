import React from 'react';

import SVG from '@spyne-console/design-system/svg';

import { TablePagination as TablePaginationType } from './types';

interface TablePaginationProps {
  pagination: TablePaginationType;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  pagination,
  onPageChange,
}: TablePaginationProps) {
  const { page, pageSize, total } = pagination;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Convert 1-based page to 0-based for calculations
  const zeroBasedPage = page - 1;
  const startEntry = zeroBasedPage * pageSize + 1;
  const endEntry = Math.min((zeroBasedPage + 1) * pageSize, total);

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const handlePageChange = (newPage: number) => {
    // Convert 0-based to 1-based
    onPageChange(newPage + 1);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
      <div className="text-sm font-normal text-black/50">
        Showing{' '}
        <span className="font-medium text-black">
          {startEntry}-{endEntry}
        </span>{' '}
        of <span className="font-medium text-black">{total}</span> entries
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-normal text-black/50">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          {/* First Page */}
          <button
            onClick={() => handlePageChange(0)}
            disabled={!hasPreviousPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="doubleArrow" className="h-5 w-5 rotate-180" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(zeroBasedPage - 1)}
            disabled={!hasPreviousPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="BackIcon" className="h-3 w-3" />
          </button>

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(zeroBasedPage + 1)}
            disabled={!hasNextPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="BackIcon" className="h-3 w-3 rotate-180" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={!hasNextPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="doubleArrow" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
