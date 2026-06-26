/**
 * @format
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { v4 as uuid } from 'uuid';

import { useCurrentRoute } from '@spyne-console/hooks';

import {
  base64Payload,
  captureEvent,
  checkCategoryAndRedirect,
  generateBearerToken,
  localStorageKeys,
  newBearerAfterGuestLoginFalse,
  redirectToAdminTools,
  sessionStorageKeys,
  skipEnterpriseSelectionPage,
} from '@spyne-console/utils/config';

import CentralAPIHandler from '../../centralAPIHandler/centralAPIHandler';
import Skeleton from '../../common/skeleton&spinner/Skeleton';
import { useAuthActions } from '../../hooks/useAuthActions';
import { getDemoFlowType } from '../config';
import SignInSignUpContext from '../context';

function SelectTeam(props) {
  const { backCaret, xs_BackIcon, allowClose, source = 'browser' } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [enterpriseSelectionCopy, setEnterpriseSelectionCopy] = useState([]);
  const [teamsDataCopy, setTeamsDataCopy] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [noDataToDisplay, setNoDataToDisplay] = useState(false);
  const {
    user: userData,
    setUser,
    signupSource,
    teamSelectionData,
    selectedEnterprise,
    enterpriseDetails,
    setSelectedEnterprise,
    closeLogin,
    handleChangeLoginState,
    googleStrategy,
  } = useContext(SignInSignUpContext);
  const { mainRoute, childRoute } = useCurrentRoute();
  const router = useRouter();
  const queryParam = Object.keys(router.query)[0];
  const { auth, updateAuthProp, resetAuth, updateAuthDetailsInRedux } =
    useAuthActions();

  useEffect(() => {
    setTeamsData(teamSelectionData);
    setTeamsDataCopy(teamSelectionData);
    captureEvent(
      'select_team_screen',
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
  }, [teamSelectionData.length > 0]);

  const handleTeamSelection = async (e, teamData = null) => {
    try {
      setIsLoading(true);
      //signup user to enterprise and team selected
      setSelectedEnterprise({
        ...selectedEnterprise,
        team_name: teamData?.team_name,
        team_id: teamData?.team_id,
      });
      captureEvent(
        'team_joined',
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
      signupAndHome(teamData);
    } catch (error) {
      console.log(error);
      toast(`Couldn't sign you up. Please try again later.`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
        position: 'bottom-center',
        pauseOnHover: true,
      });
    }
    setIsLoading(false);
  };

  const signupAndHome = async (teamData) => {
    let skuIds = [];
    skuIds = sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      ? sessionStorage.getItem(sessionStorageKeys?.skuProcessed)
      : [];
    try {
      localStorage.removeItem(localStorageKeys?.DEFAULTBEARERTOKEN);
      let tempPassword = uuid().slice(0, 10);
      tempPassword = tempPassword.split('-').join('');
      setUser({ ...userData, password: tempPassword });
      let user_name = userData?.emailId.split('@');
      user_name = user_name[0];
      let deviceId = uuid().slice(0, 36);
      deviceId = deviceId.replace(/[&\/\\#, +()$~%.'":*?<>{}-]/g, '');
      localStorage.setItem(localStorageKeys?.DEVICEID, deviceId);
      let payload = {
        strategy: 'PASSWORD',
        apiKey: selectedEnterprise?.api_key,
        emailId: userData?.emailId.toLowerCase(),
        password: tempPassword,
        userName: user_name,
        deviceId: deviceId,
        enterpriseOnboarding: false,
        sendWelcomeEmail: true,
        contactNo: enterpriseDetails?.owner_phone,
        isdCode: enterpriseDetails?.dialCode,
        source: signupSource,
        teamId: teamData?.team_id,
      };
      const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/signup`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {}, payload);

      let guestLogin = localStorage.getItem(localStorageKeys?.guestLogin)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.guestLogin))
        : false;

      let payloadForApp = {
        enterprise_id: selectedEnterprise?.enterprise_id,
        enterprise_name: selectedEnterprise?.enterprise_name,
        team_id: teamData?.team_id,
        team_name: teamData?.team_name,
        user_name: resp?.data?.userData?.name,
        email_id: resp?.data?.userData?.emailId || userData?.emailId,
        user_role:
          resp?.data?.permissionObject[selectedEnterprise?.enterprise_id][
            teamData?.team_id
          ]?.alias,
        authKey: resp?.data?.authKey,
        deviceId: deviceId,
      };

      if (Object.keys(resp?.data || {}).length > 0) {
        localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);

        let defaultEnterpriseObj = {
          enterpriseId: selectedEnterprise?.enterprise_id,
          name: selectedEnterprise?.enterprise_name,
          apiKey: selectedEnterprise?.api_key,
          category_id: selectedEnterprise?.category_id,
        };
        updateAuthDetailsInRedux(resp?.data, defaultEnterpriseObj);

        localStorage.setItem(
          localStorageKeys?.USERDETAILS,
          JSON.stringify(resp?.data?.userData)
        );
        localStorage.setItem(
          localStorageKeys?.defaultEnterprise,
          JSON.stringify(defaultEnterpriseObj)
        );
        localStorage.setItem(
          localStorageKeys?.permissionObject,
          JSON.stringify(resp?.data?.permissionObject)
        );

        refreshTokenAndUpdateRedux({ fastRefresh: false });
        generateBearerToken(
          { additionalPayload: {} },
          true,
          teamData?.team_id,
          selectedEnterprise?.enterprise_id
        );

        let newBearerToken = base64Payload({ payload: payloadForApp });
        if (
          guestLogin &&
          window?.location?.pathname?.includes('/virtualstudio')
        ) {
          router.replace({
            query: { enterprise_id: selectedEnterprise?.enterprise_id },
          });
        } else {
          let userEmail = payload?.emailId,
            defaultEnterprise = selectedEnterprise?.enterprise_id;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (signupSource === 'console' && skipEnterpriseSelection) {
            // router.push({ pathname: "/home", query: { "enterprise_id": selectedEnterprise?.enterprise_id } })
            checkCategoryAndRedirect(
              router,
              selectedEnterprise?.category_id,
              selectedEnterprise?.enterprise_id
            );
          } else if (signupSource === 'console' && !skipEnterpriseSelection) {
            redirectToAdminTools(router);
          } else {
            localStorage.clear();
            sessionStorage.clear();
            if (signupSource === 'app_ios') {
              window.location.replace(resp?.data?.deepLinks?.ios);
            } else if (signupSource === 'app_android') {
              window.location.replace(resp?.data?.deepLinks?.android);
            }
          }
        }
        if (props?.hideLeftContainer) {
          await newBearerAfterGuestLoginFalse(resp?.data?.authKey); //this function is used to generate a new bearerToken for logged in user after guestLogin is set to false
          if (skuIds?.length > 0)
            await mapGuestToActual(resp?.data?.userData, skuIds);
        }
        captureEvent(
          'user_created',
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
      }
    } catch (error) {
      console.log(error);
      toast(`Couldn't sign you up. Please try again later.`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
        position: 'bottom-center',
        pauseOnHover: true,
      });
      if (props?.hideLeftContainer && skuIds?.length > 0) {
        router.replace('/virtualstudio');
      }
    }
    if (!props?.hideLeftContainer) {
      localStorage.removeItem(localStorageKeys?.src);
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

  const filterTeamName = (e) => {
    try {
      setNoDataToDisplay(false);
      setSearchText(e.target.value);
      const tempData = teamsDataCopy.filter((element) => {
        if (
          element?.team_name &&
          (element?.team_name)
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
        )
          return true;
        return false;
      });
      if (tempData.length === 0) {
        setNoDataToDisplay(true);
      }
      setTeamsData(tempData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {xs_BackIcon && (
        <Image
          className="tb:hidden absolute left-7 top-10 block h-4 w-auto cursor-pointer"
          src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
          height={18}
          width={18}
          onClick={handleChangeLoginState}
        />
      )}

      <div
        className={[
          teamsData?.length >= 8 || searchText.length
            ? ''
            : 'place-items-center',
          'col-span-4 grid h-full',
        ].join(' ')}
      >
        <div
          className={[
            teamsData?.length >= 8 || searchText.length ? '' : '',
            'w-full',
          ].join(' ')}
        >
          <div className="w-full">
            <h1 className="text-black-80 flex items-center justify-between gap-2 text-2xl font-bold">
              <div className="flex items-center gap-2">
                <Image
                  className="h-4 w-auto cursor-pointer"
                  src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                  height={16}
                  width={16}
                  onClick={handleChangeLoginState}
                />
                Welcome
              </div>
              {allowClose && (
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
          </div>
          <p className="text-black-60 relative mb-8 pl-5 text-sm font-normal">
            {' '}
            {isLoading ? (
              <Skeleton classSTYLE={'min-h-[20px] w-full rounded-lg mt-3'} />
            ) : (
              "Let's join a team"
            )}
          </p>
          <p className="text-black-60 relative mb-4 text-sm font-normal">
            Teams for{' '}
            <strong className="font-semibold">
              {selectedEnterprise?.enterprise_name}
            </strong>
          </p>

          {teamsData?.length >= 5 || searchText.length ? (
            <div className="border-black-10 mb-4 box-border flex rounded-lg border px-4 py-[11px]">
              <input
                type="text"
                placeholder="Search Teams"
                className="w-full bg-transparent"
                value={searchText}
                onChange={(e) => filterTeamName(e)}
              />
              <Image
                className="ml-2 cursor-pointer opacity-70 grayscale"
                src="https://spyne-static.s3.amazonaws.com/console/filter/searchIcon.svg"
                height={24}
                width={24}
              />
            </div>
          ) : null}
          <ul
            className={[
              searchText.length
                ? 'tb:h-[42vh] h-[40vh] 2xl:h-[50vh]'
                : 'tb:max-h-[42vh] max-h-[48vh] 2xl:max-h-[50vh]',
              'enterprise-list border-black-10 gap-2 overflow-y-scroll rounded-lg border',
            ].join(' ')}
          >
            {teamsData?.map((elements, indx) => {
              const initial = elements?.team_name
                ? elements?.team_name.charAt(0).toUpperCase()
                : null;

              return (
                <li
                  onClick={(e) => handleTeamSelection(e, elements)}
                  key={indx}
                  className={[
                    isLoading ? 'pointer-events-none min-h-[4.25rem]' : '',
                    'text-blue relative cursor-pointer px-3 py-2.5 text-sm font-medium leading-5 last:mb-0 md:px-4 md:py-3 md:text-base',
                  ].join(' ')}
                >
                  {isLoading ? (
                    <Skeleton
                      classSTYLE={'rounded-lg left-0  border-b-2 border-white'}
                    />
                  ) : (
                    <div className="grid grid-cols-12 items-center justify-between gap-x-2">
                      <div className="col-span-9">
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="col-span-12 flex gap-4">
                            <div className="bg-blue-8 text-black-60 flex h-12 w-12 items-center justify-center rounded-full text-xl md:h-[3.25rem] md:w-[3.25rem]">
                              {initial}
                            </div>

                            <div className="max-w-[80%] pl-1">
                              <div className="text-black-80 mb-1 w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium">
                                {elements?.team_name}
                              </div>

                              <div className="users-chip bg-gray-snow_drift text-blue-darker flex w-fit items-center gap-1 rounded-3xl px-2 py-1 text-xs font-medium leading-4">
                                <Image
                                  src="https://spyne-static.s3.amazonaws.com/console/icons/userDarkBlueIcon.svg"
                                  alt="user icon"
                                  height={17}
                                  width={17}
                                  className=""
                                />
                                {elements?.user_count}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="join-tag col-span-3 text-center">
                        <span className="text-blue-light text-sm font-medium opacity-0 transition-all duration-200 ease-in-out">
                          Join
                        </span>
                        <Image
                          className="float-right align-middle opacity-60 grayscale transition-all duration-200 ease-in-out"
                          src="https://spyne-static.s3.amazonaws.com/console/blue-right-caret.svg"
                          height={22}
                          width={22}
                          alt="right caret for button"
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
            {noDataToDisplay ? (
              <div className="p-4 text-center">
                <p>
                  This team could not be found, please check the name and try
                  again.
                </p>
              </div>
            ) : null}
          </ul>
        </div>
      </div>
    </>
  );
}
export default SelectTeam;
