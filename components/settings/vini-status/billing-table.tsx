'use client';

import { Check, Clock, AlertTriangle } from 'lucide-react';
import type { BillingMonth, BillingMonthStatus } from '@/lib/settings/vini-status-mock';

/** Last-3-months billing history rendered as a compact table. Used as the
 *  body of the Billing step row. */
export function BillingTable({ rows }: { rows: BillingMonth[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-black/15 bg-gray-light/30 px-4 py-5 text-center">
        <div className="text-sm font-medium text-black-dark">No billing history yet</div>
        <p className="mt-1 text-xs text-black-60">
          Once the first invoice generates, the last three months will show here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="divide-y divide-black/8">
        {rows.map((row) => (
          <div
            key={row.month}
            className="grid grid-cols-[140px_1fr_auto] items-center gap-3 px-4 py-2.5 text-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-black-40">
              {row.month}
            </div>
            <div className="text-black-80">{row.amount}</div>
            <Pill status={row.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ status }: { status: BillingMonthStatus }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-lighter px-2 py-0.5 text-[11px] font-medium text-green-darker">
        <Check className="h-3 w-3" />
        Paid
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-8 px-2 py-0.5 text-[11px] font-medium text-blue-light">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-lightest px-2 py-0.5 text-[11px] font-medium text-red-warningRed">
      <AlertTriangle className="h-3 w-3" />
      Overdue
    </span>
  );
}
