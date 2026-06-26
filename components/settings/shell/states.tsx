'use client';

import React from 'react';
import { AlertCircle, Inbox, RotateCw } from 'lucide-react';
import { cn } from '@/lib/settings/cn';

/** Skeleton block — reserves space so async content doesn't shift layout. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-gray-8', className)} />;
}

/** Standard loading state for a section (skeleton rows). */
export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Empty state — calm, with an optional action. */
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-gray-lighter px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-8 text-black-40">
        {icon || <Inbox className="h-5 w-5" />}
      </div>
      <div className="text-sm font-medium text-black-dark">{title}</div>
      {description && <div className="mt-1 max-w-sm text-xs text-black-40">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Error state — inline, never blocks; offers retry. */
export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red/20 bg-red-lightest px-4 py-3">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-red-warningRed">{title}</div>
        {description && <div className="mt-0.5 text-xs text-black-60">{description}</div>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red/30 px-2.5 py-1.5 text-xs font-medium text-red-warningRed hover:bg-red-4"
        >
          <RotateCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

/** Full-page error state — used in place of a screen's primary content when
 *  the initial load fails. Generic copy by default so every screen can drop it
 *  in without writing its own; title/description can be overridden if a screen
 *  needs domain-specific phrasing. */
export function LoadErrorState({
  title = 'Something went wrong',
  description = "We couldn't load this page. Please try again in a moment.",
  onRetry,
  retryLabel = 'Retry',
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-black/8 bg-white px-6 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-lightest text-red">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="mt-4 text-h2 text-black-80">{title}</div>
      <div className="mt-1 max-w-sm text-body-sm text-black-40">{description}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-blue-light px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <RotateCw className="h-4 w-4" /> {retryLabel}
        </button>
      )}
    </div>
  );
}

type AsyncStatus = 'idle' | 'loading' | 'error' | 'ready';

/** Wraps a data-backed section: shows loading/error/empty/content consistently. */
export function AsyncSection({
  status,
  isEmpty,
  onRetry,
  loadingRows,
  empty,
  errorDescription,
  children,
}: {
  status: AsyncStatus;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingRows?: number;
  empty?: React.ReactNode;
  errorDescription?: string;
  children: React.ReactNode;
}) {
  if (status === 'loading') return <LoadingState rows={loadingRows} />;
  if (status === 'error') return <ErrorState description={errorDescription} onRetry={onRetry} />;
  if (isEmpty && empty) return <>{empty}</>;
  return <>{children}</>;
}
