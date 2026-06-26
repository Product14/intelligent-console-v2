'use client';

import React from 'react';

import Image from 'next/image';

import Button from '@spyne-console/design-system/button';
import { Close } from '@spyne-console/design-system/icons';

import ModalWrapper from './modal-wrapper';

export default function DeleteModal({
  isOpen,
  onClose,
  onDelete,
  title,
  message,
  isLoading,
}) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      allowClose={false}
      className="w-full max-w-md"
    >
      <div className="pointer-events-auto relative flex w-full flex-col outline-none">
        <div className="mx-auto flex text-center">
          <Image
            src="https://spyne-static.s3.amazonaws.com/console/icons/deleteRedIcon.svg"
            alt=""
            height={55}
            width={55}
          />
          <div
            className="absolute right-0 top-0 cursor-pointer"
            onClick={onClose}
          >
            <Close className="h-6 w-6 fill-black/60" />
          </div>
        </div>
        <div className="relative mb-6 mt-5 text-center">
          <h3 className="mb-2 text-lg font-semibold text-black/90">{title}</h3>
          <p className="text-black-60 text-sm font-normal">{message}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onClose}
            type="bordered"
            className="w-full"
            size="AA"
            label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            type="red"
            className="w-full"
            size="AA"
            label="Delete"
            disabled={isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
