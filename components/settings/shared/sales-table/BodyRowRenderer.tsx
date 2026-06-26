import { memo } from 'react';

import { NoDataPlaceholder, RowPlaceholder } from './BodyPlaceholders';
import { TableColumn } from './models/tableColumn';
import ConversationRowRenderer from './row-components/ConversationRowRenderer';
import TeamAvailabilityRowRenderer from './row-components/TeamAvailabilityRowRenderer';
import TableRow from './table-base/TableRow';

export interface BodyRowRendererProps {
  itemsPerPage: number;
  areRowsLoading: boolean;
  columnData: TableColumn[];
  rowData: any[];
  setShowRealAvailabilityModal: (show: boolean) => void;
  setSelectedDepartment: (department: string) => void;
  onActionClick?: (callId: string, callback?: () => void) => void;
  variant: 'conversation' | 'default';
}

const BodyRowRenderer = ({
  itemsPerPage,
  areRowsLoading,
  columnData,
  rowData,
  setShowRealAvailabilityModal,
  setSelectedDepartment,
  onActionClick,
  variant,
}: BodyRowRendererProps) => {
  if (areRowsLoading) {
    return (
      <RowPlaceholder
        itemsPerPage={itemsPerPage}
        columnData={columnData}
        setShowRealAvailabilityModal={setShowRealAvailabilityModal}
        setSelectedDepartment={setSelectedDepartment}
        variant={variant}
      />
    );
  }

  if (!areRowsLoading && rowData.length === 0) {
    return <NoDataPlaceholder columnCount={columnData.length} />;
  }

  return (
    <>
      {rowData.map((item, rowIndex) => {
        const isLastRow = rowIndex === rowData.length - 1;

        return (
          <TableRow
            key={rowIndex}
            className={`w-full border-b border-gray-100 py-5 ${isLastRow ? 'rounded-b-xl' : ''}`}
          >
            {variant === 'conversation' ? (
              <ConversationRowRenderer
                conversation={item}
                columnData={columnData}
                onActionClick={onActionClick!}
              />
            ) : (
              <TeamAvailabilityRowRenderer
                item={item}
                columnData={columnData}
                setShowRealAvailabilityModal={setShowRealAvailabilityModal}
                setSelectedDepartment={setSelectedDepartment}
              />
            )}
          </TableRow>
        );
      })}
    </>
  );
};

export default memo(BodyRowRenderer);
