/**@format */
import {
  EMAIL_VERIFY_DATA,
  ENTER_EMAIL_DATA,
  SELECT_DROPDOWN_REVENUE,
  categories,
  prodCatIdMapping,
} from '@spyne-console/common-config/login';

import React, { createRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { v4 as uuid } from 'uuid';

import { useCurrentRoute } from '@spyne-console/hooks';

import {
  LOGIN_TYPES,
  base64Decode,
  captureEvent,
  defaultEnterprise,
  fetchEnterpriseFeatures,
  generateBearerToken,
  guestEnterprise,
  localStorageKeys,
  mailFormatRegEx,
  newBearerAfterGuestLoginFalse,
  newHubspotReport,
  redirectLinks,
  redirectToAdminTools,
  sessionStorageKeys,
  skipEnterpriseSelectionPage,
  validateCreateEnterpriseForm,
  validateFormFields,
} from '@spyne-console/utils/config';

import { decrypt } from '@spyne-console/lib/crypto';

import CentralAPIHandler from '../../centralAPIHandler/centralAPIHandler';
import { _tokenGenerationForPublicAPIs } from '../../common/utility/tokenRotation';
import { useAuthActions } from '../../hooks/useAuthActions';
import { getDemoFlowType } from '../config';
// import ClevertapReact from "clevertap-react"
import SignInSignUpContext from '../context';
import CreateEnterprise from '../enterprise-team-selection/CreateEnterprise';
import SelectEnterprise from '../enterprise-team-selection/SelectEnterprise';
import SelectTeam from '../enterprise-team-selection/SelectTeam';
import EnterEmail from './EnterEmail';
import EnterEmailVS from './EnterEmailVS';
import LoginTypePassword from './LoginTypePassword';
import SignInSignUpCover from './SignInSignUpCover';
import VerifyEmail from './VerifyEmail';

function GuestLogin(props) {
  const { translate } = props;
  const urlParams = new URLSearchParams(window.location.search);
  let utmSource, utmMedium, utmChannel;
  if (urlParams.has('utm_source')) {
    utmSource = urlParams.get('utm_source');
  }
  if (urlParams.has('utm_medium')) {
    utmMedium = urlParams.get('utm_medium');
  }
  if (urlParams.has('utm_channel')) {
    utmChannel = urlParams.get('utm_channel');
  }
  const [loginType, setLoginType] = useState(LOGIN_TYPES?.EMAIL);
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState(1);
  const [showEmailFields, setShowEmailFields] = useState(false);
  const [loginOrSignup, setLoginOrSignup] = useState('signup');
  const [user, setUser] = useState({
    emailId: '',
    password: '',
    otp: '',
    googleResponse: null,
  });
  const [enterpriseDetails, setEnterpriseDetails] = useState({
    enterprise_name: '',
    category: '',
    category_id: '',
    default_teamname: '',
    owner_name: '',
    owner_phone: '',
    countryCode: 'us',
    dialCode: '1',
    disable: false,
    website_link: '',
    no_of_cars: '',
    org_type: '',
    website_url: '',
  });
  const [userValidationInfo, setUserValidationInfo] = useState({
    userExists: false,
    passwordExists: false,
    enterpriseData: [],
  });
  const [SignInSpinner, setSignInSpinner] = useState(false);
  const [seeData, setSeeData] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [otp, setOtp] = useState({
    sent: false,
    label: 'Email Address/Phone',
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  // newflow
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);
  const [email, setEmail] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [stepLoginOtp, setStepLoginOtp] = useState(1);
  const [activeCategoryType, setActiveCategoryType] = useState();
  const [teamSelectionData, setTeamSelectionData] = useState([]);
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  const [forceResendOtp, setForceResendOtp] = useState(false);
  const [genericLoginPage, setGenericLoginPage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [signupSource, setSignupSource] = useState('');
  const [googleStrategy, setGoogleStrategy] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState(
    SELECT_DROPDOWN_REVENUE[0]?.value
  );

  let emailInputRef = createRef();
  const router = useRouter();
  const queryParam = Object.keys(router.query)[0];
  const { auth, updateAuthProp, resetAuth, updateAuthDetailsInRedux } =
    useAuthActions();
  const { mainRoute, childRoute } = useCurrentRoute();

  const nextStepMapping = {
    'enter-password': 'PASSWORD',
    'create-enterprise': 'CREATE_ENTERPRISE',
    'select-enterprise': 'SELECT_ENTERPRISE',
    'home-page': 'HOME',
    'verify-otp': 'OTP',
  };

  const previousState = {
    [LOGIN_TYPES.PASSWORD]: '',
    [LOGIN_TYPES.GOOGLE]: '',
    [LOGIN_TYPES.OTP]: '',
    [LOGIN_TYPES.EMAIL]: '',
    [LOGIN_TYPES.CREATE_ENTERPRISE]: '',
    [LOGIN_TYPES.SELECT_ENTERPRISE]: '',
    [LOGIN_TYPES.HOME]: '',
    [LOGIN_TYPES.FORGOT_PASSWORD]: '',
    [LOGIN_TYPES.FORGOT_EMAIL_LINK_SENT]: '',
  };

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      if (errorMsg && errorMsg.length) setErrorMsg('');
      if (
        validateFormFields({
          userEmail: user?.emailId,
          userPassword: user?.password,
        })
      ) {
        let payload = {
          strategy: 'PASSWORD',
          twoFactorAuth: true,
          apiKey: process.env.REACT_APP_API_KEY,
          emailId: user?.emailId?.toLowerCase(),
          password: user?.password,
          deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
        };

        if (loginType === LOGIN_TYPES?.OTP) {
          payload['strategy'] = 'OTP';
          payload['password'] = '';
          payload['otp'] = user?.otp || '';
        }
        captureEvent(
          'password_submitted',
          {
            method: 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: getDemoFlowType(mainRoute, childRoute, queryParam),
          },
          false
        );
        handlePasswordLogin(payload);
      } else {
        return;
      }
    } catch (error) {
      setErrorMsg(error?.data?.message || error);
      console.log(error);
    }
  };

  const SignInComponents = () => {
    try {
      switch (loginType) {
        case LOGIN_TYPES?.EMAIL:
          return (
            <EnterEmailVS
              ENTER_EMAIL_DATA={ENTER_EMAIL_DATA}
              allowClose={props?.allowClose}
              translate={translate}
            />
          );
        case LOGIN_TYPES?.PASSWORD:
        case LOGIN_TYPES?.FORGOT_PASSWORD:
        case LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT:
          return (
            <LoginTypePassword
              allowClose={props?.allowClose}
              forgotPassSentLinkBtnClass={'static'}
              passwordBtnClassName={'static'}
              forgotPassBtnClassName={'static'}
              backCaret
              translate={translate}
            />
          );
        case LOGIN_TYPES?.OTP:
          return (
            <VerifyEmail
              allowClose={props?.allowClose}
              verifyBtnClassName={'static'}
              formClassName={'py-8'}
              EMAIL_VERIFY_DATA={EMAIL_VERIFY_DATA}
              backCaret
              translate={translate}
            />
          );
        case LOGIN_TYPES?.SELECT_ENTERPRISE:
          return <SelectEnterprise allowClose={props?.allowClose} />;
        case LOGIN_TYPES?.CREATE_ENTERPRISE:
          return (
            <CreateEnterprise
              allowClose={props?.allowClose}
              createEntBtnClassName={'static'}
              formClassName={'py-8'}
              email={user?.emailId}
              backCaret
              setEnterpriseDetails={setEnterpriseDetails}
              translate={translate}
            />
          );
        case LOGIN_TYPES?.SELECT_TEAM:
          return <SelectTeam allowClose={props?.allowClose} backCaret />;

        default:
          return (
            <EnterEmailVS
              allowClose={props?.allowClose}
              loginType={loginType}
              translate={translate}
            />
          );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailChange = (e) => {
    setStepLoginOtp(1);
  };
  const handleOTP = (e) => {
    try {
      if (errorMsg) setErrorMsg('');
      setUser({ ...user, otp: e.target.value });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setSignInSpinner(true);
      setErrorMsg('');
      if (!user?.otp) {
        setErrorMsg('Please enter the OTP to verify your email');
        return;
      }
      if (loginOrSignup === 'login') {
        handleLogin(e);
        return;
      }
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/verify-otp`;
      await CentralAPIHandler.handlePostRequest(URL, {
        email_id: user?.emailId,
        otp: user?.otp,
      });
      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';

      let hubSpotpayload = {
        email: user?.emailId,
        otpVerify: 'true',
        category: enterpriseDetails?.category ?? prodCatName,
        submission_page_url: utmSource
          ? `${utmSource}${utmMedium}`
          : currentUrl,
        utm_channel: utmChannel,
      };
      newHubspotReport(hubSpotpayload);

      // if (user && user?.emailId && !user?.emailId.includes("@spyne.ai")) {
      //     ClevertapReact.event("auth_signup_otp_clicked", cleverTapPayload)
      // }
      try {
        const leadFormURL = `${process.env.BACKEND_BASEURL}/spyne-websites/v1/lead-form/submit-form`;
        const leadFormData = {
          formData: {
            email_id: user?.emailId,
            company: enterpriseDetails?.enterprise_name || '',
            phone_number: enterpriseDetails?.owner_phone,
            submission_page_url: currentUrl || '',
            source: utmSource ? `${utmSource}${utmMedium}` : currentUrl || '',
          },
        };

        await CentralAPIHandler.handlePostRequest(leadFormURL, leadFormData);
      } catch (error) {
        console.log('Lead form submission error:', error);
      }
      if (userValidationInfo?.userExists) {
        handleLogin(e);
      } else {
        if (userValidationInfo?.enterpriseData?.length > 0) {
          updateAuthProp([
            {
              key: 'previousState',
              value: {
                ...auth?.previousState,
                [LOGIN_TYPES?.SELECT_ENTERPRISE]: loginType,
              },
            },
          ]);
          setLoginType(LOGIN_TYPES?.SELECT_ENTERPRISE);
        } else {
          await handleCreateEnterprise();
        }
      }
      captureEvent(
        'otp_verified',
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
      setSignInSpinner(false);
    } catch (error) {
      setForceResendOtp(true);
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          'Unknown error occurred'
      );
      setSignInSpinner(false);
      // setLoginType(LOGIN_TYPES?.OTP)
    }
  };

  const checkUserExists = async (e, googleResponse, skuIds) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSignInSpinner(true);
    setUser({ ...user, otp: '' });
    try {
      let userEmail = user?.emailId;
      if (user?.googleResponse || googleResponse) {
        userEmail = user?.googleResponse?.email || googleResponse?.email;
        setUser({ ...user, emailId: userEmail });
        setGoogleStrategy(true);
      }
      if (errorMsg && errorMsg.length) setErrorMsg(' ');
      if (
        !googleResponse &&
        (!userEmail || !enterpriseDetails?.owner_phone) &&
        loginOrSignup === 'signup'
      ) {
        if (!userEmail) {
          setErrorMsg(
            translate(`console.screens.emailScreen.emailLoginSignUpText`)
          );
        }
        if (!enterpriseDetails?.owner_phone) {
          setFormErrors({
            ...formErrors,
            owner_phone: translate(
              `console.screens.enterprisesScreen.correctPhoneNumber`
            ),
          });
        }
        return;
      } else if (!mailFormatRegEx.test(userEmail)) {
        setErrorMsg(
          translate(`console.screens.emailScreen.requiredEmailAddress`)
        );
        return;
      } else if (
        !googleResponse &&
        loginOrSignup === 'signup' &&
        enterpriseDetails?.owner_phone.length < 8
      ) {
        setFormErrors({
          ...formErrors,
          owner_phone: translate(`Please enter a valid phone number`),
        });
        return;
      }
      // Make API call to check if the user exists
      let sourcecheck = null;
      let actioncheck = null;

      if (!googleResponse || loginOrSignup === 'login') {
        sourcecheck = 'console';
        actioncheck = loginOrSignup;
      }
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/user-exists-v2`;
      const resp = await CentralAPIHandler.handleGetRequest(URL, {
        email_id: userEmail,
        source: sourcecheck,
        action: actioncheck,
        accessToken: googleResponse?.access_token || null,
        googleStrategy: googleResponse?.email ? true : false,
        device_id: localStorage.getItem(localStorageKeys?.DEVICEID),
      });
      if (resp?.data?.loginResponse?.authKey) {
        const decryptedAuthKey = decrypt(resp?.data?.loginResponse?.authKey);
        resp.data.loginResponse.authKey = decryptedAuthKey;
        if (resp?.data?.loginResponse?.defaultEnterprise) {
          const decryptedSecretKey = decrypt(
            resp?.data?.loginResponse?.defaultEnterprise?.secretKey
          );
          const decryptedApiKey = decrypt(
            resp?.data?.loginResponse?.defaultEnterprise?.apiKey
          );
          resp.data.loginResponse.defaultEnterprise.secretKey =
            decryptedSecretKey;
          resp.data.loginResponse.defaultEnterprise.apiKey = decryptedApiKey;
        }
      }

      let emailDomains = [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'aol.com',
        'icloud.com',
        'protonmail.com',
        'mail.com',
        'zoho.com',
        'yandex.com',
        'gmx.com',
      ];
      let domain = userEmail.split('@')[1];
      let enterpriseTempName = domain.split('.')[0];
      if (!emailDomains.includes(domain)) {
        // setEnterpriseDetails({ ...enterpriseDetails, enterprise_name: enterpriseTempName })
        setEnterpriseDetails({
          ...enterpriseDetails,
          owner_name: enterpriseTempName,
        });
      }

      let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin))
        : false;

      // Update state based on API response
      updateAuthProp([
        {
          key: 'previousState',
          value: {
            ...previousState,
            [LOGIN_TYPES?.[nextStepMapping[resp?.data?.nextStep]]]: loginType,
          },
        },
      ]);
      if (!resp?.data?.userExists && showEmailFields) {
        setLoginType(LOGIN_TYPES?.[nextStepMapping[resp?.data?.nextStep]]);
      } else if (!resp?.data?.userExists) {
        setShowEmailFields(true);
      } else if (resp?.data?.userExists) {
        setLoginType(LOGIN_TYPES?.[nextStepMapping[resp?.data?.nextStep]]);
      }
      setUserValidationInfo({
        ...userValidationInfo,
        userExists: resp?.data?.userExists ?? false,
        passwordExists: resp?.data?.passwordExists ?? false,
        enterpriseData: resp?.data?.enterpriseData ?? [],
      });
      if (resp?.data?.userExists) {
        captureEvent(
          'existing_email_entered',
          {
            method: 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: getDemoFlowType(mainRoute, childRoute, queryParam),
          },
          false
        );
      } else {
        captureEvent(
          'new_email_entered',
          {
            method: 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: getDemoFlowType(mainRoute, childRoute, queryParam),
          },
          false
        );
      }
      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';

      let hubSpotpayload = {
        email: userEmail,
        phone: enterpriseDetails?.owner_phone,
        // 'toolName': router.pathname,
        // "category": enterpriseDetails?.category ?? prodCatName
        submission_page_url: utmSource
          ? `${utmSource}${utmMedium}`
          : currentUrl,
        utm_channel: utmChannel,
      };
      newHubspotReport(hubSpotpayload);

      try {
        const leadFormURL = `${process.env.BACKEND_BASEURL}/spyne-websites/v1/lead-form/submit-form`;
        const leadFormData = {
          formData: {
            email_id: user?.emailId,
            phone_number: enterpriseDetails?.owner_phone || '',
            submission_page_url: currentUrl || '',
            source: utmSource ? `${utmSource}${utmMedium}` : currentUrl || '',
          },
        };

        await CentralAPIHandler.handlePostRequest(leadFormURL, leadFormData);
      } catch (error) {
        console.log('Lead form submission error:', error);
      }

      //redirect to home page with default enterprise of user
      if (
        Object.keys(resp?.data?.loginResponse || {}).length > 0 &&
        resp?.data?.nextStep === 'home-page'
      ) {
        if (
          guestLogin &&
          (window?.location?.pathname?.includes('/virtualstudio') ||
            window?.location?.pathname?.includes('/video'))
        ) {
          const allQuery = {
            ...router.query,
            enterprise_id:
              resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId,
          };
          router.replace({ query: allQuery });
        } else {
          let defaultEnterprise =
            resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (skipEnterpriseSelection) {
            if (window?.location?.pathname?.includes('/image-studio')) {
              router.replace({
                pathname: '/image-studio',
                query: {
                  enterprise_id:
                    resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId,
                },
              });
            } else
              router.push({
                pathname: '/home',
                query: { enterprise_id: enterprise_id },
              });
          }
        }

        localStorage.setItem(
          localStorageKeys?.AUTHKEY,
          resp?.data?.loginResponse?.authKey
        );

        if (props?.hideLeftContainer) {
          await newBearerAfterGuestLoginFalse(
            resp?.data?.loginResponse?.authKey
          ); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
          if (skuIds?.length > 0)
            await mapGuestToActual(resp?.data?.loginResponse?.userData, skuIds);
        }
        updateAuthDetailsInRedux(resp?.data?.loginResponse);
        localStorage.setItem(
          localStorageKeys?.vsVersion,
          JSON.stringify({
            [resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId]:
              resp?.data?.loginResponse?.defaultEnterprise?.version,
          })
        );
        localStorage.setItem(
          localStorageKeys?.USERDETAILS,
          JSON.stringify(resp?.data?.loginResponse?.userData)
        );
        localStorage.setItem(
          localStorageKeys?.defaultEnterprise,
          JSON.stringify(resp?.data?.loginResponse?.defaultEnterprise)
        );
        localStorage.setItem(
          localStorageKeys?.permissionObject,
          JSON.stringify(resp?.data?.loginResponse?.permissionObject)
        );
        refreshTokenAndUpdateRedux({ fastRefresh: false });
        generateBearerToken({ additionalPayload: {} }, true);
        captureEvent(
          'logged_in',
          {
            method: user?.googleResponse || googleResponse ? 'google' : 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: getDemoFlowType(mainRoute, childRoute, queryParam),
          },
          false
        );
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
      console.error('Error checking user:', error);
      setErrorMsg(error?.data?.message || error?.message || error);
      localStorage.removeItem(localStorageKeys?.AUTHKEY);
      localStorage.setItem(localStorageKeys?.guestLogin, true);
      if (props?.hideLeftContainer)
        updateAuthProp([{ key: 'loginModalTrigger', value: true }]);
      if (error?.code.includes('ERROR_BAD_REQ_400')) {
        return;
      }
      resetAuth();
    } finally {
      setSignInSpinner(false);
      captureEvent(
        'logged_in',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'click',
          login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
          user_email_domain: user?.emailId,
          device: 'browser',
        },
        true
      );
      if (!props?.hideLeftContainer) {
        localStorage.removeItem(localStorageKeys?.src);
      }
    }
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
      if (resp?.data?.nextStep === 'verify-otp') {
        setSignInSpinner(false);
        useLoginTypeOTP();
        return;
      }
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
        captureEvent(
          'password_verified',
          {
            method: 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: getDemoFlowType(mainRoute, childRoute, queryParam),
          },
          false
        );
        if (window?.location?.pathname?.includes('/image-studio')) {
          router.push({
            pathname: '/image-studio',
            query: { enterprise_id: enterprise_id },
          });
        }
        if (
          (guestLogin &&
            window?.location?.pathname?.includes('/virtualstudio')) ||
          window?.location?.pathname?.includes('/video')
        ) {
          // router.replace({query: { "enterprise_id": resp?.data?.defaultEnterprise?.enterpriseId, "team_id": [`${}`] }})
          const allQuery = {
            ...router.query,
            enterprise_id: resp?.data?.defaultEnterprise?.enterpriseId,
          };
          router.replace({ query: allQuery });
        } else {
          let userEmail = payload?.emailId,
            defaultEnterprise = resp?.data?.defaultEnterprise?.enterpriseId;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (skipEnterpriseSelection) {
            router.push({
              pathname: '/home',
              query: { enterprise_id: enterprise_id },
            });
          } else {
            redirectToAdminTools(router);
          }
        }
        localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);
        localStorage.setItem(
          localStorageKeys?.vsVersion,
          JSON.stringify({
            [resp?.data?.defaultEnterprise?.enterpriseId]:
              resp?.data?.defaultEnterprise?.version,
          })
        );
        if (props?.hideLeftContainer) {
          await newBearerAfterGuestLoginFalse(resp?.data?.authKey); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
          if (skuIds?.length > 0)
            await mapGuestToActual(resp?.data?.userData, skuIds);
        }
        updateAuthDetailsInRedux(resp?.data);

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
        captureEvent(
          'logged_in',
          {
            method: 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: getDemoFlowType(mainRoute, childRoute, queryParam),
          },
          false
        );
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
      localStorage.setItem(localStorageKeys?.guestLogin, true);
      resetAuth();
      if (props?.hideLeftContainer)
        updateAuthProp([{ key: 'loginModalTrigger', value: true }]);
    } finally {
      setSignInSpinner(false);
      if (!props?.hideLeftContainer) {
        localStorage.removeItem(localStorageKeys?.src);
      }
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

  const handleCredentialResponse = async (googleResponse, e) => {
    // The credential is coming directly from the Google response
    const credential = {
      access_token: googleResponse.credential,
      email: '', // We'll need to fetch user info using the access token
      name: '',
    };
    let skuIds = [];
    skuIds = sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      ? sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      : [];
    try {
      // Fetch user info using the access token
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${googleResponse.credential}`,
          },
        }
      );
      const userInfo = await response.json();

      credential.email = userInfo.email;
      credential.name = userInfo.name;

      setUser({
        ...user,
        googleResponse: credential,
        emailId: credential.email,
      });
      setEnterpriseDetails({
        ...enterpriseDetails,
        owner_name: credential.name,
      });
      await checkUserExists(e, credential);
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
      setErrorMsg(error?.response?.data?.message || error?.message);
      localStorage.removeItem(localStorageKeys?.AUTHKEY);
      localStorage.setItem(localStorageKeys?.guestLogin, true);

      resetAuth();
      if (props?.hideLeftContainer)
        updateAuthProp([{ key: 'loginModalTrigger', value: true }]);
    } finally {
      if (!props?.hideLeftContainer) {
        localStorage.removeItem(localStorageKeys?.src);
      }
    }
  };

  const formatInput = (e) => {
    try {
      let attribute = e.target.name;
      setEnterpriseDetails({
        ...enterpriseDetails,
        [attribute]: e?.target?.value,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const validateInput = (e) => {
    try {
      let attribute = e.target.name;
      setEnterpriseDetails({
        ...enterpriseDetails,
        [attribute]: e?.target?.value?.trim(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlePhoneInput = (value, data, e, formattedValue) => {
    try {
      setFormErrors({
        ...formErrors,
        owner_phone: '',
      });
      setEnterpriseDetails({
        ...enterpriseDetails,
        owner_phone: value,
        countryCode: data?.countryCode,
        dialCode: data?.dialCode,
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setSignInSpinner(true);
      setSeconds(30);
      if (!user?.emailId) {
        setErrorMsg('Email Address is required to reset your password');
        return;
      }
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/forget-password`;
      const payload = {
        emailId: user?.emailId,
      };
      if (auth.resellerData.is_reseller) {
        payload['enterprise_id'] = auth.resellerData.enterprise_id;
      }
      const resp = await CentralAPIHandler.handlePostRequest(URL, payload);

      let cleverTapPayload = {
        status: 'Forgot password',
        source: signupSource,
        category: enterpriseDetails?.category,
        user_email: user?.emailId,
      };

      if (!resp?.error) {
        setResetEmailSent(true);
        updateAuthProp([
          {
            key: 'previousState',
            value: {
              ...auth?.previousState,
              [LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT]: loginType,
            },
          },
        ]);
        setLoginType(LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT);
        return;
      }
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || error?.message);
      setResetEmailSent(false);
      console.log(error);
    } finally {
      setSignInSpinner(false);
    }
  };

  const handleChangeLoginState = () => {
    try {
      setLoginType(auth?.previousState[loginType]);
      updateAuthProp([
        {
          key: 'previousState',
          value: { ...auth?.previousState, [loginType]: '' },
        },
      ]);
      setUser({ ...user, password: '' });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoginTypeEmail = () => {
    try {
      updateAuthProp([
        {
          key: 'previousState',
          value: { ...auth?.previousState, [LOGIN_TYPES?.EMAIL]: loginType },
        },
      ]);
      setLoginType(LOGIN_TYPES?.EMAIL);
    } catch (error) {
      console.log(error);
    }
  };

  const mapGuestToActual = async (userData, skuIds) => {
    try {
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/guest-user-mapping`;

      const payload = {
        guestUserId: guestEnterprise?.guestUserId,
        actualUserId: userData?.userId,
        skuIdList: skuIds,
      };
      let pageUrl = window.location.pathname;
      if (pageUrl === '/playground') {
        payload.guestUserId = guestEnterprise?.guestUserIdEcom;
      }

      await CentralAPIHandler.handlePatchRequest(URL, payload);
    } catch (error) {
      console.log;
    }
  };
  const useLoginTypeOTP = async (resend = false) => {
    setUser({ ...user, otp: '' });
    try {
      setSeconds(30);
      updateAuthProp([
        {
          key: 'previousState',
          value: { ...auth?.previousState, [LOGIN_TYPES?.OTP]: loginType },
        },
      ]);
      setLoginType(LOGIN_TYPES?.OTP);
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/generate-otp`;
      const payload = {
        email_id: user?.emailId,
      };
      if (auth?.resellerData?.is_reseller) {
        payload['enterprise_id'] = auth?.resellerData?.enterprise_id;
      }
      const resp = await CentralAPIHandler.handlePostRequest(URL, payload);
    } catch (error) {
      console.log(error);
      setErrorMsg(error?.data?.message || error);
    }
  };

  const createEnterprise = async (e) => {
    if (e) e.preventDefault();
    let queryParams = new URLSearchParams(window.location.search);
    let prodCatId = queryParams.get('category_id');
    // let prodCatId = 'cat_d8R14zUNE'
    let prodCatName = prodCatIdMapping[prodCatId];
    let step = null;
    try {
      let splitValue = user?.emailId.split('@');
      let domain = splitValue[1];
      setFormErrors(
        validateCreateEnterpriseForm({
          formFields: enterpriseDetails,
          fromSignUp: true,
          categoryId: enterpriseDetails?.category_id,
          prodCatId: prodCatId,
          selectedRevenue,
        })
      );
      if (
        Object?.keys(
          validateCreateEnterpriseForm({
            formFields: enterpriseDetails,
            fromSignUp: true,
            categoryId: enterpriseDetails?.category_id,
            prodCatId: prodCatId,
            selectedRevenue,
          }) || {}
        )?.length > 0
      )
        return;
      setErrorMsg('');
      setSignInSpinner(true);
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/enterprise/verify-enterprise-name`;
      const resp = await CentralAPIHandler.handleGetRequest(URL, {
        enterpriseName: enterpriseDetails?.enterprise_name,
      });

      let state = {
        enterpriseName: enterpriseDetails?.enterprise_name,
        category: enterpriseDetails?.category ?? prodCatName,
        category_id: enterpriseDetails?.category_id ?? prodCatId,
        teamName:
          enterpriseDetails?.default_teamname ||
          enterpriseDetails?.enterprise_name,
        emailId: user?.emailId,
        userName: enterpriseDetails?.owner_name,
        url: domain,
      };
      sessionStorage.setItem(
        sessionStorageKeys?.stepCreateEnterprise,
        JSON.stringify(state)
      );

      useLoginTypeOTP();
      setSignInSpinner(false);
      updateAuthProp([
        {
          key: 'previousState',
          value: { ...auth?.previousState, [LOGIN_TYPES?.OTP]: loginType },
        },
      ]);
      setLoginType(LOGIN_TYPES?.OTP);

      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';

      let hubSpotpayload = {
        name: enterpriseDetails?.owner_name,
        email: user?.emailId,
        phone: enterpriseDetails?.owner_phone,
        company: enterpriseDetails?.enterprise_name,
        website: enterpriseDetails?.website_url,
        website_link:
          (enterpriseDetails?.category_id &&
            enterpriseDetails?.category_id !== 'cat_d8R14zUNE') ||
          (prodCatId && prodCatId !== 'cat_d8R14zUNE')
            ? enterpriseDetails?.website_link
            : '',
        annual_revenue:
          (enterpriseDetails?.category_id &&
            enterpriseDetails?.category_id !== 'cat_d8R14zUNE') ||
          (prodCatId && prodCatId !== 'cat_d8R14zUNE')
            ? selectedRevenue
            : '',
        category: enterpriseDetails?.category ?? prodCatName,
        organization: enterpriseDetails?.org_type,
        number_of_cars: enterpriseDetails?.no_of_cars,
        submission_page_url: utmSource
          ? `${utmSource}${utmMedium}`
          : currentUrl,
        utm_channel: utmChannel,
      };
      newHubspotReport(hubSpotpayload);

      try {
        const leadFormURL = `${process.env.BACKEND_BASEURL}/spyne-websites/v1/lead-form/submit-form`;
        const leadFormData = {
          formData: {
            email_id: user?.emailId,
            firstname: enterpriseDetails?.owner_name || '',
            company: enterpriseDetails?.enterprise_name || '',
            phone_number: enterpriseDetails?.owner_phone || '',
            account_type: enterpriseDetails?.org_type || '',
            dealer_name: enterpriseDetails?.enterprise_name || '',
            dealer_group: enterpriseDetails?.dealership_group_name
              ? enterpriseDetails?.dealership_group_name
              : enterpriseDetails?.enterprise_name,
            submission_page_url: currentUrl || '',
            source: utmSource ? `${utmSource}${utmMedium}` : currentUrl || '',
            website_url: enterpriseDetails?.website_url || '',
          },
        };

        await CentralAPIHandler.handlePostRequest(leadFormURL, leadFormData);
      } catch (error) {
        console.log('Lead form submission error:', error);
      }

      let cleverTapPayload = {
        status: 'Enterprise created',
        source: signupSource,
        user_email: user?.emailId,
        user_name: enterpriseDetails?.owner_name,
        mobile_number: enterpriseDetails?.owner_phone,
        device_id: localStorage.getItem(localStorageKeys?.DEVICEID),
      };
      // if (user && user?.emailId && !user?.emailId.includes("@spyne.ai")) {
      //     ClevertapReact.event("auth_signup_create_enterprise_clicked", cleverTapPayload)
      // }
    } catch (err) {
      setSignInSpinner(false);
      toast(err?.message || 'Something went wrong', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
        position: 'bottom-center',
        pauseOnHover: true,
      });
      setErrorMsg(err?.message);
      console.log('yes', err?.message);
    }
  };

  const handleCreateEnterprise = async (e) => {
    if (e) e.preventDefault();
    let queryParams = new URLSearchParams(window.location.search);
    let prodCatId = 'cat_d8R14zUNE';
    let prodCatName = prodCatIdMapping[prodCatId];
    let teamId;
    let enterpriseId;
    let apiKey;
    let step = null;

    let skuIds = [];
    skuIds = sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      ? sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      : [];

    try {
      let tempPassword = uuid().slice(0, 10);
      tempPassword = tempPassword.split('-').join('');
      setUser({ ...user, password: tempPassword });
      let splitValue = user?.emailId.split('@');
      let domain = splitValue[1];
      let deviceId = uuid().slice(0, 36);
      deviceId = deviceId.replace(/[&\/\\#, +()$~%.'":*?<>{}-]/g, '');
      localStorage.setItem(localStorageKeys?.DEVICEID, deviceId);
      setFormErrors(
        validateCreateEnterpriseForm({
          formFields: enterpriseDetails,
          fromSignUp: true,
          categoryId: enterpriseDetails?.category_id,
          prodCatId: prodCatId,
          selectedRevenue,
        })
      );
      if (
        Object?.keys(
          validateCreateEnterpriseForm({
            formFields: enterpriseDetails,
            fromSignUp: true,
            categoryId: enterpriseDetails?.category_id,
            prodCatId: prodCatId,
            selectedRevenue,
          })
        )?.length > 0
      )
        return;
      setErrorMsg('');
      setSignInSpinner(true);
      localStorage.removeItem(localStorageKeys?.DEFAULTBEARERTOKEN);
      const secureToken = _tokenGenerationForPublicAPIs();
      let enterprisePayloadFromSession = sessionStorage.getItem(
        sessionStorageKeys?.stepCreateEnterprise
      );
      let parsedPayload = JSON.parse(enterprisePayloadFromSession);
      let createEnterprisePayload;
      if (parsedPayload) {
        createEnterprisePayload = {
          ...parsedPayload,
          password: tempPassword,
          deviceId: deviceId,
          sSecret: secureToken.passPhrase,
          sKey: secureToken.token,
          stage: 'PLG',
        };
      } else {
        createEnterprisePayload = {
          enterpriseName: enterpriseDetails?.enterprise_name,
          category: 'cat_d8R14zUNE',
          category_id: 'cat_d8R14zUNE',
          teamName:
            enterpriseDetails?.default_teamname ||
            enterpriseDetails?.enterprise_name,
          emailId: user?.emailId,
          password: tempPassword,
          userName: enterpriseDetails?.owner_name,
          org_type: enterpriseDetails?.org_type,
          website_url: enterpriseDetails?.website_url,
          deviceId: deviceId,
          sSecret: secureToken.passPhrase,
          sKey: secureToken.token,
          url: domain,
          stage: 'PLG',
          website_link:
            (enterpriseDetails?.category_id &&
              enterpriseDetails?.category_id !== 'cat_d8R14zUNE') ||
            (prodCatId && prodCatId !== 'cat_d8R14zUNE')
              ? JSON.stringify([enterpriseDetails?.website_link])
              : '',
          annual_revenue:
            (enterpriseDetails?.category_id &&
              enterpriseDetails?.category_id !== 'cat_d8R14zUNE') ||
            (prodCatId && prodCatId !== 'cat_d8R14zUNE')
              ? selectedRevenue
              : '',
        };
      }

      const URLCreateEnterprise = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/create-enterprise-config`;
      let response = await CentralAPIHandler.handlePostRequest(
        URLCreateEnterprise,
        createEnterprisePayload,
        {}
      );
      step = 1;
      teamId = response?.data?.teamId;
      enterpriseId = response?.data?.enterpriseId;
      apiKey = response?.data?.apiKey;
      if (!parsedPayload) {
        let state = {
          enterpriseName: enterpriseDetails?.enterprise_name,
          category: 'cat_d8R14zUNE',
          category_id: 'cat_d8R14zUNE',
          teamName:
            enterpriseDetails?.default_teamname ||
            enterpriseDetails?.enterprise_name,
          emailId: user?.emailId,
          userName: enterpriseDetails?.owner_name,
          deviceId: deviceId,
          contactNo: enterpriseDetails?.owner_phone,
          isdCode: enterpriseDetails?.dialCode,
        };
        sessionStorage.setItem(
          sessionStorageKeys?.stepCreateEnterprise,
          JSON.stringify(state)
        );
      }

      let payload = {
        strategy: googleStrategy ? 'GOOGLE' : 'PASSWORD',
        apiKey: apiKey,
        emailId: user?.emailId,
        password: googleStrategy ? '' : tempPassword,
        userName: enterpriseDetails?.owner_name,
        deviceId: deviceId,
        enterpriseOnboarding: true,
        contactNo: enterpriseDetails?.owner_phone,
        isdCode: enterpriseDetails?.dialCode,
        source: props?.allowClose
          ? 'virtual_studio_non_restrictive_browser'
          : 'virtual_studio_restrictive_browser',
      };
      localStorage.removeItem(localStorageKeys?.DEFAULTBEARERTOKEN);
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/signup`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {}, payload);
      step = 2;
      if (
        prodCatId === 'cat_d8R14zUNE' ||
        enterpriseDetails?.category_id === 'cat_d8R14zUNE'
      ) {
        //for Automobile only
        const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
        const URLDefaultConfigation = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-configuration`;
        await CentralAPIHandler.handlePostRequest(URLDefaultConfigation, {
          enterpriseId: enterpriseId,
          prodCatId: enterpriseDetails?.category_id ?? prodCatId,
          emailId: user?.emailId,
          spyneAssured: false,
          coBrand: true,
          price: 4,
          planTitle: 'PLG - Catalog',
          sSecret: secureTokenConfigurations.passPhrase,
          sKey: secureTokenConfigurations.token,
          noOfCars: enterpriseDetails?.no_of_cars,
          orgType: enterpriseDetails?.org_type,
        });
        step = null;
        // await addDefaultBgTags(enterpriseId, enterpriseDetails?.category_id, prodCatId)
      }

      if (
        prodCatId === 'cat_Ujt0kuFxY' ||
        enterpriseDetails?.category_id === 'cat_Ujt0kuFxY'
      ) {
        //Ecom category
        const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
        const URLDefaultConfigation = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-ecom-configuration`;
        await CentralAPIHandler.handlePostRequest(URLDefaultConfigation, {
          enterpriseId: enterpriseId,
          prodCatId: enterpriseDetails?.category_id ?? prodCatId,
          emailId: user?.emailId,
          sSecret: secureTokenConfigurations.passPhrase,
          sKey: secureTokenConfigurations.token,
        });
      }

      if (
        prodCatId === 'cat_Ujt0kuFxF' ||
        enterpriseDetails?.category_id === 'cat_Ujt0kuFxF'
      ) {
        //Food category
        const URLDefaultConfigation = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-food-configuration`;
        const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
        await CentralAPIHandler.handlePostRequest(URLDefaultConfigation, {
          enterpriseId: enterpriseId,
          prodCatId: enterpriseDetails?.category_id ?? prodCatId,
          emailId: user?.emailId,
          sSecret: secureTokenConfigurations.passPhrase,
          sKey: secureTokenConfigurations.token,
        });
      }
      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';
      toast('Your account has been created', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
        position: 'bottom-center',
        pauseOnHover: true,
      });
      let hubSpotpayload = {
        name: enterpriseDetails?.owner_name,
        email: user?.emailId,
        phone: enterpriseDetails?.owner_phone,
        company: enterpriseDetails?.enterprise_name,
        website: enterpriseDetails?.website_url,
        website_link:
          (enterpriseDetails?.category_id &&
            enterpriseDetails?.category_id !== 'cat_d8R14zUNE') ||
          (prodCatId && prodCatId !== 'cat_d8R14zUNE')
            ? enterpriseDetails?.website_link
            : '',
        annual_revenue:
          (enterpriseDetails?.category_id &&
            enterpriseDetails?.category_id !== 'cat_d8R14zUNE') ||
          (prodCatId && prodCatId !== 'cat_d8R14zUNE')
            ? selectedRevenue
            : '',
        category: enterpriseDetails?.category ?? prodCatName,
        submission_page_url: utmSource
          ? `${utmSource}${utmMedium}`
          : currentUrl,
        utm_channel: utmChannel,
      };
      newHubspotReport(hubSpotpayload);

      try {
        const leadFormURL = `${process.env.BACKEND_BASEURL}/spyne-websites/v1/lead-form/submit-form`;
        const leadFormData = {
          formData: {
            email_id: user?.emailId,
            firstname: enterpriseDetails?.owner_name || '',
            company: enterpriseDetails?.enterprise_name || '',
            phone_number: enterpriseDetails?.owner_phone || '',
            account_type: enterpriseDetails?.org_type || '',
            dealer_name: enterpriseDetails?.enterprise_name || '',
            dealer_group: enterpriseDetails?.dealership_group_name
              ? enterpriseDetails?.dealership_group_name
              : enterpriseDetails?.enterprise_name,
            submission_page_url: currentUrl || '',
            source: utmSource ? `${utmSource}${utmMedium}` : currentUrl || '',
            website_url: enterpriseDetails?.website_url || '',
          },
        };

        await CentralAPIHandler.handlePostRequest(leadFormURL, leadFormData);
      } catch (error) {
        console.log('Lead form submission error:', error);
      }

      let cleverTapPayload = {
        status: 'Enterprise Created',
        source: signupSource,
        user_email: user?.emailId,
        user_name: enterpriseDetails?.owner_name,
        mobile_number: enterpriseDetails?.owner_phone,
        device_id: localStorage.getItem(localStorageKeys?.DEVICEID),
      };
      // if (user && user?.emailId && !user?.emailId.includes("@spyne.ai")) {
      //     ClevertapReact.event("auth_signup_create_enterprise_clicked", cleverTapPayload)
      // }
      setUser({
        emailId: '',
        password: '',
        otp: '',
        googleResponse: null,
      });
      let defaultEnterprise = {
        enterpriseId: enterpriseId,
        name: enterpriseDetails?.enterprise_name,
        apiKey: apiKey,
        spyneAssured: 'NONE',
        qualityCheck: 0,
      };
      let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin))
        : false;
      localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);
      updateAuthDetailsInRedux(resp?.data, defaultEnterprise);

      localStorage.setItem(
        localStorageKeys?.USERDETAILS,
        JSON.stringify(resp?.data?.userData)
      );
      localStorage.setItem(
        localStorageKeys?.defaultEnterprise,
        JSON.stringify(defaultEnterprise)
      );
      localStorage.setItem(
        localStorageKeys?.permissionObject,
        JSON.stringify(resp?.data?.permissionObject)
      );

      refreshTokenAndUpdateRedux({ fastRefresh: false });
      let newBearerToken = generateBearerToken(
        { additionalPayload: {} },
        true,
        teamId,
        enterpriseId
      );
      // debugger
      if (window?.location?.pathname?.includes('/image-studio')) {
        router.push({
          pathname: '/image-studio',
          query: { enterprise_id: enterpriseId },
        });
      }
      if (
        guestLogin &&
        (window?.location?.pathname?.includes('/virtualstudio') ||
          window?.location?.pathname?.includes('/video') ||
          window?.location?.pathname?.includes('/playground'))
      ) {
        if (
          prodCatId === 'cat_d8R14zUNE' ||
          enterpriseDetails?.category_id === 'cat_d8R14zUNE'
        ) {
          router.replace({ query: { enterprise_id: enterpriseId } });
          updateAuthProp([{ key: 'welcomeCreditsModalTrigger', value: true }]);
        } else {
          router.push(
            { pathname: '/playground' },
            { query: { enterprise_id: enterpriseId } }
          );
        }
      } else {
        if (signupSource === 'console') {
          console.log('logged in guest login in console');
          router.push({
            pathname: '/home',
            query: { enterprise_id: enterpriseId },
          });
          updateAuthProp([{ key: 'welcomeCreditsModalTrigger', value: true }]);
        } else {
          localStorage.clear();
          sessionStorage.clear();
          router.push(`/register/success?bearerToken=${newBearerToken}`);
        }
      }

      if (props?.hideLeftContainer) {
        await newBearerAfterGuestLoginFalse(resp?.data?.authKey); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
        if (skuIds?.length > 0)
          await mapGuestToActual(resp?.data?.userData, skuIds);
      }
      captureEvent(
        'enterprise_created',
        {
          source: getDemoFlowType(mainRoute, childRoute, queryParam),
          login_flow:
            (childRoute ?? mainRoute === 'login')
              ? 'console'
              : props.allowClose
                ? 'non_restrictive'
                : 'restrictive',
          method: googleStrategy ? 'google' : 'email',
        },
        false
      );
    } catch (error) {
      if (step) {
        try {
          if (
            prodCatId === 'cat_d8R14zUNE' ||
            enterpriseDetails?.category_id === 'cat_d8R14zUNE'
          ) {
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
          }
        } catch (error) {
          throw Error(error);
        }
      }
      toast(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
        {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'bottom-center',
          pauseOnHover: true,
        }
      );
      setErrorMsg(error?.response?.data?.message || error?.message);
      resetAuth();
      console.log(error);
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
    }
    setSignInSpinner(false);
    if (!props?.hideLeftContainer) {
      localStorage.removeItem(localStorageKeys?.src);
    }
  };

  const addDefaultBgTags = async (enterpriseId, prodCatId, queryProdCatId) => {
    try {
      const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
      const createBgID = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-bg-tags`;
      await CentralAPIHandler.handlePostRequest(createBgID, {
        enterpriseId: enterpriseId,
        prodCatId: prodCatId ?? queryProdCatId,
        sSecret: secureTokenConfigurations.passPhrase,
        sKey: secureTokenConfigurations.token,
      });
    } catch (error) {}
  };

  const handleActiveCategoryTab = (prodCatId) => {
    try {
      let queryParams = new URLSearchParams(window.location.search);
      let prodCategory = queryParams.get('category_id');

      if (!prodCategory) {
        setActiveCategoryType(prodCatId);
        setEnterpriseDetails({
          ...enterpriseDetails,
          category: prodCatIdMapping[prodCatId],
          category_id: prodCatId,
        });
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getProductCategoryAndSource = () => {
    try {
      let queryParams = new URLSearchParams(window.location.search);
      let prodCatId = queryParams.get('category_id');
      // let prodCatId = 'cat_d8R14zUNE'
      let source = queryParams.get('pageSrc');

      if (!source) source = 'virtual_studio';
      setSignupSource(source);
      let URL = window.location.pathname;
      if (URL === '/playground') {
        prodCatId = categories?.ecommerce;
        setGenericLoginPage(true);
      }
      if (!prodCatId) {
        prodCatId = categories?.automobile || defaultEnterprise?.prodCatAuto;
        setGenericLoginPage(true);
      }
      setActiveCategoryType(prodCatId);
      setEnterpriseDetails({
        ...enterpriseDetails,
        category: prodCatIdMapping[prodCatId],
        category_id: prodCatId,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const closeLogin = () => {
    try {
      if (SignInSpinner) return;
      captureEvent(
        'signup_modal_closed',
        {
          login_flow: 'non-restrictive',
          source: getDemoFlowType(mainRoute, childRoute, queryParam),
        },
        false
      );
      updateAuthProp([
        { key: 'loginModalTrigger', value: false },
        { key: 'triggerLoginModalAfterProcessing', value: false },
      ]);
      props?.setTriggerLoginModalAfterProcessing(false);
      props?.setMouseMv(false);
      props?.setMouseLv(false);
      props?.setOpenLoginModal(false);
    } catch (error) {
      console.log(error);
    }
  };
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
        ).enterpriseId;

        const { skip: skipEnterpriseSelection, enterprise_id } =
          skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
        if (skipEnterpriseSelection) {
          if (window?.location?.pathname?.includes('/image-studio')) {
            router.push({
              pathname: '/image-studio',
              query: { enterprise_id: enterprise_id },
            });
          }
          router.push({
            pathname: '/home',
            query: { enterprise_id: enterprise_id },
          });
        } else {
          redirectToAdminTools(router);
        }
        refreshTokenAndUpdateRedux({ fastRefresh: false });
      } catch (error) {
        console.log(error);
      }
    }
    getProductCategoryAndSource();
  }, []);

  useEffect(() => {
    if (
      seconds > 0 &&
      (loginType === LOGIN_TYPES?.OTP || LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT)
    ) {
      const interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSeconds(`00`);
    }
  }, [seconds]);

  useEffect(() => {
    setErrorMsg('');
    setSeconds(30);
    SignInComponents();
  }, [loginType]);

  useEffect(() => {
    captureEvent(
      'signup_method_selection_screen',
      {
        source: getDemoFlowType(mainRoute, childRoute, queryParam),
        login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
      },
      false
    );
  }, []);

  useEffect(() => {
    if (loginType === LOGIN_TYPES?.EMAIL) {
      setStep(1);
    } else if (
      loginType === LOGIN_TYPES?.CREATE_ENTERPRISE &&
      !enterpriseDetails?.org_type
    ) {
      setStep(2);
    } else if (
      loginType === LOGIN_TYPES?.CREATE_ENTERPRISE &&
      enterpriseDetails?.org_type
    ) {
      setStep(3);
    }
  }, [loginType, enterpriseDetails]);

  return (
    <SignInSignUpContext.Provider
      value={{
        setFormErrors,
        setErrorMsg,
        loginOrSignup,
        setLoginOrSignup,
        showEmailFields,
        setShowEmailFields,
        handleLogin,
        handleEmailVerification,
        handleOTP,
        checkUserExists,
        handlePasswordLogin,
        updateAuthDetailsInRedux,
        getEmailId,
        handleCredentialResponse,
        formatInput,
        refreshTokenAndUpdateRedux,
        handleForgotPassword,
        mapGuestToActual,
        errorMsg,
        setErrorMsg,
        SignInSpinner,
        emailInputRef,
        seeData,
        setSeeData,
        user,
        setUser,
        resetPassword,
        resetEmailSent,
        setLoginType,
        loginType,
        handleEmailChange,
        seconds,
        setSeconds,
        useLoginTypeOTP,
        handleCreateEnterprise,
        handleChangeLoginState,
        handleLoginTypeEmail,
        activeCategoryType,
        setActiveCategoryType,
        handleActiveCategoryTab,
        userValidationInfo,
        teamSelectionData,
        setTeamSelectionData,
        selectedEnterprise,
        setSelectedEnterprise,
        enterpriseDetails,
        forceResendOtp,
        genericLoginPage,
        handlePhoneInput,
        closeLogin,
        validateInput,
        formErrors,
        createEnterprise,
        setEnterpriseDetails,
        googleStrategy,
        selectedRevenue,
        setSelectedRevenue,
      }}
    >
      <div
        className={`lsm:rounded-3xl max-lsm:p-4 max-lsm:rounded-t-xl lsm:w-[880px] lsm:h-[640px] max-h-[640px]} relative flex w-full bg-white transition-all duration-150 ease-out`}
      >
        <div
          className={`lsm:px-2 tb:px-10 tb:py-10 lsm:w-[55%] flex w-full flex-col items-start justify-between py-5 sm:px-5`}
        >
          {SignInComponents()}
          {(showEmailFields &&
            loginOrSignup === 'signup' &&
            loginType === LOGIN_TYPES?.EMAIL) ||
          loginType === LOGIN_TYPES?.CREATE_ENTERPRISE ? (
            <div className="max-lsm:px-5 mt-10 flex w-full items-center justify-between">
              <div className="flex space-x-2">
                <div
                  className={`h-1.5 w-12 ${step >= 1 ? 'bg-violet-700' : 'bg-black/5'} rounded-full transition-all duration-500 ease-in-out`}
                ></div>
                <div
                  className={`h-1.5 w-12 ${step >= 2 ? 'bg-violet-700' : 'bg-black/5'} rounded-full transition-all duration-500 ease-in-out`}
                ></div>
                <div
                  className={`h-1.5 w-12 ${step >= 3 ? 'bg-violet-700' : 'bg-black/5'} rounded-full transition-all duration-500 ease-in-out`}
                ></div>
              </div>
              <div className="text-sm text-gray-600">Step {step} of 3</div>
            </div>
          ) : null}
        </div>
        <div className="lsm:block hidden w-[45%] rounded-2xl">
          <SignInSignUpCover translate={translate} />
        </div>
        {/* <Image
                    src="https://spyne-website.s3.amazonaws.com/static/assets_2024_1/close_Icon_VS_Login_Modal.svg"
                    width={40}
                    height={40}
                    alt="close"
                    className="absolute z-10 -top-4 -right-3 rounded-full bg-black cursor-pointer"
                    onClick={() => closeLogin()}
                /> */}
      </div>
    </SignInSignUpContext.Provider>
  );
}
export default GuestLogin;
