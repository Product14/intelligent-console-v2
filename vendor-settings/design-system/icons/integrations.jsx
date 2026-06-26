import React from 'react';
import { cn } from '@spyne-console/utils/cn';

export default function Integrations({
  height = 24,
  width = 24,
  className = '',
}) {
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
        d="M16 3h5v5M4 20L21 3M21 16v5h-5M4 4L9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
