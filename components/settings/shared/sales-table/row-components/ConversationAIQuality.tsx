import React from 'react';

import GaugeChart from '@/components/common/gauge-chart';
import { Conversation } from '@/components/overview/conversation-table';

interface ConversationAIQualityProps {
  conversation: Conversation;
}

const ConversationAIQuality: React.FC<ConversationAIQualityProps> = ({
  conversation,
}) => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="relative !z-0 flex h-10 w-12 items-center justify-center">
        <GaugeChart
          value={conversation?.aiQualityScore * 10}
          size={48}
          strokeWidth={4}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 text-sm font-bold">
          {conversation?.aiQualityScore}
        </span>
      </div>
    </div>
  );
};

export default ConversationAIQuality;
