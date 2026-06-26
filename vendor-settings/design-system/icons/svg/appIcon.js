import React from 'react';

const AppIcon = ({ className, fill = 'currentColor', ...props }) => {
  return (
    <svg
      width="16"
      height="22"
      viewBox="0 0 16 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect x="0.5" y="0.5" width="15" height="21" rx="1.5" stroke={fill} />
      <rect x="2" y="3" width="6" height="4" rx="1" fill={fill} />
    </svg>
  );
};

export default AppIcon;
