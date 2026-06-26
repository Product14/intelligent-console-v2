/**@format */
import React from 'react';

const ResellerPlus = ({
  className,
  height = 44,
  width = 44,
  onClick = () => {},
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <rect width="44" height="44" fill="#4600F2" fillOpacity=".08" rx="22" />
      <path
        fill="#4600F2"
        d="M18.25 12a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.375a2.625 2.625 0 1 0 0 5.25 2.625 2.625 0 0 0 0-5.25ZM32 15.75v3.75h3.75V22H32v3.75h-2.5V22h-3.75v-2.5h3.75v-3.75H32Zm-13.75 7.5c3.337 0 10 1.663 10 5V32h-20v-3.75c0-3.337 6.662-5 10-5Zm0 2.375c-3.713 0-7.625 1.825-7.625 2.625v1.375h15.25V28.25c0-.8-3.875-2.625-7.625-2.625Z"
      />
    </svg>
  );
};

export default ResellerPlus;
