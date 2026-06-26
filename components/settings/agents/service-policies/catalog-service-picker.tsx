'use client';

import { MultiSelectWithSearch } from '@/components/settings/ui/multi-select-with-search';
import type { ServiceCatalogEntry } from '@/types/settings/service-policies';

interface Props {
  /** All services from the Service Catalog card. */
  catalog: ServiceCatalogEntry[];
  values: string[];
  onChange(next: string[]): void;
  ariaLabel?: string;
  searchPlaceholder?: string;
}

/**
 * Multi-select bound to the Service Catalog entries. Renders an empty-state
 * hint when the catalog is empty so the dealer knows to populate it first.
 */
export function CatalogServicePicker({
  catalog,
  values,
  onChange,
  ariaLabel,
  searchPlaceholder = 'Search services',
}: Props) {
  if (catalog.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/15 bg-gray-lighter/40 px-4 py-4 text-center text-xs text-black-60">
        Add services in the Service Catalog card first to enable per-service selection.
      </p>
    );
  }

  return (
    <MultiSelectWithSearch
      values={values}
      options={catalog.map((s) => ({
        value: s.id,
        label: s.name || s.opCode || '(unnamed service)',
        searchText: `${s.opCode} ${s.description ?? ''}`,
      }))}
      onChange={onChange}
      ariaLabel={ariaLabel}
      searchPlaceholder={searchPlaceholder}
      countNoun="service"
    />
  );
}
