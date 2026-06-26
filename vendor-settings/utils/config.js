/**
 * @format
 */
import { googleLogout } from '@react-oauth/google';
import { SELECT_DROPDOWN_REVENUE } from '@spyne-console/common-config/login';

import axios from 'axios';
import ClevertapReact from 'clevertap-react';
import CryptoJS from 'crypto-js';
import MD5 from 'crypto-js/md5';
import jwtDecode from 'jwt-decode';
import { v4 as uuid } from 'uuid';

import { GetPermissionClientObject } from './PermissionClientObject';
// import posthog from "posthog-js"
// import ReactGA4 from "react-ga4"
import { trackEvent } from './analytics';
import CentralAPIHandler from './centralAPIHandler/centralAPIHandler';

// ReactGA4.initialize(process.env.GTM_CONTAINER_ID)

export const localStorageKeys = {
  AUTHKEY: 'authKey',
  DEVICEID: 'deviceId',
  DEFAULTBEARERTOKEN: 'defaultBearerToken',
  USERDETAILS: 'userDetails',
  defaultEnterprise: 'defaultEnterprise',
  permissionObject: 'permissionObject',
  onBoardingDetails: 'onboardingDetails',
  downloadPollingId: 'downloadPollingId',
  downloadRecords: 'downloadRecords',
  videoRecords: 'videoRecords',
  epConfig: 'epConfig',
  reportImagesModal: 'reportImagesModal',
  showWarningModal: 'showWarningModal',
  guestLogin: 'guestLogin',
  processCount: 'processCount', //this is to keep track of images processed by a user (current_use_case: Guest-user-flow)
  src: 'src', //this is to keep track if guest-flow is there or normal (will be removed after login if done from /login page)
  rememberChoiceVS: 'rememberChoiceVS',
  rememberChoiceVirtual360: 'rememberChoiceVirtual360',
  VSProjectCount: 'VSProjectCount',
  Virtual360VideoCount: 'Virtual360VideoCount',
  countEnterpriseListIsGreaterThan1: 'countEnterpriseListIsGreaterThan1',
  firstTimeUser: 'firstTimeUser',
  coachMarkCompletedSteps: 'coachMarkCompletedSteps',
  inventoryCoachMarkCompletedSteps: 'inventoryCoachMarkCompletedSteps',
  enterpriseSequenceIsActive: 'enterpriseSequenceIsActive',
  ipApiJson: 'ipApiJson',
  enterpriseTopUpCount: 'enterpriseTopUpCount',
  websiteOnboradingSteps: 'websiteOnboradingSteps',
  templateModalSync: 'templateModalSync',
  syncStatusData: 'syncStatusData',
  websiteOnboardingDone: 'websiteOnboardingDone',
  partnerCoachmarks: 'partnerCoachmarks',
  vsVersion: 'vsVersion',
  inventory_version: 'inventory_version',
};

export const sessionStorageKeys = {
  TEAMID: 'teamIds',
  selectedEnterprise: 'selectedEnterprise',
  selectedTeam: 'selectedTeam',
  enterpriseReasons: 'enterpriseReasons',
  teamList: 'teamList',
  usersList: 'usersList',
  makeLists: 'makeLists',
  studioData: 'studioData',
  studioDataWall: 'studioDataWall',
  isWallEnabled: 'isWallEnabled',
  enterpriseList: 'enterpriseList',
  guestUserId: 'guestUserId',
  skuProcessed: 'skuProcessed',
  enterprisePlan: 'enterprisePlan',
  enterpriseFeatures: 'enterpriseFeatures',
  stepCreateEnterprise: 'stepCreateEnterprise',
  activeTabInProjectsPage: 'activeTabInProjectsPage',
  onboardingAccountDetails: 'onboardingAccountDetails',
  actualEnterpriseData: 'actualEnterpriseData',
  credit: 'credit',
  requestedCredits: 'requestedCredits',
  selectedTabHome: 'selectedTabHome',
  inventory_version: 'inventory_version',
};

export const crmStatusKeys = {
  QC_DONE: 'qc_done',
  QC_UNASSIGNED: 'qc_unassigned',
  QC_INPROGRESS: 'qc_inprogress',
  EDITING_ASSIGNED: 'editing_assigned',
  EDITING_STARTED: 'editing_started',
  EDITING_UNASSIGNED: 'editing_unassigned',
  IMAGE_RESHOOT: 'image_reshoot',
  ENTERPRISE_DONE: 'enterprise_done',
  ENTERPRISE_REJECTED: 'enterprise_rejected',
  REFUND_UNASSIGNED: 'refund_unassigned',
  REFUND_REJECTED: 'refund_rejected',
  REFUND_APPROVED: 'refund_approved',
};

export const crmStatusKeyToUIName = {
  [crmStatusKeys.ENTERPRISE_DONE]: 'accept',
  [crmStatusKeys.QC_UNASSIGNED]: 're-edit',
};

// export const imageFallBackUrl = "https://spyne-static.s3.amazonaws.com/console/fallbackImg.svg"
export const imageFallBackUrl =
  'https://spyne-static.s3.amazonaws.com/failedSkuFallback.svg';
export const videoErrorFallback =
  'https://spyne-static.s3.amazonaws.com/console/videoError.svg';
// export const inProgessFallbackImage = "https://spyne-static.s3.amazonaws.com/console/inprogressFallback.svg"
export const inProgessFallbackImage =
  'https://spyne-static.s3.amazonaws.com/skuImgInProcessing.svg';

export const BUTTON_TYPES = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY', //clear
  TERTIARY: 'TERTIARY',
};

export const modalContent = {
  open: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/movetofolder.svg',
    heading: 'Move',
    para: 'Do you want to move this Vehicle?',
  },

  download: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/changesmodal.svg',
    heading: 'Unsaved changes',
    para: 'Do you want to save or discard changes?',
  },
  archive: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/archivemodal.svg',
    heading: 'Archive this Folder',
    para: 'Are you sure you want to archive this post? This action cannot be undone.',
  },
  disable: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/accounts/DisableTeam.svg',
    heading: 'Disable Team',
    para: 'Are you sure you want to disable this Team? You can reactivate them later.',
  },
  active: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/accounts/activateTeam.svg',
    heading: 'Activate Team',
    para: 'Are you sure you want to activate this Team?',
  },
  activeUser: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/organization/activateUserGreenIcon.svg',
    heading: 'Activate User',
    para: 'Are you sure you want to activate this User?',
  },
  disableUser: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/organization/disableUser-yellowIcon.svg',
    heading: 'Disable User',
    para: 'Are you sure you want to disable this User? You can reactivate them later.',
  },
  passwordResetSuccess: {
    image: ' https://spyne-static.s3.amazonaws.com/console/password_reset.svg',
    heading: 'Your Password has been reset!',
    para: 'Log in to your account with new password',
  },
  guestShootsWarning: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/folderStructureModal.svg',
    heading: 'Select Images',
    para: `You can only process up to ${process.env.allowedFreeShoots} vehicles for free`,
  },
  folderStructureModal: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/folderStructureModal.svg',
    heading: 'Folder Structure Not Recognised!',
    para: 'Please upload your images according to our folder guidelines',
  },
  vehicleLimitExceedModal: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/vehicleLimitModalIcon.svg',
    heading: 'Vehicle Limit Exceeded!',
    para: 'We only support up to 20 vehicles at a time, kindly reduce the number of vehicles you are uploading',
  },
  duplicateVehicleModal: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/folderStructureModal.svg',
    para: 'Please ensure only new images are in these folders as they will be added into the existing Project, are you sure you want to continue?',
  },
  processDoneModal: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/process.svg',
    heading: 'Processed!',
    para: 'Check your Projects in a few minutes! You can also start creating another project.',
  },
  processConfirmModal: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/process.svg',
    heading: 'Process?',
  },
  featureBlocked: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/changesmodal.svg',
    heading: 'Account Blocked',
    para: `Your account has been blocked, please contact customer support at `,
    subText: 'connect@spyne.ai',
  },
  catalogUploadChoice: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/home/upload_icon_bordered.svg',
    heading: 'Upload',
    para: 'Upload files or folders',
    closeBtn:
      'https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg',
    btn1Icon:
      'https://spyne-static.s3.amazonaws.com/console/home/files_icon.svg',
    btn1text: 'Files',
    btn2Icon:
      'https://spyne-static.s3.amazonaws.com/console/home/folder_icon.svg',
    btn2text: 'Folders',
  },
  vinMandatoryDataForSingleSKU: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/inventory/vinSymbol.svg',
    centerHeading: 'Vehicle Identification Number (VIN)',
    inputHeader: 'Enter Your VIN',
    heading2: 'Where can I find the VIN?',
    inputLabel: 'VIN',
    btn1Text: 'Cancel',
    btn2Text: 'Continue',
    footerText: "I'll do this later",
    placeholder: '000000000000000',
    chevronDown:
      'https://spyne-static.s3.amazonaws.com/console/filter/chevron_down_active.svg',
    chevronRight:
      'https://spyne-static.s3.amazonaws.com/console/inventory/chevron_right_active.svg',
    howVINLooks:
      'https://spyne-static.s3.amazonaws.com/console/inventory/howVINLooks.svg',
  },
  vinMandatoryDataForMultiSKU: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/inventory/vinSymbol.svg',
    heading: 'Vehicle Identification Number (VIN)',
    para: 'Rename your folders as VIN respectively',
    para2: 'Rename these folders as their respective VIN',
    btn1Text: 'Cancel',
    btn2Text: 'Continue',
    viewImages: 'View Images',
    footerText: "I'll do this later",
    tickIcon:
      'https://spyne-static.s3.amazonaws.com/console/inventory/tick.svg',
  },
  vinMandatoryMultiSKUConfirmation: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/inventory/cautionCircle.svg',
    heading: 'Are you sure?',
    para: 'To process only',
    btn1Text: 'Rename VINs',
    btn2Text: 'Process',
  },
  uploadError: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/uploadErrorIcon.svg',
    heading: 'Uploading Error',
    para: 'We were unable to upload your video, <br/> please check your network connection and try again.',
    btn1Text: 'Cancel',
    btn2Text: 'Upload',
  },
  invalidVideo: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/uploadErrorIcon.svg',
    heading: 'Vehicle is Cropped!',
    para: 'Please re upload the video and try again.',
    btn2Text: 'Upload',
  },
  incompleteVideo: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/uploadErrorIcon.svg',
    heading: 'Some Angles are Missing!',
    para: 'Please re upload the video and try again.',
    btn2Text: 'Upload',
  },
  saveConfirm: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/greenCheckIcon.svg',
    heading: 'Process Exterior 360 Spin',
    para: "The video will be processed, you will not be able to make any changes to it's Studio or license plate later. Are you sure you want to continue? ",
    btn1Text: 'Cancel',
    btn2Text: 'Continue',
  },
  extAlreadyDone: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/greenCheckIcon.svg',
    heading: '360 Spin Already Exists',
    para: 'This Project already has processed an Exterior 360 spin, no further changes can be made. You can view the 360 Spin in the Projects page.',
    rememberChoiceText: "Don't show this message again",
  },
  skuLimitExceedModal: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/icons/vehicleLimitModalIcon.svg',
    heading: 'SKU Limit Exceeded!',
    para: 'We only support up to 5 Images at a time, kindly reduce the number of Images you are uploading',
  },
  feedbackReasonsModal: {
    image: 'https://spyne-static.s3.amazonaws.com/warning-circle.svg',
    heading: 'Image Feedback',
    para: 'Which aspects of the image have issues?',
    closeBtn:
      'https://spyne-static.s3.amazonaws.com/console/project/close_icon.svg',
    btn1text: 'Continue',
    inputLabel: 'Any other issues?',
  },
  topUpSubscriptionModal: {
    heading: 'Top-up your credits',
    para: 'Add credits to unlock endless creativity',
    btn1Text: 'Buy Credits',
    btnLoading: 'Redirecting you to Stripe...',
    creditTranslation: '1 Credit = 1 Vehicle',
    btnSubheading: 'Credits will last until your current billing cycle',
  },
  imageCreditsExhausted: {
    heading: 'Your image credits have been exhausted.',
    subheading:
      "It's time to top up your credits! You cannot process your images for now",
    btn1Text: 'Not Now',
    btn2Text: 'Top up Credits',
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/changesmodal.svg',
  },
  vehicleCreditsExhausted: {
    heading: 'Your vehicle credits have been exhausted.',
    heading2: 'Your plan validity has been exhausted.',
    para: "It's time to top up your credits! You cannot process your images for now",
    btn1Text: 'Not Now',
    btn2Text: 'Top up Credits',
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/changesmodal.svg',
  },
  teamVehicleCreditsExhausted: {
    heading: 'Your vehicle credits have been exhausted.',
    heading2: 'No credits assigned.',
    para: 'No credits assigned! Please contact CSM to assign credits to your account.',
    btn1Text: 'Not Now',
    image:
      'https://spyne-static.s3.amazonaws.com/console/project/changesmodal.svg',
  },
  creditsPurchaseSuccess: {
    heading: 'Transaction successful!',
    btn2Text: 'Continue',
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/greenCheckIcon.svg',
  },
  contactSales: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/icons/featured-icon.svg',
    heading: 'Start a free trial now!',
    para: "Just drop in your details here and we'll get back to you!",
  },
  video360ProjectSave: {
    // image: "https://spyne-static.s3.amazonaws.com/console/project/changesmodal.svg",
    image: 'https://spyne-static.s3.amazonaws.com/console/loader_drum.svg',
    heading: 'Creation of 360 Spin started...',
    para: 'Generating 360 Spin usually takes some time. <br/> We will let you know as soon as it is completed',
  },
  video360ImageModal: {
    image: 'https://spyne-static.s3.amazonaws.com/gate-icon.svg',
    heading: 'Interior 360',
    para: 'Interior images that will get processed with 360 spin',
  },
  video360FocusModal: {
    image: 'https://spyne-static.s3.amazonaws.com/gate-icon.svg',
    heading: 'Focus Images',
    para: 'Focus images that will get processed with 360 spin',
  },
  ValidateError: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/uploadErrorIcon.svg',
    heading: 'Validation Failed',
  },
  videoLength: {
    image:
      'https://spyne-static.s3.amazonaws.com/console/virtual-studio/three-sixty-spin/icons/uploadErrorIcon.svg',
    heading: 'Video Upload Specifications',
    para: 'We were unable to upload your video, <br/> Ensure the file size is under 500 MB and try again.',
    btn2Text: 'Upload',
  },
};

export const vinTabsForMultiSKU = [
  {
    key: 'vins_found',
    title: 'VINs Found',
  },
  {
    key: 'no_vins_found',
    title: 'No VINs Found',
  },
];

export const searchBarOptions = {
  All: [
    { label: 'Vehicle Name', value: 'sku_name' },
    { label: 'Vehicle ID', value: 'sku_id' },
    { label: 'Folder Name', value: 'project_name' },
  ], //,{label: "Folder ID",value: "project_id"}
  'My Projects': [
    { label: 'Vehicle Name', value: 'sku_name' },
    { label: 'Vehicle ID', value: 'sku_id' },
    { label: 'Folder Name', value: 'project_name' },
  ], //,{label: "Folder ID",value: "project_id"}
  Skus: [
    { label: 'Vehicle Name', value: 'sku_name' },
    { label: 'Vehicle ID', value: 'sku_id' },
  ],
  Trash: [
    { label: 'Vehicle Name', value: 'sku_name' },
    { label: 'Vehicle ID', value: 'sku_id' },
    { label: 'Folder Name', value: 'project_name' },
  ],
  Folders: [{ label: 'Folder Name', value: 'project_name' }], //,{label: "Folder ID",value: "project_id"},
};

export const inventorySearchOptions = [
  { label: 'VIN', value: 'sku_id' },
  { label: 'Car Name', value: 'sku_name' },
  { label: 'Model year', value: 'model_year' },
];

export const manageStudios = {
  Custom: [
    { label: 'Background ID', value: 'background_id' },
    { label: 'Enterprise ID', value: 'enterprise_id' },
  ],
  Library: [{ label: 'Background ID', value: 'background_id' }],
};

export const iconSVGs = {
  paid_icon: '',
};

export const defaultEnterprise = {
  domain: 'spyne.ai',
  enterpriseID: 'TaD1VC1Ko',
  teamId: 'tagdsb12',
  prodCatAuto: 'cat_d8R14zUNE',
  prodCatEcom: 'cat_Ujt0kuFxY',
  prodCatFood: 'cat_Ujt0kuFxF',
};

export const guestEnterprise = {
  enterpriseID: '72bb92735',
  enterpriseIDEcom: '8fabf6921',
  teamId: '8cc4c88c71',
  userId: 'g24rf7w5',
  teamIdEcom: '9f6d829692',
  prodCatAuto: 'cat_d8R14zUNE',
  prodCatEcom: 'cat_Ujt0kuFxY',
  guestUserId: 'g24rf7w5',
  guestUserIdEcom: 'ab1cbae9',
  guestBearerToken:
    'Bearer eyJkZXZpY2VJZCI6IjVjYjhhYWEzNmRiMmNkYTdiOWRjZTg5ZWY1OGQyMmY3IiwiYXV0aEtleSI6ImZlZDVhNGQ0LWI3N2MtNDQ1MS04NGVhLTJkOTkzNjZkZTc4YiIsImVudGVycHJpc2VfaWQiOiI3MmJiOTI3MzUiLCJ0ZWFtX2lkIjoiOGNjNGM4OGM3MSJ9',
};

export const cookie = (key) =>
  (new RegExp((key || '=') + '=(.*?); ', 'gm').exec(document.cookie + '; ') || [
    '',
    null,
  ])[1];

export const mailFormatRegEx =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const teamNameRegex = /^[a-zA-Z0-9]{1}(\w|\s)*[a-zA-Z0-9]{1}$/;
export const mobileNumberRegex = /^[6-9]\d{9}$/;
export const nameRegex = /^[a-zA-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/;
export const websiteURLRegex =
  /^[a-zA-Z0-9]+([.][a-zA-Z0-9]+)+(\/[a-zA-Z0-9-]+)*$/;
export const floatRegex = /^\d+(\.\d{0,2})?$/;
export const NonZeroFloatRegex =
  /^(?!0+(\.0{1,2})?$)([1-9]\d*|0)?(\.\d{1,2})?$/;
export const onlyNumberRegex = /^[1-9]\d*$/;
export const onlyNumberWithoutDecimalRegex = /^\d+$/;

export const RENDER_TYPES = {
  ACTIONBAR: 'ACTIONBAR',
  ARCHIVED_ACTIONBAR: 'ARCHIVED_ACTIONBAR',
  PROJECT_CARD: 'PROJECT_CARD',
  ARCHIVED_CARD: 'ARCHIVED_CARD',
  SORT_MENU: 'SORT_MENU',
  MOVE_TO_FOLDER: 'MOVE_TO_FOLDER',
  FILTER_MODAL: 'FILTER_MODAL',
  SKU_CARD: 'SKU_CARD',
  TEMP_SKU_CARD: 'TEMP_SKU_CARD', //until multi archive and download becomes functional
  USERS_SORT: 'USERS_SORT',
  TRASH_THREE_DOT: 'TRASH_THREE_DOT',
  TRASH_FOLDER_MENU_LIST: 'TRASH_FOLDER_MENU_LIST',
  TRASH_SKU_MENU_LIST: 'TRASH_SKU_MENU_LIST',
  SORT_BY: 'SORT_BY',
  DATE_RANGE: 'DATE_RANGE',
  CSV_DOWNLOAD: 'CSV_DOWNLOAD',
  RETRY_MENU: 'RETRY_MENU',
};

export const HeaderSrc = {
  toCollapseMenuIcon:
    'https://spyne-static.s3.amazonaws.com/console/console_header/expanded-hamburger-menue-icon.svg',
  toExpandMenuIcon:
    'https://spyne-static.s3.amazonaws.com/console/console_header/hamburger-menue-icon.svg',
  consoleLogo:
    'https://spyne-static.s3.amazonaws.com/console/console_header/console-logo.svg',
  creditWallet:
    'https://spyne-static.s3.amazonaws.com/console/console_header/wallet.svg',
  credits: '5600',
  enterpriseLogo:
    'https://spyne-static.s3.amazonaws.com/console/console_header/enterprise-logo.svg',
  enterpriseName: 'Ford Sec 48',
  dropDownIcon:
    'https://spyne-static.s3.amazonaws.com/console/console_header/dropdown.svg',
  notificationBell:
    'https://spyne-static.s3.amazonaws.com/console/console_header/Notification-bell-icon.svg',
  profilePicture:
    'https://spyne-static.s3.amazonaws.com/console/project/userProfileIcon.svg',
};
export const redirectLinks = {
  upgradeRedirectUrl: `https://share.hsforms.com/1PQ9ixMRdRUaluQPUnAiNlg4d6tn`,
  policyLinkurl: `https://www.spyne.ai/privacy`,
  cookieLikUrl: `https://www.spyne.ai/cookie-policy`,
  termsServiceUrl: 'https://www.spyne.ai/terms-service',
};

/** Whitelabel policy field from get-data: { value: string, selected?: string } */
export const getResellerPolicyUrl = (policy, fallback) => {
  const url =
    typeof policy === 'string'
      ? policy.trim()
      : typeof policy?.value === 'string'
        ? policy.value.trim()
        : '';
  if (url && /^https?:\/\//i.test(url)) {
    return url;
  }
  return fallback;
};
export const imageCategoryMapping = {
  Exterior: 'Exterior',
  Exterior_Banner: 'Exterior',
  '360_exterior': 'Exterior',
  'Exterior Focus': 'Exterior',
  exterior: 'Exterior',
  Interior: 'Interior',
  Interior_Banner: 'Interior',
  '360int': 'Interior',
  '360_interior': 'Interior',
  'Interior Focus': 'Interior',
  Miscellaneous: 'Miscellaneous',
};

export async function Logout({ skipBackendLogout = true }, screenSize) {
  let path = window.location.pathname,
    routerReplaceFor = ['/virtualstudio'];
  try {
    let deviceId = '';
    if (localStorage.getItem(localStorageKeys?.DEVICEID)) {
      deviceId = localStorage.getItem(localStorageKeys?.DEVICEID);
    }
    googleLogout();
    if (!skipBackendLogout) await logoutFromBackend(deviceId);
  } catch (error) {
  } finally {
    preserveLocalStorage();

    sessionStorage.clear();

    if (routerReplaceFor?.includes(path) && screenSize !== 'DESKTOP') {
      window.location.replace(`${path}`);
    } else {
      window.location.replace('/login');
    }
  }
}
export const preserveLocalStorage = () => {
  try {
    const keysToPreserve = {
      rememberChoiceVS: false, // Default value is false
      VSProjectCount: [], // Default value is an empty array
      Virtual360VideoCount: [], // Default value is an empty array
      coachMarkCompletedSteps: [], // Default value is an empty array
      inventoryCoachMarkCompletedSteps: [], // Default value is an empty array
      firstTimeUser: true, // Default value is true
      ipApiJson: {},
      enterpriseTopUpCount: {},
    };

    // Backup the keys and values you want to preserve
    Object.keys(keysToPreserve).forEach((key) => {
      const value = localStorage.getItem(localStorageKeys[key]);
      keysToPreserve[key] = value ? JSON.parse(value) : keysToPreserve[key];
    });

    // Clear localStorage
    localStorage.clear();

    // Restore the preserved data
    Object.keys(keysToPreserve).forEach((key) => {
      localStorage.setItem(
        localStorageKeys[key],
        JSON.stringify(keysToPreserve[key])
      );
    });
  } catch (error) {
    console.error('Error preserving localStorage:', error);
  }
};

export const fetchDate = (inpDate) => {
  let date = new Date(inpDate);

  const hours = date?.getHours() || 0;
  const minutes = date?.getMinutes() || 0;
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}, ${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const getDateTime = (inpDate, dateSeparator = '/', order = 1) => {
  let date = new Date(inpDate);
  let month = date.toLocaleString('default', { month: 'long' });
  let time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  if (order === 1) {
    //time first
    return ` ${time}, ${date.getDate()}${dateSeparator}${date.getMonth() + 1}${dateSeparator}${date.getFullYear()}`;
  } else if (order === 2) {
    return `${date.getFullYear()}${dateSeparator}${date.getMonth() + 1}${dateSeparator}${date.getDate()}, ${time}`;
  } else {
    return ` ${date.getDate()}${dateSeparator}${date.getMonth() + 1}${dateSeparator}${date.getFullYear()}, ${time}`;
  }
};

// export const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = (`0${date.getMonth() + 1}`).slice(-2); // Months are 0-based; add leading 0.
//     const day = (`0${date.getDate()}`).slice(-2); // Add leading 0.
//     return `${year}-${month}-${day}`;
// };

export const formatDate = (date) => {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export const getCurrentFormattedDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  mm = mm < 10 ? `0${mm}` : mm;
  dd = dd < 10 ? `0${dd}` : dd;

  return `${yyyy}-${mm}-${dd}`;
};

export const getSimpleDate = (date) => {
  const today = new Date(date);
  const yyyy = today.getFullYear(),
    mm = today.toLocaleString('default', { month: 'long' });
  let dd = today.getDate();

  dd = dd < 10 ? `0${dd}` : dd;

  return `${dd} ${mm} ${yyyy}`;
};

export const base64Payload = ({ payload = {} }) => {
  try {
    let encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64'
    );

    return encodedPayload;
  } catch (error) {
    console.error(error);
  }
};

export const base64Decode = ({ payload = {}, decodeSrc = false }) => {
  try {
    let decodedToken = '';
    if (decodeSrc) {
      decodedToken = jwtDecode(payload?.credential);
    }

    return decodedToken;
  } catch (error) {
    console.error(error);
  }
};

export const LOGIN_TYPES = {
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
  OTP: 'OTP',
  EMAIL: 'EMAIL',
  CREATE_ENTERPRISE: 'create-enterprise',
  SELECT_ENTERPRISE: 'select-enterprise',
  HOME: 'home-page',
  FORGOT_PASSWORD: 'forgot-password',
  FORGOT_EMAIL_LINK_SENT: 'forgot-email-link-sent',
  SELECT_TEAM: 'select-team',
};

export const dropDownOptions = {
  SWITCH_ENTERPRISE: 'SWITCH_ENTERPRISE',
  LOGOUT: 'LOGOUT',
  ACCOUNT: 'ACCOUNT',
  ADMIN_TOOLS: 'ADMIN_TOOLS',
  BILLING_AND_PLAN: 'BILLING_AND_PLAN',
  WHAT_S_NEW: 'WHAT_S_NEW',
};

export const permissions = {
  MODIFY_ENTERPRISE_PLAN_ALL: 'MODIFY_ENTERPRISE_PLAN_ALL',
  VIEW_USER_ALL: 'VIEW_USER_ALL',
  VIEW_PROJECT_SKU_PERMISSION_SELF: 'VIEW_PROJECT_SKU_PERMISSION_SELF',
  DELETE_PROJECT_SKU_ALL: 'DELETE_PROJECT_SKU_ALL',
  DELETE_PROJECT_SKU_SELF: 'DELETE_PROJECT_SKU_SELF',
};

export const categoryIdMapping = {
  cat_d8R14zUNE: 'Automobile',
  cat_Ujt0kuFxY: 'E-commerce',
  cat_Ujt0kuFxF: 'Food',
};

export const stripeCurrencyMap = {
  $: 'usd',
  '€': 'eur',
  '£': 'gbp',
  cad$: 'cad',
  '₹': 'inr',
};

export const getUserCreditDetails = async (authKey) => {
  try {
    const URL = `${process.env.CREDIT_AND_TRANSACTIONS_PREFIX}/api/v1/users/available-credits`;
    const resp = await CentralAPIHandler.handleGetRequest(
      URL,
      {},
      {
        authorization: authKey,
      }
    );
    return resp?.data;
  } catch (error) {}
};

export const getUserId = () => {
  try {
    let userDetails = localStorage?.getItem(localStorageKeys?.USERDETAILS)
      ? JSON.parse(localStorage?.getItem(localStorageKeys?.USERDETAILS))
      : {};
    return userDetails;
  } catch (error) {}
};

export function generateBearerToken(
  { additionalPayload = {} },
  createEnterpriseSignUp = false,
  team_id,
  enterprise_id
) {
  try {
    let bearerToken = localStorage.getItem(
      localStorageKeys?.DEFAULTBEARERTOKEN
    );

    let enterpriseId = enterprise_id
      ? enterprise_id
      : localStorage.getItem(localStorageKeys?.defaultEnterprise)
        ? JSON.parse(localStorage.getItem(localStorageKeys?.defaultEnterprise))
            ?.enterpriseId
        : '';

    // enterpriseId =enterpriseId? :null;
    // let teamId = team_id ? team_id : sessionStorage.getItem(sessionStorageKeys?.selectedTeam) ? JSON.parse(sessionStorage.getItem(sessionStorageKeys?.selectedTeam))?.team_id : ""
    let teamId = team_id ? team_id : '';
    // teamId = teamId ? JSON.parse(teamId)?.team_id :''

    if (!bearerToken || createEnterpriseSignUp) {
      if (
        localStorage.getItem(localStorageKeys?.AUTHKEY) &&
        localStorage.getItem(localStorageKeys?.DEVICEID)
      ) {
        let defaultPayload = {
          authKey: localStorage.getItem(localStorageKeys?.AUTHKEY),
          deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
        };

        enterpriseId ? (defaultPayload['enterprise_id'] = enterpriseId) : null;
        teamId ? (defaultPayload['team_id'] = teamId) : null;

        let finalPayload = {};
        if (Object.keys(additionalPayload).length > 0) {
          finalPayload = { ...additionalPayload, ...defaultPayload };
        } else {
          finalPayload = { ...defaultPayload };
        }

        let token = base64Payload({ payload: finalPayload });
        bearerToken = `Bearer ${token}`;

        localStorage.setItem(localStorageKeys?.DEFAULTBEARERTOKEN, bearerToken);
      } else if (
        Object.values(additionalPayload).length > 0 &&
        localStorage.getItem(localStorageKeys?.DEVICEID)
      ) {
        let token = base64Payload({ payload: additionalPayload });
        bearerToken = `Bearer ${token}`;
      } else {
        bearerToken = guestEnterprise?.guestBearerToken;
      }
    }

    return bearerToken;
  } catch (error) {
    console.error('Error in generateBearerToken:', JSON.stringify(error));
  }
}

export const logoutFromBackend = async (deviceId, globalLogout = false) => {
  try {
    let deviceList = [deviceId];
    const URL = `${process.env.BACKEND_BASEURL}/user-management/v1/user/logout`;
    const resp = await CentralAPIHandler.handlePostRequest(URL, {
      deviceIdList: deviceList,
      isLogOutFromAllDevices: globalLogout,
    });
    ClevertapReact.logout();
  } catch (error) {
    console.error(error);
  }
};

export const validateFormFields = ({ formFields = {}, fromSignUp = false }) => {
  try {
    const errors = {};
    if (fromSignUp && !formFields.userName) {
      errors.userName = 'User name is required for signup!';
    }
    if (fromSignUp && formFields.userName.length < 4) {
      errors.userName = 'User name length cannot be less than 4 digits!';
    }
    if (!formFields.emailId) {
      errors.emailId = 'Email is required!';
    } else if (!mailFormatRegEx.test(formFields?.emailId)) {
      errors.emailId = 'Please enter a valid email address';
    }
    if (!formFields.contactNo) {
      errors.contactNo = 'Contact no is required!';
    }
    if (!formFields.password) {
      errors.password = 'Password is required';
    } else if (formFields?.password?.length < 4) {
      errors.password = 'Password must be more than 4 characters';
    } else if (formFields.password?.length > 25) {
      errors.password = `Password can't exceed 25 characters`;
    }
    if (!formFields?.confirmPassword) {
      errors.confirmPassword = `Confirm Password is required!`;
    } else if (formFields?.confirmPassword !== formFields.password) {
      errors.confirmPassword = `Password not matching`;
    }
    return errors;
  } catch (error) {}
};

export const validateAdminToolsFields = ({
  formFields = {},
  fromSignUp = false,
}) => {
  try {
    const error = {};
    let emailId = formFields?.OWNER_EMAIL.trim();
    emailId = emailId.toLocaleLowerCase();
    if (!formFields?.ENTERPRISE_NAME || !formFields?.ENTERPRISE_NAME.trim()) {
      error.ENTERPRISE_NAME = `Enterprise Name is required`;
    }
    if (!formFields?.DEFAULT_TEAMNAME || !formFields?.DEFAULT_TEAMNAME.trim()) {
      error.DEFAULT_TEAMNAME = `Team Name is required`;
    }
    if (!formFields?.OWNER_NAME || !formFields?.OWNER_NAME.trim()) {
      error.OWNER_NAME = `Owner Name is required`;
    }
    if (!formFields?.OWNER_PHONE || !formFields?.OWNER_PHONE.trim()) {
      error.OWNER_PHONE = `Mobile Number is required`;
    }
    if (!formFields?.OWNER_EMAIL || !formFields?.OWNER_EMAIL.trim()) {
      error.OWNER_EMAIL = `Email Address is required`;
    } else if (!mailFormatRegEx.test(emailId)) {
      error.OWNER_EMAIL = `Please enter a valid email`;
    }

    return error;
  } catch (error) {
    console.error(error);
  }
};

export const validateCreateEnterpriseFormFields = ({
  formFields = {},
  fromSignUp = false,
}) => {
  try {
    const error = {};
    if (!formFields?.enterpriseName && formFields?.enterpriseName.length < 5) {
      error.enterpriseName = `Enterprise name must be greater than 5 digits`;
    }
    if (!formFields?.teamName && formFields?.teamName.length < 5) {
      error.teamName = `Team name must be greater than 5 digits`;
    }
    if (
      formFields?.url &&
      !formFields?.url.match(/^(https?|ftp):\/\/([^\s\/$.?#]+\.[^\s]*)$/i)
    ) {
      error.url = `Please enter a valid website URL`;
    }
    return error;
  } catch (error) {}
};

export const validateFormFieldsSetPassword = ({
  formFields = {},
  fromSignUp = false,
}) => {
  try {
    const errors = {};
    if (fromSignUp && !formFields.userName) {
      errors.userName = 'User name is required for signup!';
    }
    if (!formFields.emailId) {
      errors.emailId = 'Email is required!';
    } else if (!mailFormatRegEx.test(formFields?.emailId)) {
      errors.emailId = 'Please enter a valid email address';
    }
    if (!formFields.new_password) {
      errors.new_password = 'Password is required';
    } else if (formFields?.new_password?.length < 4) {
      errors.new_password = 'Password must be more than 4 characters';
    } else if (formFields.new_password?.length > 15) {
      errors.new_password = `Password can't exceed 15 characters`;
    }
    if (formFields.new_password !== formFields.confirm_password) {
      errors.confirm_password = `Password doesn't match`;
    } else if (!formFields.confirm_password) {
      errors.confirm_password = 'Confirm Password is required';
    }

    return errors;
  } catch (error) {}
};

export const validatePlanDetailsFormFields = ({
  formFields = {},
  SAssured = false,
}) => {
  try {
    const error = {};
    if (SAssured) {
      if (!formFields?.volume) {
        error.volume = 'Volume per month is required for Spyne Assured feature';
      } else if (!onlyNumberRegex.test(formFields?.volume)) {
        error.volume = 'Volume per month should be a whole number';
      }
    }
    if (!formFields?.price_per_vehicle) {
      error.price_per_vehicle = 'Price per vehicle is a required field';
    } else if (!NonZeroFloatRegex.test(formFields?.price_per_vehicle)) {
      error.price_per_vehicle =
        'Price per vehicle should be a non-zero float value';
    }

    return error;
  } catch (error) {
    console.error(error);
  }
};

export const validateBillingFormFields = ({ formFields = {} }) => {
  try {
    let error = {};
    if (
      formFields?.paymentAmmount &&
      !NonZeroFloatRegex.test(formFields?.paymentAmmount)
    ) {
      error.paymentAmmount = 'Payment Amount should be a non-zero float value';
    }
    if (
      formFields?.existingStockCharges &&
      !NonZeroFloatRegex.test(formFields?.existingStockCharges)
    ) {
      error.existingStockCharges =
        'Existing Stock Charges should be a non-zero float value';
    }
    if (
      formFields?.additionalStudioFee &&
      !NonZeroFloatRegex.test(formFields?.additionalStudioFee)
    ) {
      error.additionalStudioFee =
        'Additional Studio Fee should be a non-zero float value';
    }
    if (
      formFields?.integrationFee &&
      !NonZeroFloatRegex.test(formFields?.integrationFee)
    ) {
      error.integrationFee = 'Integration should be a non-zero float value';
    }
    if (
      formFields?.spyneAssuredFee &&
      !NonZeroFloatRegex.test(formFields?.spyneAssuredFee)
    ) {
      error.spyneAssuredFee =
        'Spyne Assured Fee should be a non-zero float value';
    }
    if (
      formFields?.arrAmount &&
      !NonZeroFloatRegex.test(formFields?.arrAmount)
    ) {
      error.arrAmount = 'Potential ARR amount should be a non-zero float value';
    }
    return error;
  } catch (error) {}
};

export const validateContactSalesForm = ({ formFields = {} }) => {
  try {
    let err = {};
    if (!formFields?.name) {
      err.name = 'Name is required';
    } else if (formFields?.name && !nameRegex.test(formFields?.name)) {
      err.name = "Please don't include special characters";
    }
    if (!formFields.email) {
      err.email = 'Email is required!';
    } else if (!mailFormatRegEx.test(formFields?.email)) {
      err.email = 'Please enter a valid email address';
    }
    if (!formFields?.company) {
      err.company = 'Company Name is required';
    } else if (formFields?.company && !nameRegex.test(formFields?.company)) {
      err.company = "Please don't include special characters";
    }
    if (!formFields?.phone) {
      err.phone = 'Phone is required';
    } else if (formFields?.phone && !onlyNumberRegex.test(formFields?.phone)) {
      err.phone = 'Please include only number';
    }
    return err;
  } catch (error) {
    console.error(error);
  }
};

// Capitalize first letter of each word
export const capitalizeUserName = (str) => {
  let LowerCasestr = str.toLocaleLowerCase();
  var splitStr = LowerCasestr.split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
};

export const formatNumberWithCommas = (number) => {
  if (number !== undefined && number !== null) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return '';
};

export const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .reduce((result, word, index) => {
      return (
        result +
        (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      );
    }, '');
};

export const getPermissionObject = () => {
  try {
    let permissionObject = localStorage.getItem(
      localStorageKeys.permissionObject
    )
      ? JSON.parse(localStorage.getItem(localStorageKeys.permissionObject))
      : {};

    return permissionObject;
  } catch (error) {}
};

export const getSubDomainFromLocalStorage = () => {
  try {
    const configData = sessionStorage.getItem('configData');
    if (configData) {
      const configObject = JSON.parse(configData);

      if (configObject && configObject.sub_domain) {
        return configObject.sub_domain;
      }
    }
  } catch (error) {}
};

/**
 * returns skipEnterprise (true, false) and enterprise_id
 */
export const skipEnterpriseSelectionPage = (userEmail, defaultEnterpriseId) => {
  try {
    let domain = defaultEnterprise?.domain,
      skip = false;
    const spyneEnterpriseId = defaultEnterprise?.enterpriseID;
    const domainPattern = new RegExp(`@${domain}$`, 'i');

    if (
      domainPattern.test(userEmail) &&
      defaultEnterpriseId === spyneEnterpriseId
    ) {
      skip = true;
      return { skip, enterprise_id: spyneEnterpriseId };
    } else if (defaultEnterpriseId) {
      skip = true;
      return { skip, enterprise_id: defaultEnterpriseId };
    }
    return { skip };
  } catch (error) {
    console.error(error);
  }
};

export const newBearerAfterGuestLoginFalse = async (authKey) => {
  try {
    let auth_key = authKey || localStorage.getItem(localStorageKeys?.AUTHKEY);
    if (auth_key && localStorage.getItem(localStorageKeys?.DEVICEID)) {
      let defaultPayload = {
        authKey: localStorage.getItem(localStorageKeys?.AUTHKEY),
        deviceId: localStorage.getItem(localStorageKeys?.DEVICEID),
      };

      let token = base64Payload({ payload: defaultPayload });
      let bearerToken = `Bearer ${token}`;

      localStorage.setItem(localStorageKeys?.DEFAULTBEARERTOKEN, bearerToken);
    }
  } catch (error) {
    console.error(error);
  }
};

export const getFieldData = (payload) => {
  let fields = [];
  if (payload?.name) {
    fields.push({
      objectTypeId: '0-1',
      name: 'name1',
      value: payload?.name?.trim(),
    });
  }
  if (payload?.email) {
    fields.push({
      objectTypeId: '0-1',
      name: 'email',
      value: payload?.email?.trim(),
    });
  }
  if (payload?.submission_page_url) {
    fields.push({
      objectTypeId: '0-1',
      name: 'submission_page_url_new',
      value: payload?.submission_page_url,
    });
  }
  if (payload?.utm_channel) {
    fields.push({
      objectTypeId: '0-1',
      name: 'utm_channel',
      value: payload?.utm_channel,
    });
  }
  if (payload?.phone) {
    fields.push({
      objectTypeId: '0-1',
      name: 'phone',
      value: payload?.phone?.trim(),
    });
  }
  if (payload?.company) {
    fields.push({
      objectTypeId: '0-1',
      name: 'company',
      value: payload?.company?.trim(),
    });
  }

  if (payload?.website_link) {
    fields.push({
      objectTypeId: '0-1',
      name: 'website_link',
      value: payload?.website_link,
    });
  }
  if (payload?.website) {
    fields.push({
      objectTypeId: '0-1',
      name: 'website',
      value: payload?.website,
    });
  }
  if (payload?.annual_revenue) {
    fields.push({
      objectTypeId: '0-1',
      name: 'annual_revenue',
      value: payload?.annual_revenue,
    });
  }
  if (payload?.otpVerify) {
    fields.push({
      objectTypeId: '0-1',
      name: 'otp-verified',
      value: payload?.otpVerify,
    });
  }
  if (payload?.organization) {
    fields.push({
      objectTypeId: '0-1',
      name: 'organization',
      value: payload?.organization,
    });
  }
  if (payload?.number_of_cars) {
    fields.push({
      objectTypeId: '0-1',
      name: 'no__of_cars_for_plan',
      value: payload?.number_of_cars,
    });
  }
  return fields;
};

export const newHubspotReport = async (payload, usePLGForm = '') => {
  try {
    const hubspotutkValue = document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('hubspotutk='));
    const hubSpotutkCookie = hubspotutkValue
      ? hubspotutkValue.split('=')[1]
      : null;
    let formGuid = 'cdcc48f0-6f17-43cb-a6f1-1d657d08c0ed';
    // let formGuid = "b1fc1b47-549e-4e43-b214-54de294ef070" //Form name: Sign Up Report Second Level (Console)
    const portalId = '242626590';
    // if (payload?.category == "E-commerce") {
    //     formGuid = "104dc1b6-4063-4d1d-9599-9971a42c8e1b" //Form name: Sign Up Report Second Level (Console) (Ecomm)
    // }
    // if (usePLGForm === "plg-contact-sales") {
    //     formGuid = "3aa51d42-cf93-4ba9-ad05-9dcd36de76de"
    // }

    let hubspotSignupFormUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    let data = {
      fields: await getFieldData(payload),
      context: {
        hutk: hubSpotutkCookie, // include this parameter and set it to the hubspotutk cookie value to enable cookie tracking on your submission
      },
    };
    axios
      .post(hubspotSignupFormUrl, data)
      .then(() => {
        return 'Success';
      })
      .catch(() => {
        return 'Failed';
      });
  } catch (error) {
    console.error(error);
  }
};

export const extractVideoFormat = (videoUrl) => {
  try {
    // Extract the file extension from the videoUrl
    const fileExtension = videoUrl?.split('.').pop().toLowerCase();

    // Map common file extensions to their corresponding video formats
    const formatMap = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      avi: 'video/avi',
      mkv: 'video/x-matroska',
      mov: 'video/mp4',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      m4v: 'video/x-m4v',
      m3u8: 'application/x-mpegURL',
      mpd: 'application/dash+xml',
      // Add more mappings as needed for other video formats and codecs
    };

    // Check if the file extension is in the formatMap, otherwise return 'unknown'
    return formatMap[fileExtension] || 'unknown';
  } catch (error) {
    console.error(error);
  }
};

export const checkCategoryAndRedirect = (
  router,
  categoryId,
  enterpriseId,
  teamId = null,
  goBack = false,
  source
) => {
  try {
    if (localStorage.getItem('bgId')) {
      let bgId = localStorage.getItem('bgId');
      localStorage.removeItem('bgId');
      // router.push({
      //   pathname: '/settings',
      //   query: {
      //     activeSubTab: 'studio',
      //     enterprise_id: enterpriseId,
      //     team_id: teamId,
      //     bgId: bgId,
      //   },
      // });
      router.push(
        `/settings?activeSubTab=studio&bgId=${bgId}&enterprise_id=${enterpriseId}&team_id=${teamId}`
      );
      return;
    }
    if (
      categoryId === defaultEnterprise?.prodCatAuto ||
      categoryId === defaultEnterprise?.prodCatEcom
    ) {
      const hasVIEW_ENTERPRISE_DASHBOARD = GetPermissionClientObject(
        'VIEW_ENTERPRISE_DASHBOARD'
      ).status;
      if (hasVIEW_ENTERPRISE_DASHBOARD && !goBack) {
        redirectToAdminTools(router);
        return;
      }
      if (source === 'sign-up') {
        if (router?.query?.pageSource) {
          router.push({
            pathname: '/home',
            query: {
              enterprise_id: enterpriseId,
              team_id: teamId,
              pageSource: router?.query?.pageSource,
            },
          });
          return;
        }
        router.push({
          pathname: '/home',
          query: { enterprise_id: enterpriseId, team_id: teamId },
        });
      } else {
        if (router?.query?.pageSource) {
          router.push({
            pathname: '/home',
            query: {
              enterprise_id: enterpriseId,
              team_id: teamId,
              pageSource: router?.query?.pageSource,
            },
          });
          return;
        }
        router.push({
          pathname: '/home',
          query: { enterprise_id: enterpriseId, team_id: teamId },
        });
      }
    } else {
      // window.location.reload()
      let userDetails = localStorage?.getItem(localStorageKeys?.USERDETAILS)
        ? JSON.parse(localStorage?.getItem(localStorageKeys?.USERDETAILS))
        : {};
      let teamDetails = sessionStorage?.getItem(
        sessionStorageKeys?.selectedTeam
      )
        ? JSON.parse(sessionStorage?.getItem(sessionStorageKeys?.selectedTeam))
        : {};

      router.push({
        pathname: '/project',
        query: {
          enterprise_id: enterpriseId,
          team_id: teamDetails?.team_id,
          user_id: userDetails?.userId,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const generateUniqueDeviceId = () => {
  try {
    let uniqueId = uuid();
    let symbolsArr = ['@', '#', '$', '%'];
    const uniqueSymbols = Math.floor(Math.random() * symbolsArr.length);
    const mySecretKey = '8kEPzUgaAzrb9ws19RVYCj7e04TC05oF';
    const deviceId = `${uniqueId}_${symbolsArr[uniqueSymbols]}_${mySecretKey}`;

    return MD5(deviceId).toString();
  } catch (error) {
    console.error(error);
  }
};

export const openInbox = (e, client = 'GMAIL') => {
  e.preventDefault();
  e.stopPropagation();
  try {
    if (client === 'OUTLOOK') {
      window.open('https://outlook.live.com/mail/0/', '_blank');
    } else {
      let path =
        'https://mail.google.com/mail/u/0/#advanced-search/subset=ast&has=spyne&within=1d&sizeoperator=s_sl&sizeunit=s_smb&query=in%3Aanywhere+spyne';
      window.open(path, '_blank');
      //router.push(path)
    }
    captureEvent(
      `${client}_click`,
      {
        event_type: 'click',
      },
      true
    );
  } catch (error) {
    console.error(error);
  }
};

export const validateCreateEnterpriseForm = ({
  formFields = {},
  fromSignUp = false,
  categoryId,
  prodCatId,
  selectedRevenue = '',
}) => {
  //latest signup flow
  try {
    const error = {};
    if (!formFields?.enterprise_name) {
      error.enterprise_name = `Enterprise name is required!`;
    }
    if (!formFields?.owner_name) {
      error.owner_name = 'Owner name is required for signup!';
    }
    if (!formFields?.owner_phone) {
      error.owner_phone = 'Phone number is required!';
    }
    if (formFields?.owner_phone.length < 8) {
      error.owner_phone = 'Please enter a valid phone number!';
    }
    if (!formFields?.org_type) {
      error.org_type = 'Please select organization type!';
    }

    if (
      (categoryId && categoryId !== 'cat_d8R14zUNE') ||
      (prodCatId && prodCatId !== 'cat_d8R14zUNE')
    ) {
      if (!formFields?.website_link.length) {
        error.website_link = 'Website URL is required!';
      }
    }
    if (
      (categoryId && categoryId !== 'cat_d8R14zUNE') ||
      (prodCatId && prodCatId !== 'cat_d8R14zUNE')
    ) {
      if (
        formFields?.website_link.length > 0 &&
        !validateDotWithCharacters(formFields?.website_link)
      ) {
        error.website_link = 'Enter a valid Website URL!';
      }
    }
    if (
      categoryId &&
      categoryId !== 'cat_d8R14zUNE' &&
      selectedRevenue &&
      selectedRevenue === SELECT_DROPDOWN_REVENUE[0]?.value
    ) {
      error.revenue = 'Please select a value';
    }
    return error;
  } catch (error) {}
};

export const clearCache = async (cacheName, userId) => {
  try {
    if (!cacheName) return;
    const URL = `${process.env.APP_BACKEND_BASEURL}/user-management/v1/cache/empty-cache`;
    await CentralAPIHandler.handlePostRequest(URL, {
      cacheName,
      userId,
    });
  } catch (error) {}
};
export const getSelectedStage = (value) => {
  switch (value) {
    case 'Trial':
      return {
        key: 'TRIAL',
        option: 'Trial',
        colorTheme: 'bg-wisp-pink text-orange-red',
      };
    case 'Onboarding':
      return {
        key: 'ONBOARDING',
        option: 'Onboarding',
        colorTheme: 'bg-floral-white text-reddish-orange',
      };
    case 'Live':
      return {
        key: 'LIVE',
        option: 'Live',
        colorTheme: 'bg-green-cyan text-spring-green',
      };
    case 'Churned':
      return {
        key: 'CHURNED',
        option: 'Churned',
        colorTheme: 'bg-wisp-pink text-orange-red',
      };
    case 'Incomplete':
      return {
        key: 'INCOMPLETE',
        option: 'Incomplete',
        colorTheme: 'bg-wisp-pink text-orange-red',
      };
    default:
      return {};
  }
};

export const getSelectedStudioTrackerStatus = (value) => {
  switch (value) {
    case 'yetToPick':
      return {
        key: 'yetToPick',
        option: 'Yet to pick',
        colorTheme: 'bg-wisp-pink text-orange-red',
      };
    case 'inProgress':
      return {
        key: 'inProgress',
        option: 'In progress',
        colorTheme: 'bg-floral-white text-reddish-orange',
      };
    case 'delivered':
      return {
        key: 'delivered',
        option: 'Delivered',
        colorTheme: 'bg-green-cyan text-spring-green',
      };

    case 'notDelivered':
      return {
        key: 'notDelivered',
        option: 'Not delivered',
        colorTheme: 'bg-wisp-pink text-orange-red',
      };
    default:
      return {};
  }
};

export const validateDotWithCharacters = (inputString) => {
  let pattern = /^[a-zA-Z0-9]+[.][a-zA-Z0-9]+$/;
  return pattern.test(inputString);
};

export const fetchEnterpriseFeatures = (enterprise_id) => {
  try {
    CentralAPIHandler.handleGetRequest(
      process.env.APP_BACKEND_BASEURL +
        `/console/v1/enterprise/get-enterprise-plans`,
      {
        enterprise_id: enterprise_id,
      }
    ).then((resp) => {
      const enterprisePlan = resp?.data?.plan_title;
      const enterprise_plan_json = {
        [enterprise_id]: enterprisePlan,
      };
      let featuresOpted = {
        [enterprise_id]: {
          features: resp?.data?.features,
        },
      };
      sessionStorage.setItem(
        sessionStorageKeys?.enterprisePlan,
        JSON.stringify(enterprise_plan_json)
      );
      sessionStorage.setItem(
        sessionStorageKeys?.enterpriseFeatures,
        JSON.stringify(featuresOpted)
      );
      // {(planListForVideo360?.includes(enterprisePlan)) ?  setShow360(true) : setShow360(false) }
    });
  } catch (error) {
    console.error(error);
  }
};
// export const validateDotWithCharacters = (inputString) => {
//     let pattern = /^[a-zA-Z0-9]+[.][a-zA-Z0-9]+$/;
// }

export const lastActivity = (dateTime) => {
  try {
    const activityDate = new Date(dateTime);
    const currentDate = new Date();

    const timeDifference = currentDate - activityDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const monthsDifference = Math.floor(daysDifference / 30);
    const yearsDifference = Math.floor(monthsDifference / 12);

    let result;

    if (yearsDifference > 0) {
      result = `${yearsDifference} year${yearsDifference > 1 ? 's' : ''} ago`;
    } else if (monthsDifference > 0) {
      result = `${monthsDifference} month${monthsDifference > 1 ? 's' : ''} ago`;
    } else if (daysDifference > 0) {
      result = `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
    } else {
      result = 'Today';
    }

    return result;
  } catch (error) {
    console.error(error);
  }
};

const CDN_DOMAIN =
  process.env.NEXT_PUBLIC_THUMBOR_DOMAIN_URL_NEW || 'https://media.spyne.ai';

function parseS3Url(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname || '';
    const key = (parsed.pathname || '').replace(/^\/+/, '');
    if (!key) return null;
    const s3Match = /^(.+)\.s3(\.[a-z0-9-]+)?\.amazonaws\.com$/i.exec(host);
    if (s3Match) {
      return { bucket: s3Match[1], key };
    }
    return null;
  } catch {
    return null;
  }
}

function encodeS3KeyForThumbor(key) {
  // Guard: null / undefined / non-string / empty
  if (key == null || typeof key !== 'string' || key === '') return key;

  return key
    .split('/')
    .map((segment) => {
      // Preserve empty segments (leading slash, double slashes)
      if (segment === '') return '';

      // Warn on suspected double-encoding (%25xx)
      if (/%25[0-9a-fA-F]{2}/.test(segment)) {
        console.warn(
          `[encodeS3KeyForThumbor] Possible double-encoded segment: "${segment}"`
        );
      }

      // Step 1: S3 console legacy + → space (must happen before decodeURIComponent
      //         so that a real %2B surviving decode doesn't become a false space)
      const plusDecoded = segment.replaceAll('+', ' ');

      // Step 2: Decode any existing percent-encoding to avoid double-encoding.
      //         Splitting before this step means %2F is safe — it decodes to /
      //         within a segment and encodeURIComponent re-encodes it to %2F.
      let decoded;
      try {
        decoded = decodeURIComponent(plusDecoded);
      } catch {
        // Step 3: Malformed % sequence (e.g. bare `%` not followed by hex) — use as-is
        decoded = plusDecoded;
      }

      // Step 4: Clean re-encode.
      //         encodeURIComponent handles: spaces→%20, unicode, ?, #, /, etc.
      return encodeURIComponent(decoded);
    })
    .join('/');
}

function getSecureThumborUrl(imagePath, resolution, filterFormat, secretKey) {
  const parts = [];

  parts.push(resolution || '0x0');

  parts.push('smart');
  if (filterFormat) {
    parts.push(`filters:format(${filterFormat})`);
  }
  parts.push(imagePath);
  const operationPath = parts.join('/');

  const signature = CryptoJS.HmacSHA1(operationPath, secretKey);
  const base64 = CryptoJS.enc.Base64.stringify(signature);
  const urlSafe = base64.replaceAll('+', '-').replaceAll('/', '_');

  return `${CDN_DOMAIN}/${urlSafe}/${operationPath}`;
}

function getUnsafeThumborUrl(imagePath, resolution, filterFormat) {
  const baseUrl =
    process.env.NEXT_PUBLIC_THUMBOR_DOMAIN_URL_NEW || `${CDN_DOMAIN}/unsafe`;
  const parts = [baseUrl.replace(/\/+$/, '')];
  if (resolution) parts.push(resolution);
  parts.push(`filters:format(${filterFormat})`, imagePath);
  return parts.join('/');
}

export const IMAGE_COMPRESSOR = (props) => {
  const SECRET_KEY = process.env.NEXT_PUBLIC_THUMBOR_SECRET_KEY_NEW;
  const { url, resolution, filterFormate, isOriginal = false } = props;

  if (isOriginal) {
    return url;
  }

  const filterFormat =
    typeof filterFormate === 'string' ? filterFormate : 'webp';

  const s3 = parseS3Url(url);
  if (!s3) {
    return url;
  }
  const encodedKey = encodeS3KeyForThumbor(s3.key);
  const imagePath = `${s3.bucket}/${encodedKey}`;

  if (SECRET_KEY) {
    return getSecureThumborUrl(imagePath, resolution, filterFormat, SECRET_KEY);
  }

  return getUnsafeThumborUrl(imagePath, resolution, filterFormat);
};

/**
 * @param {*} baseImgURL
 * @param {*} resolution: 640*360, 1440x
 * @param {*} format: jpg, png, webp
 */
export const createNewImage = (baseImgURL, resolution, format = 'webp') => {
  try {
    if (!baseImgURL) {
      return baseImgURL;
    }
    // console.log('THUMBOR CHECK', process.env.showThumborURL);
    // if (!process.env.showThumborURL || baseImgURL.match(/^blob/)) {
    //   return baseImgURL;
    // }
    return IMAGE_COMPRESSOR({
      url: baseImgURL,
      resolution,
      filterFormate: format,
    });
  } catch (error) {
    return baseImgURL;
  }
};

export const getRegionCode = async () => {
  try {
    const URL = `https://ipapi.co/json/`;
    let continent_code = '',
      country_code = '',
      region_code = '',
      country_name = '';

    const cachedIpData = localStorage.getItem(localStorageKeys?.ipApiJson);
    if (cachedIpData && Object.keys(JSON.parse(cachedIpData)).length > 0) {
      //TODO: if ip is different
      const ipData = JSON.parse(cachedIpData);

      continent_code = ipData?.continent_code;
      country_code = ipData?.country_code;
      country_name = ipData?.country_name;
    } else {
      const resp = await CentralAPIHandler.handleGetRequest(URL);
      continent_code = resp?.continent_code;
      country_code = resp?.country_code;
      country_name = resp?.country_name;

      localStorage.setItem(localStorageKeys?.ipApiJson, JSON.stringify(resp));
    }
    if (
      continent_code === 'EU' &&
      (country_code === 'UK' || country_name === 'United Kingdom')
    ) {
      region_code = 'gbp';
    } else if (continent_code === 'EU' && country_code !== 'UK') {
      region_code = 'eur';
    } else if (continent_code === 'NA' && country_code === 'US') {
      region_code = 'usd';
    } else if (continent_code === 'NA' && country_code === 'CA') {
      region_code = 'cad';
    } else if (continent_code === 'SA' && country_code === 'BR') {
      region_code = 'bra';
    } else if (
      continent_code === 'EU' &&
      (country_code === 'DK' || country_code === 'NO' || country_code === 'SE')
    ) {
      region_code = 'dns';
    } else {
      region_code = 'row';
    }

    return region_code;
  } catch (error) {
    console.error(error);
    return 'row';
  }
};

export const formatNumber = (num, precision = 2) => {
  try {
    const map = [
      { suffix: 'T', threshold: 1e12 },
      { suffix: 'B', threshold: 1e9 },
      { suffix: 'M', threshold: 1e6 },
      { suffix: 'K', threshold: 1e3 },
      { suffix: '', threshold: 1 },
    ];

    const found = map.find((x) => Math.abs(num) >= x.threshold);

    if (found) {
      // Calculate the value before applying toFixed to avoid rounding up
      const rawValue = num / found.threshold;
      const baseValue =
        Math.floor(rawValue * Math.pow(10, precision)) /
        Math.pow(10, precision);
      const formattedValue = baseValue.toFixed(precision);

      // Determine if the formatted value ends with ".00" to decide if we should display as an integer
      if (formattedValue.endsWith('.00')) {
        return `${parseInt(formattedValue, 10)}${found.suffix}`;
      }

      return `${formattedValue}${found.suffix}`;
    }

    return num.toString();
  } catch (error) {
    console.error(error);
  }
};

function deviceType() {
  const width = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );

  const isMobile = width <= 480;
  const isTablet = width > 480 && width <= 768;

  let type = 'desktop';
  if (isMobile) {
    type = 'mobile';
  } else if (isTablet) {
    type = 'tablet';
  } else {
    type = 'desktop';
  }

  return type;
}

function isInternalUser(email) {
  const domain = email.split('@')[1];
  const isInternal = domain.includes('spyne');
  return isInternal ? 'internal' : 'external';
}

function deviceSpecific() {
  const locale = navigator.language || navigator.userLanguage;
  const userAgentData = navigator.userAgentData;
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return {
    device: deviceType(),
    locale: locale,
    os_name: userAgentData?.platform,
    network: connection?.effectiveType,
    user_agent: navigator?.userAgent,
    vendor: navigator?.vendor,
  };
}

export const COMMON_CATPURE_EVENT_FIELDS = {
  CHILD_SCREEN_VIDEO_TAB: 'video_tab',
  CHILD_SCREEN_IMAGE_TAB_DEMO: 'image_tab',
  CHILD_SCREEN_IMAGE_TAB_DEMO_Login: 'login_popup',
};

// Pass TRUE for GA and FALSE for mixpanel/amplitude
export const captureEvent = (event, custom = {}, allToolFlag = true) => {
  try {
    let userDetails = localStorage?.getItem(localStorageKeys?.USERDETAILS)
      ? JSON.parse(localStorage?.getItem(localStorageKeys?.USERDETAILS))
      : {};
    let enterpriseData = sessionStorage?.getItem(
      sessionStorageKeys?.selectedEnterprise
    )
      ? JSON.parse(
          sessionStorage?.getItem(sessionStorageKeys?.selectedEnterprise)
        )
      : {};
    let payload = {
      email_id: userDetails?.emailId,
      user_id: userDetails?.userId,
      user_name: userDetails?.name,
      enterprise_id: enterpriseData?.enterprise_id,
      enterprise_name: enterpriseData?.enterprise_name,
      user_type: userDetails?.emailId
        ? isInternalUser(userDetails?.emailId)
        : 'guest',
      ...custom,
      ...deviceSpecific(),
    };
    // !isGAEvent && posthog.capture(event, payload)
    // isGAEvent && ReactGA4.event(event, payload)
    trackEvent(event, payload, allToolFlag);
  } catch (err) {
    console.error(err);
  }
};

export const captureInventoryEvents = async ({
  event,
  screenName,
  custom = {},
}) => {
  try {
    let userDetails = localStorage?.getItem(localStorageKeys?.USERDETAILS)
      ? JSON.parse(localStorage?.getItem(localStorageKeys?.USERDETAILS))
      : {};
    let enterpriseData = sessionStorage?.getItem(
      sessionStorageKeys?.selectedEnterprise
    )
      ? JSON.parse(
          sessionStorage?.getItem(sessionStorageKeys?.selectedEnterprise)
        )
      : {};
    let teamData = sessionStorage?.getItem(sessionStorageKeys?.selectedTeam)
      ? JSON.parse(sessionStorage?.getItem(sessionStorageKeys?.selectedTeam))
      : {};

    const authKey = localStorage.getItem(localStorageKeys?.AUTHKEY);

    const eventPayload = {
      event_name: event,
      screen_name: screenName,
      user_id: userDetails?.userId,
      enterprise_id: enterpriseData?.enterprise_id,
      auth_key: authKey,
      team_id: teamData?.team_id,
      page_url: window.location.href,
      source: 'console',
      ...deviceSpecific(),
      ...custom,
    };

    // ReactGA4.event(event, eventPayload)
    trackEvent(event, eventPayload);
  } catch (error) {
    console.error('event capture error', error.message);
  }
};

export const MULTI_POPUP_TYPE = {
  PROJECTSUBMITDESKTOP: 'projectsubmitdesktop',
  PROJECTSUBMITMOBILE: 'projectsubmitmobile',
  INVALIDVIDEO: 'invalidvideo',
  INCOMPLETEVIDEO: 'incompletevideo',
  FAILEDTOUPLOADVIDEO: 'faileduploadvideo',
  FEATUREBLOCKED: 'featureblocked',
  INTERIORIMAGES: 'interiorimages',
  HOTSPOTIMAGES: 'hotspotimages',
  VALIDATEVIDEO: 'validatevideo',
  VDPIMAGES: 'vdpimages',
  VDPINTIMAGES: 'vdpintimages',
  DEMO360IMAGES: 'demo360images',
  VIDEOLENGTH: 'videolength',
};

export const redirectToAdminTools = (router) => {
  if (localStorage.getItem('bgId')) {
    let bgId = localStorage.getItem('bgId');
    localStorage.removeItem('bgId');
    router.push(`/settings?activeSubTab=studio&bgId=${bgId}`);
    return;
  }
  router.push(
    window.location.hostname === 'admin.spyne.xyz' ||
      window.location.hostname === 'admin.spyne.ai' ||
      window.location.hostname === 'admin-uat.spyne.xyz'
      ? //  || window.location.hostname === 'localhost'
        '/admintools?selectedTab=home'
      : '/home'
  );
};
