import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function AppStore({ className, height, width }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM8.5 15.5L6.5 13.5L10.5 9.5L6.5 5.5L8.5 3.5L14.5 9.5L8.5 15.5ZM15.5 20.5L13.5 18.5L17.5 14.5L13.5 10.5L15.5 8.5L21.5 14.5L15.5 20.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
