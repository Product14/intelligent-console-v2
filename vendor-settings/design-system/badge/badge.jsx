import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function Badge({
  text,
  icon,
  className,
  onClick,
  iconPosition = 'left',
  isTextVisible = true,
}) {
  return (
    <div
      className={cn(
        'flex w-fit items-center gap-1.5 rounded-xl px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      onClick={onClick}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {isTextVisible && <span className="whitespace-nowrap">{text}</span>}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </div>
  );
}
