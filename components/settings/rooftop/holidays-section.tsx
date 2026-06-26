'use client';

/**
 * Holidays section rendered below the department list in DepartmentsForm.
 *
 * - List of holiday cards (name, date + recurrence badge, dept scope, hours).
 * - "+ Add Holiday" button and empty state.
 * - Opens HolidayEditModal for add or edit.
 *
 * Holidays are a rooftop-wide list; each entry references one or more
 * DepartmentConfig.id values (or applies to all).
 */

import { useMemo, useState } from 'react';
import type { DepartmentConfig, HolidayConfig } from '@/services/settings/types';
import { TimeUtils } from '@/lib/settings/time-utils';
import { DsButton } from '@/components/settings/ds';
import { HolidayEditModal } from './holiday-edit-modal';
import { HolidayImportModal } from './holiday-import-modal';

function formatTime12(t24: string): string {
  return TimeUtils.convertTo12HourString(t24).replace(/^0/, '');
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "1st", "2nd", "3rd", "4th", … with the standard English rules
 *  (11th/12th/13th override st/nd/rd). */
function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

/** Text color for the merged when-string, keyed by recurrence. Carries the
 *  same hues the standalone Yearly/Monthly chips used so operators retain
 *  the at-a-glance "this repeats" cue now that the chip is gone. */
const RECURRENCE_TEXT_COLOR: Record<HolidayConfig['recurrence'], string> = {
  none: 'text-black-60',
  yearly: 'text-violet-700',
  monthly: 'text-amber-700',
};

/** Human-readable recurrence + date in one string.
 *
 *  - none:    `Jun 15, 2026`     (full date, since it's a one-off)
 *  - yearly:  `Jun 15, every year`  (year omitted — the year doesn't matter)
 *  - monthly: `15th of every month` (year AND month omitted)
 *
 *  Merges what used to be two separate UI pieces (a date string + a
 *  Yearly / Monthly chip) into one phrase that reads naturally. */
function describeWhen(holiday: HolidayConfig): string {
  const [y, m, d] = holiday.date.split('-');
  if (!y || !m || !d) return holiday.date;
  const monthIdx = parseInt(m, 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] ?? m;
  const day = parseInt(d, 10);
  if (holiday.recurrence === 'monthly') {
    return `${ordinal(day)} of every month`;
  }
  if (holiday.recurrence === 'yearly') {
    return `${monthName} ${day}, every year`;
  }
  return `${monthName} ${day}, ${y}`;
}

function describeScope(
  holiday: HolidayConfig,
  allDepts: DepartmentConfig[]
): string {
  if (holiday.appliesToAll) return 'All departments';
  if (holiday.departmentIds.length === 0) return 'No departments selected';
  const names = holiday.departmentIds
    .map((id) => allDepts.find((d) => d.id === id))
    .filter((d): d is DepartmentConfig => !!d)
    .map((d) => d.name || d.kind);
  return names.join(' · ');
}

function describeHours(holiday: HolidayConfig): string {
  if (holiday.isFullDay) return 'Closed all day';
  const start = holiday.startTime ? formatTime12(holiday.startTime) : '';
  const end = holiday.endTime ? formatTime12(holiday.endTime) : '';
  return start && end ? `${start} – ${end}` : 'Custom hours';
}

export function HolidaysSection({
  holidays,
  allDepts,
  onAdd,
  onUpdate,
  onDelete,
  onImport,
}: {
  holidays: HolidayConfig[];
  allDepts: DepartmentConfig[];
  onAdd: (holiday: HolidayConfig) => void;
  onUpdate: (holiday: HolidayConfig) => void;
  onDelete: (id: string) => void;
  /** Bulk-add from the import modal. Lands atomically so all entries persist
   *  together. */
  onImport: (holidays: HolidayConfig[]) => void;
}) {
  const [editing, setEditing] = useState<HolidayConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const sorted = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays]
  );

  const open = (h: HolidayConfig | null) => {
    setEditing(h);
    setModalOpen(true);
  };

  const close = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = (h: HolidayConfig) => {
    if (editing) onUpdate(h);
    else onAdd(h);
    close();
  };

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-black-dark">Holidays</h2>
          <p className="mt-0.5 text-sm text-black-60">
            Closure days that apply across one or more departments. Repeats are
            honored automatically.
          </p>
        </div>
        <DsButton
          label="+ Add Holiday"
          type="bordered"
          size="AA"
          onClick={() => setImportOpen(true)}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 bg-gray-light/30 px-5 py-8 text-center">
          <div className="text-sm font-medium text-black-dark">
            No holidays added yet
          </div>
          <p className="mt-1 text-xs text-black-60">
            Add holidays like Christmas, Thanksgiving, or a service-only
            closure. Each entry can repeat yearly or monthly.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((h) => {
            return (
              <div
                key={h.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/10 bg-white px-5 py-4 transition-shadow hover:shadow-[0_1px_3px_rgba(16,24,40,0.06)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-black-dark">
                      {h.name}
                    </span>
                    <span
                      className={`text-xs font-medium ${RECURRENCE_TEXT_COLOR[h.recurrence]}`}
                    >
                      {describeWhen(h)}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-black-60">
                    {describeScope(h, allDepts)} · {describeHours(h)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => open(h)}
                    className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black-dark shadow-sm hover:bg-gray-light"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(h.id)}
                    className="rounded-md p-1.5 text-black-60 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${h.name}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <HolidayEditModal
          key={editing?.id ?? 'new'}
          initial={editing}
          allDepts={allDepts}
          existingHolidays={holidays}
          onClose={close}
          onSave={save}
        />
      )}

      {importOpen && (
        <HolidayImportModal
          existing={holidays}
          onClose={() => setImportOpen(false)}
          onImport={(toAdd) => {
            onImport(toAdd);
            setImportOpen(false);
          }}
          onAddCustom={() => {
            setImportOpen(false);
            open(null);
          }}
        />
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
