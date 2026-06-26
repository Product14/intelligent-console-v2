import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@spyne-console/utils/cn';

const DropdownWrapper = ({
  dropdownContent,
  children, // Trigger element
  isOpen,
  onClose,
  className,
  dropdownClassName,
  triggerClassName,
  closeOnScroll = true,
  closeOnOutsideClick = true,
  closeOnEscape = false,
  scrollIntoView = true, // Scroll trigger into view when dropdown opens
  position = 'bottom', // Position relative to trigger: 'bottom', 'top', 'left', 'right'
  align = 'left', // Alignment: 'left', 'right', 'center'
  offset = 4, // Default x & y offset from trigger
  verticalOffset, // Vertical offset from trigger
  horizontalOffset, // Horizontal offset from trigger
  maxHeight,
  width = 'auto',
  zIndex = 50,
  portal = true, // Whether to render in portal
  useSimplePositioning = false, // When true, uses simple absolute positioning under trigger
  triggerId = 'trigger-6', // ID for trigger element (accessibility)
  dropdownId = 'dropdown-6', // ID for dropdown element (accessibility)
  ariaLabel, // ARIA label for dropdown (accessibility)
  role = 'menu', // ARIA role for dropdown (accessibility)
}) => {
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate dropdown position based on trigger position and viewport constraints
  const calculatePosition = (rect, dropdownSize) => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const vOffset = verticalOffset ?? offset;
    const hOffset = horizontalOffset ?? offset;

    let top = 0;
    let left = 0;

    // Calculate initial position based on position and align
    if (position === 'bottom') {
      top = rect.bottom + scrollY + vOffset;
      left =
        align === 'left'
          ? rect.left + scrollX + (horizontalOffset ?? 0)
          : align === 'right'
            ? rect.right +
              scrollX -
              dropdownSize.width -
              (horizontalOffset ?? 0)
            : rect.left +
              scrollX +
              (rect.width - dropdownSize.width) / 2 +
              (horizontalOffset ?? 0);
    } else if (position === 'top') {
      top = rect.top + scrollY - dropdownSize.height - vOffset;
      left =
        align === 'left'
          ? rect.left + scrollX + (horizontalOffset ?? 0)
          : align === 'right'
            ? rect.right +
              scrollX -
              dropdownSize.width -
              (horizontalOffset ?? 0)
            : rect.left +
              scrollX +
              (rect.width - dropdownSize.width) / 2 +
              (horizontalOffset ?? 0);
    } else if (position === 'left') {
      left = rect.left + scrollX - dropdownSize.width - hOffset;
      top =
        align === 'top'
          ? rect.top + scrollY + (verticalOffset ?? 0)
          : align === 'bottom'
            ? rect.bottom +
              scrollY -
              dropdownSize.height -
              (verticalOffset ?? 0)
            : rect.top +
              scrollY +
              (rect.height - dropdownSize.height) / 2 +
              (verticalOffset ?? 0);
    } else if (position === 'right') {
      left = rect.right + scrollX + hOffset;
      top =
        align === 'top'
          ? rect.top + scrollY + (verticalOffset ?? 0)
          : align === 'bottom'
            ? rect.bottom +
              scrollY -
              dropdownSize.height -
              (verticalOffset ?? 0)
            : rect.top +
              scrollY +
              (rect.height - dropdownSize.height) / 2 +
              (verticalOffset ?? 0);
    }

    // Ensure dropdown stays within viewport
    const minLeft = scrollX;
    const maxLeft = windowWidth + scrollX - dropdownSize.width;
    const minTop = scrollY;
    const maxTop = windowHeight + scrollY - dropdownSize.height;

    // Adjust position if needed
    if (position === 'top' || position === 'bottom') {
      if (top < minTop) {
        top = rect.bottom + scrollY + vOffset;
      } else if (top > maxTop) {
        top = rect.top + scrollY - dropdownSize.height - vOffset;
      }
      left = Math.max(minLeft, Math.min(maxLeft, left));
    } else {
      if (left < minLeft) {
        left = rect.right + scrollX + hOffset;
      } else if (left > maxLeft) {
        left = rect.left + scrollX - dropdownSize.width - hOffset;
      }
      top = Math.max(minTop, Math.min(maxTop, top));
    }

    return { top, left };
  };

  // Update dropdown position based on trigger position
  const updateDropdownPosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownSize = {
      width: dropdownRef.current?.offsetWidth || 0,
      height: dropdownRef.current?.offsetHeight || 0,
    };

    const newPosition = calculatePosition(rect, dropdownSize);
    setDropdownPosition(newPosition);
    setIsPositioned(true);
  };

  // Memoized event handlers
  const handleScroll = useCallback(
    (event) => {
      const isScrollingDropdown = dropdownRef.current?.contains(event.target);
      if (isScrollingDropdown) return;
      if (closeOnScroll) {
        onClose();
      } else if (!useSimplePositioning) {
        updateDropdownPosition();
      }
    },
    [closeOnScroll]
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    },
    [onClose]
  );

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Check if trigger is outside viewport to needs to be scrolled into view
  const isOutsideViewport = () => {
    if (!triggerRef.current) return false;
    const rect = triggerRef.current.getBoundingClientRect();
    return (
      rect.bottom > window.innerHeight ||
      rect.top < 0 ||
      rect.right > window.innerWidth ||
      rect.left < 0
    );
  };

  // Event listeners
  useEffect(() => {
    if (!isOpen && !useSimplePositioning) return;

    if (scrollIntoView && isOutsideViewport()) {
      document.getElementById(triggerId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      // Add scroll listener after scrollIntoView is complete
      const timer = setTimeout(() => {
        window.addEventListener('scroll', handleScroll, true);
      }, 400); // Wait for smooth scroll to complete

      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll, true);
      };
    } else {
      // Add scroll listener immediately if no scrollIntoView
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && !useSimplePositioning) return;
    window.addEventListener('resize', updateDropdownPosition);
    return () => window.removeEventListener('resize', updateDropdownPosition);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Update position when dropdown opens
  useEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      return;
    }
    if (useSimplePositioning) {
      setIsPositioned(true);
      return;
    }
    setIsPositioned(false);
    requestAnimationFrame(updateDropdownPosition);
  }, [isOpen]);

  // Memoized dropdown content
  const dropdownContentElement = useMemo(
    () => (
      <div
        ref={dropdownRef}
        id={dropdownId}
        role={role}
        aria-label={ariaLabel}
        aria-hidden={!isOpen}
        className={cn(
          'rounded-lg border border-black/10 bg-white shadow-lg transition-opacity duration-75',
          {
            'opacity-0': !isPositioned,
            'opacity-100': isPositioned,
            'absolute left-0 top-full z-50': useSimplePositioning,
            fixed: !useSimplePositioning,
          },
          dropdownClassName
        )}
        style={
          useSimplePositioning
            ? {
                maxHeight,
                width:
                  width === 'full' ? '100%' : width === 'auto' ? 'auto' : width,
                marginTop: `${verticalOffset ?? offset}px`,
                marginLeft: `${horizontalOffset ?? offset}px`,
                visibility: isOpen ? 'visible' : 'hidden',
                zIndex,
              }
            : {
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                maxHeight,
                width:
                  width === 'full' ? '100%' : width === 'auto' ? 'auto' : width,
                zIndex,
                visibility: isOpen ? 'visible' : 'hidden',
              }
        }
      >
        {dropdownContent}
      </div>
    ),
    [
      dropdownPosition,
      isOpen,
      isPositioned,
      dropdownClassName,
      maxHeight,
      width,
      zIndex,
      dropdownId,
      role,
      ariaLabel,
      dropdownContent,
      useSimplePositioning,
      verticalOffset,
      offset,
    ]
  );

  return (
    <div className={cn('relative', className)}>
      <div
        ref={triggerRef}
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-haspopup={role}
        className={triggerClassName}
      >
        {children}
      </div>
      {isOpen &&
        (portal && !useSimplePositioning
          ? createPortal(dropdownContentElement, document.body)
          : dropdownContentElement)}
    </div>
  );
};

export default DropdownWrapper;
