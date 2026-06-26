'use client';

import {
  nextInventoryCoachMark,
  useDispatch,
  useSelector,
} from '@spyne-console/store';
import { fetchInventoryStatus } from '@spyne-console/store';
import { pageAndSeoAction } from '@spyne-console/store';
import { getManagementDataAction } from '@spyne-console/store';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import axios from 'axios';

import Button from '@spyne-console/design-system/button';
import SVG from '@spyne-console/design-system/svg';

import { useRouting, useWindowSize } from '@spyne-console/hooks';

import {
  BUTTON_TYPES,
  defaultEnterprise,
  getPermissionObject,
  localStorageKeys,
  permissions,
  sessionStorageKeys,
} from '@spyne-console/utils/config';
import { GetPermissionClientObject } from '@spyne-console/utils/permissionClientObject';

import SidebarInventoryCoachMark from '../coach-marks/InventoryCoachMarks/SidebarInventoryCoachMark';
import HideSpyneContent from '../hoc/HideSpyneContent';
import WarningModal from '../modal/WarningModal';
import styles from '../styles/common/dialog.module.css';
import BlockerForm from '../websiteBuilderBlockerForm/BlockerForm';
import SpecificModal from '../websiteBuilderBlockerForm/SpecificModal';
import { getDealerConfig } from './actions';
import { sidebarHeadings } from './config';
import SidebarV2 from './sidebar-v2';

function Sidebar(props) {
  const dispatch = useDispatch();
  const {
    showSideNavbar,
    reRenderSidebar,
    updateWebbuilderSteps,
    setRouteToSlugFilterPage,
    setShowSideNavbar = () => {},
    home = false,
    isImagesEnabled,
    is360Enabled,
    isVideoTourEnabled,
    showInventoryCoachMarks,
    showInventoryListings,
    enterpriseTeamReducer,
    enterpriseReducer,
    staticDataWeb,
    t,
    setModalOpen,
    modalOpen,
    helpAndSupportOpen,
    setHelpAndSupportOpen,
  } = props;
  const [activeTab, setActiveTab] = useState('home');
  const [activeWebsiteLabel, setActiveWebsiteLabel] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('');
  const inventoryRef = useRef(null);
  const hasProductAnalyticsAccess = GetPermissionClientObject(
    'VIEW_PRODUCT_ANALYTICS'
  ).status;

  const [params, setParams] = useState({
    enterpriseId: '',
    teamId: '',
  });
  const [permissionObject, setPermissionObject] = useState({});
  const router = useRouting();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [menuTab, setMenuTab] = useState(null);
  const [enterpriseCategory, setEnterpriseCategory] = useState(null);
  const [showcoming, setShowcoming] = useState(false);

  const [builderDropdown, setBuilderDropdown] = useState(
    props.fromWebsiteBuilder ? props.fromWebsiteBuilder : false
  );
  const [virtualStudioDropdown, setVirtualStudioDropdown] = useState(
    props.fromVirtualStudio ? props.fromVirtualStudio : false
  );
  const [myVehiclesDropdown, setMyVehiclesDropdown] = useState(
    props.fromInventory ? props.fromInventory : false
  );
  const [inventoryDropdown, setInventoryDropdown] = useState(
    props.fromInventory ? props.fromInventory : false
  );
  const [organizationDropdown, setOrganizationDropdown] = useState(
    props.fromOrganization ? props.fromOrganization : false
  );
  const [settingsDropdown, setSettingsDropdown] = useState(
    props.fromSettings ? props.fromSettings : false
  );
  const [marketingDropdown, setMarketingDropdown] = useState(
    props.fromMarketing ? props.fromMarketing : false
  );
  const [checkForWebsiteBuilder, setCheckForWebsiteBuilder] = useState('');
  const [configData, setConfigData] = useState([]);
  const [getCounts, setGetCounts] = useState(0);
  const [activeSubmenu, setActiveSubmenu] = useState({});
  const [isBoarding, setIsboarding] = useState('');
  const [isOnBoardingDone, setIsOnBoardingDone] = useState(false);

  const screenSize = useWindowSize();
  const authReducer = useSelector((state) => state.authReducer);
  const activeTabs = [
    'home',
    'project',
    'organization',
    'virtualstudio',
    'settings',
    'developer-hub',
    'history',
    'teams',
    'support',
    'playground',
    'website-builder',
    'crm',
    'terms-and-conditions',
    'inventory',
    'integrations',
    'plugin',
    'marketing',
    'analytics',
    'converse-ai',
  ];

  const [optedEnterpriseFeature, setOptedEnterpriseFeature] = useState({});
  const [WebsiteBuilderBlockerForm, setWebsiteBuilderBlockerForm] =
    useState(false);
  const [isBoardingLead, setIsBoardingLead] = useState(null);
  const [showMarketingTab, setShowMarketingTab] = useState(false);
  const [showBanner, setShowBanner] = useState({
    images: false,
    '360spin': false,
    videoTour: false,
  });
  const [pluginStates, setPluginStates] = useState({});
  const enterpriseId =
    enterpriseTeamReducer?.enterprise?.enterprise_id ||
    JSON.parse(sessionStorage.getItem(sessionStorageKeys.selectedEnterprise))
      ?.enterprise_id ||
    '';
  const vsversion = JSON.parse(
    localStorage.getItem(localStorageKeys.vsVersion)
  )?.[enterpriseId];
  const teamId =
    enterpriseTeamReducer?.selectedTeam?.team_id ||
    JSON.parse(sessionStorage.getItem(sessionStorageKeys.selectedTeam))
      ?.team_id ||
    '';
  const EntandTeamid = { enterprise_id: enterpriseId, team_id: teamId };

  const enterpriseTeamVersion = JSON.parse(
    localStorage.getItem(localStorageKeys?.vsVersion)
  )?.[enterpriseId];

  useEffect(() => {
    if (updateWebbuilderSteps) {
      setGetCounts(updateWebbuilderSteps || 0);
    }
    if (!staticDataWeb) {
      dispatch(pageAndSeoAction());
    }
    getManagementDataAction(dispatch);
  }, [updateWebbuilderSteps]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBanner({
        images: !isImagesEnabled,
        '360spin': !is360Enabled,
        videoTour: !isVideoTourEnabled,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [isImagesEnabled, is360Enabled, isVideoTourEnabled]);

  const showBannerForTab = (tabValue) => {
    return showBanner[tabValue];
  };
  const hasInventory = JSON.parse(localStorage.getItem('hasInventory'));

  const handleMenuTabClick = (menuTab) => {
    try {
      // Check if sidebar inventory coach is visible
      const permission = getPermissionObject()?.user_role?.permissions;
      const hasDealerProfileAccess =
        permission?.VIEW_ENTERPRISE_TEAM_ALL === 'READ';

      if (props?.isSidebarInventoryCoachVisible) {
        dispatch(nextInventoryCoachMark(2));
      }

      // Check if warning modal should be shown
      let getValue = localStorage?.getItem(localStorageKeys?.showWarningModal);
      if (getValue) {
        setShowWarningModal(true);
        setMenuTab(menuTab);
        return;
      }

      // Return if menuTab is not active
      if (!activeTabs.includes(menuTab)) {
        return;
      }

      // Hide builder dropdown if not "website-builder"
      if (menuTab !== 'website-builder') {
        setBuilderDropdown(false);
      }

      // Return if already on the current page
      if (window.location.pathname.includes(menuTab)) {
        return;
      }

      switch (menuTab) {
        case 'virtualstudio':
          localStorage.removeItem(localStorageKeys?.src);
          router.push({
            pathname: '/virtualstudio',
            query: {
              activeSubTab: 'images',
              enterprise_id: enterpriseId,
              team_id: teamId,
            },
          });
          setActiveTab(menuTab);
          break;

        case 'crm':
          // if (hasInventory) {
          //   router.push({ pathname: '/crm', query: EntandTeamid });
          // }
          //   router.push({ pathname: '/crm', query: EntandTeamid });
          router.push({ pathname: '/crm', query: EntandTeamid });

          setActiveTab(menuTab);
          break;
        case 'converse-ai':
          router.push({ pathname: '/converse-ai', query: EntandTeamid });
          setActiveTab(menuTab);
          break;

        case 'playground':
          router.push({
            pathname: `/playground`,
            query: {
              enterprise_id: enterpriseId,
            },
          });
          setActiveTab(menuTab);
          break;

        case 'marketing':
          router.push({
            pathname: `/marketing/google-vehicle-listing`,
            query: {
              activeSubTab: 'google-vehicle-listing',
              enterprise_id: enterpriseId,
              team_id: teamId,
            },
          });
          setActiveTab(menuTab);
          break;

        case 'analytics':
          router.push({
            pathname: '/enterprises/report',
            query: {
              enterprise_id: enterpriseId,
              team_id: teamId,
            },
          });
          setActiveTab(menuTab);
          break;

        case 'home':
          router.push({
            pathname: '/home',
            query: {
              enterprise_id: enterpriseId,
              team_id: teamId,
            },
          });
          setActiveTab(menuTab);
          break;

        case 'terms-and-conditions':
          router.push({ pathname: `/${menuTab}` });
          break;

        case 'inventory':
          if (
            (showInventoryCoachMarks && showInventoryListings) ||
            enterpriseTeamVersion === 'v2'
          ) {
            router.push({
              pathname: '/inventory',
              query: {
                activeSubTab: 'listing',
                enterprise_id: enterpriseId,
                team_id: teamId,
              },
            });
          } else {
            router.push({
              pathname: '/inventory',
              query: {
                activeSubTab: 'media',
                enterprise_id: enterpriseId,
                team_id: teamId,
              },
            });
          }
          setActiveTab(menuTab);
          break;

        case 'organization':
          router.push({
            pathname: '/organization',
            query: {
              activeSubTab: hasDealerProfileAccess ? 'dealer_profile' : 'users',
              enterprise_id: enterpriseId,
            },
          });
          break;

        case 'settings':
          router.push({
            pathname: '/settings',
            query: {
              activeSubTab: 'general',
              enterprise_id: enterpriseId,
            },
          });
          break;

        default:
          if (menuTab !== 'virtualstudio') {
            router.push({
              pathname: `/${menuTab}`,
              query: {
                enterprise_id: enterpriseId,
                team_id: teamId,
              },
            });
          }
          setActiveTab(menuTab);
          break;
      }
    } catch (error) {
      console.log(error); // Optional: add more robust error handling
    }
  };
  const permissionObjectEnterprise = getPermissionObject();
  const selectedEnterprise = JSON.parse(
    sessionStorage.getItem(sessionStorageKeys.selectedEnterprise)
  );
  const enterprise_id = selectedEnterprise?.enterprise_id;
  const hasDeveloperHubAccessAtEnterpriseLevel =
    permissionObjectEnterprise[enterprise_id]?.enterprise_role?.permissions
      ?.VIEW_DEVELOPER_HUB === 'READ';
  const hasSettingsAccessAtEnterpriseLevel =
    permissionObjectEnterprise[enterprise_id]?.enterprise_role?.permissions
      ?.VIEW_SETTING_TAB === 'READ';
  const hasDeveloperHubAccess =
    GetPermissionClientObject('VIEW_DEVELOPER_HUB').status;

  const hasSettingTabAccess =
    GetPermissionClientObject('VIEW_SETTING_TAB').status;
  /**
   * setActiveTab when in inner levels
   * such as project -> sku -> image
   * active tab should be PROJECT
   */
  const setSelectedTab = (page) => {
    try {
      switch (true) {
        case page.includes('project') || page.includes('folder'):
          setActiveTab('project');
          break;
        case page.includes('home'):
          setActiveTab('home');
          break;
        case page.includes('org'):
          setActiveTab('organization');
          break;
        case page.includes('virtualstudio'):
          setActiveTab('virtualstudio');
          break;
        case page.includes('enterprises/report'):
          setActiveTab('analytics');
          break;
        case page.includes('settings'):
          setActiveTab('settings');
          break;
        case page.includes('developer-hub'):
          setActiveTab('developer-hub');
          break;
        case page.includes('integrations'):
          setActiveTab('integrations');
          break;
        case page.includes('teams'):
          setActiveTab('teams');
          break;
        case page.includes('support'):
          setActiveTab('support');
          break;
        case page.includes('crm'):
          setActiveTab('crm');
          break;
        case page.includes('converse-ai'):
          setActiveTab('converse-ai');
          break;
        case page.includes('website-builder'):
          setActiveTab('website-builder');
          setTimeout(() => {
            setWebsiteBuilderBlockerForm(true);
          }, 500);

          switch (true) {
            case page.includes('templates'):
              setActiveWebsiteLabel('templates');
              break;
            case page.includes('landing-page'):
              setActiveWebsiteLabel('landing-page');
              break;
            case page.includes('list-page'):
              setActiveWebsiteLabel('list-page');
              break;
            case page.includes('details-page'):
              setActiveWebsiteLabel('details-page');
              break;
            case page.includes('manage-forms'):
              setActiveWebsiteLabel('manage-forms');
              break;
            case page.includes('custom-pages'):
              setActiveWebsiteLabel('custom-pages');
              break;
            case page.includes('page-speed-insight'):
              setActiveWebsiteLabel('page-speed-insight');
              break;
            case page.includes('seo'):
              setActiveWebsiteLabel('seo');
              break;
            case page.includes('migration'):
              setActiveWebsiteLabel('migration');
              break;
            case page.includes('analytics'):
              setActiveWebsiteLabel('websiteAnalytics');
              break;
            case page.includes('plugin'):
              setActiveWebsiteLabel('plugin');
              break;
            default:
              break;
          }
          break;
        case page.includes('terms-and-conditions'):
          setActiveTab('terms-and-conditions');
          break;
        case page.includes('inventory') || page.includes('sku'):
          setActiveTab('inventory');
          switch (true) {
            case page.includes('inventory') ||
              page.includes('inventory-details') ||
              page.includes('listings'):
              setActiveSubTab('inventory');
              setActiveSubmenu('inventory');
              break;
            case page.includes('media') || page.includes('sku'):
              setActiveSubmenu('media');
              setActiveSubTab('media');
              break;
            case page.includes('listing'):
              setActiveSubmenu('listing');
              setActiveSubTab('listing');
              break;
            case page.includes('sourcing'):
              setActiveSubmenu('sourcing');
              setActiveSubTab('sourcing');
              break;
            case page.includes('history'):
              setActiveSubmenu('history');
              setActiveSubTab('history');
              break;
            default:
              break;
          }
          break;
        case page.includes('marketing'):
          setActiveTab('marketing');

          switch (true) {
            case page.includes('google-vehicle-listing'):
              setActiveSubTab('google-vehicle-listing');
              setActiveSubmenu('google-vehicle-listing');
              break;
            case page.includes('facebook-ads'):
              setActiveSubTab('facebook-ads');
              setActiveSubmenu('facebook-ads');
              break;
            default:
              break;
          }

          break;
        default:
          // Handle any other cases if needed
          break;
      }
    } catch (error) {
      console.error(error); // Optional: add more robust error handling
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const { activeSubTab } = router.query;
      if (activeSubTab) {
        setActiveSubTab(activeSubTab);
      }
    }
    // if marketing set
  }, [router.isReady, router.query]);

  const setParamsToState = () => {
    try {
      let enterprise_id = sessionStorage.getItem(
        sessionStorageKeys.selectedEnterprise
      )
        ? JSON.parse(
            sessionStorage.getItem(sessionStorageKeys.selectedEnterprise)
          )
        : '';
      let team_id = sessionStorage.getItem(sessionStorageKeys.selectedTeam)
        ? JSON.parse(sessionStorage.getItem(sessionStorageKeys.selectedTeam))
        : '';
      let optedFeature = sessionStorage.getItem(
        sessionStorageKeys.enterpriseFeatures
      )
        ? JSON.parse(
            sessionStorage.getItem(sessionStorageKeys.enterpriseFeatures)
          )
        : '';
      const selectedEnt = enterprise_id?.enterprise_id;
      setOptedEnterpriseFeature(optedFeature[selectedEnt]?.features);
      setParams({
        ...params,
        enterpriseId: enterprise_id?.enterprise_id,
        teamId: team_id?.team_id,
      });
    } catch (error) {
      // console.log(error)
    }
  };

  const toRenderUI = (menuTabs, permission = '') => {
    try {
      if (!permission) {
        if (enterpriseTeamVersion === 'v2' && menuTabs?.label === 'project') {
          return false;
        }
        if (
          enterpriseTeamVersion === 'v2' &&
          menuTabs?.label === 'inventory' &&
          menuTabs?.title === 'My Vehicles'
        ) {
          return false;
        }
        if (
          enterpriseTeamVersion !== 'v2' &&
          menuTabs?.label === 'inventory' &&
          menuTabs?.title === 'Inventory'
        ) {
          return false;
        }
        if (
          menuTabs?.label === 'project' ||
          menuTabs?.label === 'inventory' ||
          menuTabs?.label === 'support' ||
          menuTabs?.label === 'terms-and-conditions' ||
          menuTabs?.label === 'analytics' ||
          menuTabs?.label === 'integrations' ||
          menuTabs?.label === 'crm' ||
          menuTabs?.label === 'converse-ai'
        )
          return true;

        if (enterpriseId && teamId) {
          if (
            permissionObject?.user_role?.permissions?.hasOwnProperty(
              menuTabs.permission
            ) ||
            permissionObject[
              enterpriseId
            ]?.enterprise_role?.permissions?.hasOwnProperty(
              menuTabs.permission
            ) ||
            permissionObject[enterpriseId][teamId]?.permissions?.hasOwnProperty(
              menuTabs.permission
            )
          ) {
            return true;
          }
        }
      } else {
        if (
          permissionObject?.user_role?.permissions?.hasOwnProperty(
            menuTabs.permission
          ) ||
          permissionObject[
            enterpriseId
          ]?.enterprise_role?.permissions?.hasOwnProperty(
            menuTabs.permission
          ) ||
          permissionObject[enterpriseId][teamId]?.permissions?.hasOwnProperty(
            menuTabs.permission
          )
        ) {
          return true;
        }
      }
      return false;
    } catch (error) {
      // console.log(error)
    }
  };

  const getConfigDetailsData = async (enterpriseId, teamId) => {
    try {
      if (enterpriseId && teamId) {
        const res = await getDealerConfig(enterpriseId, teamId);
        if (res) {
          sessionStorage.setItem(
            'configData',
            JSON.stringify(res?.publishedConfig)
          );
          setConfigData(res?.publishedConfig);
          setCheckForWebsiteBuilder(res?.publishedConfig?.enterprise_id);
        }
      }
    } catch (err) {
      console.log('something went wrong!', err);
    }
  };

  useEffect(() => {
    let enterpriseId = params?.enterpriseId || props?.enterpriseId;
    let teamId = params?.teamId || props?.teamId;

    const interval = setInterval(() => {
      if (enterpriseId && teamId) {
        if (router.query.pageSource === 'websiteBuilder') {
          router.push({ pathname: '/website-builder' });
        }
        clearInterval(interval);
      }
      setParamsToState();
    }, 100);
    // debugger
    setPermissionObject(getPermissionObject());
    if (sessionStorage?.getItem(sessionStorageKeys?.selectedEnterprise)) {
      let selectedEnt = JSON?.parse(
        sessionStorage?.getItem(sessionStorageKeys?.selectedEnterprise)
      );
      setEnterpriseCategory(selectedEnt?.category_id);
    }

    getConfigDetailsData(enterpriseId, teamId);

    const hitTheApi = async () => {
      // let resp = await getOnboardingSteps(enterpriseId, teamId);
      // resp === undefined
      //   ? localStorage.setItem(
      //       localStorageKeys.websiteOnboradingSteps,
      //       JSON.stringify(0)
      //     )
      //   : localStorage.setItem(
      //       localStorageKeys.websiteOnboradingSteps,
      //       JSON.stringify(resp)
      //     );
      // setGetCounts(resp ? resp : 0);
    };

    hitTheApi();

    return () => clearInterval(interval);
  }, [
    params.enterpriseId,
    params.teamId,
    reRenderSidebar,
    enterpriseTeamReducer,
  ]);

  useEffect(() => {
    const page = window.location.pathname;
    if (page.includes('developer-hub')) {
      if (hasDeveloperHubAccessAtEnterpriseLevel || hasDeveloperHubAccess) {
        setSelectedTab(page);
      } else {
        setActiveTab('home');
        window.location.href = `/home?enterprise_id=${enterpriseId}&team_id=${teamId}`;
      }
    } else if (page.includes('settings')) {
      if (hasSettingsAccessAtEnterpriseLevel || hasSettingTabAccess) {
        setSelectedTab(page);
      } else {
        setActiveTab('home');
        window.location.href = `/home?enterprise_id=${enterpriseId}&team_id=${teamId}`;
      }
    } else {
      setSelectedTab(page);
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname.includes('plugin')) {
      getMarketplaceStatus(enterpriseId, teamId);
    }
  }, [enterpriseId, teamId]);

  const hideWarningModal = (e, value) => {
    if (e) e.stopPropagation();
    try {
      if (value === 'icon') {
        setShowWarningModal(false);
      } else {
        localStorage.removeItem(localStorageKeys?.showWarningModal);
        setShowWarningModal(false);
        handleMenuTabClick(menuTab);
      }
    } catch (error) {
      // console.log(error)
    }
  };

  const continueReporting = () => {
    try {
      setShowWarningModal(false);
    } catch (error) {}
  };

  const getOnboardingSteps = async (enterpriseId, teamId) => {
    // debugger
    try {
      if (teamId && enterpriseId) {
        const resp = await axios.get(
          `${process.env.WEBSITE_BACKEND}/dealers/v1/onboarding-steps?enterprise_id=${enterpriseId}&team_id=${teamId}`
        );

        setIsBoardingLead(resp.data.data.is_onboarding_lead);

        setIsOnBoardingDone(resp.data.data.onboarding_steps.onboarding_done);

        const result = resp.data;
        setIsboarding(result.data.onboarding_steps.onboarding_done);
        if (
          props.fromWebsiteBuilder &&
          result.data.onboarding_steps.onboarding_done
        ) {
          setBuilderDropdown(true);
        } else if (
          result.data.onboarding_steps.onboarding_done === false &&
          props.fromWebsiteBuilder
        ) {
          setBuilderDropdown(false);
        }
        localStorage.setItem(
          localStorageKeys.websiteOnboardingDone,
          result.data.onboarding_steps.onboarding_done
            ? result.data.onboarding_steps.onboarding_done
            : false
        );
        const stepToValue = parseInt(
          result.data.onboarding_steps.step_to.replace(/\D/g, '')
        );
        return stepToValue - 1;
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const getMarketplaceStatus = async (enterpriseId, teamId) => {
    try {
      const resp = await axios.get(
        `${process.env.BACKEND_BASEURL}/plugins/v1/state?enterprise_id=${enterpriseId}&team_id=${teamId}`
      );
      const pluginStates = resp.data.data.plugin_state.plugins_state;

      const marketingPluginIds = [
        'd04c3311-bbc7-4e8e-9c51-e7ea9a32ff27',
        'e7a2f65d-da76-4288-a20e-3f85b6dfd64b',
      ];

      const shouldShowMarketingTab = marketingPluginIds.some(
        (id) => pluginStates[id]
      );

      if (shouldShowMarketingTab) {
        setShowMarketingTab(true);
      } else {
        setShowMarketingTab(false);
      }

      // Store the plugin states for later use
      setPluginStates(pluginStates);
    } catch (error) {
      return error;
    }
  };

  const handleDropdown = async (e, menuTab, subTab = false) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    try {
      if (menuTab === 'virtualstudio') {
        setVirtualStudioDropdown(!virtualStudioDropdown);
      } else if (menuTab === 'organization') {
        setOrganizationDropdown(!organizationDropdown);
      } else if (menuTab === 'settings') {
        setSettingsDropdown(!settingsDropdown);
      } else if (menuTab === 'website-builder') {
        setBuilderDropdown(!builderDropdown);
      } else if (menuTab === 'inventory' || menuTab === 'inventoryV2') {
        if (subTab) {
          setInventoryDropdown(!inventoryDropdown);
        } else {
          setMyVehiclesDropdown(!myVehiclesDropdown);
        }
      } else if (menuTab === 'marketing') {
        setMarketingDropdown(!marketingDropdown);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const websiteDropdownClick = async (e) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    try {
      setBuilderDropdown(!builderDropdown);
      if (builderDropdown) {
        return;
      }

      if (getCounts < 3 && !isBoarding) {
        router.push({
          pathname: '/website-builder',
          query: EntandTeamid,
        });
      } else if (getCounts >= 6 && !isBoarding) {
        router.push({
          pathname: '/website-builder/migration',
          query: EntandTeamid,
        });
      } else if (getCounts >= 3 && !isBoarding) {
        router.push({
          pathname: '/website-builder/templates',
          query: EntandTeamid,
        });
      } else {
        router.push({
          pathname: '/website-builder/templates',
          query: EntandTeamid,
        });
      }

      if (isBoarding) {
        setBuilderDropdown(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubMenuClick = (menuLabel) => {
    try {
      if (menuLabel === 'templates') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }

        router.push({
          pathname: '/website-builder/templates',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'landing-page') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }
        router.push({
          pathname: '/website-builder/landing-page',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'list-page') {
        router.push({
          pathname: '/website-builder/list-page',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'details-page') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }

        router.push({
          pathname: '/website-builder/details-page',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'manage-forms') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }

        router.push({
          pathname: '/website-builder/manage-forms',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'plugin') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }
        router.push({
          pathname: '/website-builder/plugin',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'custom-pages') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }

        router.push({
          pathname: '/website-builder/custom-pages',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'custom-pages') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }

        router.push({
          pathname: '/website-builder/custom-pages',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }

      if (menuLabel === 'page-speed-insight') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }

        router.push({
          pathname: '/website-builder/page-speed-insight',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'migration') {
        if (setRouteToSlugFilterPage) {
          setRouteToSlugFilterPage(false);
        }
        router.push({
          pathname: '/website-builder/migration',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'seo') {
        router.push({ pathname: '/website-builder/seo', query: EntandTeamid });
        setActiveWebsiteLabel(menuLabel);
      }
      if (menuLabel === 'websiteAnalytics') {
        router.push({
          pathname: '/website-builder/analytics',
          query: EntandTeamid,
        });
        setActiveWebsiteLabel(menuLabel);
      }
      setBuilderDropdown(true);
    } catch (error) {}
  };

  useEffect(() => {
    const fetchDataFromLocalStorage = () => {
      const storedData = localStorage.getItem(
        localStorageKeys?.websiteOnboradingSteps
      );
      // console.log("storedData:", storedData)
      if (storedData !== undefined && storedData !== null) {
        try {
          const getCountsValue = JSON.parse(storedData);
          // console.log("getCountsValue:", getCountsValue)
          setGetCounts(getCountsValue);
        } catch (error) {
          console.error('Error parsing stored data:', error);
        }
      } else {
        console.log('No data found in localStorage.');
      }
    };

    fetchDataFromLocalStorage();
  }, []);

  useEffect(() => {
    if (vsversion === 'v1') {
      setShowSideNavbar(true);
    }
  }, []);

  const getSideBarTitle = (title) => {
    const titleMap = {
      Home: t('console.common.sideBarTabs.Home'),
      'Virtual Studio': t('console.common.sideBarTabs.VirtualStudio'),
      Projects: t('console.common.sideBarTabs.Projects'),
      History: t('console.common.sideBarTabs.History'),
      Users: t('console.common.sideBarTabs.Users'),
      Teams: t('console.common.sideBarTabs.Teams'),
      'Developer Hub': t('console.common.sideBarTabs.Developer Hub'),
      Settings: t('console.common.sideBarTabs.Settings'),
      Policy: t('console.common.sideBarTabs.Policy'),
      'Help and Support': t('console.common.sideBarTabs.helpAndSupport'),
      Organization: t('console.common.sideBarTabs.organization'),
      'Back to Home': t('console.common.sideBarTabs.backToHome'),
      Integrations: t('console.common.sideBarTabs.integrations'),
      Analytics: t('console.common.sideBarTabs.analytics'),
      'My Vehicles': t('console.common.sideBarTabs.myVehicles'),
      Marketing: t('console.common.sideBarTabs.marketing'),
      Website: t('console.common.sideBarTabs.website'),
      Images: t('console.common.sideBarTabs.subMenus.virtualStudio.images'),
      '360 Spin': t(
        'console.common.sideBarTabs.subMenus.virtualStudio.spin360'
      ),
      'Video Tour': t(
        'console.common.sideBarTabs.subMenus.virtualStudio.videoTour'
      ),
      Media: t('console.common.sideBarTabs.subMenus.myVehicles.media'),
      Inventory: t('console.common.sideBarTabs.subMenus.myVehicles.inventory'),
      Templates: t('console.common.sideBarTabs.subMenus.website.templates'),
      'Home Page': t('console.common.sideBarTabs.subMenus.website.homePage'),
      'List Page': t('console.common.sideBarTabs.subMenus.website.listPage'),
      'Manage Forms': t(
        'console.common.sideBarTabs.subMenus.website.manageForms'
      ),
      'Details Page': t(
        'console.common.sideBarTabs.subMenus.website.detailsPage'
      ),
      'Page Builder': t(
        'console.common.sideBarTabs.subMenus.website.pageBuilder'
      ),
      'Page Speed Insight': t(
        'console.common.sideBarTabs.subMenus.website.pageSpeedInsight'
      ),
      'Lead Managment': t(
        'console.common.sideBarTabs.subMenus.website.leadManagment'
      ),
      SEO: t('console.common.sideBarTabs.subMenus.website.seo'),
      'Website Analytics': t(
        'console.common.sideBarTabs.subMenus.website.websiteAnalytics'
      ),
      Plugin: t('console.common.sideBarTabs.subMenus.website.plugin'),
      Users: t('console.common.sideBarTabs.subMenus.organization.users'),
      teams: t('console.common.sideBarTabs.subMenus.organization.teams'),
      Enterprise: t(
        'console.common.sideBarTabs.subMenus.organization.enterprise'
      ),
      General: t('console.common.sideBarTabs.subMenus.settings.general'),
      Studio: t('console.common.sideBarTabs.subMenus.settings.studio'),
      App: t('console.common.sideBarTabs.subMenus.settings.app'),
      'Google Vehicle Listing': t(
        'console.common.sideBarTabs.subMenus.marketing.gVehicleListing'
      ),
      'Facebook Ads': t('console.common.sideBarTabs.subMenus.marketing.fbAds'),
    };

    return titleMap[title] || title;
  };

  const hasInventoryAccess = () => {
    const hasInventoryAccess = GetPermissionClientObject(
      'CHECK_INVENTORY_ACCESS'
    ).status;
    return hasInventoryAccess;
  };

  const hasIntegrationsAccess = () => {
    const hasIntegrationsAccess = GetPermissionClientObject(
      'CHECK_INTEGRATION_ACCESS'
    ).status;
    return hasIntegrationsAccess;
  };

  useEffect(() => {
    // Only fetch the inventory status if it hasn't been determined as available yet
    if (enterpriseId && teamId) {
      dispatch(fetchInventoryStatus(enterpriseId, teamId));
    }
  }, [dispatch, enterpriseId, teamId]);

  const handleMenuSubTabClick = (menuSubTab, isDisabled) => {
    if (isDisabled) {
      return;
    } else if (
      (activeSubTab === 'dealer_team' || activeSubTab === 'dealer_profile') &&
      menuSubTab === 'dealer_profile'
    ) {
      return;
    } else if (menuSubTab === 'listing') {
      router.push({
        pathname: '/inventory',
        query: {
          activeSubTab: 'listing',
          enterprise_id: enterpriseId,
          team_id: teamId,
        },
      });
      setActiveSubTab(menuSubTab);
      setInventoryDropdown(true);
    } else if (menuSubTab === 'sourcing') {
      router.push({
        pathname: '/inventory',
        query: {
          activeSubTab: 'sourcing',
          enterprise_id: enterpriseId,
          team_id: teamId,
        },
      });
      setActiveSubTab(menuSubTab);
      setInventoryDropdown(true);
    } else if (menuSubTab === 'images') {
      router.push({
        pathname: '/virtualstudio',
        query: { activeSubTab: 'images', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === '360spin') {
      router.push({
        pathname: '/virtualstudio',
        query: { activeSubTab: '360spin', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'videoTour') {
      router.push({
        pathname: '/virtualstudio',
        query: { activeSubTab: 'videoTour', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'inventory') {
      router.push({
        pathname: '/inventory',
        query: { activeSubTab: 'listing', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'media') {
      router.push({
        pathname: '/inventory',
        query: { activeSubTab: 'media', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'history') {
      router.push({
        pathname: '/inventory',
        query: { activeSubTab: 'history', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'users') {
      router.push({
        pathname: '/organization',
        query: { activeSubTab: 'users', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'teams') {
      router.push({
        pathname: '/organization',
        query: { activeSubTab: 'teams', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'enterprise') {
      router.push({
        pathname: '/organization',
        query: { activeSubTab: 'enterprise', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'dealer_profile') {
      router.push({
        pathname: '/organization',
        query: { activeSubTab: 'dealer_profile', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'dealer_team') {
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'general') {
      router.push({
        pathname: '/settings',
        query: { activeSubTab: 'general', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'studio') {
      router.push({
        pathname: '/settings',
        query: { activeSubTab: 'studio', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'app') {
      router.push({
        pathname: '/settings',
        query: { activeSubTab: 'app', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'google-vehicle-listing') {
      router.push({
        pathname: '/marketing/google-vehicle-listing',
        query: { activeSubTab: 'google-vehicle-listing', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    } else if (menuSubTab === 'facebook-ads') {
      router.push({
        pathname: '/marketing/facebook-ads',
        query: { activeSubTab: 'facebook-ads', ...EntandTeamid },
      });
      setActiveSubTab(menuSubTab);
    }

    setShowcoming(true);
  };

  useEffect(() => {
    if (activeSubTab === 'dealer_team') {
      setActiveSubTab('dealer_profile');
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (props?.isSidebarInventoryCoachVisible && inventoryRef.current) {
      inventoryRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [props?.isSidebarInventoryCoachVisible, inventoryRef]);
  const userRole = useMemo(() => {
    return permissionObject?.user_role?.role_name;
  }, [permissionObject]);

  const renderV1Sidebar = () => (
    <div
      className={[
        `hide-scrollbar relative h-full ${showSideNavbar ? 'sidebar-wrapper-expanded' : 'sidebar-wrapper-shrinked'} `,
        `${showInventoryCoachMarks ? 'opacity-1' : ''}`,
      ].join(' ')}
    >
      <div className="menu-box hide-scrollbar max-h-[84vh] w-full overflow-y-auto">
        {vsversion == 'v2' &&
          ['TABLET', 'MINI', 'MOBILE'].includes(screenSize) &&
          home && (
            <div className="flex flex-row items-center justify-between pb-3">
              <img src="https://spyne-static.s3.us-east-1.amazonaws.com/console/combined-vs/console_home_logo.svg" />
              <div
                className="cursor-pointer"
                onClick={() => setShowSideNavbar(!showSideNavbar)}
              >
                <SVG iconName="crossIcon" className="h-3 w-3 font-bold" />
              </div>
            </div>
          )}
        <div
          className={`${showSideNavbar ? 'sub-section' : 'sub-section-shrinked'}`}
        >
          {props?.isSidebarInventoryCoachVisible ? (
            <SidebarInventoryCoachMark
              currentStep={2}
              category_id={defaultEnterprise?.prodCatAuto}
              inventoryRef={inventoryRef}
            />
          ) : null}
          {activeTab !== 'organization' &&
            activeTab !== 'settings' &&
            sidebarHeadings?.DEFAULT[
              enterpriseTeamReducer?.enterprise?.category_id ||
                enterpriseCategory ||
                'ALL'
            ]?.map((menuTabs, idx) => {
              return (
                <div
                  key={idx}
                  className={[
                    activeTab === menuTabs?.label
                      ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                      : 'text-black-60 border-transparent',
                    'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                  ].join(' ')}
                  onClick={() => {
                    handleMenuTabClick(menuTabs?.label);
                  }}
                >
                  <Image
                    src={menuTabs?.icon}
                    alt="Home-icon"
                    height={24}
                    width={24}
                    className="inline w-6"
                  />
                  {showSideNavbar ? (
                    <span className="">{getSideBarTitle(menuTabs?.title)}</span>
                  ) : (
                    ''
                  )}
                </div>
              );
            })}
          {activeTab !== 'organization' &&
            activeTab !== 'settings' &&
            vsversion !== 'v2' &&
            sidebarHeadings?.PRODUCTS[
              enterpriseTeamReducer?.enterprise?.category_id ||
                enterpriseCategory ||
                'ALL'
            ]?.map((menuTabs, idx) => {
              return (
                <>
                  <div
                    className={`menu-list text-black-60 hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l rounded-r-lg border-l-4 border-transparent p-3 text-sm font-normal leading-6`}
                    onClick={() => {
                      handleMenuTabClick(menuTabs?.label);
                    }}
                  >
                    <div
                      key={idx}
                      className={['flex cursor-pointer gap-2'].join(' ')}
                    >
                      <Image
                        src={menuTabs?.icon}
                        alt={menuTabs?.label}
                        height={24}
                        width={24}
                        className="inline w-6"
                      />
                      {showSideNavbar ? (
                        <span className="">
                          {getSideBarTitle(menuTabs?.title)}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                    {showSideNavbar && (
                      <Image
                        src={menuTabs?.caretIcon}
                        className={`${virtualStudioDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                        alt="Caret icon"
                        width="24"
                        height="24"
                        onClick={(e) => handleDropdown(e, menuTabs?.label)}
                      />
                    )}
                  </div>

                  <div
                    className={`${virtualStudioDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                  >
                    <ul className="pl-5">
                      {menuTabs.subMenu?.map((subMenuItem, subIdx) => {
                        // const isDisabled = subMenuItem.isDisabled || (subMenuItem.label === "360spin" && !props?.show360)  || (subMenuItem.label === "videoTour" && !optedEnterpriseFeature?.videoProcessing);
                        return showSideNavbar ? (
                          <li key={subIdx}>
                            <div
                              key={subIdx}
                              className={[
                                activeSubTab === subMenuItem.label
                                  ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                  : 'text-black-60 border-transparent',
                                'hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                              ].join(' ')}
                              onClick={() => {
                                handleMenuSubTabClick(subMenuItem.label);
                              }}
                            >
                              <Image
                                src={subMenuItem.icon}
                                alt={subMenuItem.label}
                                height={24}
                                width={24}
                                className={`${activeSubTab === subMenuItem.label ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'} inline w-6`}
                              />
                              {showSideNavbar ? (
                                <span className="">
                                  {getSideBarTitle(subMenuItem.title)}
                                </span>
                              ) : (
                                ''
                              )}
                              {/* {isDisabled && showcoming && <Image src={subMenuItem.comingSoon} alt="Coming soon" height={66} width={66} className="!important opacity-100 grayscale-0" />} */}
                              {showBannerForTab(subMenuItem?.label) && (
                                <span
                                  className={`border-black-10 rounded-2xl border-[1px] px-2 text-[10px] font-medium leading-[18px] ${activeSubTab === subMenuItem.label ? 'bg-green-lighter text-green-darker' : 'bg-gray-lightest text-blue-darkest'}`}
                                >
                                  {t('console.common.sideBarTabs.freeTrial')}
                                </span>
                              )}
                            </div>
                          </li>
                        ) : (
                          <li key={subIdx}>
                            <div
                              key={subIdx}
                              className={[
                                activeSubTab === subMenuItem.label
                                  ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                  : 'text-black-60 border-transparent',
                                'hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 text-sm font-normal leading-6',
                              ].join(' ')}
                              onClick={() => {
                                handleMenuSubTabClick(subMenuItem.label);
                              }}
                            >
                              <Image
                                src={subMenuItem.icon}
                                alt={subMenuItem.label}
                                height={18}
                                width={18}
                                className={`${activeSubTab === subMenuItem.label ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'}`}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              );
            })}
          {(activeTab === 'organization' || activeTab === 'settings') &&
            sidebarHeadings?.ORGANIZATION[
              enterpriseTeamReducer?.enterprise?.category_id ||
                enterpriseCategory ||
                'ALL'
            ]?.map((menuTabs, idx) => {
              return menuTabs?.label === 'backToHome' ? (
                <div
                  className={`menu-list text-black-60 hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l rounded-r-lg border-l-4 border-transparent p-3 text-sm font-normal leading-6`}
                  onClick={() => {
                    handleMenuTabClick('home');
                  }}
                >
                  <div
                    key={idx}
                    className={['flex cursor-pointer gap-2'].join(' ')}
                  >
                    <Image
                      src={menuTabs?.icon}
                      alt={menuTabs?.label}
                      height={24}
                      width={24}
                      className="inline w-6"
                    />
                    {showSideNavbar ? (
                      <span className="">
                        {getSideBarTitle(menuTabs?.title)}
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              ) : menuTabs?.label === 'organization' ? (
                <>
                  <div
                    className={`menu-list text-black-60 hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l rounded-r-lg border-l-4 border-transparent p-3 text-sm font-normal leading-6`}
                    onClick={() => {
                      handleMenuTabClick(menuTabs?.label);
                    }}
                  >
                    <div
                      key={idx}
                      className={['flex cursor-pointer gap-2'].join(' ')}
                    >
                      <Image
                        src={menuTabs?.icon}
                        alt={menuTabs?.label}
                        height={24}
                        width={24}
                        className="inline w-6"
                      />
                      {showSideNavbar ? (
                        <span className="">
                          {getSideBarTitle(menuTabs?.title)}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                    {showSideNavbar && (
                      <Image
                        src={menuTabs?.caretIcon}
                        className={`${organizationDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                        alt="Caret icon"
                        width="24"
                        height="24"
                        onClick={(e) => handleDropdown(e, menuTabs?.label)}
                      />
                    )}
                  </div>

                  <div
                    className={`${organizationDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                  >
                    <ul className="pl-5">
                      {menuTabs.subMenu?.map((subMenuItem, subIdx) => {
                        return toRenderUI(subMenuItem) ? (
                          <li key={subIdx}>
                            <div
                              key={subIdx}
                              className={[
                                activeSubTab === subMenuItem.label
                                  ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                  : 'text-black-60 border-transparent',
                                'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                              ].join(' ')}
                              onClick={() => {
                                handleMenuSubTabClick(subMenuItem.label);
                              }}
                            >
                              <Image
                                src={subMenuItem.icon}
                                alt={subMenuItem.label}
                                height={24}
                                width={24}
                                className="inline w-6"
                              />
                              {showSideNavbar ? (
                                <span className="">
                                  {getSideBarTitle(subMenuItem.title)}
                                </span>
                              ) : (
                                ''
                              )}
                            </div>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                </>
              ) : toRenderUI(menuTabs) ? (
                <>
                  <div
                    className={`menu-list text-black-60 hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l rounded-r-lg border-l-4 border-transparent p-3 text-sm font-normal leading-6`}
                    onClick={() => {
                      handleMenuTabClick(menuTabs?.label);
                    }}
                  >
                    <div
                      key={idx}
                      className={['flex cursor-pointer gap-2'].join(' ')}
                    >
                      <Image
                        src={menuTabs?.icon}
                        alt={menuTabs?.label}
                        height={24}
                        width={24}
                        className="inline w-6"
                      />
                      {showSideNavbar ? (
                        <span className="">
                          {getSideBarTitle(menuTabs?.title)}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                    {showSideNavbar && (
                      <Image
                        src={menuTabs?.caretIcon}
                        className={`${settingsDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                        alt="Caret icon"
                        width="24"
                        height="24"
                        onClick={(e) => handleDropdown(e, menuTabs?.label)}
                      />
                    )}
                  </div>

                  <div
                    className={`${settingsDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                  >
                    <ul className="pl-5">
                      {menuTabs.subMenu?.map((subMenuItem, subIdx) => {
                        return (
                          <li key={subIdx}>
                            <div
                              key={subIdx}
                              className={[
                                activeSubTab === subMenuItem.label
                                  ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                  : 'text-black-60 border-transparent',
                                'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                              ].join(' ')}
                              onClick={() => {
                                handleMenuSubTabClick(subMenuItem.label);
                              }}
                            >
                              <Image
                                src={subMenuItem.icon}
                                alt={subMenuItem.label}
                                height={24}
                                width={24}
                                className="inline w-6"
                              />
                              {showSideNavbar ? (
                                <span className="">
                                  {getSideBarTitle(subMenuItem.title)}
                                </span>
                              ) : (
                                ''
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              ) : null;
            })}
        </div>
        {(enterpriseTeamReducer?.enterprise?.category_id ||
          enterpriseCategory ||
          'ALL') === defaultEnterprise?.prodCatAuto ||
          (enterpriseTeamReducer?.enterprise?.category_id ||
            enterpriseCategory ||
            'ALL') === defaultEnterprise?.prodCatEcom}
        <div
          className={`${showSideNavbar ? 'sub-section' : 'sub-section-shrinked'}`}
        >
          {/* <div className='text-sm font-semibold text-black-60 px-3 pb-3 mb-1'>{showSideNavbar ? 'Manage' : ''}</div> */}
          {activeTab !== 'organization' &&
            activeTab !== 'settings' &&
            sidebarHeadings?.MENU[
              enterpriseTeamReducer?.enterprise?.category_id ||
                enterpriseCategory ||
                'ALL'
            ]?.map((menuTabs, idx) => {
              const isInventory = menuTabs.label === 'inventory';
              const isActiveInventory =
                menuTabs?.label === 'inventory' &&
                props?.isSidebarInventoryCoachVisible;
              if (
                menuTabs.label === 'website-builder' &&
                (!enterpriseTeamReducer?.selectedTeam?.is_website_builder ||
                  window.location.host == 'console.carlens.ai')
              ) {
                return null;
              }
              if (
                menuTabs.label === 'inventory' &&
                !hasInventoryAccess() &&
                enterpriseTeamVersion === 'v1'
              ) {
                return null;
              }
              if (menuTabs.label === 'project' && hasInventoryAccess()) {
                return null;
              }
              if (
                menuTabs.label === 'marketing' &&
                (!enterpriseTeamReducer?.selectedTeam?.is_website_builder ||
                  !showMarketingTab)
              ) {
                return null;
              }
              if (
                menuTabs.label === 'integrations' &&
                !hasIntegrationsAccess()
              ) {
                return null;
              }
              return toRenderUI(menuTabs) ? (
                menuTabs?.label === 'website-builder' &&
                !authReducer?.resellerData?.is_reseller ? (
                  <div key={idx}>
                    <div
                      className={`flex items-center justify-between gap-1 ${activeTab === menuTabs?.label && !isBoarding ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold' : 'text-black-60 border-transparent font-normal'} menu-list hover:bg-blue-4 mb-1 items-center rounded-l rounded-r-lg border-l-4 p-3 text-sm leading-6`}
                      onClick={(e) => websiteDropdownClick(e)}
                    >
                      <div
                        key={idx}
                        className={['flex cursor-pointer gap-2'].join(' ')}
                      >
                        <Image
                          src={menuTabs?.icon}
                          alt={menuTabs?.label}
                          height={24}
                          width={24}
                          className="inline w-6"
                        />
                        {showSideNavbar ? (
                          <span className="">
                            {getSideBarTitle(menuTabs?.title)}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      {checkForWebsiteBuilder !== 'default' && isBoarding && (
                        <>
                          {showSideNavbar && (
                            <Image
                              src={menuTabs?.caretIcon}
                              className={`${builderDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                              alt="Caret icon"
                              width="24"
                              height="24"
                              onClick={(e) =>
                                handleDropdown(e, menuTabs?.label)
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                    {checkForWebsiteBuilder !== 'default' && isBoarding && (
                      <>
                        <div
                          className={`${builderDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                        >
                          <ul className="pl-5">
                            {menuTabs?.dropdownData?.map((list, indx) => {
                              if (
                                !configData?.ga_property_id &&
                                list.label === 'websiteAnalytics'
                              ) {
                                return null;
                              }
                              return (
                                <li key={indx}>
                                  <div
                                    key={indx}
                                    className={[
                                      activeWebsiteLabel === list?.label
                                        ? 'active bg-blue-4 text-blue-light font-semibold'
                                        : 'text-black-60 border-transparent font-normal',
                                      'hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l rounded-r-lg p-3 text-sm leading-6',
                                    ].join(' ')}
                                    onClick={() => {
                                      handleSubMenuClick(list?.label);
                                    }}
                                  >
                                    <Image
                                      src={list?.icon}
                                      alt={list?.label}
                                      height={24}
                                      width={24}
                                      className={`${activeWebsiteLabel === list?.label ? '' : 'opacity-60 grayscale'} inline w-6`}
                                    />
                                    {showSideNavbar ? (
                                      <span className="">
                                        {getSideBarTitle(list?.title)}
                                      </span>
                                    ) : (
                                      ''
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </>
                    )}
                    {/* {menuTabs?.label === "website-builder" && <div className="divider !mt-3"></div>} */}
                  </div>
                ) : menuTabs?.label === 'crm' && showInventoryListings ? (
                  <>
                    <div
                      className={`flex cursor-pointer items-center ${activeTab === menuTabs?.label ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold' : 'text-black-60 border-transparent font-normal'} menu-list hover:bg-blue-4 mb-1 rounded-l rounded-r-lg border-l-4 p-3 text-sm leading-6`}
                      onClick={(e) => handleMenuTabClick(menuTabs?.label)}
                    >
                      <div
                        key={idx}
                        className={['flex cursor-pointer gap-2'].join(' ')}
                      >
                        <Image
                          src={menuTabs?.icon}
                          alt={menuTabs?.label}
                          height={24}
                          width={24}
                          className="inline w-6"
                        />
                        {showSideNavbar ? (
                          <span className="">
                            {getSideBarTitle(menuTabs?.title)}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  </>
                ) : menuTabs?.label === 'marketing' && showMarketingTab ? (
                  <>
                    <div
                      className={[
                        'menu-list text-black-60 hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l rounded-r-lg border-l-4 border-transparent p-3 text-sm font-normal leading-6',
                      ].join(' ')}
                      onClick={() => {
                        setMarketingDropdown(!marketingDropdown);
                      }}
                    >
                      <div
                        key={idx}
                        className={['flex cursor-pointer gap-2'].join(' ')}
                      >
                        <Image
                          src={menuTabs?.icon}
                          alt={menuTabs?.label}
                          height={24}
                          width={24}
                          className="inline w-6"
                        />
                        {showSideNavbar ? (
                          <span className="">
                            {getSideBarTitle(menuTabs?.title)}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      {showSideNavbar && (
                        <Image
                          src={menuTabs?.caretIcon}
                          className={`${marketingDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                          alt="Caret icon"
                          width="24"
                          height="24"
                          onClick={(e) => handleDropdown(e, menuTabs?.label)}
                        />
                      )}
                    </div>

                    <div
                      className={`${marketingDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                    >
                      <ul className="pl-5">
                        {menuTabs.subMenu?.map((subMenuItem, subIdx) => {
                          const pluginState = pluginStates[subMenuItem.id];
                          if (!pluginState) return null;
                          const isDisabled = pluginState.state === 'disabled';
                          const isHidden = pluginState.state === 'hidden';
                          const isEnabled = pluginState.state === 'enabled';

                          if (isHidden) return null;

                          return (
                            <li key={subIdx}>
                              <div
                                key={subIdx}
                                className={[
                                  activeSubTab === subMenuItem.label
                                    ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                    : 'text-black-60 border-transparent',
                                  'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                                ].join(' ')}
                                onClick={() => {
                                  if (isEnabled) {
                                    handleMenuSubTabClick(subMenuItem.label);
                                  }
                                }}
                              >
                                <Image
                                  src={subMenuItem.icon}
                                  alt={subMenuItem.label}
                                  height={24}
                                  width={24}
                                  className="inline w-6"
                                />
                                {showSideNavbar ? (
                                  <span className="">
                                    {getSideBarTitle(subMenuItem.title)}
                                  </span>
                                ) : (
                                  ''
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : menuTabs?.label === 'inventory' ? (
                  <>
                    <div
                      className={[
                        'menu-list text-black-60 hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-l rounded-r-lg border-l-4 border-transparent p-3 text-sm font-normal leading-6',
                        isInventory && props?.isSidebarInventoryCoachVisible
                          ? 'relative z-30 bg-white hover:bg-white'
                          : '',
                      ].join(' ')}
                      onClick={() => {
                        handleMenuTabClick(menuTabs?.label);
                      }}
                    >
                      <div
                        key={idx}
                        className={['flex cursor-pointer gap-2'].join(' ')}
                      >
                        <Image
                          src={menuTabs?.icon}
                          alt={menuTabs?.label}
                          height={24}
                          width={24}
                          className="inline w-6"
                        />
                        {showSideNavbar ? (
                          <span className="">
                            {getSideBarTitle(menuTabs?.title)}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      {showSideNavbar && (
                        <Image
                          src={menuTabs?.caretIcon}
                          className={`${myVehiclesDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                          alt="Caret icon"
                          width="24"
                          height="24"
                          onClick={(e) => handleDropdown(e, menuTabs?.label)}
                        />
                      )}
                    </div>

                    <div
                      className={`${myVehiclesDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                    >
                      <ul className="pl-5">
                        {menuTabs.subMenu?.map((subMenuItem, subIdx) => {
                          if (
                            !showInventoryListings &&
                            subMenuItem.label === 'inventory'
                          ) {
                            return null;
                          }
                          return showSideNavbar ? (
                            <>
                              <li key={subIdx}>
                                <div
                                  key={subIdx}
                                  className={[
                                    activeSubTab === subMenuItem.label
                                      ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                      : 'text-black-60 border-transparent',
                                    'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                                  ].join(' ')}
                                  onClick={() => {
                                    handleMenuSubTabClick(subMenuItem.label);
                                  }}
                                >
                                  <Image
                                    src={subMenuItem.icon}
                                    alt={subMenuItem.label}
                                    height={24}
                                    width={24}
                                    className="inline w-6 flex-shrink-0"
                                  />
                                  {showSideNavbar ? (
                                    <span className="">
                                      {getSideBarTitle(subMenuItem.title)}
                                    </span>
                                  ) : (
                                    ''
                                  )}
                                  {showSideNavbar && subMenuItem.subMenu && (
                                    <div className="flex w-full justify-end">
                                      <Image
                                        src={menuTabs?.caretIcon}
                                        className={`${inventoryDropdown ? '' : '-rotate-90'} cursor-pointer transition-all duration-300 ease-in-out`}
                                        alt="Caret icon"
                                        width="24"
                                        height="24"
                                        onClick={(e) =>
                                          handleDropdown(
                                            e,
                                            menuTabs?.label,
                                            true
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              </li>
                              {subMenuItem.subMenu && (
                                <div
                                  className={`${inventoryDropdown ? 'max-h-full' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}
                                >
                                  <ul className="pl-5">
                                    {subMenuItem.subMenu.map(
                                      (nestedItem, nestedIdx) => (
                                        <li key={nestedIdx}>
                                          <div
                                            className={[
                                              activeSubTab === nestedItem.label
                                                ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                                : 'text-black-60 border-transparent',
                                              'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                                            ].join(' ')}
                                            onClick={() => {
                                              handleMenuSubTabClick(
                                                nestedItem.label
                                              );
                                            }}
                                          >
                                            <Image
                                              src={nestedItem.icon}
                                              alt={nestedItem.label}
                                              height={18}
                                              width={18}
                                              className="inline w-6"
                                            />
                                            {showSideNavbar ? (
                                              <span className="">
                                                {getSideBarTitle(
                                                  nestedItem.title
                                                )}
                                              </span>
                                            ) : (
                                              ''
                                            )}
                                          </div>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : (
                            <li key={subIdx}>
                              <div
                                key={subIdx}
                                className={[
                                  activeSubTab === subMenuItem.label
                                    ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                    : 'text-black-60 border-transparent',
                                  'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 text-sm font-normal leading-6',
                                ].join(' ')}
                                onClick={() => {
                                  handleMenuSubTabClick(subMenuItem.label);
                                }}
                              >
                                <Image
                                  src={subMenuItem.icon}
                                  alt={subMenuItem.label}
                                  height={18}
                                  width={18}
                                  className="inline w-6"
                                />
                                {/* {showSideNavbar ? <span className="">{subMenuItem.title}</span> : ""} */}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : menuTabs?.label == 'analytics' ? (
                  hasProductAnalyticsAccess ? (
                    <>
                      <div
                        className={`flex cursor-pointer items-center justify-between gap-1 ${activeTab === menuTabs?.label ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold' : 'text-black-60 border-transparent font-normal'} menu-list hover:bg-blue-4 mb-1 items-center rounded-l rounded-r-lg border-l-4 p-3 text-sm leading-6`}
                        onClick={() => {
                          handleMenuTabClick(menuTabs?.label);
                        }}
                        ref={isActiveInventory ? inventoryRef : null}
                      >
                        <div
                          key={idx}
                          className={['flex cursor-pointer gap-2'].join(' ')}
                        >
                          <Image
                            src={menuTabs?.icon}
                            alt={menuTabs?.label}
                            height={24}
                            width={24}
                            className="inline w-6"
                          />
                          {showSideNavbar ? (
                            <span className="">
                              {getSideBarTitle(menuTabs?.title)}
                            </span>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    </>
                  ) : null
                ) : menuTabs?.label == 'integrations' ? (
                  <React.Fragment key={idx}>
                    <div
                      ref={props?.integrationsRef || null}
                      className="relative rounded-2xl"
                      style={
                        props?.highlightIntegrationsDiv == 'sidebar'
                          ? {
                              background: 'white',
                              padding: '0.3rem',
                              zIndex: 20,
                            }
                          : {}
                      }
                    >
                      <div
                        key={idx}
                        className={`${activeTab === menuTabs?.label ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold' : 'text-black-60 border-transparent font-normal'} menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm leading-6`}
                        onClick={() => handleMenuTabClick(menuTabs?.label)}
                      >
                        <Image
                          src={menuTabs?.icon}
                          alt={menuTabs?.label}
                          height={24}
                          width={24}
                          className="inline w-6"
                        />
                        {showSideNavbar ? (
                          <span className="">
                            {getSideBarTitle(menuTabs?.title)}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment key={idx}>
                    {/* {menuTabs?.label === "support" && <div className="divider"></div>} */}
                    {menuTabs?.label === 'support' ||
                    menuTabs?.label === 'terms-and-conditions' ? (
                      <HideSpyneContent
                        isWhiteLabelComponent={
                          menuTabs?.label === 'terms-and-conditions'
                        }
                      >
                        <div
                          key={idx}
                          className={[
                            activeTab === menuTabs?.label
                              ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                              : 'text-black-60 border-transparent',
                            'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                          ].join(' ')}
                          onClick={() => {
                            handleMenuTabClick(menuTabs?.label);
                          }}
                        >
                          <Image
                            src={menuTabs?.icon}
                            alt={menuTabs?.label}
                            height={24}
                            width={24}
                            className="inline w-6"
                          />
                          {showSideNavbar ? (
                            <span className="">
                              {getSideBarTitle(menuTabs?.title)}
                            </span>
                          ) : (
                            ''
                          )}
                        </div>
                      </HideSpyneContent>
                    ) : (
                      <React.Fragment key={idx}>
                        {!(
                          authReducer?.resellerData?.is_reseller &&
                          (menuTabs?.label === 'website-builder' ||
                            menuTabs?.label === 'crm')
                        ) && (
                          <div
                            key={idx}
                            className={[
                              activeTab === menuTabs?.label || isActiveInventory
                                ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
                                : 'text-black-60 border-transparent',
                              'menu-list hover:bg-blue-4 mb-1 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                              isInventory &&
                              props?.isSidebarInventoryCoachVisible
                                ? 'relative z-30 bg-white hover:bg-white'
                                : '',
                            ].join(' ')}
                            onClick={() => {
                              handleMenuTabClick(menuTabs?.label);
                            }}
                          >
                            <Image
                              src={menuTabs?.icon}
                              alt={menuTabs?.label}
                              height={24}
                              width={24}
                              className="inline w-6"
                            />
                            {showSideNavbar ? (
                              <span className="">
                                {getSideBarTitle(menuTabs?.title)}
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    )}
                    {menuTabs?.label === 'converse-ai' && (
                      <div className="divider"></div>
                    )}
                  </React.Fragment>
                )
              ) : null;
            })}
        </div>
        {/* <div className='divider'></div> */}
      </div>
      <div className="absolute bottom-1 left-0 w-full text-center">
        {/* <HideSpyneContent>
                  {toRenderUI("", permissions?.MODIFY_ENTERPRISE_PLAN_ALL) ? (
                      <Link href={redirectLinks?.upgradeRedirectUrl} rel="noopener noreferrer" target="_blank">
                          <button className={[showSideNavbar ? "gradient-btn" : "gradient-btn2", "inline-flex w-full items-center justify-center gap-3 rounded-lg px-3 py-3  text-sm font-bold leading-6 text-white"].join(" ")}>
                              <Image src="https://spyne-static.s3.amazonaws.com/console/project/sidebar/upgradeIcon.svg" alt="upgrade now" height={25} width={25} className="my-auto" />
                              {showSideNavbar ? "Upgrade" : ""}
                          </button>
                      </Link>
                  ) : null}
              </HideSpyneContent> */}
        {activeTab !== 'organization' &&
          activeTab !== 'settings' &&
          sidebarHeadings?.ORGANIZATION[
            enterpriseTeamReducer?.enterprise?.category_id ||
              enterpriseCategory ||
              'ALL'
          ]?.map((menuTabs, idx) => {
            return toRenderUI(menuTabs, permissions?.VIEW_USER_ALL) ? (
              menuTabs?.label === 'organization' ? (
                <>
                  <div className="dividerForOrg"></div>
                  <div
                    key={idx}
                    className={[
                      activeTab === menuTabs?.label
                        ? 'active border-blue-light bg-blue-4 text-blue-light px-6 font-semibold'
                        : 'text-black-60 border-transparent px-6',
                      'menu-list hover:bg-blue-4 flex cursor-pointer items-center gap-2 rounded-l-[4px] rounded-r-lg border-l-4 p-3 text-sm font-normal leading-6',
                    ].join(' ')}
                    onClick={() => {
                      handleMenuTabClick(menuTabs?.label);
                    }}
                  >
                    <Image
                      src={menuTabs?.icon}
                      alt={menuTabs?.label}
                      height={24}
                      width={24}
                      className="inline w-6"
                    />
                    {showSideNavbar ? (
                      <span className="">
                        {getSideBarTitle(menuTabs?.title)}
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </>
              ) : null
            ) : null;
          })}
        {/* <HideSpyneContent isWhiteLabelComponent={false}>
                  <div>
                      <p className="inline text-xs font-medium text-black-80">{poweredByConfig?.text}</p>
                      <Image src={poweredByConfig?.logoImage} width={58} height={16} className="inline" />
                  </div>
              </HideSpyneContent> */}
      </div>
      {showWarningModal && (
        <WarningModal>
          <div className="d-flex w-full content-end items-center">
            <div className="flex-none text-right">
              <span
                className="text-black-60 cursor-pointer text-xl"
                onClick={(e) => hideWarningModal(e, 'icon')}
              >
                &#10005;
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div>
              <Image
                src="https://spyne-static.s3.amazonaws.com/warning-circle.svg"
                alt=""
                height={55}
                width={55}
              />
            </div>
            <h1 className="text-black-80 mb-1 mt-1 text-lg font-bold">
              Unsaved Changes
            </h1>
            <p className="font-normal text-gray-600">
              Your report hasn’t been submitted yet, are you sure you want to
              leave?
            </p>
            <div
              className={[
                styles['modal-button'],
                'download-modal col mt-7 inline-flex w-full gap-4',
              ].join(' ')}
            >
              <Button
                type={BUTTON_TYPES.SECONDARY}
                buttonPlaceHolder="Discard my changes"
                onClickHandler={(e) => hideWarningModal(e, 'button')}
              ></Button>
              <Button
                type={BUTTON_TYPES.PRIMARY}
                buttonPlaceHolder="Continue reporting"
                onClickHandler={continueReporting}
              ></Button>
            </div>
          </div>
        </WarningModal>
      )}

      {enterpriseReducer?.selectedTeam?.website_blocker_onboarding &&
        WebsiteBuilderBlockerForm &&
        isOnBoardingDone && (
          <SpecificModal
            showSideNavbar={showSideNavbar}
            insetClass={'backdrop-blur'}
          >
            <BlockerForm
              isBoardingLead={isBoardingLead}
              setWebsiteBuilderBlockerForm={setWebsiteBuilderBlockerForm}
            />
          </SpecificModal>
        )}
    </div>
  );

  const renderV2Sidebar = () => {
    return (
      <SidebarV2
        showSideNavbar={showSideNavbar}
        showInventoryCoachMarks={showInventoryCoachMarks}
        reRenderSidebar={reRenderSidebar}
        updateWebbuilderSteps={updateWebbuilderSteps}
        setRouteToSlugFilterPage={setRouteToSlugFilterPage}
        setShowSideNavbar={setShowSideNavbar}
        home={home}
        isImagesEnabled={isImagesEnabled}
        is360Enabled={is360Enabled}
        isVideoTourEnabled={isVideoTourEnabled}
        showInventoryListings={showInventoryListings}
        enterpriseTeamReducer={enterpriseTeamReducer}
        enterpriseReducer={enterpriseReducer}
        staticDataWeb={staticDataWeb}
        t={t}
        vsversion={vsversion}
        setModalOpen={setModalOpen}
        modalOpen={modalOpen}
        helpAndSupportOpen={helpAndSupportOpen}
        setHelpAndSupportOpen={setHelpAndSupportOpen}
      />
    );
  };
  return <>{vsversion === 'v1' ? renderV1Sidebar() : renderV2Sidebar()}</>;
}

export default Sidebar;
