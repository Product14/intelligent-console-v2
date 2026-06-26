import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Facebook = ({ className, ...props }) => {
  return (
    <svg
      height="36"
      width="36"
      fill="none"
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <path
        d="M15.75 31.35C9.375 30.225 4.5 24.675 4.5 18C4.5 10.575 10.575 4.5 18 4.5C25.425 4.5 31.5 10.575 31.5 18C31.5 24.675 26.625 30.225 20.25 31.35L19.5 30.75H16.5L15.75 31.35Z"
        fill="url(#paint0_linear_169_71865)"
      />
      <path
        d="M23.25 21.75L23.85 18H20.25V15.375C20.25 14.325 20.625 13.5 22.275 13.5H24V10.05C23.025 9.9 21.975 9.75 21 9.75C17.925 9.75 15.75 11.625 15.75 15V18H12.375V21.75H15.75V31.275C16.5 31.425 17.25 31.5 18 31.5C18.75 31.5 19.5 31.425 20.25 31.275V21.75H23.25Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_169_71865"
          gradientUnits="userSpaceOnUse"
          x1="18"
          x2="18"
          y1="30.5655"
          y2="4.5"
        >
          <stop stopColor="#0062E0" />
          <stop offset="1" stopColor="#19AFFF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Facebook;
