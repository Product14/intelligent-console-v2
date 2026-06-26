import { OnboardingState } from '@/store-settings/reducers/onboarding.reducer';
import { RootState } from '@/store-settings/root-reducer';

import React from 'react';
import { useSelector } from 'react-redux';

import { Conversation } from '@/components/overview/conversation-table';
import { ConversationColumnHeader } from '@/components/settings/shared/sales-table/models/conversationColumnMeta';
import { TableColumn } from '@/components/settings/shared/sales-table/models/tableColumn';
import ConversationAIQuality from '@/components/settings/shared/sales-table/row-components/ConversationAIQuality';
import ConversationActionItems from '@/components/settings/shared/sales-table/row-components/ConversationActionItems';
import ConversationAgents from '@/components/settings/shared/sales-table/row-components/ConversationAgents';
import ConversationCustomerDetails from '@/components/settings/shared/sales-table/row-components/ConversationCustomerDetails';
import ConversationDateTime from '@/components/settings/shared/sales-table/row-components/ConversationDateTime';
import ConversationDuration from '@/components/settings/shared/sales-table/row-components/ConversationDuration';
import ConversationIntent from '@/components/settings/shared/sales-table/row-components/ConversationIntent';
import ConversationNotes from '@/components/settings/shared/sales-table/row-components/ConversationNotes';
import ConversationOutcome from '@/components/settings/shared/sales-table/row-components/ConversationOutcome';
import ConversationSentiment from '@/components/settings/shared/sales-table/row-components/ConversationSentiment';
import ConversationVehicle from '@/components/settings/shared/sales-table/row-components/ConversationVehicle';
import TableCell from '@/components/settings/shared/sales-table/table-base/TableCell';

interface ConversationRowRendererProps {
  conversation: Conversation;
  columnData: TableColumn[];
  onActionClick: (callId: string, callback?: () => void) => void;
}

const ConversationRowRenderer: React.FC<ConversationRowRendererProps> = ({
  conversation,
  columnData,
  onActionClick,
}) => {
  const timezone = useSelector(
    (state: RootState) => (state.onboarding as OnboardingState)?.timezone
  );

  const renderCell = (column: TableColumn) => {
    switch (column.header) {
      case ConversationColumnHeader.CUSTOMER:
        return (
          <ConversationCustomerDetails
            conversation={conversation}
            onActionClick={onActionClick}
          />
        );
      case ConversationColumnHeader.INTENT:
        return <ConversationIntent conversation={conversation} />;
      case ConversationColumnHeader.VEHICLE:
        return <ConversationVehicle conversation={conversation} />;
      case ConversationColumnHeader.OUTCOME:
        return <ConversationOutcome conversation={conversation} />;
      case ConversationColumnHeader.DATE_AND_TIME:
        return (
          <ConversationDateTime
            conversation={conversation}
            timezone={timezone}
          />
        );
      case ConversationColumnHeader.CUSTOMER_SENTIMENT:
        return <ConversationSentiment conversation={conversation} />;
      case ConversationColumnHeader.AI_SCORE:
        return <ConversationAIQuality conversation={conversation} />;
      case ConversationColumnHeader.ACTION_ITEMS:
        return (
          <ConversationActionItems
            conversation={conversation}
            onActionClick={onActionClick}
          />
        );
      case ConversationColumnHeader.DURATION:
        return <ConversationDuration conversation={conversation} />;
      case ConversationColumnHeader.NOTES:
        return (
          <ConversationNotes
            conversation={conversation}
            onActionClick={onActionClick}
          />
        );
      case ConversationColumnHeader.AGENTS:
        return <ConversationAgents conversation={conversation} />;
      default:
        return null;
    }
  };

  return (
    <>
      {columnData.map((column, colIndex) => (
        <TableCell
          key={column.id}
          className={`${column?.disabled ? 'opacity-40' : ''} h-full align-top ${colIndex === 0 ? '' : 'border-r border-black/10'} ${column.responsiveClasses || ''} ${
            column.header === ConversationColumnHeader.CUSTOMER
              ? 'ltAir:sticky ltAir:left-0 z-10 bg-white'
              : ''
          }`}
          style={{
            width: column.colWidth,
            minWidth: column.minWidth,
            maxWidth: column.maxWidth,
          }}
        >
          {renderCell(column)}
        </TableCell>
      ))}
    </>
  );
};

export default ConversationRowRenderer;
