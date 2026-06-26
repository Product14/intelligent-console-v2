'use client';

import { useVirtualStudio } from '@spyne-console/context';

import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

import {
  Logout,
  base64Decode,
  checkCategoryAndRedirect,
  fetchEnterpriseFeatures,
  generateBearerToken,
  localStorageKeys,
  newBearerAfterGuestLoginFalse,
  redirectToAdminTools,
  sessionStorageKeys,
  skipEnterpriseSelectionPage,
} from '@spyne-console/utils/config';
import { captureEvent } from '@spyne-console/utils/config';

import CentralAPIHandler from '../centralAPIHandler/centralAPIHandler';
import { useAuthActions } from '../hooks/useAuthActions';
import Signup from '../signup/Signup';
import GuestLogin from './signInSignUp/GuestLogin';
import GuestSignInSignUpModal from './signInSignUp/GuestSignInSignUpModal';

const GuestLoginModal = (props) => {
  const {
    allowClose,
    setTriggerLoginModalAfterProcessing = () => {},
    setMouseMv = () => {},
    setMouseLv = () => {},
    openLoginModal,
    setOpenLoginModal = () => {},
    translate,
  } = props;

  const loginModalRef = useRef();
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    contact: '',
  });
  const [showButton, setShowButton] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    showEmailSignup,
    showLoginMenu,
    setShowLoginMenu,
    setShowEmailSignup,
  } = useVirtualStudio();

  const { auth, updateAuthProp, resetAuth, updateAuthDetailsInRedux } =
    useAuthActions();

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
      toast(translate('console.screens.imageTab.guestLogin.loginError'), {
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
      resetAuth();
    }
  };

  const mapGuestToActual = async (userData) => {
    const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/guest-user-mapping`;

    const payload = {
      guestUserId: guestEnterprise?.guestUserId,
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

  const handleCreateAccount = () => {
    captureEvent('create_account_clicked_message', {}, false);
    setOpenLoginModal(true);
    setShowLoginMenu(true);
  };

  return (
    <>
      {showLoginMenu && !openLoginModal ? (
        <>
          <GuestSignInSignUpModal
            setShowLoginMenu={setShowLoginMenu}
            allowClose={allowClose === true}
            setShowEmailSignup={setShowEmailSignup}
            setTriggerLoginModalAfterProcessing={
              setTriggerLoginModalAfterProcessing
            }
            setMouseLv={setMouseLv}
            setMouseMv={setMouseMv}
            setShowButton={setShowButton}
            handleCreateAccount={handleCreateAccount}
            translate={translate}
          />
        </>
      ) : (
        <div
          className="relative z-[200]"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-20">
            <div className="lsm:items-center lsm:p-4 flex min-h-full items-end justify-center">
              <div
                className={`bottom-modal-sm lsm:p-4 relative flex max-h-[600px] w-full flex-col items-center gap-5 overflow-y-clip p-0 ${window.innerHeight < 670 && window.innerWidth > 764 ? 'h-[90%] translate-y-[-8%] scale-[0.85]' : ''} lsm:max-h-fit lsm:w-8/12 lsm:rounded-xl rounded-t-3xl bg-transparent`}
                ref={loginModalRef}
              >
                {showEmailSignup ? (
                  <>
                    <Signup
                      hideVehicleSpin={true}
                      setShowEmailSignup={setShowEmailSignup}
                      setShowLoginMenu={setShowLoginMenu}
                      translate={translate}
                    />
                  </>
                ) : showLoginMenu && openLoginModal ? (
                  <>
                    <GuestLogin
                      hideLeftContainer={true}
                      setShowEmailSignup={setShowEmailSignup}
                      setShowLoginMenu={setShowLoginMenu}
                      setOpenLoginModal={setOpenLoginModal}
                      allowClose={true}
                      setTriggerLoginModalAfterProcessing={
                        setTriggerLoginModalAfterProcessing
                      }
                      setMouseLv={setMouseLv}
                      setMouseMv={setMouseMv}
                      translate={translate}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestLoginModal;
