import {
  setEnterpriseStage,
  setShowNewInventoryUi,
  updateAuthProp,
  updateEnterpriseTeamProperty,
  updateV5Credit,
  useDispatch,
  useSelector,
} from '@spyne-console/store';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiExternalLink } from 'react-icons/fi';
import { MdOutlineModeEdit } from 'react-icons/md';
import { RxCaretRight } from 'react-icons/rx';
import { toast } from 'react-toastify';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';

import { HeaderLogo } from '@spyne-console/design-system/icons';
import Svg from '@spyne-console/design-system/svg';

import UserProfileDropdown from '@spyne-console/components/user-profile-dropdown';

import useClickOutside from '@spyne-console/hooks/useClickOutside';
import useCurrentRoute from '@spyne-console/hooks/useCurrentRoute';
import useQueryParams from '@spyne-console/hooks/useQueryParams';
import useWindowSize from '@spyne-console/hooks/useWindowSize';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';
import { cn } from '@spyne-console/utils/cn';
import {
  generateBearerToken,
  localStorageKeys,
  sessionStorageKeys,
} from '@spyne-console/utils/config';

// Need to import them somehow
// import BottomsheetBanner from '../MainComponent/BottomsheetBanner';
// import EditVin from '../editVin/EditVin';
// import DownloadModal from '../modal/DownloadModal/DownloadModal';
// import {
//   capture_download_clicked,
//   capture_signup_clicked,
//   capture_view_inventory_clicked,
//   capture_view_preview_clicked,
//   getListOfValuesFromQueryParam,
// } from '../utils';
import { profileContentData, profileData, virtualDataWhenUrl } from './config';
import HeaderCredits from './header-credits';

function Header({
  enterpriseData,
  isDownloadModalOpen,
  triggerLogin,
  profileDrawer,
  switchEnterpriseDrawer,
  profileMenuClass,
  setOpenUpgradeModal,
  type = '',
  setIsDownloadModalOpen,
  processedOnce = false,
  skuIdforPreview = '',
}) {
  // Small hooks
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // custom hooks
  const windowSize = useWindowSize();
  const { mainRoute, childRoute } = useCurrentRoute();
  const { queryParams, setQueryParams } = useQueryParams();

  // useRefs
  let profileDropdownRef = useRef();
  const vinRef = useRef(null);

  // useState hooks
  const [isVinModalOpen, setIsVinModalOpen] = useState(false);
  const [enterpriseCategory, setEnterpriseCategory] = useState(null);

  // useSelector hooks
  const enterpriseTeamReducer = useSelector(
    (state) => state.enterpriseTeamReducer
  );
  const authReducer = useSelector((state) => state.authReducer);

  const {
    processingStatus,
    inventoryDetails,
    vinData,
    hasProcessingStarted,
    imagesList,
  } = useSelector((state) => state.imageStudioReducer);

  // Other variables and computations
  const vinPresent =
    inventoryDetails?.vinId ||
    inventoryDetails?.stockNumber ||
    inventoryDetails?.registrationNumber;

  let enterpriseId =
    queryParams.enterprise_id ||
    enterpriseData?.enterprise_id ||
    enterpriseTeamReducer?.enterprise?.enterprise_id ||
    authReducer?.defaultEnterprise?.enterpriseId;
  const vsversion = JSON.parse(
    localStorage.getItem(localStorageKeys.vsVersion)
  )?.[enterpriseId];
  let teamIdFromURL = queryParams.team_id;
  const team_id = queryParams.team_id
    ? queryParams.team_id.includes('[')
      ? queryParams.team_id
      : queryParams.team_id
    : enterpriseTeamReducer?.selectedTeam?.team_id || null;

  const getVSVersion = async (enterpriseId) => {
    try {
      let existingVsVersion = localStorage?.getItem(
        localStorageKeys?.vsVersion
      );
      let vsVersionObj = existingVsVersion ? JSON.parse(existingVsVersion) : {};

      const url = `${process.env.APP_BACKEND_BASEURL}/media-configs/v1/enterprise/version`;
      const response = await CentralAPIHandler.handleGetRequest(url, {
        enterpriseId: enterpriseId,
        // attributes: "version"
      });
      if (!response?.version || !response?.inventoryVersion) {
        throw new Error('Version information not found in response');
      }

      vsVersionObj[enterpriseId] = response?.version;
      localStorage?.setItem(
        localStorageKeys?.vsVersion,
        JSON.stringify(vsVersionObj)
      );

      // Store inventory version in localStorage (simple key)
      const inventoryVersion = String(response.inventoryVersion || '');
      localStorage?.setItem('inventory_version', inventoryVersion);
      dispatch(setShowNewInventoryUi(inventory_version === 'v4'));

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

  useEffect(() => {
    if (!vsversion && enterpriseId) {
      getVSVersion(enterpriseId);
    }
  }, [vsversion, enterpriseId]);

  useEffect(() => {
    fetchTeamsData();
  }, [authReducer?.defaultEnterprise?.enterpriseId]);

  useEffect(() => {
    if (windowSize !== 'DESKTOP') {
      fetchTeamsData();
    }
  }, [enterpriseTeamReducer?.enterprise]);

  useEffect(() => {
    if (authReducer?.loggedIn) {
      fetchCredits();
    }
  }, [authReducer?.loggedIn]);

  // useClickOutside implementations
  useClickOutside(vinRef, () => setIsVinModalOpen(false));

  const fetchTeamsData = async () => {
    try {
      //if enterprise is Selected then only fetch
      // if(!enterpriseData?.enterprise_id)return;
      let teams = enterpriseTeamReducer?.teams;
      if (Object.keys(teams).length > 0) {
        // setTeamsData(teams)
      } else {
        if (!enterpriseId) return;
        let currentlySelectedTeam = sessionStorage.getItem(
          sessionStorageKeys.selectedTeam
        );
        if (currentlySelectedTeam) {
          currentlySelectedTeam = JSON.parse(currentlySelectedTeam);
        } else {
          if (teamIdFromURL) {
            teamIdFromURL = teamIdFromURL.replace(/(\[|\])/gim, '');
          }
          currentlySelectedTeam = {
            team_id: teamIdFromURL,
          };
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
        let teamConfigAvailable = !!response.data?.teamConfigAvailable;
        teamDetails.forEach((element) => {
          data[element.team_id] = element;
          if (element.is_default === true) {
            defaultObj = { ...element };
          }
          if (currentlySelectedTeam?.team_id === element.team_id) {
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

  const fetchCredits = async () => {
    try {
      // Fetch v5 credits
      const response = await CentralAPIHandler.handleGetRequest(
        `${process.env.APP_BACKEND_BASEURL}/credit/v5/credits`,
        { enterprise_id: enterpriseId, team_id }
      );
      if (response?.data) {
        dispatch(updateV5Credit(response?.data));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // setTeamsData(enterpriseTeamReducer?.teams)
    generateBearerToken(
      { additionalPayload: {} },
      true,
      enterpriseTeamReducer?.selectedTeam?.team_id,
      enterpriseTeamReducer?.selectedTeam?.enterprise_id
    ); //true since, bearerToken already exists without team_id
  }, [enterpriseTeamReducer?.selectedTeam]);

  const isVinDetailsPresent = () => {
    const FIELDS = [
      { name: 'year', required: true },
      { name: 'make', required: true },
      { name: 'model', required: true },
      { name: 'trim', required: true },
      { name: 'mileage', required: false },
      { name: 'msrp', required: false },
      { name: 'fuel', required: false },
      { name: 'engine', required: true },
      { name: 'transmissionShort', required: true },
      { name: 'description', required: false },
    ];

    const missingFields = Object.entries(vinData?.vehicleSnap || {})
      .filter(([key]) => FIELDS.some((f) => f.name === key && f.required))
      .filter(([key, field]) => !field?.value || field?.value === '');

    return missingFields.length === 0;
  };

  const renderHomeIcon = () => {
    return (
      <Link
        href={{
          pathname: '/home',
          query: { enterprise_id: enterpriseId, team_id },
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100"
      >
        <Image
          src={virtualDataWhenUrl?.homeIcon}
          width={16}
          height={16}
          alt="Home icon"
        />
      </Link>
    );
  };

  const renderLogo = () => {
    return (
      <div className={`md:block ${queryParams.vinScreen ? 'block' : ''} mr-2`}>
        <div className="flex items-center justify-center gap-2">
          <HeaderLogo className="h-10 w-10" color="#402387" />
          <div className="flex flex-col items-start justify-center">
            <p className="text-lg font-bold text-[#402387]">Studio AI</p>
            <p className="text-black-40 text-xs font-normal">Virtual Studio</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDivider = () => {
    return (
      <div className="pointer-events-none hidden font-normal text-gray-400 md:flex">
        |
      </div>
    );
  };

  const renderLeftOptions = () => {
    return (
      <div className={cn('flex flex-row items-center justify-center gap-2')}>
        {/* vin dropdown */}
        {type === 'home' && vinPresent && (
          <div
            className="relative"
            ref={vinRef}
            onClick={() => setIsVinModalOpen(!isVinModalOpen)}
          >
            <div className="flex cursor-pointer items-center gap-3 px-3 py-[6px]">
              <span className="text-black-80 text-base font-semibold">
                {(() => {
                  if (inventoryDetails?.vinId) return inventoryDetails?.vinId;
                  if (inventoryDetails?.stockNumber)
                    return inventoryDetails?.stockNumber;
                  if (inventoryDetails?.registrationNumber)
                    return inventoryDetails?.registrationNumber;
                  return '';
                })()}
              </span>
              <MdOutlineModeEdit className="text-black-60 text-base" />
            </div>

            {isVinModalOpen &&
              (['TABLET', 'MINI', 'MOBILE'].includes(windowSize) ? null : null)}
          </div>
        )}

        {/* Vin Form Data */}
        {((vinData?.vehicleSnap && type == 'demo') ||
          (imagesList?.length > 0 && type == 'home')) && (
          <div
            className={cn(
              'border-black-10 ml-4 flex cursor-pointer items-center gap-2 rounded-full border bg-[#F8F9FA] px-3 py-[6px] transition-shadow hover:shadow',
              !isVinDetailsPresent() && 'bg-[#EEA528]/10'
            )}
            onClick={() => {
              setQueryParams({ EditVin: queryParams.EditVin ? '' : 'true' });
            }}
          >
            <span
              className={cn(
                'text-black-80 text-[10px] font-medium',
                !isVinDetailsPresent() && 'text-[#EEA528]'
              )}
            >
              {isVinDetailsPresent()
                ? `${vinData.vehicleSnap?.make?.value || ''} ${vinData.vehicleSnap?.model?.value || ''} ${vinData.vehicleSnap?.year?.value || ''}`
                    ?.trim()
                    ?.toUpperCase()
                : 'Add Vehicle Details'}
            </span>
            <RxCaretRight
              className={cn(
                'text-black-80 text-base font-bold transition-transform duration-300',
                queryParams.EditVin ? 'rotate-90' : '',
                !isVinDetailsPresent() && 'text-[#EEA528]'
              )}
            />
          </div>
        )}
        {/* inventory redirection */}
        {!queryParams.vinScreen &&
          !pathname.includes('demo') &&
          hasProcessingStarted &&
          !['MINI', 'MOBILE', 'TABLET'].includes(windowSize) && (
            <div
              className="border-black-10 flex cursor-pointer items-center gap-2 rounded-full border bg-[#F8F9FA] px-3 py-[6px] transition-shadow hover:shadow"
              onClick={() => {
                window.open(
                  `/inventory/v2/listings/${inventoryDetails?.dealerVinId}?team_id=${enterpriseTeamReducer?.selectedTeam?.team_id}&enterprise_id=${enterpriseTeamReducer?.selectedTeam?.enterprise_id}`,
                  '_blank'
                );
              }}
            >
              <span className="text-black-80 text-[10px] font-medium">
                Inventory
              </span>
              <FiExternalLink className="text-black-80 text-sm" />
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="flex h-14 w-full flex-row items-center justify-between border bg-white px-6 py-2">
      <div className="flex flex-row items-center gap-6 self-stretch rounded-lg">
        {renderHomeIcon()}

        {renderLogo()}

        {renderDivider()}

        {!queryParams.vinScreen && renderLeftOptions()}
      </div>

      <div className="flex flex-row items-center justify-center gap-6">
        <div className="flex flex-row items-center gap-4">
          {authReducer?.loggedIn && (
            <HeaderCredits setOpenUpgradeModal={setOpenUpgradeModal} />
          )}
          <div className="flex flex-row items-center gap-4">
            {/* preview button */}
            {((processingStatus &&
              Object.values(processingStatus).some(
                (status) => status === 'DONE'
              )) ||
              processedOnce) &&
              !['MINI', 'MOBILE', 'TABLET'].includes(windowSize) && (
                <div
                  className="bg-blue-light border-gray-40 flex h-[38px] cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold text-black transition-shadow hover:shadow-lg"
                  onClick={() => {
                    if (processedOnce)
                      window.open(
                        `https://assets.spyne.ai/360?sku_id=${skuIdforPreview}&version=v2&demo=true`,
                        '_blank'
                      );
                    else
                      window.open(
                        `https://assets.spyne.ai/360?version=v3&mediaId=${inventoryDetails?.mediaId}&spin=1&catalog=3&feature_video=2`,
                        '_blank'
                      );
                  }}
                >
                  <Svg iconName="eyeWhite" className={'fill-white'} />
                  <span className="text-[10px] font-semibold leading-[12px] text-white lg:text-xs lg:leading-5">
                    Preview
                  </span>
                </div>
              )}

            {/* download button */}
            {!queryParams.vinScreen &&
              !pathname.includes('demo') &&
              processingStatus &&
              Object.values(processingStatus).some(
                (status) => status === 'DONE'
              ) && (
                <div
                  className="border-gray-40 flex h-[38px] cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-black transition-shadow hover:shadow-lg"
                  onClick={() => {
                    setIsDownloadModalOpen((prev) => !prev);
                  }}
                >
                  <Svg iconName="DownloadVirtual" className={'fill-black'} />
                </div>
              )}
          </div>
        </div>

        {renderDivider()}

        {/* profile dropdown */}
        <div
          className={cn(
            `${windowSize === 'DESKTOP' ? '' : 'items-center gap-1'} ml-0 mr-0 md:ml-2 md:mr-3`,
            'flex'
          )}
          ref={profileDropdownRef}
        >
          {!authReducer?.loggedIn ? (
            <div className="flex gap-[10px]">
              <button
                className="bg-blue_purple-12 text-blue-light flex items-start rounded-lg px-4 py-2 text-sm font-semibold"
                onClick={() => {
                  if (triggerLogin) {
                    triggerLogin(true, true, true);
                  } else {
                    dispatch(
                      updateAuthProp([
                        { key: 'loginModalTrigger', value: true },
                      ])
                    );
                  }
                }}
              >
                Log In/Sign up
              </button>
            </div>
          ) : (
            <UserProfileDropdown
              data={profileContentData}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
