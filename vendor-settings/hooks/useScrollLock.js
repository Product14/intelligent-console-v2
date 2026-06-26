import { useEffect, useRef } from 'react';

const useScrollLock = (
  shouldLock,
  { lockClass = 'scroll-lock', reserveScrollbarGap = true } = {}
) => {
  const scrollPosition = useRef(0);
  const originalOverflow = useRef('');
  const originalPaddingRight = useRef('');
  const scrollbarWidth = useRef(0);

  useEffect(() => {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText =
      'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);

    scrollbarWidth.current = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    document.body.removeChild(scrollDiv);
  }, []);

  useEffect(() => {
    if (!document || !document.body) return;

    const hasScrollbar =
      window.innerWidth > document.documentElement.clientWidth;

    // Store original styles
    if (shouldLock) {
      // Save the current scroll position
      scrollPosition.current =
        window.pageYOffset || document.documentElement.scrollTop;

      // Save original styles before modifying
      originalOverflow.current = document.body.style.overflow;
      originalPaddingRight.current = document.body.style.paddingRight;

      // Apply scroll locking
      document.body.style.overflow = 'hidden';
      document.body.classList.add(lockClass);

      // Prevent layout shift if we have a scrollbar and option is enabled
      if (hasScrollbar && reserveScrollbarGap) {
        document.body.style.paddingRight = `${scrollbarWidth.current}px`;
      }

      // Fix the position of the body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore original styles
      document.body.style.overflow = originalOverflow.current;
      document.body.style.paddingRight = originalPaddingRight.current;
      document.body.classList.remove(lockClass);

      // Restore scroll position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition.current);
    }

    // Clean up function
    return () => {
      if (shouldLock) {
        document.body.style.overflow = originalOverflow.current;
        document.body.style.paddingRight = originalPaddingRight.current;
        document.body.classList.remove(lockClass);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition.current);
      }
    };
  }, [shouldLock, lockClass, reserveScrollbarGap]);

  // Return methods to manually control scroll locking if needed
  return {
    lockScroll: () => {
      if (!shouldLock) {
        console.warn(
          'useScrollLock: Manual lockScroll called while shouldLock is false.'
        );
      }
    },
    unlockScroll: () => {
      if (shouldLock) {
        console.warn(
          'useScrollLock: Manual unlockScroll called while shouldLock is true.'
        );
      }
    },
  };
};

export default useScrollLock;
