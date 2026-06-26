import React from 'react';

interface ModalsProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  displayClass?: string;
}

export default function Modals({
  children,
  isOpen,
  onClose,
  className = '',
  displayClass = '',
}: ModalsProps) {
  const handleOverlayClick = (): void => {
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Prevent click event from propagating to parent modal
    e.stopPropagation();
  };

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${displayClass}`}
        >
          <div
            className="fixed inset-0 bg-black opacity-70"
            onClick={handleOverlayClick}
          ></div>
          <div
            className={`absolute overflow-hidden ${className}`}
            onClick={handleModalClick}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}
