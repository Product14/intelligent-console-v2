'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleSlash, X } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

interface RejectModalProps {
  open: boolean;
  /** Label of the agent being rejected, e.g. "Sales · Inbound". */
  agentLabel: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const REASON_MAX = 240;

/** Captures a required textual reason before bouncing an agent's handover
 *  back to Sales. Reason gets pushed onto the agent's rejectionHistory and
 *  surfaces inline on the pre_handover body. */
export function RejectModal({ open, agentLabel, onConfirm, onClose }: RejectModalProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= 3;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-black-dark">Reject handover · {agentLabel}</h2>
            <p className="mt-0.5 text-xs text-black-60">
              Sales will see this reason inline on the agent row. Be specific.
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
          <label className="block text-xs font-medium text-black-80">
            Reason <span className="text-red">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
            rows={5}
            autoFocus
            placeholder="What needs to change before OB can accept this agent?"
            className="block w-full rounded-md border border-black/15 px-3 py-2 text-sm text-black-80 placeholder:text-black-40 focus:border-blue-light focus:outline-none focus:ring-2 focus:ring-blue-12"
          />
          <div className="flex items-center justify-between text-[11px] text-black-40">
            <span>Min 3 characters.</span>
            <span>{reason.length}/{REASON_MAX}</span>
          </div>
        </div>

        <div className="shrink-0 border-t border-black/10 px-6 py-4">
          <div className="flex items-center justify-end gap-2">
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
                onConfirm(trimmed);
                onClose();
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
                canSubmit
                  ? 'bg-red-warningRed text-white hover:opacity-90'
                  : 'cursor-not-allowed bg-red-warningRed/40 text-white'
              )}
            >
              <CircleSlash className="h-4 w-4" />
              Reject handover
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
