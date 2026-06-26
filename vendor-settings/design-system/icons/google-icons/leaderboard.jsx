import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Leaderboard = ({ className, ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill="#e3e3e3"
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn(className)}
    >
      <path d="M160-200h160v-320H160v320Zm240 0h160v-560H400v560Zm240 0h160v-240H640v240ZM80-120v-480h240v-240h320v320h240v400H80Z" />
    </svg>
  );
};

export default Leaderboard;
