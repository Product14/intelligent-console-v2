'use client';

import React from 'react';
import { Check, Clock, AlertCircle, RefreshCw, Sparkles, Link2 } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

export type StatusKind =
  | 'connected'
  | 'pending'
  | 'failed'
  | 'syncing'
  | 'not_connected'
  | 'confirmed'
  | 'ai_prefilled'
  | 'from_integration'
  | 'requested';

const MAP: Record<StatusKind, { label: string; cls: string; icon: React.ReactNode }> = {
  connected: { label: 'Connected', cls: 'bg-green-lighter text-green-darker', icon: <Check className="h-3 w-3" /> },
  confirmed: { label: 'Confirmed', cls: 'bg-green-lighter text-green-darker', icon: <Check className="h-3 w-3" /> },
  pending: { label: 'Pending', cls: 'bg-unpaidMarkerBg text-unpaidMarkerText', icon: <Clock className="h-3 w-3" /> },
  requested: { label: 'Requested', cls: 'bg-statusBg text-statusText', icon: <Clock className="h-3 w-3" /> },
  failed: { label: 'Failed', cls: 'bg-red-lightest text-red-warningRed', icon: <AlertCircle className="h-3 w-3" /> },
  syncing: { label: 'Syncing', cls: 'bg-blue-8 text-blue-light', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
  not_connected: { label: 'Not connected', cls: 'bg-gray-8 text-black-40', icon: <Link2 className="h-3 w-3" /> },
  ai_prefilled: { label: 'AI-filled · confirm', cls: 'bg-blue-2 text-blue-light', icon: <Sparkles className="h-3 w-3" /> },
  from_integration: { label: 'From integration', cls: 'bg-blue-2 text-blue-light', icon: <Link2 className="h-3 w-3" /> },
};

export function StatusChip({ kind, label }: { kind: StatusKind; label?: string }) {
  const s = MAP[kind];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        s.cls
      )}
    >
      {s.icon}
      {label || s.label}
    </span>
  );
}
