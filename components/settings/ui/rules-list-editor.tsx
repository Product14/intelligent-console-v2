'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

interface RulesListEditorProps {
  values: string[];
  onChange(next: string[]): void;
  placeholder?: string;
  /** Label on the Add button. Default "Add rule". */
  addLabel?: string;
  /** Hint shown when the list is empty. Default "No rules added yet." */
  emptyLabel?: string;
  disabled?: boolean;
}

/**
 * Repeatable list editor for rules / notes / instructions. Each row is a
 * single-line text input + delete button; an "Add" button appends a fresh
 * empty row. Replaces the single-textbox pattern wherever a dealer might
 * want to capture several discrete items.
 */
export function RulesListEditor({
  values,
  onChange,
  placeholder,
  addLabel = 'Add rule',
  emptyLabel = 'No rules added yet.',
  disabled,
}: RulesListEditorProps) {
  const updateRow = (idx: number, next: string) => {
    const out = values.slice();
    out[idx] = next;
    onChange(out);
  };
  const removeRow = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const addRow = () => onChange([...values, '']);

  return (
    <div className="space-y-2">
      {values.length === 0 && (
        <p className="rounded-lg border border-dashed border-black/15 bg-gray-lighter/40 px-4 py-4 text-center text-xs text-black-60">
          {emptyLabel}
        </p>
      )}
      {values.map((row, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2"
        >
          <input
            type="text"
            value={row}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => updateRow(idx, e.target.value)}
            className={cn(
              'h-9 w-full flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm text-black-80 outline-none transition-colors',
              'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
          <button
            type="button"
            onClick={() => removeRow(idx)}
            disabled={disabled}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 text-black-40 transition-colors hover:border-red/30 hover:text-red disabled:opacity-50"
            aria-label="Remove row"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-light/30 px-3 py-2 text-sm font-medium text-blue-light transition-colors hover:bg-blue-2 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
