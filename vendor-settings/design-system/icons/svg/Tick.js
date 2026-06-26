/**@format */
import React from 'react';

const Tick = ({ className, height = 24, width = 24, onClick = () => {} }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path
        d="M0.75 4.75L4.25 8.25L11.25 0.75"
        stroke="black"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default Tick;
