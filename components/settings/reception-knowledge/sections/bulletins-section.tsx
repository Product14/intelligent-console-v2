'use client';

import { useState } from 'react';
import { BellRing, Send, X } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { DsButton } from '@/components/settings/ds';
import type { BulletinItem } from '@/lib/settings/reception-knowledge-fixtures';

const EXPIRATION_OPTIONS = [
  { label: 'Auto · 24 hours', code: 'Auto · 24 hours' },
  { label: 'Auto · 7 days', code: 'Auto · 7 days' },
  { label: 'Auto · 30 days', code: 'Auto · 30 days' },
  { label: 'Until manually removed', code: 'Manual' },
];

interface BulletinsSectionProps {
  items: BulletinItem[];
  setItems: React.Dispatch<React.SetStateAction<BulletinItem[]>>;
}

export function BulletinsSection({ items, setItems }: BulletinsSectionProps) {
  const [draft, setDraft] = useState('');
  const [expires, setExpires] = useState(EXPIRATION_OPTIONS[1].code);

  const post = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setItems((prev) => [
      {
        id: `b-${Date.now()}`,
        message: trimmed,
        expiresAt: expires,
        postedBy: 'You',
        postedAt: 'Just now',
        active: true,
      },
      ...prev,
    ]);
    setDraft('');
  };

  const dismiss = (id: string) =>
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, active: false } : b)));

  const remove = (id: string) => setItems((prev) => prev.filter((b) => b.id !== id));

  const activeCount = items.filter((b) => b.active).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-black/8 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <BellRing className="h-4 w-4 text-blue-light" />
          <h3 className="text-sm font-semibold text-black-dark">Post a bulletin</h3>
        </div>
        <p className="mb-3 text-xs text-black-60">
          One-off override — &ldquo;closing early today,&rdquo; &ldquo;recall just announced,&rdquo;
          &ldquo;parking lot under construction.&rdquo; Bulletins take priority over all other
          knowledge while active.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && post()}
            placeholder="e.g. Closing at 4pm today for staff training…"
            className="min-w-[200px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
          />
          <select
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
          >
            {EXPIRATION_OPTIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
          <DsButton
            label="Post"
            type="primary"
            size="AA"
            onClick={post}
            icon={<Send className="h-3.5 w-3.5" />}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
        <div className="border-b border-black/8 px-5 py-3">
          <h3 className="text-sm font-semibold text-black-dark">
            Active bulletins{' '}
            <span className="font-normal text-black-60">· {activeCount}</span>
          </h3>
        </div>
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-black-40">No bulletins active.</div>
        ) : (
          items.map((b) => (
            <div
              key={b.id}
              className={cn(
                'flex items-start gap-3 border-b border-black/8 px-5 py-3.5 last:border-b-0',
                !b.active && 'opacity-50'
              )}
            >
              <span
                className={cn(
                  'mt-2 inline-block h-2 w-2 shrink-0 rounded-full',
                  b.active ? 'animate-pulse bg-blue-light' : 'bg-black/30'
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-relaxed text-black-dark">{b.message}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-black-60">
                  <span>
                    {b.postedBy} · {b.postedAt}
                  </span>
                  <span>· Expires {b.expiresAt}</span>
                  {!b.active && (
                    <span className="inline-block rounded-md bg-black/5 px-2 py-0.5 font-semibold text-black-60">
                      Dismissed
                    </span>
                  )}
                </div>
              </div>
              {b.active && (
                <button
                  type="button"
                  onClick={() => dismiss(b.id)}
                  className="text-[11px] font-semibold text-black-60 hover:text-black-dark"
                >
                  Dismiss
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(b.id)}
                aria-label="Remove bulletin"
                className="text-black-40 transition-colors hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
