'use client';

import React, { useEffect, useRef, useState } from 'react';

function BottomMobileDrawer({
  isOpen = false,
  onClose,
  children,
  height = '80%',
  overlay = true,
  showCloseButton = true,
  closeOnClickOutside = true,
}) {
  const drawerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        isOpen &&
        closeOnClickOutside
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const getDrawerStyles = () => {
    const baseStyles =
      'fixed bg-white shadow-lg transition-transform duration-300 ease-in-out z-30 overflow-y-auto hide-scrollbar';

    return {
      className: `${baseStyles} bottom-0 left-0 w-full rounded-t-3xl`,
      style: {
        height,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
      },
    };
  };

  const drawerStyles = getDrawerStyles();

  return (
    <div
      className="fixed inset-0 z-[100]"
      aria-labelledby="drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {overlay && (
        <div
          className={`fixed inset-0 bg-gray-500 transition-opacity duration-300 ${isOpen ? 'bg-opacity-75' : 'bg-opacity-0'}`}
          onClick={closeOnClickOutside ? onClose : undefined}
        />
      )}

      <div
        ref={drawerRef}
        className={drawerStyles.className}
        style={drawerStyles.style}
      >
        {showCloseButton && (
          <div className="sticky top-0 flex justify-center bg-white pb-2 pt-3">
            <button
              onClick={onClose}
              className="flex h-6 w-12 items-center justify-center"
              aria-label="Close drawer"
            >
              <div className="h-1 w-12 rounded-full bg-gray-300"></div>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default BottomMobileDrawer;
