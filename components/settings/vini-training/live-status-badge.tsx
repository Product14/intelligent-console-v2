'use client';

import { Check, X } from 'lucide-react';

/** Shared LIVE / NOT LIVE pill used across every channel and campaign card.
 *  NOT LIVE is bordered orange so it reads as actionable — the dashboard's
 *  whole purpose is to push the dealer toward enabling more sources. */
export function LiveStatusBadge({ status }: { status: 'live' | 'not_live' }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-green/30 bg-green-lighter px-1.5 py-0.5 text-[10px] font-semibold text-green">
        <Check className="h-3 w-3" />
        LIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-orange/50 bg-orange-light px-1.5 py-0.5 text-[10px] font-semibold text-orange">
      <X className="h-3 w-3" />
      NOT LIVE
    </span>
  );
}
