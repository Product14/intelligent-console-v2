import React from 'react';
import { FaPlus } from 'react-icons/fa6';

import { Conversation } from '@/components/overview/conversation-table';

import { useQueryParams } from '@/hooks/settings/useQueryParams';

interface ConversationNotesProps {
  conversation: Conversation;
  onActionClick?: (callId: string, callback?: () => void) => void;
}

const ConversationNotes: React.FC<ConversationNotesProps> = ({
  conversation,
  onActionClick,
}) => {
  const { updateQueryParams } = useQueryParams();

  const handleAddNoteClick = () => {
    if (onActionClick) {
      onActionClick(conversation.callId, () => {
        updateQueryParams({ tab: 'overview', notes: 'true' });
      });
    }
  };

  return (
    <div
      className="flex cursor-pointer items-start justify-start"
      onClick={handleAddNoteClick}
    >
      {conversation.notes ? (
        <span className="line-clamp-4 text-xs text-black/60">
          {conversation.notes}
        </span>
      ) : (
        <div className="flex cursor-pointer items-center gap-2 text-xs text-black/60">
          <FaPlus className="size-[13px] text-[#4600F2]" />
          <div className="text-xs font-medium leading-6 text-[#4600F2]">
            Add Note
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationNotes;
