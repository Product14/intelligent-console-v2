/**@format */

import React, { useContext } from "react"
import SignInSignUpContext from "../context"
import {FORGET_PASSWORD_DATA} from "./config"
import Spinner from "../../common/skeleton&spinner/Spinner"

function ForgetPassword(props) {
    const {SignInSpinner, errorMsg} = useContext(SignInSignUpContext)

    return (
        <form>
            <h1 className="text-2xl font-semibold text-black-80">{FORGET_PASSWORD_DATA?.heading}</h1>
            <p className="mt-2 text-base font-normal text-black-60">{FORGET_PASSWORD_DATA?.subHeading}</p>
            <div className="input-login relative mt-8">
                <input className={[errorMsg ? "border-red-500" : "border-black-20", "mb-5 w-full rounded-lg border bg-transparent px-3.5 py-4 text-sm font-normal tracking-tight text-black-50 ring-transparent"].join(" ")} placeholder="Email address" type="text" name="emailId" required />
                <label className={errorMsg ? "!text-red-500" : "!text-black-60"}>{FORGET_PASSWORD_DATA?.label}</label>
                {errorMsg ? <p className="mb-2 text-xs text-red-500">{errorMsg}</p> : null}
            </div>
            <div className="w-full ">
                <button className={[SignInSpinner ? "!py-1.5" : "!py-2.5", "secondary-btn mb-2 block w-full items-center"].join(" ")} type="submit" disabled={SignInSpinner ? true : false} id="next" onClick={handleResetLinkSent}>
                    {SignInSpinner ? <Spinner type="LIGHT" style_CLASS={"justify-center w-full h-full item-center flex"} /> : FORGET_PASSWORD_DATA?.btnText}
                </button>
            </div>
        </form>
    )
}
export default ForgetPassword
