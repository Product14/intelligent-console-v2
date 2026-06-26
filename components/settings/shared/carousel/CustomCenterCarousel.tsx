'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  cardWidth?: number; // Width in pixels for each card
  cardHeight?: number; // <-- add this
}

const CustomCenterCarousel: React.FC<CarouselProps> = ({
  children,
  className = '',
  initialIndex = 0,
  onIndexChange,
  cardWidth = 300, // Default card width
  cardHeight = 200, // <-- default value, adjust as needed
}) => {
  const [centerIndex, setCenterIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = children.length;
  const cardMargin = 8; // 8px for mx-2 (2 * 0.5rem)

  // Update centerIndex when initialIndex changes
  useEffect(() => {
    setCenterIndex(initialIndex);
  }, [initialIndex]);

  // Calculate the offset to center the selected card
  const getTranslateX = () => {
    if (totalSlides === 0) return '0px';

    // Calculate the center position of the container
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const centerPosition = containerWidth / 2;

    // Calculate the position of the selected card including margins
    const cardPosition =
      centerIndex * (cardWidth + cardMargin * 2) + cardWidth / 2;

    // Return the translation needed to center the card
    return `${centerPosition - cardPosition}px`;
  };

  const handleCardClick = (index: number) => {
    setCenterIndex(index);
    onIndexChange?.(index);
  };

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative w-full overflow-visible ${className}`}
      ref={containerRef}
    >
      <div className="relative w-full" style={{ minHeight: `${cardHeight}px` }}>
        {children.map((child, index) => {
          const distanceFromCenter = index - centerIndex;
          const isActive = distanceFromCenter === 0;

          // Shrink inactive cards
          const inactiveWidth = cardWidth * 0.75;
          const width = isActive ? cardWidth : inactiveWidth;

          // Calculate the visual width after clipping (60% of original card width)
          const visualWidth = isActive ? cardWidth : cardWidth * 0.6;

          // Calculate offset so that ALL cards are adjoining
          let offset = 0;
          if (distanceFromCenter < 0) {
            // Left of center - use visual width for proper spacing
            offset = distanceFromCenter * visualWidth;
          } else if (distanceFromCenter > 0) {
            // Right of center - use visual width for proper spacing
            offset =
              cardWidth / 2 +
              visualWidth / 2 +
              20 +
              (distanceFromCenter - 1) * visualWidth;
          }

          // Z-index: closer to center = higher z-index
          let zIndex = children.length - Math.abs(distanceFromCenter);

          // All inactive cards clip from the right (20% to achieve 60% final width)
          const clipStyle = isActive
            ? { clipPath: 'none' }
            : { clipPath: 'inset(0 20% 0 0)' };

          return (
            <div
              key={index}
              className="absolute left-1/2 top-0 cursor-pointer transition-all duration-300"
              style={{
                transform: `translateX(${offset}px) translateX(-50%)`,
                width: `${width}px`,
                minWidth: `${width}px`,
                height: `${cardHeight}px`,
                zIndex,
                opacity: Math.abs(distanceFromCenter) > 2 ? 0 : 1,
                pointerEvents:
                  Math.abs(distanceFromCenter) > 2 ? 'none' : 'auto',
                overflow: 'hidden',
                ...clipStyle,
              }}
              onClick={() => handleCardClick(index)}
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCenterCarousel;
