'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

export interface TransferTarget {
  /** Unique key — agentLifecycleKey(type, callType). */
  key: string;
  /** Human label, e.g. "Sales · Inbound". */
  label: string;
}

interface TransferToObModalProps {
  open: boolean;
  /** Agents currently in pre_handover that can be included in this transfer. */
  targets: TransferTarget[];
  onConfirm: (selectedKeys: string[]) => void;
  onClose: () => void;
}

/** Multi-select modal for sending pre_handover agents to OB.
 *
 *  - Defaults to all targets selected (the common case is "transfer
 *    everything I just captured"). Operator opts out by unchecking.
 *  - Requires at least one selection.
 *  - Portaled to document.body so it escapes parent overflow clipping. */
export function TransferToObModal({ open, targets, onConfirm, onClose }: TransferToObModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selection to "all" each time the modal opens.
  useEffect(() => {
    if (open) setSelected(new Set(targets.map((t) => t.key)));
  }, [open, targets]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const canSubmit = selected.size > 0;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-black-dark">Transfer to OB</h2>
            <p className="mt-0.5 text-xs text-black-60">
              Pick the agents to include in this handover batch.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-black-40 hover:bg-gray-8 hover:text-black-80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-6 py-4">
          {targets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-black/15 bg-gray-light/30 px-4 py-6 text-center">
              <div className="text-sm font-medium text-black-dark">No agents pending handover</div>
              <p className="mt-1 text-xs text-black-60">
                All contracted agents have already been transferred to OB.
              </p>
            </div>
          ) : (
            targets.map((t) => {
              const checked = selected.has(t.key);
              return (
                <label
                  key={t.key}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                    checked
                      ? 'border-blue-light bg-blue-2'
                      : 'border-black/10 bg-white hover:border-black/30'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(t.key)}
                    className="h-4 w-4 accent-blue-light"
                  />
                  <span className={cn('flex-1 text-sm', checked ? 'font-semibold text-black-dark' : 'text-black-80')}>
                    {t.label}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <div className="shrink-0 border-t border-black/10 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-black-60">
              {selected.size === 0 ? 'Select at least one agent' : `${selected.size} selected`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-3 py-2 text-sm font-medium text-black-60 hover:bg-gray-8"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  onConfirm(Array.from(selected));
                  onClose();
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
                  canSubmit
                    ? 'bg-blue-light text-white hover:opacity-90'
                    : 'cursor-not-allowed bg-blue-light/40 text-white'
                )}
              >
                <Send className="h-4 w-4" />
                Transfer {selected.size > 0 ? `${selected.size} agent${selected.size > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
