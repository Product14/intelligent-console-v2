import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Verified = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="linear-gradient(90deg,_#BF2E84_40.1%,_#4600F2_100%)]"
      className={cn(className)}
      {...props}
    >
      <defs>
        <linearGradient id="verifiedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="40.1%" stopColor="#BF2E84" />
          <stop offset="100%" stopColor="#4600F2" />
        </linearGradient>
      </defs>
      <path
        fill="url(#verifiedGradient)"
        d="m344-60-76-128-144-32 14-148-98-112 98-112-14-148 144-32 76-128 136 58 136-58 76 128 144 32-14 148 98 112-98 112 14 148-144 32-76 128-136-58-136 58Zm34-102 102-44 104 44 56-96 110-26-10-112 74-84-74-86 10-112-110-24-58-96-102 44-104-44-56 96-110 24 10 112-74 86 74 84-10 114 110 24 58 96Zm102-318Zm-42 142 226-226-56-58-170 170-86-84-56 56 142 142Z"
      />
    </svg>
  );
};

export default Verified;
