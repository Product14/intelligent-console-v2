import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationCallSummaryProps {
  conversation: Conversation;
}

const ConversationCallSummary: React.FC<ConversationCallSummaryProps> = ({
  conversation,
}) => {
  return (
    <div className="flex flex-col justify-center gap-0.5">
      <div className="text-[10px] font-medium text-black/60 sm:text-xs">
        {conversation?.callSummary ? conversation?.callSummary : '-'}
      </div>
    </div>
  );
};

export default ConversationCallSummary;
