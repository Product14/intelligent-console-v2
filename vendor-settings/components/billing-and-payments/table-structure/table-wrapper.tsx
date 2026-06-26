import React from 'react';

import TableDataCard from './table-data-card';
import TableSkeleton from './table-skeleton';
import { TableColumn, TableWrapperProps } from './types';

export default function TableWrapper<T extends { id: string }>({
  columns,
  data,

  getRowClassName,
  loadingState,
  bodyClassName,
}: Readonly<TableWrapperProps<T>>) {
  const tableBodyClass =
    bodyClassName || 'max-h-[67vh] overflow-y-auto border-t border-black/10';

  return (
    <div className="w-full">
      <div className="border border-black/10 bg-white">
        <div className={tableBodyClass}>
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-light border-b border-black/10">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`truncate px-4 py-3 text-sm font-normal text-black/60 first:min-w-[220px] ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                    style={
                      column.width
                        ? { width: column.width }
                        : column.minWidth
                          ? { minWidth: column.minWidth }
                          : undefined
                    }
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingState?.isLoading ? (
                <TableSkeleton<T>
                  rows={loadingState?.skeletonRows ?? 4}
                  columns={columns}
                  colClassName="px-4 py-3"
                />
              ) : (
                data.map((row) => {
                  const rowClassName = getRowClassName?.(row) ?? '';
                  return (
                    <TableDataCard
                      key={row.id}
                      row={row}
                      columns={columns as TableColumn<unknown>[]}
                      rowClassName={rowClassName}
                      rowId={row.id}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
