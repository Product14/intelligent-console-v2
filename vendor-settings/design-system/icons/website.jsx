import React from 'react';
import { cn } from '@spyne-console/utils/cn';

export default function Website({ height = 24, width = 24, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('fill-none stroke-black', className)}
    >
      <path
        d="M3 12h18M12 3v18M18.364 5.636A9 9 0 010 12a9 9 0 019 9 9 9 0 019-9 9 9 0 01-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
