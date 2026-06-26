import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import SVG from '@spyne-console/design-system/svg';

const OptionsPopup = ({
  options,
  rowKey = undefined,
  buttonContent,
  buttonClassName,
  onHover = false,
  popoverClassName = '',
  optionsClassName = '',
  type = '',
  parentBgId = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyles, setPopoverStyles] = useState({});
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  // Calculate the popover position when it opens
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const calculatePosition = () => {
      const buttonRect = buttonRef.current.getBoundingClientRect();

      // Calculate position relative to viewport
      const top = buttonRect.bottom + window.scrollY;
      const right = window.innerWidth - buttonRect.right + window.scrollX;

      setPopoverStyles({
        position: 'fixed',
        top: `${top}px`,
        right: `${right}px`,
        transform: 'translateZ(0)',
      });
    };

    calculatePosition();

    // Recalculate on scroll or resize
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

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

  const handleMouseEnter = () => {
    if (onHover) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      setIsOpen(false);
    }
  };

  const handleOptionClick = (option) => {
    if (option.onClick) {
      option.onClick(rowKey, parentBgId, type);
      setIsOpen(false);
    }
  };

  return (
    <div
      className="relative isolate h-8 w-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Three dots button */}
      <button
        ref={buttonRef}
        onClick={() => !onHover && setIsOpen(!isOpen)}
        className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${buttonClassName}`}
      >
        {buttonContent || (
          <SVG
            iconName="threeDotIcon"
            className="h-4 w-4 fill-black/60 md:fill-black/60"
          />
        )}
      </button>

      {/* Popover menu rendered via Portal */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            className={`w-40 origin-top-right overflow-visible rounded-lg border border-gray-200 bg-white shadow-lg ${popoverClassName}`}
            style={popoverStyles}
          >
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`hover:bg-black-1 flex w-full items-center justify-between px-4 py-[10px] first:rounded-t-lg last:rounded-b-lg ${optionsClassName}`}
              >
                <div className="flex items-center gap-3">
                  {typeof option?.icon === 'string' ? (
                    <SVG
                      iconName={option?.icon}
                      color="rgba(0, 0, 0, 0.6)"
                      className="h-4 w-4"
                    />
                  ) : (
                    option?.icon
                  )}
                  <span className="text-black-60 text-sm font-medium">
                    {option?.label}
                  </span>
                </div>
                {option?.icon2 && option?.icon2}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export { OptionsPopup };
export default OptionsPopup;
