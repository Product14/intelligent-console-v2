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

interface PartsAddress {
  address?: any;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface PartsDepartmentData {
  partsPhone: string;
  isdCode: string;
  partsAddress: PartsAddress;
  partsAddressSameAsService: boolean;
  partsShifts: RequestPayloadAvailabilityHours;
  partsHolidays: RequestPayloadHoliday[];
  partsShiftsSameAsService: boolean;
  partsHolidaysSameAsService: boolean;
}

interface PartsDepartmentProps {
  onFormChange?: (data: PartsDepartmentData) => void;
  onErrorsChange?: (data: {
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  }) => void;
  initialData?: PartsDepartmentData;
  serviceAddress?: PartsAddress;
  initialAddress?: PartsAddress;
  serviceShifts?: RequestPayloadAvailabilityHours;
  serviceHolidays?: RequestPayloadHoliday[];
  isOptional?: boolean;
}

const validatePhone = (phone: string): string => {
  if (!phone || phone.trim() === '') {
    return 'Parts department phone number is required';
  }
  // Basic validation - phone should have at least 10 digits (excluding country code)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return 'Please enter a valid parts department phone number';
  }
  return '';
};

const validateAddress = (address: PartsAddress | undefined): string => {
  if (!address) {
    return 'Parts department address is required';
  }
  const hasGeoCoordinates =
    address.geoCoordinates?.lat && address.geoCoordinates?.lng;
  if (!hasGeoCoordinates) {
    return 'Please select a valid parts department address with coordinates';
  }
  return '';
};

export const PartsDepartment = forwardRef<
  {
    showAllErrors: () => void;
    scrollToError: () => void;
  },
  PartsDepartmentProps
>(
  (
    {
      onFormChange,
      onErrorsChange,
      initialData,
      serviceAddress,
      initialAddress,
      serviceShifts,
      serviceHolidays,
      isOptional = false,
    }: PartsDepartmentProps,
    ref
  ) => {
    const [isSameAsService, setIsSameAsService] = useState(
      initialData?.partsAddressSameAsService ?? true
    );
    const [partsAddress, setPartsAddress] = useState<PartsAddress>(
      initialAddress ?? initialData?.partsAddress ?? serviceAddress
    );
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [partsShifts, setPartsShifts] =
      useState<RequestPayloadAvailabilityHours>(
        initialData?.partsShifts ?? serviceShifts ?? DEFAULT_AVAILABILITY_HOURS
      );
    const [partsHolidays, setPartsHolidays] = useState<RequestPayloadHoliday[]>(
      initialData?.partsHolidays ?? serviceHolidays ?? []
    );
    const [partsShiftsSameAsService, setPartsShiftsSameAsService] = useState(
      initialData?.partsShiftsSameAsService ?? true
    );
    const [partsHolidaysSameAsService, setPartsHolidaysSameAsService] =
      useState(initialData?.partsHolidaysSameAsService ?? true);

    const [partsData, setPartsData] = useState<PartsDepartmentData>({
      partsPhone: initialData?.partsPhone || '',
      isdCode: initialData?.isdCode || '',
      partsAddress:
        initialAddress ?? initialData?.partsAddress ?? serviceAddress,
      partsAddressSameAsService: initialData?.partsAddressSameAsService ?? true,
      partsShifts:
        initialData?.partsShifts ?? serviceShifts ?? DEFAULT_AVAILABILITY_HOURS,
      partsHolidays: initialData?.partsHolidays ?? serviceHolidays ?? [],
      partsShiftsSameAsService: initialData?.partsShiftsSameAsService ?? true,
      partsHolidaysSameAsService:
        initialData?.partsHolidaysSameAsService ?? true,
    });

    const [errors, setErrors] = useState({
      partsPhone: '',
      partsAddress: '',
    });

    const [touchedFields, setTouchedFields] = useState({
      partsPhone: false,
      partsAddress: false,
    });

    const [disabledFields] = useState({
      partsPhone: false,
    });

    const phoneFieldRef = useRef<HTMLDivElement>(null);
    const addressFieldRef = useRef<HTMLDivElement>(null);
    const prevServiceAddressRef = useRef<string>(
      JSON.stringify(serviceAddress)
    );
    const prevServiceShiftsRef = useRef<string>(JSON.stringify(serviceShifts));
    const prevServiceHolidaysRef = useRef<string>(
      JSON.stringify(serviceHolidays)
    );
    const prevInitialDataFlagRef = useRef<boolean | undefined>(
      initialData?.partsAddressSameAsService
    );

    // Sync the "same as service" flag and address when initialData changes externally
    // (e.g. after fetchedAddresses and addressFlags are resolved from the API)
    useEffect(() => {
      const newFlag = initialData?.partsAddressSameAsService;
      if (newFlag !== undefined && prevInitialDataFlagRef.current !== newFlag) {
        prevInitialDataFlagRef.current = newFlag;
        setIsSameAsService(newFlag);
        if (!newFlag && initialData?.partsAddress) {
          setPartsAddress(initialData.partsAddress);
        } else if (newFlag && serviceAddress) {
          setPartsAddress(serviceAddress);
        }
      }
    }, [initialData?.partsAddressSameAsService]);

    // Update address when service address prop changes — only when flag is true
    useEffect(() => {
      if (serviceAddress && isSameAsService) {
        const currentServiceAddress = JSON.stringify(serviceAddress);
        if (prevServiceAddressRef.current !== currentServiceAddress) {
          prevServiceAddressRef.current = currentServiceAddress;
          setPartsAddress(serviceAddress);
        }
      }
    }, [serviceAddress, isSameAsService]);

    // Update shifts when service shifts prop changes (only if actually different and same toggle is on)
    useEffect(() => {
      if (serviceShifts && partsShiftsSameAsService) {
        const currentServiceShifts = JSON.stringify(serviceShifts);
        if (prevServiceShiftsRef.current !== currentServiceShifts) {
          prevServiceShiftsRef.current = currentServiceShifts;
          setPartsShifts(serviceShifts);
        }
      }
    }, [serviceShifts, partsShiftsSameAsService]);

    // Update holidays when service holidays prop changes (only if actually different and same toggle is on)
    useEffect(() => {
      if (serviceHolidays && partsHolidaysSameAsService) {
        const currentServiceHolidays = JSON.stringify(serviceHolidays);
        if (prevServiceHolidaysRef.current !== currentServiceHolidays) {
          prevServiceHolidaysRef.current = currentServiceHolidays;
          setPartsHolidays(serviceHolidays);
        }
      }
    }, [serviceHolidays, partsHolidaysSameAsService]);

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        setTouchedFields({
          partsPhone: true,
          partsAddress: true,
        });
        validateAllFields();
      },
      scrollToError: () => {
        if (phoneFieldRef.current && errors.partsPhone) {
          phoneFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (addressFieldRef.current && errors.partsAddress) {
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
        case 'partsPhone':
          error = validatePhone(value as string);
          break;
        case 'partsAddress':
          error = validateAddress(partsAddress);
          break;
        default:
          break;
      }
      return error;
    };

    // Helper function to validate all fields
    const validateAllFields = () => {
      if (isOptional) {
        setErrors({ partsPhone: '', partsAddress: '' });
        return;
      }
      const newErrors = {
        partsPhone: validateField('partsPhone', partsData.partsPhone),
        partsAddress: isSameAsService
          ? ''
          : validateField('partsAddress', partsAddress),
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
    }, [partsData, partsAddress, isSameAsService, partsShifts, partsHolidays]);

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
        const isdCode = partsData.isdCode || '';
        const contactNo = partsData.partsPhone || '';
        const sanitizedIsdCode = isdCode.replace('+', '');
        const sanitizedContactNo =
          isdCode && contactNo.startsWith(sanitizedIsdCode)
            ? contactNo.slice(sanitizedIsdCode.length)
            : contactNo;

        onFormChange({
          partsPhone: sanitizedContactNo,
          isdCode,
          partsAddress,
          partsAddressSameAsService: isSameAsService,
          partsShifts,
          partsHolidays,
          partsShiftsSameAsService,
          partsHolidaysSameAsService,
        });
      }
    }, [
      partsData,
      partsAddress,
      isSameAsService,
      partsShifts,
      partsHolidays,
      partsShiftsSameAsService,
      partsHolidaysSameAsService,
    ]);

    const handleAddressToggle = () => {
      const newIsSameAsService = !isSameAsService;
      setIsSameAsService(newIsSameAsService);

      if (newIsSameAsService) {
        setPartsAddress(serviceAddress);
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
        partsAddress: true,
      }));
    };

    const handleAddressChange = (data: any) => {
      setPartsAddress({
        address: data.address,
        geoCoordinates: data.coordinates,
      });
      setTouchedFields((prev) => ({
        ...prev,
        partsAddress: true,
      }));
      setIsAddressModalOpen(false);
    };

    const shouldShowError = (fieldName: keyof typeof errors) => {
      if (fieldName === 'partsAddress' && isSameAsService) {
        return false;
      }
      return touchedFields[fieldName] && errors[fieldName];
    };

    return (
      <>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold leading-6 text-[#333333]">
              Parts Department
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
              key="parts-phone-input"
              specialLabel=""
              value={String(partsData?.partsPhone ?? '')}
              containerClass="rooftop-phone-input"
              enableSearch
              country={'us'}
              placeholder="Enter phone number"
              disabled={disabledFields.partsPhone}
              onChange={(phone: string, data: any) => {
                const safePhone = String(phone ?? '');
                const dialCode = data?.dialCode || '';
                setPartsData((prev) => ({
                  ...prev,
                  partsPhone: safePhone,
                  isdCode: dialCode ? `+${dialCode}` : '',
                }));
                handleFieldChange('partsPhone', safePhone);
              }}
              onBlur={() =>
                handleBlur('partsPhone', String(partsData?.partsPhone ?? ''))
              }
            />
            {touchedFields.partsPhone && errors.partsPhone ? (
              <div className="flex items-center gap-1">
                <IoWarning className="h-4 w-4 text-[#c31812]" />
                <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                  {errors.partsPhone}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2" ref={addressFieldRef}>
            <span
              className={`text-sm font-medium leading-5 ${
                shouldShowError('partsAddress')
                  ? 'text-[#c31812]'
                  : 'text-[#666666]'
              }`}
            >
              Parts Department Address
              {!isOptional && !isSameAsService && (
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
                      isSameAsService
                        ? 'bg-[#4600f2]'
                        : 'border border-[#e6e6e6] bg-white'
                    }`}
                  >
                    {isSameAsService && (
                      <IoCheckmark className="h-4 w-4 font-medium text-white" />
                    )}
                  </div>
                </button>
                <span className="text-sm font-semibold leading-5 text-[#111]">
                  Same as Service address
                </span>
              </div>

              {!isSameAsService && (
                <>
                  <LocationInputField
                    key="partsAddress"
                    value={buildAddress(partsAddress?.address)}
                    onChangeClick={() => {
                      setIsAddressModalOpen(true);
                      setTouchedFields((prev) => ({
                        ...prev,
                        partsAddress: true,
                      }));
                    }}
                    placeholder="Select a location"
                    isSearchMode={false}
                  />
                  {shouldShowError('partsAddress') && (
                    <div className="flex items-center gap-1">
                      <IoWarning className="h-4 w-4 text-[#c31812]" />
                      <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                        {errors.partsAddress}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <ShiftAndHoliday
              category="parts"
              operatingHours={
                partsShiftsSameAsService
                  ? (serviceShifts ?? DEFAULT_AVAILABILITY_HOURS)
                  : partsShifts
              }
              updateOperatingHours={(hours) => setPartsShifts(hours)}
              isSameAsParent={partsShiftsSameAsService}
              onToggleSameAsParent={() =>
                setPartsShiftsSameAsService(!partsShiftsSameAsService)
              }
              holidays={
                partsHolidaysSameAsService
                  ? (serviceHolidays ?? [])
                  : partsHolidays
              }
              updateHolidays={(holidays) => setPartsHolidays(holidays)}
              isSameAsParentHoliday={partsHolidaysSameAsService}
              onToggleSameAsParentHoliday={() =>
                setPartsHolidaysSameAsService(!partsHolidaysSameAsService)
              }
            />
          </div>
        </div>

        {isAddressModalOpen && (
          <OnboardingLocationPicker
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onConfirm={handleAddressChange}
            initialLocation={partsAddress?.address}
            mapCenter={partsAddress?.geoCoordinates}
          />
        )}
      </>
    );
  }
);

PartsDepartment.displayName = 'PartsDepartment';
