'use client';

// Compact grouped-day summary of a weekly working schedule.
// Example output: "Mon–Fri 8 AM – 7 PM · Sat 9 AM – 5 PM · Sun: Closed"
//
// Consecutive days with identical { isAvailable, startTime, endTime } collapse
// into a range. Closed days render as "Closed". Designed to replace the verbose
// 7-row read-only schedule grid on the Department Details listing.

import type { RequestPayloadAvailabilityHours } from '@/types/settings/vini-config';

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayKey = (typeof DAY_KEYS)[number];

const DAY_LABEL: Record<DayKey, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

/** "08:00" → "8 AM"; "17:30" → "5:30 PM"; falls back to raw string on bad input. */
function formatTime(t: string): string {
  if (!t || !t.includes(':')) return t || '';
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return t;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return m === 0 ? `${h} ${period}` : `${h}:${String(m).padStart(2, '0')} ${period}`;
}

/** Hash a day's schedule for grouping. Closed days all share one key. */
function tupleKey(d: DaySchedule): string {
  if (!d.isAvailable) return 'closed';
  return `${d.startTime}|${d.endTime}`;
}

interface Group {
  startIdx: number;
  endIdx: number;
  schedule: DaySchedule;
}

function buildGroups(schedule: RequestPayloadAvailabilityHours): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  DAY_KEYS.forEach((key, idx) => {
    const day = schedule[key] as DaySchedule | undefined;
    if (!day) return;
    if (current && tupleKey(current.schedule) === tupleKey(day)) {
      current.endIdx = idx;
    } else {
      if (current) groups.push(current);
      current = { startIdx: idx, endIdx: idx, schedule: day };
    }
  });
  if (current) groups.push(current);
  return groups;
}

function renderGroup(g: Group): string {
  const startLabel = DAY_LABEL[DAY_KEYS[g.startIdx]];
  const endLabel = DAY_LABEL[DAY_KEYS[g.endIdx]];
  const range = g.startIdx === g.endIdx ? startLabel : `${startLabel}–${endLabel}`;
  if (!g.schedule.isAvailable) return `${range}: Closed`;
  return `${range} ${formatTime(g.schedule.startTime)} – ${formatTime(g.schedule.endTime)}`;
}

interface ShiftSummaryProps {
  schedule: RequestPayloadAvailabilityHours;
  /** Optional holiday count to append after the schedule, e.g. "+ 8 holidays". */
  holidaysCount?: number;
  className?: string;
}

export function ShiftSummary({
  schedule,
  holidaysCount = 0,
  className,
}: ShiftSummaryProps) {
  const groups = buildGroups(schedule);
  if (groups.length === 0) {
    return (
      <div className={className}>
        <span className="text-sm text-black-40">No schedule configured</span>
      </div>
    );
  }
  return (
    <div className={className}>
      <span className="text-sm leading-5 text-[#111]">
        {groups.map((g, i) => (
          <span key={i}>
            {i > 0 && <span className="text-[#bbb]"> · </span>}
            {renderGroup(g)}
          </span>
        ))}
      </span>
      {holidaysCount > 0 && (
        <span className="ml-2 text-xs text-[#666]">
          · {holidaysCount} {holidaysCount === 1 ? 'holiday' : 'holidays'}
        </span>
      )}
    </div>
  );
}

export default ShiftSummary;
