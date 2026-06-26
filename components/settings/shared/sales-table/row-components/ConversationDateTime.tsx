import React from 'react';
import { IoMdCalendar } from 'react-icons/io';

import { Conversation } from '@/components/overview/conversation-table';

import { formatTimestampWithTimezone } from '@/lib/settings/utils';

interface ConversationDateTimeProps {
  conversation: Conversation;
  timezone?: string;
}

const ConversationDateTime: React.FC<ConversationDateTimeProps> = ({
  conversation,
  timezone,
}) => {
  const { date, time } = formatTimestampWithTimezone(
    conversation.createdAt,
    timezone
  );

  return (
    <div className="flex max-w-fit flex-row items-start justify-start gap-3">
      <div className="items-start justify-start">
        <IoMdCalendar className="h-5 w-5 text-black/30" />
      </div>
      <div className="flex flex-col gap-1.5 whitespace-nowrap text-xs font-medium text-black/90">
        <div>{date}</div>
        <div>{time}</div>
      </div>
    </div>
  );
};

export default ConversationDateTime;
