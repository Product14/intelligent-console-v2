import React from 'react';

import Image from 'next/image';

import Button from '@spyne-console/design-system/button/button';

import ModalWrapper from './modal-wrapper';

function Modal({
  topImage,
  heading,
  subHeading,
  content,
  btn1Text,
  btn1Action,
  btn2Text,
  btn2Action,
  setOpenModal,
}) {
  return (
    <ModalWrapper setOpenModal={setOpenModal}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {topImage && (
            <Image src={topImage} alt="Modal Icon" height={55} width={55} />
          )}
          <div>
            <h1 className="text-lg font-semibold leading-7 text-black">
              {heading}
            </h1>
            <p className="text-sm font-normal leading-5 text-gray-500">
              {subHeading}
            </p>
          </div>
        </div>
        <button
          aria-label="Close Modal"
          className="text-black-60 text-xl focus:outline-none"
          onClick={() => setOpenModal(false)}
        >
          &#10005;
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-4">
        <div className="grid grid-cols-12 gap-2">{content}</div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 p-4">
        {btn1Text && (
          <Button
            type="primary"
            label={btn1Text}
            onClick={btn1Action}
            className="w-full"
            size="AA"
          />
        )}
        {btn2Text && (
          <Button
            type="bordered"
            label={btn2Text}
            onClick={btn2Action}
            className="w-full"
            size="AA"
          />
        )}
      </div>
    </ModalWrapper>
  );
}

export default Modal;
