import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const ArrowRightAlt = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#e8eaed"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(className)}
    >
      <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z" />
    </svg>
  );
};

export default ArrowRightAlt;
