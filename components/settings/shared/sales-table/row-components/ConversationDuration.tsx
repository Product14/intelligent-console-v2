import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationDurationProps {
  conversation: Conversation;
}

const ConversationDuration: React.FC<ConversationDurationProps> = ({
  conversation,
}) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-full w-full text-xs font-semibold text-black/90">
        {conversation?.callDuration}
      </div>
    </div>
  );
};

export default ConversationDuration;
