/**@format */
import { FORGET_PASSWORD_DATA } from '@spyne-console/common-config/login';

import React, { useContext, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useCurrentRoute } from '@spyne-console/hooks';
import useWindowSize from '@spyne-console/hooks/useWindowSize';

import {
  LOGIN_TYPES,
  captureEvent,
  openInbox,
  redirectLinks,
} from '@spyne-console/utils/config';

import HideSpyneContent from '../../../hoc/HideSpyneContent';
import Spinner from '../../common/skeleton&spinner/Spinner';
import { getDemoFlowType } from '../config';
import SignInSignUpContext from '../context';

const VerifyEmail = (props) => {
  const { translate } = props;
  const screenSize = useWindowSize;
  const {
    formatInput,
    SignInSpinner,
    loginOrSignup,
    errorMsg,
    handleEmailVerification,
    seconds,
    user,
    useLoginTypeOTP,
    setLoginType,
    handleOTP,
    handleChangeLoginState,
    closeLogin,
  } = useContext(SignInSignUpContext);
  const {
    allowClose,
    verifyBtnClassName,
    formClassName,
    EMAIL_VERIFY_DATA,
    backCaret,
    xs_BackIcon,
  } = props;
  const { mainRoute, childRoute } = useCurrentRoute();
  const router = useRouter();
  const queryParam = Object.keys(router.query)[0];
  const onChangeEmailClick = () => {
    setLoginType(LOGIN_TYPES?.EMAIL);
  };

  useEffect(() => {
    captureEvent(
      'enter_otp_screen',
      {
        demo_flow_source: 'email',
        login_flow:
          (childRoute ?? mainRoute === 'login')
            ? 'console'
            : props.allowClose
              ? 'non_restrictive'
              : 'restrictive',
        source: getDemoFlowType(mainRoute, childRoute, queryParam),
      },
      false
    );
  }, []);
  return (
    <>
      <form className={'tb:px-0 tb:py-0 px-4 py-5'}>
        <div className="flex w-full">
          {/* {backCaret ? null
                        :
                        <div className="cursor-pointer w-fit text-sm text-black-60 py-1 pr-2 pl-1 tb:flex gap-1 hidden" onClick={handleChangeLoginState}>
                            <Image src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg" width={10} height={10} alt="Back Icon" />
                        </div>
                    } */}
          <h1 className="flex items-center justify-between gap-2 text-2xl font-bold text-[#402387]">
            {
              <Image
                className="h-4 w-auto cursor-pointer"
                src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                height={16}
                width={16}
                onClick={handleChangeLoginState}
              />
            }
            {translate('console.screens.otpScreen.verifyEmailTitle')}

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
        <p className="text-black-60 tb:tracking-normal mb-8 mt-1 text-sm font-normal -tracking-[0.1px]">
          {translate('console.screens.otpScreen.verifyEmailSubtitle')}
        </p>
        <div className="tb:border-black-10 tb:bg-transparent bg-blue-4 border-blue-8 box-border flex justify-between gap-1 rounded-lg border px-2.5 py-[11px]">
          <h4 className="text-black-80 xs:max-w-[16rem] tb:max-w-[80%] w-full max-w-[13rem] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold">
            {screenSize === 'MOBILE'
              ? user?.emailId.length > 30
                ? `${user?.emailId.slice(0, 35)}...`
                : user?.emailId
              : user?.emailId}
          </h4>
          <span
            className="text-blue-light cursor-pointer text-sm font-medium"
            onClick={onChangeEmailClick}
          >
            {translate('console.screens.otpScreen.changeButton')}
          </span>
        </div>

        <div className="newinput-wrapper relative mb-2 mt-8">
          <input
            onClick={() =>
              captureEvent(
                'enter_code',
                {
                  parent_screen_name: mainRoute,
                  child_screen_name: childRoute ?? mainRoute,
                  event_type: 'click',
                },
                true
              )
            }
            className={[
              'w-full ring-transparent',
              errorMsg ? '!border-red' : '',
            ].join(' ')}
            placeholder="000-000"
            autoComplete="off"
            type="text"
            maxLength={6}
            minLength={6}
            name="otp"
            value={user?.otp}
            onChange={handleOTP}
            onBlur={(e) => {
              formatInput(e);
            }}
          />
          <label className={['', errorMsg ? '!text-red' : ''].join(' ')}>
            {translate('console.screens.otpScreen.enterCodeButton')}
          </label>
          {errorMsg ? (
            <p className="text-red my-1 text-xs">{errorMsg}</p>
          ) : null}
        </div>

        <div className="mb-6">
          <p
            className={`text-black-60 text-sm ${seconds > 0 ? 'font-normal' : 'font-medium'}`}
          >
            <button
              onClick={() => {
                captureEvent(
                  'resend_otp',
                  {
                    source: 'email',
                    login_flow:
                      (childRoute ?? mainRoute === 'login')
                        ? 'console'
                        : props.allowClose
                          ? 'non_restrictive'
                          : 'restrictive',
                    source: getDemoFlowType(mainRoute, childRoute, queryParam),
                  },
                  false
                );
                useLoginTypeOTP(true);
              }}
              disabled={seconds > 0}
              className={seconds > 0 ? '' : 'text-blue-light cursor-pointer'}
            >
              {seconds <= 0
                ? translate('console.screens.otpScreen.resentCodeButton')
                : null}
            </button>
            {seconds > 0 ? (
              <>
                &nbsp;in{' '}
                <span className="text-black-80 font-medium">
                  00:{seconds < 10 ? `0${seconds}` : seconds}s
                </span>
              </>
            ) : null}
          </p>
          <div className="flex pr-1 pt-3">
            <Image
              src="https://spyne-static.s3.amazonaws.com/console/icons/info_icon_email_verify.svg"
              height={15}
              width={15}
              alt="info icon"
            />
            <p className="text-black-60 text-sm">
              {translate('console.screens.otpScreen.spamFolderWarning')}{' '}
            </p>
          </div>
        </div>

        <HideSpyneContent>
          <p className="text-black-60 mb-3 text-left text-xs font-normal">
            {translate('console.screens.otpScreen.verifyingAgreeText')}&nbsp;
            <Link
              href={redirectLinks?.termsServiceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="text-blue-light">
                {translate('console.screens.otpScreen.TermsOfServiceText')}
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
                {translate('console.screens.otpScreen.privacyPolicy')}
              </span>
              &nbsp;
            </Link>
            {translate('console.screens.otpScreen.andText')}
            <Link
              href={redirectLinks?.cookieLikUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="text-blue-light">
                {' '}
                {translate('console.screens.otpScreen.cookiePolicy')}.
              </span>
            </Link>
          </p>
        </HideSpyneContent>

        <button
          className={[
            SignInSpinner ? ' ' : ' ',
            'secondary-btn h-11 w-full !py-1.5',
          ].join(' ')}
          type="submit"
          disabled={SignInSpinner ? true : false}
          onClick={(e) => {
            captureEvent(
              'otp_submitted',
              {
                demo_flow_source: 'email',
                login_flow:
                  (childRoute ?? mainRoute === 'login')
                    ? 'console'
                    : props.allowClose
                      ? 'non_restrictive'
                      : 'restrictive',
                source: getDemoFlowType(mainRoute, childRoute, queryParam),
              },
              false
            );
            handleEmailVerification(e);
          }}
        >
          {SignInSpinner ? (
            <Spinner
              type="LIGHT"
              style_CLASS={'justify-center w-full h-full items-center flex'}
            />
          ) : loginOrSignup === 'login' ? (
            translate('console.screens.emailScreen.signupcontinue')
          ) : (
            translate('console.screens.otpScreen.verifyButton')
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
              {translate('console.screens.otpScreen.openGmailButton')}
            </span>
          </button>
          <button
            className={[
              'border-black-10py-[11px] text-black-80 block w-full items-center rounded-lg border text-sm font-medium',
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
              {translate('console.screens.otpScreen.openOutlookButton')}
            </span>
          </button>
        </div>
      </form>
    </>
  );
};

export default VerifyEmail;
