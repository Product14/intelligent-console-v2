'use client';

import { DEFAULT_AVAILABILITY_HOURS } from '@/app-models-settings/WorkingShift';
import {
  RequestPayloadAvailabilityHours,
  RequestPayloadHoliday,
} from '@/types/settings/vini-config';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { IoCheckmark, IoWarning } from 'react-icons/io5';
// @ts-ignore - PhoneInput library doesn't have types
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { buildAddress } from '@spyne-console/components/onboarding/rooftop-profile/location-parser.js';
import OnboardingLocationPicker, {
  LocationInputField,
} from '@spyne-console/components/onboarding/rooftop-profile/onboarding-location-picker';

import ShiftAndHoliday from './shift-configurations/ShiftAndHoliday';

interface SalesAddress {
  address?: any;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface SalesDepartmentData {
  salesPhone: string;
  isdCode: string;
  salesAddress: SalesAddress;
  salesAddressSameAsRooftop: boolean;
  salesShifts: RequestPayloadAvailabilityHours;
  salesHolidays: RequestPayloadHoliday[];
}

interface SalesDepartmentProps {
  onFormChange?: (data: SalesDepartmentData) => void;
  onErrorsChange?: (data: {
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  }) => void;
  initialData?: SalesDepartmentData;
  rooftopAddress?: SalesAddress;
  initialAddress?: SalesAddress;
  initialShifts?: RequestPayloadAvailabilityHours;
  initialHolidays?: RequestPayloadHoliday[];
  isOptional?: boolean;
}

const validatePhone = (phone: string): string => {
  if (!phone || phone.trim() === '') {
    return 'Sales department phone number is required';
  }
  // Basic validation - phone should have at least 10 digits (excluding country code)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return 'Please enter a valid sales department phone number';
  }
  return '';
};

const validateAddress = (address: SalesAddress | undefined): string => {
  if (!address) {
    return 'Sales department address is required';
  }
  const hasGeoCoordinates =
    address.geoCoordinates?.lat && address.geoCoordinates?.lng;
  if (!hasGeoCoordinates) {
    return 'Please select a valid sales department address with coordinates';
  }
  return '';
};

export const SalesDepartment = forwardRef<
  {
    showAllErrors: () => void;
    scrollToError: () => void;
  },
  SalesDepartmentProps
>(
  (
    {
      onFormChange,
      onErrorsChange,
      initialData,
      rooftopAddress,
      initialAddress,
      initialShifts,
      initialHolidays,
      isOptional = false,
    }: SalesDepartmentProps,
    ref
  ) => {
    const [isSameAsRooftop, setIsSameAsRooftop] = useState(
      initialData?.salesAddressSameAsRooftop ?? true
    );
    const [salesAddress, setSalesAddress] = useState<SalesAddress>(
      initialAddress ?? initialData?.salesAddress ?? rooftopAddress
    );
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [salesShifts, setSalesShifts] =
      useState<RequestPayloadAvailabilityHours>(
        initialData?.salesShifts ?? initialShifts ?? DEFAULT_AVAILABILITY_HOURS
      );
    const [salesHolidays, setSalesHolidays] = useState<RequestPayloadHoliday[]>(
      initialData?.salesHolidays ?? initialHolidays ?? []
    );

    const [salesData, setSalesData] = useState<SalesDepartmentData>({
      salesPhone: initialData?.salesPhone || '',
      isdCode: initialData?.isdCode || '',
      salesAddress:
        initialAddress ?? initialData?.salesAddress ?? rooftopAddress,
      salesAddressSameAsRooftop: initialData?.salesAddressSameAsRooftop ?? true,
      salesShifts:
        initialData?.salesShifts ?? initialShifts ?? DEFAULT_AVAILABILITY_HOURS,
      salesHolidays: initialData?.salesHolidays ?? initialHolidays ?? [],
    });

    const [errors, setErrors] = useState({
      salesPhone: '',
      salesAddress: '',
    });

    const [touchedFields, setTouchedFields] = useState({
      salesPhone: false,
      salesAddress: false,
    });

    const [disabledFields] = useState({
      salesPhone: false,
    });

    const phoneFieldRef = useRef<HTMLDivElement>(null);
    const addressFieldRef = useRef<HTMLDivElement>(null);
    const prevRooftopAddressRef = useRef<string>(
      JSON.stringify(rooftopAddress)
    );
    const prevInitialShiftsRef = useRef<string>(JSON.stringify(initialShifts));
    const prevInitialHolidaysRef = useRef<string>(
      JSON.stringify(initialHolidays)
    );
    const prevInitialDataFlagRef = useRef<boolean | undefined>(
      initialData?.salesAddressSameAsRooftop
    );

    // Sync the "same as rooftop" flag and address when initialData changes externally
    // (e.g. after fetchedAddresses and addressFlags are resolved from the API)
    useEffect(() => {
      const newFlag = initialData?.salesAddressSameAsRooftop;
      if (newFlag !== undefined && prevInitialDataFlagRef.current !== newFlag) {
        prevInitialDataFlagRef.current = newFlag;
        setIsSameAsRooftop(newFlag);
        if (!newFlag && initialData?.salesAddress) {
          setSalesAddress(initialData.salesAddress);
        } else if (newFlag && rooftopAddress) {
          setSalesAddress(rooftopAddress as SalesAddress);
        }
      }
    }, [initialData?.salesAddressSameAsRooftop]);

    // Update address when rooftop address prop changes — only when flag is true
    useEffect(() => {
      if (rooftopAddress && isSameAsRooftop) {
        const currentRooftopAddress = JSON.stringify(rooftopAddress);
        if (prevRooftopAddressRef.current !== currentRooftopAddress) {
          prevRooftopAddressRef.current = currentRooftopAddress;
          setSalesAddress(rooftopAddress as SalesAddress);
        }
      }
    }, [rooftopAddress]);

    // Update shifts when initial shifts prop changes (only if actually different)
    useEffect(() => {
      if (initialShifts) {
        const currentInitialShifts = JSON.stringify(initialShifts);
        if (prevInitialShiftsRef.current !== currentInitialShifts) {
          prevInitialShiftsRef.current = currentInitialShifts;
          setSalesShifts(initialShifts);
        }
      }
    }, [initialShifts]);

    // Update holidays when initial holidays prop changes (only if actually different)
    useEffect(() => {
      if (initialHolidays) {
        const currentInitialHolidays = JSON.stringify(initialHolidays);
        if (prevInitialHolidaysRef.current !== currentInitialHolidays) {
          prevInitialHolidaysRef.current = currentInitialHolidays;
          setSalesHolidays(initialHolidays);
        }
      }
    }, [initialHolidays]);

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        setTouchedFields({
          salesPhone: true,
          salesAddress: true,
        });
        validateAllFields();
      },
      scrollToError: () => {
        if (phoneFieldRef.current && errors.salesPhone) {
          phoneFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (addressFieldRef.current && errors.salesAddress) {
          addressFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      },
    }));

    // Helper function to validate a single field
    const validateField = (fieldName: string, value?: any): string => {
      if (isOptional) return '';
      let error = '';
      switch (fieldName) {
        case 'salesPhone':
          error = validatePhone(value as string);
          break;
        case 'salesAddress':
          error = validateAddress(salesAddress);
          break;
        default:
          break;
      }
      return error;
    };

    // Helper function to validate all fields
    const validateAllFields = () => {
      if (isOptional) {
        setErrors({ salesPhone: '', salesAddress: '' });
        return;
      }
      const newErrors = {
        salesPhone: validateField('salesPhone', salesData.salesPhone),
        salesAddress: isSameAsRooftop
          ? ''
          : validateField('salesAddress', salesAddress),
      };
      setErrors(newErrors);
    };

    // Handle field change
    const handleFieldChange = (fieldName: string, value: string) => {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    };

    // Handle field blur
    const handleBlur = (fieldName: string, value: string) => {
      setTouchedFields((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
      handleFieldChange(fieldName, value);
    };

    // Validate all fields whenever data changes
    useEffect(() => {
      validateAllFields();
    }, [salesData, salesAddress, isSameAsRooftop, salesShifts, salesHolidays]);

    // Notify parent of errors changes
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
    }, [errors]);

    // Notify parent of form data changes
    useEffect(() => {
      if (onFormChange) {
        const isdCode = salesData.isdCode || '';
        const contactNo = salesData.salesPhone || '';
        const sanitizedIsdCode = isdCode.replace('+', '');
        const sanitizedContactNo =
          isdCode && contactNo.startsWith(sanitizedIsdCode)
            ? contactNo.slice(sanitizedIsdCode.length)
            : contactNo;

        onFormChange({
          salesPhone: sanitizedContactNo,
          isdCode,
          salesAddress,
          salesAddressSameAsRooftop: isSameAsRooftop,
          salesShifts,
          salesHolidays,
        });
      }
    }, [salesData, salesAddress, isSameAsRooftop, salesShifts, salesHolidays]);

    const handleAddressToggle = () => {
      const newIsSameAsRooftop = !isSameAsRooftop;
      setIsSameAsRooftop(newIsSameAsRooftop);

      if (newIsSameAsRooftop) {
        setSalesAddress(rooftopAddress);
      } else {
        // Scroll to address field when unchecking
        setTimeout(() => {
          if (addressFieldRef.current) {
            addressFieldRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }, 100);
      }

      setTouchedFields((prev) => ({
        ...prev,
        salesAddress: true,
      }));
    };

    const handleAddressChange = (data: any) => {
      setSalesAddress({
        address: data.address,
        geoCoordinates: data.coordinates,
      });
      setTouchedFields((prev) => ({
        ...prev,
        salesAddress: true,
      }));
      setIsAddressModalOpen(false);
    };

    const shouldShowError = (fieldName: keyof typeof errors) => {
      if (fieldName === 'salesAddress' && isSameAsRooftop) {
        return false;
      }
      return touchedFields[fieldName] && errors[fieldName];
    };

    return (
      <>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold leading-6 text-[#333333]">
              Sales Department
            </h2>
            {isOptional && (
              <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-xs font-medium text-[#888]">
                Optional
              </span>
            )}
          </div>

          <div ref={phoneFieldRef} className="flex flex-1 flex-col gap-2">
            <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
              Phone Number
              {!isOptional && (
                <span className="font-bold text-[#ff003d]">*</span>
              )}
            </span>
            <PhoneInput
              key="sales-phone-input"
              specialLabel=""
              value={String(salesData?.salesPhone ?? '')}
              containerClass="rooftop-phone-input"
              enableSearch
              country={'us'}
              placeholder="Enter phone number"
              disabled={disabledFields.salesPhone}
              onChange={(phone: string, data: any) => {
                const safePhone = String(phone ?? '');
                const dialCode = data?.dialCode || '';
                setSalesData((prev) => ({
                  ...prev,
                  salesPhone: safePhone,
                  isdCode: dialCode ? `+${dialCode}` : '',
                }));
                handleFieldChange('salesPhone', safePhone);
              }}
              onBlur={() =>
                handleBlur('salesPhone', String(salesData?.salesPhone ?? ''))
              }
            />
            {touchedFields.salesPhone && errors.salesPhone ? (
              <div className="flex items-center gap-1">
                <IoWarning className="h-4 w-4 text-[#c31812]" />
                <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                  {errors.salesPhone}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2" ref={addressFieldRef}>
            <span
              className={`text-sm font-medium leading-5 ${
                shouldShowError('salesAddress')
                  ? 'text-[#c31812]'
                  : 'text-[#666666]'
              }`}
            >
              Sales Department Address
              {!isOptional && !isSameAsRooftop && (
                <span className="font-bold text-[#ff003d]">*</span>
              )}
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddressToggle}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded ${
                      isSameAsRooftop
                        ? 'bg-[#4600f2]'
                        : 'border border-[#e6e6e6] bg-white'
                    }`}
                  >
                    {isSameAsRooftop && (
                      <IoCheckmark className="h-4 w-4 font-medium text-white" />
                    )}
                  </div>
                </button>
                <span className="text-sm font-semibold leading-5 text-[#111]">
                  Same as Rooftop address
                </span>
              </div>

              {!isSameAsRooftop && (
                <>
                  <LocationInputField
                    key="salesAddress"
                    value={buildAddress(salesAddress?.address)}
                    onChangeClick={() => {
                      setIsAddressModalOpen(true);
                      setTouchedFields((prev) => ({
                        ...prev,
                        salesAddress: true,
                      }));
                    }}
                    placeholder="Select a location"
                    isSearchMode={false}
                  />
                  {shouldShowError('salesAddress') && (
                    <div className="flex items-center gap-1">
                      <IoWarning className="h-4 w-4 text-[#c31812]" />
                      <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                        {errors.salesAddress}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <ShiftAndHoliday
              category="sales"
              operatingHours={salesShifts}
              updateOperatingHours={(hours) => setSalesShifts(hours)}
              holidays={salesHolidays}
              updateHolidays={(holidays) => setSalesHolidays(holidays)}
            />
          </div>
        </div>

        {isAddressModalOpen && (
          <OnboardingLocationPicker
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onConfirm={handleAddressChange}
            initialLocation={salesAddress?.address}
            mapCenter={salesAddress?.geoCoordinates}
          />
        )}
      </>
    );
  }
);

SalesDepartment.displayName = 'SalesDepartment';
