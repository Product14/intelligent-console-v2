import { memo } from 'react';

import { ConversationColumnHeader } from '@/components/settings/shared/sales-table/models/conversationColumnMeta';
import { TableColumn } from '@/components/settings/shared/sales-table/models/tableColumn';
import TableCell from '@/components/settings/shared/sales-table/table-base/TableCell';

import SortButton, { SortOrder } from './SortButton';

interface ColumnRendererProps {
  data: TableColumn[];
  loading?: boolean;
  sortableColumns?: string[];
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (columnId: string) => void;
}

const ColumnRenderer = ({
  data,
  loading = false,
  sortableColumns = [],
  sortBy,
  sortOrder,
  onSort,
}: ColumnRendererProps) => {
  const isSortable = (columnId: string) => sortableColumns.includes(columnId);

  const getCurrentSortOrder = (columnId: string): SortOrder => {
    if (sortBy === columnId) {
      return sortOrder || null;
    }
    return null;
  };

  const handleSort = (columnId: string) => {
    if (isSortable(columnId) && onSort) {
      onSort(columnId);
    }
  };

  return (
    <>
      {data.map((column, index) => {
        const isLastColumn = data.length - 1 === index;
        const isFirstColumn = index === 0;
        const isColumnSortable = isSortable(column.id);
        const currentSortOrder = getCurrentSortOrder(column.id);

        return (
          <TableCell
            key={column.id}
            className={`leading sticky top-0 z-[40] bg-[#fafafa] text-sm font-semibold tracking-normal text-black/80 ${isFirstColumn ? 'rounded-tl-xl' : ''} ${isLastColumn ? 'rounded-tr-xl' : ''} ${column.responsiveClasses || ''} ${
              column.header === ConversationColumnHeader.CUSTOMER
                ? 'ltAir:sticky ltAir:left-0 z-[41] bg-[#fafafa]'
                : 'border-r border-black/10 p-3 pr-4'
            }`}
            style={{
              width: column.colWidth,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
            }}
          >
            <div
              className={`flex h-fit w-full items-center justify-between gap-1 ${
                isFirstColumn && 'border-r border-black/10 p-3 pr-4'
              }`}
            >
              {loading ? (
                <div className="h-5 w-20 animate-pulse rounded bg-gray-300"></div>
              ) : (
                <>
                  <span className="whitespace-nowrap">{column.header}</span>
                  {isColumnSortable && (
                    <SortButton
                      sortOrder={currentSortOrder}
                      onSort={() => handleSort(column.id)}
                    />
                  )}
                </>
              )}
            </div>
          </TableCell>
        );
      })}
    </>
  );
};

export default memo(ColumnRenderer);
