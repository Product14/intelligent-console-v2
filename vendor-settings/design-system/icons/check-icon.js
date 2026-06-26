import React from 'react';

const CheckIcon = ({ className }) => {
  return (
    <svg
      className={className || 'fill-[#027A48]'}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.3334 0.333374C5.91675 0.333374 0.666748 5.58337 0.666748 12C0.666748 18.4167 5.91675 23.6667 12.3334 23.6667C18.7501 23.6667 24.0001 18.4167 24.0001 12C24.0001 5.58337 18.7501 0.333374 12.3334 0.333374ZM10.0001 17.8334L4.16675 12L5.81175 10.355L10.0001 14.5317L18.8551 5.67671L20.5001 7.33337L10.0001 17.8334Z" />
    </svg>
  );
};

export default CheckIcon;
