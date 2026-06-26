/**@format */
import React from 'react';

const StatusInfo = ({ className = 'text-[#253985]' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_6794_162732)">
        <path
          d="M8.00065 10.6673V8.00065M8.00065 5.33398H8.00732M14.6673 8.00065C14.6673 11.6826 11.6826 14.6673 8.00065 14.6673C4.31875 14.6673 1.33398 11.6826 1.33398 8.00065C1.33398 4.31875 4.31875 1.33398 8.00065 1.33398C11.6826 1.33398 14.6673 4.31875 14.6673 8.00065Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_6794_162732">
          <rect width="16" height="16" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default StatusInfo;
