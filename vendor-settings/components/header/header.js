'use client';

import { animated, useSpring } from '@react-spring/web';
import {
  HOME_CONTENT,
  getCreditCountBasedOnRoute,
} from '@spyne-console/common-config/home';
import { LOGIN_DATA } from '@spyne-console/common-config/login';
import {
  setEnterpriseStage,
  setShowDeductCreditAnimation,
  setShowNewInventoryUi,
  setUpgradeNowModal,
  updateCredit,
  updateDemoVideoId,
  updateEnterpriseTeamProperty,
  updateIsInsideDemo,
  updateV5Credit,
  updateVirtualStudioProperty,
  useDispatch,
} from '@spyne-console/store';

import { useEffect, useRef, useState } from 'react';
import { IoMdCalendar } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { useRouting } from '@spyne-console/hooks';
import { useWindowSize } from '@spyne-console/hooks';
import { useCurrentRoute } from '@spyne-console/hooks';
import { useOnClickOutside } from '@spyne-console/hooks';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';
import { cn } from '@spyne-console/utils/cn';
import { GetPermissionClientObject } from '@spyne-console/utils/permissionClientObject';

import HideSpyneContent from '../hoc/HideSpyneContent';
import UserProfileDropdown from '../profile/UserProfileDropdown';
import styles from '../styles/common/header.module.css';
import SVG from '../svg/SVG';
import {
  HeaderSrc,
  captureEvent,
  formatNumber,
  generateBearerToken,
  getPermissionObject,
  guestEnterprise,
  localStorageKeys,
  sessionStorageKeys,
} from '../utils/config';
import HeaderTeamsDropdown from './HeaderTeamsDropdown';
import {
  HeaderProfileContent,
  profileData,
  virtualDataWhenUrl,
  websiteBuilderWhenUrl,
} from './headerConstant';
import HelpAndSupport from './helpAndSupport';
// import useFreshworksWidget from "../../../apps/console/pages/useFreshworksWidget"
import useFreshworksWidget from './useFreshworksWidget';
import { getListOfValuesFromQueryParam } from './utils';
import { getDemoFlowType } from './virtualStudioConfig';
import WebsiteDropdown from './website-dropdown';

const HeaderCredits = dynamic(() => import('./header-credits'), { ssr: false });

function Header({
  showSideNavbar,
  setShowSideNavbar,
  enterpriseData,
  setReRenderSidebar,
  reRenderSidebar,
  triggerLogin,
  profileDrawer,
  teamHeaderDrawer,
  switchEnterpriseDrawer,
  profileMenuClass,
  openUnlockVideoPopup,
  showTrialBanner,
  setShowTrialBanner,
  requestExists,
  home = false,
  // New props from useSelector
  enterpriseTeamReducer,
  authReducer,
  imageList,
  showDeductCreditAnimation,
  hideCreditButtonTemporary,
  enterpriseStage,
  credits,
  showCalendar,
  isInsideDemo,
  isImagesEnabled,
  is360Enabled,
  isVideoTourEnabled,
  t,
}) {
  const [teamsData, setTeamsData] = useState([]);
  const [showHelpAndSupport, setShowHelpAndSupport] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const ENTERPRISE_ID_KEY = 'enterprise_id';
  const dispatch = useDispatch();
  const router = useRouting();
  const { query } = router;
  const hasActiveSubTab = Boolean(query?.activeSubTab);
  const screenSize = useWindowSize();
  const { mainRoute, childRoute } = useCurrentRoute();
  let profileDropdownRef = useRef();
  let creditsDropdownRef = useRef(null);

  const isSpyneOrLocalhost =
    typeof window !== 'undefined' &&
    (window.location?.hostname?.toLowerCase().includes('spyne') ||
      window.location?.hostname === 'localhost');

  // Call the hook at the top level
  const freshworksWidget = useFreshworksWidget(router, showHelpAndSupport);

  const openHelpAndSupport = () => {
    setShowHelpAndSupport(!showHelpAndSupport);
  };
  const { UpgradeNowModalOpen } = useSelector(
    (state) => state.virttualStudioReducer
  );

  const defaultTriggerLogin = () => {
    router.push('/login');
  };
  const selectedEnterprise = JSON.parse(
    sessionStorage.getItem(sessionStorageKeys.selectedEnterprise)
  );
  const enterpriseId = selectedEnterprise?.enterprise_id;
  const vsversion = JSON.parse(
    localStorage.getItem(localStorageKeys.vsVersion)
  )?.[enterpriseId];
  const queryParams = new URLSearchParams(window.location.search);
  const teamId = queryParams.get('team_id')
    ? queryParams.get('team_id').includes('[')
      ? getListOfValuesFromQueryParam(queryParams.get('team_id'))?.[0]
      : queryParams.get('team_id')
    : null;
  const enterprise_id =
    router.query['enterprise_id'] ||
    enterpriseTeamReducer?.enterprise?.enterprise_id;
  const inventoryVersion = localStorage.getItem('inventory_version');
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const { activeSubTab, product } = router.query;
  const [enterpriseCategory, setEnterpriseCategory] = useState(null);
  const [showCreditsDropdown, setShowCreditsDropdown] = useState(false);
  const [creditsDropdown, setCreditsDropdown] = useState(false);
  const [showCredits, setShowCredits] = useState(true);
  const userData = localStorage.getItem('userDetails')
    ? JSON.parse(localStorage.getItem('userDetails'))
    : null;
  const [showCreditsVehicle, setShowCreditsVehicle] = useState(false);
  const [enterprisePermission, setEnterprisePermission] = useState('');
  const { creditCount, showUpgradeNowBtn } = getCreditCountBasedOnRoute(
    currentPageUrl,
    credits,
    activeSubTab,
    product
  );
  useOnClickOutside(creditsDropdownRef, () => setCreditsDropdown(false));
  const hasEnterpriseCreditsPermission = GetPermissionClientObject(
    'VIEW_ENTERPRISE_CREDITS'
  ).status;
  const [showWebsiteDropdown, setShowWebsiteDropdown] = useState(false);

  const openPricingModal = (e) => {
    e.stopPropagation();
    dispatch(setUpgradeNowModal(true));
    setCreditsDropdown(false);
  };
  const closeCreditDropDown = (e) => {
    e.stopPropagation();

    setCreditsDropdown(!creditsDropdown);
  };
  const getVSVersion = async (enterpriseId) => {
    try {
      let existingVsVersion = localStorage?.getItem(
        localStorageKeys?.vsVersion
      );
      let vsVersionObj = existingVsVersion ? JSON.parse(existingVsVersion) : {};

      const url = `${process.env.APP_BACKEND_BASEURL}/media-configs/v1/enterprise/version`;
      const response = await CentralAPIHandler.handleGetRequest(url, {
        enterpriseId: enterpriseId,
        // attributes: 'version',
      });

      if (!response?.version || !response?.inventoryVersion) {
        throw new Error('Version information not found in response');
      }

      // Store version
      vsVersionObj[enterpriseId] = response.version;
      localStorage?.setItem(
        localStorageKeys?.vsVersion,
        JSON.stringify(vsVersionObj)
      );

      // Store inventory version in localStorage (simple key)
      const inventoryVersion = String(response.inventoryVersion || '');
      localStorage?.setItem('inventory_version', inventoryVersion);
      dispatch(setShowNewInventoryUi(inventoryVersion === 'v4'));

      // Store inventory version in sessionStorage (tab-specific)
      sessionStorage?.setItem(
        sessionStorageKeys.inventory_version,
        inventoryVersion
      );

      // Set cookie (expires in 7 days) - keep for backward compatibility
      document.cookie = `inventory_version=${inventoryVersion}; path=/; max-age=${24 * 60 * 60}`;

      // Set enterprise-specific cookie for middleware
      if (enterpriseId) {
        document.cookie = `inventory_version${enterpriseId}=${inventoryVersion}; path=/; max-age=${24 * 60 * 60}`;
      }
    } catch (error) {
      console.error('Error fetching VS version:', error);
    }
  };

  const creditsInfo = [
    {
      label: 'enterprise_wallet',
      title: 'Available Credits in Enterprise Wallet',
      icon: 'https://spyne-static.s3.amazonaws.com/console/icons/piggy-icon.svg',
      value: credits?.available_credits ?? 0,
    },
    {
      label: 'teamWallet',
      title: 'Available Credits in Team Wallet',
      icon: 'https://spyne-static.s3.amazonaws.com/console/icons/bank-icon.svg',
      value: credits?.teamWallet?.available_credits ?? 0,
    },
  ];
  const freeCreditsInfo = [
    {
      product: 'Images',
      title: 'Vehicles Left',
      icon: 'https://spyne-prod-video.s3.amazonaws.com/static/website/2024-08-20/gallery.svg',
      value: credits?.image_credit ?? 0,
    },
    {
      product: '360 spin',
      title: 'Vehicles Left',
      icon: 'https://spyne-prod-video.s3.amazonaws.com/static/website/2024-08-20/360.svg',
      value: credits?.['360_credit'] ?? 0,
    },
    {
      product: 'Video tour',
      title: 'Vehicles Left',
      icon: 'https://spyne-prod-video.s3.amazonaws.com/static/website/2024-08-20/video.svg',
      value: credits?.video_credit ?? 0,
    },
  ];

  useEffect(() => {
    if (enterpriseId) {
      getVSVersion(enterpriseId);
    }
  }, [vsversion, enterpriseId]);

  //doing it as per customer success team requirement
  useEffect(() => {
    if (!userData) {
      defaultTriggerLogin();
    }
  }, [userData]);

  useEffect(() => {
    /**
     * this is done to make sure all the things to render are there
     *
     * usecase: login button was seen when page was hard-refreshed
     * as redux was empty
     */
    // Delay in milliseconds
    const delay = 800;
    setTimeout(function () {
      const divElement = document.getElementById('headerRightContent');
      if (divElement) {
        divElement.style.display = 'flex'; // Make the div visible
      }
    }, delay);

    let permissionObject = getPermissionObject();
    let selectedEnterprise = JSON.parse(
      sessionStorage.getItem(sessionStorageKeys.selectedEnterprise)
    );
    let enterprise_id = selectedEnterprise?.enterprise_id;
    let enterprise_role_name =
      permissionObject[enterprise_id]?.enterprise_role?.role_name;
    let user_role_name = permissionObject?.user_role?.role_name;
    if (user_role_name && hasEnterpriseCreditsPermission) {
      enterprise_role_name = 'VIEW_ENTERPRISE_CREDITS';
    }
    setEnterprisePermission(enterprise_role_name);
  }, []);

  useEffect(() => {
    setCurrentPageUrl(window.location.pathname);
    //fetch team data
    renderTeamDropdown();
    //hook for outside focus handler
    let outsideFocusHandler = (event) => {
      if (!profileDropdownRef?.current?.contains(event?.target)) {
        setShowProfileDropdown(false);
      }
      if (!creditsDropdownRef?.current?.contains(event?.target)) {
        setShowCreditsDropdown(false);
      }
    };
    document.addEventListener('mousedown', outsideFocusHandler);
    return () => {
      document.removeEventListener('mousedown', outsideFocusHandler);
    };
  }, [authReducer?.defaultEnterprise?.enterpriseId]);

  useEffect(() => {
    if (screenSize !== 'DESKTOP') {
      fetchTeamsData();
    }
  }, [enterpriseTeamReducer?.enterprise]);
  useEffect(() => {
    if (
      authReducer?.loggedIn &&
      enterpriseId &&
      teamId &&
      enterpriseId !== guestEnterprise?.enterpriseID
    ) {
      fetchCredits(vsversion, enterpriseId, teamId);
    }
  }, [authReducer?.loggedIn, vsversion, enterprise_id, teamId]);

  const websiteLink = useSelector(
    (state) => state.enterpriseTeamReducer?.selectedTeam?.website_link
  );
  const spyneWebsiteLink = useSelector(
    (state) => state.enterpriseTeamReducer?.selectedTeam?.spyne_website_link
  );

  useEffect(() => {
    const hasWebsiteLink = !!websiteLink || !!spyneWebsiteLink;
    const hasTeams = teamsData?.length > 0;
    setShowWebsiteDropdown(hasWebsiteLink && hasTeams);
  }, [websiteLink, spyneWebsiteLink, teamsData?.length]);

  useEffect(() => {
    const dontShowCreditsIn = ['/enterprises', '/enterprise-dashboard'];
    if (dontShowCreditsIn.includes(window.location.pathname)) {
      setShowCredits(false);
    }
  }, [window.location.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isImagesEnabled || !is360Enabled || !isVideoTourEnabled) {
        if (setShowTrialBanner) {
          setShowTrialBanner(true);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isImagesEnabled, is360Enabled, isVideoTourEnabled]);

  const renderTeamDropdown = () => {
    try {
      let page = window.location.pathname;
      const dontShowTeamsIn = ['/enterprises', '/enterprise-dashboard'];
      if (!dontShowTeamsIn.includes(page)) {
        fetchTeamsData();
      }
    } catch (error) {
      // // console.log(error)
    }
  };
  const fetchTeamsData = async () => {
    try {
      //if enterprise is Selected then only fetch
      // if(!enterpriseData?.enterprise_id)return;
      let teams = enterpriseTeamReducer?.teams;
      if (Object.keys(teams).length > 0) {
        setTeamsData(teams);
      } else {
        let queryParams = new URLSearchParams(window.location.search);
        let enterpriseId =
          queryParams.get(ENTERPRISE_ID_KEY) ||
          enterpriseData?.enterprise_id ||
          enterpriseTeamReducer?.enterprise?.enterprise_id ||
          authReducer?.defaultEnterprise?.enterpriseId;
        if (!enterpriseId) return;

        let currentlySelectedTeam;
        let teamIdFromURL = queryParams.get('team_id'); // giving priority to url team_id
        if (teamIdFromURL) {
          teamIdFromURL = teamIdFromURL.replace(/(\[|\])/gim, '');
          currentlySelectedTeam = {
            team_id: teamIdFromURL,
          };
        } else {
          let sessionTeamId = sessionStorage.getItem(
            sessionStorageKeys.selectedTeam
          );
          currentlySelectedTeam = JSON.parse(sessionTeamId);
        }

        const url = `${process.env.APP_BACKEND_BASEURL}/console/v1/enterprise/get-team-list`;
        const response = await CentralAPIHandler.handleGetRequest(url, {
          enterpriseId: enterpriseId,
        });
        const teamDetails = response?.data?.teamDetails
          ? response.data.teamDetails
          : [];
        const enterpriseDetails = response?.data?.entepriseDetails
          ? {
              enterprise_id: enterpriseId,
              enterprise_name: response.data.entepriseDetails?.name || '',
              category: response.data.entepriseDetails?.category || '',
              category_id: response?.data?.entepriseDetails?.category_id || '',
            }
          : {
              enterprise_id: enterpriseId,
              enterprise_name: '',
              category: '',
              category_id: '',
            };
        let data = {};
        let defaultObj = {};
        let prevSelectedTeam = {}; // this is made to sync changes with page refresh
        let doesPreviouslySelectedTeamExist = false;
        let teamConfigAvailable = response.data?.teamConfigAvailable
          ? true
          : false;
        teamDetails.forEach((element) => {
          data[element.team_id] = element;
          if (element.is_default === true) {
            defaultObj = { ...element };
          }
          if (
            currentlySelectedTeam &&
            currentlySelectedTeam?.team_id &&
            currentlySelectedTeam.team_id === element.team_id
          ) {
            prevSelectedTeam = { ...element };
            doesPreviouslySelectedTeamExist = true;
          }
        });
        dispatch(
          updateEnterpriseTeamProperty([
            { key: 'teams', value: Object.values(data) },
            {
              key: 'selectedTeam',
              value: doesPreviouslySelectedTeamExist
                ? prevSelectedTeam
                : defaultObj,
            },
            { key: 'enterprise', value: { ...enterpriseDetails } },
            { key: 'defaultTeam', value: defaultObj },
            { key: 'teamConfigAvailable', value: teamConfigAvailable },
          ])
        );
        setEnterpriseCategory(response?.data?.entepriseDetails?.category_id);
        dispatch(setEnterpriseStage(response?.data?.entepriseDetails?.stage));

        sessionStorage.setItem(
          sessionStorageKeys.teamList,
          JSON.stringify(data)
        );
        sessionStorage.setItem(
          sessionStorageKeys.selectedTeam,
          JSON.stringify(
            doesPreviouslySelectedTeamExist ? prevSelectedTeam : defaultObj
          )
        );
        setTeamsData(teamDetails);
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
  };
  const fetchCredits = async (vsversion, enterpriseId, teamId) => {
    try {
      if (vsversion === 'v2') {
        fetchV5Credits(enterpriseId, teamId);
      } else {
        fetchV4Credits(enterpriseId, teamId);
      }
    } catch (error) {
      console.error(error, 'error in fetchCredits');
    }
  };

  const fetchV4Credits = async (enterpriseId, teamId) => {
    try {
      let creditDetails = sessionStorage.getItem(sessionStorageKeys?.credit);

      //TODO: add team_id check when team_wallet is introduced
      const forceUpdate = true;
      // const forceUpdate = !creditDetails || Object.keys(JSON.parse(creditDetails)).length <= 0 || JSON.parse(creditDetails).enterprise_id !== enterpriseId

      const URL = `${process.env.APP_BACKEND_BASEURL}/credit/v4/credits`; //console/v1/enterprise/fetch-credits  or credit/v4/credits
      const resellerUrl = `${process.env.APP_BACKEND_BASEURL}/console/v1/enterprise/fetch-credits`; //console/v1/enterprise/fetch-credits  or credit/v4/credits
      if (forceUpdate) {
        const resp = await CentralAPIHandler.handleGetRequest(
          authReducer?.resellerData?.is_reseller ? resellerUrl : URL,
          {
            enterprise_id: enterpriseId,
            team_id: teamId,
          }
        );
        if (authReducer?.resellerData?.is_reseller) {
          dispatch(
            updateCredit([
              {
                key: 'available_credits',
                value: resp?.data?.available_credits,
              },
              { key: 'allotted_credits', value: resp?.data?.alloted_credits },
              { key: 'credit_type', value: resp?.data?.credit_type },
              { key: 'active', value: resp?.data?.active },
              { key: 'expiry_in_days', value: resp?.data?.expiry_in_days },
              { key: 'blocked', value: resp?.data?.blocked },
              { key: 'title', value: resp?.data?.title },
              { key: 'teamWallet', value: resp?.data?.teamWallet },
            ])
          );
        } else {
          dispatch(
            updateCredit([
              {
                key: ['360_credit'],
                value: resp?.data?.credit_data?.['360']?.credits,
              },
              {
                key: 'image_credit',
                value: resp?.data?.credit_data?.images?.credits,
              },
              {
                key: 'video_credit',
                value: resp?.data?.credit_data?.video?.credits,
              },
              {
                key: 'expiry_in_days',
                value: resp?.data?.credit_data?.images?.expiry_in_days,
              },
              {
                key: 'plan_type',
                value: resp?.data?.credit_data?.video?.subscription_type,
              },
              { key: 'credit_data', value: resp?.data?.credit_data },
            ])
          );

          if (
            resp?.data?.credit_data?.['360']?.credits >= 0 ||
            resp?.data?.credit_data?.video?.credits >= 0 ||
            resp?.data?.credit_data?.images?.credits >= 0
          ) {
            setShowCreditsVehicle((prev) => (prev = true));
          } else {
            setShowCreditsVehicle(false);
          }
        }

        sessionStorage.setItem(
          sessionStorageKeys?.credit,
          JSON.stringify(resp?.data)
        );
      } else {
        const creditsData = JSON.parse(
          sessionStorage.getItem(sessionStorageKeys?.credit)
        );
        dispatch(
          updateCredit([
            { key: 'available_credits', value: creditsData?.available_credits },
            { key: 'allotted_credits', value: creditsData?.alloted_credits },
            { key: 'credit_type', value: creditsData?.credit_type },
            { key: 'active', value: creditsData?.active },
            { key: 'expiry_in_days', value: creditsData?.expiry_in_days },
            { key: 'blocked', value: creditsData?.blocked },
            { key: 'title', value: creditsData?.title },
            { key: 'teamWallet', value: creditsData?.teamWallet },
          ])
        );
      }
    } catch (error) {
      console.error(error, 'error in fetchV4Credits');
    }
  };

  const fetchV5Credits = async (enterpriseId, teamId) => {
    try {
      // Fetch v5 credits
      const response = await CentralAPIHandler.handleGetRequest(
        `${process.env.APP_BACKEND_BASEURL}/credit/v5/credits`,
        { enterprise_id: enterpriseId, team_id: teamId }
      );
      const creditsPayload = response?.data?.credit_data
        ? response.data
        : response?.credit_data
          ? response
          : null;
      if (creditsPayload) {
        dispatch(updateV5Credit(creditsPayload));
      }
    } catch (error) {
      console.error(error, 'error in fetchV5Credits');
    }
  };

  useEffect(() => {
    setTeamsData(enterpriseTeamReducer?.teams);
    if (enterpriseTeamReducer?.selectedTeam?.team_id) {
      generateBearerToken(
        { additionalPayload: {} },
        true,
        enterpriseTeamReducer?.selectedTeam?.team_id,
        enterpriseTeamReducer?.selectedTeam?.enterprise_id
      ); //true since, bearerToken already exists without team_id
    }
  }, [enterpriseTeamReducer?.selectedTeam]);

  const goHome = () => {
    router.push({
      pathname: '/home',
      query: {
        enterprise_id: enterpriseTeamReducer?.enterprise.enterprise_id,
        team_id: enterpriseTeamReducer?.selectedTeam?.team_id,
      },
    });
  };

  const [profileContent] = useState(HeaderProfileContent);

  const goToSpyneUrlOrBackGuestUser = (value) => {
    try {
      if (value === 'back') {
        dispatch(
          updateVirtualStudioProperty([{ key: 'imagesList', value: [] }])
        );
        dispatch(updateDemoVideoId(''));
        dispatch(updateIsInsideDemo(false));
        // localStorage.removeItem('videoId');
        // setShowTabPanel()
        // setSelectedTab();
        localStorage.removeItem('videoId');
        localStorage.setItem('prevBgID', '');
        router.push({ pathname: '/virtualstudio' });
      } else {
        router.push({ pathname: 'https://www.spyne.ai' });
      }
    } catch (error) {}
  };

  const deductCreditSpring = useSpring({
    from: {
      transform: 'translateY(0px) translateX(0%) scale(1)',
      opacity: 1,
    },
    to: async (next) => {
      await next({
        transform: 'translateY(0px) translateX(0%) scale(0.75)',
        opacity: 1,
        config: { duration: 300, easing: (t) => t * t },
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      await next({
        transform: 'translateY(200px) translateX(0%) scale(0.75)',
        opacity: 1,
        config: { duration: 1000 },
      });
      dispatch(setShowDeductCreditAnimation(false));
    },
    delay: showDeductCreditAnimation ? 500 : 100000000, //it is only to start animation instantly when state is true
  });

  const renderDivider = () => {
    return (
      <div className="hidden h-4 w-0 border-[0.5px] border-black/15 md:flex"></div>
    );
  };

  return (
    <div
      className={cn(
        styles['header-container'],
        `${'header-container'} `,
        `${vsversion === 'v2' && home && ['TABLET', 'MINI', 'MOBILE'].includes(screenSize) ? 'relative !border-b-0 !bg-gray-100 !shadow-none' : ''}`
      )}
    >
      <div
        className={`${vsversion === 'v2' && home && ['TABLET', 'MINI', 'MOBILE'].includes(screenSize) ? 'flex flex-row pl-2' : styles['left-content']}`}
      >
        <div
          className={`${vsversion === 'v2' && home && ['TABLET', 'MINI', 'MOBILE'].includes(screenSize) ? 'flex items-center' : [styles['hamburger-icon'], 'hamburger-icon'].join(' ')}`}
        >
          {(currentPageUrl.toLowerCase().includes('virtualstudio') &&
            !hasActiveSubTab &&
            !currentPageUrl.toLowerCase().includes('virtualstudio/v2')) ||
          currentPageUrl.toLowerCase().includes('360studio') ||
          currentPageUrl.toLowerCase().includes('playground') ||
          currentPageUrl.toLowerCase().includes('video') ? (
            authReducer?.loggedIn ? (
              <button
                onClick={() => goHome()}
                className="gray-btn mr-2.5 hidden items-center gap-1.5 md:flex"
              >
                <Image
                  src={virtualDataWhenUrl?.homeIcon}
                  width={30}
                  height={16}
                  alt="Home icon"
                />
                <span className="text-black-80">
                  {t('console.screens.home.homeBtn')}
                </span>
              </button>
            ) : (
              <button
                onClick={() =>
                  goToSpyneUrlOrBackGuestUser(
                    imageList.length || isInsideDemo ? 'back' : 'home'
                  )
                }
                className="gray-btn mr-2.5 hidden items-center gap-1.5 md:flex"
              >
                <Image
                  src={virtualDataWhenUrl?.backIcon}
                  width={6}
                  height={10}
                  alt="Back arrow icon"
                />
                {imageList.length || isInsideDemo
                  ? t('console.screens.home.backBtn')
                  : t('console.screens.home.homeBtn')}
              </button>
            )
          ) : (
            <button
              className="back-btn"
              onClick={() => {
                if (vsversion !== 'v2') {
                  setShowSideNavbar(!showSideNavbar);
                }
                if (vsversion === 'v2' && window.innerWidth < 768) {
                  setShowSideNavbar(!showSideNavbar);
                }
              }}
            >
              {showSideNavbar ? (
                <Image
                  src={HeaderSrc?.toCollapseMenuIcon}
                  alt="collapse icon"
                  height={40}
                  width={40}
                  className="cursor-pointer p-1 transition-all duration-200 ease-in-out"
                />
              ) : (
                <Image
                  className="cursor-pointer p-1 transition-all duration-200 ease-in-out"
                  src={HeaderSrc?.toExpandMenuIcon}
                  alt="Expanded menu icon"
                  height={40}
                  width={40}
                />
              )}
            </button>
          )}
        </div>
        {(currentPageUrl.toLowerCase().includes('virtualstudio') &&
          !hasActiveSubTab &&
          !currentPageUrl.toLowerCase().includes('virtualstudio/v2')) ||
        currentPageUrl.toLowerCase().includes('video') ? (
          <div
            className={`${screenSize === 'DESKTOP' ? styles['console-logo'] : 'flex items-center gap-1'}`}
          >
            <Image
              src={virtualDataWhenUrl?.virtualLogo}
              alt="virtual studio logo"
              height={24}
              width={24}
              className="h-auto w-5 md:w-10"
            />
            <h1 className="text-md text-blue-light flex items-center gap-6 font-bold md:text-[22px] md:leading-10">
              {t('global.virtualStudioPlatform')}{' '}
              {currentPageUrl.toLowerCase().includes('virtualstudio/360') && (
                <span className="bg-blue-4 rounded-3xl px-4 py-1.5 text-base font-semibold">
                  360 Spin
                </span>
              )}
            </h1>
            {/* {currentPageUrl.toLowerCase().includes("video") && <div className="text-[#026AA2] text-sm font-semibold bg-[#F0F9FF] px-3 py-1 rounded-2xl border border-[#026aa21a]">Video Tour</div>} */}
          </div>
        ) : currentPageUrl.toLowerCase().includes('360studio') ? (
          <div className={styles['console-logo']}>
            <Image
              src={virtualDataWhenUrl?.['360Video']}
              alt="virtual studio logo"
              height={40}
              width={40}
            />
            <h1>360 Studio</h1>
          </div>
        ) : currentPageUrl.toLowerCase().includes('website-builder') ||
          currentPageUrl.toLowerCase().includes('lead-management') ? (
          <div className={styles['console-logo']}>
            <Image
              src={websiteBuilderWhenUrl?.logo}
              alt="virtual studio logo"
              height={40}
              width={40}
            />
            <h1>{websiteBuilderWhenUrl?.logoTitle}</h1>
          </div>
        ) : vsversion === 'v2' &&
          home &&
          ['TABLET', 'MINI', 'MOBILE'].includes(screenSize) ? (
          <div className="flex items-center">
            {authReducer?.resellerData?.is_reseller ? (
              authReducer?.resellerData?.logo_url ? (
                <Image
                  src={authReducer?.resellerData?.logo_url}
                  alt="console logo"
                  height={40}
                  width={40}
                />
              ) : null
            ) : (
              <img
                src="https://spyne-static.s3.us-east-1.amazonaws.com/console/combined-vs/console_home_logo.svg"
                alt="console logo"
                height={40}
                width={40}
              />
            )}
          </div>
        ) : (
          <div className={styles['console-logo']}>
            {vsversion === 'v2' ? (
              <div className="flex items-center gap-2">
                {authReducer?.resellerData?.is_reseller ? (
                  authReducer?.resellerData?.logo_url ? (
                    <Image
                      src={authReducer?.resellerData?.logo_url}
                      alt="console logo"
                      height={40}
                      width={40}
                    />
                  ) : null
                ) : isSpyneOrLocalhost ? (
                  <SVG iconName="spyneLogoWhite" className="h-8 w-8" />
                ) : null}
                <div className="flex flex-col">
                  <span className="text-blue_purple-90 text-lg font-semibold">
                    Retail Suite
                  </span>
                  <span className="text-xs font-normal">
                    {authReducer?.resellerData?.is_reseller
                      ? `by ${authReducer?.resellerData?.name}`
                      : isSpyneOrLocalhost
                        ? 'by spyne'
                        : null}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Image
                  src={HeaderSrc?.consoleLogo}
                  alt="console logo image"
                  height={40}
                  width={40}
                />
                <h1>Console</h1>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className={`${screenSize === 'DESKTOP' ? [styles['right-content']] : 'flex items-center gap-1'} !mr-2 md:mr-0`}
        ref={profileDropdownRef}
        id="headerRightContent"
      >
        {!authReducer?.loggedIn ? (
          <div className="flex gap-[10px]">
            <button
              className="bg-blue_purple-12 text-blue-light flex items-start rounded-lg px-4 py-2 text-sm font-semibold"
              onClick={() => {
                if (triggerLogin) {
                  triggerLogin(true, true, true);
                  captureEvent(
                    'signup_clicked',
                    {
                      demo_flow_source: getDemoFlowType(
                        mainRoute,
                        childRoute,
                        null
                      ),
                    },
                    false
                  );
                } else {
                  defaultTriggerLogin();
                }
              }}
            >
              {t(LOGIN_DATA?.logIn)}
            </button>
          </div>
        ) : (
          <>
            {showTrialBanner &&
              currentPageUrl.toLowerCase().includes('virtualstudio') &&
              !requestExists && (
                <button
                  className={[
                    'gradient-btn',
                    `${screenSize === 'DESKTOP' ? 'w-fit px-3 py-2 font-bold' : 'p-2 font-semibold'} inline-flex items-center justify-center gap-3 rounded-full text-sm leading-6 text-white`,
                  ].join(' ')}
                  onClick={openUnlockVideoPopup}
                >
                  <Image
                    src="https://spyne-static.s3.amazonaws.com/console/project/sidebar/upgradeIcon.svg"
                    alt="unlock now"
                    height={24}
                    width={24}
                    className={`my-auto ${screenSize === 'DESKTOP' ? '' : 'w-[20px]'}`}
                  />
                  {screenSize === 'DESKTOP' ? 'Unlock Images' : ''}
                </button>
              )}
            {vsversion === 'v2' ? (
              authReducer?.loggedIn && showCredits ? (
                <HeaderCredits setOpenUpgradeModal={openPricingModal} />
              ) : null
            ) : (
              showCreditsVehicle &&
              ['PLG', 'Signup', 'Discovery-Call-Done'].includes(
                enterpriseStage
              ) && (
                // {((credits?.active && Object.keys(credits || {}).length > 0) && currentPageUrl.toLowerCase().includes("demo-catalog")) &&
                <div
                  ref={creditsDropdownRef}
                  className="relative flex items-center gap-4"
                >
                  {hideCreditButtonTemporary && (
                    <button
                      className={`${creditCount > 0 ? 'bg-blue-light-2' : 'bg-orange-red'} ${screenSize === 'DESKTOP' ? 'w-fit px-3 py-2 font-bold' : 'p-2 font-semibold'} relative inline-flex items-center gap-3 rounded-full text-sm leading-6 text-white`}
                      onClick={closeCreditDropDown}
                    >
                      <Image
                        src="https://spyne-static.s3.amazonaws.com/console/headerVehicleLeftCar.svg"
                        alt="unlock now"
                        height={24}
                        width={24}
                        className={`my-auto ${screenSize === 'DESKTOP' ? '' : 'w-[20px]'}`}
                      />
                      {screenSize === 'DESKTOP' ? 'Vehicles Left:' : ''}
                      <span className="text-blue-light-2 flex h-6 w-6 items-center justify-center rounded-full bg-white !text-sm">
                        {creditCount}
                      </span>
                      {showDeductCreditAnimation && (
                        <animated.span
                          style={deductCreditSpring}
                          className="text-orange-red bg-red-lightest absolute right-8 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white !text-sm"
                        >
                          -1
                        </animated.span>
                      )}
                      <Image
                        src={
                          'https://spyne-static.s3.amazonaws.com/console/headerVehicleLeftArrowDown.svg'
                        }
                        alt="arrow down"
                        height={12}
                        width={12}
                        className="ml-2 h-[12px] w-[12px] grayscale"
                      />
                    </button>
                  )}
                  {creditsDropdown &&
                  Object.keys(
                    JSON.parse(
                      sessionStorage.getItem(sessionStorageKeys.credit)
                    )?.credit_data
                  ).length > 0 ? (
                    <div className="border-black-10 absolute left-0 top-11 z-[2300] min-w-[16rem] max-w-[17.5rem] rounded-lg border bg-white px-4 py-2 shadow-lg">
                      {freeCreditsInfo?.map((item, idx) => {
                        return (
                          <div
                            className={`flex items-start justify-between gap-3 py-2.5 ${idx != 2 && 'border-black-10 border-b-[0.6px]'}`}
                            key={`${item?.product}`}
                          >
                            <div className="flex items-start gap-3">
                              <Image
                                src={item.icon}
                                alt={item.product || 'icon'}
                                width={15}
                                height={15}
                              />
                              <div>
                                <p className="text-black-80 text-sm font-medium">
                                  {item?.product}
                                </p>
                                <p className="text-black-40 text-[0.75rem] font-medium">
                                  {item?.title}:&nbsp;
                                  <strong>{formatNumber(item?.value)}</strong>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={openPricingModal}
                              className="text-blue-light text-[0.628rem] font-medium"
                            >
                              Upgrade plan
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {showUpgradeNowBtn &&
                  ['PLG', 'Signup', 'Discovery-Call-Done'].includes(
                    enterpriseStage
                  ) ? (
                    <button
                      className={`bg-[linear-gradient(94.71deg,_#0070E1_5.38%,_#FF19FF_94.16%)] ${screenSize === 'DESKTOP' ? 'w-fit px-3 py-2 font-bold' : 'p-2 font-semibold'} inline-flex items-center justify-center gap-3 rounded-full text-sm leading-6 text-white`}
                      onClick={openPricingModal}
                    >
                      <Image
                        src="https://spyne-static.s3.amazonaws.com/console/diamondIcon.svg"
                        alt="unlock now"
                        height={24}
                        width={24}
                        className={`${screenSize === 'DESKTOP' ? '' : 'w-[20px]'}`}
                      />
                      {screenSize === 'DESKTOP' ? 'Upgrade Now' : ''}
                    </button>
                  ) : null}
                </div>
              )
            )}

            {showCalendar && (
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-50">
                <IoMdCalendar
                  className="h-5 w-5"
                  style={{
                    color: '#666666',
                  }}
                  onClick={() => {
                    router.push({
                      pathname: '/converse-ai/calendar',
                      query: router.query,
                    });
                  }}
                />
              </div>
            )}
            {/* credits */}
            {showCredits &&
            credits?.active &&
            Object.keys(credits || {}).length > 0 ? (
              screenSize === 'DESKTOP' ? (
                <div
                  className="relative mr-2 flex cursor-pointer px-1.5 py-1"
                  ref={creditsDropdownRef}
                  onClick={() => setShowCreditsDropdown(!showCreditsDropdown)}
                >
                  <Image
                    src={
                      'https://spyne-static.s3.amazonaws.com/console/accounts/creditwallet.svg'
                    }
                    width={28}
                    height={28}
                    className="mr-1 grayscale"
                    alt="resource-credits"
                  />
                  {/* <span className={`absolute -top-[6px] -right-[15px] h-[24px] w-[24px] rounded-full ${credits?.available_credits === 0 ? "bg-red-1" : "bg-blue-light"}  flex items-center justify-center gap-2 p-0.5 text-[10px] font-semibold leading-[10px] text-white`}>{formatNumber(credits?.available_credits)}</span> */}
                  <div className="flex items-center">
                    <div>
                      <p className="text-xs font-normal">Credits:</p>
                      <p className="mt-0.5 text-xs font-semibold">
                        {['VIEW_ENTERPRISE_CREDITS'].includes(
                          enterprisePermission
                        )
                          ? credits?.available_credits
                          : (credits?.teamWallet?.available_credits ?? 0)}
                      </p>
                    </div>
                    <Image
                      src={
                        'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/blue-left-carret.svg'
                      }
                      alt="arrow down"
                      height={12}
                      width={12}
                      className="ml-2 h-[12px] w-[12px] -rotate-90 grayscale"
                    />
                  </div>
                  {showCreditsDropdown ? (
                    <div className="border-black-10 absolute right-0 top-10 z-10 min-w-[16rem] max-w-[17.5rem] rounded-lg border bg-white px-4 py-2 shadow-lg">
                      <ul>
                        {creditsInfo?.map((item, idx) => {
                          if (idx == 0) {
                            return ['VIEW_ENTERPRISE_CREDITS'].includes(
                              enterprisePermission
                            ) ? (
                              <li
                                className="flex items-center gap-2 py-1.5"
                                key={`${item?.label}`}
                              >
                                <p className="text-black-60 text-sm">
                                  {item?.title}:&nbsp;
                                  <strong>{formatNumber(item?.value)}</strong>
                                </p>
                              </li>
                            ) : null;
                          } else {
                            return (
                              <li
                                className="flex items-center gap-2 py-1.5"
                                key={`${item?.label}`}
                              >
                                <p className="text-black-60 text-sm">
                                  {item?.title}:&nbsp;
                                  <strong>{formatNumber(item?.value)}</strong>
                                </p>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="relative"
                  ref={creditsDropdownRef}
                  onClick={() => setShowCreditsDropdown(!showCreditsDropdown)}
                >
                  <button
                    className={`bg-purple-light border-gray-4 relative inline-flex items-center justify-center gap-3 rounded-full border-[1px] p-2 text-sm leading-6 text-white`}
                  >
                    <Image
                      src={
                        'https://spyne-static.s3.amazonaws.com/console/credit_wallet_icon.svg'
                      }
                      alt="resource-credits"
                      height={24}
                      width={24}
                      className={`my-auto w-[20px]`}
                    />
                    <div
                      className={
                        'absolute left-[50%] top-[-32%] flex h-[16px] min-w-[16px] translate-x-[7%] transform items-center justify-center rounded-full bg-[#1D0066] text-[6px] font-normal text-white'
                      }
                    >
                      {['VIEW_ENTERPRISE_CREDITS'].includes(
                        enterprisePermission
                      )
                        ? formatNumber(credits?.available_credits)
                        : (formatNumber(
                            credits?.teamWallet?.available_credits
                          ) ?? 0)}
                    </div>
                  </button>
                  {showCreditsDropdown ? (
                    <div className="border-black-10 absolute right-0 top-10 z-10 min-w-[16rem] max-w-[17.5rem] rounded-lg border bg-white px-4 py-2 shadow-lg">
                      <ul>
                        {creditsInfo?.map((item, idx) => {
                          if (idx == 0) {
                            return ['VIEW_ENTERPRISE_CREDITS'].includes(
                              enterprisePermission
                            ) ? (
                              <li
                                className="flex items-center gap-2 py-1.5"
                                key={`${item?.label}`}
                              >
                                <p className="text-black-60 text-sm">
                                  {item?.title}:&nbsp;
                                  <strong>{formatNumber(item?.value)}</strong>
                                </p>
                              </li>
                            ) : null;
                          } else {
                            return (
                              <li
                                className="flex items-center gap-2 py-1.5"
                                key={`${item?.label}`}
                              >
                                <p className="text-black-60 text-sm">
                                  {item?.title}:&nbsp;
                                  <strong>{formatNumber(item?.value)}</strong>
                                </p>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )
            ) : null}

            {/* website dropdown */}
            {vsversion === 'v2' && showWebsiteDropdown && (
              <div className="flex items-center gap-4">
                <WebsiteDropdown />
                {renderDivider()}
              </div>
            )}
            {/* teams */}
            {teamsData?.length &&
            !window.location.href.includes('history') &&
            authReducer?.loggedIn ? (
              <div
                className={`team-dropdown relative z-[99] flex ${vsversion === 'v2' && home && ['TABLET', 'MINI', 'MOBILE'].includes(screenSize) ? 'rounded-md bg-[#4600F20A]' : ''}`}
              >
                <HeaderTeamsDropdown
                  data={teamsData}
                  setReRenderSidebar={setReRenderSidebar}
                  reRenderSidebar={reRenderSidebar}
                  teamHeaderDrawer={teamHeaderDrawer}
                />
              </div>
            ) : null}
            {screenSize === 'DESKTOP' && (
              <>
                <HideSpyneContent>
                  {/* <Image
                    src={HOME_CONTENT?.helpAndSupport}
                    width={36}
                    height={36}
                    className="cursor-pointer"
                    onClick={openHelpAndSupport}
                    alt="help and support"
                  /> */}
                </HideSpyneContent>
                <HelpAndSupport
                  openHelpAndSupport={openHelpAndSupport}
                  showHelpAndSupport={showHelpAndSupport}
                />
              </>
            )}
            <UserProfileDropdown
              data={profileContent}
              logo={profileData?.logo}
              teamName={profileData?.teamName}
              profileName={profileData?.profileName}
              userType={profileData?.userType}
              profileDrawer={profileDrawer}
              switchEnterpriseDrawer={switchEnterpriseDrawer}
              profileMenuClass={profileMenuClass}
              enterpriseCategory={enterpriseCategory}
              t={t}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
