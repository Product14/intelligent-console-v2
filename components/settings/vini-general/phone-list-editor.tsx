'use client';

import { Plus, Trash2 } from 'lucide-react';
import { PhoneNumberField } from '@/components/settings/ui/phone-number-field';
import type { TriggerPhoneNumber } from '@/types/settings/vini-general-config';

interface Props {
  values: TriggerPhoneNumber[];
  onChange(next: TriggerPhoneNumber[]): void;
}

function makeEmptyRow(): TriggerPhoneNumber {
  return {
    id: `tn-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
    countryCode: '+1',
    phone: '',
  };
}

export function PhoneListEditor({ values, onChange }: Props) {
  const updateRow = (id: string, patch: Partial<TriggerPhoneNumber>) => {
    onChange(values.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };
  const removeRow = (id: string) => {
    onChange(values.filter((row) => row.id !== id));
  };
  const addRow = () => onChange([...values, makeEmptyRow()]);

  return (
    <div className="space-y-2">
      {values.length === 0 && (
        <p className="rounded-lg border border-dashed border-black/15 bg-gray-lighter/40 px-4 py-6 text-center text-xs text-black-60">
          No numbers added yet. Add one or more caller-IDs that should trigger
          the mobile-ask behavior.
        </p>
      )}
      {values.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border border-black/10 bg-white px-3 py-2"
        >
          <PhoneNumberField
            countryCode={row.countryCode}
            phone={row.phone}
            onChange={(next) => updateRow(row.id, next)}
            size="sm"
            trailing={
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 text-black-40 transition-colors hover:border-red/30 hover:text-red"
                aria-label="Remove number"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            }
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-light/30 px-3 py-2 text-sm font-medium text-blue-light transition-colors hover:bg-blue-2"
      >
        <Plus className="h-4 w-4" />
        Add number
      </button>
    </div>
  );
}
