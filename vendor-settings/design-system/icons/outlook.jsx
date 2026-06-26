import React from 'react';
import { cn } from '@spyne-console/utils/cn';

export default function Outlook({ className, height = 24, width = 24 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={cn(className)}
      width={width}
      height={height}
    >
      <path
        fill="#0078d4"
        d="M44,19v19c0,3.31-2.69,6-6,6H22V19l11-7.75L44,19z"
      />
      <path
        fill="#0078d4"
        d="M4,10.5v27C4,39.43,5.57,41,7.5,41h13V16L11,9.5L4,10.5z"
      />
      <path fill="#0078d4" d="M20.5,4H11L20.5,12V4z M27.5,4H37L27.5,12V4z" />
      <path fill="#0078d4" d="M22,19h15v19H22V19z" />
    </svg>
  );
}
