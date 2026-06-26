'use client';

import { SummaryTabs } from '@/app-models-settings/CallSummaryReport';

import React from 'react';
import { SiTicktick } from 'react-icons/si';

import { useRouter, useSearchParams } from 'next/navigation';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationActionItemsProps {
  conversation: Conversation;
  onActionClick?: (callId: string, callback?: () => void) => void;
}

const ConversationActionItems: React.FC<ConversationActionItemsProps> = ({
  conversation,
  onActionClick,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleActionClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', SummaryTabs.ACTION_ITEMS);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div
      className="flex cursor-pointer items-center justify-start"
      onClick={() =>
        onActionClick?.(conversation.callId, () => {
          handleActionClick();
        })
      }
    >
      <div className="flex flex-row items-center justify-center gap-2 rounded-full border border-[#0000001A] px-2 py-1">
        {conversation.actionItemCount > 0 && (
          <div className="text-[#000000E5]">
            <SiTicktick />
          </div>
        )}
        <span className="text-xs font-semibold text-black/80">
          {conversation.actionItemCount === 1
            ? '1 item'
            : conversation.actionItemCount
              ? `${conversation.actionItemCount} items`
              : '-'}
        </span>
      </div>
    </div>
  );
};

export default ConversationActionItems;
