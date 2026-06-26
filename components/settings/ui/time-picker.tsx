'use client';

import { cn } from '@/lib/settings/cn';

interface TimePickerProps {
  /** "09:00 AM" / "9:30 PM" style — what TouchpointRow uses today. */
  value: string;
  onChange(next: string): void;
  disabled?: boolean;
}

interface ParsedTime {
  hour: number; // 1–12
  minute: number; // 0–59 (display is rounded to 00/15/30/45)
  meridiem: 'AM' | 'PM';
}

function parseTime(raw: string): ParsedTime {
  // Accept "9:30 AM", "09:30 AM", "9:30AM", "9:30", "9", etc. Fall back to 9:00 AM.
  const trimmed = (raw || '').trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):?(\d{0,2})\s*(AM|PM)?$/);
  if (!match) return { hour: 9, minute: 0, meridiem: 'AM' };
  const hourRaw = parseInt(match[1], 10);
  const minuteRaw = match[2] ? parseInt(match[2], 10) : 0;
  let meridiem: 'AM' | 'PM' = (match[3] as 'AM' | 'PM') || 'AM';
  let hour = hourRaw;
  // Allow 24-hour input by collapsing to 12-hour.
  if (hour === 0) {
    hour = 12;
    meridiem = 'AM';
  } else if (hour > 12) {
    hour = hour - 12;
    meridiem = 'PM';
  }
  if (hour < 1 || hour > 12) hour = 9;
  const minute = Math.min(59, Math.max(0, isNaN(minuteRaw) ? 0 : minuteRaw));
  return { hour, minute, meridiem };
}

function formatTime({ hour, minute, meridiem }: ParsedTime): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm} ${meridiem}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = [0, 15, 30, 45];

/**
 * 12-hour time picker: hour select + minute select (15-min steps) + AM/PM
 * toggle. Stores and emits the same "HH:MM AM" string the existing TouchpointRow
 * uses, so the data shape doesn't change.
 */
export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const parsed = parseTime(value);

  // If the parsed minute isn't on a 15-min boundary, snap it for display.
  const minuteSnapped = MINUTES.reduce((acc, m) =>
    Math.abs(m - parsed.minute) < Math.abs(acc - parsed.minute) ? m : acc
  , 0);

  const emit = (next: Partial<ParsedTime>) =>
    onChange(formatTime({ ...parsed, minute: minuteSnapped, ...next }));

  const selectClass = cn(
    'h-9 rounded-lg border border-black/10 bg-white px-2 text-sm text-black-80 outline-none transition-colors',
    'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
    'disabled:cursor-not-allowed disabled:opacity-50'
  );

  return (
    <div className="inline-flex items-center gap-1">
      <select
        value={parsed.hour}
        disabled={disabled}
        onChange={(e) => emit({ hour: parseInt(e.target.value, 10) })}
        className={selectClass}
        aria-label="Hour"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-sm text-black-40">:</span>
      <select
        value={minuteSnapped}
        disabled={disabled}
        onChange={(e) => emit({ minute: parseInt(e.target.value, 10) })}
        className={selectClass}
        aria-label="Minute"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>
      <div className="ml-1 inline-flex shrink-0 overflow-hidden rounded-lg border border-black/10">
        {(['AM', 'PM'] as const).map((m) => {
          const selected = parsed.meridiem === m;
          return (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => emit({ meridiem: m })}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                selected ? 'bg-blue-2 text-blue-light' : 'bg-white text-black-60 hover:bg-gray-8'
              )}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
