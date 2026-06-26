'use client';

import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PolicyCard } from '@/components/settings/agents/policies/policy-card';
import { FormRow } from '@/components/settings/agents/policies/policy-form-bits';
import { validateServiceCatalog } from '@/lib/settings/service-policies-validation';
import { cn } from '@/lib/settings/cn';
import type { ServiceCatalogEntry, ServiceCatalogPolicy } from '@/types/settings/service-policies';

interface Props {
  value: ServiceCatalogPolicy;
  onChange(next: ServiceCatalogPolicy): void;
}

function makeEmptyRow(): ServiceCatalogEntry {
  return {
    id: `svc-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
    opCode: '',
    name: '',
    description: '',
    price: null,
  };
}

const rowFieldClasses = cn(
  'h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-black-80 outline-none transition-colors',
  'focus:border-blue-light focus:ring-2 focus:ring-blue-12'
);

export function ServiceCatalogCard({ value, onChange }: Props) {
  const errors = useMemo(() => validateServiceCatalog(value), [value]);
  const rowErrors = errors?.rows ?? {};

  const updateRow = (id: string, patch: Partial<ServiceCatalogEntry>) => {
    onChange({
      services: value.services.map((row) =>
        row.id === id ? { ...row, ...patch } : row
      ),
    });
  };
  const removeRow = (id: string) => {
    onChange({ services: value.services.filter((row) => row.id !== id) });
  };
  const addRow = () => onChange({ services: [...value.services, makeEmptyRow()] });

  return (
    <PolicyCard
      title="Service catalog"
      description="The list of named services the agent can quote. Add op code, name, optional description, and a price."
      status={value.services.length > 0 ? 'enabled' : 'all_off'}
    >
      <FormRow
        label="Services"
        fullWidthControl
        info="The agent reads the name and price when callers ask about a specific service. Op codes are used for CRM/DMS sync. Leave price blank if it varies and the team should be looped in."
        control={
          <div className="space-y-2">
            {value.services.length === 0 && (
              <p className="rounded-lg border border-dashed border-black/15 bg-gray-lighter/40 px-4 py-6 text-center text-xs text-black-60">
                No services in the catalog yet. Add a row for each service this rooftop offers.
              </p>
            )}

            {value.services.length > 0 && (
              <div className="hidden grid-cols-[120px_1fr_1fr_120px_40px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-black-40 md:grid">
                <span>Op code</span>
                <span>Service name</span>
                <span>Description</span>
                <span>Price</span>
                <span aria-hidden />
              </div>
            )}

            {value.services.map((row) => {
              const err = rowErrors[row.id] ?? {};
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 md:grid-cols-[120px_1fr_1fr_120px_40px] md:items-start"
                >
                  <div>
                    <input
                      type="text"
                      value={row.opCode}
                      placeholder="e.g. LOF-01"
                      onChange={(e) => updateRow(row.id, { opCode: e.target.value })}
                      className={cn(rowFieldClasses, 'w-full', err.opCode && 'border-red')}
                      aria-invalid={!!err.opCode}
                    />
                    {err.opCode && (
                      <p className="mt-0.5 text-[11px] text-red">{err.opCode}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={row.name}
                      placeholder="e.g. Oil change"
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      className={cn(rowFieldClasses, 'w-full', err.name && 'border-red')}
                      aria-invalid={!!err.name}
                    />
                    {err.name && (
                      <p className="mt-0.5 text-[11px] text-red">{err.name}</p>
                    )}
                  </div>
                  <input
                    type="text"
                    value={row.description ?? ''}
                    placeholder="What's included (optional)"
                    onChange={(e) => updateRow(row.id, { description: e.target.value })}
                    className={cn(rowFieldClasses, 'w-full')}
                  />
                  <div className="relative">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black-40"
                    >
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.price === null ? '' : row.price}
                      placeholder="—"
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateRow(row.id, { price: raw === '' ? null : Number(raw) });
                      }}
                      className={cn(rowFieldClasses, 'w-full pl-6')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-lg border border-black/10 text-black-40 transition-colors hover:border-red/30 hover:text-red"
                    aria-label="Remove service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-light/30 px-3 py-2 text-sm font-medium text-blue-light transition-colors hover:bg-blue-2"
            >
              <Plus className="h-4 w-4" />
              Add service
            </button>
          </div>
        }
      />
    </PolicyCard>
  );
}
