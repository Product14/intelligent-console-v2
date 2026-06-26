import React from 'react';

import { CiButton } from '../button/ci-button';

export interface ConfirmationModalProps {
  /** The main heading text for the modal */
  heading: string;
  /** The description text explaining the action */
  description: string;
  /** Whether the modal is open/visible */
  isOpen: boolean;
  /** Callback fired when the confirm button is clicked */
  onConfirm: () => void;
  /** Callback fired when the cancel button is clicked or modal is dismissed */
  onCancel: () => void;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Whether the confirm action is loading */
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  heading,
  description,
  isOpen,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 left-1/2 top-1/2 z-50 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-[12px] bg-white p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        aria-describedby="modal-description"
      >
        <div className="relative box-border flex w-full flex-col content-stretch items-start gap-[16px] overflow-clip p-[24px]">
          {/* Header */}
          <div className="relative flex w-full shrink-0 flex-col content-stretch items-start gap-[8px] not-italic leading-[0]">
            <div className="relative flex shrink-0 flex-col justify-center text-nowrap font-['Inter:Semi_Bold',_sans-serif] text-[18px] font-semibold text-neutral-950">
              <p id="modal-heading" className="whitespace-pre leading-[28px]">
                {heading}
              </p>
            </div>
            <div
              className="relative flex min-w-full shrink-0 flex-col justify-center font-['Inter:Regular',_sans-serif] text-[14px] font-normal text-[#8f8f8f]"
              style={{ width: 'min-content' }}
            >
              <p id="modal-description" className="leading-[20px]">
                {description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex w-full items-center justify-end gap-3">
            <CiButton
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </CiButton>
            <CiButton
              variant="primary"
              onClick={onConfirm}
              loading={isLoading}
              disabled={isLoading}
            >
              {confirmText}
            </CiButton>
          </div>
        </div>

        {/* Border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[12px] border border-solid border-slate-200"
        />
      </div>
    </div>
  );
};

export default ConfirmationModal;
