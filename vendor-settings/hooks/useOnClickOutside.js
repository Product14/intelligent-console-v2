import { useEffect } from 'react';

/**
 * A custom hook that handles clicks outside of a referenced element.
 * Useful for modals, dropdowns, or any component that should close when clicking outside.
 *
 * @param {React.RefObject} ref - The ref object attached to the element to monitor
 * @param {Function} handler - The callback function to execute when clicking outside
 */
export default function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Check if the click target is within any element marked with data-modal-root
      // This allows for nested modals or other components that should prevent outside-click handling
      // Components can be marked with data-modal-root attribute to be included in this check
      if (event.target.closest('[data-modal-root]') !== null) {
        return;
      }

      // If either:
      // 1. The ref doesn't exist, or
      // 2. The click was inside the ref element
      // Then we don't want to trigger the handler
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // If we get here, the click was outside the ref element
      // and not within any data-modal-root elements
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup: remove event listeners when the component unmounts
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run effect if ref or handler changes
}
