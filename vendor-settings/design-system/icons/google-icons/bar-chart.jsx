import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const BarChart = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#e3e3e3"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
    </svg>
  );
};

export default BarChart;
