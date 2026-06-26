import { connect, useDispatch, useSelector } from '@spyne-console/store';
import {
  resetAuth,
  resetEnterpriseTeam,
  updateEnterpriseTeamProperty,
  updateMobileDrawerProp,
} from '@spyne-console/store';
import { getPermissionObject } from '@spyne-console/utils';

import React, { useContext, useEffect, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { usePopper } from 'react-popper';
import { toast } from 'react-toastify';

import Image from 'next/image';
import Link from 'next/link';

import PropTypes, { element } from 'prop-types';

import { useRouting } from '@spyne-console/hooks';
import { useWindowSize } from '@spyne-console/hooks';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';
import {
  Logout,
  capitalizeUserName,
  dropDownOptions,
  fetchEnterpriseFeatures,
  localStorageKeys,
  sessionStorageKeys,
} from '@spyne-console/utils/config';

import HideSpyneContent from '../hoc/HideSpyneContent';
import BottomModal from '../mobile-views/BottomModal';

function UserProfileDropdown(props) {
  const { t } = props;
  const router = useRouting();
  const dispatch = useDispatch();
  const screenSize = useWindowSize();

  // const [userNameFromLocalStorage, setUserNameFromLocalStorage] = useState(localStorage.getItem(localStorageKeys?.USERNAME))
  const [currentPage, setCurrentPage] = useState();
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const enterpriseTeamReducer = useSelector(
    (state) => state.enterpriseTeamReducer
  );
  const mobileDrawer = useSelector((state) => state.mobileDrawer);
  const profileDropdownRef = useRef();
  // for virtual studio enterprise selection
  const [enterpriseSelection, setEnterpriseSelection] = useState([]);
  const [searchText, setSearchText] = useState('');
  const permissionObject = getPermissionObject();
  const userRole = permissionObject?.user_role?.role_name;
  const switchEnterpriseRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [enterpriseSelectionCopy, setEnterpriseSelectionCopy] = useState([]);
  const [showChangeEnterpriseButton, setShowChangeEnterpriseButton] =
    useState(true);
  //for virtual studion functions end

  const auth = useSelector((state) => state.authReducer);
  const [showAdminToolsModal, setShowAdminToolsModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [timerInterval, setTimerInterval] = useState(null);

  const handleDropdownClick = async (e, clickedBtn) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (clickedBtn === dropDownOptions.LOGOUT) {
        // console.log('logout click')
        await Logout({ skipBackendLogout: false }, screenSize);
        dispatch(resetAuth());
      } else if (clickedBtn === dropDownOptions.SWITCH_ENTERPRISE) {
        // console.log('switch enterprise')
        if (
          screenSize !== 'DESKTOP' &&
          router.asPath.includes('/virtualstudio/v2')
        ) {
          if (userRole === 'SPYNE_OWNER') {
            window.location.href = process.env.ADMIN_HOME_URL;
          } else {
            router.push('/enterprises');
          }
        } else if (
          screenSize !== 'DESKTOP' &&
          router.asPath.includes('/virtualstudio')
        ) {
          dispatch(
            updateMobileDrawerProp([
              { key: 'switchEnterpriseDrawer', value: true },
            ])
          );
        } else {
          if (userRole === 'SPYNE_OWNER') {
            window.location.href = process.env.ADMIN_HOME_URL;
          } else {
            router.push('/enterprises');
          }
        }
        sessionStorage.removeItem(sessionStorageKeys.selectedEnterprise);
        sessionStorage.removeItem(sessionStorageKeys.selectedTeam);
        // reset enterprise reducer
        dispatch(resetEnterpriseTeam());
      } else if (clickedBtn === dropDownOptions.ACCOUNT) {
        router.push({
          pathname: '/account',
          query: {
            selectedTab: 'profile', //default tab selected
            enterprise_id: enterpriseTeamReducer?.enterprise?.enterprise_id,
          },
        });
      } else if (clickedBtn === dropDownOptions.BILLING_AND_PLAN) {
        router.push({
          pathname: '/billing-and-payments',
          query: {
            enterprise_id: enterpriseTeamReducer?.enterprise?.enterprise_id,
            team_id: enterpriseTeamReducer?.selectedTeam?.team_id,
          },
        });
      } else if (clickedBtn === dropDownOptions.ADMIN_TOOLS) {
        setShowAdminToolsModal(true);
        setCountdown(5);

        // Start countdown timer
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleAdminToolsRedirect();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setTimerInterval(interval);
      } else if (clickedBtn === dropDownOptions.WHAT_S_NEW) {
        window.open('https://releases.spyne.ai', '_blank');
      }

      dispatch(
        updateMobileDrawerProp([{ key: 'profileDrawer', value: false }])
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdminToolsRedirect = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setShowAdminToolsModal(false);
    const adminUrl = 'https://admin.spyne.ai';
    const url = `${adminUrl}/admintools?selectedTab=home`;
    window.location.href = url;
  };

  const handleCloseModal = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setShowAdminToolsModal(false);
  };

  let [referenceElement, setReferenceElement] = useState(null);
  let [popperElement, setPopperElement] = useState(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
  });
  let dropdownRef = useRef();

  const handleBottomDrawer = () => {
    try {
      dispatch(updateMobileDrawerProp([{ key: 'profileDrawer', value: true }]));
    } catch (error) {
      console.log(error);
    }
  };
  // for virtual studio enterprise selection
  useEffect(() => {
    //only call when URL is virtual studio
    if (
      window.location.pathname.includes('virtualstudio') ||
      window.location.pathname.includes('enterprises/report') ||
      (!window.location.pathname.includes('enterprises') &&
        !localStorage.getItem(
          localStorageKeys?.countEnterpriseListIsGreaterThan1
        ))
    ) {
      getEnterpriseList();
    } else {
      const enterpriseCount = localStorage.getItem(
        localStorageKeys?.countEnterpriseListIsGreaterThan1
      )
        ? JSON.parse(
            localStorage.getItem(
              localStorageKeys?.countEnterpriseListIsGreaterThan1
            )
          )
        : 1;
      setShowChangeEnterpriseButton(enterpriseCount <= 1 ? false : true);
    }
  }, []);

  const getEnterpriseList = async () => {
    const enterpriseId = enterpriseTeamReducer?.enterprise?.enterprise_id;
    try {
      setIsLoading(true);
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/enterprise/get-enterprise-list`;
      const resp = await CentralAPIHandler.handleGetRequest(URL);
      if (resp?.data?.length) {
        setEnterpriseSelection([...resp?.data]);
        setEnterpriseSelectionCopy([...resp?.data]);
        setShowChangeEnterpriseButton(resp.data.length <= 1 ? false : true);
      }
    } catch (error) {
      toast(
        error?.response?.data?.message ||
          error?.message ||
          'Unknown error occurred',
        {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'error',
          position: 'bottom-center',
          pauseOnHover: true,
        }
      );
    }
    setIsLoading(false);
  };

  const handleEnterpriseSelection = async (e, enterpriseData = null) => {
    try {
      if (e) e.stopPropagation();
      if (!enterpriseData) return;
      let { enterprise_id, enterprise_name, spyne_assured, category_id } =
        enterpriseData;
      let enterpriseReduxUpdateObj = {
        enterprise_id,
        enterprise_name,
        spyne_assured,
        category_id,
      };
      dispatch(resetEnterpriseTeam());
      dispatch(
        updateEnterpriseTeamProperty([
          { key: 'enterprise', value: enterpriseReduxUpdateObj },
        ])
      );
      sessionStorage.setItem(
        sessionStorageKeys.selectedEnterprise,
        JSON.stringify(enterpriseReduxUpdateObj)
      );

      if (sessionStorage.getItem(sessionStorageKeys?.enterpriseFeatures)) {
        //this means there's already an entry and needs to be updated
        fetchEnterpriseFeatures(enterprise_id);
      }
      router.replace({
        pathname: '/virtualstudio',
        query: { enterprise_id: enterprise_id },
      });
      // router.push({ pathname: '/project', query: { 'enterprise_id': enterprise_id } });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(
        updateMobileDrawerProp([
          { key: 'switchEnterpriseDrawer', value: false },
        ])
      );
    }
  };
  const filterEnterpriseName = (e) => {
    try {
      setSearchText(e.target.value);
      const tempData = enterpriseSelectionCopy.filter((element) => {
        if (
          element?.enterprise_name &&
          (element?.enterprise_name)
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
        )
          return true;
        return false;
      });

      setEnterpriseSelection([...tempData]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setCurrentPage(window.location.pathname);
    if (window.location.pathname === '/enterprise-dashboard')
      setShowChangeEnterpriseButton(true);
    if (localStorage.getItem(localStorageKeys?.permissionObject)) {
      let permissionObject = JSON.parse(
        localStorage.getItem(localStorageKeys?.permissionObject)
      );
      setCurrentUserRole(permissionObject?.user_role?.role_name);
    }

    let outsideFocusHandler = (event) => {
      if (!dropdownRef?.current?.contains(event?.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', outsideFocusHandler);

    return () => {
      document.removeEventListener('mousedown', outsideFocusHandler);
    };
  }, []);

  useEffect(() => {
    //hook for outside focus handler
    if (!router.asPath.includes('/video')) {
      let outsideFocusHandler = (event) => {
        if (!profileDropdownRef?.current?.contains(event?.target)) {
          dispatch(
            updateMobileDrawerProp([{ key: 'profileDrawer', value: false }])
          );
        }
      };
      document.addEventListener('mousedown', outsideFocusHandler);

      return () => {
        document.removeEventListener('mousedown', outsideFocusHandler);
      };
    }
  }, [profileDropdownRef.current]);

  useEffect(() => {
    //hook for outside focus handler
    let outsideFocusHandler = (event) => {
      if (!switchEnterpriseRef?.current?.contains(event?.target)) {
        dispatch(
          updateMobileDrawerProp([
            { key: 'switchEnterpriseDrawer', value: false },
          ])
        );
      }
    };
    document.addEventListener('mousedown', outsideFocusHandler);

    return () => {
      document.removeEventListener('mousedown', outsideFocusHandler);
    };
  }, [switchEnterpriseRef.current]);
  const getTitleText = (title) => {
    let titleText = title;
    if (title == 'Account') {
      titleText = t('console.common.profileOptions.Account');
    } else if (title == 'Change Enterprise') {
      titleText = t('console.common.profileOptions.Change Enterprise');
    } else if (title == 'Billing & Plan') {
      titleText = t('console.common.profileOptions.Billing & Plan');
    } else if (title == 'Admin Tools') {
      titleText = t('console.common.profileOptions.Admin Tools');
    } else if (title == 'Log Out') {
      titleText = t('console.common.profileOptions.Log Out');
    } else if (title == "What's New") {
      titleText = t("console.common.profileOptions.What's New");
    }

    return titleText;
  };

  return (
    <>
      {/* for web view  */}
      <div
        className="ltb:block relative order-3 hidden rounded-full"
        ref={dropdownRef}
      >
        <div
          className="ltb:block hidden cursor-pointer motion-reduce:transition-none"
          id="dropdownMenuButton1ds"
          onClick={() => setShowDropdown(!showDropdown)}
          ref={setReferenceElement}
        >
          <div className="relative">
            <Image
              src={props?.logo}
              alt=""
              height={36}
              width={36}
              className="ltb:w-9 w-7 hover:opacity-80"
            />
          </div>
        </div>
        {showDropdown ? (
          <div
            className="dropdown-menu ltb:block absolute z-[1000] float-left m-0 mt-1 hidden !min-w-[350px] max-w-[550px!important] list-none rounded-lg bg-white bg-clip-padding text-left text-base shadow-lg"
            aria-labelledby="dropdownMenuButton1ds"
            // data-te-dropdown-menu-ref //for dropdown menu
            ref={setPopperElement}
            style={styles?.popper}
            {...attributes?.popper}
          >
            <div className="border-black-10 flex items-center gap-2 border-b sm:px-3.5 sm:py-4">
              <div className="ltb:w-14 relative">
                <Image
                  src={props?.logo}
                  alt=""
                  height={52}
                  width={52}
                  className="hover:opacity-80"
                />
                {/* <span className="active-pulse"></span> */}
              </div>
              <div className=" ">
                <h6 className="text-black-80 mb-1 block overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium capitalize leading-6">
                  {auth.userName}
                </h6>
                <h4 className="text-black-60 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium">
                  <div className="overflow-hidden text-ellipsis md:max-w-[145px]">
                    {auth?.emailId}
                  </div>
                  <HideSpyneContent>
                    <span className="bg-gray-lighter text-blue-darker rounded-lg px-2 py-1 leading-[18px]">
                      {currentUserRole}
                    </span>
                  </HideSpyneContent>{' '}
                </h4>
                {/* <p className='font-medium text-sm text-black-80 leading-6'>{props?.userType} <span className=' ml-3 text-xs text-blue-darker leading-[18px] font-medium bg-gray-lighter rounded-lg py-1 px-2'>{props?.teamName}</span></p> */}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              <div className="col-span-5">
                <ul className="user-profile-list">
                  {props?.data[
                    props.enterpriseCategory ||
                      enterpriseTeamReducer?.enterprise?.category_id ||
                      'ALL'
                  ]?.map((elements, indx) => {
                    if (
                      elements?.label === dropDownOptions.SWITCH_ENTERPRISE &&
                      !showChangeEnterpriseButton
                    )
                      return;
                    if (
                      elements?.label === dropDownOptions.WHAT_S_NEW &&
                      auth?.resellerData?.is_reseller
                    )
                      return;
                    return !elements.notAllowedPath.includes(currentPage) &&
                      (elements?.restrictedTo?.includes(currentUserRole) ||
                        elements.restrictedTo[0] === 'ALL') ? (
                      <li
                        key={indx}
                        onClick={(e) => {
                          handleDropdownClick(e, elements?.label);
                        }}
                        className="dropdown-item last:border-black-10 block w-full cursor-pointer whitespace-nowrap bg-transparent text-sm font-normal text-gray-700 last:border-t hover:bg-gray-100"
                      >
                        {elements?.icon && (
                          <Image
                            className="mr-2 inline"
                            src={elements?.icon}
                            height={18}
                            width={18}
                          />
                        )}
                        {console.log(elements?.text, 'okkkkkk')}
                        {getTitleText(elements?.text)}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="ltb:hidden block">
        {/* for mobile view  */}
        <div
          className="cursor-pointer motion-reduce:transition-none"
          id="dropdownMenuButton1ds"
          onClick={() => handleBottomDrawer()}
        >
          <div className="relative">
            <Image
              src={props?.logo}
              alt=""
              height={36}
              width={36}
              className="w-9"
            />
          </div>
        </div>

        {mobileDrawer?.profileDrawer ? (
          <BottomModal>
            <div
              className="dropdown-menu !border-0 !p-0 text-left text-base !shadow-none"
              ref={profileDropdownRef}
            >
              <div className="border-black-10 grid grid-cols-12 gap-2 border-b px-3.5 py-4">
                <div className="relative col-span-2 h-fit">
                  <Image
                    src={props?.logo}
                    alt=""
                    height={50}
                    width={50}
                    className="hover:opacity-80"
                  />
                </div>
                <div className="col-span-10 flex items-center">
                  <h6 className="text-black-80 overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium capitalize leading-6">
                    {auth.userName}
                  </h6>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1">
                <div className="col-span-5">
                  <ul className="user-profile-list pb-3">
                    {props?.data[
                      props.enterpriseCategory ||
                        enterpriseTeamReducer?.enterprise?.category_id
                    ]?.map((elements, indx) => {
                      if (
                        elements?.label === dropDownOptions.WHAT_S_NEW &&
                        auth?.resellerData?.is_reseller
                      )
                        return null;
                      return elements.notAllowedPath !== currentPage &&
                        (elements?.restrictedTo?.includes(currentUserRole) ||
                          elements.restrictedTo[0] === 'ALL') ? (
                        elements?.virtualStudioVisibiliy ? (
                          <li
                            key={indx}
                            onClick={(e) => {
                              handleDropdownClick(e, elements?.label);
                            }}
                            className="dropdown-item last:border-black-10 block w-full cursor-pointer whitespace-nowrap bg-transparent text-sm font-normal text-gray-700 last:border-t hover:bg-gray-100"
                          >
                            {elements?.icon && (
                              <Image
                                className="mr-2 inline"
                                src={elements?.icon}
                                height={18}
                                width={18}
                              />
                            )}
                            {getTitleText(elements?.text)}
                          </li>
                        ) : null
                      ) : null;
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </BottomModal>
        ) : null}
      </div>

      {/* for enterprise selection in mobile  */}
      {mobileDrawer?.switchEnterpriseDrawer && screenSize !== 'DESKTOP' ? (
        <BottomModal>
          <div className={'mt-2 place-items-center'} ref={switchEnterpriseRef}>
            <div className="">
              <h1 className="relative mb-3 text-2xl font-semibold text-black">
                Welcome,{' '}
                {isLoading ? (
                  <Skeleton classSTYLE={'rounded-lg mb-3'} />
                ) : (
                  capitalizeUserName(auth?.userName)
                )}
              </h1>
              <p className="text-black-60 relative mb-6 text-base font-normal leading-5">
                {' '}
                {isLoading ? (
                  <Skeleton classSTYLE={'rounded-lg mb-3 mt-3'} />
                ) : (
                  'Choose an Organization to continue'
                )}
              </p>
              <div className="px-3">
                {enterpriseSelection.length >= 8 || searchText.length ? (
                  <div className="shadow-5 border-black-8 bg-blue-10 mb-4 flex rounded-lg border px-3 py-2">
                    <Image
                      className="mr-2 cursor-pointer"
                      src="https://spyne-static.s3.amazonaws.com/console/filter/search.svg"
                      height={20}
                      width={20}
                    />
                    <input
                      type="text"
                      placeholder="Search Enterprise"
                      className="w-full bg-transparent"
                      value={searchText}
                      onChange={(e) => filterEnterpriseName(e)}
                    />
                  </div>
                ) : null}
                {enterpriseSelection.length >= 8 || searchText.length ? (
                  <div className="bg-black-10 mb-6 mt-1 h-[1px] w-[100%] rounded-sm"></div>
                ) : null}
              </div>
              <ul className="enterprise-list mb-3 max-h-[350px] gap-2 overflow-y-scroll px-3">
                {enterpriseSelection?.map((elements, indx) => {
                  return (
                    <li
                      onClick={(e) => handleEnterpriseSelection(e, elements)}
                      key={indx}
                      className={[
                        isLoading ? '' : 'border-blue-24',
                        'text-blue relative mb-2 cursor-pointer rounded-lg border py-3.5 pl-6 pr-4 text-left text-base font-medium leading-5',
                      ].join(' ')}
                    >
                      {isLoading ? (
                        <Skeleton classSTYLE={'rounded-lg left-0'} />
                      ) : (
                        <div>
                          {elements?.enterprise_name}
                          <span className="float-right align-middle">
                            <Image
                              className="inline-flex align-middle"
                              src="https://spyne-static.s3.amazonaws.com/console/project/right-caret.svg"
                              height={6}
                              width={6}
                              alt="right caret for button"
                            />
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </BottomModal>
      ) : null}

      {showAdminToolsModal && (
        <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/50">
          <div className="relative items-center rounded-xl bg-white p-6 text-center shadow-lg">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src="https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/5204985_Setup+1.png"
              height={186}
              width={150}
              alt="Setup illustration"
              className="mx-auto"
            />
            <div className="mb-8 mt-5">
              <h2 className="text-lg font-semibold text-black/90">
                Admin tools have a new home
              </h2>
              <p className="text-sm font-normal text-black/60">
                We'll be moving Admin tools to new URL <br />
                <Link
                  onClick={handleCloseModal}
                  href={`https://admin.spyne.ai/admintools?selectedTab=home`}
                  target="_blank"
                  className="text-[#3a00d0]"
                >
                  {'(admin.spyne.ai) '}
                </Link>
                by 12 June 2025.
              </p>
            </div>
            <button
              onClick={handleAdminToolsRedirect}
              className="w-[350px] rounded-md bg-[#4600F2] py-2 text-white transition-colors hover:bg-[#3a00d0]"
            >
              Redirecting ({countdown}s)
            </button>
          </div>
        </div>
      )}
    </>
  );
}

UserProfileDropdown.protoTypes = {
  logo: PropTypes.string,
  profileName: PropTypes.string,
  userType: PropTypes.string,
  teamName: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
};

export default UserProfileDropdown;
