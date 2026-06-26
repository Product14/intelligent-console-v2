import React, { useState } from 'react';

import Image from 'next/image';

import { cn } from '@spyne-console/utils/cn';

export interface PartnerIconWithFallbackProps {
  icon: string | undefined | null;
  name: string;
  size?: number;
  className?: string;
  rounded?: string;
}

/**
 * Renders a partner/integration icon with fallback to the first letter of name
 * when icon is missing or fails to load. Use across onboarding for consistency.
 */
const PartnerIconWithFallback: React.FC<PartnerIconWithFallbackProps> = ({
  icon,
  name,
  size = 40,
  className,
  rounded = 'rounded-[8px]',
}) => {
  const [iconError, setIconError] = useState(false);
  const fallbackLetter = name?.charAt(0)?.toUpperCase() ?? '';
  const showFallback = !icon || iconError;

  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center overflow-hidden',
        rounded,
        className
      )}
      style={{ width: size, height: size }}
    >
      {showFallback ? (
        <span
          className="font-semibold text-[#5f6368]"
          style={{ fontSize: Math.max(12, size * 0.45) }}
        >
          {fallbackLetter}
        </span>
      ) : (
        <Image
          src={icon}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          style={{ width: size, height: size }}
          onError={() => setIconError(true)}
        />
      )}
    </div>
  );
};

export default PartnerIconWithFallback;
