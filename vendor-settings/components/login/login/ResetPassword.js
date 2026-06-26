/**
 * @format
 */
import { GoogleLogin } from '@react-oauth/google';
import {
  LOGIN_DATA,
  RESET_PASSWORD_DATA,
  SET_PASSWORD_DATA,
} from '@spyne-console/common-config/login';
import { useSelector } from '@spyne-console/store';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import jwtDecode from 'jwt-decode';

import Dialog from '@spyne-console/design-system/dialog';

import { useWindowSize } from '@spyne-console/hooks';
import { useCurrentRoute } from '@spyne-console/hooks';

import {
  captureEvent,
  localStorageKeys,
  modalContent,
  redirectLinks,
  redirectToAdminTools,
  validateFormFieldsSetPassword,
} from '@spyne-console/utils/config';

import styles from '../../styles/LoginPage.module.css';
import CentralAPIHandler from '../centralAPIHandler/centralAPIHandler';
import Spinner from '../common/skeleton&spinner/Spinner';
import { SIGNUP_DATA } from '../signup/config';

function ResetPassword(props) {
  const screenSize = useWindowSize();
  const authReducer = useSelector((state) => state.authReducer);

  const [user, setUser] = useState({
    emailId: '',
    new_password: '',
    confirm_password: '',
    token: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);
  const [SignInSpinner, setSignInSpinner] = useState(false);
  const [openResetSuccessDialog, setOpenResetSuccessDialog] = useState(false);
  const [seePassword, setSeePassword] = useState({
    new_password: false,
    confirm_password: false,
  });
  const { mainRoute, childRoute } = useCurrentRoute();
  const router = useRouter();
  const videoRef = useRef();

  const handleChange = (e) => {
    e.preventDefault();
    try {
      setIsSubmit(false);
      setErrorMsg('');
      setFormErrors({});
      const { name, value } = e?.target;
      setUser({ ...user, [name]: value });
    } catch (error) {}
  };

  const validateFormFields = (e) => {
    e.preventDefault();
    try {
      if (errorMsg && errorMsg.length) setErrorMsg('');
      let tempUserObj = { ...user };
      delete tempUserObj?.token;
      setFormErrors(validateFormFieldsSetPassword({ formFields: tempUserObj }));
      setIsSubmit(true);
      captureEvent(
        'reset_pass_confirm',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'click',
        },
        true
      );
    } catch (error) {
      setIsSubmit(false);
    }
  };
  const handlePasswordReset = async () => {
    try {
      setSignInSpinner(true);
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/update-password`;
      let payload = {
        emailId: user?.emailId,
        password: user?.new_password,
        token: user?.token,
      };
      const resp = await CentralAPIHandler.handlePostRequest(URL, payload);
      setOpenResetSuccessDialog(true);
      captureEvent(
        'password_has_been_reset_screen_view',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'screen_view',
        },
        true
      );
    } catch (error) {
      setErrorMsg(
        'Sorry, the password reset link you used is no longer valid. Please try again.'
      );
      setOpenResetSuccessDialog(false);
    } finally {
      setSignInSpinner(false);
    }
  };

  const setParamsToState = () => {
    try {
      let queryParams = new URLSearchParams(window.location.search);
      let token = queryParams.get('token');

      let decoded = jwtDecode(token);
      setUser({ ...user, emailId: decoded.emailId, token: token });
    } catch (error) {
      console.log(error);
    }
  };

  const refreshTokenAndUpdateRedux = ({ fastRefresh = false }) => {
    try {
      let timeInterval = (process.env.minutesToRefresh || 15) * 60 * 1000; //every 15 mins
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/refresh-token`;

      setInterval(async () => {
        try {
          const resp = await CentralAPIHandler.handlePostRequest(URL);

          localStorage.removeItem(localStorageKeys?.DEFAULTBEARERTOKEN);
          localStorage.setItem(
            localStorageKeys?.USERDETAILS,
            JSON.stringify(resp?.data?.userData)
          );
          localStorage.setItem(
            localStorageKeys?.defaultEnterprise,
            JSON.stringify(resp?.data?.defaultEnterprise)
          );
          localStorage.setItem(
            localStorageKeys?.permissionObject,
            JSON.stringify(resp?.data?.permissionObject)
          );
          localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);
          updateAuthDetailsInRedux(resp?.data);
          generateBearerToken({ additionalPayload: {} });
        } catch (error) {
          console.log(error);
        }
      }, timeInterval);
    } catch (error) {
      console.log(error);
    }
  };
  const formatInput = (e) => {
    try {
      const attribute = e?.target?.name;
      setUser({
        ...user,
        [attribute]: e?.target?.value?.trim(),
      });
    } catch (error) {
      // console.log(error)
    }
  };

  const redirectToLogin = () => {
    try {
      router.push('/login');
      captureEvent(
        'password_has_been_reset_continue',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'click',
        },
        true
      );
    } catch (error) {}
  };

  useEffect(() => {
    if (formErrors) {
      if (Object?.keys(formErrors)?.length === 0 && isSubmit) {
        handlePasswordReset();
      }
    }
  }, [formErrors]);

  useEffect(() => {
    setParamsToState();
  }, [user?.emailId]);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys?.DEVICEID) &&
      localStorage.getItem(localStorageKeys?.AUTHKEY) &&
      localStorage.getItem(localStorageKeys.DEFAULTBEARERTOKEN)
    ) {
      redirectToAdminTools(router);
      refreshTokenAndUpdateRedux({ fastRefresh: false });
    }
    captureEvent(
      'reset_pass_screen_view',
      {
        parent_screen_name: mainRoute,
        child_screen_name: childRoute ?? mainRoute,
        event_type: 'screen_view',
      },
      true
    );
  }, []);

  return (
    <section className="enterprise-selection-area h-screen">
      <div className="container-fluid mx-auto h-full">
        <div className="grid h-full gap-0 md:grid-cols-12">
          <div className="tb:p-10 tb:pb-5 col-span-12 h-full px-4 py-6 md:col-span-7 md:grid">
            <img
              src={
                authReducer?.resellerData?.logo_url
                  ? authReducer?.resellerData?.logo_url
                  : LOGIN_DATA?.logoImage
              }
              alt="Spyne logo"
              width={150}
              height={100}
              className="tb:mb-4 tb:m-0 m-auto mb-12 h-12 w-auto lg:h-14"
            />
            <div className="tb:w-[500px] mx-auto w-full">
              <h1 className="text-black-80 mb-8 text-2xl font-bold">
                {RESET_PASSWORD_DATA?.heading}
              </h1>
              <form onSubmit={validateFormFields} className="w-full">
                <div className="mb-5 w-full">
                  <div
                    className={`${formErrors?.emailId ? 'border-red' : 'border-black-10'} text-black-60 flex w-full items-center rounded-lg border bg-transparent px-4 py-[15px] text-base font-normal`}
                    disabled
                  >
                    Continue as:&nbsp;
                    <div className="text-black-80 max-w-[78%] overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold">
                      {user?.emailId}
                    </div>
                  </div>
                  <p className="text-red mb-0 text-xs">{formErrors?.emailId}</p>
                </div>
                <div className="mb-5">
                  <div className="newinput-wrapper">
                    <input
                      className={`${formErrors?.new_password ? '!border-red' : ''} w-full`}
                      autoComplete="off"
                      onBlur={(e) => {
                        formatInput(e);
                      }}
                      required
                      name="new_password"
                      placeholder="Password"
                      type={!seePassword.new_password ? 'password' : 'text'}
                      id="new-password"
                      value={user?.new_password}
                      onChange={handleChange}
                    />
                    <label
                      className={formErrors?.new_password ? '!text-red' : ''}
                    >
                      {SIGNUP_DATA?.createPassText}
                    </label>
                    {user?.new_password.length ? (
                      <span className={[styles['seeIcon']]}>
                        {seePassword.new_password ? (
                          <Image
                            onClick={() =>
                              setSeePassword({
                                ...seePassword,
                                new_password: false,
                              })
                            }
                            src="https://spyne-static.s3.amazonaws.com/console/eye.svg"
                            width={16}
                            height={16}
                            alt="passowrd hide"
                          />
                        ) : (
                          <Image
                            onClick={() =>
                              setSeePassword({
                                ...seePassword,
                                new_password: true,
                              })
                            }
                            src="https://spyne-static.s3.amazonaws.com/console/eyeSlash.svg"
                            width={16}
                            height={16}
                            alt="passowrd show"
                          />
                        )}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-red mb-0 text-xs">
                    {formErrors?.new_password}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="newinput-wrapper">
                    <input
                      className={`${formErrors?.confirm_password ? '!border-red' : 'border-black-20'} text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-sm font-normal tracking-tight ring-transparent`}
                      autoComplete="new-password"
                      name="confirm_password"
                      onBlur={(e) => {
                        formatInput(e);
                      }}
                      required
                      placeholder="Password"
                      type={!seePassword.confirm_password ? 'password' : 'text'}
                      id="confirm-password"
                      onChange={handleChange}
                      value={user?.confirm_password}
                    />
                    <label
                      className={
                        formErrors?.confirm_password ? '!text-red' : ''
                      }
                    >
                      {SIGNUP_DATA?.confirmPassText}
                    </label>
                    {user?.confirm_password.length ? (
                      <span className={[styles['seeIcon']]}>
                        {seePassword.confirm_password ? (
                          <Image
                            onClick={() =>
                              setSeePassword({
                                ...seePassword,
                                confirm_password: false,
                              })
                            }
                            src="https://spyne-static.s3.amazonaws.com/console/eye.svg"
                            width={16}
                            height={16}
                            alt="passowrd hide"
                          />
                        ) : (
                          <Image
                            onClick={() =>
                              setSeePassword({
                                ...seePassword,
                                confirm_password: true,
                              })
                            }
                            src="https://spyne-static.s3.amazonaws.com/console/eyeSlash.svg"
                            width={16}
                            height={16}
                            alt="passowrd show"
                          />
                        )}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-red mb-0 text-xs">
                    {formErrors?.confirm_password}
                  </p>
                </div>
                {errorMsg ? (
                  <p className="text-red mb-1.5 text-left text-xs">
                    {errorMsg}
                  </p>
                ) : null}

                <div className="fixed left-4 right-4 w-[calc(100%-32px)] text-center text-white md:static md:w-full lg:mb-4">
                  <button
                    className={[
                      SignInSpinner ? '' : '',
                      'secondary-btn h-11 w-full items-center !py-1.5',
                    ].join(' ')}
                    type="submit"
                    disabled={SignInSpinner ? true : false}
                  >
                    {SignInSpinner ? (
                      <Spinner
                        type="LIGHT"
                        style_CLASS={
                          'justify-center w-full h-full item-center flex'
                        }
                      />
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="bg-blue-4 hidden md:col-span-5 md:block">
            <div className="h-full w-full py-2 pl-8 pr-6">
              {/* <Image src={RESET_PASSWORD_DATA?.imageUrl}
                                width={800}
                                height={700}
                                className=" w-full h-full object-contain "
                                alt="Multi Category ecom-image"
                                loading="lazy"
                            /> */}
              <video
                width="100%"
                height="100%"
                autoPlay
                loop
                muted
                className="mx-auto object-contain md:h-[95%]"
                ref={videoRef}
              >
                <source src={RESET_PASSWORD_DATA?.imageUrl} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
      {openResetSuccessDialog ? (
        <Dialog
          // btn1Click={() => redirectToLogin()} //TODO: what will close icon do to dialog?
          btn2Click={() => redirectToLogin()}
          heading={modalContent?.passwordResetSuccess?.heading}
          image={modalContent?.passwordResetSuccess?.image}
          para={modalContent?.passwordResetSuccess?.para}
          btn2text="Continue"
          position={
            'items-end tb:items-center tb:p-6 p-0 tb:rounded-xl rounded-b-0'
          }
          modalBodyClass={'tb:rounded-xl rounded-t-3xl tb:p-6 py-5 px-4'}
        />
      ) : null}
    </section>
  );
}
export default ResetPassword;
