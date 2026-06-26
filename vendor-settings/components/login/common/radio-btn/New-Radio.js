/**@format */
import React, {useState} from "react"

function RadioBtn(props) {
    const {disableCheck, value, label, label2, handleChecked, id, radioValue, name, classStyle} = props
    const defaultData = {
        defaultClass: ""
    }

    return (
        <label htmlFor={id} className={["radio-label ", classStyle || defaultData?.defaultClass, disableCheck ? "pointer-events-none " : ""].join(" ")}>
            <input type="radio" id={id} name={name} value={radioValue}  checked={value == radioValue} onChange={handleChecked} className={["radio-input", disableCheck ? "pointer-events-none opacity-40 grayscale" : ""].join(" ")} />
            <div className={["radio-radio", disableCheck ? "pointer-events-none opacity-40 grayscale" : ""].join(" ")} />
            {label ? label : null}
            {label2 ? <p className="text-base font-medium text-black-40">{label2}</p> : null}
        </label>
    )
}

export default RadioBtn
