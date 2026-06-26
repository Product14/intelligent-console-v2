/**
 * @format
 */
import { GoogleLogin } from '@react-oauth/google';
import {
  LOGIN_DATA,
  SET_PASSWORD_DATA,
} from '@spyne-console/common-config/login';
import { useDispatch, useSelector } from '@spyne-console/store';
import { resetAuth, updateAuthProp } from '@spyne-console/store';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  checkCategoryAndRedirect,
  generateBearerToken,
  localStorageKeys,
  redirectLinks,
  redirectToAdminTools,
  skipEnterpriseSelectionPage,
  validateFormFieldsSetPassword,
} from '@spyne-console/utils/config';

import CentralAPIHandler from '../centralAPIHandler/centralAPIHandler';
import Spinner from '../common/skeleton&spinner/Spinner';
import { SIGNUP_DATA } from '../signup/config';

function SetPassword(props) {
  const dispatch = useDispatch();
  const authReducer = useSelector((state) => state.authReducer);

  const videoRef = useRef();
  const router = useRouter();
  const [user, setUser] = useState({
    emailId: '',
    userName: '',
    new_password: '',
    confirm_password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);
  const [SignInSpinner, setSignInSpinner] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys?.DEVICEID) &&
      localStorage.getItem(localStorageKeys?.AUTHKEY) &&
      localStorage.getItem(localStorageKeys.DEFAULTBEARERTOKEN)
    ) {
      try {
        let userEmail = JSON.parse(
          localStorage.getItem(localStorageKeys?.USERDETAILS)
        ).emailId;
        let defaultEnterprise = JSON.parse(
          localStorage.getItem(localStorageKeys?.defaultEnterprise)
        );

        const { skip: skipEnterpriseSelection, enterprise_id } =
          skipEnterpriseSelectionPage(
            userEmail,
            defaultEnterprise?.enterpriseId
          );
        if (skipEnterpriseSelection) {
          checkCategoryAndRedirect(
            router,
            defaultEnterprise?.category_id,
            enterprise_id
          );
        } else {
          redirectToAdminTools(router);
        }
        refreshTokenAndUpdateRedux({ fastRefresh: false });
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  const moveToLogin = () => {
    try {
      router.push('/login');
    } catch (error) {}
  };

  useEffect(() => {
    // console.log(formErrors)

    if (formErrors) {
      if (Object?.keys(formErrors)?.length === 0 && isSubmit) {
        handlePasswordSignup();
      }
    }
  }, [formErrors]);

  const handlePasswordSignup = async () => {
    try {
      localStorage.removeItem(localStorageKeys.DEFAULTBEARERTOKEN);
      let queryParams = new URLSearchParams(window.location.search);
      let payload = {
        strategy: 'PASSWORD',
        apiKey: queryParams.get('apiKey'),
        emailId: queryParams.get('email_id').toLowerCase(),
        password: user?.confirm_password,
        userName: user?.userName,
        deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
        teamId: queryParams.get('team_id'),
      };
      setSignInSpinner(true);
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/signup`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {}, payload);

      // let defaultEnterprise = {
      //     "enterpriseId": enterpriseId,
      //     "name": enterpriseDetails?.enterprise_name,
      //     "apiKey": apiKey,
      //     "spyneAssured": "NONE",
      //     "qualityCheck": 0,
      //     "category_id": enterpriseDetails?.category_id
      // }
      // localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey)

      if (Object.keys(resp?.data).length > 0) {
        updateAuthDetailsInRedux(resp?.data);
        localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);
        localStorage.setItem(
          localStorageKeys?.USERDETAILS,
          JSON.stringify(resp?.data?.userData)
        );
        // localStorage.setItem(localStorageKeys?.defaultEnterprise, JSON.stringify(resp?.data?.defaultEnterprise)) // no defaultEnterprise in signup response
        localStorage.setItem(
          localStorageKeys?.permissionObject,
          JSON.stringify(resp?.data?.permissionObject)
        );
        refreshTokenAndUpdateRedux({ fastRefresh: false });
        router.push('/login');
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || error?.message);
      dispatch(resetAuth());
      console.log(error);
    }
    setSignInSpinner(false);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    try {
      if (errorMsg && errorMsg.length) setErrorMsg('');
      setFormErrors(
        validateFormFieldsSetPassword({ formFields: user, fromSignUp: true })
      );
      setIsSubmit(true);
    } catch (error) {
      console.log(error);
    }
  };

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

  const formatInput = (e) => {
    try {
      const attribute = e?.target?.name;
      setUser({
        ...user,
        [attribute]: e?.target?.value?.trim(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateAuthDetailsInRedux = (loginResponseData) => {
    try {
      dispatch(
        updateAuthProp([
          { key: 'loginModalTrigger', value: false },
          { key: 'loggedIn', value: true },
          { key: 'guestLogin', value: false },
          { key: 'authKey', value: loginResponseData?.authKey },
          { key: 'userId', value: loginResponseData?.userData?.userId },
          { key: 'emailId', value: loginResponseData?.userData?.emailId },
          { key: 'userName', value: loginResponseData?.userData?.name },
          { key: 'contact', value: loginResponseData?.userData?.contact },
          // {"key": "defaultEnterprise", "value": loginResponseData?.defaultEnterprise},
          {
            key: 'permissionObject',
            value: loginResponseData?.permissionObject,
          },
        ])
      );
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

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailId = queryParams.get('email_id');
    const userName = queryParams.get('user_name');
    setUser({ ...user, emailId: emailId, userName: userName });
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
              className="tb:m-0 tb:mb-4 m-auto mb-12 h-12 w-auto lg:h-14"
            />
            <div className="tb:w-[500px] mx-auto w-full">
              <div className="w-full">
                <h1 className="text-black-80 mb-8 text-2xl font-bold">
                  {SET_PASSWORD_DATA?.heading}
                </h1>
                <form onSubmit={handleSignup}>
                  <div className="newinput-wrapper relative mb-5">
                    <input
                      className={[
                        formErrors?.userName ? '!border-red' : '',
                        'w-full',
                      ].join(' ')}
                      // placeholder="Name"
                      required
                      autoComplete="off"
                      type="text"
                      name="userName"
                      value={user.userName}
                      onChange={handleChange}
                      onBlur={(e) => {
                        formatInput(e);
                      }}
                    />
                    <label className={formErrors?.userName ? '!text-red' : ''}>
                      {SIGNUP_DATA?.nameText}
                    </label>
                    <p className="text-red mb-0 text-xs">
                      {formErrors?.userName}
                    </p>
                  </div>

                  <div className="newinput-wrapper relative mb-5">
                    <input
                      className={[
                        formErrors?.emailId ? '!border-red' : '',
                        'w-full',
                      ].join(' ')}
                      // placeholder="Email Address"
                      autoComplete="off"
                      required
                      type="text"
                      name="emailId"
                      id="email"
                      value={user.emailId}
                      onChange={handleChange}
                      onBlur={(e) => {
                        formatInput(e);
                      }}
                    />
                    <label className={formErrors?.emailId ? '!text-red' : ''}>
                      {SIGNUP_DATA?.email}
                    </label>
                    <p className="text-red mb-0 text-xs">
                      {formErrors?.emailId}
                    </p>
                  </div>

                  <div className="newinput-wrapper relative mb-5">
                    <input
                      className={[
                        formErrors?.new_password ? '!border-red' : '',
                        'w-full',
                      ].join(' ')}
                      autoComplete="off"
                      onBlur={(e) => {
                        formatInput(e);
                      }}
                      name="new_password"
                      // placeholder="Password"
                      type="password"
                      id="new-password"
                      value={user?.new_password}
                      onChange={handleChange}
                      required
                    />
                    <label
                      className={formErrors?.new_password ? '!text-red' : ''}
                    >
                      {SIGNUP_DATA?.createPassText}
                    </label>
                    <p className="text-red mb-0 text-xs">
                      {formErrors?.new_password}
                    </p>
                  </div>

                  <div className="newinput-wrapper relative mb-5">
                    <input
                      className={[
                        formErrors?.new_password ? '!border-red' : '',
                        'w-full',
                      ].join(' ')}
                      autoComplete="new-password"
                      name="confirm_password"
                      onBlur={(e) => {
                        formatInput(e);
                      }}
                      // placeholder="Password"
                      required
                      type="password"
                      id="confirm-password"
                      onChange={handleChange}
                      value={user?.confirm_password}
                    />
                    <label
                      className={formErrors?.new_password ? '!text-red' : ''}
                    >
                      {SIGNUP_DATA?.confirmPassText}
                    </label>
                    <p className="text-red mb-0 text-xs">
                      {formErrors?.confirm_password}
                    </p>
                  </div>

                  {errorMsg ? (
                    <p className="text-red mb-1 text-center text-xs">
                      {errorMsg}
                    </p>
                  ) : null}
                  <p className="text-black-60 mb-3 mt-8 text-left text-xs font-normal">
                    By verifying, you agree to our&nbsp;
                    <Link
                      href={redirectLinks?.termsServiceUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="text-blue-light">Terms of Service</span>
                      &nbsp;
                    </Link>
                    ,&nbsp;
                    <Link
                      href={redirectLinks?.policyLinkurl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="text-blue-light">Privacy Policy </span>
                      &nbsp;
                    </Link>
                    and
                    <Link
                      href={redirectLinks?.cookieLikUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="text-blue-light"> Cookie Policy.</span>
                    </Link>
                  </p>
                  <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                    <button
                      className={[
                        SignInSpinner ? 'py-1' : 'py-2.5',
                        'block w-full items-center text-sm font-semibold text-white',
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
                        'Sign Up'
                      )}
                    </button>
                  </div>
                </form>

                <p className="text text-black-60 my-6 text-center font-normal tracking-tight">
                  {SET_PASSWORD_DATA?.alreadyHaveAccount}
                  <span
                    onClick={() => moveToLogin()}
                    className="text-blue-light ml-1 cursor-pointer font-semibold"
                  >
                    {SET_PASSWORD_DATA?.login}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-4 hidden md:col-span-5 md:block">
            <div className="h-full w-full py-2 pl-8 pr-6">
              {/* <Image src={LOGIN_DATA?.multiCategoryImagePlaceholder} width={800} height={700} className=" h-full w-full object-contain" alt="Multi Category ecom-image" loading="lazy" /> */}
              <video
                width="100%"
                height="100%"
                autoPlay
                loop
                muted
                className="mx-auto object-contain md:h-[95%]"
                ref={videoRef}
              >
                <source
                  src={LOGIN_DATA?.multiCategoryImagePlaceholder}
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default SetPassword;
