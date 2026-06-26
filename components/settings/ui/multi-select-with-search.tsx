'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { CheckboxList } from '@/components/settings/agents/policies/policy-form-bits';
import { cn } from '@/lib/settings/cn';

interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
  /** Additional text the search input matches against — useful when the
   *  display label is a short code (e.g. "AL") but the dealer expects to
   *  search by full name ("Alabama"). */
  searchText?: string;
}

interface MultiSelectWithSearchProps<T extends string> {
  values: T[];
  options: MultiSelectOption<T>[];
  onChange(next: T[]): void;
  disabled?: boolean;
  ariaLabel?: string;
  /** Grid layout for the checklist. Default flex-wrap. */
  columns?: number;
  searchPlaceholder?: string;
  /** Singular noun the count badge uses — e.g. "state", "make". */
  countNoun?: string;
}

/**
 * CheckboxList with a search filter, count badge, and Select-all / Clear
 * actions stacked above. Use for multi-selects with 15+ options where
 * scanning a flat grid becomes painful (US states, vehicle makes).
 *
 * Select-all selects every option matching the current search (or all
 * options when search is empty). Clear deselects every option.
 */
export function MultiSelectWithSearch<T extends string>({
  values,
  options,
  onChange,
  disabled,
  ariaLabel,
  columns,
  searchPlaceholder = 'Search',
  countNoun,
}: MultiSelectWithSearchProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const haystack = `${o.label} ${o.searchText ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [options, search]);

  const selectAll = () => {
    if (disabled) return;
    const toAdd = filtered.map((o) => o.value);
    onChange(Array.from(new Set([...values, ...toAdd])));
  };
  const clearAll = () => {
    if (disabled) return;
    if (!search.trim()) {
      onChange([]);
    } else {
      const removable = new Set(filtered.map((o) => o.value));
      onChange(values.filter((v) => !removable.has(v)));
    }
  };

  const totalLabel = countNoun
    ? `${values.length} of ${options.length} ${countNoun}${options.length === 1 ? '' : 's'} selected`
    : `${values.length} of ${options.length} selected`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-black-40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className="w-full bg-transparent text-sm text-black-80 outline-none placeholder:text-black-40 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="shrink-0 text-xs text-black-40">{totalLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled || filtered.length === 0}
            className={cn(
              'rounded-md border border-blue-light/30 px-2.5 py-1.5 font-medium text-blue-light transition-colors',
              'hover:bg-blue-2 disabled:opacity-50'
            )}
          >
            {search.trim() ? 'Select matching' : 'Select all'}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled || values.length === 0}
            className={cn(
              'rounded-md border border-black/10 px-2.5 py-1.5 font-medium text-black-60 transition-colors',
              'hover:bg-gray-8 disabled:opacity-50'
            )}
          >
            {search.trim() ? 'Clear matching' : 'Clear'}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 bg-gray-lighter/40 px-4 py-6 text-center text-xs text-black-60">
          No matches for “{search}”.
        </p>
      ) : (
        <CheckboxList
          values={values}
          options={filtered}
          onChange={onChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
          columns={columns}
        />
      )}
    </div>
  );
}
