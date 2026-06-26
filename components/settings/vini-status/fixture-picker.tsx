'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, FlaskConical, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { FloatingPanel } from '@/components/settings/ui/floating-panel';
import {
  DEFAULT_FIXTURE,
  FIXTURES,
  FIXTURE_ANCHOR_DATE,
  FIXTURE_ORDER,
  type FixtureKey,
} from '@/lib/settings/vini-status-fixtures';

/** Floating dev pill — bottom-right, visible only in standalone preview (not
 *  in the Console iframe). Switches `?fixture=`, `?loading=`, and `?today=`
 *  via router.replace so the URL stays shareable. */
export function FixturePicker() {
  const router = useRouter();
  const params = useSearchParams();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [standalone, setStandalone] = useState(false);

  // Mirrors the detection in app/settings/layout.tsx — render the picker
  // only when there's no Console parent owning the chrome.
  useEffect(() => {
    setStandalone(detectStandalone());
  }, []);

  if (!standalone) return null;

  const activeKey: FixtureKey =
    (params?.get('fixture') as FixtureKey) in FIXTURES
      ? (params!.get('fixture') as FixtureKey)
      : DEFAULT_FIXTURE;
  const loading = params?.get('loading') === '1';
  const today = params?.get('today') ?? '';

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params?.toString() ?? '');
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  const activeMeta = FIXTURES[activeKey];

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-lg transition-colors',
          'border-blue-light/30 text-blue-light hover:bg-blue-2',
          open && 'bg-blue-2'
        )}
        aria-label="Open fixture picker"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        <span>Fixture:</span>
        <span className="font-semibold text-black-dark">{activeMeta.label}</span>
        {loading && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-light/10 px-1.5 py-0.5 text-[10px] text-blue-light">
            <Loader2 className="h-3 w-3 animate-spin" />
            loading
          </span>
        )}
      </button>

      <FloatingPanel
        anchorRef={anchorRef}
        open={open}
        onClose={() => setOpen(false)}
        placement="bottom-end"
        width={320}
        className="rounded-xl border border-black/10 bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-black/8 px-4 py-2.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-black-60">
            Dev — Fixture Picker
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-black-40 hover:bg-gray-8 hover:text-black-80"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <ul className="max-h-72 overflow-y-auto py-1">
          {FIXTURE_ORDER.map((key) => {
            const meta = FIXTURES[key];
            const active = key === activeKey;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    updateParam('fixture', key);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-start gap-2 px-4 py-2 text-left transition-colors',
                    active ? 'bg-blue-2' : 'hover:bg-gray-8'
                  )}
                >
                  <Check
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0',
                      active ? 'text-blue-light' : 'opacity-0'
                    )}
                  />
                  <div className="min-w-0">
                    <div
                      className={cn(
                        'text-sm',
                        active ? 'font-semibold text-black-dark' : 'text-black-80'
                      )}
                    >
                      {meta.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-black-60">
                      {meta.description}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-black/8 px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-black-40">
            Utility overrides
          </div>

          <label className="mt-2 flex items-center justify-between gap-3 text-xs">
            <span className="text-black-80">Force loading skeleton</span>
            <input
              type="checkbox"
              checked={loading}
              onChange={(e) => updateParam('loading', e.target.checked ? '1' : null)}
              className="h-4 w-4 accent-blue-light"
            />
          </label>

          <label className="mt-2 block text-xs">
            <span className="text-black-80">Override “today”</span>
            <input
              type="text"
              value={today}
              onChange={(e) => updateParam('today', e.target.value || null)}
              placeholder={`anchor: ${FIXTURE_ANCHOR_DATE}`}
              className="mt-1 block w-full rounded-md border border-black/15 px-2 py-1 text-xs text-black-80 placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
            <span className="mt-1 block text-[10px] text-black-40">
              Format YYYY-MM-DD. Empty = use real today.
            </span>
          </label>

          <button
            type="button"
            onClick={() => {
              router.replace('?', { scroll: false });
              setOpen(false);
            }}
            className="mt-3 w-full rounded-md border border-black/10 bg-gray-light px-2 py-1 text-xs font-medium text-black-80 hover:bg-gray-8"
          >
            Reset everything
          </button>
        </div>
      </FloatingPanel>
    </>
  );
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const flag = params.get('standalone');
  if (flag === '1') return true;
  if (flag === '0') return false;
  try {
    return window.top === window.self;
  } catch {
    return false;
  }
}
