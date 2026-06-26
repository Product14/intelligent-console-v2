import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Repeat = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#e3e3e3"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
    </svg>
  );
};

export default Repeat;
