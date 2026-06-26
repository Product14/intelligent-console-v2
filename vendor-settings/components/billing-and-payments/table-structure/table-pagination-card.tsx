import React from 'react';

import SVG from '@spyne-console/design-system/svg';

import { Pagination as PaginationType } from '../types/invoices';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export default function TablePaginationCard({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } =
    pagination;

  const startEntry = page * limit + 1;
  const endEntry = Math.min((page + 1) * limit, total);

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
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange(0)}
            disabled={!hasPreviousPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="doubleArrow" className="h-5 w-5 rotate-180" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="BackIcon" className="h-3 w-3" />
          </button>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-black/60 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SVG iconName="BackIcon" className="h-3 w-3 rotate-180" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages - 1)}
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
