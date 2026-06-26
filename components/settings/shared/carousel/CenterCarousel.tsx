import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';

import classNames from 'classnames';

interface SlideRendererProps {
  slide: React.ReactNode;
  index: number;
  isActive: boolean;
  isTarget: boolean;
  inactiveCardWidth: number;
  activeCardWidth: number;
  cardHeight: number;
  moveTo: (index: number) => void;
  isTransitioning: boolean;
  isSmallScreen?: boolean;
  isLoading?: boolean;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({
  slide,
  index,
  isActive,
  isTarget,
  inactiveCardWidth,
  activeCardWidth,
  cardHeight,
  isTransitioning,
  moveTo,
  isSmallScreen,
  isLoading,
}) => {
  const transitionDuration = 300;
  const comparator = isTransitioning ? isTarget : isActive;
  const slideWidth = comparator ? activeCardWidth : inactiveCardWidth;

  return (
    <div
      className={classNames('cursor-pointer', {
        'is-loading': isLoading && !isSmallScreen,
      })}
      onClick={() => moveTo(index)}
      style={{
        width: `${isSmallScreen ? 320 : slideWidth}px`,
        overflow: 'hidden',
        height: `${cardHeight}px`,
        transition: `width ${transitionDuration}ms cubic-bezier(0.4,0,0.2,1)`,
      }}
    >
      {slide}
    </div>
  );
};

interface CenterCarouselProps {
  slides: React.ReactNode[];
  options: Settings;
  cardHeight: number;
  activeCardWidth: number;
  inactiveCardWidth: number;
  defaultCardWidth: number;
  showDots?: boolean;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  isSmallScreen?: boolean;
  isLoading?: boolean;
  forceCenterCarousel?: boolean;
}

const CenterCarousel = forwardRef<any, CenterCarouselProps>(
  (
    {
      slides,
      options,
      onIndexChange,
      initialIndex = -1,
      cardHeight = 384,
      activeCardWidth = 350,
      inactiveCardWidth = 320,
      isSmallScreen = false,
      isLoading = false,
      forceCenterCarousel = false,
    },
    ref
  ) => {
    const [currentSlide, setCurrentSlide] = useState(initialIndex);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetSlide, setTargetSlide] = useState<number | null>(initialIndex);
    const sliderRef = useRef<Slider>(null);

    useEffect(() => {
      // Wait for next tick to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 0);

      return () => clearTimeout(timer);
    }, []);

    React.useImperativeHandle(ref, () => ({
      slickNext: () => sliderRef.current?.slickNext(),
      slickPrev: () => sliderRef.current?.slickPrev(),
      slickGoTo: (index: number) => sliderRef.current?.slickGoTo(index),
    }));

    const settings: Settings = {
      className: 'center',
      arrows: false,
      focusOnSelect: isSmallScreen,
      afterChange: (slideIndex: number) => {
        setCurrentSlide(slideIndex);
        setIsTransitioning(false);
        onIndexChange?.(slideIndex);
      },
      beforeChange: (current: number, next: number) => {
        if (!isSmallScreen) {
          setIsTransitioning(true);
          setTargetSlide(next);
        }
      },
      ...options,
    };

    const handleSlideClick = (index: number) => {
      if (index === currentSlide || isSmallScreen) {
        return;
      }
      setIsTransitioning(true);
      setTargetSlide(index);
      let targetCardIndex = index;

      if (!isSmallScreen) {
        const n = slides?.length ?? 0;
        const distanceRight = (index - currentSlide + n) % n;
        const distanceLeft = (currentSlide - index + n) % n;

        targetCardIndex = index;
        // If moving right is shorter, but it requires wrapping around backwards (e.g. from slide 4 to 0)
        // We calculate a target index that is "after" the current set of slides
        if (distanceRight < distanceLeft && index < currentSlide) {
          targetCardIndex = currentSlide + distanceRight;
        }
        // If moving left is shorter, but it requires wrapping around forwards (e.g. from slide 0 to 4)
        // We calculate a target index that is "before" the current set of slides
        else if (distanceLeft < distanceRight && index > currentSlide) {
          targetCardIndex = currentSlide - distanceLeft;
        }
      }

      setTimeout(() => {
        sliderRef.current?.slickGoTo(targetCardIndex);
      }, 300); // Animation duration
    };

    if (!isInitialized) {
      const effectiveSlidesToShow =
        options.slidesToShow || settings.slidesToShow || 3;
      return (
        <div className="flex flex-row overflow-hidden px-10">
          {slides.slice(0, effectiveSlidesToShow).map((slide, index) => (
            <div
              key={index}
              className="px-4"
              style={{
                width: `${100 / effectiveSlidesToShow}%`,
              }}
            >
              {slide}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="relative w-full overflow-visible">
        <div className="overflow-visible">
          <style jsx global>{`
            .slick-list {
              overflow: unset !important;
            }
            ${forceCenterCarousel
              ? `.slick-track {
                display: flex;
                justify-content: center;
              }`
              : ''}
          `}</style>
          <Slider ref={sliderRef} {...settings}>
            {slides.map((slide, index) => {
              if (isLoading) {
                return (
                  <div key={index} className="px-4">
                    {slide}
                  </div>
                );
              }
              return (
                <SlideRenderer
                  key={index}
                  slide={slide}
                  index={index}
                  isActive={index === currentSlide}
                  isTarget={index === targetSlide}
                  inactiveCardWidth={inactiveCardWidth}
                  activeCardWidth={activeCardWidth}
                  cardHeight={cardHeight}
                  moveTo={() => handleSlideClick(index)}
                  isTransitioning={isTransitioning}
                  isSmallScreen={isSmallScreen}
                  isLoading={isLoading}
                />
              );
            })}
          </Slider>
        </div>
      </div>
    );
  }
);

CenterCarousel.displayName = 'CenterCarousel';

export default CenterCarousel;
