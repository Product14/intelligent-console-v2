import React from 'react';

const WarningIcon = ({ className, strokeColor = '#866800' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      className={className}
    >
      <g clip-path="url(#clip0_6681_209078)">
        <path
          d="M5.9994 4.48106V6.48106M5.9994 8.48106H6.0044M5.1444 1.91106L0.9094 8.98106C0.822084 9.13227 0.775883 9.30371 0.775395 9.47832C0.774906 9.65293 0.820145 9.82462 0.906613 9.97632C0.993081 10.128 1.11776 10.2544 1.26825 10.343C1.41875 10.4315 1.5898 10.4791 1.7644 10.4811H10.2344C10.409 10.4791 10.5801 10.4315 10.7305 10.343C10.881 10.2544 11.0057 10.128 11.0922 9.97632C11.1787 9.82462 11.2239 9.65293 11.2234 9.47832C11.2229 9.30371 11.1767 9.13227 11.0894 8.98106L6.8544 1.91106C6.76526 1.76411 6.63976 1.64262 6.49 1.5583C6.34023 1.47398 6.17127 1.42969 5.9994 1.42969C5.82753 1.42969 5.65857 1.47398 5.5088 1.5583C5.35904 1.64262 5.23354 1.76411 5.1444 1.91106Z"
          stroke={strokeColor}
          stroke-width="1.05"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_6681_209078">
          <rect
            width="12"
            height="12"
            fill="white"
            transform="translate(0 0.480469)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default WarningIcon;
