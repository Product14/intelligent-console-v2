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
import { FeatureToggles } from '@/components/settings/agent-shared/feature-toggles';

interface ServiceAddress {
  address?: any;
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface ServiceDepartmentData {
  servicePhone: string;
  isdCode: string;
  serviceAddress: ServiceAddress;
  serviceAddressSameAsSales: boolean;
  serviceShifts: RequestPayloadAvailabilityHours;
  serviceHolidays: RequestPayloadHoliday[];
  serviceShiftsSameAsSales: boolean;
  serviceHolidaysSameAsSales: boolean;
}

interface ServiceDepartmentProps {
  onFormChange?: (data: ServiceDepartmentData) => void;
  onErrorsChange?: (data: {
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  }) => void;
  initialData?: ServiceDepartmentData;
  salesAddress?: ServiceAddress;
  initialAddress?: ServiceAddress;
  salesShifts?: RequestPayloadAvailabilityHours;
  salesHolidays?: RequestPayloadHoliday[];
  isOptional?: boolean;
}

const validatePhone = (phone: string): string => {
  if (!phone || phone.trim() === '') {
    return 'Service department phone number is required';
  }
  // Basic validation - phone should have at least 10 digits (excluding country code)
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return 'Please enter a valid service department phone number';
  }
  return '';
};

const validateAddress = (address: ServiceAddress | undefined): string => {
  if (!address) {
    return 'Service department address is required';
  }
  const hasGeoCoordinates =
    address.geoCoordinates?.lat && address.geoCoordinates?.lng;
  if (!hasGeoCoordinates) {
    return 'Please select a valid service department address with coordinates';
  }
  return '';
};

export const ServiceDepartment = forwardRef<
  {
    showAllErrors: () => void;
    scrollToError: () => void;
  },
  ServiceDepartmentProps
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
    }: ServiceDepartmentProps,
    ref
  ) => {
    const [isSameAsSales, setIsSameAsSales] = useState(
      initialData?.serviceAddressSameAsSales ?? true
    );
    const [serviceAddress, setServiceAddress] = useState<ServiceAddress>(
      initialAddress ?? initialData?.serviceAddress ?? salesAddress
    );
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [serviceShifts, setServiceShifts] =
      useState<RequestPayloadAvailabilityHours>(
        initialData?.serviceShifts ?? salesShifts ?? DEFAULT_AVAILABILITY_HOURS
      );
    const [serviceHolidays, setServiceHolidays] = useState<
      RequestPayloadHoliday[]
    >(initialData?.serviceHolidays ?? salesHolidays ?? []);
    const [serviceShiftsSameAsSales, setServiceShiftsSameAsSales] = useState(
      initialData?.serviceShiftsSameAsSales ?? true
    );
    const [serviceHolidaysSameAsSales, setServiceHolidaysSameAsSales] =
      useState(initialData?.serviceHolidaysSameAsSales ?? true);

    const [serviceData, setServiceData] = useState<ServiceDepartmentData>({
      servicePhone: initialData?.servicePhone || '',
      isdCode: initialData?.isdCode || '',
      serviceAddress:
        initialAddress ?? initialData?.serviceAddress ?? salesAddress,
      serviceAddressSameAsSales: initialData?.serviceAddressSameAsSales ?? true,
      serviceShifts:
        initialData?.serviceShifts ?? salesShifts ?? DEFAULT_AVAILABILITY_HOURS,
      serviceHolidays: initialData?.serviceHolidays ?? salesHolidays ?? [],
      serviceShiftsSameAsSales: initialData?.serviceShiftsSameAsSales ?? true,
      serviceHolidaysSameAsSales:
        initialData?.serviceHolidaysSameAsSales ?? true,
    });

    const [errors, setErrors] = useState({
      servicePhone: '',
      serviceAddress: '',
    });

    const [touchedFields, setTouchedFields] = useState({
      servicePhone: false,
      serviceAddress: false,
    });

    const [disabledFields] = useState({
      servicePhone: false,
    });

    const phoneFieldRef = useRef<HTMLDivElement>(null);
    const addressFieldRef = useRef<HTMLDivElement>(null);
    const prevSalesAddressRef = useRef<string>(JSON.stringify(salesAddress));
    const prevSalesShiftsRef = useRef<string>(JSON.stringify(salesShifts));
    const prevSalesHolidaysRef = useRef<string>(JSON.stringify(salesHolidays));
    const prevInitialDataFlagRef = useRef<boolean | undefined>(
      initialData?.serviceAddressSameAsSales
    );

    // Sync the "same as sales" flag and address when initialData changes externally
    // (e.g. after fetchedAddresses and addressFlags are resolved from the API)
    useEffect(() => {
      const newFlag = initialData?.serviceAddressSameAsSales;
      if (newFlag !== undefined && prevInitialDataFlagRef.current !== newFlag) {
        prevInitialDataFlagRef.current = newFlag;
        setIsSameAsSales(newFlag);
        if (!newFlag && initialData?.serviceAddress) {
          setServiceAddress(initialData.serviceAddress);
        } else if (newFlag && salesAddress) {
          setServiceAddress(salesAddress);
        }
      }
    }, [initialData?.serviceAddressSameAsSales]);

    // Update address when sales address prop changes — only when flag is true
    useEffect(() => {
      if (salesAddress && isSameAsSales) {
        const currentSalesAddress = JSON.stringify(salesAddress);
        if (prevSalesAddressRef.current !== currentSalesAddress) {
          prevSalesAddressRef.current = currentSalesAddress;
          setServiceAddress(salesAddress);
        }
      }
    }, [salesAddress, isSameAsSales]);

    // Update shifts when sales shifts prop changes (only if actually different and same toggle is on)
    useEffect(() => {
      if (salesShifts && serviceShiftsSameAsSales) {
        const currentSalesShifts = JSON.stringify(salesShifts);
        if (prevSalesShiftsRef.current !== currentSalesShifts) {
          prevSalesShiftsRef.current = currentSalesShifts;
          setServiceShifts(salesShifts);
        }
      }
    }, [salesShifts, serviceShiftsSameAsSales]);

    // Update holidays when sales holidays prop changes (only if actually different and same toggle is on)
    useEffect(() => {
      if (salesHolidays && serviceHolidaysSameAsSales) {
        const currentSalesHolidays = JSON.stringify(salesHolidays);
        if (prevSalesHolidaysRef.current !== currentSalesHolidays) {
          prevSalesHolidaysRef.current = currentSalesHolidays;
          setServiceHolidays(salesHolidays);
        }
      }
    }, [salesHolidays, serviceHolidaysSameAsSales]);

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        setTouchedFields({
          servicePhone: true,
          serviceAddress: true,
        });
        validateAllFields();
      },
      scrollToError: () => {
        if (phoneFieldRef.current && errors.servicePhone) {
          phoneFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (addressFieldRef.current && errors.serviceAddress) {
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
        case 'servicePhone':
          error = validatePhone(value as string);
          break;
        case 'serviceAddress':
          error = validateAddress(serviceAddress);
          break;
        default:
          break;
      }
      return error;
    };

    // Helper function to validate all fields
    const validateAllFields = () => {
      if (isOptional) {
        setErrors({ servicePhone: '', serviceAddress: '' });
        return;
      }
      const newErrors = {
        servicePhone: validateField('servicePhone', serviceData.servicePhone),
        serviceAddress: isSameAsSales
          ? ''
          : validateField('serviceAddress', serviceAddress),
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
      serviceData,
      serviceAddress,
      isSameAsSales,
      serviceShifts,
      serviceHolidays,
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
        const isdCode = serviceData.isdCode || '';
        const contactNo = serviceData.servicePhone || '';
        const sanitizedIsdCode = isdCode.replace('+', '');
        const sanitizedContactNo =
          isdCode && contactNo.startsWith(sanitizedIsdCode)
            ? contactNo.slice(sanitizedIsdCode.length)
            : contactNo;

        onFormChange({
          servicePhone: sanitizedContactNo,
          isdCode,
          serviceAddress,
          serviceAddressSameAsSales: isSameAsSales,
          serviceShifts,
          serviceHolidays,
          serviceShiftsSameAsSales,
          serviceHolidaysSameAsSales,
        });
      }
    }, [
      serviceData,
      serviceAddress,
      isSameAsSales,
      serviceShifts,
      serviceHolidays,
      serviceShiftsSameAsSales,
      serviceHolidaysSameAsSales,
    ]);

    const handleAddressToggle = () => {
      const newIsSameAsSales = !isSameAsSales;
      setIsSameAsSales(newIsSameAsSales);

      if (newIsSameAsSales) {
        setServiceAddress(salesAddress);
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
        serviceAddress: true,
      }));
    };

    const handleAddressChange = (data: any) => {
      setServiceAddress({
        address: data.address,
        geoCoordinates: data.coordinates,
      });
      setTouchedFields((prev) => ({
        ...prev,
        serviceAddress: true,
      }));
      setIsAddressModalOpen(false);
    };

    const shouldShowError = (fieldName: keyof typeof errors) => {
      if (fieldName === 'serviceAddress' && isSameAsSales) {
        return false;
      }
      return touchedFields[fieldName] && errors[fieldName];
    };

    return (
      <>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold leading-6 text-[#333333]">
              Service Department
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
              key="service-phone-input"
              specialLabel=""
              value={String(serviceData?.servicePhone ?? '')}
              containerClass="rooftop-phone-input"
              enableSearch
              country={'us'}
              placeholder="Enter phone number"
              disabled={disabledFields.servicePhone}
              onChange={(phone: string, data: any) => {
                const safePhone = String(phone ?? '');
                const dialCode = data?.dialCode || '';
                setServiceData((prev) => ({
                  ...prev,
                  servicePhone: safePhone,
                  isdCode: dialCode ? `+${dialCode}` : '',
                }));
                handleFieldChange('servicePhone', safePhone);
              }}
              onBlur={() =>
                handleBlur(
                  'servicePhone',
                  String(serviceData?.servicePhone ?? '')
                )
              }
            />
            {touchedFields.servicePhone && errors.servicePhone ? (
              <div className="flex items-center gap-1">
                <IoWarning className="h-4 w-4 text-[#c31812]" />
                <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                  {errors.servicePhone}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2" ref={addressFieldRef}>
            <span
              className={`text-sm font-medium leading-5 ${
                shouldShowError('serviceAddress')
                  ? 'text-[#c31812]'
                  : 'text-[#666666]'
              }`}
            >
              Service Department Address
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
                    key="serviceAddress"
                    value={buildAddress(serviceAddress?.address)}
                    onChangeClick={() => {
                      setIsAddressModalOpen(true);
                      setTouchedFields((prev) => ({
                        ...prev,
                        serviceAddress: true,
                      }));
                    }}
                    placeholder="Select a location"
                    isSearchMode={false}
                  />
                  {shouldShowError('serviceAddress') && (
                    <div className="flex items-center gap-1">
                      <IoWarning className="h-4 w-4 text-[#c31812]" />
                      <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                        {errors.serviceAddress}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <ShiftAndHoliday
              category="service"
              operatingHours={
                serviceShiftsSameAsSales
                  ? (salesShifts ?? DEFAULT_AVAILABILITY_HOURS)
                  : serviceShifts
              }
              updateOperatingHours={(hours) => setServiceShifts(hours)}
              isSameAsParent={serviceShiftsSameAsSales}
              onToggleSameAsParent={() =>
                setServiceShiftsSameAsSales(!serviceShiftsSameAsSales)
              }
              holidays={
                serviceHolidaysSameAsSales
                  ? (salesHolidays ?? [])
                  : serviceHolidays
              }
              updateHolidays={(holidays) => setServiceHolidays(holidays)}
              isSameAsParentHoliday={serviceHolidaysSameAsSales}
              onToggleSameAsParentHoliday={() =>
                setServiceHolidaysSameAsSales(!serviceHolidaysSameAsSales)
              }
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <FeatureToggles
              subStepId="service:capabilities"
              title="Service Capabilities"
              description="What service conveniences does this department offer? The agent communicates these as facts to callers."
              items={[
                {
                  id: 'loaner',
                  label: 'Loaner Vehicle',
                  desc: 'A loaner car is available while the customer’s vehicle is in service.',
                },
                {
                  id: 'pickup-drop',
                  label: 'Pickup & Drop',
                  desc: 'The dealership picks up and drops off the customer’s vehicle.',
                },
                {
                  id: 'drop-box',
                  label: 'Drop Box',
                  desc: 'After-hours key drop-off is available at the dealership.',
                },
                {
                  id: 'roadside',
                  label: 'Roadside Assistance',
                  desc: 'Roadside assistance is offered to service customers.',
                },
              ]}
              defaultsOn={false}
            />
          </div>
        </div>

        {isAddressModalOpen && (
          <OnboardingLocationPicker
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            onConfirm={handleAddressChange}
            initialLocation={serviceAddress?.address}
            mapCenter={serviceAddress?.geoCoordinates}
          />
        )}
      </>
    );
  }
);

ServiceDepartment.displayName = 'ServiceDepartment';
