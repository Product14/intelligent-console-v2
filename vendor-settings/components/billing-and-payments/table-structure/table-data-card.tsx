import React from 'react';

import { TableColumn } from './types';

export default function TableDataCard<T>({
  row,
  columns,
  rowClassName,
  rowId,
}: {
  row: T;
  columns: TableColumn<T>[];
  rowClassName: string;
  rowId: string;
}) {
  return (
    <tr
      key={rowId}
      className={`hover:bg-gray-light border-t border-black/5 text-sm text-black/80 ${rowClassName}`}
    >
      {columns.map((column) => {
        let value: React.ReactNode;
        if (typeof column.accessor === 'function') {
          value = column.accessor(row);
        } else {
          const raw = row[column.accessor];
          value =
            raw === undefined || raw === null ? '' : (raw as React.ReactNode);
        }

        return (
          <td
            key={column.id}
            className={`px-4 py-3 ${
              column.align === 'center'
                ? 'text-center'
                : column.align === 'right'
                  ? 'text-right'
                  : 'text-left'
            } ${column.cellClassName ?? ''}`}
          >
            {value}
          </td>
        );
      })}
    </tr>
  );
}
