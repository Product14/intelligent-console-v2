import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const FilterList = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 -960 960 960"
      fill="#e3e3e3"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z" />
    </svg>
  );
};

export default FilterList;
