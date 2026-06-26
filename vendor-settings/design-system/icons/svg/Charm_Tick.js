import React from 'react';

const Charm_Tick = ({ strokeColor = '#4600F2' }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="charm:tick">
        <path
          id="Vector"
          d="M3.4375 10.9375L7.8125 15.3125L16.5625 5.9375"
          stroke={strokeColor}
          stroke-width="1.875"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  );
};

export default Charm_Tick;
