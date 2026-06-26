import { BodyRowRendererProps } from './BodyRowRenderer';
import ConversationSkeletonRenderer from './row-components/ConversationSkeletonRenderer';
import TableCell from './table-base/TableCell';
import TableRow from './table-base/TableRow';

interface RowPlaceholderProps
  extends Omit<BodyRowRendererProps, 'areRowsLoading' | 'rowData'> {
  variant: 'conversation' | 'default';
}

export const RowPlaceholder = ({
  itemsPerPage,
  columnData,
  variant,
}: RowPlaceholderProps) => {
  return (
    <>
      {Array(itemsPerPage)
        .fill(0)
        .map((_, index) => (
          <TableRow key={index} className="border-b border-gray-100 py-5">
            {columnData.map((column, colIndex) => (
              <TableCell
                className={`w-full ${column.responsiveClasses || ''} align-top ${
                  colIndex === 0
                    ? 'ltAir:sticky ltAir:left-0 z-10 bg-white'
                    : 'border-r border-black/10'
                }`}
                key={colIndex}
                style={{
                  width: column.colWidth,
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                }}
              >
                {variant === 'conversation' ? (
                  <ConversationSkeletonRenderer column={column} />
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300"></div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-300"></div>
                  </div>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
    </>
  );
};

interface NoDataPlaceholderProps {
  columnCount: number;
}

export const NoDataPlaceholder = ({ columnCount }: NoDataPlaceholderProps) => {
  return (
    <>
      <TableRow>
        <TableCell
          colSpan={columnCount}
          className="text-black-40 h-48 text-center"
        >
          No data available yet
        </TableCell>
      </TableRow>
    </>
  );
};
