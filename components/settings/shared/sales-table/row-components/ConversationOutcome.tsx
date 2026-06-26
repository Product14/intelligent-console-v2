import React from 'react';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationOutcomeProps {
  conversation: Conversation;
}

const normalizeQueryResolved = (value: string | undefined) =>
  (value ?? '').toLowerCase().trim();

const ConversationOutcome: React.FC<ConversationOutcomeProps> = ({
  conversation,
}) => {
  const normalized = normalizeQueryResolved(conversation.queryResolved);
  const isResolved = normalized === 'yes';
  const isAbandoned = normalized === 'abandoned';
  const label = isResolved
    ? 'Resolved'
    : isAbandoned
      ? 'Abandoned'
      : 'Not Resolved';
  const className = isResolved
    ? 'bg-[#00B5480F] text-[#00B548]'
    : isAbandoned
      ? 'bg-[#6B72800F] text-gray-700'
      : 'bg-[#FF00000F] text-red-700';

  return (
    <div className="flex w-full items-center justify-start">
      <span
        className={`whitespace-nowrap rounded-[110px] px-3 py-0.5 text-xs font-semibold leading-[22px] tracking-normal ${className}`}
      >
        {label}
      </span>
    </div>
  );
};

export default ConversationOutcome;
