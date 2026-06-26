'use client';

import { Lock } from 'lucide-react';

/** Semi-transparent scrim rendered over rooftop-level steps when no agent
 *  has reached implementation yet. The steps are still visible underneath
 *  so the reader can see what's coming, but they can't interact. */
export function LockedStepsOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-start justify-center pt-8">
        <div className="flex items-center gap-2 rounded-full border border-blue-light/30 bg-white px-3 py-1.5 text-xs font-medium text-blue-light shadow-sm">
          <Lock className="h-3.5 w-3.5" />
          Rooftop setup unlocks once an agent's handover is accepted
        </div>
      </div>
    </div>
  );
}
