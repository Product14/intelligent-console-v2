/**
 * @format
 */
export const poweredByConfig = {
  text: 'Powered by',
  logoImage: 'https://spyne-static.s3.amazonaws.com/console/spyneLogoPng.svg',
};
export const sidebarHeadings = {
  DEFAULT: {
    cat_d8R14zUNE: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/Home_active.svg',
        title: 'Home',
        label: 'home',
      },
    ],
    cat_Ujt0kuFxY: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/Home_active.svg',
        title: 'Home',
        label: 'home',
      },
    ],
  },
  PRODUCTS: {
    cat_d8R14zUNE: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/virtual_studio_icon.svg',
        title: 'Virtual Studio',
        label: 'virtualstudio',
        hidden: false,
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        subMenu: [
          {
            title: 'Images',
            label: 'images',
            icon: 'https://spyne-static.s3.amazonaws.com/console/images_active.svg',
          },

          {
            title: '360 Spin',
            label: '360spin',
            icon: 'https://spyne-static.s3.amazonaws.com/console/threeSixty_active.svg',
          },
          {
            title: 'Video Tour',
            label: 'videoTour',
            icon: 'https://spyne-static.s3.amazonaws.com/console/videoTour_active.svg',
          },
        ],
      },

      // {
      //     icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/360_spin.svg',
      //     title: '360 Spin',
      //     label: 'three-sixty-spin',
      //     hidden: false
      // },
      // {
      //     icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/inspection.svg',
      //     title: 'Inspection',
      //     label: 'inspection',
      //     hidden: false
      // },
    ],
    cat_Ujt0kuFxY: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/virtual_studio_icon.svg',
        title: 'Virtual Studio',
        label: 'playground',
        hidden: false,
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        subMenu: [
          {
            title: 'Images',
            label: 'images',
            icon: 'https://spyne-static.s3.amazonaws.com/console/images_active.svg',
          },

          {
            title: '360 Spin',
            label: '360spin',
            icon: 'https://spyne-static.s3.amazonaws.com/console/threeSixty_active.svg',
          },
          {
            title: 'Video Tour',
            label: 'videoTour',
            icon: 'https://spyne-static.s3.amazonaws.com/console/videoTour_active.svg',
            comingSoon:
              'https://spyne-static.s3.amazonaws.com/console/coming_soon_active.svg',
          },
        ],
      },
    ],
  },
  ORGANIZATION: {
    cat_d8R14zUNE: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/goBack_icon.svg',
        title: 'Back to Home',
        label: 'backToHome',
        // hidden: false,
        // permission: ""
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/organization_icon.svg',
        title: 'Organization',
        label: 'organization',
        hidden: false,
        permission: 'VIEW_USER_ALL',
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        subMenu: [
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/accounts/team_active.svg',
            title: 'Dealer Profile',
            label: 'dealer_profile',
            permission: 'VIEW_ENTERPRISE_TEAM_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/userIcon.svg',
            title: 'Users',
            label: 'users',
            hidden: false,
            permission: 'VIEW_USER_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/accounts/team_active.svg',
            title: 'Teams',
            label: 'teams',
            permission: 'VIEW_ENTERPRISE_TEAM_ALL',
          },
        ],
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/settings_gear.svg',
        title: 'Settings',
        label: 'settings',
        // permission: [{'CREATE_ENTERPRISE_ALL': 'WRITE'}]
        permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        subMenu: [
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/general_setting.svg',
            title: 'General',
            label: 'general',
            hidden: false,
            permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/studio_setting.svg',
            title: 'Studio',
            label: 'studio',
            permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/app_setting.svg',
            title: 'App',
            label: 'app',
            permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
          },
        ],
      },
    ],
    cat_Ujt0kuFxY: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/goBack_icon.svg',
        title: 'Back to Home',
        label: 'backToHome',
        hidden: false,
        permission: '',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/inventory_icon.svg',
        title: 'Organization',
        label: 'organization',
        hidden: false,
        permission: '',
        subMenu: [
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/userIcon.svg',
            title: 'Users',
            label: 'users',
            hidden: false,
            permission: 'VIEW_USER_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/accounts/team_active.svg',
            title: 'Teams',
            label: 'teams',
            permission: 'VIEW_ENTERPRISE_TEAM_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/dealerPage/enterprise.svg',
            title: 'Enterprise',
            label: 'enterprise',
            permission: 'VIEW_ENTERPRISE_TEAM_ALL',
          },
        ],
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/settings_gear.svg',
        title: 'Settings',
        label: 'settings',
        // permission: [{'CREATE_ENTERPRISE_ALL': 'WRITE'}]
        permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        subMenu: [
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/general_setting.svg',
            title: 'General',
            label: 'general',
            hidden: false,
            permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/studio_setting.svg',
            title: 'Studio',
            label: 'studio',
            permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/app_setting.svg',
            title: 'App',
            label: 'app',
            permission: 'VIEW_ENTERPRISE_CONFIG_ALL',
          },
        ],
      },
    ],
  },
  MENU: {
    cat_d8R14zUNE: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/analytics_active.svg',
        icon_inactive:
          'https://spyne-static.s3.amazonaws.com/console/project/sidebar/analytics_inactive.svg',
        title: 'Analytics',
        label: 'analytics',
        hidden: false,
        permission: '',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/inventory_icon.svg',
        title: 'My Vehicles',
        label: 'inventory',
        hidden: false,
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        permission: '',
        subMenu: [
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/projects_active.svg',
            title: 'Media',
            label: 'media',
            hidden: false,
            permission: '',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/inventoryListings.svg',
            title: 'Inventory',
            label: 'inventory',
            hidden: false,
            permission: '',
            subMenu: [
              {
                icon: 'https://spyne-static.s3.amazonaws.com/console/icons/inventoryListings.svg',
                title: 'Sourcing',
                label: 'sourcing',
                hidden: false,
                permission: '',
              },
            ],
          },

          // {
          //     icon: "https://spyne-static.s3.amazonaws.com/console/project/sidebar/history.svg",
          //     title: "History",
          //     label: "history",
          //     // permission: [{'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL': 'READ'}]
          //     permission: "VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL"
          // },
        ],
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/inventory_icon.svg',
        title: 'Inventory',
        label: 'inventory',
        hidden: false,
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        permission: '',
        subMenu: [
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/inventoryListings.svg',
            title: 'Listing',
            label: 'listing',
            hidden: false,
            permission: '',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/inventoryListings.svg',
            title: 'Sourcing',
            label: 'sourcing',
            hidden: false,
            permission: '',
          },
          // {
          //     icon: "https://spyne-static.s3.amazonaws.com/console/project/sidebar/history.svg",
          //     title: "History",
          //     label: "history",
          //     // permission: [{'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL': 'READ'}]
          //     permission: "VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL"
          // },
        ],
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/website_builder_active.svg',
        title: 'Website',
        label: 'website-builder',
        hidden: false,
        permission: 'VIEW_WEBSITE_TABS_ALL',
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        dropdownData: [
          {
            title: 'Templates',
            label: 'templates',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/templatesBlueIcon.svg',
          },

          {
            title: 'Home Page',
            label: 'landing-page',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/dealer-websites-cms/home-page-sidebar-icon.svg',
          },
          {
            title: 'List Page',
            label: 'list-page',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/dealer-websites-cms/list-page-sidebar-icon.svg',
          },
          {
            title: 'Details Page',
            label: 'details-page',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/dealer-websites-cms/details-page-sidebar-icon.svg',
          },
          {
            title: 'Manage Forms',
            label: 'manage-forms',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/manageForms.svg',
          },
          {
            title: 'Page Builder',
            label: 'custom-pages',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/dealer-websites-cms/custom-pages-sidebar-icon.svg',
          },
          {
            title: 'Page Speed Insight',
            label: 'page-speed-insight',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/acute.svg',
          },
          {
            title: 'SEO',
            label: 'seo',
            icon: 'https://spyne-static.s3.amazonaws.com/dealer-websites/images/seo-sidebar.svg',
          },
          // {
          //     icon: "https://spyne-static.s3.amazonaws.com/console/admin-tools/call_to_action.svg",
          //     title: "Migration",
          //     label: "migration"
          // },
          {
            title: 'Website Analytics',
            label: 'websiteAnalytics',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/barChartAnalyticsBlueIcon.svg',
          },
          {
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/pluginsIcon.svg',
            title: 'Plugin',
            label: 'plugin',
          },
        ],
      },
      {
        title: 'CRM',
        label: 'crm',
        icon: 'https://spyne-static.s3.amazonaws.com/console/icons/templatesBlueIcon.svg',
        hidden: false,
        permission: '',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/projects_active.svg',
        title: 'Projects',
        label: 'project',
        hidden: false,
        permission: '',
      },
      // {
      //     icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/analytics_active.svg',
      //     icon_inactive: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/analytics_inactive.svg',
      //     title: 'Analytics',
      //     label: 'analytics',
      //     hidden: false
      // },

      // {
      //     icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/billing_payments_active.svg',
      //     icon_inactive: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/billing+_payments_inactive.svg',
      //     title: 'Billing and Payments',
      //     label: 'billing-and-payments',
      //     hidden: false
      // },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/dev_hub_active.svg',
        // icon_inactive: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/dev_hub_inactive.svg',
        title: 'Developer Hub',
        label: 'developer-hub',
        permission: 'USE_PUBLICAPI_SELF',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/integration_icon.svg',
        title: 'Integrations',
        label: 'integrations',
        permission: 'USE_PUBLICAPI_SELF',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/sidebar/marketing/marketing.svg',
        title: 'Marketing',
        label: 'marketing',
        hidden: false,
        permission: 'VIEW_WEBSITE_TABS_ALL',
        caretIcon:
          'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
        subMenu: [
          {
            id: 'd04c3311-bbc7-4e8e-9c51-e7ea9a32ff27',
            title: 'Google Vehicle Listing',
            label: 'google-vehicle-listing',
            icon: 'https://spyne-static.s3.amazonaws.com/console/sidebar/marketing/google_vehicle_listings.svg',
          },
          {
            id: 'e7a2f65d-da76-4288-a20e-3f85b6dfd64b',
            title: 'Facebook Ads',
            label: 'facebook-ads',
            icon: 'https://spyne-static.s3.amazonaws.com/console/icons/facebookAdsIcon.svg',
          },
        ],
      },

      // {
      //     icon: "https://spyne-static.s3.amazonaws.com/console/project/sidebar/helpSupportIcon.svg",
      //     title: "Help and Support",
      //     label: "support",
      //     // permission: [{'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL': 'READ'}]
      //     permission: "VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL"
      // },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/icons/PolicyBlueIcon.svg',
        title: 'Policy',
        label: 'terms-and-conditions',
        hidden: false,
        permission: '',
      },
    ],
    cat_Ujt0kuFxY: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/projects_active.svg',
        title: 'Projects',
        label: 'project',
        hidden: false,
        permission: '',
      },

      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/history.svg',
        title: 'History',
        label: 'history',
        // permission: [{'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL': 'READ'}]
        permission: 'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL',
      },
      {
        // icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/organization_active.svg',
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/userIcon.svg',
        title: 'Users',
        label: 'organization',
        hidden: false,
        // permission: [{'VIEW_USER_ALL': 'READ'}]
        permission: 'VIEW_USER_ALL',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/accounts/team_active.svg',
        title: 'Teams',
        label: 'teams',
        // permission: [{'VIEW_ENTERPRISE_TEAM_ALL': 'READ'}]
        permission: 'VIEW_ENTERPRISE_TEAM_ALL',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/icons/PolicyBlueIcon.svg',
        title: 'Policy',
        label: 'terms-and-conditions',
        hidden: false,
        permission: '',
      },
    ],
    cat_Ujt0kuFxF: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/projects_active.svg',
        title: 'Projects',
        label: 'project',
        hidden: false,
        permission: '',
      },

      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/history.svg',
        title: 'History',
        label: 'history',
        // permission: [{'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL': 'READ'}]
        permission: 'VIEW_ENTERPRISE_TEAM_TRANSACTION_ALL',
      },
      {
        // icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/organization_active.svg',
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/userIcon.svg',
        title: 'Users',
        label: 'organization',
        hidden: false,
        // permission: [{'VIEW_USER_ALL': 'READ'}]
        permission: 'VIEW_USER_ALL',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/accounts/team_active.svg',
        title: 'Teams',
        label: 'teams',
        // permission: [{'VIEW_ENTERPRISE_TEAM_ALL': 'READ'}]
        permission: 'VIEW_ENTERPRISE_TEAM_ALL',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/icons/PolicyBlueIcon.svg',
        title: 'Policy',
        label: 'terms-and-conditions',
        hidden: false,
        permission: '',
      },
    ],
    ALL: [
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/project/sidebar/projects_active.svg',
        title: 'Projects',
        label: 'project',
        hidden: false,
        permission: '',
      },
      {
        icon: 'https://spyne-static.s3.amazonaws.com/console/icons/PolicyBlueIcon.svg',
        title: 'Policy',
        label: 'terms-and-conditions',
        hidden: false,
        permission: '',
      },
    ],
  },
};
