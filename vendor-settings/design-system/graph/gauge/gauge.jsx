'use client';

import React from 'react';

import GaugeLabels from './gauge-labels';
import GaugeSVG from './gauge-svg';
import GaugeValue from './gauge-value';

const GaugeComponent = ({
  price = '$ 2,044',
  value = '$ 2,044',
  label = 'Selling price',
  level = 'low',
  sellingPrice,
  profit = 0,
  profitRanges = {
    LOW: 0,
    MEDIUM: 1000,
    GOOD: 2000,
    HIGH: 3000,
  },
  className,
  keyArrowClass,
}) => {
  // Calculate rotation based on profit ranges
  const getRotation = () => {
    // If profit is negative or 0, return minimum rotation (-90 degrees)
    if (profit <= profitRanges.LOW) return -90;

    // If profit is above HIGH range, return maximum rotation (90 degrees)
    if (profit >= profitRanges.HIGH) return 90;

    // Calculate rotation based on which range the profit falls into
    if (profit < profitRanges.MEDIUM) {
      // Between LOW and MEDIUM
      const range = profitRanges.MEDIUM - profitRanges.LOW;
      const progress = (profit - profitRanges.LOW) / range;
      return -90 + progress * 60; // -90 to -30 degrees
    } else if (profit < profitRanges.GOOD) {
      // Between MEDIUM and GOOD
      const range = profitRanges.GOOD - profitRanges.MEDIUM;
      const progress = (profit - profitRanges.MEDIUM) / range;
      return -30 + progress * 60; // -30 to 30 degrees
    } else {
      // Between GOOD and HIGH
      const range = profitRanges.HIGH - profitRanges.GOOD;
      const progress = (profit - profitRanges.GOOD) / range;
      return 30 + progress * 60; // 30 to 90 degrees
    }
  };

  const rotation = getRotation();

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <section
        className={`relative flex h-[123px] w-[322px] items-center justify-center max-md:w-full max-md:max-w-[322px] max-sm:h-auto max-sm:w-full max-sm:max-w-[300px] ${className}`}
      >
        <article className="flex size-full w-full items-center justify-center px-5 pb-0 pt-1.5">
          <div className="flex h-[118px] w-full flex-col items-center max-sm:scale-90">
            {/* <div className="flex relative flex-col items-center h-[118px] w-[195px] max-sm:scale-90"> */}
            <GaugeSVG level={level} sellingPrice={sellingPrice} />
            <GaugeValue value={price} />
            <GaugeLabels />

            {/* dial */}
            <div
              className="absolute origin-bottom"
              style={{ transform: `rotate(${rotation}deg)`, bottom: '10%' }}
            >
              <div
                className={`h-[4.5rem] w-[6px] rounded-full bg-black ${keyArrowClass}`}
                style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
              />
            </div>
          </div>
        </article>
      </section>
    </>
  );
};

export default GaugeComponent;
