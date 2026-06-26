'use client';

import { cn } from '@/lib/settings/cn';

/** Loading placeholder — matches the page's vertical rhythm so the layout
 *  doesn't jump when real data lands. */
export function ViniTrainingSkeleton() {
  return (
    <div className="pb-16">
      <Block className="-mx-6 h-14 rounded-none border-b border-black/8 bg-white" />
      <Block className="-mx-6 h-20 rounded-none border-b border-black/8 bg-white" />

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Block className="h-40" />
        <Block className="h-40" />
        <Block className="h-40" />
      </div>

      <div className="mt-6 space-y-3">
        <Block className="h-6 w-24" />
        <Block className="h-64" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Block className="h-32" />
          <Block className="h-32" />
        </div>
        <Block className="h-16" />
      </div>

      <div className="mt-6 space-y-3">
        <Block className="h-6 w-24" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Block className="h-20" />
          <Block className="h-20" />
          <Block className="h-20" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Block className="h-32" />
          <Block className="h-32" />
          <Block className="h-32" />
        </div>
      </div>

      <Block className="mt-6 h-44" />
    </div>
  );
}

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl border border-black/8 bg-gray-light/40',
        className
      )}
    />
  );
}
