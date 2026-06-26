import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const PlayArrow = ({ className, ...props }) => {
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
      <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
    </svg>
  );
};

export default PlayArrow;
