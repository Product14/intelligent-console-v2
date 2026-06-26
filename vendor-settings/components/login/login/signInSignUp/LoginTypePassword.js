import {
  FORGET_PASSWORD_DATA,
  LOGIN_DATA,
} from '@spyne-console/common-config/login';
import { useSelector } from '@spyne-console/store';

import React, { useContext, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useCurrentRoute } from '@spyne-console/hooks';
import useWindowSize from '@spyne-console/hooks/useWindowSize';

import {
  LOGIN_TYPES,
  captureEvent,
  getResellerPolicyUrl,
  openInbox,
  redirectLinks,
} from '@spyne-console/utils/config';

import styles from '../../../styles/LoginPage.module.css';
import Spinner from '../../common/skeleton&spinner/Spinner';
import { getDemoFlowType } from '../config';
import SignInSignUpContext from '../context';

const LoginTypePassword = (props) => {
  const {
    formatInput,
    SignInSpinner,
    errorMsg,
    setUser,
    seeData,
    user,
    resetPassword,
    handleLogin,
    handleForgotPassword,
    setSeeData,
    loginType,
    useLoginTypeOTP,
    handleChangeLoginState,
    handleForgot,
    handleLoginTypeEmail,
    seconds,
    closeLogin,
    backToLogin,
    backSpinner,
  } = useContext(SignInSignUpContext);
  const screenSize = useWindowSize();
  const auth = useSelector((state) => state.authReducer);
  const { translate } = props;
  const { mainRoute, childRoute } = useCurrentRoute();

  useEffect(() => {
    if (loginType === LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT) {
      captureEvent(
        'email_sent_screen_view',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'screen_view',
        },
        true
      );
    } else if (loginType === LOGIN_TYPES?.FORGOT_PASSWORD) {
      captureEvent(
        'forgot_password_screen_view',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'screen_view',
        },
        true
      );
    } else if (loginType === LOGIN_TYPES?.PASSWORD) {
      captureEvent(
        'enter_pass_screen_view',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'screen_view',
        },
        true
      );
    }
  }, [loginType]);

  const router = useRouter();
  const {
    allowClose,
    formClassName,
    forgotPassBtnClassName,
    passwordBtnClassName,
    forgotPassSentLinkBtnClass,
    backCaret,
    xs_BackIcon,
  } = props;
  const queryParam = Object.keys(router.query)[0];
  useEffect(() => {
    captureEvent(
      'enter_password_screen',
      {
        method: 'email',
        login_flow: allowClose ? 'non_restrictive' : 'restrictive',
        source: getDemoFlowType(mainRoute, childRoute, queryParam),
      },
      false
    );
  }, []);

  return (
    <div className="w-full">
      {xs_BackIcon && (
        <Image
          className="tb:hidden absolute left-7 top-10 block h-4 w-full cursor-pointer"
          src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
          height={18}
          width={18}
          onClick={handleChangeLoginState}
        />
      )}

      {loginType === LOGIN_TYPES?.PASSWORD && (
        <form className={formClassName || 'tb:py-0 tb:px-0 px-4 py-5'}>
          <div className="mb-8 flex w-full flex-col justify-center">
            <h1 className="text-blue_purple flex items-center justify-between gap-2 text-2xl font-bold">
              <div className="flex items-center gap-2">
                {' '}
                <Image
                  className="h-4 w-auto cursor-pointer"
                  src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                  height={16}
                  width={16}
                  onClick={handleChangeLoginState}
                />
                {translate('console.screens.passwordScreen.enterPasswordText')}
              </div>
              {/* {allowClose &&
                                <Image src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg"
                                    width={24}
                                    height={24}
                                    alt="close"
                                    className="inline cursor-pointer"
                                    onClick={() => closeLogin()}
                                />
                            } */}
            </h1>
          </div>
          <div className="newinput-wrapper relative mb-4">
            <input
              className={[errorMsg ? '!border-red' : '', 'w-full'].join(' ')}
              placeholder="XXXXXX"
              type={seeData ? 'text' : 'password'}
              id="password"
              // required
              name="password"
              onInput={(e) => setUser({ ...user, password: e.target.value })}
              value={user.password}
              onBlur={(e) => {
                formatInput(e);
              }}
              onClick={() =>
                captureEvent(
                  'password',
                  {
                    parent_screen_name: mainRoute,
                    child_screen_name: childRoute ?? mainRoute,
                    event_type: 'click',
                  },
                  true
                )
              }
              autoComplete="new-password"
            />
            <label className={[errorMsg ? '!text-red' : '', ''].join(' ')}>
              {translate('console.screens.passwordScreen.passwordText')}
            </label>
            {errorMsg ? (
              <p className="text-red mb-2 text-xs">{errorMsg}</p>
            ) : null}

            {user?.password?.length > 0 ? (
              <span className={[styles['seeIcon']]}>
                {seeData ? (
                  <Image
                    onClick={() => setSeeData(false)}
                    src="https://spyne-static.s3.amazonaws.com/console/eye.svg"
                    width={16}
                    height={16}
                    alt="passowrd hide"
                  />
                ) : (
                  <Image
                    onClick={() => setSeeData(true)}
                    src="https://spyne-static.s3.amazonaws.com/console/eyeSlash.svg"
                    width={16}
                    height={16}
                    alt="passowrd show"
                  />
                )}
              </span>
            ) : null}
          </div>

          <div className="mb-8">
            {!resetPassword ? (
              // resetEmailSent ? (
              //     <p className="pointer-events-none mt-5 mb-1 text-sm font-normal text-black-60">{LOGIN_DATA?.resetMailSentText}</p>
              // ) :
              <div className="text-blue-light flex justify-between gap-2 text-left text-sm font-medium">
                <div className="cursor-pointer" onClick={handleForgotPassword}>
                  {translate(
                    'console.screens.passwordScreen.forgotPasswordCTA'
                  )}
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    captureEvent(
                      'use_otp',
                      {
                        parent_screen_name: mainRoute,
                        child_screen_name: childRoute ?? mainRoute,
                        event_type: 'click',
                      },
                      true
                    );
                    useLoginTypeOTP();
                  }}
                >
                  {translate('console.screens.passwordScreen.otpButton')}
                </div>
              </div>
            ) : null}
            {/* {errorMsg ? <p className="mb-2 mt-1 text-xs text-red">{errorMsg}</p> : null} */}
          </div>
          {!(
            window.location.href.includes('carlens') ||
            window.location.href.includes('spinic')
          ) && (
            <>
              {!auth?.resellerData?.is_reseller && (
                <p className="text-black-60 mb-3 text-left text-xs font-normal">
                  {translate(
                    'console.screens.passwordScreen.verifyingAgreeText'
                  )}
                  &nbsp;
                  <Link
                    href={redirectLinks?.termsServiceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="text-blue-light">
                      {translate(
                        'console.screens.passwordScreen.termsOfServiceText'
                      )}
                    </span>
                    &nbsp;
                  </Link>
                  ,&nbsp;
                  <Link
                    href={redirectLinks?.policyLinkurl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="text-blue-light">
                      {translate(
                        'console.screens.passwordScreen.privacyPolicy'
                      )}
                    </span>
                    &nbsp;
                  </Link>
                  {translate('console.screens.passwordScreen.andText')}&nbsp;
                  <Link
                    href={redirectLinks?.cookieLikUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="text-blue-light">
                      {translate('console.screens.passwordScreen.cookiePolicy')}
                      .
                    </span>
                  </Link>
                </p>
              )}
              {auth?.resellerData?.is_reseller && (
                <p className="text-black-60 mb-3 text-left text-xs font-normal">
                  By verifying, you agree to our&nbsp;
                  <a
                    href={getResellerPolicyUrl(
                      auth?.resellerData?.terms_and_condition_policy,
                      redirectLinks?.termsServiceUrl
                    )}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-blue-light"
                  >
                    Terms of Service
                  </a>
                  ,&nbsp;
                  <a
                    href={getResellerPolicyUrl(
                      auth?.resellerData?.privacy_policy,
                      redirectLinks?.policyLinkurl
                    )}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-blue-light"
                  >
                    Privacy Policy{' '}
                  </a>
                  and{' '}
                  <a
                    href={getResellerPolicyUrl(
                      auth?.resellerData?.cookie_policy,
                      redirectLinks?.cookieLikUrl
                    )}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-blue-light"
                  >
                    Cookie Policy.
                  </a>
                </p>
              )}
            </>
          )}

          {/* <div className={`${passwordBtnClassName || "fixed w-[calc(100%-32px)]"} ${SignInSpinner ? "md:!py-[0.5315rem] 2xl:!py-[0.5325rem] pointer-events-none" : ""} h-[50px] secondary-btn bottom-4 left-4 right-4 bg-white text-center md:static md:w-full `}> */}
          <button
            className={[
              SignInSpinner ? '' : '',
              'secondary-btn h-11 w-full !py-1.5',
            ].join(' ')}
            type="submit"
            disabled={
              SignInSpinner || user?.password?.length < 1 ? true : false
            }
            id="submit"
            onClick={handleLogin}
          >
            {SignInSpinner ? (
              <Spinner
                type="LIGHT"
                style_CLASS={'justify-center w-full h-full items-center flex'}
              />
            ) : (
              translate('console.screens.passwordScreen.submitButton')
            )}
          </button>
          {/* </div> */}
        </form>
      )}

      {loginType === LOGIN_TYPES?.FORGOT_PASSWORD && (
        <form className={'tb:p-0 px-4 py-5'}>
          <div className="w-full">
            <h1 className="text-black-80 flex items-center justify-between gap-2 text-2xl font-bold">
              <div className="flex items-center gap-2">
                {' '}
                <Image
                  className="h-4 w-auto cursor-pointer"
                  src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                  height={16}
                  width={16}
                  onClick={handleChangeLoginState}
                />
                {translate(
                  'console.screens.logInScreen.loginScreenForgotPassword'
                )}
              </div>
            </h1>
          </div>
          <p className="text-black-60 mt-2 text-sm font-normal lg:text-base">
            {FORGET_PASSWORD_DATA?.subHeading}
          </p>
          <div className="newinput-wrapper relative mt-8">
            <input
              className={[
                errorMsg ? 'border-red' : 'border-black-20',
                'text-black-50 mb-5 w-full rounded-lg border bg-transparent px-3.5 py-4 text-sm font-normal tracking-tight ring-transparent',
              ].join(' ')}
              placeholder="Email address"
              type="text"
              name="emailId"
              value={user?.emailId}
              required
            />
            <label className={errorMsg ? '!text-red' : '!text-black-60'}>
              {FORGET_PASSWORD_DATA?.label}
            </label>
            {errorMsg ? (
              <p className="text-red mb-2 text-xs">{errorMsg}</p>
            ) : null}
          </div>
          <div
            className={`${forgotPassBtnClassName || 'fixed w-[calc(100%-32px)]'} ${SignInSpinner ? 'pointer-events-none md:!py-[0.5315rem] 2xl:!py-[0.5325rem]' : ''} secondary-btn bottom-4 left-4 right-4 h-[50px] bg-white text-center md:static md:w-full`}
          >
            <button
              className={[
                SignInSpinner ? 'h-full !py-0' : 'h-full !py-1',
                'block w-full items-center',
              ].join(' ')}
              type="submit"
              disabled={SignInSpinner ? true : false}
              id="next"
              onClick={handleForgotPassword}
            >
              {SignInSpinner ? (
                <Spinner
                  type="LIGHT"
                  style_CLASS={'justify-center w-full h-full items-center flex'}
                />
              ) : (
                FORGET_PASSWORD_DATA?.btnText
              )}
            </button>
          </div>
        </form>
      )}

      {loginType === LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT && (
        <form className={'tb:p-0 px-4 py-5'}>
          <div className="w-full">
            <h1 className="text-blue_purple flex items-center justify-between gap-2 text-2xl font-bold">
              <div className="flex items-center gap-2">
                {' '}
                <Image
                  className="h-4 w-auto cursor-pointer"
                  src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                  height={16}
                  width={16}
                  onClick={handleChangeLoginState}
                />
                {translate(
                  'console.screens.forgotPasswordScreen.forgotPasswordTitle'
                )}
              </div>

              {/* {allowClose &&

                                <Image src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg"
                                    width={24}
                                    height={24}
                                    alt="close"
                                    className="flex cursor-pointer items-center"
                                    onClick={() => closeLogin()}
                                />
                            } */}
            </h1>
          </div>
          <p className="tb:mb-8 text-black-60 mb-6 mt-1 text-sm font-normal">
            <div className="tb:inline tb:w-auto block w-full">
              {translate(
                'console.screens.forgotPasswordScreen.forgotPasswordSubtitle'
              )}{' '}
            </div>

            <div className="tb:inline tb:border-0 border-blue-8 bg-blue-4 tb:bg-transparent tb:p-0 tb:m-0 mt-3 flex w-full justify-between rounded-lg border px-2.5 py-3">
              <div className="tb:hidden text-black-80 xs:max-w-[16rem] block max-w-[13rem] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                {user?.emailId.length > 20
                  ? `${user?.emailId.slice(0, 25)}...`
                  : user?.emailId}{' '}
              </div>
              <div className="tb:inline text-black-80 hidden font-medium">
                {user?.emailId}{' '}
              </div>
              {/* <h4 className="text-sm font-semibold text-black-80 max-w-[13rem] xs:max-w-[16rem] tb:max-w-fit inline overflow-hidden text-ellipsis whitespace-nowrap">
                                {screenSize === "MOBILE" ? (user?.emailId.length > 30 ? `${user?.emailId.slice(0, 35)}...` : user?.emailId) : user?.emailId}
                            </h4> */}
              <span className="tb:inline hidden">
                {translate(
                  'console.screens.forgotPasswordScreen.forgotPasswordSubtitleToContinue'
                )}
                .
              </span>
              <span
                className="tb:ml-1 text-blue-light tb:float-none float-right ml-2 cursor-pointer text-sm font-semibold"
                onClick={handleLoginTypeEmail}
              >
                {translate(
                  'console.screens.forgotPasswordScreen.forgotPasswordChangeButton'
                )}
              </span>
            </div>
          </p>

          {/* <div className={`${forgotPassSentLinkBtnClass || "fixed w-[calc(100%-32px)]"} ${SignInSpinner ? "md:!py-[0.5315rem] 2xl:!py-[0.5325rem] pointer-events-none" : ""} bottom-4 left-4 right-4 bg-white py-1 text-center md:static md:w-full `}> */}
          <button
            className={[
              SignInSpinner ? ' ' : ' ',
              'secondary-btn tb:block hidden h-11 w-full !py-1.5',
              seconds > 0 ? '!font-medium opacity-20' : '',
            ].join(' ')}
            type="submit"
            disabled={seconds > 0 ? true : false}
            onClick={handleForgotPassword}
          >
            {SignInSpinner ? (
              <Spinner
                type="LIGHT"
                style_CLASS={'justify-center w-full h-full items-center flex'}
              />
            ) : (
              translate(
                'console.screens.forgotPasswordScreen.forgotPasswordResendButton'
              ) + (seconds > 0 ? ' (' + seconds + 's)' : '')
            )}
          </button>
          <button
            className={[
              'tb:hidden mb-3 block w-fit min-w-[30%] cursor-pointer text-left text-sm font-medium',
              seconds > 0 ? 'text-black-60' : 'text-blue-light',
            ].join(' ')}
            type="submit"
            disabled={seconds > 0 ? true : false}
            onClick={handleForgotPassword}
          >
            {SignInSpinner ? (
              <Spinner
                type="DARK"
                style_CLASS={' justify-center w-full h-full items-center flex'}
              />
            ) : (
              translate(
                'console.screens.forgotPasswordScreen.forgotPasswordResendButton'
              ) + (seconds > 0 ? ' (' + seconds + 's)' : '')
            )}
          </button>
          <button
            className={[
              'tb:hidden secondary-btn block h-11 w-full !py-1.5',
            ].join(' ')}
            type="submit"
            onClick={backToLogin}
          >
            {backSpinner ? (
              <Spinner
                type="LIGHT"
                style_CLASS={'justify-center w-full h-full items-center flex'}
              />
            ) : (
              'Back to login'
            )}
          </button>

          <div className="mt-3 flex gap-3">
            <button
              className={[
                'border-black-10 text-black-80 block w-full items-center rounded-lg border py-[11px] text-sm font-medium',
              ].join(' ')}
              type="submit"
              disabled={SignInSpinner ? true : false}
              onClick={(e) => openInbox(e, 'GMAIL')}
            >
              <span className="flex items-center justify-center gap-2">
                <Image
                  src={FORGET_PASSWORD_DATA?.gmailIcon}
                  width={20}
                  height={20}
                  alt="Gmail icon"
                />
                {translate(
                  'console.screens.forgotPasswordScreen.forgotPasswordOpenGmail'
                )}
              </span>
            </button>
            <button
              className={[
                'border-black-10 text-black-80 block w-full items-center rounded-lg border py-[11px] text-sm font-medium',
              ].join(' ')}
              type="submit"
              disabled={SignInSpinner ? true : false}
              onClick={(e) => openInbox(e, 'OUTLOOK')}
            >
              <span className="flex items-center justify-center gap-2">
                <Image
                  src={FORGET_PASSWORD_DATA?.outlookIcon}
                  width={20}
                  height={20}
                  alt="Outlook icon"
                />
                {translate(
                  'console.screens.forgotPasswordScreen.forgotPasswordOpenOutlook'
                )}
              </span>
            </button>
          </div>
          {/* </div> */}
        </form>
      )}
    </div>
  );
};

export default LoginTypePassword;
