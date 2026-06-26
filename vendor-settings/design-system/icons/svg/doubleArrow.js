import React from 'react';

const doubleArrow = ({ className, onClick = () => {}, stroke = '#0A0A0A' }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.667 4.667 8 8l-3.333 3.333m3.999-6.666L12 8l-3.334 3.333"
      />
    </svg>
  );
};

export default doubleArrow;
