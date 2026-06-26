import React, { useState } from 'react';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

import Image from 'next/image';

import Skeleton from '@spyne-console/design-system/skeleton';

export default function BeforeAfterImageComparisonSlider({
  beforeImageUrl,
  afterImageUrl,
  fallbackImageUrl,
  className = '',
  initialPosition = 50,
  onPositionChange,
  onBeforeClick,
  onAfterClick,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const handleImageLoad = () => {
    setShowSkeleton(false);
  };

  const handlePositionChange = (position) => {
    if (position.isDragging) {
      setIsDragging(true);
      setSliderPosition(position.position);
    } else {
      setIsDragging(false);
    }

    if (onPositionChange) {
      onPositionChange(position);
    }
  };

  const beforeSrc = beforeImageUrl || fallbackImageUrl;
  const afterSrc = afterImageUrl || fallbackImageUrl;

  return (
    <div className={`relative w-full ${className}`}>
      <ReactCompareSlider
        className="w-full overflow-hidden rounded-xl"
        handle={
          <div
            className={`relative flex h-full w-1 cursor-col-resize items-center justify-center bg-white/80 ${isDragging ? 'scale-110' : 'scale-100'}`}
          >
            <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-full bg-white/80">
              <Image
                src="https://spyne-static.s3.us-east-1.amazonaws.com/console/combined-vs/compareslidermover.svg"
                alt="compare-slider-handle"
                className="h-12 w-12 cursor-pointer"
                width={48}
                height={48}
              />
            </div>
          </div>
        }
        position={sliderPosition}
        onPositionChange={handlePositionChange}
        itemOne={
          <ReactCompareSliderImage
            className="before-image relative h-full w-full cursor-pointer !rounded-xl !object-contain"
            src={beforeSrc}
            srcSet={beforeSrc}
            alt="Before Image"
            onLoad={handleImageLoad}
            onClick={onBeforeClick}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            className="after-image relative h-full w-full cursor-pointer !rounded-xl bg-white !object-contain"
            src={afterSrc}
            srcSet={afterSrc}
            alt="After Image"
            onLoad={handleImageLoad}
            onClick={onAfterClick}
          />
        }
        style={{
          pointerEvents: isDragging ? 'auto' : 'none',
          touchAction: 'pan-y',
          transition: isDragging ? 'none' : 'all 0.3s ease',
        }}
        changePositionOnHover={false} // Disable position change on hover
        keyboardIncrement={0} // Disable keyboard controls
        onlyHandleDraggable={true}
      />
      {showSkeleton && (
        <Skeleton classSTYLE="h-full w-full rounded-xl absolute top-0 left-0" />
      )}
    </div>
  );
}
