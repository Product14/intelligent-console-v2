import React from 'react';

export default function Chevron({
  height = 16,
  width = 16,
  fill = 'none',
  stroke = '#000000',
  className = '',
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 10 10"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 1.5V8.5M5 8.5L8.5 5M5 8.5L1.5 5"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
