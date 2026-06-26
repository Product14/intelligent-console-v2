import {
  SentimentColorMap,
  SentimentIconMap,
  Sentiments,
} from '@/app-models-settings/Conversation';

import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationSentimentProps {
  conversation: Conversation;
}

const SentimentIconWrapper = ({
  Icon,
  className,
}: {
  Icon: React.ComponentType<any>;
  className: string;
}) => {
  return <Icon className={className} />;
};

const ConversationSentiment: React.FC<ConversationSentimentProps> = ({
  conversation,
}) => {
  const sentiment =
    conversation?.customerSentiment?.toLowerCase() as Sentiments;
  const backgroundColor =
    sentiment && SentimentColorMap[sentiment]
      ? SentimentColorMap[sentiment]
      : 'transparent';
  const SentimentIcon = sentiment && SentimentIconMap[sentiment];

  return (
    <div className="flex items-center justify-start">
      <span
        className="flex max-w-[250px] items-center gap-1 overflow-hidden truncate rounded px-2 py-1 text-xs font-semibold text-black/80"
        style={{
          backgroundColor: `${backgroundColor}1A`,
          color: backgroundColor === 'transparent' ? 'black' : backgroundColor,
        }}
      >
        {SentimentIcon && (
          <SentimentIconWrapper Icon={SentimentIcon} className="size-4" />
        )}
        {conversation?.customerSentiment}
      </span>
    </div>
  );
};

export default ConversationSentiment;
