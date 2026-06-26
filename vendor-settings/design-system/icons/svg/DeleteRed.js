import React from 'react';

export default function DeleteRed({ className }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_b_245_22443)">
        <rect width="26" height="26" rx="13" fill="white" />
        <rect
          width="26"
          height="26"
          rx="13"
          fill="#C31812"
          fill-opacity="0.1"
        />
        <path
          d="M9.25 19.75C8.8375 19.75 8.4845 19.6033 8.191 19.3097C7.8975 19.0162 7.7505 18.663 7.75 18.25V8.5H7V7H10.75V6.25H15.25V7H19V8.5H18.25V18.25C18.25 18.6625 18.1033 19.0157 17.8097 19.3097C17.5162 19.6038 17.163 19.7505 16.75 19.75H9.25ZM16.75 8.5H9.25V18.25H16.75V8.5ZM10.75 16.75H12.25V10H10.75V16.75ZM13.75 16.75H15.25V10H13.75V16.75Z"
          fill="#C31812"
        />
      </g>
      <defs>
        <filter
          id="filter0_b_245_22443"
          x="-29"
          y="-29"
          width="84"
          height="84"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="14.5" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_245_22443"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_backgroundBlur_245_22443"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
