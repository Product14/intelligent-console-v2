/**@format */
import {
  CREATE_ENTERPRISE_DATA,
  SELECT_DROPDOWN_REVENUE,
  categories,
} from '@spyne-console/common-config/login';
import { useSelector } from '@spyne-console/store';

import React, { useContext, useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { useCurrentRoute } from '@spyne-console/hooks';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';
import {
  LOGIN_TYPES,
  captureEvent,
  defaultEnterprise,
} from '@spyne-console/utils/config';

import SearchBar from '../../common/searchBar/searchBar';
import Spinner from '../../common/skeleton&spinner/Spinner';
import { getDemoFlowType } from '../config';
import SignInSignUpContext from '../context';
import { ENTERPRISE_DATA } from './config';

function CreateEnterprise(props) {
  const {
    formClassName,
    createEntBtnClassName,
    validateInput,
    setFormErrors,
    formatInput,
    SignInSpinner,
    errorMsg,
    genericLoginPage,
    activeCategoryType,
    handleActiveCategoryTab,
    handleCreateEnterprise,
    enterpriseDetails,
    handlePhoneInput,
    closeLogin,
    formErrors,
    createEnterprise,
    handleChangeLoginState,
    googleStrategy,
    selectedRevenue,
    setSelectedRevenue,
  } = useContext(SignInSignUpContext);
  const {
    backCaret,
    xs_BackIcon,
    allowClose,
    source = 'browser',
    setEnterpriseDetails = () => {},
    translate,
  } = props;

  const auth = useSelector((state) => state.authReducer);
  const { mainRoute, childRoute } = useCurrentRoute();
  const [disabledCategory, setDisabledCategory] = useState([]);
  const [disabledCategorySelection, setDisabledCategorySelection] = useState();
  const [entNameFocused, setEntNameFocused] = useState(false);
  // const [phoneFocused, setPhoneFocused] = useState(false)
  const [orgType, setOrgType] = useState('');
  const router = useRouter();
  const queryParam = Object.keys(router.query)[0];
  const [searchText, setSearchText] = useState('');
  const [enterpriseList, setEnterpriseList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchOptions, setShowSearchOptions] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState(false);
  const [ErrorMsgwebsite, setErrorMsgwebsite] = useState('');
  const [isDealershipGroupOptional, setIsDealershipGroupOptional] =
    useState(false);
  const organizationType = {
    DEALERSHIP: {
      value: translate('console.screens.organizationType.dealership'),
      text: translate('console.screens.organizationType.dealershipText'),
      img: `https://spyne-static.s3.amazonaws.com/console/icons/create_enterprise_org_type/dealershipSingupimg.svg`,
      imgAlt: 'Dealership icon',
    },
    DEALERSHIP_GROUP: {
      value: translate('console.screens.organizationType.dealershipGroup'),
      text: translate('console.screens.organizationType.dealershipGroupText'),
      img: `https://spyne-static.s3.amazonaws.com/console/icons/create_enterprise_org_type/dealershipgroupSingupimg.svg`,
      imgAlt: 'Dealership Group icon',
    },
    RESELLER: {
      value: translate('console.screens.organizationType.reseller'),
      text: translate('console.screens.organizationType.resellerText'),
      img: `https://spyne-static.s3.amazonaws.com/console/icons/create_enterprise_org_type/resellerSingupimg.svg`,
      imgAlt: 'Reseller icon',
    },
    PERSONAL_USE: {
      value: translate('console.screens.organizationType.personalUse'),
      text: translate('console.screens.organizationType.personalUseText'),
      img: `https://spyne-static.s3.amazonaws.com/console/icons/create_enterprise_org_type/dealershipSingupimg.svg`,
      imgAlt: 'Personal Use icon',
    },
  };
  const isValidUrl = (url) => {
    try {
      const urlWithoutProtocol = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      const parts = urlWithoutProtocol.split('.');
      if (parts.length < 2 || parts[parts.length - 1].length < 2) {
        return false;
      }
      new URL(`https://${urlWithoutProtocol}`);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCheckboxChange = () => {
    setIsDealershipGroupOptional(!isDealershipGroupOptional);
    if (!isDealershipGroupOptional) {
      setEnterpriseDetails({ ...enterpriseDetails, dealership_group_name: '' });
    }
  };

  const handleCreateEnterpriseClick = (e) => {
    e.preventDefault();
    let errors = {};

    if (
      !isDealershipGroupOptional &&
      !enterpriseDetails.dealership_group_name &&
      enterpriseDetails.org_type === 'DEALERSHIP'
    ) {
      errors.dealership_group_name = 'Please fill this field';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (
      enterpriseDetails.website_url &&
      !isValidUrl(enterpriseDetails.website_url)
    ) {
      setErrorMsgwebsite('Please enter a valid URL (e.g., example.com)');
      return;
    }
    formatInput({
      target: {
        name: 'owner_name',
        value: enterpriseDetails?.enterprise_name,
      },
    });
    captureEvent(
      'enterprise_details_submitted',
      {
        source: getDemoFlowType(mainRoute, childRoute, queryParam),
        login_flow:
          (childRoute ?? mainRoute === 'login')
            ? 'console'
            : allowClose
              ? 'non_restrictive'
              : 'restrictive',
        method: googleStrategy ? 'google' : 'email',
      },
      false
    );
    if (
      auth?.previousState['create-enterprise'] === LOGIN_TYPES?.EMAIL &&
      !googleStrategy
    ) {
      createEnterprise(e);
    } else {
      handleCreateEnterprise(e);
    }
  };
  const [noOfCars, setNoOfCars] = useState('100');
  const handleFocus = (inputField) => {
    if (inputField === 'ent_name') setEntNameFocused(true);
    // if (inputField === "phone")
    //     setPhoneFocused(true);
  };
  const handleBlur = (inputField) => {
    if (inputField === 'ent_name') setEntNameFocused(false);
    // if (inputField === "phone")
    //     setPhoneFocused(false);
  };
  // const handleCarsChange = (e) => {
  //     setNoOfCars(e.target.value);
  //     formatInput({
  //         target: {
  //             name: "no_of_cars",
  //             value: e.target.value,
  //         }
  //     });
  // }
  const selection = (e) => {
    try {
      setSelectedRevenue(e.target.value);
    } catch (err) {
      console.log(err);
    }
  };

  // const handlePhoneNumberInput = (value,data) => {
  //     handlePhoneInput(value,data)
  //     captureEvent("create_enterprise", {
  //         "parent_screen_name": mainRoute,
  //             "child_screen_name": childRoute ?? mainRoute,
  //         "phone_number_entered": value,
  //     },true)
  // }
  const handleOrgClick = (org) => {
    setOrgType(org);
    formatInput({
      target: {
        name: 'org_type',
        value: org,
      },
    });
  };
  const showDropdown = (e, enterpriseName) => {
    if (e.target.value.length > 3) {
      let keyword = e.target.value;
      let dropdownEl = document.querySelector('#dropdown');
      dropdownEl.classList.remove('hidden');
      let filteredOptions = enterprises.filter((c) =>
        c.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredEnterprises(filteredOptions);
    } else {
      let dropdownEl = document.querySelector('#dropdown');
      dropdownEl.classList.add('hidden');
    }
  };
  const handleSelectedOption = (selectedOption) => {
    setFilteredEnterprises([]); // Close the dropdown after selection
    formatInput({
      target: {
        name: 'enterprise_name',
        value: selectedOption,
      },
    });
    // Update the input field with the selected option

    let dropdownEl = document.querySelector('#dropdown');
    dropdownEl.classList.add('hidden'); // Hide the dropdown
  };

  const getEnterpriseList = async (newSearchText, newPageNo) => {
    try {
      setIsLoading(true);
      const URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/onboarding/get-generic-dealer-list`;
      const resp = await CentralAPIHandler.handlePostRequest(URL, {
        searchVal: newSearchText,
      });
      const nextArray = resp.dealers.map((enterpriseObj, key) => {
        return {
          key: key,
          text: enterpriseObj.label,
          value: enterpriseObj.value,
          class: '',
          icon: '',
        };
      });
      setEnterpriseList(nextArray);
    } catch (error) {
      setIsLoading(true);
      setHasMore(false);
      setEnterpriseList([]);
      //   toast(
      //     error?.response?.data?.message ||
      //       error?.message ||
      //       "Unknown error occurred",
      //     {
      //       hideProgressBar: true,
      //       autoClose: 2000,
      //       type: "error",
      //       position: "bottom-center",
      //       pauseOnHover: true,
      //     }
      //   );
    } finally {
      setIsLoading(false);
      setShowSearchOptions(true);
    }
  };
  const handleSearch = (text) => {
    setSearchText(text);
    setEnterpriseList([]);
    if (text !== '') {
      getEnterpriseList(text);
      setEnterpriseDetails({
        ...enterpriseDetails,
        ['enterprise_name']: text,
      });
    } else {
      setShowSearchOptions(false);
    }
  };
  useEffect(() => {
    let tempArr = [];
    captureEvent(
      'enterprise_details_screen',
      {
        source: getDemoFlowType(mainRoute, childRoute, queryParam),
        method: googleStrategy ? 'google' : 'email',
        login_flow:
          (childRoute ?? mainRoute === 'login')
            ? 'console'
            : allowClose
              ? 'non_restrictive'
              : 'restrictive',
      },
      false
    );
    if (window?.location?.pathname?.includes('/virtualstudio')) {
      tempArr.push(
        defaultEnterprise?.prodCatEcom,
        defaultEnterprise?.prodCatFood
      );
      setDisabledCategorySelection(true);
    } else if (window?.location?.pathname?.includes('/playground')) {
      tempArr.push(defaultEnterprise?.prodCatAuto);
    }
    setDisabledCategory(tempArr);
  }, []);

  return (
    <>
      {xs_BackIcon && (
        <Image
          className="tb:hidden absolute left-7 top-10 block h-4 w-auto cursor-pointer"
          src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
          height={18}
          width={18}
          onClick={handleChangeLoginState}
        />
      )}

      <form className={formClassName || 'w-full overflow-hidden'}>
        <div className="w-full">
          <h1 className="text-blue_purple mb-4 flex items-center justify-between gap-1 text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Image
                className="h-4 w-auto cursor-pointer"
                src="https://spyne-static.s3.amazonaws.com/console/icons/leftGrayCaret.svg"
                height={16}
                width={16}
                onClick={() => {
                  if (selectedEnterprise) {
                    setSelectedEnterprise(false);
                    setEnterpriseDetails({
                      ...enterpriseDetails,
                      ['org_type']: '',
                    });
                  } else {
                    handleChangeLoginState();
                  }
                }}
              />
              {!selectedEnterprise
                ? translate(
                    `console.screens.enterprisesScreen.welcomeScreenTitle`
                  )
                : translate(
                    `console.screens.enterprisesScreen.enterYourDetails`
                  )}
            </div>
            {!selectedEnterprise && (
              <div
                onClick={() => {
                  setSelectedEnterprise(true);
                  handleOrgClick('PERSONAL_USE');
                }}
                className="text-black-60 cursor-pointer text-sm font-normal"
              >
                {translate('console.screens.enterprisesScreen.skip')}
              </div>
            )}
          </h1>
        </div>
        {selectedEnterprise ? (
          <>
            <div
              className={`relative pt-4 ${enterpriseDetails?.org_type === 'PERSONAL_USE' ? 'mb-8' : ''}`}
              onFocus={() => handleFocus('ent_name')}
              onBlur={() => handleBlur('ent_name')}
            >
              <span
                className={`text-black-60 absolute left-1 top-2 z-20 bg-white px-1.5 !text-xs font-normal`}
              >
                {enterpriseDetails?.org_type === 'RESELLER'
                  ? translate(
                      'console.screens.signInSignUpScreen.companyEnterpriseName'
                    )
                  : enterpriseDetails?.org_type === 'DEALERSHIP_GROUP'
                    ? translate(
                        'console.screens.signInSignUpScreen.dealershipGroupName'
                      )
                    : enterpriseDetails?.org_type === 'DEALERSHIP'
                      ? translate(
                          'console.screens.signInSignUpScreen.dealershipName'
                        )
                      : translate(
                          'console.screens.signInSignUpScreen.companyEnterpriseName'
                        )}
              </span>
              <SearchBar
                translate={translate}
                dropdownOptions={enterpriseList}
                value={searchText}
                onChange={handleSearch}
                handleOptionClick={(data) => {
                  let attribute = 'enterprise_name';
                  setEnterpriseDetails({
                    ...enterpriseDetails,
                    [attribute]: data.value,
                  });
                  setSearchText(data.value);
                }}
                className={`relative w-full overflow-scroll rounded-lg border bg-white !py-[18px] placeholder:!text-sm placeholder:!text-black/[0.34] ${formErrors?.enterprise_name ? '!border-red' : ''}`}
                dropdownClassName="min-h-full max-h-36"
                showSearchOptions={showSearchOptions}
                searchIconVisible={false}
                placeholder={
                  enterpriseDetails?.org_type === 'RESELLER'
                    ? translate(
                        'console.screens.signInSignUpScreen.companyEnterpriseName'
                      )
                    : enterpriseDetails?.org_type === 'DEALERSHIP_GROUP'
                      ? translate(
                          'console.screens.signInSignUpScreen.dealershipGroupName'
                        )
                      : enterpriseDetails?.org_type === 'DEALERSHIP'
                        ? translate(
                            'console.screens.signInSignUpScreen.dealershipName'
                          )
                        : translate(
                            'console.screens.signInSignUpScreen.companyEnterpriseName'
                          )
                }
                textAtTop={false}
              />
              {formErrors?.enterprise_name ? (
                <p className="text-red mb-2 mt-1 text-xs">
                  {formErrors?.enterprise_name}
                </p>
              ) : (
                <p
                  className={`mt-2 flex items-center gap-1 rounded-lg bg-[#EFF6FF] px-2 py-1 text-xs font-normal text-blue-800`}
                >
                  <Image
                    src={ENTERPRISE_DATA?.helptexticon}
                    alt="helptexticon"
                    height={12}
                    width={12}
                    className=""
                  />
                  {translate(
                    'console.screens.enterprisesScreen.correctBusinessName'
                  )}
                </p>
              )}
            </div>
            {enterpriseDetails?.org_type === 'DEALERSHIP' && (
              <div className="mt-3 flex flex-col">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dealershipGroupOptional"
                    checked={isDealershipGroupOptional}
                    onChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="dealershipGroupOptional"
                    className="text-black-60 ml-2 text-sm font-normal"
                  >
                    {translate(
                      'console.screens.signInSignUpScreen.dealershipGroupOptional'
                    )}
                  </label>
                </div>
                {!isDealershipGroupOptional && (
                  <div className="newinput-wrapper relative mt-8">
                    <span
                      className={`text-black-60 absolute -top-1.5 left-2 bg-white px-1.5 !text-xs font-normal`}
                    >
                      {translate(
                        'console.screens.signInSignUpScreen.dealershipGroupName'
                      )}
                    </span>
                    <input
                      type="text"
                      name="dealership_group_name"
                      placeholder={translate(
                        'console.screens.signInSignUpScreen.dealershipGroupName'
                      )}
                      className={`!border placeholder:!text-sm placeholder:!text-black/[0.34] ${formErrors.dealership_group_name ? '!border-red' : '!border-black/[0.1]'} w-full`}
                      value={enterpriseDetails?.dealership_group_name}
                      onChange={(e) => {
                        setEnterpriseDetails({
                          ...enterpriseDetails,
                          dealership_group_name: e.target.value,
                        });
                        if (formErrors.dealership_group_name) {
                          setFormErrors({
                            ...formErrors,
                            dealership_group_name: '',
                          });
                        }
                      }}
                    />
                    {formErrors.dealership_group_name && (
                      <p className="text-red mb-2 mt-1 text-xs">
                        {formErrors.dealership_group_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {enterpriseDetails?.org_type !== 'PERSONAL_USE' && (
              <div className="newinput-wrapper relative mb-8 mt-8">
                <span
                  className={`text-black-60 absolute -top-1.5 left-2 bg-white px-1.5 !text-xs font-normal`}
                >
                  {translate('console.screens.signInSignUpScreen.websiteUrl')}
                </span>
                <input
                  className={`!border placeholder:!text-sm placeholder:!text-black/[0.34] ${ErrorMsgwebsite ? '!border-red' : '!border-black/[0.1]'} w-full`}
                  type="url"
                  name={translate(
                    'console.screens.signInSignUpScreen.websiteUrl'
                  )}
                  placeholder={
                    'Enter ' +
                    translate('console.screens.signInSignUpScreen.websiteUrl')
                  }
                  pattern="*.*"
                  required
                  onChange={(e) => {
                    setEnterpriseDetails({
                      ...enterpriseDetails,
                      website_url: e.target.value,
                    });
                    if (ErrorMsgwebsite) {
                      setErrorMsgwebsite('');
                    }
                  }}
                />
                {ErrorMsgwebsite && (
                  <p className="text-red mb-2 mt-1 text-xs">
                    {ErrorMsgwebsite}
                  </p>
                )}
              </div>
            )}
            {activeCategoryType !== categories?.automobile ? (
              <>
                <div className="input-login relative mb-5">
                  <label
                    className={[
                      formErrors?.revenue ? '!text-red' : 'text-black-60',
                      'absolute -top-1.5 left-3 bg-white px-1.5 !text-xs font-normal',
                    ].join(' ')}
                  >
                    {CREATE_ENTERPRISE_DATA?.annualRevenueLabel}
                  </label>
                  <select
                    onChange={(e) => selection(e)}
                    className={[
                      formErrors?.revenue ? '!border-red' : 'border-black-20',
                      'select-option text-black-80 hover:border-black-40 w-full rounded-lg border bg-transparent px-4 py-[15px] text-base font-normal tracking-tight ring-transparent',
                    ].join(' ')}
                    value={selectedRevenue}
                  >
                    {SELECT_DROPDOWN_REVENUE?.map((items, indx) => {
                      return (
                        <option
                          key={indx}
                          className={`hover:bg-blue-light hover:text-white ${items?.hidden ? 'hidden' : ''}`}
                          value={items?.value}
                          selected={selectedRevenue}
                        >
                          {items?.value}
                        </option>
                      );
                    })}
                  </select>
                  {formErrors?.revenue ? (
                    <p className="text-red mb-2 mt-1 text-xs">
                      {formErrors?.revenue}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
            <div
              className={`${createEntBtnClassName || 'w-[calc(100%-32px)]'} tb:p-0 bottom-0 left-4 right-4 bg-white pb-4 pt-2 text-center md:static md:w-full`}
            >
              <button
                className={[
                  SignInSpinner ? 'pointer-events-none' : ' ',
                  'secondary-btn block h-11 w-full items-center !py-1.5',
                ].join(' ')}
                type="submit"
                disabled={SignInSpinner ? true : false}
                id="next"
                onClick={handleCreateEnterpriseClick}
              >
                {SignInSpinner ? (
                  <Spinner
                    type="LIGHT"
                    style_CLASS={
                      'justify-center w-full h-full item-center flex'
                    }
                  />
                ) : (
                  translate(`console.screens.enterprisesScreen.continueButton`)
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-black-60 text-sm font-normal leading-5">
            {translate(
              `console.screens.enterprisesScreen.describeOrganization`
            )}{' '}
            {enterpriseDetails?.emailId}
            <div
              className={`scrollbar-hide flex flex-col justify-between gap-3 overflow-y-scroll pt-8 ${window.location.href.includes('virtualstudio') ? 'h-[365px]' : 'h-[365px]'}`}
            >
              {Object.entries(organizationType).map(([key, org]) => (
                <div
                  key={key}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-3`}
                  onClick={() => {
                    handleOrgClick(key);
                    setSelectedEnterprise(true);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={org.img}
                      alt={org.imgAlt}
                      height={20}
                      width={20}
                      className="h-12 w-12 rounded-full bg-[#4600F20A] p-3"
                    />
                    <div>
                      <div className="text-base font-semibold text-black/80">
                        {org.value}
                      </div>
                      <span className="text-xs font-normal text-black/60">
                        {org.text}
                      </span>
                    </div>
                  </div>
                  <Image
                    src={`https://spyne-static.s3.us-east-1.amazonaws.com/console/icons/create_enterprise_org_type/right_arrowsignup.svg`}
                    alt={'arrow_svg'}
                    height={20}
                    width={20}
                    className="h-8 w-8"
                  />
                </div>
              ))}
            </div>
            {formErrors?.org_type ? (
              <p className="text-red mb-2 mt-1 text-xs">
                {formErrors?.org_type}
              </p>
            ) : null}
          </div>
        )}
      </form>
    </>
  );
}
export default CreateEnterprise;
