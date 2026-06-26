'use client';

import { useState } from 'react';
import { Calendar, Megaphone, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import { DsButton } from '@/components/settings/ds';
import type { Promotion, PromotionStatus } from '@/lib/settings/reception-knowledge-fixtures';

interface PromotionsSectionProps {
  items: Promotion[];
  setItems: React.Dispatch<React.SetStateAction<Promotion[]>>;
}

export function PromotionsSection({ items, setItems }: PromotionsSectionProps) {
  const [filter, setFilter] = useState<PromotionStatus | 'all'>('active');

  const filtered = filter === 'all' ? items : items.filter((p) => p.status === filter);

  const counts = {
    all: items.length,
    active: items.filter((p) => p.status === 'active').length,
    scheduled: items.filter((p) => p.status === 'scheduled').length,
    expired: items.filter((p) => p.status === 'expired').length,
  };

  const archive = (id: string) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'expired' } : p)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/8 bg-white p-4">
        <Megaphone className="h-5 w-5 shrink-0 text-blue-light" />
        <div className="flex-1 text-sm text-black-dark">
          <strong>Time-bound campaigns the agent mentions to relevant callers.</strong> Auto-expire
          on end date.
        </div>
        <DsButton label="New promotion" type="primary" size="AA" onClick={() => {}} />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="Active"
          active={filter === 'active'}
          onClick={() => setFilter('active')}
          count={counts.active}
        />
        <FilterChip
          label="Scheduled"
          active={filter === 'scheduled'}
          onClick={() => setFilter('scheduled')}
          count={counts.scheduled}
        />
        <FilterChip
          label="Expired"
          active={filter === 'expired'}
          onClick={() => setFilter('expired')}
          count={counts.expired}
        />
        <FilterChip
          label="All"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          count={counts.all}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-black/8 bg-white p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-black-60">
                  {p.department}
                </span>
              </div>
              {p.status === 'active' && (
                <button
                  type="button"
                  onClick={() => archive(p.id)}
                  className="text-[11px] font-medium text-black-60 hover:text-red-600"
                >
                  Archive
                </button>
              )}
            </div>
            <div className="mb-1 text-sm font-semibold text-black-dark">{p.title}</div>
            <p className="mb-2.5 text-xs leading-relaxed text-black-60">{p.description}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/8 pt-2 text-[11px] text-black-60">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {p.startDate} → {p.endDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {p.timesReferenced}× referenced
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/10 py-10 text-center text-sm text-black-40">
            No promotions in this view.
          </div>
        )}
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
  count: number;
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
      <span className={cn('tabular-nums', active ? 'text-white/80' : 'text-black-40')}>
        {count}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: PromotionStatus }) {
  const cls =
    status === 'active'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'scheduled'
        ? 'bg-blue-light/10 text-blue-light'
        : 'bg-black/5 text-black-60';
  const label =
    status === 'active' ? 'Active' : status === 'scheduled' ? 'Scheduled' : 'Expired';
  return (
    <span className={cn('inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold', cls)}>
      {label}
    </span>
  );
}
