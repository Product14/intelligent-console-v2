/**@format */
import {
  LOGIN_DATA,
  SELECT_DROPDOWN_REVENUE,
  categories,
  prodCatIdMapping,
} from '@spyne-console/common-config/login';
import {
  resetAuthExceptResellersData,
  updateAuthProp,
} from '@spyne-console/store';

import React, { createRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { v4 as uuid } from 'uuid';

import { useCurrentRoute } from '@spyne-console/hooks';

import {
  LOGIN_TYPES,
  base64Decode,
  base64Payload,
  captureEvent,
  checkCategoryAndRedirect,
  defaultEnterprise,
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
  validateCreateEnterpriseFormFields,
  validateFormFields,
} from '@spyne-console/utils/config';

import { decrypt } from '@spyne-console/lib/crypto';

import HideSpyneContent from '../../../hoc/HideSpyneContent';
import CentralAPIHandler from '../../centralAPIHandler/centralAPIHandler';
import { _tokenGenerationForPublicAPIs } from '../../common/utility/tokenRotation';
import { useAuthActions } from '../../hooks/useAuthActions';
// import ClevertapReact from "clevertap-react"
import SignInSignUpContext from '../context';
import CreateEnterprise from '../enterprise-team-selection/CreateEnterprise';
import SelectEnterprise from '../enterprise-team-selection/SelectEnterprise';
import SelectTeam from '../enterprise-team-selection/SelectTeam';
import WLPlaceholder from '../enterprise-team-selection/WLPlaceholder';
import EnterEmail from './EnterEmail';
import LoginTypePassword from './LoginTypePassword';
import VerifyEmail from './VerifyEmail';

function SignInSignUp(props) {
  const { translate } = props;
  const urlParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  let utmSource, utmMedium, utmChannel;
  if (urlParams?.has('utm_source')) {
    utmSource = urlParams?.get('utm_source');
  }
  if (urlParams?.has('utm_medium')) {
    utmMedium = urlParams.get('utm_medium');
  }
  if (urlParams?.has('utm_channel')) {
    utmChannel = urlParams.get('utm_channel');
  }
  const { translate: t } = props;

  const router = useRouter();
  const { source = 'browser' } = router?.query;
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
    dealership_group_name: '',
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
  const [backSpinner, setBackSpinner] = useState(false);
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
  const [activeCategoryType, setActiveCategoryType] = useState(
    categories?.automobile
  );
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
            login_flow: 'console',
            source: 'other',
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
            <EnterEmail
              LOGIN_DATA={LOGIN_DATA}
              loginType={loginType}
              source={source}
              translate={translate}
            />
          );
        case LOGIN_TYPES?.PASSWORD:
        case LOGIN_TYPES?.FORGOT_PASSWORD:
        case LOGIN_TYPES?.FORGOT_EMAIL_LINK_SENT:
          return <LoginTypePassword xs_BackIcon translate={translate} />;
        case LOGIN_TYPES?.OTP:
          return auth?.resellerData?.is_reseller ? (
            <>
              <HideSpyneContent
                isWhiteLabelComponent={userValidationInfo?.userExists}
              >
                <VerifyEmail translate={translate} />
              </HideSpyneContent>
              <HideSpyneContent
                isWhiteLabelComponent={!userValidationInfo?.userExists}
              >
                <WLPlaceholder translate={translate} />
              </HideSpyneContent>
            </>
          ) : (
            <VerifyEmail translate={translate} />
          );

        case LOGIN_TYPES?.SELECT_ENTERPRISE:
          return (
            <>
              <HideSpyneContent>
                <SelectEnterprise xs_BackIcon source={source} />
              </HideSpyneContent>
              <HideSpyneContent isWhiteLabelComponent={true}>
                <WLPlaceholder />
              </HideSpyneContent>
            </>
          );
        case LOGIN_TYPES?.CREATE_ENTERPRISE:
          return (
            <>
              <HideSpyneContent>
                <CreateEnterprise
                  email={user?.emailId}
                  xs_BackIcon
                  source={source}
                  setEnterpriseDetails={setEnterpriseDetails}
                  translate={translate}
                />
              </HideSpyneContent>
              <HideSpyneContent isWhiteLabelComponent={true}>
                <WLPlaceholder />
              </HideSpyneContent>
            </>
          );
        case LOGIN_TYPES?.SELECT_TEAM:
          return (
            <>
              <HideSpyneContent>
                <SelectTeam xs_BackIcon source={source} />
              </HideSpyneContent>
              <HideSpyneContent isWhiteLabelComponent={true}>
                <WLPlaceholder />
              </HideSpyneContent>
            </>
          );
        default:
          return <EnterEmail LOGIN_DATA={LOGIN_DATA} translate={translate} />;
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
        setErrorMsg(
          t(`console.screens.otpScreen.InCaseOfEmptyOtpBoxSubmission`)
        );
        setSignInSpinner(false);
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
        company: enterpriseDetails?.enterprise_name,
        phone: enterpriseDetails?.owner_phone,
        // 'toolName': getToolName(router.pathname),
        otpVerify: 'true',
        category: enterpriseDetails?.category ?? prodCatName,
        submission_page_url: utmSource
          ? `${utmSource}${utmMedium}`
          : currentUrl,
        utm_channel: utmChannel,
      };
      if (!auth?.resellerData?.is_reseller && loginOrSignup === 'signup') {
        newHubspotReport(hubSpotpayload);
        try {
          const leadFormURL = `${process.env.BACKEND_BASEURL}/spyne-websites/v1/lead-form/submit-form`;
          const leadFormData = {
            formData: {
              email_id: user?.emailId,
              company: enterpriseDetails?.enterprise_name || '',
              phone_number: enterpriseDetails?.owner_phone || '',
              submission_page_url: currentUrl || '',
              source: utmSource ? `${utmSource}${utmMedium}` : currentUrl || '',
            },
          };

          await CentralAPIHandler.handlePostRequest(leadFormURL, leadFormData);
        } catch (error) {
          console.log('Lead form submission error:', error);
        }
      }

      // if (user && user?.emailId && !user?.emailId.includes("@spyne.ai")) {
      //     ClevertapReact.event("auth_signup_otp_clicked", cleverTapPayload)
      // }

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
      setSignInSpinner(false);
      captureEvent(
        'otp_verified',
        {
          demo_flow_source: 'email',
          login_flow: 'console',
          source: 'other',
        },
        false
      );
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

  const checkUserExists = async (e, googleResponse) => {
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
          setErrorMsg(t(`console.screens.emailScreen.emailLoginSignUpText`));
        }
        if (!enterpriseDetails?.owner_phone) {
          setFormErrors({
            ...formErrors,
            owner_phone: t(
              `console.screens.enterprisesScreen.correctPhoneNumberRed`
            ),
          });
        }
        return;
      } else if (!mailFormatRegEx.test(userEmail)) {
        setErrorMsg(t(`console.screens.emailScreen.requiredEmailAddress`));
        return;
      } else if (
        !googleResponse &&
        loginOrSignup === 'signup' &&
        enterpriseDetails?.owner_phone.length < 8
      ) {
        setFormErrors({
          ...formErrors,
          owner_phone: t(`Please enter a valid phone number`),
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
      let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin))
        : false;
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
      let payloadForApp = {
        enterprise_id:
          resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId,
        enterprise_name: resp?.data?.loginResponse?.defaultEnterprise?.name,
        team_id: resp?.data?.loginResponse?.teamData?.team_id,
        team_name: resp?.data?.loginResponse?.teamData?.team_name,
        user_name: resp?.data?.loginResponse?.userData?.name,
        email_id: resp?.data?.loginResponse?.userData?.emailId,
        user_role:
          resp?.data?.loginResponse?.permissionObject[
            resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId
          ][resp?.data?.loginResponse?.teamData?.team_id]?.alias,
        authKey: resp?.data?.loginResponse?.authKey,
        deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
      };
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
      // let enterpriseTempName = domain.split(".")[0]
      // if (!emailDomains.includes(domain)) {
      //     setEnterpriseDetails({ ...enterpriseDetails, enterprise_name: enterpriseTempName })
      // }

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
        updateAuthProp([
          {
            key: 'previousState',
            value: {
              ...previousState,
              [LOGIN_TYPES?.[nextStepMapping[resp?.data?.nextStep]]]: loginType,
            },
          },
        ]);
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
            login_flow: 'console',
            source: 'other',
          },
          false
        );
      } else {
        captureEvent(
          'new_email_entered',
          {
            method: 'email',
            login_flow: 'console',
            source: 'other',
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
      if (!auth?.resellerData?.is_reseller && loginOrSignup === 'signup') {
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
      }

      //redirect to home page with default enterprise of user
      if (
        Object.keys(resp?.data?.loginResponse || {}).length > 0 &&
        resp?.data?.nextStep === 'home-page'
      ) {
        localStorage.setItem(
          localStorageKeys?.AUTHKEY,
          resp?.data?.loginResponse?.authKey
        );

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
        generateBearerToken(
          { additionalPayload: {} },
          true,
          resp?.data?.loginResponse?.teamData?.team_id,
          resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId
        );

        let token = base64Payload({ payload: payloadForApp });
        if (signupSource === 'console' || signupSource === '') {
          let enterpriseId =
            resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId;
          let category_id =
            resp?.data?.loginResponse?.defaultEnterprise?.category_id;
          // router.push({pathname: "/home", query: {"enterprise_id": resp?.data?.loginResponse?.defaultEnterprise?.enterpriseId}})
          checkCategoryAndRedirect(router, category_id, enterpriseId);
        } else if (signupSource === 'app_ios') {
          window.location.replace(resp?.data?.deepLinks?.ios);
          localStorage.clear();
          sessionStorage.clear();
        } else if (signupSource === 'app_android') {
          window.location.replace(resp?.data?.deepLinks?.android);
          localStorage.clear();
          sessionStorage.clear();
        }
        captureEvent(
          'logged_in',
          {
            method: user?.googleResponse || googleResponse ? 'google' : 'email',
            login_flow: 'console',
            source: 'other',
          },
          false
        );
      }

      if (auth?.resellerData?.is_reseller && !resp?.data?.userExists) {
        localStorage.removeItem(localStorageKeys?.AUTHKEY);
        localStorage.setItem(localStorageKeys?.guestLogin, true);
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setErrorMsg(error?.data?.message || error?.message || error);
      localStorage.removeItem(localStorageKeys?.AUTHKEY);
      localStorage.setItem(localStorageKeys?.guestLogin, true);
      if (!auth?.resellerData?.is_reseller) {
        resetAuth({ sameLogo: true });
      }
    } finally {
      setSignInSpinner(false);
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
      let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin))
        : false;

      if (resp?.data?.nextStep === 'verify-otp') {
        setSignInSpinner(false);
        useLoginTypeOTP();
        return;
      }

      // Decrypt the encrypted keys
      const decryptedAuthKey = decrypt(resp?.data?.authKey);
      const decryptedSecretKey = decrypt(
        resp?.data?.defaultEnterprise?.secretKey
      );
      const decryptedApiKey = decrypt(resp?.data?.defaultEnterprise?.apiKey);
      // Update the response with decrypted keys
      resp.data.authKey = decryptedAuthKey;
      resp.data.defaultEnterprise.secretKey = decryptedSecretKey;
      resp.data.defaultEnterprise.apiKey = decryptedApiKey;
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
      localStorage.setItem(localStorageKeys?.AUTHKEY, decryptedAuthKey);
      localStorage.setItem(
        localStorageKeys?.vsVersion,
        JSON.stringify({
          [resp?.data?.defaultEnterprise?.enterpriseId]:
            resp?.data?.defaultEnterprise?.version,
        })
      );
      refreshTokenAndUpdateRedux({ fastRefresh: false });

      let payloadForApp = {
        enterprise_id: resp?.data?.defaultEnterprise?.enterpriseId,
        enterprise_name: resp?.data?.defaultEnterprise?.name,
        team_id: resp?.data?.teamData?.team_id,
        team_name: resp?.data?.teamData?.team_name,
        user_name: resp?.data?.userData?.name,
        email_id: resp?.data?.userData?.emailId || user?.emailId,
        user_role:
          resp?.data?.permissionObject[
            resp?.data?.defaultEnterprise?.enterpriseId
          ][resp?.data?.teamData?.team_id]?.alias,
        authKey: decryptedAuthKey,
        deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
      };

      if (Object.keys(resp?.data || {}).length > 0) {
        captureEvent(
          'password_verified',
          {
            method: 'email',
            login_flow: props?.allowClose ? 'non_restrictive' : 'restrictive',
            source: 'other',
          },
          false
        );
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
          generateBearerToken({ additionalPayload: {} });
          let token = base64Payload({ payload: payloadForApp });
          let userEmail = payload?.emailId,
            defaultEnterprise = resp?.data?.defaultEnterprise?.enterpriseId;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (signupSource === 'console') {
            if (skipEnterpriseSelection) {
              // router.push({pathname: "/home", query: {"enterprise_id": enterprise_id}})
              checkCategoryAndRedirect(
                router,
                resp?.data?.defaultEnterprise?.category_id,
                resp?.data?.defaultEnterprise?.enterpriseId
              );
            } else {
              redirectToAdminTools(router);
            }
          } else {
            if (signupSource === 'app_ios') {
              window.location.replace(resp?.data?.deepLinks?.ios);
            } else if (signupSource === 'app_android') {
              window.location.replace(resp?.data?.deepLinks?.android);
            }
            localStorage.clear();
            sessionStorage.clear();
          }
        }
        captureEvent(
          'logged_in',
          {
            method: 'email',
            login_flow: 'console',
            source: 'other',
          },
          false
        );
        if (props?.hideLeftContainer) {
          await newBearerAfterGuestLoginFalse(resp?.data?.authKey); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
          if (skuIds?.length > 0)
            await mapGuestToActual(resp?.data?.userData, skuIds);
        }
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
      setErrorMsg(error?.response?.data?.message || error?.message);
      localStorage.removeItem(localStorageKeys?.AUTHKEY);
      localStorage.setItem(localStorageKeys?.guestLogin, true);
      resetAuth({ sameLogo: true });
      updateAuthProp([
        {
          key: 'previousState',
          value: {
            ...previousState,
            [LOGIN_TYPES?.PASSWORD]: LOGIN_TYPES?.EMAIL,
          },
        },
      ]);
      setUser({ ...user, password: '' });
      if (props?.hideLeftContainer)
        updateAuthProp([{ key: 'loginModalTrigger', value: true }]);
      console.log(error);
    } finally {
      setSignInSpinner(false);
      captureEvent(
        'password_submit',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'click',
          login_flow: 'console',
          user_email_domain: user?.emailId,
          device: source,
          method: 'email',
        },
        true
      );
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
    console.log('googleResponse', googleResponse);
    // The credential is coming directly from the Google response
    const credential = {
      access_token: googleResponse.credential,
      email: '', // We'll need to fetch user info using the access token
      name: '',
    };
    console.log('credential', credential);
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
      captureEvent(
        'loggedin_with_google',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'screen_view',
        },
        true
      );
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

      resetAuth({ sameLogo: true });
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
      captureEvent(
        'email_sent_resend',
        {
          parent_screen_name: mainRoute,
          child_screen_name: childRoute ?? mainRoute,
          event_type: 'click',
        },
        true
      );
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

  // const handleForgot = () => {
  //     try {
  //         dispatch(updateAuthProp([{"key": "previousState", value: {...auth?.previousState, [LOGIN_TYPES?.FORGOT_PASSWORD]: loginType}}]))
  //         setLoginType(LOGIN_TYPES?.FORGOT_PASSWORD)
  //     } catch (error) {
  //         console.log(error)
  //     }
  // }

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

      await CentralAPIHandler.handlePatchRequest(URL, payload);
    } catch (error) {
      console.log;
    }
  };
  const useLoginTypeOTP = async (resend = false) => {
    setUser({ ...user, password: '', otp: '' });
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
      captureEvent(
        'enterprise_created',
        {
          source: 'other',
          login_flow: 'console',
          method: googleStrategy ? 'google' : 'email',
        },
        false
      );
    } catch (error) {
      console.log(error);
      setErrorMsg(error?.response?.data?.message || error);
    }
  };

  const createEnterprise = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let queryParams = new URLSearchParams(window.location.search);
    // let prodCatId = 'cat_d8R14zUNE'
    let prodCatId = queryParams.get('category_id');
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
        category_id:
          enterpriseDetails?.category_id != ''
            ? enterpriseDetails?.category_id
            : prodCatId,
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
        organization: enterpriseDetails?.org_type,
        number_of_cars: enterpriseDetails?.no_of_cars,
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
      if (!auth?.resellerData?.is_reseller && loginOrSignup === 'signup') {
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
      }

      let cleverTapPayload = {
        status: 'Enterprise created',
        source: signupSource,
        category: enterpriseDetails?.category,
        user_email: user?.emailId,
        user_name: enterpriseDetails?.owner_name,
        mobile_number: enterpriseDetails?.owner_phone,
      };
      // if (user?.emailId && !user?.emailId.includes("@spyne.ai")) {
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
          }) || {}
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
        //
        createEnterprisePayload = {
          enterpriseName: enterpriseDetails?.enterprise_name,
          category:
            enterpriseDetails?.category_id != ''
              ? enterpriseDetails?.category_id
              : prodCatIdMapping[0],
          category_id:
            enterpriseDetails?.category_id != ''
              ? enterpriseDetails?.category_id
              : prodCatId,
          teamName:
            enterpriseDetails?.default_teamname ||
            enterpriseDetails?.enterprise_name,
          emailId: user?.emailId,
          password: tempPassword,
          userName: enterpriseDetails?.owner_name,
          deviceId: deviceId,
          sSecret: secureToken.passPhrase,
          sKey: secureToken.token,
          url: domain,
          stage: 'Signup',
          type: 'PLG',
          // website_link: ((enterpriseDetails?.category_id && enterpriseDetails?.category_id !== "cat_d8R14zUNE") || (prodCatId && prodCatId !== "cat_d8R14zUNE")) ? JSON.stringify([enterpriseDetails?.website_link]) : "",
          website_link: JSON.stringify([enterpriseDetails?.website_link]),
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
          step: 'create-enterprise-config',
          enterpriseName: enterpriseDetails?.enterprise_name,
          category: enterpriseDetails?.category ?? prodCatName,
          category_id: 'cat_d8R14zUNE',
          teamName:
            enterpriseDetails?.default_teamname ||
            enterpriseDetails?.enterprise_name,
          org_type: enterpriseDetails?.org_type,
          website_url: enterpriseDetails?.website_url,
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
        source: source === 'browser' ? 'console_browser' : 'console_app',
      };
      localStorage.removeItem(localStorageKeys?.DEFAULTBEARERTOKEN);
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/signup`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {}, payload);
      console.log('iruio');
      step = 2;
      if (
        prodCatId === 'cat_d8R14zUNE' ||
        enterpriseDetails?.category_id === 'cat_d8R14zUNE'
      ) {
        //Auto category
        //for Automobile only
        const secureTokenConfigurations = _tokenGenerationForPublicAPIs();
        const URLDefaultConfigation = `${process.env.APP_BACKEND_BASEURL}/console/v1/account/add-default-configuration`;
        await CentralAPIHandler.handlePostRequest(URLDefaultConfigation, {
          enterpriseId: enterpriseId,
          prodCatId:
            enterpriseDetails?.category_id != ''
              ? enterpriseDetails?.category_id
              : prodCatId,
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
          prodCatId:
            enterpriseDetails?.category_id != ''
              ? enterpriseDetails?.category_id
              : prodCatId,
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
          prodCatId:
            enterpriseDetails?.category_id != ''
              ? enterpriseDetails?.category_id
              : prodCatId,
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
      if (!auth?.resellerData?.is_reseller && loginOrSignup === 'signup') {
        newHubspotReport(hubSpotpayload);
        try {
          const leadFormURL = `${process.env.BACKEND_BASEURL}/spyne-websites/v1/lead-form/submit-form`;
          const leadFormData = {
            formData: {
              email_id: user?.emailId,
              firstname: enterpriseDetails?.owner_name || '',
              company: enterpriseDetails?.enterprise_name || '',
              phone_number: enterpriseDetails?.owner_phone || '',
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
      }
      let cleverTapPayload = {
        status: 'Enterprise Created',
        source: signupSource,
        user_email: user?.emailId,
        user_name: enterpriseDetails?.owner_name,
        mobile_number: enterpriseDetails?.owner_phone,
        device_id: deviceId,
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
        category_id: enterpriseDetails?.category_id,
      };
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

      let payloadForApp = {
        enterprise_id: enterpriseId,
        enterprise_name: enterpriseDetails?.enterprise_name,
        team_id: teamId,
        team_name: enterpriseDetails?.enterprise_name,
        user_name: resp?.data?.userData?.name,
        email_id: resp?.data?.userData?.emailId || user?.emailId,
        user_role: resp?.data?.permissionObject[enterpriseId][teamId]?.alias,
        authKey: resp?.data?.authKey,
        deviceId: deviceId,
      };
      generateBearerToken(
        { additionalPayload: {} },
        true,
        teamId,
        enterpriseId
      );
      let newBearerToken = base64Payload({ payload: payloadForApp });
      if (signupSource === 'console') {
        console.log('logged login signinsignup');
        checkCategoryAndRedirect(
          router,
          enterpriseDetails?.category_id,
          enterpriseId,
          null,
          false,
          'sign-up'
        );
        updateAuthProp([{ key: 'welcomeCreditsModalTrigger', value: true }]);
        // router.push({pathname: "/home", query: {"enterprise_id": enterpriseId}})
      } else {
        localStorage.clear();
        sessionStorage.clear();
        // router.push(`/register/success?bearerToken=${newBearerToken}`)
        if (signupSource === 'app_ios') {
          window.location.replace(resp?.data?.deepLinks?.ios);
        } else if (signupSource === 'app_android') {
          window.location.replace(resp?.data?.deepLinks?.android);
        }
      }
      setSignInSpinner(false);
      captureEvent(
        'enterprise_created',
        {
          source: 'other',
          login_flow: 'console',
          method: googleStrategy ? 'google' : 'email',
        },
        false
      );
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
      resetAuth({ sameLogo: true });
      console.log(error);
    }
    setSignInSpinner(false);
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
      // let prodCatId ='cat_d8R14zUNE'
      let source = queryParams.get('pageSrc');

      if (!source) source = 'console';
      setSignupSource(source);
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

  const backToLogin = () => {
    try {
      setBackSpinner(true);
      setLoginType(LOGIN_TYPES?.EMAIL);
    } catch (error) {}
    setBackSpinner(false);
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
        );

        const { skip: skipEnterpriseSelection, enterprise_id } =
          skipEnterpriseSelectionPage(
            userEmail,
            defaultEnterprise?.enterpriseId
          );
        if (
          signupSource === 'console' ||
          window?.location?.pathname?.includes('/virtualstudio')
        ) {
          if (skipEnterpriseSelection) {
            // router.push({pathname: "/home", query: {"enterprise_id": enterprise_id}})
            checkCategoryAndRedirect(
              router,
              defaultEnterprise?.category_id,
              enterprise_id
            );
          } else {
            redirectToAdminTools(router);
          }
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
        source: 'other',
        login_flow: 'console',
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

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.country_code) {
          setEnterpriseDetails((prevDetails) => ({
            ...prevDetails,
            countryCode: data.country_code.toLowerCase(),
            dialCode: data.country_calling_code.replace('+', ''),
          }));
        }
      } catch (error) {
        console.error('Error fetching country code:', error);
      }
    };

    fetchCountryCode();
  }, []);

  return (
    <SignInSignUpContext.Provider
      value={{
        setErrorMsg,
        setFormErrors,
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
        // handleForgot,
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
        signupSource,
        formErrors,
        validateInput,
        createEnterprise,
        setEnterpriseDetails,
        refreshTokenAndUpdateRedux,
        googleStrategy,
        selectedRevenue,
        setSelectedRevenue,
        backToLogin,
        backSpinner,
      }}
    >
      <div className="w-full overflow-hidden">
        {SignInComponents()}
        {(showEmailFields &&
          loginOrSignup === 'signup' &&
          loginType === LOGIN_TYPES?.EMAIL) ||
        loginType === LOGIN_TYPES?.CREATE_ENTERPRISE ? (
          <div className="mt-10 flex items-center justify-between">
            <div className="flex space-x-2">
              <div
                className={`h-1.5 w-12 ${step >= 1 ? 'bg-violet-700' : 'bg-black/5'} rounded-full`}
              ></div>
              <div
                className={`h-1.5 w-12 ${step >= 2 ? 'bg-violet-700' : 'bg-black/5'} rounded-full`}
              ></div>
              <div
                className={`h-1.5 w-12 ${step >= 3 ? 'bg-violet-700' : 'bg-black/5'} rounded-full`}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {translate('console.screens.signInSignUpScreen.step')} {step}{' '}
              {translate('console.screens.signInSignUpScreen.of')} 3
            </div>
          </div>
        ) : null}
      </div>
    </SignInSignUpContext.Provider>
  );
}
export default SignInSignUp;
