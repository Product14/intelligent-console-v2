/**
 * @format
 */
import { GoogleLogin } from '@react-oauth/google';
import { LOGIN_DATA } from '@spyne-console/common-config/login';
import { useDispatch, useSelector } from '@spyne-console/store';
import { resetAuth, setAuth, updateAuthProp } from '@spyne-console/store';

import React, { createRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

// import ClevertapReact from "clevertap-react"
import { useWindowSize } from '@spyne-console/hooks';

import {
  BUTTON_TYPES,
  LOGIN_TYPES,
  base64Decode,
  checkCategoryAndRedirect,
  generateBearerToken,
  generateUniqueDeviceId,
  guestEnterprise,
  localStorageKeys,
  mailFormatRegEx,
  newBearerAfterGuestLoginFalse,
  redirectToAdminTools,
  refreshTokenAndUpdateRedux,
  sessionStorageKeys,
  skipEnterpriseSelectionPage,
  validateFormFields,
} from '@spyne-console/utils/config';

import styles from '../../styles/LoginPage.module.css';
import CentralAPIHandler from '../centralAPIHandler/centralAPIHandler';
import Spinner from '../common/skeleton&spinner/Spinner';
import { SIGNUP_DATA } from '../signup/config';
import LoginForm from './LoginForm';

function NewLogin(props) {
  const [loginType, setLoginType] = useState('PASSWORD');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState({
    emailId: '',
    password: '',
  });
  const screenSize = useWindowSize();
  const [SignInSpinner, setSignInSpinner] = useState(false);
  const [seeData, setSeeData] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [otp, setOtp] = useState({
    sent: false,
    label: 'Email Address/Phone',
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const videoRef = useRef();
  // Left sideImage of page
  const leftImageURL =
    'https://spyne-static.s3.amazonaws.com/console/blackCarGif.mp4';

  let emailInputRef = createRef();
  const router = useRouter();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // useEffect(() => {
  //     if (typeof window !== 'undefined') {
  //         ClevertapReact.initialize('W4W-55R-786Z');
  //     }
  //   }, []);

  useEffect(() => {
    if (auth.loginModalTrigger) {
      setUser({ emailId: '', password: '' });
      setErrorMsg('');
      setSignInSpinner(false);
      setResetPassword(false);
      setResetEmailSent(false);
    }
  }, [auth.loginModalTrigger]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSignInSpinner(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.emailId,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setAuth(data));
        localStorage.setItem(localStorageKeys.AUTH_TOKEN, data.token);
        dispatch(updateAuthProp([{ key: 'loginModalTrigger', value: false }]));
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (error) {
      setErrorMsg('An error occurred during login');
      console.error('Login error:', error);
    }

    setSignInSpinner(false);
  };

  const handlePasswordLogin = async (payload) => {
    let skuIds = [];
    skuIds = sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      ? sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      : [];
    try {
      setSignInSpinner(true);
      localStorage.removeItem(localStorageKeys?.DEFAULTBEARERTOKEN);

      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/login-encrypted`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {}, payload);
      const decryptedAuthKey = decrypt(resp?.data?.authKey);
      const decryptedSecretKey = decrypt(
        resp?.data?.defaultEnterprise?.secretKey
      );
      const decryptedApiKey = decrypt(resp?.data?.defaultEnterprise?.apiKey);
      // Update the response with decrypted keys
      resp.data.authKey = decryptedAuthKey;
      resp.data.defaultEnterprise.secretKey = decryptedSecretKey;
      resp.data.defaultEnterprise.apiKey = decryptedApiKey;
      let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin))
        : false;
      if (Object.keys(resp?.data || {}).length > 0) {
        if (
          guestLogin &&
          window?.location?.pathname?.includes('/virtualstudio')
        ) {
          // router.replace({query: { "enterprise_id": resp?.data?.defaultEnterprise?.enterpriseId, "team_id": [`${}`] }})
          router.replace({
            query: {
              enterprise_id: resp?.data?.defaultEnterprise?.enterpriseId,
            },
          });
        } else {
          let userEmail = payload?.emailId,
            defaultEnterprise = resp?.data?.defaultEnterprise?.enterpriseId;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (skipEnterpriseSelection) {
            // let selectedEnt = null
            // if (sessionStorage.getItem(sessionStorageKeys?.selectedEnterprise)) {
            //     selectedEnt = JSON.parse(sessionStorage.getItem(sessionStorageKeys?.selectedEnterprise))
            // }
            // if (selectedEnt?.category_id === defaultEnterprise?.prodCatAuto) {
            //     router.push({pathname: "/home", query: {"enterprise_id": enterprise_id}})
            // } else {
            //     router.push({pathname: "/project", query: {"enterprise_id": enterprise_id}})
            // }
            checkCategoryAndRedirect(
              router,
              resp?.data?.defaultEnterprise?.category_id,
              enterprise_id
            );
          } else {
            redirectToAdminTools(router);
          }
        }
        localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);

        if (props?.hideLeftContainer) {
          await newBearerAfterGuestLoginFalse(resp?.data?.authKey); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
          if (skuIds?.length > 0)
            await mapGuestToActual(resp?.data?.userData, skuIds);
        }
        updateAuthDetailsInRedux(resp?.data);

        var cleverTapProfilePayload = {
          Site: {
            source: 'Console',
            login_method: 'Password',
            Email: resp?.data?.userData?.emailId,
            Identity: resp?.data?.userData?.userId,
            Phone: '+91' + resp?.data?.userData?.contact,
            status: 'Success',
            Name: resp?.data?.userData?.emailId,
          },
        };

        var cleverTapPayload = {
          source: 'Console',
          login_method: 'Password',
          Email: resp?.data?.userData?.emailId,
          Identity: resp?.data?.userData?.userId,
          Phone: '+91' + resp?.data?.userData?.contact,
          status: 'Success',
          Name: resp?.data?.userData?.emailId,
        };

        // ClevertapReact?.profile(cleverTapProfilePayload)
        // if (resp && resp?.data?.userData?.emailId && !resp?.data?.userData?.emailId.includes("@spyne.ai")) {
        //     ClevertapReact?.event("web_login", cleverTapPayload)
        // }

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

        refreshTokenAndUpdateRedux({ fastRefresh: false });
        // addUserDetailsInLocalStorage(resp?.data)
      }
    } catch (error) {
      if (props?.hideLeftContainer && skuIds?.length > 0) {
        router.replace('/virtualstudio');
        toast('Oops, something went wrong! Please try again.', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'bottom-center',
          pauseOnHover: true,
        });
      }
      let cleverTapPayload = {
        status: 'Fail',
        source: 'Console',
        login_method: 'Password',
        Email: payload?.emailId,
        Name: payload?.emailId,
        error_msg: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      };
      // if (payload && payload?.emailId && !payload?.emailId.includes("@spyne.ai")) {
      //     ClevertapReact.event("web_login", cleverTapPayload)
      // }

      if (props?.hideLeftContainer && skuIds?.length > 0) {
        router.replace('/virtualstudio');
        toast('Oops, something went wrong! Please try again.', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'bottom-center',
          pauseOnHover: true,
        });
      }
      setErrorMsg(error?.response?.data?.message || error?.message);
      localStorage.removeItem(localStorageKeys?.AUTHKEY);
      let uniqueDeviceId = generateUniqueDeviceId();
      localStorage.setItem(localStorageKeys?.DEVICEID, uniqueDeviceId);
      localStorage.setItem(localStorageKeys?.guestLogin, true);
      dispatch(resetAuth());
      if (props?.hideLeftContainer)
        dispatch(updateAuthProp([{ key: 'loginModalTrigger', value: true }]));
    } finally {
      setSignInSpinner(false);
      if (!props?.hideLeftContainer) {
        localStorage.removeItem(localStorageKeys?.src);
      }
    }
  };

  const updateAuthDetailsInRedux = (loginResponseData) => {
    try {
      localStorage.setItem(localStorageKeys?.guestLogin, false);
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
          {
            key: 'defaultEnterprise',
            value: loginResponseData?.defaultEnterprise,
          },
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

  const getEmailId = (e) => {
    setErrorMsg('');
    setResetEmailSent(false);
    setUser({
      ...user,
      emailId: e.target.value,
    });
    const regex = mailFormatRegEx;
    {
      loginType !== 'PASSWORD' && regex.test(e.target.value)
        ? setOtp({ ...otp, label: 'Phone' })
        : setOtp({ ...otp, label: 'Email Address/Phone' });
    }
  };

  const handleCredentialResponse = async (response) => {
    setSignInSpinner(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(setAuth(data));
        localStorage.setItem(localStorageKeys.AUTH_TOKEN, data.token);
        dispatch(updateAuthProp([{ key: 'loginModalTrigger', value: false }]));
      } else {
        setErrorMsg(data.message || 'Google login failed');
      }
    } catch (error) {
      setErrorMsg('An error occurred during Google login');
      console.error('Google login error:', error);
    }

    setSignInSpinner(false);
  };

  const clickHandler = () => {
    try {
      // props.setToShowSignup(true)
      router.push('/register');
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

  const handleForgotPassword = async () => {
    if (!user.emailId) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setSignInSpinner(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.emailId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetEmailSent(true);
      } else {
        setErrorMsg(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      setErrorMsg('An error occurred while sending reset email');
      console.error('Forgot password error:', error);
    }

    setSignInSpinner(false);
  };

  const mapGuestToActual = async (userData, skuIds) => {
    const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/guest-user-mapping`;

    const payload = {
      guestUserId: guestEnterprise?.guestUserId,
      actualUserId: userData?.userId,
      skuIdList: skuIds,
    };

    await CentralAPIHandler.handlePatchRequest(URL, payload);
  };

  useEffect(() => {
    // if (props.auth.loggedIn) {
    // }
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
          let selectedEnt = null;
          // if (sessionStorage.getItem(sessionStorageKeys?.selectedEnterprise)) {
          //     selectedEnt = JSON.parse(sessionStorage.getItem(sessionStorageKeys?.selectedEnterprise))
          // }
          // if (selectedEnt?.category_id === defaultEnterprise?.prodCatAuto) {
          //     router.push({pathname: "/home", query: {"enterprise_id": enterprise_id}})
          // } else {
          //     router.push({pathname: "/project", query: {"enterprise_id": enterprise_id}})
          // }
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

  const GoogleLoginFunction = () => {
    try {
      return (
        <div className="google-login mx-auto flex w-full items-center justify-center text-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              handleCredentialResponse(credentialResponse);
            }}
            onError={async () => {
              await Logout();
            }}
            useOneTap
            // shape='pill'
            // type="icon"
            text="continue_with"
            // width="260"
            size="large"
            logo_alignment="center"
          />
        </div>
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {props?.hideLeftContainer ? (
        <LoginForm
          handleLogin={handleLogin}
          errorMsg={errorMsg}
          loginType={loginType}
          emailInputRef={emailInputRef}
          user={user}
          setUser={setUser}
          seeData={seeData}
          setSeeData={setSeeData}
          resetPassword={resetPassword}
          resetEmailSent={resetEmailSent}
          SignInSpinner={SignInSpinner}
          getEmailId={getEmailId}
          formatInput={formatInput}
          handleCredentialResponse={handleCredentialResponse}
          clickHandler={clickHandler}
          setShowEmailSignup={props.setShowEmailSignup}
          setShowLoginMenu={props.setShowLoginMenu}
          handleForgotPassword={handleForgotPassword}
          allowClose={props.allowClose}
        />
      ) : (
        <section className="enterprise-selection-area">
          <div className="container-fluid mx-auto">
            <div className="my-auto grid grid-cols-1 gap-0 sm:h-screen sm:grid-cols-12">
              <div className="3xl:col-span-8 col-span-1 px-6 pb-6 pt-8 sm:col-span-7 sm:h-screen sm:pt-14">
                <video
                  width="100%"
                  height="100%"
                  autoPlay
                  loop
                  muted
                  className="mx-auto object-contain sm:h-full"
                  ref={videoRef}
                >
                  <source src={leftImageURL} type="video/webm" />
                </video>
              </div>
              <div className="3xl:col-span-4 col-span-1 block h-full place-items-center px-6 py-3 sm:col-span-5 sm:grid sm:pt-14 md:pl-20 md:pr-32 2xl:px-28">
                <div className="mx-auto sm:w-[400px]">
                  <h1 className="text-black-80 mb-6 text-2xl font-bold">
                    {LOGIN_DATA?.welcomeHeading}
                  </h1>
                  <form onSubmit={handleLogin}>
                    <div className="input-login relative">
                      <input
                        className={[
                          errorMsg ? 'border-red-500' : 'border-black-18',
                          'text-black-50 mb-5 w-full rounded-lg border bg-transparent px-3.5 py-4 text-sm font-normal tracking-tight ring-transparent',
                        ].join(' ')}
                        placeholder={
                          loginType === LOGIN_TYPES.PASSWORD
                            ? 'Email address'
                            : 'Email Address/Phone'
                        }
                        type="text"
                        id="email"
                        name="emailId"
                        required
                        ref={emailInputRef}
                        defaultValue={user?.emailId}
                        onChange={(e) => getEmailId(e)}
                        onBlur={(e) => {
                          formatInput(e);
                        }}
                        autoComplete="new-password"
                      />
                      <label
                        className={
                          errorMsg ? '!text-red-500' : '!text-black-60'
                        }
                      >
                        {LOGIN_DATA?.loginLabel}
                      </label>
                    </div>

                    {loginType === LOGIN_TYPES.PASSWORD ? (
                      <div className="input-login relative mb-5">
                        <input
                          className="border-black-18 text-black-50 w-full rounded-lg border bg-transparent px-3.5 py-4 text-sm font-normal tracking-tight ring-transparent"
                          placeholder="Password"
                          type={seeData ? 'text' : 'password'}
                          id="password"
                          required
                          name="password"
                          onInput={(e) =>
                            setUser({ ...user, password: e.target.value })
                          }
                          value={user.password}
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                          autoComplete="new-password"
                        />
                        <label className="">{LOGIN_DATA?.passowrdLabel}</label>

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
                    ) : null}
                    <div className="mb-5">
                      {!resetPassword ? (
                        resetEmailSent ? (
                          <p className="text-black-60 pointer-events-none mb-1 mt-5 text-sm font-normal">
                            {LOGIN_DATA?.resetMailSentText}
                          </p>
                        ) : (
                          <p
                            className="text-blue-light mb-1 mt-5 cursor-pointer text-sm font-medium"
                            onClick={() => handleForgotPassword()}
                          >
                            {LOGIN_DATA?.forgetPassText}
                          </p>
                        )
                      ) : null}
                      {errorMsg ? (
                        <p className="mb-2 text-xs text-red-500">{errorMsg}</p>
                      ) : null}
                    </div>

                    <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                      {loginType === LOGIN_TYPES.PASSWORD ? (
                        <button
                          className={[
                            SignInSpinner ? 'py-1' : 'py-2.5',
                            'block w-full items-center text-sm font-semibold text-white',
                          ].join(' ')}
                          type="submit"
                          id={styles['login']}
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
                            'Log in'
                          )}
                        </button>
                      ) : null}
                    </div>
                  </form>
                  <p className="border-black-20 text-black-60 mx-8 my-7 border-t text-center font-normal leading-[0] tracking-tight">
                    <span className="bg-white px-3">
                      {LOGIN_DATA?.orSeparatorText}
                    </span>
                  </p>
                  {/* <GoogleLoginFunction/> */}

                  <div className="mx-auto flex w-full items-center justify-center text-center">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        handleCredentialResponse(credentialResponse);
                      }}
                      onError={async () => {
                        await Logout();
                      }}
                      useOneTap
                      // shape='pill'
                      // type="icon"
                      text="continue_with"
                      // width="260"
                      size="large"
                      logo_alignment="center"
                    />
                  </div>
                  {screenSize !== 'DESKTOP' ? null : (
                    <p className="text text-black-60 my-6 text-center font-normal tracking-tight">
                      {LOGIN_DATA?.dontHaveACNT}
                      <span
                        onClick={() => clickHandler()}
                        className="text-blue-light ml-1 cursor-pointer font-medium"
                      >
                        {LOGIN_DATA?.signUp}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default NewLogin;
