/**
 * @format
 */
import { GoogleLogin } from '@react-oauth/google';
import { LOGIN_DATA, icons } from '@spyne-console/common-config/login';
import { useEcomVirtualStudio } from '@spyne-console/context';
import { useDispatch } from '@spyne-console/store';
import { updateAuthProp } from '@spyne-console/store';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

import {
  Logout,
  base64Decode,
  checkCategoryAndRedirect,
  fetchEnterpriseFeatures,
  generateBearerToken,
  guestEnterprise,
  localStorageKeys,
  newBearerAfterGuestLoginFalse,
  redirectToAdminTools,
  sessionStorageKeys,
  skipEnterpriseSelectionPage,
} from '@spyne-console/utils/config';

import CentralAPIHandler from '../centralAPIHandler/centralAPIHandler';
import Signup from '../signup/Signup';
import NewLogin from './NewLogin';
import GuestLogin from './signInSignUp/GuestLogin';

const EcomLoginModal = (props) => {
  const { translate } = props;
  const dispatch = useDispatch();
  const loginModalRef = useRef();
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    contact: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const {
    showEmailSignup,
    showLoginMenu,
    setShowLoginMenu,
    setShowEmailSignup,
  } = useEcomVirtualStudio();

  const continueWithGoogle = async (googleResponse) => {
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
      localStorage.removeItem(localStorageKeys.DEFAULTBEARERTOKEN);

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
        updateAuthDetailsInRedux(resp?.data);

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
          let userEmail = credential?.email,
            defaultEnterprise = resp?.data?.defaultEnterprise?.enterpriseId;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (skipEnterpriseSelection) {
            // router.push({pathname: "/home", query: {"enterprise_id": enterprise_id}})
            checkCategoryAndRedirect(
              router,
              resp?.data?.defaultEnterprise?.category_id,
              enterprise_id
            );
          } else {
            redirectToAdminTools(router);
          }
        }
        localStorage.setItem(localStorageKeys?.AUTHKEY, decryptedAuthKey);

        if (props.hideLeftContainer) {
          let skuIds = [];
          skuIds = sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
            ? sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
            : [];
          await newBearerAfterGuestLoginFalse(resp?.data?.authKey); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
          if (sessionStorage.getItem(sessionStorageKeys?.enterpriseFeatures)) {
            //this means there's already an entry and needs to be updated
            fetchEnterpriseFeatures(
              resp?.data?.defaultEnterprise?.enterpriseId
            );
          }
          if (skuIds.length > 0)
            await mapGuestToActual(resp?.data?.userData, skuIds);
        }
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
      router.replace('/virtualstudio');
      toast('Oops, something went wrong! Please try again.', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
        position: 'bottom-center',
        pauseOnHover: true,
      });
      setErrorMsg(
        error?.response?.data?.message || error?.data?.message || error?.message
      );
      localStorage.removeItem(localStorageKeys?.AUTHKEY);
      localStorage.setItem(localStorageKeys?.guestLogin, true);
      dispatch(resetAuth());
    }
  };

  const updateAuthDetailsInRedux = (loginResponseData) => {
    try {
      localStorage.setItem(localStorageKeys.guestLogin, false);
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
  const mapGuestToActual = async (userData) => {
    const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/guest-user-mapping`;

    const payload = {
      guestUserId: guestEnterprise?.guestUserIdEcom,
      actualUserId: userData?.userId,
      skuIdList: skuIds,
    };

    await CentralAPIHandler.handlePatchRequest(URL, payload);
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

  const signUpWithEmail = () => {
    try {
      setShowEmailSignup(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = () => {
    try {
      setShowLoginMenu(true);
      setShowEmailSignup(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    //hook for outside focus handler

    {
      /*  dont close login modal on outside click */
    }

    // let outsideFocusHandler = event => {
    //     if (!loginModalRef?.current?.contains(event?.target)) {
    //         dispatch(updateAuthProp([{"key": "loginModalTrigger", "value": false}]))
    //         setShowLoginMenu(true) //TODO: make it false when google signup is introduced
    //         setShowEmailSignup(false)
    //     }
    // }
    // document.addEventListener("mousedown", outsideFocusHandler)
    // return () => {
    //     document.removeEventListener("mousedown", outsideFocusHandler)
    // }
  }, []);
  return (
    <div
      className="relative z-[200]"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center md:items-center md:p-4">
          <div
            className="bottom-modal-sm item-center relative m-0 flex max-h-[520px] w-full flex-col gap-5 overflow-y-scroll rounded-t-3xl bg-white px-4 py-5 md:max-h-fit md:w-[440px] md:rounded-xl md:p-5"
            ref={loginModalRef}
          >
            <div className="bg-black-20 mx-auto h-1.5 w-[50%] rounded-3xl lg:hidden"></div>

            {showEmailSignup ? (
              <>
                <Signup
                  hideVehicleSpin={true}
                  setShowEmailSignup={setShowEmailSignup}
                  setShowLoginMenu={setShowLoginMenu}
                  allowClose
                  translate={translate}
                />
              </>
            ) : showLoginMenu ? (
              <>
                <GuestLogin
                  hideLeftContainer={true}
                  setShowEmailSignup={setShowEmailSignup}
                  setShowLoginMenu={setShowLoginMenu}
                  allowClose
                  translate={translate}
                />
              </>
            ) : (
              <>
                <h1 className="text-black-90 text-lg font-bold">
                  Your Image is just a step away...
                </h1>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    continueWithGoogle(credentialResponse);
                  }}
                  onError={async () => {
                    await Logout();
                  }}
                  size="large"
                  text="continue_with"
                  logo_alignment="center"
                  ux_mode="popup"
                  // width="390"
                  translate={translate}
                />
                <p className="border-black-20 text-black-60 mx-4 my-3 border-t text-center font-normal leading-[0] tracking-tight">
                  <span className="bg-white px-3">
                    {LOGIN_DATA?.orSeparatorText}
                  </span>
                </p>

                <div
                  className="border-black-10 flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3"
                  onClick={() => signUpWithEmail()}
                >
                  <Image src={icons?.email} width={19} height={15} />
                  <p className="text-black-60">{LOGIN_DATA?.signUpWithEmail}</p>
                </div>

                <p className="text-black-60 text-center font-normal tracking-tight">
                  {LOGIN_DATA?.alreadyHaveAccount}&nbsp;
                  <span
                    onClick={() => handleLogin()}
                    className="cursor-pointer font-medium text-blue-100"
                  >
                    Log&nbsp;in
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EcomLoginModal;
