'use client';

import { Check, GitCompare, Globe, RefreshCw } from 'lucide-react';
import { DsButton } from '@/components/settings/ds';
import type { WebsiteSyncConfig } from '@/lib/settings/reception-knowledge-fixtures';

interface WebsiteSyncSectionProps {
  config: WebsiteSyncConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebsiteSyncConfig>>;
}

export function WebsiteSyncSection({ config, setConfig }: WebsiteSyncSectionProps) {
  const syncNow = () => {
    setConfig((prev) => ({
      ...prev,
      lastSyncedAt: 'Just now',
      pagesPending: 0,
      status: 'healthy',
    }));
  };

  const approveAll = () => {
    setConfig((prev) => ({
      ...prev,
      pagesIngested: prev.pagesIngested + prev.pagesPending,
      pagesPending: 0,
      status: 'healthy',
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-black/8 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-light/10 text-blue-light">
            <Globe className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-black-dark">Website sync</h3>
            <p className="mb-3 mt-1 text-xs text-black-60">
              Auto-pulls from your dealership website daily. The agent uses About, Services, Hours,
              and Contact pages as canonical sources.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={config.url}
                readOnly
                className="min-w-[240px] flex-1 rounded-lg border border-black/10 bg-gray-lighter px-3 py-2 font-mono text-sm text-black-dark focus:border-blue-light focus:outline-none"
              />
              <DsButton
                label="Sync now"
                type="bordered"
                size="AA"
                onClick={syncNow}
                icon={<RefreshCw className="h-3.5 w-3.5" />}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Last sync" value={config.lastSyncedAt} />
        <StatCard label="Pages ingested" value={config.pagesIngested.toString()} />
        <StatCard
          label="Pending changes"
          value={config.pagesPending.toString()}
          highlight={config.pagesPending > 0}
        />
      </div>

      {config.pagesPending > 0 && (
        <div className="rounded-2xl border border-blue-light/30 bg-blue-light/5 p-5">
          <div className="flex items-start gap-3">
            <GitCompare className="mt-0.5 h-5 w-5 shrink-0 text-blue-light" />
            <div className="flex-1">
              <div className="mb-1 text-sm font-semibold text-black-dark">
                {config.pagesPending} pages have changes since last sync
              </div>
              <ul className="space-y-1 text-xs text-black-60">
                <li>
                  • <strong>/services</strong> — pricing for detailing updated · 3 lines changed
                </li>
                <li>
                  • <strong>/specials</strong> — new Memorial Day banner added
                </li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <DsButton
                  label="Approve all changes"
                  type="primary"
                  size="AA"
                  onClick={approveAll}
                  icon={<Check className="h-3.5 w-3.5" />}
                />
                <DsButton
                  label="Review individually"
                  type="bordered"
                  size="AA"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-black-60">{label}</div>
      <div
        className={
          highlight
            ? 'mt-1 text-lg font-bold tabular-nums text-blue-light'
            : 'mt-1 text-lg font-bold tabular-nums text-black-dark'
        }
      >
        {value}
      </div>
    </div>
  );
}
