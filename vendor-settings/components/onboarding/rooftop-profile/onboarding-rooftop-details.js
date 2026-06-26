import { cn } from '@spyne-console/utils';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { IoCheckmark, IoChevronDown } from 'react-icons/io5';
import { IoWarning } from 'react-icons/io5';
import { MdContentCopy } from 'react-icons/md';
import PhoneInput from 'react-phone-input-2';
//Import 'react-phone-input-2/lib/style.css' in your app's _app.js

import { toast } from 'react-toastify';

import Spinner from '@spyne-console/design-system/spinner';

import { getCommonRooftopConfigs } from './api/get-common-rooftop-configs';
import { getRegionTypes } from './api/get-region-types';
import { getRooftopData, transformRooftopData } from './api/get-rooftop-data';
import { getWebsiteInfo } from './api/get-website-info';
import AutofillWithAi from './autofill-with-ai';
import { buildAddress } from './location-parser';
import OnboardingLocationPicker, {
  LocationInputField,
} from './onboarding-location-picker';
import OnboardingRooftopSubscription from './onboarding-rooftop-subscription';

const timezones = Intl.supportedValuesOf('timeZone');

const getTimezoneAbbreviation = (timezone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
};

const timezoneAbbreviations = Object.fromEntries(
  timezones.map((tz) => [tz, getTimezoneAbbreviation(tz)])
);

// Validation helper functions
const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  // Phone should have at least 10 digits (excluding country code)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) return 'Please enter a valid phone number';
  return '';
};

const validateUrl = (url, requiredMessage = 'Website is required') => {
  if (!url) return requiredMessage;
  try {
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(url)) return 'Please enter a valid URL';
    return '';
  } catch {
    return 'Please enter a valid URL';
  }
};

const validateListingPageUrl = (url) =>
  validateUrl(url, 'Listing page URL is required');

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

const validateLocation = (rooftopAddress) => {
  if (!rooftopAddress) {
    return 'Location is required';
  }
  // Check if geoCoordinates exist (either as lat/lng or geoCoordinates object)
  const hasGeoCoordinates =
    (rooftopAddress.lat && rooftopAddress.lng) ||
    (rooftopAddress.geoCoordinates?.lat && rooftopAddress.geoCoordinates?.lng);

  if (!hasGeoCoordinates) {
    return 'Please select a valid location with coordinates';
  }
  return '';
};

const validateVehicleTypes = (vehicleTypes) => {
  if (!vehicleTypes || typeof vehicleTypes !== 'object') {
    return 'Please select at least one vehicle type';
  }
  const hasAtLeastOne = vehicleTypes.new || vehicleTypes.preOwned;
  if (!hasAtLeastOne) {
    return 'Please select at least one vehicle type';
  }
  return '';
};

const OnboardingRooftopDetails = forwardRef(
  (
    {
      enterpriseId,
      teamId,
      children,
      onFormChange,
      onErrorsChange,
      isProductVini = false,
    },
    ref
  ) => {
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
    const [timezoneSearchTerm, setTimezoneSearchTerm] = useState('');
    const [regionDropdownPosition, setRegionDropdownPosition] =
      useState('bottom');
    const [timezoneDropdownPosition, setTimezoneDropdownPosition] =
      useState('bottom');
    const regionButtonRef = useRef(null);
    const timezoneButtonRef = useRef(null);

    // Field refs for autoscroll to errors
    const fieldRefs = useRef({
      rooftopName: null,
      website: null,
      websiteListingUrl: null,
      adminName: null,
      adminEmail: null,
      adminPhone: null,
      vehicleTypes: null,
      rooftopAddress: null,
      region: null,
      timezone: null,
    });

    const [rooftopData, setRooftopData] = useState({
      rooftopId: '',
      rooftopName: '',
      website: '',
      websiteListingUrl: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      isdCode: '',
      dealerType: '',
      dealerSubType: '',
      vehicleTypes: '',
      rooftopAddress: '',
      geoCoordinates: '',
      region: '',
      timezone: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [regions, setRegions] = useState([]);
    const [vehicleTypesConfig, setVehicleTypesConfig] = useState({
      new: false,
      preOwned: false,
    });
    const [initialVehicleTypesFromApi, setInitialVehicleTypesFromApi] =
      useState(false);
    const hasInitialVehicleTypesSynced = useRef(false);
    const [hasSetInitialDisabledFields, setHasSetInitialDisabledFields] =
      useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isPhoneInputReady, setIsPhoneInputReady] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [autofillStatus, setAutofillStatus] = useState('idle');
    const [autofillScanResult, setAutofillScanResult] = useState(null);

    const [errors, setErrors] = useState({
      rooftopName: '',
      website: '',
      websiteListingUrl: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      region: '',
      timezone: '',
      rooftopAddress: '',
      vehicleTypes: '',
    });

    const [touchedFields, setTouchedFields] = useState({
      rooftopName: false,
      website: false,
      websiteListingUrl: false,
      adminName: false,
      adminEmail: false,
      adminPhone: false,
      region: false,
      timezone: false,
      rooftopAddress: false,
      vehicleTypes: false,
    });

    const [disabledFields, setDisabledFields] = useState({
      adminName: true,
      adminPhone: true,
      adminEmail: true,
      dealerType: true,
      dealerSubType: true,
      vehicleTypes: false,
      rooftopAddress: true,
      region: false,
      timezone: false,
    });

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        setTouchedFields({
          rooftopName: true,
          website: true,
          websiteListingUrl: true,
          adminName: true,
          adminEmail: true,
          adminPhone: true,
          region: true,
          timezone: true,
          rooftopAddress: true,
          vehicleTypes: true,
        });
        // Re-validate all fields with current data to ensure errors are up-to-date
        const validationData = {
          ...rooftopData,
          vehicleTypes: vehicleTypesConfig,
        };
        const validationErrors = validateAllFields(validationData);

        // Scroll to first error after DOM updates
        setTimeout(() => {
          const fieldOrder = [
            'rooftopName',
            'website',
            'websiteListingUrl',
            'adminName',
            'adminEmail',
            'adminPhone',
            'vehicleTypes',
            'rooftopAddress',
            'region',
            'timezone',
          ];

          // Find first field with error and scroll to it
          const firstErrorField = fieldOrder.find(
            (fieldName) =>
              validationErrors[fieldName] && fieldRefs.current[fieldName]
          );

          if (firstErrorField) {
            fieldRefs.current[firstErrorField].scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 100);

        const hasErrors = Object.values(validationErrors).some(
          (error) => error !== ''
        );
        return { errors: validationErrors, hasErrors, isValid: !hasErrors };
      },
    }));

    // Helper function to validate a single field
    const validateField = (fieldName, value, geoCoordinates = null) => {
      let error = '';
      switch (fieldName) {
        case 'rooftopName':
          error = validateRequired(value, 'Rooftop name');
          break;
        case 'website':
          error = validateUrl(value);
          break;
        case 'websiteListingUrl':
          error = validateListingPageUrl(value);
          break;
        case 'adminName':
          error = validateRequired(value, 'Admin name');
          break;
        case 'adminEmail':
          error = validateEmail(value);
          break;
        case 'adminPhone':
          error = validatePhone(value);
          break;
        case 'region':
          error = validateRequired(value, 'Region');
          break;
        case 'timezone':
          error = validateRequired(value, 'Timezone');
          break;
        case 'rooftopAddress':
          // If geoCoordinates are provided separately, check them
          if (geoCoordinates && geoCoordinates.lat && geoCoordinates.lng) {
            error = ''; // Valid if geoCoordinates exist
          } else {
            error = validateLocation(value);
          }
          break;
        case 'vehicleTypes':
          error = validateVehicleTypes(value);
          break;
        default:
          break;
      }
      return error;
    };

    // Helper function to validate all fields
    const validateAllFields = (data) => {
      const newErrors = {
        rooftopName: validateField('rooftopName', data?.rooftopName),
        website: validateField('website', data?.website),
        websiteListingUrl: validateField(
          'websiteListingUrl',
          data?.websiteListingUrl
        ),
        adminName: validateField('adminName', data?.adminName),
        adminEmail: validateField('adminEmail', data?.adminEmail),
        adminPhone: validateField('adminPhone', data?.adminPhone),
        region: validateField('region', data?.region),
        timezone: validateField('timezone', data?.timezone),
        rooftopAddress: validateField(
          'rooftopAddress',
          data?.rooftopAddress,
          data?.geoCoordinates
        ),
        vehicleTypes: validateField('vehicleTypes', data?.vehicleTypes),
      };
      setErrors(newErrors);
      return newErrors;
    };

    // Delay PhoneInput rendering to avoid react-phone-input-2 initialization issues
    useEffect(() => {
      // Use requestAnimationFrame to ensure DOM is ready before mounting PhoneInput
      const rafId = requestAnimationFrame(() => {
        setIsPhoneInputReady(true);
      });
      return () => cancelAnimationFrame(rafId);
    }, []);

    // Fetch region types
    useEffect(() => {
      const fetchRegions = async () => {
        try {
          const regions = await getRegionTypes();
          setRegions(regions);
        } catch (err) {
          toast.error('Failed to load region types. Please try again.');
        }
      };

      fetchRegions();
    }, []);

    // Fetch vehicle types from common rooftop configs
    useEffect(() => {
      const fetchVehicleTypes = async () => {
        if (enterpriseId && teamId) {
          try {
            const configData = await getCommonRooftopConfigs({
              enterpriseId,
              teamId,
            });
            // Only set if we haven't already synced from main rooftop data API
            if (
              configData?.vehicleType &&
              Object.values(configData.vehicleType).some((value) => value) &&
              !hasInitialVehicleTypesSynced.current
            ) {
              setVehicleTypesConfig(configData.vehicleType);
              // Also update rooftopData.vehicleTypes to keep states in sync
              setRooftopData((prev) => ({
                ...prev,
                vehicleTypes: configData.vehicleType,
              }));
              setInitialVehicleTypesFromApi(true);
              hasInitialVehicleTypesSynced.current = true;
            }
          } catch (err) {
            console.error('Failed to load vehicle types:', err);
            // Don't show error toast as this is optional data
          }
        }
      };

      fetchVehicleTypes();
    }, [enterpriseId, teamId]);

    // Fetch rooftop data if not provided externally
    useEffect(() => {
      const fetchData = async () => {
        if (teamId) {
          setIsLoading(true);
          try {
            const response = await getRooftopData(teamId);
            const transformedData = transformRooftopData(response);

            setRooftopData((prev) => ({
              ...prev,
              ...transformedData,
            }));
            setIsDataLoaded(true);
          } catch (err) {
            toast.error('Failed to load rooftop data. Please try again.');
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [teamId]);

    useEffect(() => {
      if (initialVehicleTypesFromApi && isDataLoaded) {
        setTimeout(() => {
          validateAllFields({
            ...rooftopData,
          });
        }, 0);
      }
    }, [initialVehicleTypesFromApi, isDataLoaded]);

    useEffect(() => {
      if (rooftopData && !hasSetInitialDisabledFields && isDataLoaded) {
        setTimeout(() => {
          setDisabledFields({
            adminName: !!rooftopData?.adminName,
            adminEmail: !!rooftopData?.adminEmail,
            dealerType: !!rooftopData?.dealerType,
            dealerSubType: !!rooftopData?.dealerSubType,
          });

          setHasSetInitialDisabledFields(true);
        }, 0);
      }
    }, [
      rooftopData,
      initialVehicleTypesFromApi,
      hasSetInitialDisabledFields,
      isDataLoaded,
    ]);

    useEffect(() => {
      if (touchedFields.vehicleTypes || initialVehicleTypesFromApi) {
        const error = validateField('vehicleTypes', vehicleTypesConfig);
        setErrors((prev) => ({
          ...prev,
          vehicleTypes: error,
        }));
      }
    }, [
      vehicleTypesConfig,
      touchedFields.vehicleTypes,
      initialVehicleTypesFromApi,
    ]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isRegionDropdownOpen || isTimezoneDropdownOpen) {
          const target = event.target;
          const isClickInsideDropdown =
            target.closest('.region-dropdown') ||
            target.closest('.timezone-dropdown');
          if (!isClickInsideDropdown) {
            setIsRegionDropdownOpen(false);
            setIsTimezoneDropdownOpen(false);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isRegionDropdownOpen, isTimezoneDropdownOpen]);

    useEffect(() => {
      if (onFormChange && rooftopData) {
        const isdCode = rooftopData.isdCode || '';
        const contactNo = rooftopData.adminPhone || '';
        const sanitizedIsdCode = isdCode.replace('+', '');
        const sanitizedContactNo =
          isdCode && contactNo.startsWith(sanitizedIsdCode)
            ? contactNo.slice(sanitizedIsdCode.length)
            : contactNo;

        const formData = {
          rooftopId: rooftopData.rooftopId,
          rooftopName: rooftopData.rooftopName,
          website: rooftopData.website,
          websiteListingUrl: rooftopData.websiteListingUrl,
          adminName: rooftopData.adminName,
          adminEmail: rooftopData.adminEmail,
          adminUserId: rooftopData.adminUserId,
          adminPhone: sanitizedContactNo,
          isdCode,
          dealerType: rooftopData.dealerType,
          dealerSubType: rooftopData.dealerSubType,
          vehicleTypes: rooftopData.vehicleTypes,
          rooftopAddress: rooftopData.rooftopAddress,
          geoCoordinates: rooftopData.geoCoordinates,
          region: rooftopData.region,
          timezone: rooftopData.timezone,
        };
        onFormChange(formData);
      }
    }, [rooftopData]);

    useEffect(() => {
      if (onErrorsChange) {
        const hasErrors = Object.values(errors).some((error) => error !== '');
        const errorData = {
          errors,
          hasErrors,
          isValid: !hasErrors,
        };
        onErrorsChange(errorData);
      }
    }, [errors, rooftopData]);

    const handleAutofillScan = async (url) => {
      setAutofillStatus('scanning');
      setIsLoading(true);
      try {
        const response = await getWebsiteInfo(url);
        const data = response?.data;

        if (!data) {
          setAutofillStatus('idle');
          setIsLoading(false);
          toast.error('Could not fetch website information. Please try again.');
          return;
        }

        const updates = {};
        let autofilled = 0;
        let needsReview = 0;
        let notFound = 0;

        const tryFill = (key, value) => {
          if (value) {
            updates[key] = value;
            autofilled++;
          } else notFound++;
        };

        tryFill('rooftopName', data.teamName);
        tryFill('website', data.website);
        tryFill('websiteListingUrl', data.websiteListingUrl);
        tryFill('region', data.regionType);
        tryFill('timezone', data.timeZone);

        if (!disabledFields.adminName)
          tryFill('adminName', data.userData?.name);
        if (!disabledFields.adminEmail)
          tryFill('adminEmail', data.userData?.email);

        if (data.vehicleType?.length) {
          const newVehicleTypes = {
            new: data.vehicleType.includes('New'),
            preOwned: data.vehicleType.includes('Pre-Owned'),
          };
          updates.vehicleTypes = newVehicleTypes;
          setVehicleTypesConfig(newVehicleTypes);
          autofilled++;
        } else {
          notFound++;
        }

        // Fill address display fields; geocoordinates are absent — user must confirm via map picker
        if (data.rooftopAddress) {
          updates.rooftopAddress = {
            addressLine1:
              data.rooftopAddress.addressLine1 ||
              data?.rooftopAddress?.address_line ||
              '',
            addressLine2: data.rooftopAddress.addressLine2 || '',
            city: data.rooftopAddress.city || '',
            state: data.rooftopAddress.state || '',
            country: data.rooftopAddress.country || '',
            zipcode:
              data.rooftopAddress.zipcode || data.rooftopAddress.pin_code || '',
            district: data.rooftopAddress.district || '',
            countryCode: data.rooftopAddress.countryCode || '',
          };
          needsReview++;
        } else {
          notFound++;
        }

        setRooftopData((prev) => ({ ...prev, ...updates }));
        setAutofillStatus('completed');
        setAutofillScanResult({ autofilled, needsReview, notFound });
      } catch {
        setAutofillStatus('idle');
        toast.error('Could not fetch website information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    console.log(rooftopData, '0101010101');
    const handleCopyId = async () => {
      if (rooftopData?.rooftopId) {
        try {
          await navigator.clipboard.writeText(rooftopData.rooftopId);
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 5000);
        } catch (error) {
          console.error('Failed to copy ID:', error);
        }
      }
    };

    const handleFieldChange = (fieldName, value) => {
      if (rooftopData) {
        setRooftopData((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
      }

      // Validate the field and update errors
      // For rooftopAddress, pass geoCoordinates as well
      const error =
        fieldName === 'rooftopAddress'
          ? validateField(fieldName, value, rooftopData?.geoCoordinates)
          : validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    };

    const handleBlur = (fieldName, value) => {
      // Mark field as touched on blur
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // Validate on blur
      // For rooftopAddress, pass geoCoordinates as well
      const error =
        fieldName === 'rooftopAddress'
          ? validateField(fieldName, value, rooftopData?.geoCoordinates)
          : validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    };

    // Helper function to determine dropdown position based on available space
    const calculateDropdownPosition = (buttonRef) => {
      if (!buttonRef.current) return 'bottom';

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // max-h-[240px]
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If not enough space below but more space above, open upward
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        return 'top';
      }
      return 'bottom';
    };

    const handleRegionSelect = (region) => {
      handleFieldChange('region', region.value);
      setTouchedFields((prev) => ({
        ...prev,
        region: true,
      }));
      setIsRegionDropdownOpen(false);
    };

    const handleTimezoneSelect = (timezone) => {
      handleFieldChange('timezone', timezone);
      setTouchedFields((prev) => ({
        ...prev,
        timezone: true,
      }));
      setIsTimezoneDropdownOpen(false);
      setTimezoneSearchTerm('');
    };

    // Helper to check if error should be displayed (only if field is touched)
    const shouldShowError = (fieldName) => {
      return touchedFields[fieldName] && errors[fieldName];
    };

    // Filter timezones based on search term (matches IANA name or abbreviation like PST, CST)
    const filteredTimezones = timezones.filter((timezone) => {
      const term = timezoneSearchTerm.toLowerCase();
      return (
        timezone.toLowerCase().includes(term) ||
        timezoneAbbreviations[timezone].toLowerCase().includes(term)
      );
    });

    const handleOpenLocationModal = () => {
      // Mark field as touched when opening the modal
      setTouchedFields((prev) => ({
        ...prev,
        rooftopAddress: true,
      }));
      setIsLocationModalOpen(true);
    };

    const handleCloseLocationModal = () => {
      setIsLocationModalOpen(false);
    };

    const handleConfirmLocation = (locationData) => {
      setRooftopData((prev) => ({
        ...prev,
        rooftopAddress: locationData.address,
        geoCoordinates: locationData.coordinates,
      }));

      // Validate the new location with geoCoordinates
      const error = validateField(
        'rooftopAddress',
        locationData.address,
        locationData.coordinates
      );
      setErrors((prev) => ({
        ...prev,
        rooftopAddress: error,
      }));

      setIsLocationModalOpen(false);
    };

    const handleVehicleTypeToggle = (vehicleType) => {
      const newVehicleTypes = {
        ...vehicleTypesConfig,
        [vehicleType]: !vehicleTypesConfig[vehicleType],
      };

      // Update both states
      setVehicleTypesConfig(newVehicleTypes);
      setRooftopData((prevData) => ({
        ...prevData,
        vehicleTypes: newVehicleTypes,
      }));

      // Validate vehicle types immediately with the new values
      const error = validateField('vehicleTypes', newVehicleTypes);
      setErrors((prevErrors) => ({
        ...prevErrors,
        vehicleTypes: error,
      }));
    };

    // Helper to get input class names based on error state
    const getInputClassName = (hasError, isDisabled = false) => {
      const baseClass =
        'rounded-lg border px-3 py-2.5 text-sm font-medium leading-6';
      const errorClass = hasError
        ? 'border-[#c31812] text-[rgba(0,0,0,0.8)]'
        : 'border-[rgba(0,0,0,0.2)] text-[rgba(0,0,0,0.8)]';
      const disabledClass = isDisabled
        ? '!bg-[#f6f6f6] cursor-not-allowed'
        : 'bg-white';
      return cn(baseClass, errorClass, disabledClass);
    };

    return (
      <div className="h-full w-full overflow-y-auto">
        {/* DEALER-ONBOARDING FORK: scraping ("Autofill with AI") demoted — quality
            comes from integrations, not website scraping, so it no longer headlines
            the entry screen. (Re-enable as a small optional accelerator if desired.) */}
        {/* DEALER-ONBOARDING FORK: subscription panel removed — the rooftop
            profile is now an identity-only settings screen; the "Agents:" /
            contract summary belongs in Billing & Usage (separate Console area). */}
        <div className="flex h-full gap-10 overflow-y-auto rounded-2xl border border-black/10 p-6">
          <div className="flex w-full flex-col gap-8 overflow-y-auto overflow-x-hidden pr-2">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <Spinner />
              </div>
            ) : (
              <div className="scrollbar-hide flex h-full w-full flex-col gap-7 overflow-x-auto">
                <div className="flex w-full gap-4">
                  <div
                    ref={(el) => (fieldRefs.current.rooftopName = el)}
                    className="flex flex-1 flex-col gap-2"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                        Rooftop Name*
                      </span>
                      {/* <button
                      onClick={handleCopyId}
                      type="button"
                      className="flex h-5 items-center justify-center gap-1 rounded-[54px] bg-[#f5f5f5] px-1.5 py-1"
                    >
                      <span className="text-center text-[10px] font-medium leading-4 text-[#363f72]">
                        ID:{rooftopData?.rooftopId}
                      </span>
                      <MdContentCopy className="h-2.5 w-2.5 text-[#363f72]" />
                      {isCopied && (
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#027a48] transition-opacity duration-300">
                          <IoCheckmark className="h-2 w-2 text-white" />
                        </span>
                      )}
                    </button> */}
                    </div>
                    <input
                      type="text"
                      value={rooftopData?.rooftopName || ''}
                      onChange={(e) =>
                        handleFieldChange('rooftopName', e.target.value)
                      }
                      onBlur={(e) => handleBlur('rooftopName', e.target.value)}
                      maxLength={255}
                      className={getInputClassName(
                        shouldShowError('rooftopName')
                      )}
                    />
                    {shouldShowError('rooftopName') && (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.rooftopName}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    ref={(el) => (fieldRefs.current.website = el)}
                    className="flex flex-1 flex-col gap-2"
                  >
                    <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                      Website*
                    </span>
                    <input
                      type="text"
                      value={rooftopData?.website || ''}
                      onChange={(e) =>
                        handleFieldChange('website', e.target.value)
                      }
                      onBlur={(e) => handleBlur('website', e.target.value)}
                      maxLength={255}
                      className={getInputClassName(shouldShowError('website'))}
                    />
                    {shouldShowError('website') && (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.website}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  ref={(el) => (fieldRefs.current.websiteListingUrl = el)}
                  className="flex w-full flex-col gap-2"
                >
                  <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                    Listing Page URL*
                  </span>
                  <input
                    type="text"
                    value={rooftopData?.websiteListingUrl || ''}
                    onChange={(e) =>
                      handleFieldChange('websiteListingUrl', e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur('websiteListingUrl', e.target.value)
                    }
                    maxLength={255}
                    className={getInputClassName(
                      shouldShowError('websiteListingUrl')
                    )}
                  />
                  {shouldShowError('websiteListingUrl') && (
                    <div className="flex items-center gap-1">
                      <IoWarning className="h-4 w-4 text-[#c31812]" />
                      <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                        {errors.websiteListingUrl}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex w-full gap-4">
                  <div
                    ref={(el) => (fieldRefs.current.adminName = el)}
                    className="flex flex-1 flex-col gap-2"
                  >
                    <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                      Admin Name*
                    </span>
                    <input
                      type="text"
                      value={rooftopData?.adminName || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRooftopData((prev) => ({
                          ...prev,
                          adminName: value,
                        }));
                        handleFieldChange('adminName', value);
                      }}
                      onBlur={(e) => handleBlur('adminName', e.target.value)}
                      disabled={disabledFields.adminName}
                      className={getInputClassName(
                        shouldShowError('adminName'),
                        disabledFields.adminName
                      )}
                    />
                    {shouldShowError('adminName') && (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.adminName}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    ref={(el) => (fieldRefs.current.adminEmail = el)}
                    className="flex flex-1 flex-col gap-2"
                  >
                    <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                      Admin Email*
                    </span>
                    <input
                      type="email"
                      value={rooftopData?.adminEmail || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRooftopData((prev) => ({
                          ...prev,
                          adminEmail: value,
                        }));
                        handleFieldChange('adminEmail', value);
                      }}
                      onBlur={(e) => handleBlur('adminEmail', e.target.value)}
                      disabled={disabledFields.adminEmail}
                      className={getInputClassName(
                        shouldShowError('adminEmail'),
                        disabledFields.adminEmail
                      )}
                    />
                    {shouldShowError('adminEmail') && (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.adminEmail}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    ref={(el) => (fieldRefs.current.adminPhone = el)}
                    className="flex min-w-[250px] flex-1 flex-col gap-2"
                  >
                    <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                      Admin Phone No.*
                    </span>
                    {isPhoneInputReady && isDataLoaded ? (
                      <PhoneInput
                        key="admin-phone-input"
                        specialLabel=""
                        value={String(rooftopData?.adminPhone ?? '')}
                        containerClass="rooftop-phone-input"
                        enableSearch
                        country={'us'}
                        placeholder="Enter phone number"
                        disabled={disabledFields.adminPhone}
                        onChange={(phone, data) => {
                          const safePhone = String(phone ?? '');
                          const dialCode = data?.dialCode || '';
                          setRooftopData((prev) => ({
                            ...prev,
                            adminPhone: safePhone,
                            isdCode: dialCode ? `+${dialCode}` : '',
                          }));
                          handleFieldChange('adminPhone', safePhone);
                        }}
                        onBlur={() =>
                          handleBlur(
                            'adminPhone',
                            String(rooftopData?.adminPhone ?? '')
                          )
                        }
                      />
                    ) : (
                      <div className="h-[46px] rounded-lg border border-[rgba(0,0,0,0.2)] bg-[#f6f6f6] px-3 py-2.5" />
                    )}
                    {touchedFields.adminPhone && errors.adminPhone ? (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.adminPhone}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                      Dealer Type
                    </span>
                    <input
                      type="text"
                      value={rooftopData?.dealerType || ''}
                      onChange={(e) =>
                        setRooftopData((prev) => ({
                          ...prev,
                          dealerType: e.target.value,
                        }))
                      }
                      className="cursor-not-allowed rounded-lg border border-[rgba(0,0,0,0.2)] bg-white px-3 py-2.5 text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] disabled:!bg-[#f6f6f6]"
                      disabled={disabledFields.dealerType}
                      readOnly
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                      Dealer Sub-type
                    </span>
                    <input
                      type="text"
                      value={rooftopData?.dealerSubType || ''}
                      onChange={(e) =>
                        setRooftopData((prev) => ({
                          ...prev,
                          dealerSubType: e.target.value,
                        }))
                      }
                      className="cursor-not-allowed rounded-lg border border-[rgba(0,0,0,0.2)] bg-white px-3 py-2.5 text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] disabled:!bg-[#f6f6f6]"
                      disabled={disabledFields.dealerSubType}
                      readOnly
                    />
                  </div>
                  <div className="flex flex-1" />
                </div>
                <div
                  ref={(el) => (fieldRefs.current.vehicleTypes = el)}
                  className="flex w-full flex-col gap-2"
                >
                  <span
                    className={`text-sm font-medium leading-5 ${shouldShowError('vehicleTypes') ? 'text-[#c31812]' : 'text-[rgba(0,0,0,0.6)]'}`}
                  >
                    Tell which vehicle type you deal in
                    <span className="font-bold text-[#ff003d]">*</span>
                  </span>
                  <div className="flex gap-2 pl-1">
                    <button
                      onClick={() => {
                        if (!disabledFields.vehicleTypes) {
                          handleVehicleTypeToggle('new');
                          setTouchedFields((prev) => ({
                            ...prev,
                            vehicleTypes: true,
                          }));
                        }
                      }}
                      type="button"
                      disabled={disabledFields.vehicleTypes}
                      className={`relative p-[2px] ${disabledFields.vehicleTypes ? 'cursor-not-allowed' : ''}`}
                    >
                      <div
                        className="absolute inset-0 rounded-[30px]"
                        style={{
                          background: vehicleTypesConfig.new
                            ? 'linear-gradient(to right, #8400FF 20%, #E100FF 40%, #32D6FF 60%, #90C2FF 75%, #FF4894 90%)'
                            : '#0000001A',
                        }}
                      ></div>
                      <span className="relative z-10 block rounded-[30px] bg-white px-4 py-1.5 text-sm leading-5">
                        New
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (!disabledFields.vehicleTypes) {
                          handleVehicleTypeToggle('preOwned');
                          setTouchedFields((prev) => ({
                            ...prev,
                            vehicleTypes: true,
                          }));
                        }
                      }}
                      type="button"
                      disabled={disabledFields.vehicleTypes}
                      className={`relative p-[2px] ${disabledFields.vehicleTypes ? 'cursor-not-allowed' : ''}`}
                    >
                      <div
                        className="absolute inset-0 rounded-[30px]"
                        style={{
                          background: vehicleTypesConfig.preOwned
                            ? 'linear-gradient(to right, #8400FF 20%, #E100FF 40%, #32D6FF 60%, #90C2FF 75%, #FF4894 90%)'
                            : '#0000001A',
                        }}
                      ></div>
                      <span className="relative z-10 block rounded-[30px] bg-white px-4 py-1.5 text-sm leading-5">
                        Pre-Owned
                      </span>
                    </button>
                  </div>
                  {shouldShowError('vehicleTypes') && (
                    <div className="flex items-center gap-1">
                      <IoWarning className="h-4 w-4 text-[#c31812]" />
                      <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                        {errors.vehicleTypes}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex w-full flex-col gap-8">
                  <div
                    ref={(el) => (fieldRefs.current.rooftopAddress = el)}
                    className="flex flex-col gap-2"
                  >
                    <span
                      className={`text-sm font-medium leading-5 ${shouldShowError('rooftopAddress') ? 'text-[#c31812]' : 'text-[rgba(0,0,0,0.6)]'}`}
                    >
                      Rooftop Address
                      <span className="font-bold text-[#ff003d]">*</span>
                    </span>
                    <LocationInputField
                      value={buildAddress(rooftopData?.rooftopAddress) ?? ''}
                      onChangeClick={handleOpenLocationModal}
                      placeholder="Select a location"
                      isSearchMode={false}
                      disabled={disabledFields.rooftopAddress}
                    />
                    {shouldShowError('rooftopAddress') && (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.rooftopAddress}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <div
                      ref={(el) => (fieldRefs.current.region = el)}
                      className="region-dropdown flex w-[239.67px] flex-col gap-2"
                    >
                      <span
                        className={`text-sm font-medium leading-5 ${shouldShowError('region') ? 'text-[#c31812]' : 'text-[rgba(0,0,0,0.6)]'}`}
                      >
                        Region
                        <span className="font-bold text-[#ff003d]">*</span>
                      </span>
                      <div className="relative">
                        <button
                          ref={regionButtonRef}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 disabled:bg-[#f6f6f6] ${
                            shouldShowError('region')
                              ? 'border-[#c31812]'
                              : 'border-[rgba(0,0,0,0.2)]'
                          } disabled:cursor-not-allowed`}
                          onClick={() => {
                            if (!disabledFields.region) {
                              const position =
                                calculateDropdownPosition(regionButtonRef);
                              setRegionDropdownPosition(position);
                              setIsRegionDropdownOpen(!isRegionDropdownOpen);
                            }
                          }}
                          disabled={disabledFields.region}
                        >
                          <span className="text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)]">
                            {regions.find(
                              (r) => r.value === rooftopData?.region
                            )?.label || 'Select Region'}
                          </span>
                          <IoChevronDown
                            className={`h-5 w-5 transition-transform ${
                              isRegionDropdownOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </button>
                        {isRegionDropdownOpen && (
                          <div
                            className={`absolute ${regionDropdownPosition === 'top' ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'} z-[9999] max-h-[240px] w-full overflow-y-auto rounded-lg border border-[rgba(0,0,0,0.2)] bg-white shadow-lg`}
                          >
                            {regions.map((region) => (
                              <button
                                key={region.value}
                                type="button"
                                onClick={() => handleRegionSelect(region)}
                                className="w-full px-3 py-2.5 text-left text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] hover:bg-[#f5f5f5]"
                              >
                                {region.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {shouldShowError('region') && (
                        <div className="flex items-center gap-1">
                          <IoWarning className="h-4 w-4 text-[#c31812]" />
                          <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                            {errors.region}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      ref={(el) => (fieldRefs.current.timezone = el)}
                      className="timezone-dropdown flex w-[239.67px] flex-col gap-2"
                    >
                      <span
                        className={`text-sm font-medium leading-5 ${shouldShowError('timezone') ? 'text-[#c31812]' : 'text-[rgba(0,0,0,0.6)]'}`}
                      >
                        Rooftop Timezone
                        <span className="font-bold text-[#ff003d]">*</span>
                      </span>
                      <div className="relative">
                        <button
                          ref={timezoneButtonRef}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 disabled:cursor-not-allowed disabled:bg-[#f6f6f6] ${
                            shouldShowError('timezone')
                              ? 'border-[#c31812]'
                              : 'border-[rgba(0,0,0,0.2)]'
                          }`}
                          onClick={() => {
                            if (!disabledFields.timezone) {
                              const position =
                                calculateDropdownPosition(timezoneButtonRef);
                              setTimezoneDropdownPosition(position);
                              setIsTimezoneDropdownOpen(
                                !isTimezoneDropdownOpen
                              );
                            }
                          }}
                          disabled={disabledFields.timezone}
                        >
                          <span className="text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)]">
                            {rooftopData?.timezone || 'Select Timezone'}
                          </span>
                          <IoChevronDown
                            className={`h-5 w-5 transition-transform ${
                              isTimezoneDropdownOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </button>
                        {isTimezoneDropdownOpen && (
                          <div
                            className={`absolute ${timezoneDropdownPosition === 'top' ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'} z-[9999] flex max-h-[240px] w-full flex-col overflow-hidden rounded-lg border border-[rgba(0,0,0,0.2)] bg-white shadow-lg`}
                          >
                            <div
                              className={`sticky ${timezoneDropdownPosition === 'top' ? 'bottom-0' : 'top-0'} border-b border-[rgba(0,0,0,0.1)] bg-white p-2`}
                            >
                              <input
                                type="text"
                                placeholder="Search timezone..."
                                value={timezoneSearchTerm}
                                onChange={(e) =>
                                  setTimezoneSearchTerm(e.target.value)
                                }
                                className="w-full rounded border border-[rgba(0,0,0,0.2)] px-2 py-1.5 text-sm outline-none focus:border-[#4600f2]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-[200px] overflow-y-auto">
                              {filteredTimezones.length > 0 ? (
                                filteredTimezones.map((timezone) => (
                                  <button
                                    key={timezone}
                                    type="button"
                                    onClick={() =>
                                      handleTimezoneSelect(timezone)
                                    }
                                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] hover:bg-[#f5f5f5] ${
                                      rooftopData?.timezone === timezone
                                        ? 'bg-[#4600f214]'
                                        : ''
                                    }`}
                                  >
                                    <span>{timezone}</span>
                                    {timezoneAbbreviations[timezone] && (
                                      <span className="ml-2 shrink-0 text-xs font-semibold text-[rgba(0,0,0,0.45)]">
                                        {timezoneAbbreviations[timezone]}
                                      </span>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2.5 text-center text-sm text-[rgba(0,0,0,0.5)]">
                                  No timezones found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {shouldShowError('timezone') && (
                        <div className="flex items-center gap-1">
                          <IoWarning className="h-4 w-4 text-[#c31812]" />
                          <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                            {errors.timezone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!!children && (
                  <div className="w-full min-w-fit">{children}</div>
                )}
              </div>
            )}
          </div>

          {isLocationModalOpen && (
            <OnboardingLocationPicker
              isOpen={isLocationModalOpen}
              onClose={handleCloseLocationModal}
              onConfirm={handleConfirmLocation}
              initialLocation={rooftopData?.rooftopAddress ?? {}}
              mapCenter={rooftopData?.geoCoordinates}
              zoom={14}
            />
          )}
        </div>
      </div>
    );
  }
);

OnboardingRooftopDetails.displayName = 'OnboardingRooftopDetails';

export default OnboardingRooftopDetails;
