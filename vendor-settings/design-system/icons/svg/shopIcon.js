import React from 'react';

const ShopIcon = ({
  className,
  fill = 'currentColor',
  height = 24,
  width = 24,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M18 23V20H15V18H18V15H20V18H23V20H20V23H18ZM2 20V14H1V12L2 7H17L18 12V14H17V17H15V14H11V20H2ZM4 18H9V14H4V18ZM2 6V4H17V6H2ZM3.05 12H15.95L15.35 9H3.65L3.05 12Z"
        fill={fill}
      />
    </svg>
  );
};

export default ShopIcon;
