import React from 'react';

const toDatetimeLocalValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getMinDatetimeLocalValue = () => toDatetimeLocalValue(new Date());

interface PublishingTypeSectionProps {
  scheduledDate?: Date;
  scheduleError?: string;
  onPublishNow: () => void;
  onSchedule: () => void;
  onDateChange: (date: Date | undefined) => void;
}

export const PublishingTypeSection: React.FC<PublishingTypeSectionProps> = ({
  scheduledDate,
  scheduleError,
  onPublishNow,
  onSchedule,
  onDateChange,
}) => (
  <div className="space-y-6">
    <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
      Publishing type
    </h3>

    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
        <input
          type="radio"
          name="publishType"
          value="now"
          checked={!scheduledDate}
          onChange={onPublishNow}
          className="h-4 w-4 text-purple-600 focus:ring-purple-600"
        />
        <span className="text-sm font-medium text-gray-900">Publish Now</span>
      </label>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
        <input
          type="radio"
          name="publishType"
          value="schedule"
          checked={!!scheduledDate}
          onChange={onSchedule}
          className="h-4 w-4 text-purple-600 focus:ring-purple-600"
        />
        <span className="text-sm font-medium text-gray-900">Schedule</span>
      </label>
    </div>

    {scheduledDate !== undefined && (
      <div className="space-y-2 pl-2">
        <input
          type="datetime-local"
          value={toDatetimeLocalValue(scheduledDate)}
          min={getMinDatetimeLocalValue()}
          className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
            scheduleError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-purple-600 focus:ring-purple-600'
          }`}
          onChange={(e) =>
            onDateChange(e.target.value ? new Date(e.target.value) : undefined)
          }
        />
        {scheduleError && (
          <p className="text-xs text-red-500">{scheduleError}</p>
        )}
      </div>
    )}
  </div>
);
