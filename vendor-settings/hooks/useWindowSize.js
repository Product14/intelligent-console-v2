'use client';

import { useEffect, useState } from 'react';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window?.innerWidth,
        height: window?.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowSize.width < 321) {
    return 'MINI';
  }
  if (windowSize.width < 640) {
    return 'MOBILE';
  }
  if (windowSize.width < 1024) {
    return 'TABLET';
  }
  if (windowSize.width < 1280) {
    return 'LAPTOP';
  }

  return 'DESKTOP';
}
