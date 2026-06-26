import React from 'react';

import PropTypes from 'prop-types';

import { cn } from '@spyne-console/utils/cn';

import Spinner from '../spinner/spinner';
import Tooltip from '../tooltip/tooltip';

export default function Button({
  label = 'Button',
  icon,
  iconUrl,
  onClick = () => {},
  className = '',
  disabled = false,
  type = 'primary',
  size = 'A',
  isLoading = false,
  iconPosition = 'left',
  title = label,
  spinnerType = 'light',
  showTooltip = false,
  tooltipContent = '',
  tooltipPosition = 'top',
  tooltipClassName = '',
}) {
  const handleClick = (event) => {
    if (disabled || isLoading) {
      event.preventDefault();
      return;
    }
    onClick(event);
  };

  const buttonContent = (
    <div
      type="button"
      onClick={handleClick}
      className={cn(
        'flex cursor-pointer appearance-none flex-row items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300',
        type === 'primary' && 'bg-blue-light text-white',
        (type === 'bordered' || type === 'outline') &&
          'text-black-80 border-[1.4px] border-black/10 bg-white hover:bg-black hover:bg-opacity-10',
        type === 'red' && 'bg-red text-white',
        type === 'light-bg' &&
          'bg-blue-light/5 border-blue-light/10 text-blue-light border',
        size === 'A' && 'rounded-md sm:px-4 sm:py-2',
        size === 'AA' && 'rounded-lg px-4 py-2 sm:px-6 sm:py-3',
        size === 'AAA' && 'rounded-[10px] px-8 py-4 text-lg',
        disabled || isLoading
          ? 'cursor-not-allowed opacity-50'
          : 'hover:opacity-90',
        className
      )}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      title={showTooltip ? undefined : title}
    >
      {isLoading && <Spinner type={spinnerType} />}
      {icon && iconPosition === 'left' && !isLoading && <span>{icon}</span>}
      {iconUrl && iconPosition === 'left' && !isLoading && (
        <span>
          <img src={iconUrl} alt="" />
        </span>
      )}
      {label && (
        <span className={isLoading ? 'invisible absolute' : 'visible'}>
          {label}
        </span>
      )}
      {icon && iconPosition === 'right' && !isLoading && <span>{icon}</span>}
      {iconUrl && iconPosition === 'right' && !isLoading && (
        <span>
          <img src={iconUrl} alt="" />
        </span>
      )}
    </div>
  );

  if (showTooltip && tooltipContent) {
    return (
      <Tooltip
        content={tooltipContent}
        position={tooltipPosition}
        showTooltip={showTooltip}
        className={tooltipClassName}
      >
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
}

Button.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.node,
  iconUrl: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['primary', 'bordered', 'outline']),
  size: PropTypes.oneOf(['A', 'AA', 'AAA']),
  isLoading: PropTypes.bool,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  title: PropTypes.string,
  spinnerType: PropTypes.string,
  showTooltip: PropTypes.bool,
  tooltipContent: PropTypes.string,
  tooltipPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};
