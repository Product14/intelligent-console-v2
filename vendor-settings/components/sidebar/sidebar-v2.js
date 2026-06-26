import { useDispatch, useSelector } from '@spyne-console/store';
import { fetchInventoryStatus } from '@spyne-console/store';

import { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import axios from 'axios';

import { useRouting } from '@spyne-console/hooks';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';
import {
  getPermissionObject,
  sessionStorageKeys,
} from '@spyne-console/utils/config';
import isInventoryV5 from '@spyne-console/utils/isInventoryV5';
import { getItem } from '@spyne-console/utils/local-storage';
import { GetPermissionClientObject } from '@spyne-console/utils/permissionClientObject';
import showNewInventoryUi from '@spyne-console/utils/showNewInventoryUi';

import {
  MAIN_TAB_ROUTES,
  SUBMENU_ROUTES,
  getSubmenuIcon,
  sidebarHeadingsV2,
} from './config-v2';

const DEFAULT_CATEGORY_ID = 'cat_d8R14zUNE';
const INVENTORY_VERSION_KEY = 'inventory_version';

const CROSS_APP_PREFIXES = ['/inventory/v2', '/inventory/v3'];

const PRODUCT_SUBMENU_LABELS = new Set(['studioai', 'inventoryai']);

const SidebarV2 = (props) => {
  const {
    showSideNavbar,
    setShowSideNavbar,
    showInventoryCoachMarks,
    enterpriseTeamReducer,
    setRouteToSlugFilterPage,
    t,
    setModalOpen,
    modalOpen,
    helpAndSupportOpen,
    setHelpAndSupportOpen,
  } = props;

  // State
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState('');
  const [params, setParams] = useState({ enterpriseId: '', teamId: '' });
  const [permissionObject, setPermissionObject] = useState({});
  const [enterpriseCategory, setEnterpriseCategory] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [inventoryDropdown, setInventoryDropdown] = useState(
    props.fromInventory || false
  );
  const [sidebarHeadings, setSidebarHeadings] = useState(sidebarHeadingsV2);
  const [mobileSubmenuView, setMobileSubmenuView] = useState(null);
  const [enterpriseProducts, setEnterpriseProducts] = useState(
    () => getItem('enterpriseProducts') || []
  );

  // Refs
  const menuBoxRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Hooks
  const dispatch = useDispatch();
  const router = useRouting();
  const showNewInventoryUiValue = useSelector(
    (state) => state.inventoryReducer.showNewInventoryUi
  );
  const showNewInventoryUI = showNewInventoryUi() || showNewInventoryUiValue;

  const getProductMenuOverride = (menuItem) => {
    if (showNewInventoryUI && menuItem?.label === 'inventoryai') {
      return 'hidden';
    }
    if (isInventoryV5() && PRODUCT_SUBMENU_LABELS.has(menuItem?.label)) {
      return {
        ...menuItem,
        subMenu: null,
        dropdownData: null,
      };
    }
    return null;
  };

  // Cross-app navigation helper — uses full page load for routes
  // that belong to a different microfrontend (e.g. /inventory/v2/*)
  const navigateCrossApp = (pathname, query) => {
    const isCrossApp = CROSS_APP_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (isCrossApp) {
      const queryString = new URLSearchParams(query).toString();
      window.location.href = queryString
        ? `${pathname}?${queryString}`
        : pathname;
    } else {
      router.push({ pathname, query });
    }
  };

  // Derived values
  const authReducer = useSelector((state) => state.authReducer);
  const isReseller = authReducer?.resellerData?.is_reseller || false;
  const enterpriseId =
    enterpriseTeamReducer?.enterprise?.enterprise_id ||
    JSON.parse(sessionStorage.getItem(sessionStorageKeys.selectedEnterprise))
      ?.enterprise_id ||
    '';
  const teamId =
    enterpriseTeamReducer?.selectedTeam?.team_id ||
    JSON.parse(sessionStorage.getItem(sessionStorageKeys.selectedTeam))
      ?.team_id ||
    '';
  const enterpriseTeamQuery = { enterprise_id: enterpriseId, team_id: teamId };
  const categoryId =
    enterpriseTeamReducer?.enterprise?.category_id || DEFAULT_CATEGORY_ID;

  const hasInventory = enterpriseProducts?.includes('inventory');
  const inventoryVersion = localStorage.getItem(INVENTORY_VERSION_KEY) || 'v2';

  const [canShowSmartCampaigns, setCanShowSmartCampaigns] = useState(false);

  const smartCampaignSubMenu = [
    {
      title: 'CVS',
      label: 'cvs',
      icon: 'https://spyne-static.s3.amazonaws.com/console/images_active.svg',
    },
    {
      title: 'Smart Campaigns',
      label: 'smart-campaigns',
      icon: 'https://spyne-static.s3.amazonaws.com/console/images_active.svg',
    },
  ];

  // Sidebar is always collapsed on desktop - set parent state to false
  useEffect(() => {
    // Only auto-collapse on desktop, not mobile
    if (window.innerWidth >= 768) {
      setShowSideNavbar(false);
    }
  }, []);

  // Translation function for sidebar titles
  const getSideBarTitle = (title) => {
    const titleMap = {
      Home: t('console.common.sideBarTabs.Home'),
      'Studio AI': t('console.common.sideBarTabs.VirtualStudiov2'),
      'Inventory AI': t('console.common.sideBarTabs.myVehiclesv2'),
      // 'Connect AI': t('console.common.sideBarTabs.crm'),
      // 'connect AI': t('console.common.sideBarTabs.crm'),
      'Converse AI': t('console.common.sideBarTabs.converseAi'),
      'Marketing AI': t('console.common.sideBarTabs.websitev2'),
      Analytics: t('console.common.sideBarTabs.analytics'),
      'Developer Hub': t('console.common.sideBarTabs.Developer Hub'),
      Integrations: t('console.common.sideBarTabs.integrations'),
      Organization: t('console.common.sideBarTabs.organization'),
      Settings: t('console.common.sideBarTabs.Settings'),
      Overview: t('console.common.sideBarTabs.subMenus.myVehicles.overview'),
      Listing: t('console.common.sideBarTabs.subMenus.myVehicles.listing'),
      Sourcing: t('console.common.sideBarTabs.subMenus.myVehicles.sourcing'),
      Reports: t('console.common.sideBarTabs.subMenus.crm.reports'),
      'Call Logs': t('console.common.sideBarTabs.subMenus.crm.callLogs'),
      'AI Workforce': t(
        'console.common.sideBarTabs.subMenus.converseAi.workforce'
      ),
      'Call History': t(
        'console.common.sideBarTabs.subMenus.converseAi.history'
      ),
      Templates: t('console.common.sideBarTabs.subMenus.website.templates'),
      'Home Page': t('console.common.sideBarTabs.subMenus.website.homePage'),
      'List Page': t('console.common.sideBarTabs.subMenus.website.listPage'),
      'Details Page': t(
        'console.common.sideBarTabs.subMenus.website.detailsPage'
      ),
      'Manage Forms': t(
        'console.common.sideBarTabs.subMenus.website.manageForms'
      ),
      'Page Builder': t(
        'console.common.sideBarTabs.subMenus.website.pageBuilder'
      ),
      'Page Speed Insight': t(
        'console.common.sideBarTabs.subMenus.website.pageSpeedInsight'
      ),
      SEO: t('console.common.sideBarTabs.subMenus.website.seo'),
      'Website Analytics': t(
        'console.common.sideBarTabs.subMenus.website.websiteAnalytics'
      ),
      Plugin: t('console.common.sideBarTabs.subMenus.website.plugin'),
      'Dealer Profile': t(
        'console.common.sideBarTabs.subMenus.organization.dealerProfile'
      ),
      Users: t('console.common.sideBarTabs.subMenus.organization.users'),
      Teams: t('console.common.sideBarTabs.subMenus.organization.teams'),
      General: t('console.common.sideBarTabs.subMenus.settings.general'),
      Studio: t('console.common.sideBarTabs.subMenus.settings.studio'),
      App: t('console.common.sideBarTabs.subMenus.settings.app'),
      CVS: t('console.common.sideBarTabs.subMenus.studioAi.cvs'),
      'Smart Campaigns': 'Smart Campaigns',
    };

    return titleMap[title] || title;
  };

  // Handle submenu item clicks
  const handleSubMenuClick = (menuLabel) => {
    try {
      const route = SUBMENU_ROUTES[menuLabel];
      if (!route) return;

      // Clear slug filter if needed
      if (route.clearSlugFilter && setRouteToSlugFilterPage) {
        setRouteToSlugFilterPage(false);
      }

      // Build query parameters
      const query =
        typeof route.query === 'function'
          ? route.query(enterpriseId, teamId)
          : enterpriseTeamQuery;

      // Navigate (uses full page load for cross-app routes)
      navigateCrossApp(route.pathname, query);

      // Update state
      setActiveSubTab(menuLabel);
      setActiveTab(route.tab);

      if (route.setInventoryDropdown) {
        setInventoryDropdown(true);
      }
    } catch (error) {
      console.error('Error in handleSubMenuClick:', error);
    }
  };

  // Detect active tab from current route
  const setSelectedTab = (path) => {
    try {
      // Route patterns
      const routePatterns = {
        ...(showNewInventoryUI
          ? {
              virtualstudio: {
                tab: 'studioai',
                subTab: {
                  images: 'images',
                  listing: 'listing',
                  listings: 'listing',
                  default: 'overview',
                  ...(canShowSmartCampaigns && {
                    'smart-campaigns': 'smart-campaigns',
                  }),
                },
              },
            }
          : {
              virtualstudio: {
                tab: 'studioai',
                subTabs: {
                  'smart-campaigns': 'smart-campaigns',
                  v2: 'cvs',
                  default: 'cvs',
                },
              },
              inventory: {
                tab: 'inventoryai',
                subTabs: {
                  listing: 'listing',
                  listings: 'listing',
                  dashboard: 'overview-inventoryai',
                  sourcing: 'sourcing',
                  media: 'media',
                  history: 'history',
                  default: 'overview-inventoryai',
                },
              },
            }),
        // virtualstudio: {
        //   tab: 'studioai',
        //   subTab: {
        //     images: 'images',
        //     listing: 'listing',
        //     listings: 'listing',

        //     default: 'overview',
        //   },
        // },
        // inventory: {
        //   tab: 'inventoryai',
        //   subTabs: {
        //     listing: 'listing',
        //     listings: 'listing',
        //     dashboard: 'overview-inventoryai',
        //     sourcing: 'sourcing',
        //     media: 'media',
        //     history: 'history',
        //     default: 'overview-inventoryai', },
        // },
        crm: {
          tab: 'crm',
          subTabs: {
            reports: 'reports',
            'call-logs': 'callLogs',
            'overview-crm': 'overview-crm',
            default: 'overview-crm',
          },
        },
        report: { tab: 'analytics' },
        integrations: { tab: 'more', subTab: 'integrations' },
        'converse-ai': {
          tab: 'converse-ai',
          subTabs: {
            '/converse-ai': 'overview-converse',
            // analytics: 'analytics',
            // Driven from Product Vercel Iframe

            reports: 'reports',
            calls: 'calls',
            agents: 'agents',
            service: 'service',
            conversations: 'conversations',
            campaign: 'campaign',
            customers: 'customers',
            'action-items': 'action-items',
            appointments: 'appointments',
            default: 'overview-converse',
          },
        },
        settings: {
          tab: 'settings',
          subTabs: {
            general: 'general',
            studio: 'studio',
            app: 'app',
            default: 'general',
          },
        },
        organization: {
          tab: 'more',
          subTabs: {
            users: 'users',
            teams: 'teams',
            enterprise: 'enterprise',
            dealer_profile: 'dealer_profile',
            default: 'dealer_profile',
          },
        },
        marketing: {
          tab: 'marketing',
          subTabs: {
            'google-vehicle-listing': 'google-vehicle-listing',
            'facebook-ads': 'facebook-ads',
            default: 'google-vehicle-listing',
          },
        },
        'website-builder': {
          tab: 'website-builder',
          subTabs: {
            templates: 'templates',
            'landing-page': 'landing-page',
            'list-page': 'list-page',
            'details-page': 'details-page',
            'manage-forms': 'manage-forms',
            'custom-pages': 'custom-pages',
            'page-speed-insight': 'page-speed-insight',
            migration: 'migration',
            seo: 'seo',
            analytics: 'websiteAnalytics',
            plugin: 'plugin',
            default: 'templates',
          },
        },
        home: { tab: 'home' },
        'developer-hub': { tab: 'more', subTab: 'developer-hub' },
      };

      // Find matching pattern
      for (const [pattern, config] of Object.entries(routePatterns)) {
        const condition = showNewInventoryUI
          ? path.includes(pattern) ||
            (path.includes('inventory') && pattern === 'virtualstudio')
          : path.includes(pattern);
        if (condition) {
          // revert to "path.includes(pattern)" later
          setActiveTab(config.tab);

          if (config.subTabs) {
            // Check for exact match first
            if (config.subTabs[path]) {
              setActiveSubTab(config.subTabs[path]);
            } else {
              // Check for partial matches
              const matchedSubTab = Object.keys(config.subTabs).find(
                (key) => key !== 'default' && path.includes(key)
              );
              setActiveSubTab(
                config.subTabs[matchedSubTab] || config.subTabs.default
              );
            }
          } else if (config.subTab) {
            setActiveSubTab(config.subTab);
          }

          return;
        }
      }

      // Default fallback
      setActiveTab('home');
    } catch (error) {
      console.error('Error in setSelectedTab:', error);
    }
  };
  // Handle main navigation
  const handleNavigation = (path, tab, subTab = '') => {
    setActiveTab(tab);

    if (subTab) {
      setActiveSubTab(subTab);
      navigateCrossApp(path, {
        activeSubTab: subTab,
        enterprise_id: enterpriseTeamReducer?.enterprise?.enterprise_id,
        team_id: enterpriseTeamReducer?.selectedTeam?.team_id,
      });
      return;
    }

    const newUiRoute = {
      // replace with studioai route in configv2 for release
      pathname: '/inventory/v2/overview',
      query: (enterpriseId, teamId) => ({
        enterprise_id: enterpriseId,
        team_id: teamId,
      }),
    };

    const route =
      showNewInventoryUI && tab === 'studioai'
        ? newUiRoute
        : MAIN_TAB_ROUTES[tab];
    if (!route) {
      router.push({ pathname: '/home', query: enterpriseTeamQuery });
      return;
    }

    const query =
      typeof route.query === 'function'
        ? route.query(enterpriseId, teamId)
        : enterpriseTeamQuery;

    navigateCrossApp(route.pathname, query);

    if (route.subTab) {
      setActiveSubTab(route.subTab);
    }
  };

  // Check permissions
  const checkPermissions = (menuItem) => {
    if (menuItem?.label === 'analytics' && isReseller) {
      return false;
    }
    if (menuItem?.label === 'converse-ai') {
      return enterpriseProducts.includes('conversationalAi');
    }

    if (menuItem?.label === 'integrations' && !hasIntegrationsAccess()) {
      return false;
    }

    if (
      enterpriseId &&
      teamId &&
      (menuItem?.label === 'settings' || menuItem?.label === 'organization')
    ) {
      const hasUserPermission =
        permissionObject?.user_role?.permissions?.hasOwnProperty(
          menuItem?.permission
        );
      const hasEnterprisePermission = permissionObject[
        enterpriseId
      ]?.enterprise_role?.permissions?.hasOwnProperty(menuItem?.permission);
      const hasTeamPermission = permissionObject?.[enterpriseId]?.[
        teamId
      ]?.permissions?.hasOwnProperty(menuItem?.permission);

      return hasUserPermission || hasEnterprisePermission || hasTeamPermission;
    }

    return true;
  };

  const hasIntegrationsAccess = () => {
    return GetPermissionClientObject('CHECK_INTEGRATION_ACCESS').status;
  };

  // Sidebar configuration
  const formSidebarConfig = (productsToggle) => {
    const updatedSidebarHeadings = JSON.parse(
      JSON.stringify(sidebarHeadingsV2)
    );
    if (updatedSidebarHeadings.PRODUCTS?.cat_d8R14zUNE) {
      updatedSidebarHeadings.PRODUCTS.cat_d8R14zUNE =
        updatedSidebarHeadings.PRODUCTS.cat_d8R14zUNE.map((heading) => ({
          ...heading,
          hidden: !productsToggle?.[heading.title] || false,
        }));
    }
    if (updatedSidebarHeadings.MENU) {
      Object.keys(updatedSidebarHeadings.MENU).forEach((categoryKey) => {
        const menuItems = updatedSidebarHeadings.MENU[categoryKey];
        if (!Array.isArray(menuItems)) return;
        updatedSidebarHeadings.MENU[categoryKey] = menuItems.map((heading) => {
          if (heading.label !== 'settings') return heading;
          return {
            ...heading,
            hidden: !productsToggle?.[heading.title] || false,
          };
        });
      });
    }
    return updatedSidebarHeadings;
  };

  const fetchSidebarConfig = async (enterpriseId, teamId) => {
    try {
      const URL = `${process.env.APP_BACKEND_BASEURL}/credit/v5/enterprise/get-subscribed-products-by-enterprise`;
      const response = await CentralAPIHandler.handleGetRequest(URL, {
        enterpriseId,
        teamId,
      });
      const productToggle = {};
      response?.data?.forEach((product) => {
        productToggle[product.title] = !product.hidden;
      });
      return productToggle;
    } catch (error) {
      console.error('Error fetching sidebar config:', error);
      return {};
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.WEBSITE_BACKEND}/dealers/v1/onboarding-steps?enterprise_id=${enterpriseId}&team_id=${teamId}`
      );

      if (response.data.error || !response.data.data) {
        return false;
      }

      return response?.data?.data?.onboarding_steps?.onboarding_done || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  };

  const scrollToActiveItem = () => {
    if (!menuBoxRef.current) return;

    const activeElement = menuBoxRef.current.querySelector('.active');
    if (activeElement) {
      const scrollTop =
        activeElement.offsetTop +
        3 * activeElement.getBoundingClientRect().height;
      menuBoxRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  };
  // onsole.log(h)

  // Render menu item
  const renderMenuItem = (section) => {
    return section?.[categoryId]?.map((menuItem) => {
      if (menuItem?.hidden) return null;

      const productMenuOverride = getProductMenuOverride(menuItem);
      if (productMenuOverride === 'hidden') {
        return null;
      }
      if (productMenuOverride) {
        return renderMenuItemLogic(productMenuOverride);
      }

      // When showNewInventoryUI is disabled, only show submenu if smart campaigns is enabled
      if (!showNewInventoryUI && menuItem?.label === 'studioai') {
        if (canShowSmartCampaigns) {
          return renderMenuItemLogic({
            ...menuItem,
            subMenu: smartCampaignSubMenu,
          });
        }
        // No smart campaigns — remove submenu, use default click behavior
        return renderMenuItemLogic({
          ...menuItem,
          subMenu: null,
          dropdownData: null,
        });
      }

      // Hide website-builder dropdown if onboarding not done
      if (menuItem?.label === 'website-builder' && !onboardingDone) {
        return renderMenuItemLogic({
          ...menuItem,
          dropdownData: null,
          subMenu: null,
        });
      }

      return renderMenuItemLogic(menuItem);
    });
  };

  const renderMenuItemLogic = (menuItem) => {
    const isActive = activeTab === menuItem?.label;
    const hasSubmenu = menuItem?.subMenu || menuItem?.dropdownData;
    let submenuItems = menuItem?.subMenu || menuItem?.dropdownData;

    if (!canShowSmartCampaigns && menuItem?.label === 'studioai') {
      submenuItems = submenuItems?.filter(
        (subItem) => subItem?.label !== 'smart-campaigns'
      );
    }

    const hasActiveSubItem = submenuItems?.some(
      (subItem) => activeSubTab === subItem?.label
    );

    if (!checkPermissions(menuItem)) {
      return null;
    }

    const menuItemClasses = [
      !hasSubmenu && isActive
        ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
        : hasActiveSubItem
          ? 'active border-blue-light bg-blue-4 text-blue-light font-semibold'
          : 'text-black-60 border-transparent',
      'menu-list group/item hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-lg text-sm font-normal leading-6',
      '!border-0 !px-1 !py-2',
    ].join(' ');

    const condition3 =
      showNewInventoryUI || canShowSmartCampaigns
        ? !isActive || menuItem?.label === 'studioai'
        : !isActive && menuItem?.label !== 'studioai';

    return (
      <div
        key={menuItem?.label}
        className="group relative mb-1"
        onMouseEnter={() => {
          if (hasSubmenu) {
            // Clear any pending timeout
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
            setHoveredMenu(menuItem?.label);
          }
        }}
        onMouseLeave={() => {
          if (hasSubmenu) {
            // Add 100ms delay before closing
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 100);
          }
        }}
      >
        <div
          className={menuItemClasses}
          onClick={() =>
            handleNavigation(`/${menuItem?.label}`, menuItem?.label)
          }
        >
          <div className="flex w-full items-center justify-center">
            <div className="flex w-full flex-col items-center gap-0.5 transition-all duration-300">
              <div className="relative transition-transform duration-200 group-hover:scale-105">
                <Image
                  src={menuItem?.icon_inactive || menuItem?.icon}
                  alt={menuItem?.title}
                  width={24}
                  height={24}
                  className={`h-6 w-6 transition-opacity duration-200 ${
                    (!hasSubmenu && isActive) || hasActiveSubItem
                      ? 'opacity-0'
                      : 'opacity-100 group-hover/item:opacity-0'
                  }`}
                />
                <Image
                  src={menuItem?.icon}
                  alt={menuItem?.title}
                  width={24}
                  height={24}
                  className={`absolute inset-0 h-6 w-6 transition-opacity duration-200 ${
                    (!hasSubmenu && isActive) || hasActiveSubItem
                      ? 'opacity-100'
                      : 'opacity-0 group-hover/item:opacity-100'
                  }`}
                />
              </div>
              <div
                className={`w-full max-w-full text-ellipsis text-center text-[9px] font-extrabold leading-tight transition-colors duration-200 ${
                  isActive || hasActiveSubItem
                    ? 'text-blue-light'
                    : 'text-black-60 group-hover:text-blue-light'
                }`}
                style={{ wordBreak: 'break-word' }}
              >
                {getSideBarTitle(menuItem?.title)}
              </div>
            </div>
          </div>
        </div>

        {/* Submenu - Only show if not on the current active tab */}
        {hasSubmenu &&
          hoveredMenu === menuItem?.label &&
          condition3 && ( // revert later with "!isActive"
            <>
              {/* Invisible bridge to prevent hover gap - only covers the gap area */}
              <div
                className="fixed left-[70px] top-[56px] z-[99] h-[calc(100vh-55px)] w-[6px]"
                onMouseEnter={() => {
                  // Clear any pending timeout
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  setHoveredMenu(menuItem?.label);
                }}
                onMouseLeave={() => {
                  // Add 100ms delay before closing
                  hoverTimeoutRef.current = setTimeout(() => {
                    setHoveredMenu(null);
                  }, 100);
                }}
              />
              <div
                className="scrollbar-hide fixed left-[76px] top-[56px] z-[99] h-[calc(100vh-55px)] min-w-[200px] overflow-y-auto !bg-[#fbfbff] shadow-2xl"
                onClick={(e) => e?.stopPropagation()}
                onMouseEnter={() => {
                  // Clear any pending timeout
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  setHoveredMenu(menuItem?.label);
                }}
                onMouseLeave={() => {
                  // Add 100ms delay before closing
                  hoverTimeoutRef.current = setTimeout(() => {
                    setHoveredMenu(null);
                  }, 100);
                }}
              >
                {/* Header with icon and title */}
                <div className="px-4 pb-0 pt-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={menuItem?.icon_inactive || menuItem?.icon}
                      alt={menuItem?.title}
                      width={20}
                      height={20}
                      className="h-5 w-5 opacity-60 brightness-0"
                    />
                    <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                      {menuItem?.label === 'more'
                        ? 'ORGANISATION'
                        : getSideBarTitle(menuItem?.title)}
                    </span>
                  </div>
                </div>

                {/* Submenu items */}
                <div className="py-2">
                  {submenuItems?.map((subItem, index) => {
                    if (
                      subItem?.label === 'overview-inventoryai' &&
                      inventoryVersion === 'v2' &&
                      !hasInventory
                    ) {
                      return null;
                    }
                    const isSubItemActive = activeSubTab === subItem?.label;
                    const showDivider =
                      menuItem?.label === 'more' && subItem?.label === 'teams';

                    return (
                      <div key={subItem?.label}>
                        <div
                          className={`group/submenu submenu-item relative mx-2 my-1 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                            isSubItemActive
                              ? 'text-blue-light bg-[#f1ecff] font-medium'
                              : 'hover:text-blue-light text-[#8f8f8f] hover:bg-black/5'
                          }`}
                          onClick={() => {
                            // Clear any pending timeout
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                            }
                            setHoveredMenu(null);
                            handleSubMenuClick(subItem?.label);
                          }}
                        >
                          <span className="flex w-[17px] flex-shrink-0 items-center justify-center">
                            {getSubmenuIcon(subItem?.label, isSubItemActive) ? (
                              getSubmenuIcon(subItem?.label, isSubItemActive)
                            ) : (
                              <span
                                className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                                  isSubItemActive
                                    ? 'bg-blue-light'
                                    : 'group-hover/submenu:bg-blue-light bg-[#8f8f8f]'
                                }`}
                              />
                            )}
                          </span>
                          <span className="whitespace-nowrap text-[13px] font-medium leading-4">
                            {getSideBarTitle(subItem?.title)}
                          </span>
                        </div>
                        {showDivider && (
                          <div className="mx-2 my-2 border-t border-gray-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
      </div>
    );
  };

  const enableSmartCampaignTabOnRooftop = useCallback(
    async (enterpriseId, teamId) => {
      if (!enterpriseId || !teamId) return;

      const url = `${process.env.BACKEND_BASEURL}/media-configs/v1/team-config/get-team-smart-campaign-config?enterpriseId=${enterpriseId}&teamId=${teamId}`;
      let isEnabled = false;
      try {
        const resp = await CentralAPIHandler.handleGetRequest(url);
        isEnabled = resp?.data?.enabled || false;
      } catch (error) {
        console.error('Error fetching smart campaign config:', error);
      } finally {
        setCanShowSmartCampaigns(isEnabled);
      }
    },
    [enterpriseId, teamId]
  );

  // Effects
  useEffect(() => {
    if (enterpriseId && teamId) {
      const handleSidebarConfig = async () => {
        try {
          const apiResponse = await fetchSidebarConfig(enterpriseId, teamId);
          const storedConfig = sessionStorage?.getItem(
            sessionStorageKeys?.sidebarConfig
          );
          const parsedStoredConfig = storedConfig
            ? JSON.parse(storedConfig)
            : null;

          const hasDifference =
            !parsedStoredConfig ||
            JSON.stringify(apiResponse) !== JSON.stringify(parsedStoredConfig);

          if (hasDifference) {
            sessionStorage.setItem(
              sessionStorageKeys.sidebarConfig,
              JSON.stringify(apiResponse)
            );
            setSidebarHeadings(formSidebarConfig(apiResponse));
          } else {
            setSidebarHeadings(formSidebarConfig(parsedStoredConfig));
          }
        } catch (error) {
          console.error('Error handling sidebar config:', error);
          setSidebarHeadings(sidebarHeadingsV2);
        }
      };

      handleSidebarConfig();
    }
  }, [enterpriseId, teamId]);

  // this is done because some times this api when called is sending enterprise id null
  useEffect(() => {
    if (!enterpriseId) return;

    const fetchEnterpriseProducts = async () => {
      try {
        const url = `${process.env.APP_BACKEND_BASEURL}/credit/v2/get-enterprise-products?enterpriseId=${enterpriseId}`;
        const response = await CentralAPIHandler.handleGetRequest(url);
        const paidProducts = response?.data?.paidProducts || [];
        setEnterpriseProducts(paidProducts);
        if (paidProducts?.length) {
          localStorage.setItem(
            'enterpriseProducts',
            JSON.stringify(paidProducts)
          );
        }
      } catch (error) {
        console.error('Error fetching enterprise products in sidebar:', error);
      }
    };

    fetchEnterpriseProducts();
  }, [enterpriseId]);

  useEffect(() => {
    const page = window.location.pathname;
    setSelectedTab(page);

    if (router.query.activeSubTab) {
      setActiveSubTab(router.query.activeSubTab);
    }
  }, [router.pathname]);

  useEffect(() => {
    const checkOnboarding = async () => {
      const status = await checkOnboardingStatus();
      setOnboardingDone(status);
    };
    checkOnboarding();
    enableSmartCampaignTabOnRooftop(enterpriseId, teamId);
  }, [enterpriseId, teamId]);

  useEffect(() => {
    setPermissionObject(getPermissionObject());
    const selectedEnt = sessionStorage?.getItem(
      sessionStorageKeys?.selectedEnterprise
    );
    if (selectedEnt) {
      setEnterpriseCategory(JSON.parse(selectedEnt)?.category_id);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.menu-box');
      if (sidebar && !sidebar.contains(event.target)) {
        // Clear any pending timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        setHoveredMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (enterpriseId && teamId) {
      dispatch(fetchInventoryStatus(enterpriseId, teamId));
    }
  }, [dispatch, enterpriseId, teamId]);

  useEffect(() => {
    scrollToActiveItem();
  }, [activeTab]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Reset submenu view when drawer is closed
  useEffect(() => {
    if (!showSideNavbar) {
      setMobileSubmenuView(null);
    }
  }, [showSideNavbar]);

  // Render mobile menu item
  const renderMobileMenuItem = (section) => {
    return section?.[categoryId]?.map((menuItem) => {
      if (menuItem?.hidden) return null;

      // Hide website-builder dropdown if onboarding not done
      if (menuItem?.label === 'website-builder' && !onboardingDone) {
        return renderMobileMenuItemLogic({
          ...menuItem,
          dropdownData: null,
          subMenu: null,
        });
      }

      const productMenuOverride = getProductMenuOverride(menuItem);
      if (productMenuOverride === 'hidden') {
        return null;
      }
      if (productMenuOverride) {
        return renderMobileMenuItemLogic(productMenuOverride);
      }

      // When showNewInventoryUI is disabled, only show submenu if smart campaigns is enabled
      if (!showNewInventoryUI && menuItem?.label === 'studioai') {
        if (canShowSmartCampaigns) {
          return renderMobileMenuItemLogic({
            ...menuItem,
            subMenu: smartCampaignSubMenu,
          });
        }
        return renderMobileMenuItemLogic({
          ...menuItem,
          subMenu: null,
          dropdownData: null,
        });
      }

      return renderMobileMenuItemLogic(menuItem);
    });
  };

  const renderMobileMenuItemLogic = (menuItem) => {
    const isActive = activeTab === menuItem?.label;
    const hasSubmenu = menuItem?.subMenu || menuItem?.dropdownData;
    const submenuItems = menuItem?.subMenu || menuItem?.dropdownData;
    const hasActiveSubItem = submenuItems?.some(
      (subItem) => activeSubTab === subItem?.label
    );

    if (!checkPermissions(menuItem)) {
      return null;
    }

    const handleMobileMenuClick = () => {
      if (hasSubmenu) {
        // Navigate to submenu view
        setMobileSubmenuView(menuItem);
      } else {
        // Navigate and close drawer
        handleNavigation(`/${menuItem?.label}`, menuItem?.label);
        setShowSideNavbar(false);
      }
    };

    return (
      <div key={menuItem?.label} className="mb-2">
        <div
          className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-all ${
            isActive || hasActiveSubItem
              ? 'bg-blue-4 text-blue-light font-semibold'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={handleMobileMenuClick}
        >
          <div className="flex items-center gap-3">
            <Image
              src={menuItem?.icon_inactive || menuItem?.icon}
              alt={menuItem?.title}
              width={24}
              height={24}
              className="h-6 w-6 opacity-60 brightness-0"
            />
            <span className="text-base font-medium">
              {getSideBarTitle(menuItem?.title)}
            </span>
          </div>
          {hasSubmenu && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400"
            >
              <path
                d="M7.5 5L12.5 10L7.5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {showSideNavbar && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 md:hidden"
          onClick={() => {
            setShowSideNavbar(false);
            setMobileSubmenuView(null);
          }}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed left-0 top-0 z-[101] h-full w-[85%] max-w-[400px] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          showSideNavbar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          {mobileSubmenuView ? (
            // Submenu Header with Back Button
            <>
              <button
                onClick={() => setMobileSubmenuView(null)}
                className="flex items-center gap-3"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5 15L7.5 10L12.5 5"
                    stroke="#666666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      mobileSubmenuView?.icon_inactive ||
                      mobileSubmenuView?.icon
                    }
                    alt={mobileSubmenuView?.title}
                    width={24}
                    height={24}
                    className="h-6 w-6 opacity-60 brightness-0"
                  />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {mobileSubmenuView?.label === 'more'
                      ? 'Organisation'
                      : getSideBarTitle(mobileSubmenuView?.title)}
                  </h2>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowSideNavbar(false);
                  setMobileSubmenuView(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="#666666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : (
            // Main Menu Header
            <>
              <div className="flex items-center gap-3">
                {isReseller ? (
                  authReducer?.resellerData?.logo_url ? (
                    <Image
                      src={authReducer?.resellerData?.logo_url}
                      alt="console logo"
                      height={40}
                      width={40}
                    />
                  ) : null
                ) : (
                  <Image
                    src="https://spyne-static.s3.us-east-1.amazonaws.com/console/combined-vs/console_home_logo.svg"
                    alt="Vini AI"
                    width={32}
                    height={32}
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Vini AI
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isReseller
                      ? `by ${authReducer?.resellerData?.name}`
                      : 'by spyne'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSideNavbar(false);
                  setMobileSubmenuView(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="#666666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Content */}
        <div className="scrollbar-hide h-[calc(100vh-73px)] overflow-y-auto px-4 py-4">
          {mobileSubmenuView ? (
            // Submenu View
            <div className="space-y-2">
              {(
                mobileSubmenuView?.subMenu || mobileSubmenuView?.dropdownData
              )?.map((subItem) => {
                if (
                  subItem?.label === 'overview-inventoryai' &&
                  inventoryVersion === 'v2' &&
                  !hasInventory
                ) {
                  return null;
                }
                const isSubItemActive = activeSubTab === subItem?.label;

                return (
                  <div
                    key={subItem?.label}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                      isSubItemActive
                        ? 'text-blue-light bg-[#f1ecff] font-medium'
                        : 'hover:text-blue-light text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      handleSubMenuClick(subItem?.label);
                      setShowSideNavbar(false);
                      setMobileSubmenuView(null);
                    }}
                  >
                    <span className="flex w-[24px] flex-shrink-0 items-center justify-center">
                      {getSubmenuIcon(subItem?.label, isSubItemActive) ? (
                        getSubmenuIcon(subItem?.label, isSubItemActive)
                      ) : (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isSubItemActive ? 'bg-blue-light' : 'bg-gray-400'
                          }`}
                        />
                      )}
                    </span>
                    <span className="text-base font-medium">
                      {getSideBarTitle(subItem?.title)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // Main Menu View
            <>
              {renderMobileMenuItem(sidebarHeadings?.DEFAULT)}
              <div className="my-4 h-[1px] bg-gray-200"></div>
              {renderMobileMenuItem(sidebarHeadings?.PRODUCTS)}
              <div className="my-4 h-[1px] bg-gray-200"></div>
              {renderMobileMenuItem(sidebarHeadings?.MENU)}
            </>
          )}

          {/* Help Button at Bottom - Mobile - Fixed Position */}
          {/* {!mobileSubmenuView && (
            <div className="absolute bottom-5 left-0 right-0 bg-white px-4">
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-gray-700 transition-all hover:bg-gray-50"
                onClick={() => {
                  setModalOpen(!modalOpen);
                  setShowSideNavbar(false);
                  setHelpAndSupportOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  {getSubmenuIcon('help', false)}
                  <span className="text-base font-medium">Help</span>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="scrollbar-hide hidden h-full overflow-x-hidden overflow-y-scroll md:block">
        <div className="space-10 scrollbar-hide relative flex h-[100vh] overflow-y-scroll">
          <div
            className={`scrollbar-hide relative h-full transition-all duration-300 ${
              showInventoryCoachMarks ? 'opacity-1' : ''
            }`}
          >
            <div
              ref={menuBoxRef}
              className="scrollbar-hide z-10 max-h-[100vh] w-full overflow-y-auto bg-white"
            >
              <div className="h-[1px] bg-gray-200"></div>
              <div className="scrollbar-hide relative space-y-2 overflow-x-hidden overflow-y-scroll px-1">
                <div className="pb-1 pt-3">
                  {renderMenuItem(sidebarHeadings?.DEFAULT)}
                </div>
                <div className="h-[1px] bg-gray-200"></div>
                {renderMenuItem(sidebarHeadings?.PRODUCTS)}
                <div className="h-[10px] border-b border-gray-200"></div>
                {renderMenuItem(sidebarHeadings?.MENU)}
              </div>

              {/* Help Icon at Bottom - Fixed Position */}
              {!isReseller && (
                <div className="absolute bottom-16 left-0 right-0 bg-white px-1">
                  <div
                    className="menu-list group/item hover:bg-blue-4 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-lg !border-0 !px-1 !py-2 text-sm font-normal leading-6"
                    onClick={() => {
                      if (!helpAndSupportOpen) {
                        setModalOpen(true);
                        setHelpAndSupportOpen(true);
                      } else {
                        setModalOpen(!modalOpen);
                        setHelpAndSupportOpen(true);
                      }
                    }}
                  >
                    <div className="flex w-full items-center justify-center">
                      <div className="flex w-full flex-col items-center gap-0.5 transition-all duration-300">
                        <div className="relative transition-transform duration-200 group-hover:scale-105">
                          {getSubmenuIcon('help', false)}
                        </div>
                        <div
                          className="text-black-60 group-hover:text-blue-light w-full max-w-full text-ellipsis pt-1 text-center text-[9px] font-extrabold leading-tight transition-colors duration-200"
                          style={{ wordBreak: 'break-word' }}
                        >
                          Help
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarV2;
