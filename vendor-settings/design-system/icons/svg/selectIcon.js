/**@format */
import React from 'react';

const SelectIcon = ({ className }) => {
  return (
    <svg
      width="17"
      height="18"
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_b_3247_28997)">
        <circle cx="8.5" cy="9.32812" r="8.5" fill="#4600F2" />
      </g>
      <path
        d="M6 10.2567L7.51786 11.7746L11.1607 7.82812"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <defs>
        <filter
          id="filter0_b_3247_28997"
          x="-4"
          y="-3.17188"
          width="25"
          height="25"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_3247_28997"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_backgroundBlur_3247_28997"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default SelectIcon;
