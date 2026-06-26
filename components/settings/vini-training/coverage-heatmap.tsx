'use client';

import { cn } from '@/lib/settings/cn';
import { classifyHeatmapCell } from '@/lib/settings/vini-training-derivations';
import type { HeatmapCell } from '@/lib/settings/vini-training-mock';
import { InfoTip } from './info-tip';

interface Props {
  cells: HeatmapCell[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 24×7 grid showing call volume vs coverage by hour-of-week. Lives inside
 *  the Voice channel card. Visceral way to show where the after-hours +
 *  overflow gaps actually fall. */
export function CoverageHeatmap({ cells }: Props) {
  // Build a 7×24 lookup by [day][hour] for stable rendering order.
  const grid: HeatmapCell[][] = Array.from({ length: 7 }, () => Array(24).fill(null));
  for (const c of cells) {
    if (c.day >= 0 && c.day < 7 && c.hour >= 0 && c.hour < 24) {
      grid[c.day][c.hour] = c;
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-semibold text-black-dark">When calls happen</h4>
          <InfoTip side="top" width={280}>
            Each cell is one hour of one weekday. The colour shows who handled
            most of the calls that landed in that hour — Vini, your BDC, or
            nobody (missed). Hover a cell for the exact counts.
          </InfoTip>
        </div>
        <Legend />
      </div>
      <div className="mt-2 overflow-x-auto">
        <div className="inline-grid grid-cols-[28px_repeat(24,minmax(8px,1fr))] gap-[2px]">
          {/* Hour header */}
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className={cn(
                'text-center text-[9px] tabular-nums text-black-40',
                h % 3 !== 0 && 'opacity-0'
              )}
            >
              {hourLabel(h)}
            </div>
          ))}
          {/* Day rows */}
          {DAY_LABELS.map((label, day) => (
            <DayRow key={label} label={label} cells={grid[day]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayRow({ label, cells }: { label: string; cells: HeatmapCell[] }) {
  return (
    <>
      <div className="text-[10px] font-medium text-black-60">{label}</div>
      {cells.map((cell, hour) => {
        if (!cell) {
          return <div key={hour} className="h-3.5 rounded-sm bg-gray-light/40" />;
        }
        const classification = classifyHeatmapCell(cell);
        return (
          <div
            key={hour}
            title={tooltipText(label, hour, classification)}
            className={cn('h-3.5 rounded-sm', cellClass(classification.state))}
          />
        );
      })}
    </>
  );
}

function cellClass(state: 'vini' | 'bdc' | 'missed' | 'empty'): string {
  switch (state) {
    case 'vini':
      return 'bg-blue-light';
    case 'bdc':
      return 'bg-blue-light/30';
    case 'missed':
      return 'bg-orange';
    case 'empty':
      return 'bg-gray-light/40';
  }
}

function tooltipText(
  day: string,
  hour: number,
  c: { vini: number; bdc: number; missed: number }
): string {
  return `${day} ${hourLabel(hour)} — Vini ${c.vini} · BDC ${c.bdc} · Missed ${c.missed}`;
}

function hourLabel(h: number): string {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  if (h < 12) return `${h}a`;
  return `${h - 12}p`;
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-black-60">
      <LegendDot className="bg-blue-light" label="Vini handled" />
      <LegendDot className="bg-blue-light/30" label="Your BDC" />
      <LegendDot className="bg-orange" label="Missed" />
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('inline-block h-2 w-2 rounded-sm', className)} />
      {label}
    </span>
  );
}
