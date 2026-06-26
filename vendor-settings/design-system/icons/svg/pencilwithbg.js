import React from 'react';

const PencilWithBg = ({
  className,
  width = 60,
  height = 60,
  primaryColor = '#4600F2',
  bgOpacity = 0.08,
  strokeOpacity = 0.04,
  strokeWidth = 8,
}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="44"
        height="44"
        x="8"
        y="8"
        fill={primaryColor}
        fillOpacity={bgOpacity}
        rx="22"
      />
      <rect
        width="52"
        height="52"
        x="4"
        y="4"
        stroke={primaryColor}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
        rx="26"
      />
      <path
        fill={primaryColor}
        d="M23 37h1.425l9.775-9.775-1.425-1.425L23 35.575V37Zm-1 2a.968.968 0 0 1-.712-.288A.968.968 0 0 1 21 38v-2.425a1.975 1.975 0 0 1 .575-1.4l12.625-12.6c.2-.183.42-.325.662-.425.242-.1.496-.15.763-.15s.525.05.775.15c.25.1.467.25.65.45l1.375 1.4c.2.183.346.4.438.65a2.165 2.165 0 0 1 0 1.513 1.874 1.874 0 0 1-.438.662l-12.6 12.6a1.975 1.975 0 0 1-1.4.575H22Zm11.475-12.475-.7-.725 1.425 1.425-.725-.7Z"
      />
    </svg>
  );
};

export default PencilWithBg;
