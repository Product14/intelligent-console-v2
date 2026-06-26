/**
 * @format
 */
import React from "react"

function Spinner({style_CLASS, type}) {
    const defaultClasses = {
        style_CLASS: ""
    }
    const SPINNER_TYPES = {
        DARK: "DARK",
        LIGHT: "LIGHT",
        LIGHT_LARGE: "LIGHT_LARGE"
    }
    const getSpinnerClass = () => {
        switch (type) {
            case SPINNER_TYPES?.DARK:
                return "dark-loader loader"
            case SPINNER_TYPES?.LIGHT:
                return "light-loader loader"
            case SPINNER_TYPES?.LIGHT_LARGE:
                return "light-loader loader loader-large"
            default:
                return "dark-loader loader"
        }
    }
    return (
        <div className="">
            {/* <div className={getSpinnerClass()}></div> */}
            <div className="light-loader loader"></div>
        </div>
    )
}

export default Spinner
