import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Add = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#1f1f1f"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(className)}
    >
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
};

export default Add;
