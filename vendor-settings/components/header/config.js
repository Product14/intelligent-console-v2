import SVG from '@spyne-console/design-system/svg';

import { cn } from '@spyne-console/utils/cn';

export const profileData = {
  logo: 'https://spyne-static.s3.amazonaws.com/console/project/userProfileIcon.svg',
  profileName: 'Avtar',
  userType: 'Ford / Delhi / Team 01',
  teamName: 'Admin',
};

export const virtualDataWhenUrl = {
  backIcon:
    'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/left-caret.svg',
  virtualLogo:
    'https://spyne-static.s3.amazonaws.com/console/virtual-studio/virtual-logo.svg',
  '360Video': 'https://spyne-static.s3.amazonaws.com/video360.svg',
  homeIcon: 'https://spyne-static.s3.amazonaws.com/gray_home.svg',
};

export const profileContentData = {
  cat_d8R14zUNE: [
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/profileIcon.svg',
      text: 'Account',
      label: 'ACCOUNT',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: false,
      // restrictedTo: ['SPYNE OWNER','SPYNE_ADMIN', 'ENTERPRISE_OWNER', 'TEAM_ADMIN']
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/switchIcon.svg',
      text: 'Change Enterprise',
      label: 'SWITCH_ENTERPRISE',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/billingAndPaymentsIcon.svg',
      text: 'Billing & Plan',
      label: 'BILLING_AND_PLAN',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['SPYNE_OWNER'],
      virtualStudioVisibiliy: true,
    },
    // {
    //     icon: "https://spyne-static.s3.amazonaws.com/console/header-icons/adminPanel.svg",
    //     text: "Admin Tools",
    //     label: "ADMIN_TOOLS",
    //     notAllowedPath: ["/enterprises", "/enterprise-dashboard"],
    //     restrictedTo: [ GetPermissionClientObject("VIEW_ADMIN_TOOLS").status ? "VIEW_ADMIN_TOOLS" : ""],
    //     virtualStudioVisibiliy: false
    // },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/icons/plusIconGray.svg',
      text: "What's New",
      label: 'WHAT_S_NEW',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/logoutIcon.svg',
      text: 'Log Out',
      label: 'LOGOUT',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
  ],
  cat_Ujt0kuFxY: [
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/profileIcon.svg',
      text: 'Account',
      label: 'ACCOUNT',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: false,
      // restrictedTo: ['SPYNE OWNER','SPYNE_ADMIN', 'ENTERPRISE_OWNER', 'TEAM_ADMIN']
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/switchIcon.svg',
      text: 'Change Enterprise',
      label: 'SWITCH_ENTERPRISE',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/billingAndPaymentsIcon.svg',
      text: 'Billing & Plan',
      label: 'BILLING_AND_PLAN',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['SPYNE_OWNER'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/icons/plusIconGray.svg',
      text: "What's New",
      label: 'WHAT_S_NEW',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/logoutIcon.svg',
      text: 'Log Out',
      label: 'LOGOUT',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
  ],
  cat_Ujt0kuFxF: [
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/switchIcon.svg',
      text: 'Change Enterprise',
      label: 'SWITCH_ENTERPRISE',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/billingAndPaymentsIcon.svg',
      text: 'Billing & Plan',
      label: 'BILLING_AND_PLAN',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['SPYNE_OWNER'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/icons/plusIconGray.svg',
      text: "What's New",
      label: 'WHAT_S_NEW',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/logoutIcon.svg',
      text: 'Log Out',
      label: 'LOGOUT',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
  ],
  undefined: [
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/switchIcon.svg',
      text: 'Change Enterprise',
      label: 'SWITCH_ENTERPRISE',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/billingAndPaymentsIcon.svg',
      text: 'Billing & Plan',
      label: 'BILLING_AND_PLAN',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['SPYNE_OWNER'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/logoutIcon.svg',
      text: 'Log Out',
      label: 'LOGOUT',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
  ],
  ALL: [
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/switchIcon.svg',
      text: 'Change Enterprise',
      label: 'SWITCH_ENTERPRISE',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/billingAndPaymentsIcon.svg',
      text: 'Billing & Plan',
      label: 'BILLING_AND_PLAN',
      notAllowedPath: ['/enterprises', '/enterprise-dashboard'],
      restrictedTo: ['SPYNE_OWNER'],
      virtualStudioVisibiliy: true,
    },
    // {
    //     icon: "https://spyne-static.s3.amazonaws.com/console/header-icons/adminPanel.svg",
    //     text: "Admin Tools",
    //     label: "ADMIN_TOOLS",
    //     notAllowedPath: ["/enterprise-dashboard"],
    //     restrictedTo: [ GetPermissionClientObject("VIEW_ADMIN_TOOLS").status ? "VIEW_ADMIN_TOOLS" : ""],
    //     virtualStudioVisibiliy: false
    // },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/icons/plusIconGray.svg',
      text: "What's New",
      label: 'WHAT_S_NEW',
      notAllowedPath: ['/login'],
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
    {
      icon: 'https://spyne-static.s3.amazonaws.com/console/header-icons/logoutIcon.svg',
      text: 'Log Out',
      label: 'LOGOUT',
      notAllowedPath: '/login',
      restrictedTo: ['ALL'],
      virtualStudioVisibiliy: true,
    },
  ],
};

export const ProductAttributes = {
  gold: {
    class: 'bg-[#FFF9EF] text-[#FFB500]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/yellowCrown.svg',
    color: 'text-[#FFB500]',
  },
  silver: {
    class: 'bg-[#F3F4F9] text-[#1A338B]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/blueStar.svg',
    color: 'text-[#1A338B]',
  },
  bronze: {
    class: 'bg-[#FFF9EF] text-[#CD7F32]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/bronze_inventoryimage.svg',
    color: 'text-[#CD7F32]',
  },
  'Trial Plan': {
    class: 'bg-[#F2F4F7] text-[#344054]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/trial_inventory.svg',
    color: 'text-[#344054]',
  },
  FreeTrial: {
    class: 'bg-[#F2F4F7] text-[#344054]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/trial_inventory.svg',
    color: 'text-[#344054]',
  },
  Trial: {
    class: 'bg-[#F2F4F7] text-[#344054]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/trial_inventory.svg',
    color: 'text-[#344054]',
  },
  Comprehensive: {
    class: 'bg-[#F2F4F7] text-[#344054]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/COMPREHENSIVE.svg',
    color: 'text-[#344054]',
  },
  Essential: {
    class: 'bg-[#F2F4F7] text-[#344054]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/ESSENTIALS.svg',
    color: 'text-[#344054]',
  },
  Growth: {
    class: 'bg-[#F2F4F7] text-[#344054]',
    icon: 'https://spyne-static.s3.us-east-1.amazonaws.com/GROWTH.svg',
    color: 'text-[#344054]',
  },
};

export const showCreditsJSX = (data, type) => {
  return (
    <div className="flex flex-row items-center">
      <span className="font-inter pl-2 pr-1 text-center text-xs font-medium leading-4">
        {/* Check if product exists in freeProducts array first */}
        {data?.credit_data?.[type]?.subscription_type === 'free' ? (
          // Show Trial Plan for free products
          <div className="flex items-center">
            <span
              className={cn(
                ProductAttributes['Trial Plan']?.class,
                'gap-1 rounded-lg p-1'
              )}
            >
              Trial Plan
            </span>
          </div>
        ) : // For paid products, check productPlanType
        data?.credit_data?.[type]?.plan_type ? (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                ProductAttributes[data.credit_data[type].plan_type]?.class,
                'flex items-center gap-1 rounded-lg p-1 text-xs font-medium'
              )}
            >
              <img
                src={ProductAttributes[data.credit_data[type].plan_type]?.icon}
                alt={data.credit_data[type].plan_type}
                className="h-3 w-3"
              />
              {data.credit_data[type].plan_type.charAt(0).toUpperCase() +
                data.credit_data[type].plan_type.slice(1)}
            </span>
          </div>
        ) : (
          // Fallback to Trial Plan if no plan type specified
          <div className="flex items-center gap-1">
            <span
              className={cn(
                ProductAttributes['Trial Plan']?.class,
                'gap-1 rounded-lg p-1'
              )}
            >
              Trial Plan
            </span>
          </div>
        )}
      </span>
    </div>
  );
};

export const showOverallUpgrade = (
  data,
  creditsDropdown,
  setCreditsDropdown
) => {
  const isNewPricingPlan = data?.is_new_pricing ?? false;
  return (
    <div
      className={cn(
        `flex items-center gap-2 ${isNewPricingPlan ? 'justify-center rounded-full border-none bg-purple-50 px-3 py-2' : 'border-gray-40 rounded-lg border bg-white px-4 py-2'} ml-1 h-[38px] cursor-pointer text-sm font-semibold text-black`,
        ProductAttributes[data.overall_stage]?.class
      )}
    >
      <span
        className={`${isNewPricingPlan ? 'gap-2 rounded-full font-semibold text-black/80' : 'gap-1 rounded-lg p-1 font-medium'} flex items-center justify-center text-[13px] leading-[18px]`}
      >
        <img
          src={ProductAttributes[data.overall_stage]?.icon}
          alt={data.overall_stage}
          className={`pointer-events-none ${isNewPricingPlan ? 'mb-[0.5px] h-[20px] w-[20px]' : 'h-3 w-3'}`}
        />
        <span className="pointer-events-none">
          {data.overall_stage.charAt(0).toUpperCase() +
            data.overall_stage.slice(1)}
        </span>
        <SVG
          iconName="chevronRight"
          className={`ml-1 h-3 w-3 fill-black/80 transition-transform ${creditsDropdown ? 'rotate-[270deg]' : 'rotate-90'}`}
        />
      </span>
    </div>
  );
};

// {
//     "credit_data": {
//         "360": {
//             "credits": 3933,
//             "start_date": "2025-01-15T11:24:43.373Z",
//             "end_date": "2027-01-15T11:24:43.373Z",
//             "grace_period": 0,
//             "grace_period_end_date": "",
//             "expiry_in_days": 715,
//             "subscription_type": "paid",
//             "plan_type": "gold"
//         },
//         "images": {
//             "credits": 2874,
//             "start_date": "2025-01-15T11:24:43.373Z",
//             "end_date": "2027-01-15T11:24:43.373Z",
//             "grace_period": 0,
//             "grace_period_end_date": "",
//             "expiry_in_days": 715,
//             "subscription_type": "paid",
//             "plan_type": "gold"
//         },
//         "video": {
//             "credits": 3982,
//             "start_date": "2025-01-15T11:24:43.373Z",
//             "end_date": "2027-01-15T11:24:43.373Z",
//             "grace_period": 0,
//             "grace_period_end_date": "",
//             "expiry_in_days": 715,
//             "subscription_type": "paid",
//             "plan_type": "gold"
//         }
//     },
//     "overall_stage": "gold"
// }

export const isGoldProduct = (data, key) =>
  data?.credit_data?.[key]?.plan_type === 'gold';

export const isComprehensiveProduct = (data, key) =>
  data?.credit_data?.[key]?.plan_type === 'Comprehensive';

export const isProProduct = (data, key) =>
  data?.credit_data?.[key]?.plan_type === 'pro';

export const isPaidProduct = (data, key) =>
  data?.credit_data?.[key]?.subscription_type === 'paid';

export const showGlobalUpgrade = (data) =>
  ![
    'gold',
    'silver',
    'bronze',
    'Growth',
    'Essential',
    'Comprehensive',
    'Pro',
    'Lite',
  ].includes(data?.overall_stage);

export const noTotalCredits = (data) =>
  data?.credit_data?.images?.credits === 0 &&
  data?.credit_data?.['360']?.credits === 0 &&
  data?.credit_data?.video?.credits === 0;

export const isNewPricingPlan = (data) => data?.is_new_pricing ?? false;
