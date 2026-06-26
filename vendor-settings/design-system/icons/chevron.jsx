import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function Chevron({ height = 16, width = 16, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('rotate-90 fill-none stroke-black stroke-1', className)}
    >
      <path
        d="M4.5 9L7.5 6L4.5 3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
