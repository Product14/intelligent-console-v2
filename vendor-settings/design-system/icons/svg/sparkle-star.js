import React from 'react';

const SparkleStar = ({ className, width = 13, height = 13 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 13 13"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M6.50031 0.500977L8.32464 4.67664L12.5003 6.50098L8.32464 8.32531L6.50031 12.501L4.67597 8.32531L0.500305 6.50098L4.67597 4.67664L6.50031 0.500977Z" />
    </svg>
  );
};

export default SparkleStar;
