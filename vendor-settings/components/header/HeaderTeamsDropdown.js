import {
  updateEnterpriseTeamProperty,
  updateMobileDrawerProp,
  useDispatch,
  useSelector,
} from '@spyne-console/store';
import { fetchInventoryStatus } from '@spyne-console/store';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import Skeleton from '@spyne-console/design-system/skeleton';

import { useQueryParams, useRouting } from '@spyne-console/hooks';

import BottomModal from '../mobile-views/BottomModal';
import {
  checkCategoryAndRedirect,
  localStorageKeys,
  sessionStorageKeys,
} from '../utils/config';
import { upsertQueryParams } from './utils';

function Dropdown(props) {
  const [options, setOptions] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const enterpriseTeamReducer = useSelector(
    (state) => state.enterpriseTeamReducer
  );
  const imageList = useSelector(
    (state) => state.virttualStudioReducer.imagesList
  );
  const auth = useSelector((state) => state.authReducer);
  const router = useRouting();
  const { queryParams: searchParams, setQueryParam } = useQueryParams();
  const ALL = 'ALL';
  const DEFAULT = 'DEFAULT';

  // Disable dropdown if URL contains dealerVinId route (dynamic route with [dealerVinId])
  const isInventoryVdpRoute = (() => {
    const pathname = window.location.pathname;
    // Check if we're on a dealerVinId route by looking for the pattern: /listings/[dealerVinId]
    // This matches routes like: /inventory/v2/(web)/listings/[dealerVinId] or /inventory/v3/(web)/listings/[dealerVinId]
    const dealerVinIdRoutePattern = /\/listings\/[^\/]+$/;
    return dealerVinIdRoutePattern.test(pathname);
  })();

  const [openDropdownList, setOpenDropdownList] = useState(false);
  const teamHeaderDropdownRef = useRef();
  const mobileDrawer = useSelector((state) => state.mobileDrawer);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      renderOptions();
    } catch (error) {
      // console.log(error)
    }
  }, [auth?.loggedIn]);

  /**
   * outside click hook start
   */
  let dropdownRef = useRef();

  useEffect(() => {
    let outsideFocusHandler = (event) => {
      if (!dropdownRef?.current?.contains(event?.target)) {
        setOpenDropdownList(false);
      }
    };

    document.addEventListener('mousedown', outsideFocusHandler);
    return () => {
      document.removeEventListener('mousedown', outsideFocusHandler);
    };
  }, []);
  /**
   * outside click hook end
   */

  useEffect(() => {
    let tempselectedTeam = enterpriseTeamReducer?.selectedTeam?.team_id
      ? enterpriseTeamReducer?.selectedTeam
      : props?.data[0];
    setSelectedTeam(tempselectedTeam);
  }, [enterpriseTeamReducer?.selectedTeam?.team_name]);

  const renderOptions = async () => {
    try {
      if (
        window.location.pathname.includes('inventory/') ||
        window.location.pathname.includes('converse-ai/')
      ) {
      } else {
        await upsertQueryParams({
          variable: 'team_id',
          value: null,
          deleteVariable: true,
          router: router,
        });
      }

      let tempselectedTeam = enterpriseTeamReducer?.selectedTeam?.team_id
        ? enterpriseTeamReducer?.selectedTeam
        : props?.data[0];
      dispatch(
        updateEnterpriseTeamProperty([
          { key: 'selectedTeam', value: tempselectedTeam },
        ])
      );

      setSelectedTeam(tempselectedTeam);
      let onlyTeamData = { ...tempselectedTeam };
      let getSpyneAssured = sessionStorage?.getItem(
        sessionStorageKeys.selectedEnterprise
      );
      let getSpyneAssuredFromLocalStorage = localStorage.getItem(
        localStorageKeys.defaultEnterprise
      );

      let isSpyneAssured;
      if (getSpyneAssured) {
        getSpyneAssured = JSON?.parse(getSpyneAssured);
        isSpyneAssured = getSpyneAssured?.spyne_assured;
      } else if (getSpyneAssuredFromLocalStorage) {
        getSpyneAssuredFromLocalStorage = JSON.parse(
          getSpyneAssuredFromLocalStorage
        );
        isSpyneAssured = getSpyneAssuredFromLocalStorage?.spyneAssured;
      }
      delete onlyTeamData.enterprise_id;
      sessionStorage.setItem(
        sessionStorageKeys.selectedTeam,
        JSON.stringify(onlyTeamData)
      );
      sessionStorage.setItem(
        sessionStorageKeys.selectedEnterprise,
        JSON.stringify({
          ...enterpriseTeamReducer?.enterprise,
          spyne_assured: isSpyneAssured,
        })
      ); // do this so that we stay in sync with either page refreshes or URL pasting on new tab
      //  await upsertQueryParams({variable:'team_id', value:enterpriseTeamReducer?.selectedTeam?.team_id, isAList:true,router:router});
      let queryParams = new URLSearchParams(window.location.search);
      let isTeamEntryNeeded =
        queryParams.get('team_id') && queryParams.get('team_id').length;
      let isEnterpriseEntryNeeded = queryParams.get('enterprise_id');
      if (!isTeamEntryNeeded || !isEnterpriseEntryNeeded) {
        if (
          window.location.pathname.includes('inventory/') ||
          window.location.pathname.includes('converse-ai/')
        ) {
          setQueryParam('team_id', tempselectedTeam?.team_id);
          setQueryParam('enterprise_id', tempselectedTeam?.enterprise_id);
        } else {
          await upsertQueryParams({
            variable: 'team_id',
            value: null,
            deleteVariable: true,
            router: router,
          });
          await upsertQueryParams({
            variable: 'team_id',
            value: tempselectedTeam?.team_id,
            isAList: true,
            router: router,
          });
          await upsertQueryParams({
            variable: 'enterprise_id',
            value: null,
            deleteVariable: true,
            router: router,
          });
          await upsertQueryParams({
            variable: 'enterprise_id',
            value: tempselectedTeam?.enterprise_id,
            isAList: false,
            router: router,
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleTeamSelection = async (e, teamOption) => {
    if (e) e.stopPropagation();

    if (isInventoryVdpRoute) {
      // redirect to new team inventory vdp page
      const teamId = teamOption?.team_id;
      const enterpriseId = enterpriseTeamReducer?.enterprise?.enterprise_id;
      window.open(
        `/inventory/v2/listings?enterprise_id=${enterpriseId}&team_id=${teamId}`,
        '_blank'
      );
      setOpenDropdownList(false);
      return;
    }

    try {
      setIsLoading(true);

      if (selectedTeam === teamOption) return;
      setSelectedTeam(teamOption);
      let teamId = teamOption?.team_id;
      const enterpriseID = enterpriseTeamReducer?.enterprise?.enterprise_id;

      if (
        window.location.pathname.includes('inventory/') ||
        window.location.pathname.includes('converse-ai/')
      ) {
        setQueryParam('team_id', teamId);
      } else {
        await upsertQueryParams({
          variable: 'team_id',
          value: null,
          deleteVariable: true,
          router: router,
        });
        await upsertQueryParams({
          variable: 'team_id',
          value: teamId,
          isAList: true,
          router: router,
        });
      }

      dispatch(
        updateEnterpriseTeamProperty([
          { key: 'selectedTeam', value: teamOption },
        ])
      );
      if (teamId) {
        dispatch(fetchInventoryStatus(enterpriseID, teamId));
      }

      // setting selected team in session so that we can get the same on page refreshes before api call
      let onlyTeamData = { ...teamOption };
      delete onlyTeamData.enterprise_id;
      sessionStorage.setItem(
        sessionStorageKeys.selectedTeam,
        JSON.stringify(onlyTeamData)
      );

      let path = window?.location?.pathname;
      const enterpriseId = enterpriseTeamReducer?.enterprise?.enterprise_id;
      const existed = router.query;
      const queryParams = {
        ...existed,
        team_id: teamId,
        enterprise_id: enterpriseId,
      };

      // Define a mapping of paths to their respective router methods and destinations
      const pathActions = {
        '/project': () =>
          router.reload({ pathname: '/project', query: queryParams }),
        '/folder': () =>
          router.reload({ pathname: '/project', query: queryParams }),
        '/sku': () =>
          router.reload({ pathname: '/project', query: queryParams }),
        '/virtualstudio': () =>
          router.reload({ pathname: '/virtualstudio', query: queryParams }),
        '/integrations': () =>
          router.reload({ pathname: '/integrations', query: queryParams }),
        '/inventory': () =>
          router.reload({ pathname: '/inventory', query: queryParams }),
        '/developer-hub': () =>
          router.reload({ pathname: '/developer-hub', query: queryParams }),
        '/website-builder': () =>
          router.reload({ pathname: '/website-builder', query: queryParams }),
        '/report': () =>
          router.reload({ pathname: '/report', query: queryParams }),
        '/terms-and-conditions': () =>
          router.reload({
            pathname: '/terms-and-conditions',
            query: queryParams,
          }),
        '/organization': () =>
          router.reload({ pathname: '/organization', query: queryParams }),
        '/settings': () =>
          router.reload({ pathname: '/settings', query: queryParams }),
        '/crm': () => router.reload({ pathname: '/crm', query: queryParams }),
        '/converse-ai': () =>
          router.reload({ pathname: '/converse-ai', query: queryParams }),
      };

      // Find the first matching path and execute the associated action
      const matchedPath = Object.keys(pathActions).find((key) =>
        path.includes(key)
      );
      if (matchedPath) {
        pathActions[matchedPath]();
      } else {
        router.push({ pathname: '/home', query: queryParams });
      }
      if (props.setReRenderSidebar)
        props.setReRenderSidebar(!props.reRenderSidebar);
    } catch (err) {
      console.log(err);
    }
    setOpenDropdownList(false);
    setIsLoading(false);

    dispatch(
      updateMobileDrawerProp([{ key: 'teamHeaderDrawer', value: false }])
    );
  };

  const handleQueryParams = async (teamOptionData) => {
    try {
      if (
        window.location.pathname.includes('inventory/') ||
        window.location.pathname.includes('converse-ai/')
      ) {
        setQueryParam('team_id', teamOptionData?.team_id);
      } else {
        await upsertQueryParams({
          variable: 'team_id',
          value: null,
          deleteVariable: true,
          router: router,
        });
        await upsertQueryParams({
          variable: 'team_id',
          value: teamOptionData?.team_id,
          isAList: true,
          router: router,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const redirectToProjects = () => {
    try {
      if (window.location.pathname.includes('/project')) {
        return;
      }
      router.push({
        pathname: '/project',
        query: {
          enterprise_id: enterpriseTeamReducer?.enterprise?.enterprise_id,
        },
      });
    } catch (error) {
      // console.log(error)
    }
  };
  const redirectToHome = () => {
    try {
      if (window.location.pathname.includes('/home')) {
        return;
      }
      checkCategoryAndRedirect(
        router,
        enterpriseTeamReducer?.enterprise?.category_id,
        enterpriseTeamReducer?.enterprise?.enterprise_id,
        null,
        true
      );
      // router.push({pathname: "/home", query: {"enterprise_id": enterpriseTeamReducer?.enterprise?.enterprise_id}})
    } catch (error) {
      // console.log(error)
    }
  };
  const handleBottomDrawer = () => {
    try {
      dispatch(
        updateMobileDrawerProp([{ key: 'teamHeaderDrawer', value: true }])
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    //hook for outside focus handler
    if (!router.asPath.includes('/video')) {
      let outsideFocusHandler = (event) => {
        if (!teamHeaderDropdownRef?.current?.contains(event?.target)) {
          dispatch(
            updateMobileDrawerProp([{ key: 'teamHeaderDrawer', value: false }])
          );
        }
      };
      document.addEventListener('mousedown', outsideFocusHandler);

      return () => {
        document.removeEventListener('mousedown', outsideFocusHandler);
      };
    }
  }, [teamHeaderDropdownRef.current]);
  return (
    <>
      {/* For web view  */}
      <div className="relative hidden md:block" ref={dropdownRef}>
        <div
          className={[
            imageList && !imageList.length
              ? `header-dropdown cursor-pointer`
              : 'header-dropdown-vs',
            'flex w-fit items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-lg px-3 py-1 transition-all duration-700 ease-in-out',
          ].join(' ')}
          id="teamsDropdown"
          aria-expanded="true"
          aria-haspopup="true"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          // onClick={() => setOpenDropdownList(!openDropdownList)}
          onClick={() => {
            if (imageList && imageList.length) return;
            if (props.hideWebsiteDropdown) return;
            setOpenDropdownList(!openDropdownList);
          }}
        >
          <div className="flex flex-col">
            <p
              className={[
                openDropdownList && imageList && !imageList.length
                  ? 'text-blue_purple-80'
                  : 'text-black-80',
                'max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold',
              ].join(' ')}
            >
              {enterpriseTeamReducer?.enterprise?.enterprise_name}
            </p>
            <h4
              className={[
                openDropdownList && imageList && !imageList.length
                  ? 'text-blue_purple-80 pb-0.25'
                  : 'text-black-60 pb-0.5',
                'max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal leading-[14px]',
              ].join(' ')}
            >
              {selectedTeam?.team_name}
            </h4>
          </div>
          {imageList && !imageList.length && !props.hideWebsiteDropdown ? (
            <Image
              className="dropdown-caret w-0 opacity-0"
              src="https://spyne-static.s3.amazonaws.com/console/console_header/caret-down-with-bg-purple.svg"
              height={20}
              width={20}
              alt="down caret icon"
            />
          ) : null}
        </div>

        {/* Hover Tooltip */}
        {isHovered && !openDropdownList && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-fit max-w-full transform rounded-lg bg-black p-3 text-white shadow-lg">
            {/* Triangle pointing up */}
            <div className="absolute -top-1 right-[10px] h-0 w-0 border-b-[12px] border-l-[12px] border-r-[12px] border-b-black border-l-transparent border-r-transparent"></div>
            <div className="relative">
              {/* Tooltip content */}
              <div className="flex w-full flex-col gap-[6px] text-sm">
                <div className="mb-1 flex items-start gap-2">
                  <span className="text-white-80 w-[105px] text-nowrap text-xs">
                    Dealership Group:
                  </span>{' '}
                  <span className="w-max max-w-[142px] whitespace-normal break-words text-xs">
                    {enterpriseTeamReducer?.enterprise?.enterprise_name}
                  </span>
                </div>
                <div className="mb-1 flex items-start gap-2">
                  <span className="text-white-80 w-[105px] text-nowrap text-xs">
                    Rooftop:
                  </span>{' '}
                  <span className="w-max max-w-[142px] whitespace-normal break-words text-xs">
                    {selectedTeam?.team_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {openDropdownList &&
          imageList &&
          !imageList.length &&
          !props.hideWebsiteDropdown && (
            <div
              className={`checkbox-dropdown dropdown-menu absolute right-0 z-50 float-left m-0 mt-1 max-w-[300px!important] origin-left list-none rounded-lg bg-white bg-clip-padding text-left text-base shadow-lg`}
              aria-labelledby="teamsDropdown"
              role="menu"
              aria-orientation="vertical"
              tabIndex="-1"
            >
              <ul className="list-none text-left text-base shadow-lg">
                {props.data.map((dropdown, index) => {
                  return (
                    <li
                      onClick={(e) => handleTeamSelection(e, dropdown)}
                      key={index}
                      className="dropdown-item block w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-sm font-normal text-gray-700 hover:bg-gray-100"
                    >
                      {/* <SelectBox/> where similar UI in dropdown but image replaced with checkbox */}
                      <Image
                        className="mr-2 inline"
                        src="https://spyne-static.s3.amazonaws.com/console/filter/team_inactive.svg"
                        height={18}
                        width={18}
                        alt="Team inactive"
                      />
                      <span className="text-black-80 ml-2 mr-2 text-base font-medium leading-6">
                        {dropdown?.team_name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
      </div>
      {/* for mobile view  */}
      <div className="inline-flex md:hidden">
        <div
          className={[
            imageList && !imageList.length ? `cursor-pointer` : '',
            'relative flex max-w-[120px] items-center justify-between gap-1 rounded-lg p-1 transition-all duration-700 ease-in-out',
          ].join(' ')}
          id="teamsDropdown"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => {
            if (imageList && imageList.length) return;
            handleBottomDrawer();
          }}
        >
          <div
            className={`max-w-[${imageList && !imageList.length ? 'calc(100%-20px)' : '100%'}]`}
          >
            <p className="text-black-60 w-full overflow-hidden text-ellipsis whitespace-nowrap pb-0.5 text-[10px] font-normal leading-[12px]">
              {isLoading ? (
                <Skeleton classSTYLE={'rounded-lg mb-1'} />
              ) : (
                enterpriseTeamReducer?.enterprise?.enterprise_name
              )}
            </p>
            <h4 className="text-black-80 w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold">
              {isLoading ? (
                <Skeleton classSTYLE={'rounded-lg mb-1'} />
              ) : (
                selectedTeam?.team_name
              )}
            </h4>
          </div>
        </div>
        {mobileDrawer?.teamHeaderDrawer ? (
          <BottomModal>
            <div
              className="dropdown-menu !border-0 !p-0 text-left text-base !shadow-none"
              ref={teamHeaderDropdownRef}
            >
              <ul className="max-h-[350px] list-none overflow-y-scroll text-left text-base shadow-lg">
                {props.data.map((dropdown, index) => {
                  return (
                    <li
                      onClick={(e) => handleTeamSelection(e, dropdown)}
                      key={index}
                      className="dropdown-item block w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-sm font-normal text-gray-700 hover:bg-gray-100"
                    >
                      {/* <SelectBox/> where similar UI in dropdown but image replaced with checkbox */}
                      <Image
                        className="mr-2 inline"
                        src="https://spyne-static.s3.amazonaws.com/console/filter/team_inactive.svg"
                        height={18}
                        width={18}
                        alt="Team inactive"
                      />
                      <span className="text-black-80 ml-2 mr-2 text-base font-medium leading-6">
                        {dropdown?.team_name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </BottomModal>
        ) : null}
      </div>
    </>
  );
}

export default React.memo(Dropdown);
