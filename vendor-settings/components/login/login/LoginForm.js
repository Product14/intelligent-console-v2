/**
 * @format
 */
import React from "react"
import {LOGIN_DATA} from "@spyne-console/common-config/login"
import {LOGIN_TYPES} from "@spyne-console/utils/config"
import styles from "../../styles/LoginPage.module.css"
import {GoogleLogin} from "@react-oauth/google"
import Image from "next/image"
import Spinner from "../common/skeleton&spinner/Spinner"

import { updateAuthProp, useDispatch } from '@spyne-console/store'

const LoginForm = props => {
    const {handleLogin, errorMsg, loginType, emailInputRef, user, setUser, seeData, setSeeData, resetPassword, resetEmailSent, SignInSpinner, dimensions, getEmailId, formatInput, handleCredentialResponse, handleForgotPassword} = props

    const dispatch = useDispatch()

    const showSignUp = () => {
        try {
            props.setShowLoginMenu(false)
            props.setShowEmailSignup(true)
        } catch (err) {}
    }

    const closeLogin = () => {
        try {
            dispatch(updateAuthProp([{"key": "loginModalTrigger", "value": false}]))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={styles.loginForm}>
            <h1 className="mb-6 flex justify-between text-left text-2xl font-bold text-black-80">
                {LOGIN_DATA?.logIn}
                {props.allowClose && <Image src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg" width={24} height={24} alt="close" className="flex cursor-pointer items-center" onClick={() => closeLogin()} />}
            </h1>
            <form onSubmit={handleLogin}>
                <div className={styles.loginFormInput}>
                    <input
                        className={[errorMsg ? styles.error : "", styles.input].join(" ")}
                        placeholder={loginType === LOGIN_TYPES.PASSWORD ? "Email address" : "Email Address/Phone"}
                        type="text"
                        id="email"
                        name="emailId"
                        required
                        ref={emailInputRef}
                        defaultValue={user?.emailId}
                        onChange={e => getEmailId(e)}
                        onBlur={e => formatInput(e)}
                        autoComplete="new-password"
                    />
                    <label className={errorMsg ? styles.errorLabel : ""}>{LOGIN_DATA?.loginLabel}</label>
                </div>

                {loginType === LOGIN_TYPES.PASSWORD && (
                    <div className={styles.loginFormInput}>
                        <input
                            className={styles.input}
                            placeholder="Password"
                            type={seeData ? "text" : "password"}
                            id="password"
                            required
                            name="password"
                            onInput={e => setUser({...user, password: e.target.value})}
                            value={user.password}
                            onBlur={e => formatInput(e)}
                            autoComplete="new-password"
                        />
                        <label>{LOGIN_DATA?.passowrdLabel}</label>

                        {user?.password?.length > 0 && (
                            <span className={styles.seeIcon}>
                                {seeData ? (
                                    <Image onClick={() => setSeeData(false)} src="https://spyne-static.s3.amazonaws.com/console/eye.svg" width={16} height={16} alt="password hide" />
                                ) : (
                                    <Image onClick={() => setSeeData(true)} src="https://spyne-static.s3.amazonaws.com/console/eyeSlash.svg" width={16} height={16} alt="password show" />
                                )}
                            </span>
                        )}
                    </div>
                )}

                <div className={styles.loginFormActions}>
                    {!resetPassword ? (
                        resetEmailSent ? (
                            <p className={styles.resetMailSent}>{LOGIN_DATA?.resetMailSentText}</p>
                        ) : (
                            <p className={styles.forgotPassword} onClick={handleForgotPassword}>
                                {LOGIN_DATA?.forgetPassText}
                            </p>
                        )
                    ) : null}
                    {errorMsg && <p className={styles.errorMessage}>{errorMsg}</p>}
                </div>

                <div className={styles.loginButton}>
                    {loginType === LOGIN_TYPES.PASSWORD && (
                        <button className={[SignInSpinner ? styles.spinnerButton : styles.button].join(" ")} type="submit" disabled={SignInSpinner}>
                            {SignInSpinner ? <Spinner type="LIGHT" style_CLASS={styles.spinner} /> : "Log in"}
                        </button>
                    )}
                </div>
            </form>

            <div className={styles.divider}>
                <span>{LOGIN_DATA?.orSeparatorText}</span>
            </div>

            <div className={styles.googleLogin}>
                <GoogleLogin
                    onSuccess={handleCredentialResponse}
                    onError={() => {
                        console.error("Google login failed")
                    }}
                    useOneTap
                    text="continue_with"
                    size="large"
                    logo_alignment="center"
                />
            </div>

            <p className="mt-5 mb-0 text-center font-normal tracking-tight text-black-60">
                {LOGIN_DATA?.dontHaveACNT}
                <span onClick={() => showSignUp()} className="ml-1 cursor-pointer font-semibold text-blue-light md:font-medium">
                    {LOGIN_DATA?.signUp}
                </span>
            </p>
        </div>
    )
}

export default LoginForm
