import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function SelectChip({
  id,
  label,
  value,
  isSelected = false,
  onClick,
  disabled = false,
  className = '',
  activeClassName = 'bg-purple-100 text-blue-light border-blue-light',
  inactiveClassName = 'bg-white text-black-60 border-grey-light',
}) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(value);
    }
  };

  const chipClassNames = cn(
    'cursor-pointer rounded-2xl border px-2 py-1 transition-colors duration-200 text-sm',
    isSelected ? activeClassName : inactiveClassName,
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      className={chipClassNames}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {label}
    </div>
  );
}
