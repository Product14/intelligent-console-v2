import { SummaryTabs } from '@/app-models-settings/CallSummaryReport';

import React from 'react';
import { IoMdPlay } from 'react-icons/io';
import { MdOutlineEmail, MdOutlinePhone } from 'react-icons/md';

import { useRouter, useSearchParams } from 'next/navigation';

import { Conversation } from '@/components/overview/conversation-table';

interface ConversationCustomerDetailsProps {
  conversation: Conversation;
  onActionClick: (callId: string, callback?: () => void) => void;
}

interface TooltipWrapperProps {
  children: React.ReactNode;
  title: string;
  text: string;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  title,
  text,
}) => {
  return (
    <div className="group relative">
      {children}
      <div className="absolute left-full top-1/2 z-20 ml-2 hidden -translate-y-1/2 group-hover:block">
        <div className="rounded-md bg-black px-2 py-1 text-center text-xs font-medium shadow-lg">
          <div className="whitespace-nowrap text-[9px] font-medium text-white/60">
            {title}
          </div>
          <div className="whitespace-nowrap text-xs font-medium text-white">
            {text}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black"></div>
        </div>
      </div>
    </div>
  );
};

const ConversationCustomerDetails: React.FC<
  ConversationCustomerDetailsProps
> = ({ conversation, onActionClick }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick(conversation.callId, () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', SummaryTabs.TRANSCRIPTION);
      router.replace(`?${params.toString()}`);
    });
  };

  return (
    <div
      className="flex cursor-pointer flex-row justify-start gap-4 border-r border-black/10 p-3 pr-4"
      onClick={() =>
        onActionClick(conversation.callId, () => {
          console.log('first column clicked');
        })
      }
    >
      <div className="flex w-full flex-col items-start justify-start gap-2">
        <div className="relative flex w-full items-center justify-between gap-1">
          <div className="w-[calc(100%-34px)]">
            <div className="flex w-full items-center gap-3 text-sm font-semibold">
              <TooltipWrapper
                title={
                  conversation.name.trim() !== ''
                    ? conversation.name
                    : 'Unknown Number'
                }
                text={conversation?.callId}
              >
                <span
                  className={`truncate ${conversation.name.trim() !== '' ? 'text-black/90' : 'text-red-700'}`}
                >
                  {conversation.name.trim() !== ''
                    ? conversation.name
                    : 'Unknown Number'}
                </span>
              </TooltipWrapper>
            </div>
          </div>
          <div
            className="flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#4600F2]"
            onClick={handlePlayClick}
          >
            <IoMdPlay className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          <div
            className={`flex flex-row items-center justify-start gap-2 text-xs font-medium ${conversation?.phoneNumber.trim() !== '' ? 'text-black/60' : 'text-red-700'} w-full`}
          >
            <MdOutlinePhone className="h-4 w-4" />
            <span className="truncate">
              {conversation?.phoneNumber.trim() !== ''
                ? conversation?.phoneNumber
                : 'Unknown Number'}
            </span>
          </div>
          <div
            className={`flex flex-row items-center justify-start gap-2 text-xs font-medium ${conversation?.email.trim() !== '' ? 'text-black/60' : 'text-red-700'} w-full`}
          >
            <MdOutlineEmail className="h-4 w-4 flex-shrink-0" />
            <TooltipWrapper
              title="Email"
              text={
                conversation.email.trim() !== ''
                  ? conversation.email
                  : 'No Email Found'
              }
            >
              <span className="truncate">
                {conversation.email.trim() !== ''
                  ? conversation.email
                  : 'No Email Found'}
              </span>
            </TooltipWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCustomerDetails;
