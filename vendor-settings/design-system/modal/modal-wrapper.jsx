import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Close } from '@spyne-console/design-system/icons';

import { useOnClickOutside } from '@spyne-console/hooks';
import { useScrollLock } from '@spyne-console/hooks';

import { cn } from '@spyne-console/utils/cn';

export default function ModalWrapper({
  children,
  isOpen,
  onClose,
  className,
  allowClose = true,
  closeButtonColor = 'black',
  wrapperClassName = '',
  ignoreOutsideClickForDropdown = false,
  backdropClassName = '',
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Only close if click is outside both trigger and menu
  // and not within any data-dropdown-content element
  useOnClickOutside(modalRef, (e) => {
    // Prevent modal close if click is inside a dropdown menu
    if (
      ignoreOutsideClickForDropdown &&
      e.target.closest('[data-dropdown-content]')
    )
      return;

    if (allowClose) onClose();
  });

  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (isOpen && allowClose && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        focusableElements[0].focus();
      } else {
        modalRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, allowClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto',
        wrapperClassName
      )}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className={cn(
          'fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm transition-opacity',
          backdropClassName
        )}
        onClick={allowClose ? onClose : undefined}
        style={{ pointerEvents: 'auto' }}
      />

      <div
        ref={modalRef}
        data-modal-root
        tabIndex={-1}
        className={cn(
          'relative mx-4 w-full max-w-[570px] rounded-xl bg-white p-6 shadow-lg outline-none focus:outline-none',
          'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400',
          className
        )}
        style={{
          pointerEvents: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB transparent',
          msOverflowStyle: 'auto',
        }}
      >
        {allowClose && (
          <button
            type="button"
            className="absolute right-6 top-6 z-10 cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <Close className={`fill-${closeButtonColor}`} />
          </button>
        )}
        {children}
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(modalContent, modalRoot);
}
