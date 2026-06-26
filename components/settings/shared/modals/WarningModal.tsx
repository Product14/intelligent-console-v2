import React from 'react';
import { RxCross2 } from 'react-icons/rx';

import Button from '@spyne-console/design-system/button';
import { Error } from '@spyne-console/design-system/icons';

import Modal from './Modals';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  headerIcon?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showConfirm?: boolean;
}

export default function WarningModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Warning',
  description = '',
  headerIcon,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showConfirm = false,
}: WarningModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    // Prevent clicks inside modal content from closing the modal
    e.stopPropagation();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-md rounded-xl bg-white shadow-xl"
      displayClass="z-[70]"
    >
      <div onClick={handleModalContentClick}>
        {/* Centered Error Icon with layered background and Close button */}
        <div className="flex items-start justify-between px-6 pt-4">
          {/* Empty div for spacing */}
          <div className="w-8"></div>

          {/* Centered Error Icon */}
          <div className="flex justify-center">
            {/* Outer layer with lower opacity */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#FFFAEB] border-opacity-50 bg-[#FEF0C7] bg-opacity-20">
              {/* Middle layer */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#FFFAEB] border-opacity-70 bg-[#FEF0C7] bg-opacity-30">
                {/* Inner layer with full opacity */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#FFFAEB] bg-[#FEF0C7]">
                  <Error className="h-6 w-6 fill-[#DC6803]" />
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          >
            <RxCross2 className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Header */}
        <div className="px-6 py-4 text-center">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      {children && (
        <div className="px-6 py-4">
          <div className="my-5 h-max overflow-y-auto">{children}</div>
        </div>
      )}

      {/* Footer */}
      <div className="flex w-full justify-center gap-3 border-gray-200 px-6 py-4">
        <Button
          className="h-[48px] w-[45%] rounded-xl font-semibold"
          type="bordered"
          label={cancelText}
          onClick={onClose}
        />
        {showConfirm && onConfirm && (
          <Button
            className="h-[48px] w-[45%] rounded-xl font-semibold"
            type="primary"
            label={confirmText}
            onClick={handleConfirm}
          />
        )}
      </div>
    </Modal>
  );
}
