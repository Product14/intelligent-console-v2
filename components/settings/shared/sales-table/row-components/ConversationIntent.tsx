import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationIntentAndVehicleProps {
  conversation: Conversation;
}

const ConversationIntentAndVehicle: React.FC<
  ConversationIntentAndVehicleProps
> = ({ conversation }) => {
  return (
    <div className="flex flex-col gap-3 text-xs font-semibold">
      <span className="truncate capitalize text-black/80">
        {conversation.customerIntent ?? ''}
      </span>
    </div>
  );
};

export default ConversationIntentAndVehicle;
