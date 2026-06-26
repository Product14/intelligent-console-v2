import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function Tooltip({
  ref = null,
  children,
  content,
  position = 'top',
  showTooltip = true,
  className,
  wrapperClassName = '',
}) {
  return (
    <div ref={ref} className={`group relative ${wrapperClassName}`}>
      {children}
      <div
        className={cn(
          'invisible absolute z-10 opacity-0 group-hover:visible group-hover:opacity-100',
          'pointer-events-none w-[150px] rounded-lg bg-black px-2 py-1 text-center text-xs text-white',
          'transition-all duration-200',
          className,
          {
            'bottom-full left-1/2 mb-2 -translate-x-1/2': position === 'top',
            'left-1/2 top-full mt-2 -translate-x-1/2': position === 'bottom',
            'right-full top-1/2 mr-2 -translate-y-1/2': position === 'left',
            'left-full top-1/2 ml-2 -translate-y-1/2': position === 'right',
            hidden: !showTooltip,
          }
        )}
      >
        {content}
        <div
          className={cn('absolute h-2 w-2 rotate-45 bg-black', {
            'bottom-[-4px] left-1/2 -translate-x-1/2': position === 'top',
            'left-1/2 top-[-4px] -translate-x-1/2': position === 'bottom',
            'right-[-4px] top-1/2 -translate-y-1/2': position === 'left',
            'left-[-4px] top-1/2 -translate-y-1/2': position === 'right',
          })}
        />
      </div>
    </div>
  );
}
