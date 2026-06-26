import React from 'react';

const AnimatedSpinner = ({ className, color = '#4600F2' }) => {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C28.837 36 36 28.837 36 20"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 20 20"
          to="360 20 20"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C28.837 36 36 28.837 36 20"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 20 20"
          to="360 20 20"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.1"
        fill="none"
      />
    </svg>
  );
};

export default AnimatedSpinner;
