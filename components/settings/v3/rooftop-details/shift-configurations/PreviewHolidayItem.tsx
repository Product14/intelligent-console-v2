'use client';

import React from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { MdDelete, MdEdit } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';

import { TimeValue } from '@/utils-settings/TimeUtils';

import { HolidayData } from './HolidaySettingModal';

interface PreviewHolidayItemProps {
  holiday: HolidayData;
  onRemove?: (id: string) => void;
}

export const PreviewHolidayItem: React.FC<PreviewHolidayItemProps> = ({
  holiday,
  onRemove,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimeDisplay = (time: TimeValue) => {
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  const timeDisplay = holiday.isFullDay
    ? 'Full Day'
    : `${formatTimeDisplay(holiday.startTime!)} - ${formatTimeDisplay(holiday.endTime!)}`;

  return (
    <div className="flex w-full items-start justify-between">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold leading-4 text-[rgba(0,0,0,0.8)]">
            {holiday.reason}
          </p>
          <p className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
            {formatDate(holiday.date)} | {timeDisplay}
          </p>
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={() => holiday.id && onRemove(holiday.id)}
          className="flex size-6 items-center justify-center text-[rgba(0,0,0,0.6)] transition-colors hover:text-black"
          aria-label="Remove holiday"
        >
          <RxCross2 className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
