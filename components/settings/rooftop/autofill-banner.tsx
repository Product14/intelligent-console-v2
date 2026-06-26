'use client';

/**
 * Floating banner offered when a tenancy lands on /settings/departments with
 * a fully blank departments + holidays state. Pre-fills the website URL from
 * the rooftop profile (read-only — operators correct stale URLs in the
 * profile screen, not here) and offers a one-click "Autofill with AI" CTA.
 *
 * Banner is rendered via createPortal so it sits above the form regardless
 * of ancestor overflow / stacking context, and stays anchored to the
 * viewport bottom on long pages.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DsButton } from '@/components/settings/ds';

export function AutofillBanner({
  websiteUrl,
  profileSettled,
  isLoading,
  errorMessage,
  onAutofill,
  onDismiss,
}: {
  /** URL from rooftop profile. null while the profile fetch is in-flight OR
   *  after it settles with no website on file. */
  websiteUrl: string | null;
  /** True once the profile fetch has either succeeded or failed. Used to
   *  pick between "Loading rooftop info…" and "Add a website to your rooftop
   *  profile…" helper text when the URL is null. */
  profileSettled: boolean;
  isLoading: boolean;
  /** Inline error message to show below the CTA row — set by the parent when
   *  the autofill call fails. Banner stays mounted so the user can retry. */
  errorMessage: string | null;
  onAutofill: () => void;
  onDismiss: () => void;
}) {
  // Defer the portal mount until after hydration so SSR doesn't try to render
  // into document.body before it exists.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const canAutofill = !!websiteUrl && !isLoading;
  const helper = !websiteUrl
    ? profileSettled
      ? 'Add a website on your rooftop profile to enable autofill.'
      : 'Loading rooftop info…'
    : null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-[680px] rounded-2xl border border-black/10 bg-white shadow-[0_12px_32px_rgba(16,24,40,0.16)]">
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Sparkle glyph keeps the AI affordance visible at a glance. */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-8 text-blue-light">
            <SparkleIcon />
          </span>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-black-dark">
              Autofill department details from your website
            </div>
            <div className="mt-0.5 truncate text-xs text-black-60" title={websiteUrl ?? ''}>
              {websiteUrl ?? helper}
            </div>
          </div>

          <DsButton
            label="Autofill with AI"
            type="primary"
            size="AA"
            disabled={!canAutofill}
            isLoading={isLoading}
            onClick={onAutofill}
          />

          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1.5 text-black-60 hover:bg-gray-light hover:text-black-dark"
            aria-label="Dismiss autofill suggestion"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Helper line — only when the URL is missing AND there's no error
            (an error already explains why nothing happened). */}
        {!websiteUrl && !errorMessage && (
          <div className="border-t border-black/8 px-5 py-2 text-xs text-black-60">
            {helper}
          </div>
        )}

        {errorMessage && (
          <div className="border-t border-red-100 bg-red-50/60 px-5 py-2 text-xs font-medium text-red-600">
            {errorMessage}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function SparkleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
