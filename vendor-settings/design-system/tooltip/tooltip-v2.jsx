import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoMdInformationCircleOutline } from 'react-icons/io';

import PropTypes from 'prop-types';

/**
 * ToolTipV2 Component
 *
 * A reusable tooltip component that displays additional information when hovering over an icon.
 * The tooltip can be positioned in four different directions: right, left, top, or bottom.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The main heading text of the tooltip
 * @param {string} props.description - The detailed description text of the tooltip
 * @param {React.ComponentType} [props.icon=IoMdInformationCircleOutline] - Custom icon component to display
 * @param {('right'|'left'|'top'|'bottom')} [props.position='right'] - Position of the tooltip relative to the icon
 *
 * @example
 * // Basic usage with default icon and position
 * <ToolTipV2
 *   title="Minimum Count"
 *   description="VINs with fewer than 'n' images will be automatically discarded"
 * />
 *
 * @example
 * // Custom icon and position
 * <ToolTipV2
 *   title="Custom Tooltip"
 *   description="This is a custom tooltip"
 *   icon={CustomIcon}
 *   position="left"
 * />
 */
const ToolTipV2 = ({
  title,
  description,
  icon: Icon = IoMdInformationCircleOutline,
  position = 'right',
}) => {
  // State to control tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Refs for the tooltip and icon elements
  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  const updateTooltipPosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const positions = {
        right: { top: rect.top, left: rect.right + 16 },
        left: { top: rect.top, left: rect.left - 272 }, // 272px is tooltip width
        top: { top: rect.top - 80, left: rect.left - 136 }, // Center horizontally
        bottom: { top: rect.bottom + 16, left: rect.left - 136 }, // Center horizontally
      };
      setTooltipPosition(positions[position] || positions.right);
    }
  };

  useEffect(() => {
    if (showTooltip) {
      updateTooltipPosition();
      window.addEventListener('scroll', updateTooltipPosition);
      window.addEventListener('resize', updateTooltipPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateTooltipPosition);
      window.removeEventListener('resize', updateTooltipPosition);
    };
  }, [showTooltip, position]);

  return (
    <div className="relative inline-block">
      {/* Icon container with hover effects */}
      <div
        ref={iconRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help transition-colors duration-200 hover:text-violet-700"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowTooltip(!showTooltip);
          }
        }}
        aria-label={`${title} - ${description}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Tooltip content - only rendered when showTooltip is true */}
      {showTooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] w-72 rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-lg transition-opacity duration-200"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <div className="flex flex-col items-start justify-start gap-1">
              {/* Tooltip title */}
              <div className="justify-start self-stretch text-xs font-medium leading-[1.1rem] text-white">
                {title}
              </div>
              {/* Tooltip description */}
              <div className="justify-start text-xs font-normal leading-[1.1rem] text-white/60">
                {description}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

ToolTipV2.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  position: PropTypes.oneOf(['right', 'left', 'top', 'bottom']),
};

export default ToolTipV2;
