import React from 'react';

import { TableSkeletonProps } from './types';

export default function TableSkeleton<T extends { id: string }>({
  rows,
  columns,
  colClassName,
}: TableSkeletonProps<T>) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={`skeleton-row-${idx}`} className="border-b border-gray-100">
          {columns?.map((column) => (
            <td
              key={column.id}
              className={`h-9 border-b border-r border-gray-100 px-3 py-2 ${colClassName} ${
                column.align === 'center'
                  ? 'text-center'
                  : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
              } ${column.cellClassName ?? ''}`}
            >
              {column.accessor === 'name' ? (
                <div className="flex items-center gap-2">
                  <div className="shimmer h-5 w-5 rounded-full bg-gray-200" />
                  <div className="shimmer h-5 w-20 rounded bg-gray-200" />
                </div>
              ) : (
                <div className="shimmer h-5 w-16 rounded bg-gray-200" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
