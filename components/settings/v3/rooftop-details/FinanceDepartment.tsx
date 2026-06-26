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

interface FinanceAddress {
  address?: any;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface FinanceDepartmentData {
  financePhone: string;
  isdCode: string;
  financeAddress: FinanceAddress;
  financeAddressSameAsSales: boolean;
  financeShifts: RequestPayloadAvailabilityHours;
  financeHolidays: RequestPayloadHoliday[];
  financeShiftsSameAsSales: boolean;
  financeHolidaysSameAsSales: boolean;
}

interface FinanceDepartmentProps {
  onFormChange?: (data: FinanceDepartmentData) => void;
  onErrorsChange?: (data: {
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  }) => void;
  initialData?: FinanceDepartmentData;
  salesAddress?: FinanceAddress;
  initialAddress?: FinanceAddress;
  salesShifts?: RequestPayloadAvailabilityHours;
  salesHolidays?: RequestPayloadHoliday[];
  isOptional?: boolean;
}

const validatePhone = (phone: string): string => {
  if (!phone || phone.trim() === '') {
    return 'Finance department phone number is required';
  }
  // Basic validation - phone should have at least 10 digits (excluding country code)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return 'Please enter a valid finance department phone number';
  }
  return '';
};

const validateAddress = (address: FinanceAddress | undefined): string => {
  if (!address) {
    return 'Finance department address is required';
  }
  const hasGeoCoordinates =
    address.geoCoordinates?.lat && address.geoCoordinates?.lng;
  if (!hasGeoCoordinates) {
    return 'Please select a valid finance department address with coordinates';
  }
  return '';
};

export const FinanceDepartment = forwardRef<
  {
    showAllErrors: () => void;
    scrollToError: () => void;
  },
  FinanceDepartmentProps
>(
  (
    {
      onFormChange,
      onErrorsChange,
      initialData,
      salesAddress,
      initialAddress,
      salesShifts,
      salesHolidays,
      isOptional = false,
    }: FinanceDepartmentProps,
    ref
  ) => {
    const [isSameAsSales, setIsSameAsSales] = useState(
      initialData?.financeAddressSameAsSales ?? true
    );
    const [financeAddress, setFinanceAddress] = useState<FinanceAddress>(
      initialAddress ?? initialData?.financeAddress ?? salesAddress
    );
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [financeShifts, setFinanceShifts] =
      useState<RequestPayloadAvailabilityHours>(
        initialData?.financeShifts ?? salesShifts ?? DEFAULT_AVAILABILITY_HOURS
      );
    const [financeHolidays, setFinanceHolidays] = useState<
      RequestPayloadHoliday[]
    >(initialData?.financeHolidays ?? salesHolidays ?? []);
    const [financeShiftsSameAsSales, setFinanceShiftsSameAsSales] = useState(
      initialData?.financeShiftsSameAsSales ?? true
    );
    const [financeHolidaysSameAsSales, setFinanceHolidaysSameAsSales] =
      useState(initialData?.financeHolidaysSameAsSales ?? true);

    const [financeData, setFinanceData] = useState<FinanceDepartmentData>({
      financePhone: initialData?.financePhone || '',
      isdCode: initialData?.isdCode || '',
      financeAddress:
        initialAddress ?? initialData?.financeAddress ?? salesAddress,
      financeAddressSameAsSales: initialData?.financeAddressSameAsSales ?? true,
      financeShifts:
        initialData?.financeShifts ?? salesShifts ?? DEFAULT_AVAILABILITY_HOURS,
      financeHolidays: initialData?.financeHolidays ?? salesHolidays ?? [],
      financeShiftsSameAsSales: initialData?.financeShiftsSameAsSales ?? true,
      financeHolidaysSameAsSales:
        initialData?.financeHolidaysSameAsSales ?? true,
    });

    const [errors, setErrors] = useState({
      financePhone: '',
      financeAddress: '',
    });

    const [touchedFields, setTouchedFields] = useState({
      financePhone: false,
      financeAddress: false,
    });

    const [disabledFields] = useState({
      financePhone: false,
    });

    const phoneFieldRef = useRef<HTMLDivElement>(null);
    const addressFieldRef = useRef<HTMLDivElement>(null);
    const prevSalesAddressRef = useRef<string>(JSON.stringify(salesAddress));
    const prevSalesShiftsRef = useRef<string>(JSON.stringify(salesShifts));
    const prevSalesHolidaysRef = useRef<string>(JSON.stringify(salesHolidays));
    const prevInitialDataFlagRef = useRef<boolean | undefined>(
      initialData?.financeAddressSameAsSales
    );

    // Sync the "same as sales" flag and address when initialData changes externally
    // (e.g. after fetchedAddresses and addressFlags are resolved from the API)
    useEffect(() => {
      const newFlag = initialData?.financeAddressSameAsSales;
      if (newFlag !== undefined && prevInitialDataFlagRef.current !== newFlag) {
        prevInitialDataFlagRef.current = newFlag;
        setIsSameAsSales(newFlag);
        if (!newFlag && initialData?.financeAddress) {
          setFinanceAddress(initialData.financeAddress);
        } else if (newFlag && salesAddress) {
          setFinanceAddress(salesAddress);
        }
      }
    }, [initialData?.financeAddressSameAsSales]);

    // Update address when sales address prop changes — only when flag is true
    useEffect(() => {
      if (salesAddress && isSameAsSales) {
        const currentSalesAddress = JSON.stringify(salesAddress);
        if (prevSalesAddressRef.current !== currentSalesAddress) {
          prevSalesAddressRef.current = currentSalesAddress;
          setFinanceAddress(salesAddress);
        }
      }
    }, [salesAddress, isSameAsSales]);

    // Update shifts when sales shifts prop changes (only if actually different and same toggle is on)
    useEffect(() => {
      if (salesShifts && financeShiftsSameAsSales) {
        const currentSalesShifts = JSON.stringify(salesShifts);
        if (prevSalesShiftsRef.current !== currentSalesShifts) {
          prevSalesShiftsRef.current = currentSalesShifts;
          setFinanceShifts(salesShifts);
        }
      }
    }, [salesShifts, financeShiftsSameAsSales]);

    // Update holidays when sales holidays prop changes (only if actually different and same toggle is on)
    useEffect(() => {
      if (salesHolidays && financeHolidaysSameAsSales) {
        const currentSalesHolidays = JSON.stringify(salesHolidays);
        if (prevSalesHolidaysRef.current !== currentSalesHolidays) {
          prevSalesHolidaysRef.current = currentSalesHolidays;
          setFinanceHolidays(salesHolidays);
        }
      }
    }, [salesHolidays, financeHolidaysSameAsSales]);

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        setTouchedFields({
          financePhone: true,
          financeAddress: true,
        });
        validateAllFields();
      },
      scrollToError: () => {
        if (phoneFieldRef.current && errors.financePhone) {
          phoneFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (addressFieldRef.current && errors.financeAddress) {
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
        case 'financePhone':
          error = validatePhone(value as string);
          break;
        case 'financeAddress':
          error = validateAddress(financeAddress);
          break;
        default:
          break;
      }
      return error;
    };

    // Helper function to validate all fields
    const validateAllFields = () => {
      if (isOptional) {
        setErrors({ financePhone: '', financeAddress: '' });
        return;
      }
      const newErrors = {
        financePhone: validateField('financePhone', financeData.financePhone),
        financeAddress: isSameAsSales
          ? ''
          : validateField('financeAddress', financeAddress),
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
    }, [
      financeData,
      financeAddress,
      isSameAsSales,
      financeShifts,
      financeHolidays,
    ]);

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
        const isdCode = financeData.isdCode || '';
        const contactNo = financeData.financePhone || '';
        const sanitizedIsdCode = isdCode.replace('+', '');
        const sanitizedContactNo =
          isdCode && contactNo.startsWith(sanitizedIsdCode)
            ? contactNo.slice(sanitizedIsdCode.length)
            : contactNo;

        onFormChange({
          financePhone: sanitizedContactNo,
          isdCode,
          financeAddress,
          financeAddressSameAsSales: isSameAsSales,
          financeShifts,
          financeHolidays,
          financeShiftsSameAsSales,
          financeHolidaysSameAsSales,
        });
      }
    }, [
      financeData,
      financeAddress,
      isSameAsSales,
      financeShifts,
      financeHolidays,
      financeShiftsSameAsSales,
      financeHolidaysSameAsSales,
    ]);

    const handleAddressToggle = () => {
      const newIsSameAsSales = !isSameAsSales;
      setIsSameAsSales(newIsSameAsSales);

      if (newIsSameAsSales) {
        setFinanceAddress(salesAddress);
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
        financeAddress: true,
      }));
    };

    const handleAddressChange = (data: any) => {
      setFinanceAddress({
        address: data.address,
        geoCoordinates: data.coordinates,
      });
      setTouchedFields((prev) => ({
        ...prev,
        financeAddress: true,
      }));
      setIsAddressModalOpen(false);
    };

    const shouldShowError = (fieldName: keyof typeof errors) => {
      if (fieldName === 'financeAddress' && isSameAsSales) {
        return false;
      }
      return touchedFields[fieldName] && errors[fieldName];
    };

    return (
      <>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold leading-6 text-[#333333]">
              Finance Department
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
              key="finance-phone-input"
              specialLabel=""
              value={String(financeData?.financePhone ?? '')}
              containerClass="rooftop-phone-input"
              enableSearch
              country={'us'}
              placeholder="Enter phone number"
              disabled={disabledFields.financePhone}
              onChange={(phone: string, data: any) => {
                const safePhone = String(phone ?? '');
                const dialCode = data?.dialCode || '';
                setFinanceData((prev) => ({
                  ...prev,
                  financePhone: safePhone,
                  isdCode: dialCode ? `+${dialCode}` : '',
                }));
                handleFieldChange('financePhone', safePhone);
              }}
              onBlur={() =>
                handleBlur(
                  'financePhone',
                  String(financeData?.financePhone ?? '')
                )
              }
            />
            {touchedFields.financePhone && errors.financePhone ? (
              <div className="flex items-center gap-1">
                <IoWarning className="h-4 w-4 text-[#c31812]" />
                <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                  {errors.financePhone}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2" ref={addressFieldRef}>
            <span
              className={`text-sm font-medium leading-5 ${
                shouldShowError('financeAddress')
                  ? 'text-[#c31812]'
                  : 'text-[#666666]'
              }`}
            >
              Finance Department Address
              {!isOptional && !isSameAsSales && (
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
                      isSameAsSales
                        ? 'bg-[#4600f2]'
                        : 'border border-[#e6e6e6] bg-white'
                    }`}
                  >
                    {isSameAsSales && (
                      <IoCheckmark className="h-4 w-4 font-medium text-white" />
                    )}
                  </div>
                </button>
                <span className="text-sm font-semibold leading-5 text-[#111]">
                  Same as Sales address
                </span>
              </div>

              {!isSameAsSales && (
                <>
                  <LocationInputField
                    key="financeAddress"
                    value={buildAddress(financeAddress?.address)}
                    onChangeClick={() => {
                      setIsAddressModalOpen(true);
                      setTouchedFields((prev) => ({
                        ...prev,
                        financeAddress: true,
                      }));
                    }}
                    placeholder="Select a location"
                    isSearchMode={false}
                  />
                  {shouldShowError('financeAddress') && (
                    <div className="flex items-center gap-1">
                      <IoWarning className="h-4 w-4 text-[#c31812]" />
                      <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                        {errors.financeAddress}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <ShiftAndHoliday
              category="finance"
              operatingHours={
                financeShiftsSameAsSales
                  ? (salesShifts ?? DEFAULT_AVAILABILITY_HOURS)
                  : financeShifts
              }
              updateOperatingHours={(hours) => setFinanceShifts(hours)}
              isSameAsParent={financeShiftsSameAsSales}
              onToggleSameAsParent={() =>
                setFinanceShiftsSameAsSales(!financeShiftsSameAsSales)
              }
              holidays={
                financeHolidaysSameAsSales
                  ? (salesHolidays ?? [])
                  : financeHolidays
              }
              updateHolidays={(holidays) => setFinanceHolidays(holidays)}
              isSameAsParentHoliday={financeHolidaysSameAsSales}
              onToggleSameAsParentHoliday={() =>
                setFinanceHolidaysSameAsSales(!financeHolidaysSameAsSales)
              }
            />
          </div>
        </div>

        {isAddressModalOpen && (
          <OnboardingLocationPicker
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onConfirm={handleAddressChange}
            initialLocation={financeAddress?.address}
            mapCenter={financeAddress?.geoCoordinates}
          />
        )}
      </>
    );
  }
);

FinanceDepartment.displayName = 'FinanceDepartment';
