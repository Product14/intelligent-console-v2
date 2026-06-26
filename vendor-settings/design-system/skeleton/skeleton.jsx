import React from 'react';

import { cn } from '@spyne-console/utils/cn';

function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'absolute top-0 h-full w-full rounded-inherit animate-[skeleton_1.5s_infinite] bg-[length:300%] bg-[position:100%_0] bg-gradient-to-r from-[#faf7ff] via-white to-[#faf7ff]',
        className,
      )}
      style={{
        backgroundSize: '300%',
        '@keyframes skeleton': {
          to: {
            backgroundPosition: '-100% 0',
          },
        },
      }}
    />
  );
}

export default Skeleton;
