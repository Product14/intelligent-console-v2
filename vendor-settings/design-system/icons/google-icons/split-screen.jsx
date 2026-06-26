import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const SplitScreen = ({ className, ...props }) => {
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
      <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h200v80H160v480h200v80H160Zm280 80v-800h80v80h280q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H520v80h-80Zm80-160h280v-480H520v480Zm-360 0v-480 480Zm640 0v-480 480Z" />
    </svg>
  );
};

export default SplitScreen;
