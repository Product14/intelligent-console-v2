import React, { FC, memo } from 'react';

import { Conversation } from '@/components/overview/conversation-table';
import BodyRowRenderer from '@/components/settings/shared/sales-table/BodyRowRenderer';
import ColumnRenderer from '@/components/settings/shared/sales-table/ColumnRenderer';
import {
  ConversationColumnHeader,
  ConversationColumnID,
} from '@/components/settings/shared/sales-table/models/conversationColumnMeta';
import { TableColumn } from '@/components/settings/shared/sales-table/models/tableColumn';
import TableRow from '@/components/settings/shared/sales-table/table-base/TableRow';

import { SortOrder } from './SortButton';

interface ConversationTableProps {
  conversations: Conversation[];
  onActionClick: (callId: string, callback?: () => void) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasNextPage?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  callId: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (columnId: string) => void;
}

export const columnHeaders: TableColumn[] = [
  {
    id: ConversationColumnID.CUSTOMER,
    header: ConversationColumnHeader.CUSTOMER,
    colWidth: 'auto',
    minWidth: '268px',
    maxWidth: '300px',
    priority: 'high',
    responsiveClasses: '',
  },
  {
    id: ConversationColumnID.AGENTS,
    header: ConversationColumnHeader.AGENTS,
    colWidth: 'auto',
    minWidth: '77px',
    maxWidth: '250px',
    priority: 'medium',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.AI_SCORE,
    header: ConversationColumnHeader.AI_SCORE,
    colWidth: 'auto',
    minWidth: '100px',
    maxWidth: '150px',
    priority: 'low',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.CUSTOMER_SENTIMENT,
    header: ConversationColumnHeader.CUSTOMER_SENTIMENT,
    colWidth: 'auto',
    minWidth: '130px',
    maxWidth: '200px',
    priority: 'high',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.INTENT,
    header: ConversationColumnHeader.INTENT,
    colWidth: 'auto',
    minWidth: '150px',
    maxWidth: '250px',
    priority: 'high',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.VEHICLE,
    header: ConversationColumnHeader.VEHICLE,
    colWidth: 'auto',
    minWidth: '150px',
    maxWidth: '250px',
    priority: 'high',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.OUTCOME,
    header: ConversationColumnHeader.OUTCOME,
    colWidth: 'auto',
    minWidth: '97px',
    maxWidth: '150px',
    priority: 'medium',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.DATE_AND_TIME,
    header: ConversationColumnHeader.DATE_AND_TIME,
    colWidth: 'auto',
    minWidth: '150px',
    maxWidth: '200px',
    priority: 'medium',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.DURATION,
    header: ConversationColumnHeader.DURATION,
    colWidth: 'auto',
    minWidth: '85px',
    maxWidth: '150px',
    priority: 'low',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.ACTION_ITEMS,
    header: ConversationColumnHeader.ACTION_ITEMS,
    colWidth: 'auto',
    minWidth: '120px',
    maxWidth: '170px',
    priority: 'low',
    responsiveClasses: 'p-3 pr-4',
  },
  {
    id: ConversationColumnID.NOTES,
    header: ConversationColumnHeader.NOTES,
    colWidth: 'auto',
    minWidth: '323px',
    maxWidth: '400px',
    priority: 'low',
    responsiveClasses: 'p-3 pr-4',
  },
];

// Define sortable columns
const sortableColumns = [
  ConversationColumnID.DATE_AND_TIME,
  ConversationColumnID.AI_SCORE,
];

const ConversationTable: FC<ConversationTableProps> = ({
  conversations,
  onActionClick,
  loading = false,
  loadingMore = false,
  hasNextPage = false,
  containerRef,
  callId,
  sortBy,
  sortOrder,
  onSort,
}) => {
  return (
    <div className="scrollbar-hide h-[calc(100vh-280px)] overflow-y-auto bg-white">
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <TableRow className="">
            <ColumnRenderer
              data={columnHeaders}
              loading={false}
              sortableColumns={sortableColumns}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
          </TableRow>
        </thead>
        <tbody>
          <BodyRowRenderer
            areRowsLoading={loading}
            itemsPerPage={loading ? 10 : conversations.length}
            columnData={columnHeaders}
            rowData={conversations}
            setShowRealAvailabilityModal={() => {}}
            setSelectedDepartment={() => {}}
            onActionClick={onActionClick}
            variant="conversation"
          />

          {/* Show 2 skeleton rows for infinite scroll loading */}
          {loadingMore && hasNextPage && (
            <BodyRowRenderer
              areRowsLoading={true}
              itemsPerPage={2}
              columnData={columnHeaders}
              rowData={[]}
              setShowRealAvailabilityModal={() => {}}
              setSelectedDepartment={() => {}}
              variant="conversation"
            />
          )}

          {/* Intersection observer target for infinite scroll */}
          {hasNextPage && !loadingMore && (
            <tr>
              <td colSpan={columnHeaders.length}>
                <div ref={containerRef} className="h-4" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default memo(ConversationTable);
