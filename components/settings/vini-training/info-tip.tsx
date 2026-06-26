'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

interface Props {
  children: React.ReactNode;
  /** Tooltip placement. Defaults to bottom; use 'top' for elements near the
   *  bottom of the viewport. */
  side?: 'top' | 'bottom';
  /** Override the default 240px width. */
  width?: number;
  className?: string;
}

/** Small (i) icon with a hover/focus tooltip. Used inline beside section
 *  titles and metric labels to explain dealer-facing terminology without
 *  cluttering the layout. */
export function InfoTip({ children, side = 'bottom', width = 240, className }: Props) {
  return (
    <span className={cn('group relative inline-flex align-middle', className)}>
      <button
        type="button"
        aria-label="More info"
        tabIndex={0}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-black-40 transition-colors hover:text-black-dark focus:text-black-dark focus:outline-none"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        style={{ width }}
        className={cn(
          'invisible absolute z-50 -translate-x-1/2 whitespace-normal rounded-md bg-black-dark px-3 py-2 text-[11px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
          side === 'bottom' && 'left-1/2 top-full mt-2',
          side === 'top' && 'left-1/2 bottom-full mb-2'
        )}
      >
        {children}
      </span>
    </span>
  );
}
