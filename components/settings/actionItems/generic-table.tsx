'use client';

// Minimal GenericTable stub — satisfies the v3 routing-directory components'
// expected API. Renders a basic HTML table with empty-state + a thin pagination bar.
// Replace with a richer implementation if/when a real table primitive is vendored.

import type { ReactNode } from 'react';

export interface GenericTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: string;
  render: (row: T) => ReactNode;
}

export interface GenericTablePagination {
  selectedCount: number;
  totalRows: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
}

export interface GenericTableProps<T> {
  columns: Array<GenericTableColumn<T>>;
  data: T[];
  isLoading?: boolean;
  loadingRows?: number;
  rowKey: (row: T) => string;
  rowClassName?: (row: T) => string;
  showSelectionInfo?: boolean;
  emptyState?: ReactNode;
  pagination?: GenericTablePagination;
}

export function GenericTable<T>({
  columns,
  data,
  isLoading,
  loadingRows = 5,
  rowKey,
  rowClassName,
  emptyState,
  pagination,
}: GenericTableProps<T>) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-gray-lighter">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className="border-b border-black/8 px-4 py-2.5 text-left"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  {columns.map((c) => (
                    <td key={c.key} className="border-b border-black/5 px-4 py-3">
                      <div className="h-3 w-32 animate-pulse rounded bg-black/8" />
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8">
                  {emptyState ?? (
                    <p className="text-center text-sm text-black-40">No rows.</p>
                  )}
                </td>
              </tr>
            )}
            {!isLoading &&
              data.map((row) => (
                <tr key={rowKey(row)} className={rowClassName?.(row)}>
                  {columns.map((c) => (
                    <td key={c.key} className="border-b border-black/5 px-4 py-3">
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalRows > 0 && (
        <div className="flex items-center justify-between border-t border-black/8 px-4 py-2 text-xs text-black-60">
          <div>
            Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalRows} total
          </div>
          <div className="flex gap-1">
            <PagerButton onClick={pagination.onFirstPage} disabled={pagination.currentPage <= 1}>«</PagerButton>
            <PagerButton onClick={pagination.onPreviousPage} disabled={pagination.currentPage <= 1}>‹</PagerButton>
            <PagerButton onClick={pagination.onNextPage} disabled={pagination.currentPage >= pagination.totalPages}>›</PagerButton>
            <PagerButton onClick={pagination.onLastPage} disabled={pagination.currentPage >= pagination.totalPages}>»</PagerButton>
          </div>
        </div>
      )}
    </div>
  );
}

function PagerButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-black/10 px-2 py-0.5 hover:bg-black/4 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
