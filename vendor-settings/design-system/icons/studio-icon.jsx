import React from 'react';

import PropTypes from 'prop-types';

import { cn } from '@spyne-console/utils/cn';

export default function StudioIcon({
  className,
  color = '#4600F2',
  height = 18,
  width = 19,
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <g clipPath="url(#clip0_11060_249181)">
        <path
          d="M3.47221 4.5914L9.91898 0.859863C10.0345 0.793014 10.1655 0.757813 10.299 0.757812C10.4324 0.757813 10.5635 0.793014 10.6789 0.859863L17.1257 4.5914C17.2409 4.65807 17.3365 4.75385 17.4029 4.86914C17.4693 4.98442 17.5042 5.11516 17.5042 5.24822V11.9582C17.5041 12.0911 17.4691 12.2217 17.4027 12.3368C17.3363 12.452 17.2408 12.5476 17.1257 12.6142L10.6789 16.3458C10.5635 16.4126 10.4324 16.4478 10.299 16.4478C10.1655 16.4478 10.0345 16.4126 9.91898 16.3458L3.47221 12.6142C3.35706 12.5476 3.26147 12.4518 3.19504 12.3365C3.12861 12.2212 3.09368 12.0905 3.09375 11.9574V5.24898C3.09368 5.11592 3.12861 4.98518 3.19504 4.8699C3.26147 4.75461 3.35706 4.65807 3.47221 4.5914Z"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M5.36719 5.95143L10.2971 3.29688L15.227 5.95143L10.2971 8.22676V14.2943L5.36719 11.2605V5.95143Z"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_11060_249181">
          <rect
            width="18"
            height="18"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

StudioIcon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
};
