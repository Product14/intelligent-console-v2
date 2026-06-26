/**@format   */
import React from 'react';

const DownRed = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <path
        d="M6 2.5L6 9.5M6 9.5L9.5 6M6 9.5L2.5 6"
        stroke="#B42318"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DownRed;
