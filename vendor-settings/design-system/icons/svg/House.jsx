import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const House = ({ className, fill = '#1f1f1f', ...props }) => {
  return (
    <svg
      height="24px"
      width="24px"
      fill={fill}
      viewBox="0 -960 960 960"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-4 w-4', className)}
      {...props}
    >
      <path d="M200-160v-366L88-440l-48-64 440-336 160 122v-82h120v174l160 122-48 64-112-86v366H520v-240h-80v240H200Zm80-80h80v-240h240v240h80v-347L480-739 280-587v347Zm120-319h160q0-32-24-52.5T480-632q-32 0-56 20.5T400-559Zm-40 319v-240h240v240-240H360v240Z" />
    </svg>
  );
};

export default House;
