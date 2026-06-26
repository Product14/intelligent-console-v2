'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Check, MinusCircle, PlugZap } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import type { IntegrationsStatus } from '@/lib/settings/vini-status-mock';
import { PartnerLogo } from './partner-logo';

/** Body of the Integrations step row. One tile per capability so the reader
 *  sees *which* taps are open (or shut) at a glance. State is encoded with
 *  loud color treatment because a small chip is easy to miss on a scrolling
 *  status page — active tiles stay calm, anything not syncing carries a
 *  tinted background + thick left border so the eye lands on it.
 *
 *  Color logic — distinct because the actions differ:
 *  - Active            → subtle white card (the happy path, calm)
 *  - Inactive          → red (was connected, now broken — investigate)
 *  - Not connected     → amber (never set up — needs setup) */
export function IntegrationsGrid({ integrations }: { integrations: IntegrationsStatus }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[960px]:grid-cols-3">
      <Tile
        label="CRM"
        provider={integrations.crm.provider}
        logo={integrations.crm.logo}
        state={tileState(integrations.crm.status === 'active', integrations.crm.status === 'inactive')}
        lastSyncedAt={integrations.crm.lastSyncedAt}
      />
      <Tile
        label="IMS"
        provider={integrations.ims.provider}
        logo={integrations.ims.logo}
        state={tileState(integrations.ims.status === 'active', integrations.ims.status === 'inactive')}
        lastSyncedAt={integrations.ims.lastSyncedAt}
      />
      <Tile
        label="DMS"
        provider={integrations.dms.provider}
        logo={integrations.dms.logo}
        state={tileState(integrations.dms.status === 'active', integrations.dms.status === 'inactive')}
        lastSyncedAt={integrations.dms.lastSyncedAt}
      />
      <Tile
        label="Car History"
        provider={integrations.carHistory.provider}
        logo={integrations.carHistory.logo}
        state={integrations.carHistory.selected ? 'active' : 'not_connected'}
        lastSyncedAt={null}
        selectionOnly
      />
      <Tile
        label="Service Scheduler"
        provider={integrations.serviceScheduler.provider}
        logo={integrations.serviceScheduler.logo}
        state={tileState(
          integrations.serviceScheduler.status === 'active',
          integrations.serviceScheduler.status === 'inactive'
        )}
        lastSyncedAt={integrations.serviceScheduler.lastSyncedAt}
      />
    </div>
  );
}

type TileState = 'active' | 'inactive' | 'not_connected';

function tileState(active: boolean, inactive: boolean): TileState {
  if (active) return 'active';
  if (inactive) return 'inactive';
  return 'not_connected';
}

interface TileProps {
  label: string;
  provider: string | null;
  logo: string | null;
  state: TileState;
  lastSyncedAt: string | null;
  /** Car History has no sync — render "Selected" copy instead of timestamps. */
  selectionOnly?: boolean;
}

function Tile({ label, provider, logo, state, lastSyncedAt, selectionOnly }: TileProps) {
  if (state === 'not_connected') {
    return (
      <div
        className={cn(
          'flex flex-col justify-between gap-3 rounded-xl border border-reddish_orange/30 border-l-[5px] border-l-reddish_orange bg-reddish_orange-lightest px-4 py-3'
        )}
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-reddish_orange">
              {label}
            </div>
            <StatusBadge state="not_connected" />
          </div>
          <p className="mt-2 text-xs text-reddish_orange">
            {selectionOnly
              ? 'No vehicle-history provider selected.'
              : `Connect a ${label} to start syncing.`}
          </p>
        </div>
        <Link
          href="/max-2/settings/integrations/vini"
          prefetch
          className={cn(
            'inline-flex items-center justify-center gap-1 self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold',
            'bg-reddish_orange text-white transition-colors hover:opacity-90'
          )}
        >
          Setup
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (state === 'inactive') {
    return (
      <div
        className={cn(
          'flex flex-col justify-between gap-3 rounded-xl border border-red-warningRed/25 border-l-[5px] border-l-red-warningRed bg-red-lightest px-4 py-3'
        )}
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-red-warningRed">
              {label}
            </div>
            <StatusBadge state="inactive" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <PartnerLogo provider={provider} logo={logo} size={32} />
            <div className="min-w-0">
              <div
                className="truncate text-sm font-semibold text-black-dark"
                title={provider ?? undefined}
              >
                {provider ?? '—'}
              </div>
              <div className="text-[11px] text-red-warningRed">
                {lastSyncedAt
                  ? `Last synced ${formatRelative(lastSyncedAt)}`
                  : 'Never synced'}
              </div>
            </div>
          </div>
        </div>
        <Link
          href="/max-2/settings/integrations/vini"
          prefetch
          className={cn(
            'inline-flex items-center justify-center gap-1 self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold',
            'border border-red-warningRed text-red-warningRed transition-colors hover:bg-white'
          )}
        >
          Investigate
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-black/10 border-l-[5px] border-l-green bg-white px-4 py-3">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-black-40">
            {label}
          </div>
          <StatusBadge state="active" selectionOnly={selectionOnly} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <PartnerLogo provider={provider} logo={logo} size={32} />
          <div
            className="truncate text-sm font-semibold text-black-dark"
            title={provider ?? undefined}
          >
            {provider ?? '—'}
          </div>
        </div>
      </div>
      {selectionOnly ? (
        <div className="inline-flex items-center gap-1 text-[11px] text-black-40">
          <MinusCircle className="h-3 w-3" />
          Selection only · no sync timeline
        </div>
      ) : (
        <div className="text-[11px] text-black-40">
          {lastSyncedAt ? `Synced ${formatRelative(lastSyncedAt)}` : 'Never synced'}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  state,
  selectionOnly,
}: {
  state: TileState;
  selectionOnly?: boolean;
}) {
  if (state === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-lighter px-2 py-0.5 text-[11px] font-semibold text-green-darker">
        <Check className="h-3.5 w-3.5" />
        {selectionOnly ? 'Selected' : 'Syncing'}
      </span>
    );
  }
  if (state === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-warningRed px-2 py-0.5 text-[11px] font-semibold text-white">
        <AlertTriangle className="h-3.5 w-3.5" />
        Not syncing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-reddish_orange px-2 py-0.5 text-[11px] font-semibold text-white">
      <PlugZap className="h-3.5 w-3.5" />
      Not connected
    </span>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
