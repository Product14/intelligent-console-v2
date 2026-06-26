/**@format */
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@spyne-console/utils/cn';

import { TimeValue } from '@/lib/settings/time-utils';

type TimeFormat = '12h' | '24h';

interface TimeInputProps {
  value: TimeValue;
  disabled?: boolean;
  handleChange: (time: TimeValue) => void;
  className?: string;
  format?: TimeFormat;
}

const padTwoDigits = (num: number): string => num.toString().padStart(2, '0');

const normalizeTimeValue = (
  time: TimeValue,
  timeFormat: TimeFormat
): TimeValue => {
  const parsedMinute = parseInt(time.minute, 10);
  const minute = Number.isNaN(parsedMinute)
    ? 0
    : Math.min(59, Math.max(0, parsedMinute));

  if (timeFormat === '24h') {
    const parsedHour = parseInt(time.hour, 10);
    const hour = Number.isNaN(parsedHour)
      ? 0
      : Math.min(23, Math.max(0, parsedHour));
    return {
      hour: padTwoDigits(hour),
      minute: padTwoDigits(minute),
      period: time.period || 'AM',
    };
  }

  const parsedHour = parseInt(time.hour, 10);
  let hour = Number.isNaN(parsedHour)
    ? 12
    : Math.min(12, Math.max(1, parsedHour));

  return {
    hour: padTwoDigits(hour),
    minute: padTwoDigits(minute),
    period: time.period === 'PM' ? 'PM' : 'AM',
  };
};

const isSameTimeValue = (a: TimeValue, b: TimeValue): boolean =>
  a.hour === b.hour && a.minute === b.minute && a.period === b.period;

const TimeInput: React.FC<TimeInputProps> = ({
  value = { hour: '12', minute: '00', period: 'AM' },
  disabled = false,
  handleChange,
  className = '',
  format = '12h',
}) => {
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const [editTime, setEditTime] = useState({
    hour: value.hour || '12',
    minute: value.minute || '00',
    period: value.period || 'AM',
  });
  const editTimeRef = useRef(editTime);

  const syncEditTime = (nextTime: typeof editTime) => {
    editTimeRef.current = nextTime;
    setEditTime(nextTime);
  };

  useEffect(() => {
    const synced = {
      hour: value.hour,
      minute: value.minute,
      period: value.period,
    };
    editTimeRef.current = synced;
    setEditTime(synced);
  }, [value]);

  const commitTime = (nextTime: TimeValue) => {
    const normalized = normalizeTimeValue(nextTime, format);
    editTimeRef.current = normalized;
    setEditTime(normalized);
    if (!isSameTimeValue(normalized, value)) {
      handleChange(normalized);
    }
  };

  const handleDigitChange = (field: 'hour' | 'minute', rawValue: string) => {
    let digitsOnly = rawValue.replace(/\D/g, '');
    const previousValue = editTimeRef.current[field];

    // When the field already has 2 digits, new keystrokes replace instead of append
    // (e.g. "09" + "1" would otherwise stay "09" after slicing to 2 chars)
    if (previousValue.length === 2 && digitsOnly.length > 2) {
      digitsOnly = digitsOnly.slice(-1);
    } else {
      digitsOnly = digitsOnly.slice(0, 2);
    }

    const nextTime = { ...editTimeRef.current, [field]: digitsOnly };
    syncEditTime(nextTime);

    if (field === 'hour' && digitsOnly.length === 2) {
      // Defer focus so hour onBlur reads the updated ref (not stale "1" for "11")
      queueMicrotask(() => {
        minuteInputRef.current?.focus();
        minuteInputRef.current?.select();
      });
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleFieldBlur = (field: 'hour' | 'minute') => {
    const nextTime = { ...editTimeRef.current };
    if (field === 'hour' && !nextTime.hour) {
      nextTime.hour = value.hour || (format === '24h' ? '00' : '12');
    }
    if (field === 'minute' && !nextTime.minute) {
      nextTime.minute = value.minute || '00';
    }
    commitTime(nextTime);
  };

  const handlePeriodChange = (period: string) => {
    const nextTime = { ...editTimeRef.current, period };
    commitTime(nextTime);
  };

  const inputClassName = cn(
    'w-8 min-w-[2ch] border-0 bg-transparent p-0 text-center text-sm font-normal text-black outline-none focus:ring-0',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
  );

  return (
    <div
      className={cn(
        'flex w-full items-center justify-end gap-0.5 rounded-lg bg-white px-2 py-2 text-sm font-normal text-black',
        { 'cursor-not-allowed bg-gray-100 opacity-50': disabled },
        className
      )}
      aria-label="Edit time"
    >
      <input
        ref={hourInputRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={editTime.hour}
        disabled={disabled}
        onChange={(e) => handleDigitChange('hour', e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => handleFieldBlur('hour')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
            minuteInputRef.current?.focus();
          }
        }}
        className={inputClassName}
        aria-label="Hour"
      />
      <span className="select-none text-black">:</span>
      <input
        ref={minuteInputRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        value={editTime.minute}
        disabled={disabled}
        onChange={(e) => handleDigitChange('minute', e.target.value)}
        onFocus={handleInputFocus}
        onBlur={() => handleFieldBlur('minute')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
        className={inputClassName}
        aria-label="Minute"
      />
      {format === '12h' && (
        <select
          value={editTime.period}
          disabled={disabled}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className={cn(
            'ml-1 cursor-pointer border-0 bg-transparent p-0 text-sm font-normal text-black outline-none',
            { 'cursor-not-allowed': disabled }
          )}
          aria-label="AM or PM"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      )}
    </div>
  );
};

export default TimeInput;
