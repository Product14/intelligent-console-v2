'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { RxCross2 } from 'react-icons/rx';

import Button from '@spyne-console/design-system/button';

interface CreateModalProps {
  icon: React.ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  error?: string;
  maxWidth?: string;
  // Step functionality
  currentStep?: number;
  totalSteps?: number;
}

const CreateModal: React.FC<CreateModalProps> = ({
  icon,
  title,
  isOpen,
  onClose,
  onConfirm,
  children,
  isLoading = false,
  isConfirmDisabled = false,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  error,
  maxWidth = 'max-w-[600px]',
  currentStep,
  totalSteps,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose} />

      <div
        className={`relative mx-4 w-full ${maxWidth} rounded-xl bg-white p-3 shadow-[0px_4px_60px_0px_rgba(0,0,0,0.16)]`}
      >
        <div className="relative rounded-lg border border-[#f0f0f0] bg-white">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] p-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-100 p-1.5">
                  {icon}
                </div>
                <h2 className="text-sm font-semibold text-gray-950">{title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-5 w-5 items-center justify-center text-gray-600 transition-colors hover:text-gray-800"
            >
              <RxCross2 className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">{children}</div>

          {error && (
            <div className="px-6 pb-4">
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2.5">
          {/* Step indicator - left aligned */}
          <div className="flex items-center">
            {currentStep && totalSteps && (
              <span className="text-xs font-medium text-neutral-950">
                Step {currentStep} of {totalSteps}
              </span>
            )}
          </div>

          {/* Buttons - right aligned */}
          <div className="ml-1 flex items-center gap-3">
            <Button
              label={cancelLabel}
              type="bordered"
              disabled={isLoading}
              onClick={onClose}
              className="h-9 w-[100px] text-sm"
              icon={null}
              iconUrl=""
            />
            <Button
              label={confirmLabel}
              type="primary"
              onClick={onConfirm}
              isLoading={isLoading}
              disabled={isConfirmDisabled || isLoading}
              className="h-9 w-[100px] bg-[#4600f2] text-sm hover:bg-[#4600f2]/90 disabled:cursor-not-allowed disabled:bg-gray-300"
              icon={null}
              iconUrl=""
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level, outside any parent containers
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export default CreateModal;
