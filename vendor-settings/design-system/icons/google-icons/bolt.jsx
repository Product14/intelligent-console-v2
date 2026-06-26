import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Bolt = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="currentColor"
      className={cn(className)}
      {...props}
    >
      <path d="m320-80 40-280H160l360-520h80l-40 320h240L400-80h-80Z" />
    </svg>
  );
};

export default Bolt;
