/**
 * @format
 */
import { GoogleLogin } from '@react-oauth/google';

import React, { createRef, useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { toast } from 'react-toastify';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { element } from 'prop-types';
import { v4 as uuid } from 'uuid';

import styles from '../../styles/LoginPage.module.css';
import {
  BUTTON_TYPES,
  LOGIN_TYPES,
  base64Payload,
  localStorageKeys,
  mailFormatRegEx,
  newHubspotReport,
  redirectLinks,
  redirectToAdminTools,
  validateCreateEnterpriseFormFields,
  validateFormFields,
  validateInputFields,
} from '../../utils/config';
import CentralAPIHandler from '../centralAPIHandler/centralAPIHandler';
import Spinner from '../common/skeleton&spinner/Spinner';
import { _tokenGenerationForPublicAPIs } from '../common/utility/tokenRotation';
import { useAuthActions } from '../hooks/useAuthActions';
import { SIGNUP_DATA } from './config';

// import ClevertapReact from "clevertap-react"

function Signup(props) {
  const [loginType, setLoginType] = useState('PASSWORD');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState({
    emailId: '',
    password: '',
    userName: '',
    confirmPassword: '',
    otp: '',
    teamName: '',
    enterpriseName: '',
    category: 'Automobile',
    contactNo: '',
    url: '',
    country: '',
  });
  const [stepSignUp, setStepSignUp] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [SignInSpinner, setSignInSpinner] = useState(false);
  const [verifySpinner, setVerifySpinner] = useState(false);
  const [isSignUpFromQr, setIsSignUpFromQr] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [roleOrganisation, setRoleOrganisation] = useState('Local Dealer');
  const [otp, setOtp] = useState({
    sent: false,
    label: 'Email address',
  });
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0,
  });
  const [isSubmit, setIsSubmit] = useState(false);
  const [seePassword, setSeePassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const videoRef = useRef();
  // Left sideImage of page
  const leftImageURL =
    'https://spyne-static.s3.amazonaws.com/console/blackCarGif.mp4';

  const [value, setValue] = useState('');
  const options = useMemo(() => countryList().getData(), []);

  const [roleSelection, setRoleSelection] = useState({
    roleOptions: [
      {
        label: 'LOCAL_DEALER',
        value: 'Local Dealer',
      },
      {
        label: 'DEALERSHIP_GROUP',
        value: 'Dealership Group',
      },
      {
        label: 'WHOLESALE_AUCTION',
        value: 'Wholesale Auction',
      },
      {
        label: 'OEM',
        value: 'OEM',
      },
      {
        label: 'OTHER',
        value: 'Other',
      },
    ],
  });
  const [HubSpotpayload, setHubSpotPayload] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const { auth, updateAuthProp, resetAuth } = useAuthActions();

  const router = useRouter();

  useEffect(() => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth,
    });
    let queryParams = new URLSearchParams(window.location.search);
    let source = queryParams.get('source');
    source ? setIsSignUpFromQr(true) : setIsSignUpFromQr(false);
  }, []);

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  let emailInputRef = createRef();

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    try {
      setUser({
        ...user,
        otp: '',
        enterpriseName: '',
        teamName: '',
      });
      // if (errorMsg && errorMsg.length) setErrorMsg("")
      setFormErrors(validateFormFields({ formFields: user, fromSignUp: true }));
      if (
        Object?.keys(validateFormFields({ formFields: user, fromSignUp: true }))
          ?.length > 0
      )
        return;
      setErrorMsg('');
      // if(validateFormFields({ formFields: user})) return;
      setSignInSpinner(true);
      localStorage.removeItem(localStorageKeys.DEFAULTBEARERTOKEN);
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/generate-otp`;
      const payload = {
        email_id: user?.emailId,
      };
      if (auth.resellerData.is_reseller) {
        payload['enterprise_id'] = auth.resellerData.enterprise_id;
      }
      await CentralAPIHandler.handlePostRequest(URL, payload);

      let cleverTapPayload = {
        status: 'OTP Sent',
        source: 'Console',
        Email: user?.emailId,
        Phone: '+91' + user?.contactNo,
      };
      // if(user && user?.emailId && !user?.emailId.includes("@spyne.ai")){
      //    ClevertapReact.event("web_signup_information", cleverTapPayload)
      // }

      setSeconds(30);
      setStepSignUp(2);

      // Replace dispatch calls with updateAuthProp
      updateAuthProp([
        {
          key: 'previousState',
          value: {
            ...auth?.previousState,
            [LOGIN_TYPES?.SELECT_ENTERPRISE]: loginType,
          },
        },
      ]);
    } catch (error) {
      // console.log(error)
      let cleverTapPayload = {
        status: 'Fail',
        source: 'Console',
        Email: user?.emailId,
        error_msg: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      };
      // if(user && user?.emailId && !user?.emailId.includes("@spyne.ai")){
      //    ClevertapReact.event("web_signup_information", cleverTapPayload)
      // }
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Unknown error occurred'
      );
      setSignInSpinner(false);
    }
  };

  const verifyEmail = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!user?.otp) return;
      setVerifySpinner(true);
      setErrorMsg('');
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/verify-otp`;
      await CentralAPIHandler.handlePostRequest(URL, {
        email_id: user?.emailId,
        otp: user?.otp,
      });

      setStepSignUp(3);

      // Replace dispatch calls with updateAuthProp
      updateAuthProp([
        {
          key: 'previousState',
          value: { ...auth?.previousState, [LOGIN_TYPES?.OTP]: loginType },
        },
      ]);
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Unknown error occurred'
      );
      setSignInSpinner(false);
    }
    setVerifySpinner(false);
  };

  const handlePasswordSignup = async (e) => {
    if (e) e.preventDefault();
    let teamId;
    let enterpriseId;
    let apiKey;
    let step = null;
    try {
      let deviceId = uuid().slice(0, 36);
      deviceId = deviceId.replace(/[&\/\\#, +()$~%.'":*?<>{}-]/g, '');
      setFormErrors(
        validateCreateEnterpriseFormFields({
          formFields: user,
          fromSignUp: true,
        })
      );
      if (
        Object?.keys(
          validateCreateEnterpriseFormFields({
            formFields: user,
            fromSignUp: true,
          })
        )?.length > 0
      )
        return;
      setErrorMsg('');
      setSignInSpinner(true);

      const secureToken = _tokenGenerationForPublicAPIs();
      const URLCreateEnterprise = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/create-enterprise-config`;
      let response = await CentralAPIHandler.handlePostRequest(
        URLCreateEnterprise,
        {
          enterpriseName: user?.enterpriseName,
          category: 'cat_d8R14zUNE',
          teamName: user?.teamName,
          emailId: user?.emailId,
          password: user?.password,
          userName: user?.userName,
          deviceId: deviceId,
          sSecret: secureToken.passPhrase,
          sKey: secureToken.token,
          url: user?.url,
          country: user?.country,
          category_id: 'cat_d8R14zUNE',
        },
        {}
      );
      step = 1;
      teamId = response?.data?.teamId;
      enterpriseId = response?.data?.enterpriseId;
      apiKey = response?.data?.apiKey;

      let payload = {
        strategy: 'PASSWORD',
        apiKey: apiKey,
        emailId: user?.emailId.toLowerCase(),
        password: user?.password,
        userName: user?.userName,
        // deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
        deviceId: deviceId,
        enterpriseOnboarding: true,
        roleOrganisation,
        contactNo: user?.contactNo,
        isdCode: 91,
      };
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/signup`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {}, payload);
      step = 2;
      const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
      const URLDefaultConfigation = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-configuration`;
      await CentralAPIHandler.handlePostRequest(URLDefaultConfigation, {
        enterpriseId: enterpriseId,
        prodCatId: 'cat_d8R14zUNE',
        emailId: user?.emailId,
        spyneAssured: false,
        coBrand: true,
        price: 4,
        role_organisation: roleOrganisation,
        planTitle: 'Combo - Cobranded',
        sSecret: secureTokenConfigurations.passPhrase,
        sKey: secureTokenConfigurations.token,
      });
      step = null;
      let prodCatId = 'cat_d8R14zUNE';
      // await addDefaultBgTags(enterpriseId, prodCatId)
      // if (dimensions.width < 767) {
      if (props.hideVehicleSpin) {
        loginMenu();
      } else if (!props.hideVehicleSpin && isSignUpFromQr) {
        localStorage.clear();
        sessionStorage.clear();
        router.push(
          `/register/success?username=${user?.userName}&source=event`
        );
      } else {
        localStorage.clear();
        sessionStorage.clear();
        router.push(`/register/success?username=${user?.userName}`);
      }
      toast('Your account has been created', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
        position: 'bottom-center',
        pauseOnHover: true,
      });
      newHubspotReport(HubSpotpayload);
      let cleverTapPayload = {
        status: 'Enterprise Created',
        source: 'Console',
        Email: user?.emailId,
        Phone: '+91' + user?.contactNo,
      };
      // if(user && user?.emailId && !user?.emailId.includes("@spyne.ai")){
      //    ClevertapReact.event("web_signup_enterprise_info_filled", cleverTapPayload)
      // }

      // } else {
      //     router.push("/login");
      //     toast('Your account has been created', { hideProgressBar: true, autoClose: 2000, type: 'success', position: 'bottom-center', pauseOnHover: true })
      //     // if (Object.keys(resp?.data).length > 0) {
      //     //     updateAuthDetailsInRedux(resp?.data)
      //     //     router.push("/enterprises")
      //     //     localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey)
      //     //     localStorage.setItem(localStorageKeys?.USERDETAILS, JSON.stringify(resp?.data?.userData))
      //     //     localStorage.setItem(localStorageKeys?.defaultEnterprise, JSON.stringify(resp?.data?.defaultEnterprise))
      //     //     localStorage.setItem(localStorageKeys?.permissionObject, JSON.stringify(resp?.data?.permissionObject))
      //     //     refreshTokenAndUpdateRedux({ fastRefresh: false })
      //     //     // addUserDetailsInSession(resp?.data)
      //     // }
      setUser({
        emailId: '',
        password: '',
        userName: '',
        confirmPassword: '',
        otp: '',
        teamName: '',
        enterpriseName: '',
        category: 'Automobile',
      });
    } catch (error) {
      if (step) {
        try {
          const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
          const URLCreateEnterprise = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/delete-configuration`;
          await CentralAPIHandler.handlePostRequest(URLCreateEnterprise, {
            enterpriseId: enterpriseId,
            teamId: teamId,
            emailId: user?.emailId,
            sSecret: secureTokenConfigurations.passPhrase,
            sKey: secureTokenConfigurations.token,
            step: step,
          });
        } catch (error) {
          throw Error(error);
        }
      }
      toast('Something went wrong', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
        position: 'bottom-center',
        pauseOnHover: true,
      });
      setErrorMsg(error?.response?.data?.message || error?.message);
      resetAuth();
    }
    setSignInSpinner(false);
    setVerifySpinner(false);
  };

  const updateAuthDetailsInRedux = (loginResponseData) => {
    try {
      localStorage.setItem(localStorageKeys.guestLogin, false);
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
        { key: 'permissionObject', value: loginResponseData?.permissionObject },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 2 }),
    control: (defaultStyles, state) => ({
      ...defaultStyles,
      paddingTop: '0.700rem',
      paddingBottom: '0.700rem',
      borderRadius: '8px',
      boxShadow: 'none',
      border: '1px solid #00000066',
      textAlign: 'left',
      '&:hover': {
        // Overwrittes the different states of border
        borderColor: state.isFocused ? '' : '',
      },
    }),
    placeholder: (defaultStyles) => ({
      ...defaultStyles,
      color: '#00000066',
      textAlign: 'left',
    }),
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
  const handleChange = (e) => {
    e.preventDefault();
    try {
      if (e.target.name === 'contactNo') {
        if (e.target.value.match(/[a-z]/i)) return;
        if (e.target.value.match(/[&\/\\#,@!^_=; +()$~%.'":*?<>{}-]/g)) return;
      }
      setIsSubmit(false);
      setErrorMsg('');
      setFormErrors({});
      setSignInSpinner(false);
      const { name, value } = e?.target;
      if (name === 'otp') {
        if (value.match(/[a-z]/i)) return;
        if (value.match(/[&\/\\#,@!^_=; +()$~%.'":*?<>{}-]/g)) return;
      }
      setUser({ ...user, [name]: value });
      if (name === 'userName') {
        setHubSpotPayload({ ...HubSpotpayload, name: value });
      } else if (name === 'emailId') {
        setHubSpotPayload({ ...HubSpotpayload, email: value });
      } else if (name === 'enterpriseName') {
        setHubSpotPayload({ ...HubSpotpayload, company: value });
      } else if (name === 'contactNo') {
        setHubSpotPayload({ ...HubSpotpayload, phone: value });
      }
    } catch (error) {}
  };
  const handleCredentialResponse = async (googleResponse) => {
    try {
      let credential = base64Decode({
        payload: googleResponse,
        decodeSrc: true,
      });

      let payload = {
        strategy: 'GOOGLE',
        apiKey: process.env.REACT_APP_API_KEY,
        emailId: credential?.email,
        password: '',
        deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
      };
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
      if (Object.keys(resp?.data).length > 0) {
        updateAuthDetailsInRedux(resp?.data);
        redirectToAdminTools(router);
        localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);
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
      }
    } catch (error) {
      setErrorMsg(error?.data?.message || error);
      resetAuth();
    }
  };

  const countryChangeHandler = (value) => {
    setValue(value);
    setUser({
      ...user,
      ['country']: value?.label?.trim(),
    });
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
          // console.log(error)
        }
      }, timeInterval);
    } catch (error) {
      // console.log(error)
    }
  };
  // useEffect(() => {
  //     console.log(formErrors)

  //     if (formErrors) {
  //         if (Object?.keys(formErrors)?.length === 0 && isSubmit) {
  //             handlePasswordSignup()
  //         }
  //     }
  // }, [formErrors])

  useEffect(() => {
    if (!props.hideVehicleSpin) {
      videoRef.current.play();
    }
  }, []);

  const resendOTP = async () => {
    try {
      await handleSignup();
      setSeconds(30);
    } catch (error) {}
  };

  useEffect(() => {
    if (seconds > 0 && stepSignUp === 2) {
      const interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSeconds(`00`);
    }
  }, [seconds]);

  const handleroleSelection = (event) => {
    event.stopPropagation();
    try {
      let imageType = event?.target?.value;
      setRoleOrganisation(imageType);
    } catch (error) {
      // console.log(error)
    }
  };

  const moveToLogin = () => {
    try {
      router.push('/login');
    } catch (error) {}
  };

  const loginMenu = () => {
    try {
      props.setShowEmailSignup(false);
      props.setShowLoginMenu(true);
    } catch (error) {}
  };

  //   const closeWindow=()=>{
  //     try {
  //         window.open("about:blank", "_self");
  //         window.close();
  //     } catch (error) {

  //     }
  //   }

  useEffect(() => {
    if (
      localStorage.getItem(localStorageKeys?.DEVICEID) &&
      localStorage.getItem(localStorageKeys?.AUTHKEY) &&
      localStorage.getItem(localStorageKeys.DEFAULTBEARERTOKEN)
    ) {
      redirectToAdminTools(router);
      refreshTokenAndUpdateRedux({ fastRefresh: false });
    }
  }, []);

  const addDefaultBgTags = async (enterpriseId, prodCatId) => {
    try {
      const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
      const createBgID = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-bg-tags`;
      await CentralAPIHandler.handlePostRequest(createBgID, {
        enterpriseId: enterpriseId
          ? enterpriseId
          : progressStateLocaleStorage?.enterpriseId,
        prodCatId: prodCatId,
        sSecret: secureTokenConfigurations.passPhrase,
        sKey: secureTokenConfigurations.token,
      });
    } catch (error) {}
  };
  const closeLogin = () => {
    try {
      updateAuthProp([{ key: 'loginModalTrigger', value: false }]);
      props.setShowEmailSignup(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {props.hideVehicleSpin ? (
        <div className="px-0.5">
          <div className="bg-black-20 mx-auto -mt-5 mb-5 block h-1.5 w-[50%] rounded-3xl lg:hidden"></div>

          {stepSignUp === 1 ? (
            <div className="w-full">
              <h1 className="text-black-80 mb-6 flex justify-between text-left text-2xl font-bold">
                {SIGNUP_DATA?.welcomeHeading}
                {props.allowClose && (
                  <Image
                    src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg"
                    width={24}
                    height={24}
                    alt="close"
                    className="flex cursor-pointer items-center"
                    onClick={() => closeLogin()}
                  />
                )}
              </h1>
              <form onSubmit={(e) => handleSignup(e)}>
                <div className="input-login relative mb-5">
                  <input
                    className={[
                      formErrors?.userName
                        ? 'border-red-500'
                        : 'border-black-40',
                      'text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent',
                    ].join(' ')}
                    placeholder="John Doe"
                    autoComplete="off"
                    type="text"
                    name="userName"
                    value={user.userName}
                    maxLength={20}
                    onChange={handleChange}
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                  />
                  <label
                    className={formErrors?.userName ? '!text-red-500' : ''}
                  >
                    {SIGNUP_DATA?.nameText}
                  </label>

                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.userName}
                  </p>
                </div>

                <div className="input-login relative mb-5">
                  <input
                    className={[
                      formErrors?.emailId
                        ? 'border-red-500'
                        : 'border-black-40',
                      'text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent',
                    ].join(' ')}
                    autoComplete="off"
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                    name="emailId"
                    placeholder={
                      loginType === LOGIN_TYPES.PASSWORD
                        ? 'johndoe@gmail.com'
                        : 'johndoe@gmail.com'
                    }
                    type="text"
                    id="email"
                    maxLength={30}
                    value={user?.emailId}
                    onChange={handleChange}
                  />
                  <label className={formErrors?.emailId ? '!text-red-500' : ''}>
                    {SIGNUP_DATA?.email}
                  </label>

                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.emailId}
                  </p>
                </div>
                <div className="input-login relative mb-5">
                  <input
                    className={`${formErrors?.contactNo ? 'border-red-500' : 'border-black-40'} "placeholder:text-black-80 ring-transparent" text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight`}
                    autoComplete="off"
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                    name="contactNo"
                    placeholder={9866599954}
                    type="text"
                    id="contact"
                    value={user?.contactNo}
                    onChange={handleChange}
                  />
                  <label
                    className={formErrors?.contactNo ? '!text-red-500' : ''}
                  >
                    {SIGNUP_DATA?.contactNo}
                  </label>

                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.contactNo}
                  </p>
                </div>
                <div className="input-login relative mb-5">
                  <input
                    className={[
                      formErrors?.password
                        ? 'border-red-500'
                        : 'border-black-40',
                      'text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent',
                    ].join(' ')}
                    autoComplete="new-password"
                    name="password"
                    placeholder="Password"
                    type={!seePassword.password ? 'password' : 'text'}
                    maxLength={15}
                    value={user?.password}
                    onChange={handleChange}
                  />
                  <label
                    className={[
                      formErrors?.password ? '!text-red-500' : '',
                      '',
                    ].join(' ')}
                  >
                    {SIGNUP_DATA?.createPassText}
                  </label>
                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.password}
                  </p>
                  {user?.password ? (
                    <span className={[styles['seeIcon']]}>
                      {seePassword.password ? (
                        <Image
                          onClick={() =>
                            setSeePassword({ ...seePassword, password: false })
                          }
                          src="https://spyne-static.s3.amazonaws.com/console/eye.svg"
                          width={16}
                          height={16}
                          alt="passowrd hide"
                        />
                      ) : (
                        <Image
                          onClick={() =>
                            setSeePassword({ ...seePassword, password: true })
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

                <div className="input-login relative mb-5">
                  <input
                    className={`${formErrors?.confirmPassword ? 'border-red-500' : 'border-black-40'} "placeholder:text-black-80 ring-transparent" text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight`}
                    autoComplete="confirm-password"
                    name="confirmPassword"
                    placeholder="Password"
                    type={!seePassword.confirmPassword ? 'password' : 'text'}
                    value={user?.confirmPassword}
                    maxLength={15}
                    onChange={handleChange}
                  />
                  <label
                    className={
                      formErrors?.confirmPassword ? '!text-red-500' : ''
                    }
                  >
                    {SIGNUP_DATA?.confirmPassText}
                  </label>

                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.confirmPassword}
                  </p>
                  {user?.confirmPassword ? (
                    <span className={[styles['seeIcon']]}>
                      {seePassword.confirmPassword ? (
                        <Image
                          onClick={() =>
                            setSeePassword({
                              ...seePassword,
                              confirmPassword: false,
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
                              confirmPassword: true,
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
                {!(
                  window.location.href.includes('carlens') ||
                  window.location.href.includes('spinic')
                ) && (
                  <p className="text-black-60 mb-5 text-left text-xs font-normal">
                    By signing up, you agree to our{' '}
                    <Link
                      href={redirectLinks?.termsServiceUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      &nbsp;
                      <span className="text-blue-light">
                        Terms&nbsp;of&nbsp;Service
                      </span>
                    </Link>
                    ,
                    <Link
                      href={redirectLinks?.policyLinkurl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      &nbsp;
                      <span className="text-blue-light">
                        Privacy&nbsp;Policy&nbsp;
                      </span>
                    </Link>{' '}
                    and
                    <Link
                      href={redirectLinks?.cookieLikUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="text-blue-light">
                        {' '}
                        Cookie&nbsp;Policy.
                      </span>
                    </Link>
                  </p>
                )}
                {errorMsg ? (
                  <p className="mb-1 text-center text-xs text-red-500">
                    {errorMsg}
                  </p>
                ) : null}

                <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                  <button
                    className={[
                      verifySpinner ? 'py-1' : 'py-2.5',
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
                    ) : otp.sent ? (
                      'Verify OTP'
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </div>
              </form>
              <>
                <p className="text border-black-20 text-black-60 mx-8 my-7 border-t text-center font-normal leading-[0] tracking-tight">
                  <span className="bg-white px-3">
                    {SIGNUP_DATA?.orSeparatorText}
                  </span>
                </p>
                <p className="text-black-60 mt-7 text-center font-normal tracking-tight">
                  {SIGNUP_DATA?.dontHaveACNT}
                  <span
                    onClick={() => loginMenu()}
                    className="text-blue-light ml-1 cursor-pointer font-semibold md:font-medium"
                  >
                    {SIGNUP_DATA?.logIn}
                  </span>
                </p>
              </>
            </div>
          ) : null}
          {/* otp sent and verify  */}
          {stepSignUp === 2 ? (
            <div className="w-full">
              <h1
                className={[
                  'text-black-80 mb-6 text-2xl font-bold',
                  props.hideVehicleSpin ? 'text-left' : '',
                ].join(' ')}
              >
                {SIGNUP_DATA?.heading}
              </h1>
              <p
                className={[
                  'text-black-60 text-sm font-normal',
                  props.hideVehicleSpin ? 'text-left' : '',
                ].join(' ')}
              >
                {SIGNUP_DATA?.subHeading}{' '}
                <span className="text-black-80 font-medium">
                  {user?.emailId}
                </span>
                <small
                  className="text-blue-light ml-4 cursor-pointer text-sm"
                  onClick={() => setStepSignUp(1)}
                >
                  {SIGNUP_DATA?.changeText}
                </small>
              </p>
              <form className="mt-6" onSubmit={verifyEmail}>
                <div className="input-container relative mb-5">
                  <input
                    className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                    placeholder="000-000"
                    autoComplete="off"
                    type="text"
                    maxLength={6}
                    minLength={6}
                    name="otp"
                    value={user.otp}
                    onChange={handleChange}
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                  />
                  <label className="">{SIGNUP_DATA?.enterOtp}</label>
                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.userName}
                  </p>
                  <p className="text-black-60 mt-6 text-sm font-normal">
                    <button
                      onClick={resendOTP}
                      disabled={seconds > 0}
                      className={
                        seconds > 0 ? '' : 'text-blue-light cursor-pointer'
                      }
                    >
                      {SIGNUP_DATA?.resendOtp}
                    </button>{' '}
                    in{' '}
                    <span className="text-black-80 font-medium">
                      00:{seconds}s
                    </span>
                  </p>
                  {/* <small className=" cursor-pointer text-blue-light text-sm">{SIGNUP_DATA?.resendOtp}</small> */}{' '}
                  {/*after time limit over then resend OTP button */}
                </div>

                {errorMsg ? (
                  <p className="mb-1 text-center text-xs text-red-500">
                    {errorMsg}
                  </p>
                ) : null}
                <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                  <button
                    className={[
                      verifySpinner ? 'py-1' : 'py-2.5',
                      'block w-full items-center text-sm font-semibold text-white',
                    ].join(' ')}
                    type="submit"
                    disabled={verifySpinner ? true : false}
                  >
                    {verifySpinner ? (
                      <Spinner
                        type="LIGHT"
                        style_CLASS={
                          'justify-center w-full h-full item-center flex'
                        }
                      />
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Create enterprise screen  */}
          {stepSignUp === 3 ? (
            <div className="w-full">
              <h1 className="text-black-80 mb-6 text-2xl font-bold">
                {SIGNUP_DATA?.createEnterprise}
              </h1>

              <form className="mt-6" onSubmit={handlePasswordSignup}>
                <div className="input-container relative mb-5">
                  <input
                    className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                    placeholder=" Enterprise Name"
                    autoComplete="off"
                    type="text"
                    name="enterpriseName"
                    value={user.enterpriseName}
                    maxLength={20}
                    onChange={handleChange}
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                  />
                  <label className="text-black-60 text-sm font-normal">
                    {SIGNUP_DATA?.companyName}
                  </label>
                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.enterpriseName}
                  </p>
                </div>
                <div className="input-container relative mb-5">
                  <input
                    className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                    placeholder="Team Name"
                    autoComplete="off"
                    type="text"
                    name="teamName"
                    value={user.teamName}
                    maxLength={20}
                    onChange={handleChange}
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                  />
                  <label className="text-black-60 text-sm font-normal">
                    {SIGNUP_DATA?.teamName}
                  </label>
                  <p className="mb-0 text-xs text-red-500">
                    {formErrors?.teamName}
                  </p>
                </div>
                <div className="input-container relative mb-5">
                  <label className="text-black-60 px-[5px!important] text-xs font-normal">
                    {SIGNUP_DATA?.roleName}
                  </label>
                  <select
                    className="border-black-40 text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                    onChange={(e) => handleroleSelection(e)}
                  >
                    {roleSelection?.roleOptions?.map((element, indx) => {
                      return (
                        <option key={`role-${indx}`} value={element?.value}>
                          {element?.value}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="input-container relative mb-5">
                  <input
                    className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                    placeholder="Website URL"
                    autoComplete="off"
                    type="text"
                    name="url"
                    value={user.url}
                    onChange={handleChange}
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                  />
                  <label className="text-black-60 text-sm font-normal">
                    {SIGNUP_DATA?.url}
                  </label>
                  <p className="mb-0 text-xs text-red-500">{formErrors?.url}</p>
                </div>
                <div className="input-container relative mb-5">
                  <label className="text-black-60 px-[5px!important] text-xs font-normal">
                    {SIGNUP_DATA?.country}
                  </label>
                  <Select
                    onChange={countryChangeHandler}
                    value={value}
                    options={options}
                    styles={customStyles}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null,
                    }}
                    placeholder="Select Country"
                    onBlur={(e) => {
                      formatInput(e);
                    }}
                  />
                </div>

                <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                  <button
                    className={[
                      verifySpinner ? 'py-1' : 'py-2.5',
                      'block w-full items-center text-sm font-semibold text-white',
                    ].join(' ')}
                    type="submit"
                    disabled={verifySpinner ? true : false}
                  >
                    {SignInSpinner ? (
                      <Spinner
                        type="LIGHT"
                        style_CLASS={
                          'justify-center w-full h-full item-center flex'
                        }
                      />
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
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
                  className="mx-auto h-full object-contain"
                  ref={videoRef}
                >
                  <source src={leftImageURL} type="video/webm" />
                </video>
              </div>
              <div className="3xl:col-span-4 col-span-1 block h-full place-items-center px-6 py-3 sm:col-span-5 sm:grid sm:pt-14 md:pl-20 md:pr-32 2xl:px-28">
                {stepSignUp === 1 ? (
                  <div className="w-full">
                    <h1 className="text-black-80 mb-6 text-2xl font-bold">
                      {SIGNUP_DATA?.welcomeHeading}
                    </h1>
                    <form onSubmit={(e) => handleSignup(e)}>
                      <div className="input-login relative mb-5">
                        <input
                          className={[
                            formErrors?.userName
                              ? 'border-red-500'
                              : 'border-black-40',
                            'text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent',
                          ].join(' ')}
                          placeholder="John Doe"
                          autoComplete="off"
                          type="text"
                          name="userName"
                          value={user.userName}
                          maxLength={20}
                          onChange={handleChange}
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                        />
                        <label
                          className={
                            formErrors?.userName ? '!text-red-500' : ''
                          }
                        >
                          {SIGNUP_DATA?.nameText}
                        </label>

                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.userName}
                        </p>
                      </div>

                      <div className="input-login relative mb-5">
                        <input
                          className={[
                            formErrors?.emailId
                              ? 'border-red-500'
                              : 'border-black-40',
                            'text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent',
                          ].join(' ')}
                          autoComplete="off"
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                          name="emailId"
                          placeholder={
                            loginType === LOGIN_TYPES.PASSWORD
                              ? 'johndoe@gmail.com'
                              : 'johndoe@gmail.com'
                          }
                          type="text"
                          id="email"
                          maxLength={30}
                          value={user?.emailId}
                          onChange={handleChange}
                        />
                        <label
                          className={formErrors?.emailId ? '!text-red-500' : ''}
                        >
                          {SIGNUP_DATA?.email}
                        </label>

                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.emailId}
                        </p>
                      </div>
                      <div className="input-login relative mb-5">
                        <input
                          className={`${formErrors?.contactNo ? 'border-red-500' : 'border-black-40'} "placeholder:text-black-80 ring-transparent" text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight`}
                          autoComplete="off"
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                          name="contactNo"
                          placeholder={9866599954}
                          type="text"
                          id="contact"
                          value={user?.contactNo}
                          onChange={handleChange}
                        />
                        <label
                          className={
                            formErrors?.contactNo ? '!text-red-500' : ''
                          }
                        >
                          {SIGNUP_DATA?.contactNo}
                        </label>

                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.contactNo}
                        </p>
                      </div>
                      <div className="input-login relative mb-5">
                        <input
                          className={[
                            formErrors?.password
                              ? 'border-red-500'
                              : 'border-black-40',
                            'text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent',
                          ].join(' ')}
                          autoComplete="new-password"
                          name="password"
                          placeholder="Password"
                          type={!seePassword.password ? 'password' : 'text'}
                          maxLength={15}
                          value={user?.password}
                          onChange={handleChange}
                        />
                        <label
                          className={[
                            formErrors?.password ? '!text-red-500' : '',
                            '',
                          ].join(' ')}
                        >
                          {SIGNUP_DATA?.createPassText}
                        </label>
                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.password}
                        </p>
                        {user?.password ? (
                          <span className={[styles['seeIcon']]}>
                            {seePassword.password ? (
                              <Image
                                onClick={() =>
                                  setSeePassword({
                                    ...seePassword,
                                    password: false,
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
                                    password: true,
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

                      <div className="input-login relative mb-5">
                        <input
                          className={`${formErrors?.confirmPassword ? 'border-red-500' : 'border-black-40'} "placeholder:text-black-80 ring-transparent" text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight`}
                          autoComplete="confirm-password"
                          name="confirmPassword"
                          placeholder="Password"
                          type={
                            !seePassword.confirmPassword ? 'password' : 'text'
                          }
                          value={user?.confirmPassword}
                          maxLength={15}
                          onChange={handleChange}
                        />
                        <label
                          className={
                            formErrors?.confirmPassword ? '!text-red-500' : ''
                          }
                        >
                          {SIGNUP_DATA?.confirmPassText}
                        </label>

                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.confirmPassword}
                        </p>
                        {user?.confirmPassword ? (
                          <span className={[styles['seeIcon']]}>
                            {seePassword.confirmPassword ? (
                              <Image
                                onClick={() =>
                                  setSeePassword({
                                    ...seePassword,
                                    confirmPassword: false,
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
                                    confirmPassword: true,
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
                      <p className="text-black-60 mb-5 text-xs font-normal">
                        By signing up, you agree to our
                        <Link
                          href={redirectLinks?.termsServiceUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {' '}
                          <span className="text-blue-light">
                            Terms of Service{' '}
                          </span>
                        </Link>
                        ,
                        <Link
                          href={redirectLinks?.policyLinkurl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {' '}
                          <span className="text-blue-light">
                            Privacy Policy{' '}
                          </span>
                        </Link>{' '}
                        and
                        <Link
                          href={redirectLinks?.cookieLikUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {' '}
                          <span className="text-blue-light">
                            Cookie Policy.
                          </span>
                        </Link>
                      </p>
                      {errorMsg ? (
                        <p className="mb-1 text-center text-xs text-red-500">
                          {errorMsg}
                        </p>
                      ) : null}

                      <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                        <button
                          className={[
                            verifySpinner ? 'py-1' : 'py-2.5',
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
                          ) : otp.sent ? (
                            'Verify OTP'
                          ) : (
                            'Sign up'
                          )}
                        </button>
                      </div>
                    </form>
                    {dimensions.width < 767 ? null : (
                      <>
                        <p className="text border-black-20 text-black-60 mx-8 my-7 border-t text-center font-normal leading-[0] tracking-tight">
                          <span className="bg-white px-3">
                            {SIGNUP_DATA?.orSeparatorText}
                          </span>
                        </p>

                        <p className="text text-black-60 my-6 text-center font-normal tracking-tight">
                          {SIGNUP_DATA?.dontHaveACNT}
                          <span
                            onClick={moveToLogin}
                            className="text-blue-light ml-1 cursor-pointer font-medium"
                          >
                            {SIGNUP_DATA?.logIn}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                ) : null}
                {/* otp sent and verify  */}
                {stepSignUp === 2 ? (
                  <div className="w-full">
                    <h1 className="text-black-80 mb-6 text-2xl font-bold">
                      {SIGNUP_DATA?.heading}
                    </h1>
                    <p className="text-black-60 text-sm font-normal">
                      {SIGNUP_DATA?.subHeading}{' '}
                      <span className="text-black-80 font-medium">
                        {user?.emailId}
                      </span>
                      <small
                        className="text-blue-light ml-4 cursor-pointer text-sm"
                        onClick={() => setStepSignUp(1)}
                      >
                        {SIGNUP_DATA?.changeText}
                      </small>
                    </p>
                    <form className="mt-6" onSubmit={verifyEmail}>
                      <div className="input-container relative mb-5">
                        <input
                          className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                          placeholder="000-000"
                          autoComplete="off"
                          type="text"
                          maxLength={6}
                          minLength={6}
                          name="otp"
                          value={user.otp}
                          onChange={handleChange}
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                        />
                        <label className="">{SIGNUP_DATA?.enterOtp}</label>
                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.userName}
                        </p>
                        <p className="text-black-60 mt-6 text-sm font-normal">
                          <button
                            onClick={resendOTP}
                            disabled={seconds > 0}
                            className={
                              seconds > 0
                                ? ''
                                : 'text-blue-light cursor-pointer'
                            }
                          >
                            {SIGNUP_DATA?.resendOtp}
                          </button>{' '}
                          in{' '}
                          <span className="text-black-80 font-medium">
                            00:{seconds}s
                          </span>
                        </p>
                        {/* <small className=" cursor-pointer text-blue-light text-sm">{SIGNUP_DATA?.resendOtp}</small> */}{' '}
                        {/*after time limit over then resend OTP button */}
                      </div>

                      {errorMsg ? (
                        <p className="mb-1 text-center text-xs text-red-500">
                          {errorMsg}
                        </p>
                      ) : null}
                      <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                        <button
                          className={[
                            verifySpinner ? 'py-1' : 'py-2.5',
                            'block w-full items-center text-sm font-semibold text-white',
                          ].join(' ')}
                          type="submit"
                          disabled={verifySpinner ? true : false}
                        >
                          {verifySpinner ? (
                            <Spinner
                              type="LIGHT"
                              style_CLASS={
                                'justify-center w-full h-full item-center flex'
                              }
                            />
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}

                {/* Create enterprise screen  */}
                {stepSignUp === 3 ? (
                  <div className="w-full">
                    <h1 className="text-black-80 mb-6 text-2xl font-bold">
                      {SIGNUP_DATA?.createEnterprise}
                    </h1>

                    <form className="mt-6" onSubmit={handlePasswordSignup}>
                      <div className="input-container relative mb-5">
                        <input
                          className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                          placeholder=" Enterprise Name"
                          autoComplete="off"
                          type="text"
                          name="enterpriseName"
                          value={user.enterpriseName}
                          maxLength={20}
                          onChange={handleChange}
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                        />
                        <label className="text-black-60 text-sm font-normal">
                          {SIGNUP_DATA?.companyName}
                        </label>
                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.enterpriseName}
                        </p>
                      </div>
                      <div className="input-container relative mb-5">
                        <input
                          className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                          placeholder="Team Name"
                          autoComplete="off"
                          type="text"
                          name="teamName"
                          value={user.teamName}
                          maxLength={20}
                          onChange={handleChange}
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                        />
                        <label className="text-black-60 text-sm font-normal">
                          {SIGNUP_DATA?.teamName}
                        </label>
                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.teamName}
                        </p>
                      </div>
                      <div className="input-container relative mb-5">
                        <label className="text-black-60 px-[5px!important] text-xs font-normal">
                          {SIGNUP_DATA?.roleName}
                        </label>
                        <select
                          className="border-black-40 text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                          onChange={(e) => handleroleSelection(e)}
                        >
                          {roleSelection?.roleOptions?.map((element, indx) => {
                            return (
                              <option
                                key={`role-${indx}`}
                                value={element?.value}
                              >
                                {element?.value}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="input-container relative mb-5">
                        <input
                          className="border-black-40 text-black-80 placeholder:text-black-80 focus-within:border-black-40 focus-visible:border-black-40 w-full rounded-lg border bg-transparent px-3.5 py-4 text-base font-normal tracking-tight ring-transparent"
                          placeholder="Website URL"
                          autoComplete="off"
                          type="text"
                          name="url"
                          value={user.url}
                          maxLength={20}
                          onChange={handleChange}
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                        />
                        <label className="text-black-60 text-sm font-normal">
                          {SIGNUP_DATA?.url}
                        </label>
                        <p className="mb-0 text-xs text-red-500">
                          {formErrors?.url}
                        </p>
                      </div>
                      <div className="input-container relative mb-5">
                        <label className="text-black-60 px-[5px!important] text-xs font-normal">
                          {SIGNUP_DATA?.country}
                        </label>
                        <Select
                          onChange={countryChangeHandler}
                          value={value}
                          options={options}
                          styles={customStyles}
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          placeholder="Select Country"
                          onBlur={(e) => {
                            formatInput(e);
                          }}
                        />
                      </div>

                      <div className="bg-blue-light mb-4 w-full rounded-lg px-6 py-1 text-center text-white">
                        <button
                          className={[
                            verifySpinner ? 'py-1' : 'py-2.5',
                            'block w-full items-center text-sm font-semibold text-white',
                          ].join(' ')}
                          type="submit"
                          disabled={verifySpinner ? true : false}
                        >
                          {SignInSpinner ? (
                            <Spinner
                              type="LIGHT"
                              style_CLASS={
                                'justify-center w-full h-full item-center flex'
                              }
                            />
                          ) : (
                            'Create'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default Signup;
