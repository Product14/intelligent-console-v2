import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationAgentsProps {
  conversation: Conversation;
}

const ConversationAgents: React.FC<ConversationAgentsProps> = ({
  conversation,
}) => {
  return (
    <div className="flex w-full">
      <span className="truncate text-xs font-semibold capitalize text-black/90">
        {conversation.assistantName ?? '-'}
      </span>
    </div>
  );
};

export default ConversationAgents;
