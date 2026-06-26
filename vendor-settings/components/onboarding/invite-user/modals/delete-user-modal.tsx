import { Button } from '@spyne-console/design-system';

import React from 'react';

import { Delete } from '@spyne-console/design-system/icons';
import ModalWrapper from '@spyne-console/design-system/modal/modal-wrapper';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteUserModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteUserModalProps) => {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[400px]"
      allowClose={!isLoading}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="border-wisp-pink mx-auto mb-5 flex h-fit w-fit items-center justify-center rounded-full border-8 bg-[#FEE4E2] p-3">
          <Delete className="fill-red h-5 w-5" />
        </div>

        {/* Title */}
        <h2 className="mb-3 font-['Inter'] text-xl font-semibold leading-7 text-black/90">
          Delete User
        </h2>

        {/* Description */}
        <p className="mb-8 font-['Inter'] text-base font-normal leading-6 text-black/60">
          Are you sure you want to delete this user?
        </p>

        {/* Actions */}
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            label="Cancel"
            type="bordered"
            onClick={onClose}
            disabled={isLoading}
            className="h-12 w-full min-w-[140px] rounded-lg"
          />
          <Button
            label="Delete"
            type="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full min-w-[140px] rounded-lg !bg-[#C31812] hover:!bg-red-700"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default DeleteUserModal;
