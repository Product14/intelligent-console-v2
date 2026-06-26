'use client';

import { useState } from 'react';
import { cn } from '@/lib/settings/cn';

interface PartnerLogoProps {
  provider: string | null;
  logo: string | null;
  /** Square frame size in pixels. */
  size?: number;
  className?: string;
}

/** Square logo frame for an integration partner.
 *
 *  - When `logo` is set and the image loads, renders it with `object-contain`
 *    so a wide wordmark doesn't get cropped or distorted.
 *  - When the URL 404s (Clearbit doesn't always have a logo) or no logo is
 *    provided, falls back to a tinted circle with the provider's initial.
 *  - When `provider` is null too (the slot is just empty), renders a dashed
 *    placeholder so the grid layout doesn't collapse. */
export function PartnerLogo({ provider, logo, size = 32, className }: PartnerLogoProps) {
  const [broken, setBroken] = useState(false);
  const showImage = !!logo && !broken;
  const initial = (provider ?? '?').trim().charAt(0).toUpperCase();
  const dim = { width: size, height: size };

  if (!provider) {
    return (
      <div
        style={dim}
        className={cn(
          'shrink-0 rounded-md border border-dashed border-black/15 bg-gray-light/40',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      style={dim}
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/8 bg-white',
        className
      )}
    >
      {showImage ? (
        <img
          src={logo!}
          alt={`${provider} logo`}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-blue-8 text-sm font-semibold text-blue-light"
          aria-label={`${provider} (logo unavailable)`}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
