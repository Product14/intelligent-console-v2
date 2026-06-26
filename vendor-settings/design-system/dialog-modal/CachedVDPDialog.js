/**
 * @format
 */
import React from "react"
import styles from "../../../styles/common/dialog.module.css"
import Image from "next/image"
import Button from "../button/Button"
import { BUTTON_TYPES } from "../../../utils/config"
import Spinner from "../skeleton&spinner/Spinner"
import ExtIntUpload from "../../virtual360Spin/ExtIntUpload"
import BottomModal from "../mobile-views/BottomModal"

function CachedVDPDialog(props) {
    const handleClick = () => {
        if (props.closeDialog) {
            props.closeDialog();
        } else if (props.btn1Click) {
            props.btn1Click();
        }
    }
    return (
        <BottomModal>
                <div className="p-2">
                    {props.btn1Click && (
                        <div className="absolute top-[22px] right-[22px] cursor-pointer p-6">
                            <Image src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg" alt="close-icon" height={25} width={25} onClick={handleClick} />
                        </div>
                    )}
                    <div className={[styles["modal-content"], "p-6"].join(" ")}>
                        <Image src={props.image} alt="Icon" height={48} width={48} className="mb-4" />
                        <h1 className="">{props.heading}</h1>
                        <p className={props.hyperlink ? "inline" : ""}>
                            {props.para}
                            <small onClick={props.hyperlink ? () => props.hyperlink() : null} className="cursor-pointer text-sm !text-blue-light">
                                {props.subText}
                            </small>
                        </p>
                        {props?.note && <div className="bg-black-5 py-2 px-2 mt-4 rounded-lg text-[12px] text-gray-text text-left">{props?.noteText}</div>}
                    </div>
                    {props.btn1text && props.btn2text ? (
                        <div className={"flex gap-4 w-full items-center justify-center"}>
                            <Button type={BUTTON_TYPES.SECONDARY} buttonPlaceHolder={props?.btn1text} onClickHandler={props.btn1Click}></Button>
                            {props.showDialogLoader ? (
                                <div className="ml-[55px] flex items-center">
                                    <Spinner />
                                </div>
                            ) : props?.uploadEvent ? (
                                <ExtIntUpload uploadClassStyles={"h-auto w-full"} labelClassStyles={"w-full text-center block !p-0"} buttonClassForModal prevNext selectedTab="exterior" class_name={"p-0 bg-gray-2 "} input_dropzone_box={props?.input_dropzone_box} drop_container_class={"h-auto w-full"} reUpload={props?.uploadEvent} />
                            ) : (
                                <Button type={BUTTON_TYPES.PRIMARY} buttonPlaceHolder={props?.btn2text} onClickHandler={props.btn2Click}></Button>
                            )}
                        </div>
                    ) : null}
                    {props.btn2text && !props.btn1text ? (
                        props?.uploadEvent ? (
                            <ExtIntUpload uploadClassStyles={"h-auto w-full"} labelClassStyles={"w-full text-center block !p-0"} buttonClassForModal prevNext selectedTab="exterior" class_name={"p-0 bg-gray-2 "} input_dropzone_box={props?.input_dropzone_box} drop_container_class={"h-auto w-full"} reUpload={props?.uploadEvent} />
                        ) : (
                            <div className="w-full">
                                {props.showDialogLoader ? (
                                    <div className="flex items-center justify-center">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <Button type={BUTTON_TYPES.PRIMARY} buttonPlaceHolder={props?.btn2text} onClickHandler={props.btn2Click} className=""></Button>
                                )}
                            </div>
                        )
                    ) : null}
                    {!props.btn2text && props.btn1text ? (
                        props?.uploadEvent ? (
                            <ExtIntUpload uploadClassStyles={"h-auto w-full"} labelClassStyles={"w-full text-center block !p-0"} buttonClassForModal prevNext selectedTab="exterior" class_name={"p-0 bg-gray-2 "} input_dropzone_box={props?.input_dropzone_box} drop_container_class={"h-auto w-full"} reUpload={props?.uploadEvent} />
                        ) : (
                            <div className="w-full">
                                {props.showDialogLoader ? (
                                    <div className="flex items-center justify-center">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <Button type={BUTTON_TYPES.SECONDARY} buttonPlaceHolder={props?.btn1text} onClickHandler={props.btn1Click} className=""></Button>
                                )}
                            </div>
                        )
                    ) : null}
                    {props?.rememberChoiceOption && (
                        <div className="flex w-full items-center justify-start">
                            <div className=" checkbox " onClick={() => { }}>
                                <input type="checkbox" id="rememberChoiceVS" defaultChecked={props?.rememberChoiceVS} onChange={e => props?.handleChoice(e)} />
                                <small className="checkbox-visible"></small>
                            </div>

                            <div className="text-sm font-normal text-black-60">&nbsp;&nbsp;{props?.rememberChoiceText}</div>
                        </div>
                    )}
                </div>
        </BottomModal>
    )
}

export default CachedVDPDialog
