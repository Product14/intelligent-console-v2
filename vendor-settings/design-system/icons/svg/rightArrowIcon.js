/**@format */
import React from 'react';

const rightArrowIcon = ({ className }) => {
  return (
    <svg
      width="17"
      height="14"
      viewBox="0 0 17 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className || 'stroke-white'}
    >
      <path
        d="M1.00065 7L15.584 7"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1667 12.8327L16 6.99935L10.1667 1.16602"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default rightArrowIcon;
