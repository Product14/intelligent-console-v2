import {
  FEEDBACK_ISSUE_LABELS,
  FeedbackAspect,
  FeedbackIssueType,
} from '@/types/settings/feedback';

import React from 'react';
import { IoAlertCircleOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { RiThumbDownFill } from 'react-icons/ri';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { cn } from '@/lib/settings/utils';

const AssociationSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="35"
      viewBox="0 0 14 35"
      fill="none"
    >
      <path
        d="M0.5 0.5V21.9074C0.5 28.8621 6.1379 34.5 13.0926 34.5"
        stroke="black"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const FeedbackRow = ({
  type,
  feedbackData,
  isExpanded,
  onToggle,
  onSatisfactionChange,
  onTextChange,
  onSubmit,
  isDisabled,
  handleCompleteIntegration,
}: {
  type: FeedbackIssueType;
  feedbackData: FeedbackAspect;
  isExpanded: boolean;
  onToggle: () => void;
  onSatisfactionChange: (satisfied: boolean, shouldExpand?: boolean) => void;
  onTextChange: (text: string) => void;
  onSubmit?: () => void;
  handleCompleteIntegration?: () => void;

  isDisabled?: boolean;
}) => {
  const label = FEEDBACK_ISSUE_LABELS[type];
  const isIntegration = type === FeedbackIssueType.INTEGRATION_REQUIRED;

  const handleThumbsUp = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleThumbsDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Don't allow toggling if issue is already reported/resolved (from API)
    if (
      feedbackData?.status === 'reported' ||
      feedbackData?.status === 'resolved'
    ) {
      return;
    }

    // Toggle satisfaction state - if already dissatisfied, mark as satisfied (undo)
    // Default to true (satisfied) if undefined
    const currentSatisfied = feedbackData?.satisfied ?? true;
    const newSatisfiedState = !currentSatisfied;
    onSatisfactionChange(newSatisfiedState, !newSatisfiedState);
  };

  // Determine if there's an issue based on satisfaction and status
  const hasIssue = !feedbackData?.satisfied;
  const isIssueResolved = hasIssue && feedbackData?.status === 'resolved';
  const isIssueReported = hasIssue && feedbackData?.status === 'reported';
  const isReportedIssue =
    feedbackData?.status === 'reported' || feedbackData?.status === 'resolved';

  const statusConfig = isIssueResolved
    ? {
        borderColor: 'border-[#E6F2ED]',
        icon: <IoCheckmarkOutline className="size-[18px] text-[#027A48]" />,
        text: 'Issue Resolved',
        textColor: 'text-[#027A48]',
        buttonBorder: 'border-[rgba(2,122,72,0.1)]',
        buttonHover: 'hover:bg-green-50',
      }
    : isIssueReported
      ? {
          borderColor: 'border-white',
          icon: <IoAlertCircleOutline className="size-[18px] text-[#D10000]" />,
          text: 'Issue Reported',
          textColor: 'text-[#D10000]',
          buttonBorder: 'border-[rgba(209,0,0,0.1)]',
          buttonHover: 'hover:bg-red-50',
        }
      : null;

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-1.5 rounded-3xl border-[0.968px] border-solid bg-black/[0.03] py-2 pl-6 pr-2 transition-all',
        statusConfig?.borderColor || 'border-white'
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="w-[200px] shrink-0 text-sm font-medium leading-6 text-black/60">
          {label}
        </p>

        <div className="flex shrink-0 items-center justify-between gap-6">
          {statusConfig && (
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex shrink-0 items-center gap-[6.857px]">
                {statusConfig.icon}
                <p
                  className={`shrink-0 whitespace-nowrap text-xs font-medium leading-[17.143px] ${statusConfig.textColor}`}
                >
                  {statusConfig.text}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={`flex shrink-0 items-center justify-center overflow-clip rounded-lg border ${statusConfig.buttonBorder} bg-white px-2 py-0.5 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04)] transition-colors ${statusConfig.buttonHover}`}
              >
                <p
                  className={`whitespace-nowrap text-center text-xs font-medium leading-[18px] ${statusConfig.textColor}`}
                >
                  View Details
                </p>
              </button>
            </div>
          )}

          <div className="flex shrink-0 cursor-pointer items-center gap-2 rounded-[70.368px] border-[0.662px] border-black/10 py-[2.647px] pl-1 pr-2 hover:bg-black/5">
            {/* <div className="relative">
              {hasIssue && !isIssueResolved && (
                <div className="absolute -right-[0.66px] top-[0.34px] h-[29px] w-[34px] rounded-br-[100px] rounded-tr-[100px]" />
              )}
              <button
                onClick={handleThumbsUp}
                className="relative z-10 flex size-[24.706px] items-center justify-center rounded-full transition-colors hover:bg-black/5"
                aria-label="Thumbs up"
              >
                <GoThumbsup  className={cn('size-[17.647px] text-black/60', hasIssue && isIssueResolved && 'text-green-500')} />
              </button>
            </div> */}
            {/* <div className="h-5 w-0 border-l border-black/10" /> */}
            <button
              onClick={handleThumbsDown}
              className={cn(
                'flex size-[24.706px] items-center justify-center rounded-full transition-colors',
                isReportedIssue ? 'cursor-not-allowed' : 'hover:bg-black/5'
              )}
              aria-label="Thumbs down"
              disabled={isReportedIssue}
            >
              <RiThumbDownFill
                className={cn(
                  'size-[17.647px] text-black/60',
                  ((hasIssue && !isIssueResolved) || isExpanded) &&
                    'text-red-500'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && !isIntegration && (
        <div
          className="flex w-full gap-2.5 px-4 pb-1"
          onClick={(e) => e.stopPropagation()}
        >
          <AssociationSVG />
          <div className="flex flex-1 gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-3">
            <textarea
              value={feedbackData?.description || ''}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Describe your issue..."
              className="flex-1 resize-none bg-transparent text-sm leading-5 text-black/60 outline-none placeholder:text-black/60 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              disabled={isDisabled}
            />
          </div>
        </div>
      )}

      {isExpanded && isIntegration && (
        <div
          className="flex w-full gap-2.5 px-4 pb-1"
          onClick={(e) => e.stopPropagation()}
        >
          <AssociationSVG />
          <div className="flex w-full flex-col gap-4 rounded-xl border border-[rgba(70,0,242,0.1)] bg-white p-4">
            <img
              src={getSafeStaticAssetUrl(
                'https://spyne-static.s3.us-east-1.amazonaws.com/integration-fomo.png'
              )}
              alt="Integration"
              className="h-auto w-full"
            />

            <div className="flex items-center justify-between px-1 py-1">
              <p className="text-sm font-semibold leading-5 text-black/60">
                Complete Integration
              </p>
              <button
                onClick={handleCompleteIntegration}
                className="rounded-full border border-[rgba(70,0,242,0.2)] bg-[rgba(70,0,242,0.04)] px-4 py-2 text-sm font-semibold leading-5 text-[#4600f2] transition-opacity hover:opacity-80"
              >
                Stop Losing Customers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackRow;
