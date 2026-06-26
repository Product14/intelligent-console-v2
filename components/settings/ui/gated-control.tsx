'use client';

import { ReactNode } from 'react';
import Tooltip from '@/components/settings/shared/Tooltip';

/**
 * Disables a control visually + functionally when `gated` is true, and shows
 * a hover tooltip explaining why. Used to block optional fields on a
 * department card until its mandatory fields (phone, etc.) are filled —
 * makes the dependency visible instead of letting the user configure
 * address / hours and then discover at save time that the dept will be
 * dropped.
 *
 * When `gated` is false this renders children directly with no wrapper —
 * no per-control overhead in the common case.
 */
export function GatedControl({
  gated,
  message,
  children,
  className,
}: {
  gated: boolean;
  message: string;
  children: ReactNode;
  /** Optional extra classes on the wrapper (e.g. block/inline-block, width). */
  className?: string;
}) {
  if (!gated) return <>{children}</>;
  return (
    <Tooltip
      content={message}
      position="top"
      // Override the default 150px so the message wraps cleanly.
      className="w-[260px] whitespace-normal leading-snug"
      wrapperClassName={className}
    >
      <div className="pointer-events-none cursor-not-allowed opacity-50">
        {children}
      </div>
    </Tooltip>
  );
}
