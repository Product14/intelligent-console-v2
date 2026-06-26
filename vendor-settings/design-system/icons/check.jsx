import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Check = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('fill-[#e3e3e3]', className)}
      {...props}
    >
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
  );
};

export default Check;
