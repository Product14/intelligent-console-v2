import React from 'react';
import { cn } from '@spyne-console/utils/cn';

export default function CheckboxSelect({ className, height = 18, width = 18 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, 'fill-black')}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 0H15C16.6569 0 18 1.34315 18 3V15C18 16.6569 16.6569 18 15 18H3C1.34315 18 0 16.6569 0 15V3C0 1.34315 1.34315 0 3 0ZM6 10H12C12.5523 10 13 9.55229 13 9C13 8.44771 12.5523 8 12 8H6C5.44772 8 5 8.44771 5 9C5 9.55229 5.44772 10 6 10Z"
      />
    </svg>
  );
}
