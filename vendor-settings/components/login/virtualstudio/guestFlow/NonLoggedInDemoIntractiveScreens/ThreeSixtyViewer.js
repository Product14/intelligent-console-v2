import React, { useState, useEffect, useRef } from 'react';
import { GUEST_DEMO_SAMPLE } from './config';
import { useTranslation } from 'react-i18next';

const ThreeSixtyViewer = ({ interval = 100, imageUrls }) => {
  const imageCount = imageUrls?.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [initialBounce, setInitialBounce] = useState(true);
  const [showSlideFinger, setShowSlideFinger] = useState(true);
  const [totalDiff, setTotalDiff] = useState(0);
  const initialClientX = useRef(null);
  const {t:translate} = useTranslation()
  
  const handlePointerMove = (e) => {
    const threshold = 5; // Increase the threshold to make it slower
    setShowSlideFinger(false);
    if (dragging) {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      if (initialClientX.current === null) {
        initialClientX.current = clientX;
      }

      if (clientX !== undefined) {
        const diff = clientX - initialClientX.current;
        setTotalDiff((prevDiff) => prevDiff + diff);
        initialClientX.current = clientX;

        if (totalDiff > threshold) {
          setCurrentIndex((prevIndex) => (prevIndex - 1 + imageCount) % imageCount);
          setTotalDiff(0); // Reset the total difference after the transition
        } else if (totalDiff < -threshold) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % imageCount);
          setTotalDiff(0); // Reset the total difference after the transition
        }
      }
    }
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Handle pointer interactions
  const handlePointerDown = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX !== undefined) {
      setStartX(clientX);
      setDragging(true);
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    setDragging(false);
  };


  // Preload images
  useEffect(() => {
    const images = [];
    imageUrls?.forEach((url) => {
      const img = new Image();
      img.src = url;
      images.push(img);
    });
  }, [imageUrls]);

  // Initial bounce effect
  useEffect(() => {
    if (initialBounce && imageCount > 0) {
      const bounceInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageCount);
      }, interval / 2);

      setTimeout(() => {
        clearInterval(bounceInterval);
        setInitialBounce(false);
      }, 1000); // Bounce for 2 seconds
    }
  }, [initialBounce, interval, imageCount]);

  useEffect(() => {
    const handlePointerMoveDocument = (e) => {
      if (dragging) {
        handlePointerMove(e);
      }
    };
    const handlePointerUpDocument = (e) => {
      if (dragging) {
        handlePointerUp(e);
      }
    };

    document.addEventListener('pointermove', handlePointerMoveDocument);
    document.addEventListener('pointerup', handlePointerUpDocument);

    return () => {
      document.removeEventListener('pointermove', handlePointerMoveDocument);
      document.removeEventListener('pointerup', handlePointerUpDocument);
    };
  }, [dragging]);

  return (
    <div className={`relative w-full overflow-hidden flex justify-center items-center object-cover`}
    >
      {!isImageLoaded &&
            <div className="rounded-lg absolute inset-0 h-full object-cover aspect-video shimmer min-h-[23vh] sm:min-h-[20vh] w-full flex items-center justify-center border text-gray-500 text-xl"></div>
      }
      {imageUrls?.length > 0 && (
        <img 
        style={{cursor:`url(${GUEST_DEMO_SAMPLE.customCursor}) 16 16, auto`}}
        src={imageUrls[currentIndex]} alt="360_view"
        className={`aspect-video select-none h-full w-full rounded-lg sm:rounded-none sm:rounded-t-lg object-cover ${dragging ? 'dragging' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          draggable="false"
          onLoad={handleImageLoad}
        />
      )}
      {showSlideFinger && (
        <div className='absolute top-[70%] sm:top-3/4 left-[85%] sm:left-1/2 md:-ml-20 max-md:-ml-[108px] rounded-3xl w-min bg-black-60 py-0.5 sm:py-1.5 px-5 gap-2 flex justify-center items-center'>
          <img src={GUEST_DEMO_SAMPLE.hand360} className='h-2 sm:h-5 w-2 sm:w-5' />
          <div className='whitespace-nowrap text-[.4rem] sm:text-sm font-medium leading-5 text-white'>{translate("console.screens.virtualStudio.commonGuest.featurePage.spin_360.view360spin")}</div>
        </div>
      )}
    </div>
  );
};

export default ThreeSixtyViewer;