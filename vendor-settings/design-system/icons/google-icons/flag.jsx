import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Flag = ({ className, ...props }) => {
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
      <path d="M200-120v-680h360l16 80h224v400H520l-16-80H280v280h-80Zm300-440Zm86 160h134v-240H510l-16-80H280v240h290l16 80Z" />
    </svg>
  );
};

export default Flag;
