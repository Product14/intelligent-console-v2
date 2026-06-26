import { useEffect, useRef, useState } from 'react';

import SVG from '@spyne-console/design-system/svg';

/**
 * ThreeDotMenu
 *
 * A reusable popover menu component triggered by a button (default: three-dot icon).
 * It can optionally open on hover, and provides a list of configurable actions.
 *
 * Props:
 * - options: Array of objects representing menu items. Each item should have:
 *     - label (string): The text to display
 *     - onClick (function): Callback executed on click
 *     - icon (string, optional): Icon name to display before the label
 *     - disabled (boolean, optional): Whether the option is disabled
 *     - danger (boolean, optional): Whether the option is a dangerous action (red color)
 * - rowKey (any): Optional key passed to the onClick callback of each option
 * - buttonContent (ReactNode): Optional custom button content (replaces three-dot icon)
 * - buttonClassName (string): Optional class to style the trigger button
 * - onHover (boolean): If true, the menu appears on hover instead of click
 * - popoverClassName (string): Optional class for the popover container
 * - optionsClassName (string): Optional class for each option button
 * - placement (string): Optional placement of the menu ('right' | 'left' | 'bottom')
 */
const ThreeDotMenu = ({
  options,
  rowKey = undefined,
  buttonContent,
  buttonClassName,
  onHover = false,
  popoverClassName = '',
  optionsClassName = '',
  placement = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Close the popover if clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle hover-based opening
  const handleMouseEnter = () => {
    if (onHover) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (onHover) setIsOpen(false);
  };

  // Get placement classes based on the placement prop
  const getPlacementClasses = () => {
    switch (placement) {
      case 'left':
        return 'right-0 left-auto';
      case 'bottom':
        return 'top-full mt-2 left-0';
      default: // 'right'
        return 'left-full ml-2 top-0';
    }
  };

  return (
    <div
      className="relative inline-block"
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button (click or hover) */}
      <button
        ref={buttonRef}
        onClick={() => !onHover && setIsOpen(!isOpen)}
        className={`rounded-full p-2 transition-all duration-200 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 active:bg-gray-200 ${buttonClassName} `}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {buttonContent || (
          <SVG
            iconName="threeDotIcon"
            className="h-4 w-4 fill-black/60 transition-colors duration-200 hover:fill-black/80"
          />
        )}
      </button>

      {/* Dropdown/Popover Menu */}
      <div
        className={`absolute ${getPlacementClasses()} z-50 w-56 transform rounded-lg border border-gray-100 bg-white shadow-lg transition-all duration-200 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'} ${popoverClassName} `}
      >
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              if (!option.disabled) {
                option.onClick(rowKey);
                setIsOpen(false);
              }
            }}
            disabled={option.disabled}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 ${option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 active:bg-gray-100'} ${option.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700'} ${index === 0 ? 'rounded-t-lg' : ''} ${index === options.length - 1 ? 'rounded-b-lg' : ''} ${optionsClassName} `}
          >
            {/* Optional icon */}
            {option.icon && (
              <SVG
                iconName={option.icon}
                color={
                  option.danger ? 'rgb(220, 38, 38)' : 'rgba(0, 0, 0, 0.6)'
                }
                className={`h-4 w-4 ${option.disabled ? 'opacity-50' : ''}`}
              />
            )}

            {/* Option label */}
            <span
              className={`text-sm font-medium ${option.disabled ? 'text-gray-400' : option.danger ? 'text-red-600' : 'text-gray-700'} `}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThreeDotMenu;
