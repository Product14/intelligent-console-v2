import { useEffect, useRef } from 'react';

const useTouchNavigation = ({
  ref,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}) => {
  const touchStartX = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      if (e.touches.length > 1) return; // Ignore multi-touch
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX.current - touchEndX;

      if (Math.abs(distance) > threshold) {
        if (distance > 0) {
          // Swiped left
          onSwipeLeft();
        } else {
          // Swiped right
          onSwipeRight();
        }
      }

      touchStartX.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
};

export default useTouchNavigation;
