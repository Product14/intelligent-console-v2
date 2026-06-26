/**@format */
import React from 'react';

const Copy = ({
  className,
  height = 24,
  width = 24,
  fill = 'currentColor',
  onClick = () => {},
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path
        fill={fill}
        d="M7.5 15a1.45 1.45 0 0 1-1.06-.44A1.445 1.445 0 0 1 6 13.5v-10c0-.413.147-.766.44-1.06.294-.293.647-.44 1.06-.44h8c.412 0 .766.147 1.06.44.293.294.44.647.44 1.06v10c0 .412-.147.766-.44 1.06-.294.293-.647.44-1.06.44h-8Zm0-1.5h8v-10h-8v10Zm-3 4.5a1.45 1.45 0 0 1-1.06-.44A1.445 1.445 0 0 1 3 16.5V5.75c0-.213.071-.39.214-.534A.72.72 0 0 1 3.746 5c.21 0 .39.072.535.216a.72.72 0 0 1 .219.534V16.5h8.75a.73.73 0 0 1 .534.214.72.72 0 0 1 .216.532c0 .21-.072.39-.216.535a.72.72 0 0 1-.534.219H4.5Z"
      />
    </svg>
  );
};

export default Copy;
