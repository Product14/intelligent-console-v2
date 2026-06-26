/**
 * @format
 */
import React from 'react';

import Image from 'next/image';

import { Close } from '@spyne-console/design-system/icons';

import Button from '../button/button';
import Spinner from '../spinner/spinner';
import styles from '../styles/common/dialog.module.css';

// import ExtIntUpload from "../virtual360Spin/ext-int-upload"

function Dialog(props) {
  const handleClick = () => {
    if (props.closeDialog) {
      props.closeDialog();
      captureEvent(
        'password_has_been_reset_cross',
        {
          event_type: 'click',
        },
        false
      );
    } else if (props.btn1Click) {
      props.btn1Click();
    }
  };
  return (
    <div
      className="relative z-30"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div
          className={[
            'flex min-h-full justify-center text-center sm:p-0',
            props?.position ? props?.position : 'items-center p-4',
          ].join(' ')}
        >
          <div
            className={[
              'shadow-5xl relative flex h-full max-w-[575px] flex-col gap-8 bg-white',
              props?.modalBodyClass
                ? props?.modalBodyClass
                : 'items-center rounded-xl p-6',
              props?.width ? props?.width : 'w-[400px]',
            ].join(' ')}
          >
            {props.btn1Click && (
              <div className="absolute right-[22px] top-[22px] cursor-pointer">
                <Close className={'h-5 w-5 fill-black'} onClick={handleClick} />
              </div>
            )}
            <div className={[styles['modal-content']].join(' ')}>
              {props?.image && (
                <Image
                  src={props.image}
                  alt="Icon"
                  height={48}
                  width={48}
                  className="mb-4"
                />
              )}
              {props?.icon && props?.icon}
              <h1 className="">{props.heading}</h1>
              <p className={props.hyperlink ? 'inline' : ''}>
                {props.para}
                <small
                  onClick={props.hyperlink ? () => props.hyperlink() : null}
                  className="!text-blue-light cursor-pointer text-sm"
                >
                  {props.subText}
                </small>
              </p>
              {props?.note && (
                <div className="bg-black-5 text-gray-text mt-4 rounded-lg px-2 py-2 text-left text-[12px]">
                  {props?.noteText}
                </div>
              )}
            </div>
            {props.btn1text && props.btn2text ? (
              <div
                className={[
                  styles['modal-button'],
                  'download-modal inline-flex w-full gap-4',
                ].join(' ')}
              >
                <Button
                  type={'outline'}
                  label={props?.btn1text}
                  onClick={props.btn1Click}
                  className="w-full"
                ></Button>
                {props.showDialogLoader ? (
                  <div className="ml-[55px] flex items-center">
                    <Spinner />
                  </div>
                ) : props?.uploadEvent ? (
                  // <ExtIntUpload uploadClassStyles={"h-auto w-full"} labelClassStyles={"w-full text-center block !p-0"} buttonClassForModal prevNext selectedTab="exterior" class_name={"p-0 bg-gray-2 "} input_dropzone_box={props?.input_dropzone_box} drop_container_class={"h-auto w-full"} reUpload={props?.uploadEvent} />
                  <></>
                ) : (
                  <Button
                    type={'primary'}
                    label={props?.btn2text}
                    onClick={props.btn2Click}
                    className="w-full"
                  ></Button>
                )}
              </div>
            ) : null}
            {props.btn2text && !props.btn1text ? (
              props?.uploadEvent ? (
                // <ExtIntUpload uploadClassStyles={"h-auto w-full"} labelClassStyles={"w-full text-center block !p-0"} buttonClassForModal prevNext selectedTab="exterior" class_name={"p-0 bg-gray-2 "} input_dropzone_box={props?.input_dropzone_box} drop_container_class={"h-auto w-full"} reUpload={props?.uploadEvent} />
                <></>
              ) : (
                <div className="w-full">
                  {props.showDialogLoader ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                    </div>
                  ) : (
                    <Button
                      type={'primary'}
                      label={props?.btn2text}
                      onClick={props.btn2Click}
                      className=""
                    ></Button>
                  )}
                </div>
              )
            ) : null}
            {!props.btn2text && props.btn1text ? (
              props?.uploadEvent ? (
                // <ExtIntUpload uploadClassStyles={"h-auto w-full"} labelClassStyles={"w-full text-center block !p-0"} buttonClassForModal prevNext selectedTab="exterior" class_name={"p-0 bg-gray-2 "} input_dropzone_box={props?.input_dropzone_box} drop_container_class={"h-auto w-full"} reUpload={props?.uploadEvent} />
                <></>
              ) : (
                <div className="w-full">
                  {props.showDialogLoader ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                    </div>
                  ) : (
                    <Button
                      type={'outline'}
                      label={props?.btn1text}
                      onClick={props.btn1Click}
                      className=""
                    ></Button>
                  )}
                </div>
              )
            ) : null}
            {props?.rememberChoiceOption && (
              <div className="flex w-full items-center justify-start">
                <div className="checkbox" onClick={() => {}}>
                  <input
                    type="checkbox"
                    id="rememberChoiceVS"
                    defaultChecked={props?.rememberChoiceVS}
                    onChange={(e) => props?.handleChoice(e)}
                  />
                  <small className="checkbox-visible"></small>
                </div>

                <div className="text-black-60 text-sm font-normal">
                  &nbsp;&nbsp;{props?.rememberChoiceText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dialog;
