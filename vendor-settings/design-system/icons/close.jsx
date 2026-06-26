import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Close = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#e8eaed"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
};

export default Close;
