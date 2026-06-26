/**
 * @format
 */
import {
  dateComponent,
  radioSort,
  sortComponent,
  sortingType,
} from '@spyne-console/common-config/enterprises';
import { useDispatch, useSelector } from '@spyne-console/store';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { usePopper } from 'react-popper';
import { toast } from 'react-toastify';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { v4 as uuid } from 'uuid';

import { useCurrentRoute } from '@spyne-console/hooks';

import {
  LOGIN_TYPES,
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

import modularStyles from '../../../styles/common/actionbar.module.css';
import CentralAPIHandler from '../../centralAPIHandler/centralAPIHandler';
import DatePicker from '../../common/date-picker/DatePicker';
import Skeleton from '../../common/skeleton&spinner/Skeleton';
import Spinner from '../../common/skeleton&spinner/Spinner';
import { useAuthActions } from '../../hooks/useAuthActions';
import { getDemoFlowType } from '../config';
import SignInSignUpContext from '../context';
import { ENTERPRISE_DATA } from './config';

function SelectEnterprise(props) {
  const { backCaret, xs_BackIcon, allowClose, source = 'browser' } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [enterpriseSelectionCopy, setEnterpriseSelectionCopy] = useState([]);
  const [noDataToDisplay, setNoDataToDisplay] = useState(false);
  const [activeCategoryType, setActiveCategoryType] = useState('cat_d8R14zUNE');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  let [referenceElement, setReferenceElement] = useState();
  let [popperElement, setPopperElement] = useState();
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
  });
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [date, setDate] = useState(dateComponent);
  const [sort, setSort] = useState(sortComponent);
  const [sortOn, setSortOn] = useState('created_at');
  const [sortType, setSortType] = useState('desc');
  const [entityDataCategoryWise, setEntityDataCategoryWise] = useState({});
  const {
    user: userData,
    setLoginType,
    SignInSpinner,
    userValidationInfo,
    teamSelectionData,
    setTeamSelectionData,
    setSelectedEnterprise,
    closeLogin,
    enterpriseDetails,
    setUser,
    signupSource,
    loginType,
    handleChangeLoginState,
    googleStrategy,
  } = useContext(SignInSignUpContext);
  const { mainRoute, childRoute } = useCurrentRoute();
  const [originalList, setOriginalList] = useState(
    userValidationInfo?.enterpriseData
  );

  const dropdownRef = useRef(null);

  const router = useRouter();
  const { auth, updateAuthProp, resetAuth, updateAuthDetailsInRedux } =
    useAuthActions();
  const queryParam = Object.keys(router.query)[0];
  useEffect(() => {
    getEnterpriseMeta(originalList);
    captureEvent(
      'select_enterprise_screen',
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
  }, []);
  useEffect(() => {
    filterData(originalList);
  }, [sortType, sortOn]);

  const getEnterpriseMeta = async (data) => {
    let tempList = data;
    let enterprises = [];
    tempList.forEach((element) => {
      enterprises.push(element.enterprise_id);
    });
    let URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/enterprise/get-sku-counts?enterprise_ids=${enterprises.join(',')}`;
    let resp = await CentralAPIHandler.handleGetRequest(URL);
    if (resp.data.length) {
      const map1 = resp.data.reduce(
        (acc, item) => ({ ...acc, [item.enterprise_id]: item }),
        {}
      );
      const map2 = originalList?.reduce(
        (acc, item) => ({ ...acc, [item.enterprise_id]: item }),
        {}
      );
      const mergedList = Object.keys(map2).map((enterprise_id) => {
        const mergedItem = { ...map2[enterprise_id] };
        if (map1[enterprise_id]) {
          mergedItem.sku_count = map1[enterprise_id].sku_count;
        } else {
          mergedItem.sku_count = 0;
        }
        return mergedItem;
      });
      setOriginalList(mergedList);
      filterData(mergedList);
    }
  };
  const filterData = (data) => {
    let tempList = data;
    let sortedData;
    if (sortType === 'asc') {
      if (sortOn === 'sku_count' || sortOn === 'user_count') {
        sortedData = tempList.sort((a, b) => a[sortOn] - b[sortOn]);
      } else if (sortOn === 'name') {
        sortedData = tempList.sort((a, b) =>
          a.enterprise_name.localeCompare(b.enterprise_name)
        );
      } else {
        sortedData = tempList.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      }
    } else {
      if (sortOn === 'sku_count' || sortOn === 'user_count') {
        sortedData = tempList.sort((a, b) => b[sortOn] - a[sortOn]);
      } else if (sortOn === 'name') {
        sortedData = tempList.sort((a, b) =>
          b.enterprise_name.localeCompare(a.enterprise_name)
        );
      } else {
        sortedData = tempList.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      }
    }

    let tempCategoriesData = {
      cat_d8R14zUNE: [],
      cat_Ujt0kuFxY: [],
      cat_Ujt0kuFxF: [],
    };
    for (let i = 0; i < sortedData?.length; i++) {
      let element = sortedData[i];
      if (element.category_id === 'cat_d8R14zUNE') {
        tempCategoriesData.cat_d8R14zUNE.push(element);
      } else if (element.category_id === 'cat_Ujt0kuFxY') {
        tempCategoriesData.cat_Ujt0kuFxY.push(element);
      } else if (element.category_id === 'cat_Ujt0kuFxF') {
        tempCategoriesData.cat_Ujt0kuFxF.push(element);
      }
    }
    setEntityDataCategoryWise(tempCategoriesData);
    setEnterpriseSelectionCopy(tempCategoriesData);
  };

  const handleOpen = (key) => {
    setIsDropdownActive((e) => !e);
    if (key === 'date') {
      setDate({ ...date, active: true });
      setSort({ ...sort, active: false });
    } else {
      setDate({ ...date, active: false });
      setSort({ ...sort, active: true });
    }
  };
  const handleFilterCall = () => {
    let queryParams = new URLSearchParams(window.location.search);
    let date = queryParams.get('created_on');
    if (date) {
      date = date.slice(1, -1).split(',');
      let startDate = new Date(date[0]);
      let endDate = new Date(date[1]);
      const filteredData = originalList.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate && itemDate <= endDate;
      });
      filterData(filteredData);
    }
  };

  const handleEnterpriseSelection = async (e, enterpriseData = null) => {
    try {
      setIsLoading(true);
      if (e) e.stopPropagation();
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/enterprise/get-enterprise-teams`;
      const resp = await CentralAPIHandler.handleGetRequest(URL, {
        enterpriseId: enterpriseData?.enterprise_id,
      });
      setSelectedEnterprise({
        enterprise_id: enterpriseData?.enterprise_id,
        enterprise_name: enterpriseData?.enterprise_name,
        api_key: resp?.data?.enterpriseDetails?.api_key,
        category_id: enterpriseData?.category_id,
      });
      setTeamSelectionData([...resp?.data?.teamDetails]);
      captureEvent(
        'enterprise_joined',
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
      if (resp?.data?.teamDetails?.length === 1) {
        signupAndHome(
          resp?.data?.teamDetails[0],
          enterpriseData,
          resp?.data?.enterpriseDetails?.api_key
        );
      } else {
        updateAuthProp([
          {
            key: 'previousState',
            value: {
              ...auth?.previousState,
              [LOGIN_TYPES.SELECT_TEAM]: loginType,
            },
          },
        ]);
        setLoginType(LOGIN_TYPES?.SELECT_TEAM);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const filterEnterpriseName = (e) => {
    try {
      setNoDataToDisplay(false);
      setSearchText(e.target.value);
      const tempData = enterpriseSelectionCopy[activeCategoryType].filter(
        (element) => {
          if (
            element?.enterprise_name &&
            (element?.enterprise_name)
              .toLowerCase()
              .includes(e.target.value.toLowerCase())
          )
            return true;
          return false;
        }
      );
      if (tempData.length === 0) {
        setNoDataToDisplay(true);
      }
      setEntityDataCategoryWise({
        ...enterpriseSelectionCopy,
        [activeCategoryType]: tempData,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const signupAndHome = async (teamData, enterpriseData, apiKey) => {
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
        apiKey: apiKey,
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
        enterprise_id: enterpriseData?.enterprise_id,
        enterprise_name: enterpriseData?.enterprise_name,
        team_id: teamData?.team_id,
        team_name: teamData?.team_name,
        user_name: resp?.data?.userData?.name,
        email_id: resp?.data?.userData?.emailId || user?.emailId,
        user_role:
          resp?.data?.permissionObject[enterpriseData?.enterprise_id][
            teamData?.team_id
          ]?.alias,
        authKey: resp?.data?.authKey,
        deviceId: deviceId,
      };

      if (Object.keys(resp?.data || {}).length > 0) {
        localStorage.setItem(localStorageKeys?.AUTHKEY, resp?.data?.authKey);

        let defaultEnterpriseObj = {
          enterpriseId: enterpriseData?.enterprise_id,
          name: enterpriseData?.enterprise_name,
          apiKey: apiKey,
          category_id: enterpriseData?.category_id,
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
          enterpriseData?.enterprise_id
        );

        let newBearerToken = base64Payload({ payload: payloadForApp });
        if (
          guestLogin &&
          window?.location?.pathname?.includes('/virtualstudio')
        ) {
          router.replace({
            query: { enterprise_id: enterpriseData?.enterprise_id },
          });
        } else {
          let userEmail = payload?.emailId,
            defaultEnterprise = enterpriseData?.enterprise_id;
          const { skip: skipEnterpriseSelection, enterprise_id } =
            skipEnterpriseSelectionPage(userEmail, defaultEnterprise);
          if (signupSource === 'console' && skipEnterpriseSelection) {
            // router.push({ pathname: "/home", query: { "enterprise_id": enterpriseData?.enterprise_id } })
            checkCategoryAndRedirect(
              router,
              enterpriseData?.category_id,
              enterpriseData?.enterprise_id
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

  const handleCreate = () => {
    updateAuthProp([
      {
        key: 'previousState',
        value: {
          ...auth?.previousState,
          [LOGIN_TYPES.CREATE_ENTERPRISE]: loginType,
        },
      },
    ]);
    setLoginType(LOGIN_TYPES?.CREATE_ENTERPRISE);
    captureEvent(
      'welcome_back_create_enterprise',
      {
        parent_screen_name: mainRoute,
        child_screen_name: childRoute ?? mainRoute,
        event_type: 'click',
      },
      true
    );
    let cleverTapPayload = {
      status: 'New enterprise created',
      source: signupSource,
      category: enterpriseDetails?.category,
      user_email: userData?.emailId,
    };
    // if (userData && userData?.emailId && !userData?.emailId.includes("@spyne.ai")) {
    //     ClevertapReact.event("auth_signup_new_enterprise_clicked", cleverTapPayload)
    // }
  };

  const handleActiveCategoryTab = (prodCatId) => {
    try {
      if (prodCatId !== activeCategoryType) {
        setActiveCategoryType(prodCatId);
        setSearchText('');
        setEntityDataCategoryWise(enterpriseSelectionCopy);
        setNoDataToDisplay(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleClearAll = async () => {
    await upsertQueryParams({
      variable: 'created_on',
      deleteVariable: true,
      router,
    });
    setSearchText('');
    setSortOn('created_at');
    setSortType('desc');
  };
  return (
    <SignInSignUpContext.Provider
      value={{ teamSelectionData, setTeamSelectionData }}
    >
      {/* {xs_BackIcon && <Image className="h-4 w-auto cursor-pointer tb:hidden block absolute top-10 left-7" src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg" height={18} width={18} onClick={handleChangeLoginState} />} */}

      <div
        className={[
          entityDataCategoryWise[activeCategoryType]?.length >= 8 ||
          searchText?.length
            ? 'pt-0'
            : 'place-items-center',
          'col-span-4 grid h-full',
        ].join(' ')}
      >
        <div
          className={[
            entityDataCategoryWise[activeCategoryType]?.length >= 8 ||
            searchText?.length
              ? ''
              : '',
            'relative w-full overflow-y-scroll py-4',
          ].join(' ')}
        >
          <h1 className="text-black-80 flex items-center justify-between gap-2 text-2xl font-bold">
            <div className="text-blue_purple flex items-center gap-2">
              {
                <Image
                  className="h-4 w-auto cursor-pointer"
                  src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                  height={16}
                  width={16}
                  onClick={handleChangeLoginState}
                />
              }
              Welcome back
            </div>
            {/* {allowClose && <Image src="https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg" width={24} height={24} alt="close" className="flex cursor-pointer items-center" onClick={() => closeLogin()} />} */}
          </h1>
          <p className="text-black-60 relative mb-2 text-sm font-normal">
            {' '}
            {isLoading ? (
              <Skeleton
                classSTYLE={'min-h-[20px] w-full rounded-lg mb-3 mt-3'}
              />
            ) : (
              'Choose an enterprise to continue'
            )}
          </p>

          <div className="text-black-60 border-blue-8 bg-blue-4 tb:block relative mb-8 flex w-full items-center rounded-lg border px-2.5 py-3 text-sm font-normal">
            Enterprises for&nbsp;
            <strong className="tb:inline tb:w-auto contents w-full font-semibold">
              {' '}
              {userData?.emailId.length > 20
                ? `${userData?.emailId.slice(0, 25)}...`
                : userData?.emailId}
            </strong>
            <span
              className="text-blue-light float-right ml-1 cursor-pointer text-sm font-medium"
              onClick={() => {
                setLoginType(LOGIN_TYPES?.EMAIL);
                captureEvent(
                  'welcome_back_change',
                  {
                    parent_screen_name: mainRoute,
                    child_screen_name: childRoute ?? mainRoute,
                    event_type: 'click',
                  },
                  true
                );
              }}
            >
              Change
            </span>
          </div>

          {/* {originalList?.length >= 4 || searchText?.length ? (
                        <>
                                <div className=" mb-4 flex rounded-lg border border-black-10 py-[11px] px-4 box-border">
                                    <input type="text" placeholder="Search Enterprises" className="w-full bg-transparent" value={searchText} onChange={e => filterEnterpriseName(e)} />
                                    <Image className="ml-2 cursor-pointer grayscale opacity-70" alt="search-icon" src="https://spyne-static.s3.amazonaws.com/console/filter/searchIcon.svg" height={24} width={24} />
                                </div>
                            <p className="relative mb-2 text-sm font-normal text-black-60"> No. of enterprise {entityDataCategoryWise?.[activeCategoryType]?.length}</p>
                        </>
                    ) : null} */}
          {/* {enterpriseSelection?.length >= 5 || searchText?.length ? <div className="mb-4 mt-1 h-[1px] w-[100%] rounded-sm bg-black-10"></div> : null} */}

          {/* <div className=" mb-5 tb:grid-cols-6 gap-2 tb:gap-x-3 tb:grid flex justify-between">
                        {CREATE_ENTERPRISE_DATA?.businessTypeData?.map((item, indx) => {
                            return (
                                <div key={item.key} className={`flex items-center justify-center gap-1 rounded-lg border px-0.5 py-1 xs:px-1.5 tb:px-1 xs:py-3 xs:text-sm text-xs  cursor-pointer opacity-100"  ${item?.cols} ${item?.key === activeCategoryType ? "border-blue-light border-[1.4px] bg-blue-4 text-blue-light font-medium" : "font-normal border-black-10 bg-transparent text-black-80"}`} onClick={() => handleActiveCategoryTab(item.key)}>
                                    <Image src={item?.icon} width={24} height={24} alt={item?.alt} className={`${item?.key === activeCategoryType ? "grayscale-0" : "grayscale-[80%]"}`} />
                                    <span>{item?.text}</span>
                                </div>
                            )
                        })}
                    </div> */}
          <ul
            className={[
              entityDataCategoryWise[activeCategoryType]?.length > 0 ||
              searchText?.length
                ? 'h-[27vh] md:h-[35vh] 2xl:h-[50vh]'
                : 'max-h-[30vh] md:max-h-[42vh] 2xl:max-h-[50vh]',
              'enterprise-list border-black-10 gap-2 overflow-y-scroll rounded-lg border',
            ].join(' ')}
          >
            {entityDataCategoryWise[activeCategoryType]?.map(
              (elements, indx) => {
                const initial = elements?.enterprise_name
                  ? elements?.enterprise_name.charAt(0).toUpperCase()
                  : null;

                return (
                  <li
                    onClick={
                      isLoading
                        ? null
                        : (e) => handleEnterpriseSelection(e, elements)
                    }
                    key={indx}
                    className={[
                      isLoading
                        ? 'pointer-events-none min-h-[4.25rem] opacity-50'
                        : '',
                      'text-blue relative cursor-pointer px-3 py-2.5 text-sm font-medium leading-5 last:mb-0 md:px-4 md:py-3 md:text-base',
                    ].join(' ')}
                  >
                    {isLoading ? (
                      <Skeleton
                        classSTYLE={
                          'rounded-lg left-0 border-b-2 border-white '
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-12 items-center justify-between gap-x-2">
                        <div className="col-span-9">
                          <div className="grid grid-cols-12 items-center gap-4">
                            <div className="col-span-12 flex gap-4">
                              <div className="bg-blue-8 text-black-60 flex h-12 w-12 items-center justify-center rounded-full text-xl font-medium md:h-[3.25rem] md:w-[3.25rem] md:text-xl">
                                {initial}
                              </div>

                              <div className="max-w-[80%] pl-1">
                                <div className="text-black-80 mb-1 w-full overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium">
                                  {elements?.enterprise_name}
                                </div>
                                <div className="flex gap-1">
                                  {/* <div className={[`${elements?.category_id}-banner`, "flex w-fit items-center rounded-3xl px-2 py-1 text-xs font-medium"].join(" ")}>{prodCatIdMapping[elements?.category_id]}</div> */}
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
                                  <div className="users-chip bg-gray-snow_drift text-blue-darker flex w-fit items-center gap-1 rounded-3xl px-2 py-1 text-xs font-medium leading-4">
                                    <Image
                                      src="https://spyne-static.s3.amazonaws.com/console/project/sidebar/projects_inactive.svg"
                                      alt="user icon"
                                      height={17}
                                      width={17}
                                      className=""
                                    />
                                    {elements?.sku_count}
                                  </div>
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
              }
            )}
            {noDataToDisplay ? (
              <div className="tb:px-16 p-4 text-center">
                <p>{ENTERPRISE_DATA?.notFound}</p>
              </div>
            ) : null}
            {enterpriseSelectionCopy[activeCategoryType]?.length === 0 ? (
              <div className="tb:px-16 p-4 text-center">
                <p>No Enterprise Available for selected Category!</p>
              </div>
            ) : null}
          </ul>

          <div className="absolute bottom-3 w-full bg-white">
            <p className="border-black-20 text-black-60 my-6 border-t text-center text-xs font-normal leading-[0]">
              <span className="bg-white px-3">
                {ENTERPRISE_DATA?.orSeparatorText}
              </span>
            </p>
            <button
              className={[
                SignInSpinner ? 'pointer-events-none' : '',
                'secondary-btn block h-11 w-full items-center !py-1.5',
              ].join(' ')}
              disabled={SignInSpinner ? true : false}
              onClick={handleCreate}
            >
              {SignInSpinner ? (
                <Spinner
                  type="LIGHT"
                  style_CLASS={'justify-center w-full h-full item-center flex'}
                />
              ) : (
                ENTERPRISE_DATA?.createEntText
              )}
            </button>
          </div>
        </div>
      </div>
    </SignInSignUpContext.Provider>
  );
}
export default SelectEnterprise;
