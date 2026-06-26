'use client';

import { useState } from 'react';
import {
  Bolt,
  Building,
  Compass,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sparkle,
  Trash2,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { DsButton } from '@/components/settings/ds';
import {
  QUICK_FACT_CATEGORIES,
  type QuickFact,
  type QuickFactCategory,
} from '@/lib/settings/reception-knowledge-fixtures';

const CATEGORY_ICON: Record<QuickFactCategory, LucideIcon> = {
  amenities: Building,
  policies: ShieldCheck,
  services: Wrench,
  directions: Compass,
  other: MoreHorizontal,
};

interface QuickFactsSectionProps {
  items: QuickFact[];
  setItems: React.Dispatch<React.SetStateAction<QuickFact[]>>;
}

export function QuickFactsSection({ items, setItems }: QuickFactsSectionProps) {
  const [filter, setFilter] = useState<QuickFactCategory | 'all'>('all');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<QuickFactCategory>('amenities');

  const filtered = filter === 'all' ? items : items.filter((f) => f.category === filter);

  const addFact = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setItems((prev) => [
      {
        id: `qf-${Date.now()}`,
        category,
        text: trimmed,
        addedBy: 'You',
        addedAt: 'Just now',
        timesReferenced: 0,
      },
      ...prev,
    ]);
    setText('');
  };

  const removeFact = (id: string) => setItems((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-black/8 bg-white p-5">
        <div className="mb-2 flex items-center gap-2">
          <Bolt className="h-4 w-4 text-blue-light" />
          <h3 className="text-sm font-semibold text-black-dark">Add a quick fact</h3>
        </div>
        <p className="mb-3 text-xs text-black-60">
          Anything a great human receptionist would just &ldquo;know.&rdquo; The agent uses these as
          background context on every call.
        </p>
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as QuickFactCategory)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
          >
            {QUICK_FACT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFact()}
            placeholder="e.g. We have free Starbucks coffee in the lounge…"
            className="min-w-[200px] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm focus:border-blue-light focus:outline-none"
          />
          <DsButton label="Add fact" type="primary" size="AA" onClick={addFact} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
        <div className="flex flex-wrap items-center gap-4 border-b border-black/8 px-5 py-3">
          <h3 className="flex-1 text-sm font-semibold text-black-dark">
            All quick facts{' '}
            <span className="font-normal text-black-60">· {items.length}</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              label="All"
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              count={items.length}
            />
            {QUICK_FACT_CATEGORIES.map((c) => (
              <FilterChip
                key={c.id}
                label={c.label}
                active={filter === c.id}
                onClick={() => setFilter(c.id)}
                count={items.filter((f) => f.category === c.id).length}
              />
            ))}
          </div>
        </div>

        <div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-black-40">
              No facts in this category yet.
            </div>
          ) : (
            filtered.map((f) => {
              const Icon = CATEGORY_ICON[f.category];
              return (
                <div
                  key={f.id}
                  className="group flex items-start gap-3 border-b border-black/8 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-gray-lighter/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-light/10 text-blue-light">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-relaxed text-black-dark">{f.text}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-black-60">
                      <span>
                        {f.addedBy} · {f.addedAt}
                      </span>
                      {f.timesReferenced > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <TrendingUp className="h-3 w-3" />
                          Referenced {f.timesReferenced}× in 30d
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFact(f.id)}
                    aria-label="Remove fact"
                    className="opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-black/10 px-4 py-3 text-xs text-black-60">
        <Sparkle className="h-3.5 w-3.5 text-blue-light" />
        Edits to this list are session-only in this demo — they reset on refresh.
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
        active
          ? 'bg-blue-light text-white'
          : 'bg-gray-lighter text-black-60 hover:bg-black/8'
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn('tabular-nums', active ? 'text-white/80' : 'text-black-40')}>
          {count}
        </span>
      )}
    </button>
  );
}
