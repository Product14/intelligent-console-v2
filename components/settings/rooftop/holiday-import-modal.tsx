'use client';

/**
 * Bulk-import standard holidays for the rooftop. Operator picks a country
 * and a year, ticks the holidays they want, and clicks Import. Each ticked
 * row becomes a HolidayConfig with sensible defaults (appliesToAll=true,
 * isFullDay=true). Already-imported entries (by name+date match against the
 * existing list) show a disabled "Already added" row so we don't create
 * duplicates on re-import.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import { Check } from 'lucide-react';
import type { HolidayConfig } from '@/services/settings/types';
import { DsButton } from '@/components/settings/ds';
import {
  SUPPORTED_COUNTRIES,
  getAvailableYears,
  getHolidaysFor,
  type PredefinedHoliday,
} from '@/lib/settings/predefined-holidays';
import { cn } from '@/lib/settings/cn';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Format "2026-12-25" as "Fri, Dec 25, 2026". */
function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const weekday = WEEKDAY_NAMES[date.getDay()];
  const month = MONTH_NAMES[Number(m) - 1];
  return `${weekday}, ${month} ${parseInt(d, 10)}, ${y}`;
}

/** Name-only dedup key. We previously included the date in the key, but
 *  the product rule is "names are unique" — two holidays with the same
 *  name (even on different dates) is not allowed. */
function matchKey(name: string): string {
  return name.trim().toLowerCase();
}

interface HolidayImportModalProps {
  /** Existing holidays — used to mark dupes as already added. */
  existing: HolidayConfig[];
  onClose: () => void;
  onImport: (holidays: HolidayConfig[]) => void;
  /** Optional escape hatch — switches the user from the standard list into
   *  the single-entry custom add flow. */
  onAddCustom?: () => void;
}

export function HolidayImportModal({
  existing,
  onClose,
  onImport,
  onAddCustom,
}: HolidayImportModalProps) {
  const [country, setCountry] = useState(SUPPORTED_COUNTRIES[0]?.code ?? 'US');
  const years = useMemo(() => getAvailableYears(country), [country]);
  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());

  // Reset year when country changes (in case its years differ).
  useEffect(() => {
    if (!years.includes(year)) setYear(years[0] ?? year);
  }, [country, years, year]);

  const holidays = useMemo(() => getHolidaysFor(country, year), [country, year]);

  const existingKeys = useMemo(
    () => new Set(existing.map((h) => matchKey(h.name))),
    [existing]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selection when country/year changes.
  useEffect(() => {
    setSelected(new Set());
  }, [country, year]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const importableHolidays = holidays.filter(
    (h) => !existingKeys.has(matchKey(h.name))
  );
  const allSelectable = importableHolidays.length > 0 && importableHolidays.every((h) => selected.has(h.key));
  const toggleAll = () => {
    if (allSelectable) {
      setSelected(new Set());
    } else {
      setSelected(new Set(importableHolidays.map((h) => h.key)));
    }
  };

  const handleImport = () => {
    const toAdd: HolidayConfig[] = holidays
      .filter((h) => selected.has(h.key))
      .filter((h) => !existingKeys.has(matchKey(h.name)))
      .map((h) => predefinedToConfig(h));
    if (toAdd.length === 0) {
      onClose();
      return;
    }
    onImport(toAdd);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-neutral-950">Add Holiday</h2>
            <p className="text-sm text-gray-500">
              Pick the standard holidays you want to add.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="shrink-0 border-b border-black/10 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-black-60">Country</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-9 rounded-md border border-black/15 bg-white px-2 text-sm text-black-dark focus:border-blue-light focus:outline-none"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-black-60">Year</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-9 rounded-md border border-black/15 bg-white px-2 text-sm text-black-dark focus:border-blue-light focus:outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            {importableHolidays.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="ml-auto text-xs font-medium text-blue-light hover:underline"
              >
                {allSelectable ? 'Clear selection' : 'Select all'}
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
          {holidays.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/15 px-4 py-8 text-center text-sm text-black-60">
              No predefined holidays for this selection yet.
            </div>
          ) : (
            <ul className="space-y-1">
              {holidays.map((h) => {
                const alreadyAdded = existingKeys.has(matchKey(h.name));
                const isSelected = selected.has(h.key);
                return (
                  <li key={h.key}>
                    <button
                      type="button"
                      onClick={() => !alreadyAdded && toggle(h.key)}
                      disabled={alreadyAdded}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                        alreadyAdded
                          ? 'cursor-not-allowed border-black/8 bg-gray-light/40 opacity-60'
                          : isSelected
                            ? 'border-blue-light bg-blue-2'
                            : 'border-black/10 bg-white hover:border-black/20'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                          alreadyAdded
                            ? 'border-black/15 bg-white'
                            : isSelected
                              ? 'border-blue-light bg-blue-light text-white'
                              : 'border-black/20 bg-white'
                        )}
                      >
                        {(alreadyAdded || isSelected) && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-black-dark">
                          {h.name}
                        </div>
                        <div className="mt-0.5 text-xs text-black-60">
                          {formatDateLong(h.date)}
                          {h.recurrence === 'yearly' && (
                            <span className="ml-2 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                              Yearly
                            </span>
                          )}
                        </div>
                      </div>
                      {alreadyAdded && (
                        <span className="shrink-0 text-xs font-medium text-black-40">
                          Already added
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-black/10 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            {onAddCustom ? (
              <button
                type="button"
                onClick={onAddCustom}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-black/20 bg-white px-3 text-sm font-semibold text-black-dark shadow-sm hover:border-black/30 hover:bg-gray-light"
              >
                <span className="text-base leading-none">+</span>
                Add a custom holiday
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              {selected.size > 0 && (
                <span className="text-xs text-black-60">
                  {selected.size} selected
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm font-medium text-black-60 hover:bg-gray-light"
              >
                Cancel
              </button>
              <DsButton
                label={selected.size > 0 ? `Add ${selected.size}` : 'Add'}
                type="primary"
                size="AA"
                disabled={selected.size === 0}
                onClick={handleImport}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function predefinedToConfig(h: PredefinedHoliday): HolidayConfig {
  return {
    id: `${h.key}-${Date.now()}`,
    name: h.name,
    date: h.date,
    appliesToAll: true,
    departmentIds: [],
    recurrence: h.recurrence,
    isFullDay: true,
    startTime: '09:00',
    endTime: '18:00',
  };
}
