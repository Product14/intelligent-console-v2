import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationIntentAndVehicleProps {
  conversation: Conversation;
}

const ConversationIntentAndVehicle: React.FC<
  ConversationIntentAndVehicleProps
> = ({ conversation }) => {
  return (
    <div className="flex flex-col text-xs font-semibold">
      <span className="capitalize text-black/60">
        {Array.isArray(conversation?.vehicle) &&
        conversation.vehicle
          .map((v) => v?.vehicleName)
          .filter((name) => !!name && name.trim() !== '').length > 0
          ? conversation.vehicle
              .map((v) => v?.vehicleName)
              .filter((name) => !!name && name.trim() !== '')
              .join(', ')
          : '-'}
      </span>
    </div>
  );
};

export default ConversationIntentAndVehicle;
