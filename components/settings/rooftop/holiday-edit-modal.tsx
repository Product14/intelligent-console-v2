'use client';

/**
 * Modal for adding or editing a single holiday entry.
 *
 * Mirrors the visual shell of HoursEditModal in departments-form.tsx — same
 * portal, header, scroll body, sticky footer. Field set:
 *   - Name + date (custom calendar popover)
 *   - Recurrence (None / Yearly / Monthly)
 *   - Department scope ("All departments" toggle + dept chips)
 *   - Time ("Closed all day" toggle + start/end TimeInputs when partial)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  DepartmentConfig,
  HolidayConfig,
  HolidayRecurrence,
} from '@/services/settings/types';
import { Input, DsButton } from '@/components/settings/ds';
import Toggle from '@/vendor-settings/design-system/toggle/toggle';
import TimeInput from '@/components/settings/shared/time-input';
import { TimeUtils } from '@/lib/settings/time-utils';

const RECURRENCE_OPTIONS: Array<{ value: HolidayRecurrence; label: string; hint: string }> = [
  { value: 'none', label: 'No repeat', hint: 'One-off' },
  { value: 'yearly', label: 'Every year', hint: 'Same month & day' },
  { value: 'monthly', label: 'Every month', hint: 'Same day of month' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function newDraft(): HolidayConfig {
  return {
    id: '',
    name: '',
    date: '',
    appliesToAll: true,
    departmentIds: [],
    recurrence: 'none',
    isFullDay: true,
    startTime: '09:00',
    endTime: '18:00',
  };
}

export function HolidayEditModal({
  initial,
  allDepts,
  existingHolidays,
  onClose,
  onSave,
}: {
  /** When set, modal opens in edit mode and pre-fills. Otherwise it's an add. */
  initial: HolidayConfig | null;
  allDepts: DepartmentConfig[];
  /** Every holiday currently in the form. Used to block a save that would
   *  create a name collision with another holiday (case-insensitive). */
  existingHolidays: HolidayConfig[];
  onClose: () => void;
  onSave: (holiday: HolidayConfig) => void;
}) {
  const [draft, setDraft] = useState<HolidayConfig>(() => initial ?? newDraft());

  useEffect(() => {
    setDraft(initial ?? newDraft());
  }, [initial]);

  const isEdit = !!initial;

  const start12 = useMemo(
    () => TimeUtils.convertTo12HourFormat(draft.startTime || '09:00'),
    [draft.startTime]
  );
  const end12 = useMemo(
    () => TimeUtils.convertTo12HourFormat(draft.endTime || '18:00'),
    [draft.endTime]
  );

  const patch = (p: Partial<HolidayConfig>) => setDraft((d) => ({ ...d, ...p }));

  const toggleDept = (id: string) => {
    setDraft((d) => {
      const has = d.departmentIds.includes(id);
      return {
        ...d,
        departmentIds: has
          ? d.departmentIds.filter((x) => x !== id)
          : [...d.departmentIds, id],
      };
    });
  };

  // Name collision: case-insensitive match against every OTHER holiday's
  // name. Surfaces inline while the operator is still in the modal so they
  // can't get a 400 from the backend on save.
  const nameTrimmed = draft.name.trim();
  const nameLower = nameTrimmed.toLowerCase();
  const nameError =
    nameTrimmed.length > 0 &&
    existingHolidays.some(
      (h) => h.id !== draft.id && h.name.trim().toLowerCase() === nameLower
    )
      ? `A holiday named "${nameTrimmed}" already exists. Pick a different name.`
      : null;

  const isValid =
    nameTrimmed.length > 0 &&
    !nameError &&
    !!draft.date &&
    (draft.appliesToAll || draft.departmentIds.length > 0);

  const submit = () => {
    if (!isValid) return;
    const id = draft.id || `holiday-${Date.now()}`;
    // Always preserve times in form state, even for full-day holidays. The
    // TimeInputs show defaults visually ("9:00 AM"/"6:00 PM") via the
    // `draft.startTime || '09:00'` fallback in `start12`/`end12`, but the
    // underlying draft can be undefined — if the user toggles a full-day
    // holiday into custom hours without touching the time inputs, the
    // visible default would be lost on save. Backfill here so the submitted
    // value matches what the user saw. The wire adapter only sends `hours`
    // when isFullDay is false, so this is form-state-only.
    const cleaned: HolidayConfig = {
      ...draft,
      id,
      name: draft.name.trim(),
      departmentIds: draft.appliesToAll ? [] : draft.departmentIds,
      startTime: draft.startTime || '09:00',
      endTime: draft.endTime || '18:00',
    };
    onSave(cleaned);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-neutral-950">
              {isEdit ? 'Edit holiday' : 'Add a holiday'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
            <Input
              label="Name"
              required
              value={draft.name}
              onChange={(v) => patch({ name: v })}
              placeholder="Christmas Day"
              error={nameError ?? undefined}
            />
            <div>
              <div className="mb-1 block text-base font-normal text-black-60">
                Date <span className="text-red-500">*</span>
              </div>
              <DatePopover
                value={draft.date}
                onChange={(d) => patch({ date: d })}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black-40">
              Repeat
            </div>
            <div className="grid grid-cols-3 gap-2">
              {RECURRENCE_OPTIONS.map((opt) => {
                const active = draft.recurrence === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => patch({ recurrence: opt.value })}
                    className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left ${
                      active
                        ? 'border-blue-light bg-blue-8 text-blue-light'
                        : 'border-black/10 bg-white text-black-80 hover:border-black/30'
                    }`}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span
                      className={`text-[11px] ${
                        active ? 'text-blue-light/80' : 'text-black-40'
                      }`}
                    >
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department scope */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-black-40">
                Applies to
              </div>
              <label
                htmlFor={`holiday-all-${draft.id || 'new'}`}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <Toggle
                  id={`holiday-all-${draft.id || 'new'}`}
                  toggle={draft.appliesToAll}
                  toggleHandler={() =>
                    patch({ appliesToAll: !draft.appliesToAll })
                  }
                  className="[&_input:checked~div:first-of-type]:bg-black/85 [&_input:checked~div>div]:bg-white"
                />
                <span className="text-xs font-medium text-black-60">
                  All departments
                </span>
              </label>
            </div>

            {!draft.appliesToAll && (
              <div className="rounded-lg border border-black/8 bg-gray-light/40 px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {allDepts.map((dept) => {
                    const checked = draft.departmentIds.includes(dept.id);
                    const label = dept.name || dept.kind;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => toggleDept(dept.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                          checked
                            ? 'border-blue-light bg-blue-8 text-blue-light'
                            : 'border-black/10 bg-white text-black-80 hover:border-black/30'
                        }`}
                      >
                        {checked && <CheckIcon />}
                        <span className="capitalize">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {draft.departmentIds.length === 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    Pick at least one department, or switch on &ldquo;All
                    departments&rdquo;.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hours */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-black-40">
                Hours
              </div>
              <label
                htmlFor={`holiday-full-${draft.id || 'new'}`}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <Toggle
                  id={`holiday-full-${draft.id || 'new'}`}
                  toggle={draft.isFullDay}
                  toggleHandler={() => patch({ isFullDay: !draft.isFullDay })}
                  className="[&_input:checked~div:first-of-type]:bg-black/85 [&_input:checked~div>div]:bg-white"
                />
                <span className="text-xs font-medium text-black-60">
                  Closed all day
                </span>
              </label>
            </div>

            {!draft.isFullDay && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-black/8 bg-gray-light/40 px-4 py-3">
                <div className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-2 shadow-[0_1px_1px_rgba(16,24,40,0.04)]">
                  <span className="text-[11px] uppercase tracking-wide text-black-40">
                    From
                  </span>
                  <TimeInput
                    value={start12}
                    handleChange={(t) =>
                      patch({ startTime: TimeUtils.convertTo24HourFormat(t) })
                    }
                    className="px-0 py-1"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-2 shadow-[0_1px_1px_rgba(16,24,40,0.04)]">
                  <span className="text-[11px] uppercase tracking-wide text-black-40">
                    To
                  </span>
                  <TimeInput
                    value={end12}
                    handleChange={(t) =>
                      patch({ endTime: TimeUtils.convertTo24HourFormat(t) })
                    }
                    className="px-0 py-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-black/10 bg-white px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-medium text-black-60 hover:bg-gray-light"
            >
              Cancel
            </button>
            <DsButton
              label={isEdit ? 'Save changes' : 'Add holiday'}
              type="primary"
              size="AA"
              disabled={!isValid}
              onClick={submit}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Date popover — compact calendar grid. Native <input type="date"> looks
// like a desktop-OS picker; this replaces it with an in-product calendar that
// matches the rest of the page's surfaces.
// ---------------------------------------------------------------------------

function DatePopover({
  value,
  onChange,
}: {
  /** ISO YYYY-MM-DD or empty. */
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // Trigger's viewport rect, recomputed on open + scroll/resize so the
  // portaled popover stays anchored under the input.
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Parse current value (or today) into a Date used for grid centering.
  const initialAnchor = useMemo(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialAnchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialAnchor.getMonth());

  useEffect(() => {
    if (!open) return;
    setViewYear(initialAnchor.getFullYear());
    setViewMonth(initialAnchor.getMonth());
  }, [open, initialAnchor]);

  // Track the trigger's position for the portaled popover.
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (triggerRef.current)
        setRect(triggerRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  // Click-outside: check both the trigger and the portaled popover.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const today = useMemo(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }, []);

  const selected = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return { y, m: m - 1, d };
  }, [value]);

  // 6×7 grid: pad the first row with prior-month days, fill out to 42 cells.
  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out: Array<{ y: number; m: number; d: number; inMonth: boolean }> = [];
    // Prev-month tail
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = prevDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      out.push({ y, m, d: dayNum, inMonth: false });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      out.push({ y: viewYear, m: viewMonth, d: i, inMonth: true });
    }
    // Next-month head to reach 42
    let nextDay = 1;
    while (out.length < 42) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      out.push({ y, m, d: nextDay++, inMonth: false });
    }
    return out;
  }, [viewYear, viewMonth]);

  const stepMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const pick = (cell: { y: number; m: number; d: number }) => {
    const iso = `${cell.y}-${String(cell.m + 1).padStart(2, '0')}-${String(cell.d).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  };

  const buttonLabel = value
    ? (() => {
        const [y, m, d] = value.split('-').map(Number);
        return `${SHORT_MONTH_NAMES[m - 1]} ${d}, ${y}`;
      })()
    : 'Select date';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-base outline-none transition-colors ${
          value
            ? 'border-gray-200 text-black-dark hover:border-black/30'
            : 'border-gray-200 text-black-40 hover:border-black/30'
        }`}
      >
        <span className="flex items-center gap-2">
          <CalendarGlyph />
          <span className={value ? 'font-medium' : ''}>{buttonLabel}</span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && rect && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: rect.bottom + 4,
            right:
              typeof window !== 'undefined'
                ? Math.max(8, window.innerWidth - rect.right)
                : 8,
            zIndex: 10000,
          }}
          className="w-[300px] rounded-xl border border-black/10 bg-white p-3 shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => stepMonth(-1)}
              className="rounded-md p-1.5 text-black-60 hover:bg-gray-light hover:text-black-dark"
              aria-label="Previous month"
            >
              <ChevronLeftIcon />
            </button>
            <div className="text-sm font-semibold text-black-dark">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={() => stepMonth(1)}
              className="rounded-md p-1.5 text-black-60 hover:bg-gray-light hover:text-black-dark"
              aria-label="Next month"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAY_LABELS.map((w, i) => (
              <div
                key={i}
                className="text-center text-[11px] font-medium uppercase tracking-wide text-black-40"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, i) => {
              const isSelected =
                !!selected &&
                selected.y === cell.y &&
                selected.m === cell.m &&
                selected.d === cell.d;
              const isToday =
                today.y === cell.y && today.m === cell.m && today.d === cell.d;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(cell)}
                  className={`relative h-9 rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-8 font-semibold text-blue-light ring-1 ring-blue-light'
                      : cell.inMonth
                        ? 'text-black-dark hover:bg-gray-light'
                        : 'text-black-40 hover:bg-gray-light'
                  }`}
                >
                  {cell.d}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-light" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-black/8 pt-2">
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                pick({ y: t.getFullYear(), m: t.getMonth(), d: t.getDate() });
              }}
              className="rounded-md px-2 py-1 text-xs font-medium text-blue-light hover:bg-blue-8"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xs font-medium text-black-60 hover:bg-gray-light"
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-black-40"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}
