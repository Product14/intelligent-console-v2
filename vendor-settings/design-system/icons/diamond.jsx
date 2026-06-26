import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Diamond = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#1f1f1f"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <path d="M480-120 80-600l120-240h560l120 240-400 480Zm-95-520h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z" />
    </svg>
  );
};

export default Diamond;
