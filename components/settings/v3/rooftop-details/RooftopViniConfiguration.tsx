'use client';

import {
  DEFAULT_AVAILABILITY_HOURS,
  HolidayData,
  WorkingShiftData,
} from '@/app-models-settings/WorkingShift';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { fetchViniConfigAPI } from '@/services/settings/vini-config.service';
import {
  RequestPayloadCommonConfigs,
  RequestPayloadDepartmentContacts,
  RequestPayloadServiceAddress,
} from '@/types/settings/vini-config';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IoHomeSharp } from 'react-icons/io5';
import { toast } from 'react-toastify';

import { buildAddress } from '@spyne-console/components/onboarding/rooftop-profile/location-parser.js';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import {
  convertFormDataToCommonConfig,
  convertHolidaysToState,
  convertWorkShiftTimingsToState,
} from '@/helpers-settings/vini-config-converter';

import { FinanceDepartment } from './FinanceDepartment';
import { PartsDepartment } from './PartsDepartment';
import { SalesDepartment } from './SalesDepartment';
import { ServiceDepartment } from './ServiceDepartment';

export interface RooftopViniConfigFormData {
  commonConfig: RequestPayloadCommonConfigs;
  salesDepartment: {
    salesPhone: string;
    isdCode: string;
    salesAddress: any;
    salesAddressSameAsRooftop: boolean;
    salesShifts: any;
    salesHolidays: any[];
  };
  serviceDepartment: {
    servicePhone: string;
    isdCode: string;
    serviceAddress: any;
    serviceAddressSameAsSales: boolean;
    serviceShifts: any;
    serviceHolidays: any[];
    serviceShiftsSameAsSales: boolean;
    serviceHolidaysSameAsSales: boolean;
  };
  partsDepartment: {
    partsPhone: string;
    isdCode: string;
    partsAddress: any;
    partsAddressSameAsService: boolean;
    partsShifts: any;
    partsHolidays: any[];
    partsShiftsSameAsService: boolean;
    partsHolidaysSameAsService: boolean;
  };
  financeDepartment: {
    financePhone: string;
    isdCode: string;
    financeAddress: any;
    financeAddressSameAsSales: boolean;
    financeShifts: any;
    financeHolidays: any[];
    financeShiftsSameAsSales: boolean;
    financeHolidaysSameAsSales: boolean;
  };
}

interface RooftopViniConfigurationProps {
  onFormChange?: (data: RooftopViniConfigFormData) => void;
  onErrorsChange?: (data: {
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  }) => void;
  rooftopAddress?: RequestPayloadServiceAddress;
  initialAddresses?: {
    salesAddress: any;
    serviceAddress: any;
    partsAddress: any;
    financeAddress: any;
  };
  addressFlags?: {
    salesAddressSameAsRooftop: boolean;
    serviceAddressSameAsSales: boolean;
    partsAddressSameAsService: boolean;
    financeAddressSameAsSales: boolean;
  };
}

const RooftopViniConfiguration = forwardRef(
  (
    {
      onFormChange,
      onErrorsChange,
      rooftopAddress,
      initialAddresses,
      addressFlags,
    }: RooftopViniConfigurationProps,
    ref
  ) => {
    const { enterpriseId, teamId } = useUserDetails();
    const { activeAgentTypeId } = useActiveAgent();
    const { agentTypes } = useAgentTypesRedux({});
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    const activeAgentType = useMemo(() => {
      if (!activeAgentTypeId || !agentTypes.length) return null;
      return (
        agentTypes
          .find((at) => at.agentTypeId === activeAgentTypeId)
          ?.agentType?.toLowerCase() ?? null
      );
    }, [activeAgentTypeId, agentTypes]);

    const isSalesAgent = activeAgentType === 'sales';
    const isServiceAgent = activeAgentType === 'service';

    const salesDepartmentRef = useRef<{
      showAllErrors: () => void;
      scrollToError: () => void;
    }>(null);
    const serviceDepartmentRef = useRef<{
      showAllErrors: () => void;
      scrollToError: () => void;
    }>(null);
    const partsDepartmentRef = useRef<{
      showAllErrors: () => void;
      scrollToError: () => void;
    }>(null);
    const financeDepartmentRef = useRef<{
      showAllErrors: () => void;
      scrollToError: () => void;
    }>(null);

    // Track previous prop values to detect external changes
    const prevInitialAddressesRef = useRef<any>(null);
    const prevAddressFlagsRef = useRef<any>(null);
    const prevRooftopAddressRef = useRef<any>(null);

    // Helper to compute initial address based on "sameAs" flag
    const computeInitialAddress = (
      fetchedAddress: any,
      isSameAs: boolean,
      fallbackAddress: any
    ) => {
      // If we have a fetched address, use it
      if (fetchedAddress) {
        return fetchedAddress;
      }
      // If sameAs flag is true, use fallback address
      if (isSameAs) {
        return fallbackAddress;
      }
      // Otherwise, return fallback address as default
      return fallbackAddress;
    };

    // Sales Department State
    const [salesDepartmentData, setSalesDepartmentData] = useState<{
      salesPhone: string;
      isdCode: string;
      salesAddress: any;
      salesAddressSameAsRooftop: boolean;
      salesShifts: any;
      salesHolidays: any[];
    }>({
      salesPhone: '',
      isdCode: '',
      salesAddress: computeInitialAddress(
        initialAddresses?.salesAddress,
        addressFlags?.salesAddressSameAsRooftop ?? true,
        rooftopAddress
      ),
      salesAddressSameAsRooftop:
        addressFlags?.salesAddressSameAsRooftop ?? true,
      salesShifts: DEFAULT_AVAILABILITY_HOURS,
      salesHolidays: [],
    });

    const [salesDepartmentErrors, setSalesDepartmentErrors] = useState({
      hasErrors: false,
      isValid: true,
      errors: {},
    });

    // Service Department State
    const [serviceDepartmentData, setServiceDepartmentData] = useState<{
      servicePhone: string;
      isdCode: string;
      serviceAddress: any;
      serviceAddressSameAsSales: boolean;
      serviceShifts: any;
      serviceHolidays: any[];
      serviceShiftsSameAsSales: boolean;
      serviceHolidaysSameAsSales: boolean;
    }>({
      servicePhone: '',
      isdCode: '',
      serviceAddress: computeInitialAddress(
        initialAddresses?.serviceAddress,
        addressFlags?.serviceAddressSameAsSales ?? true,
        initialAddresses?.salesAddress || rooftopAddress
      ),
      serviceAddressSameAsSales:
        addressFlags?.serviceAddressSameAsSales ?? true,
      serviceShifts: DEFAULT_AVAILABILITY_HOURS,
      serviceHolidays: [],
      serviceShiftsSameAsSales: true,
      serviceHolidaysSameAsSales: true,
    });

    const [serviceDepartmentErrors, setServiceDepartmentErrors] = useState({
      hasErrors: false,
      isValid: true,
      errors: {},
    });

    // Parts Department State
    const [partsDepartmentData, setPartsDepartmentData] = useState<{
      partsPhone: string;
      isdCode: string;
      partsAddress: any;
      partsAddressSameAsService: boolean;
      partsShifts: any;
      partsHolidays: any[];
      partsShiftsSameAsService: boolean;
      partsHolidaysSameAsService: boolean;
    }>({
      partsPhone: '',
      isdCode: '',
      partsAddress: computeInitialAddress(
        initialAddresses?.partsAddress,
        addressFlags?.partsAddressSameAsService ?? true,
        initialAddresses?.serviceAddress || rooftopAddress
      ),
      partsAddressSameAsService:
        addressFlags?.partsAddressSameAsService ?? true,
      partsShifts: DEFAULT_AVAILABILITY_HOURS,
      partsHolidays: [],
      partsShiftsSameAsService: true,
      partsHolidaysSameAsService: true,
    });

    const [partsDepartmentErrors, setPartsDepartmentErrors] = useState({
      hasErrors: false,
      isValid: true,
      errors: {},
    });

    // Finance Department State
    const [financeDepartmentData, setFinanceDepartmentData] = useState<{
      financePhone: string;
      isdCode: string;
      financeAddress: any;
      financeAddressSameAsSales: boolean;
      financeShifts: any;
      financeHolidays: any[];
      financeShiftsSameAsSales: boolean;
      financeHolidaysSameAsSales: boolean;
    }>({
      financePhone: '',
      isdCode: '',
      financeAddress: computeInitialAddress(
        initialAddresses?.financeAddress,
        addressFlags?.financeAddressSameAsSales ?? true,
        initialAddresses?.salesAddress || rooftopAddress
      ),
      financeAddressSameAsSales:
        addressFlags?.financeAddressSameAsSales ?? true,
      financeShifts: DEFAULT_AVAILABILITY_HOURS,
      financeHolidays: [],
      financeShiftsSameAsSales: true,
      financeHolidaysSameAsSales: true,
    });

    const [financeDepartmentErrors, setFinanceDepartmentErrors] = useState({
      hasErrors: false,
      isValid: true,
      errors: {},
    });

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        salesDepartmentRef.current?.showAllErrors();
        serviceDepartmentRef.current?.showAllErrors();
        partsDepartmentRef.current?.showAllErrors();
        financeDepartmentRef.current?.showAllErrors();
      },
      scrollToError: () => {
        if (salesDepartmentErrors.hasErrors) {
          salesDepartmentRef.current?.scrollToError();
          return;
        }
        if (serviceDepartmentErrors.hasErrors) {
          serviceDepartmentRef.current?.scrollToError();
          return;
        }
        if (partsDepartmentErrors.hasErrors) {
          partsDepartmentRef.current?.scrollToError();
          return;
        }
        if (financeDepartmentErrors.hasErrors) {
          financeDepartmentRef.current?.scrollToError();
          return;
        }
      },
    }));

    // Working Shifts State
    const [workingShiftsData, setWorkingShiftsData] =
      useState<WorkingShiftData>({
        sales: DEFAULT_AVAILABILITY_HOURS,
        service: {
          sameAsSales: false,
          schedule: DEFAULT_AVAILABILITY_HOURS,
        },
        parts: {
          sameAsService: true,
          schedule: DEFAULT_AVAILABILITY_HOURS,
        },
        finance: {
          sameAsSales: true,
          schedule: DEFAULT_AVAILABILITY_HOURS,
        },
      });

    // Holidays State
    const [holidaysData, setHolidaysData] = useState<HolidayData>({
      sales: [],
      service: {
        sameAsSales: false,
        holidays: [],
      },
      parts: {
        sameAsService: false,
        holidays: [],
      },
      finance: {
        sameAsSales: true,
        holidays: [],
      },
    });

    // Update department addresses when props change (only from external sources)
    useEffect(() => {
      // Check if props actually changed from external sources
      const initialAddressesChanged =
        JSON.stringify(prevInitialAddressesRef.current) !==
        JSON.stringify(initialAddresses);
      const addressFlagsChanged =
        JSON.stringify(prevAddressFlagsRef.current) !==
        JSON.stringify(addressFlags);
      const rooftopAddressChanged =
        JSON.stringify(prevRooftopAddressRef.current) !==
        JSON.stringify(rooftopAddress);

      // Only update if props actually changed from external sources
      if (
        (initialAddressesChanged ||
          addressFlagsChanged ||
          rooftopAddressChanged) &&
        initialAddresses &&
        addressFlags
      ) {
        // Update refs to track current values
        prevInitialAddressesRef.current = initialAddresses;
        prevAddressFlagsRef.current = addressFlags;
        prevRooftopAddressRef.current = rooftopAddress;

        // Update sales address and "same as" flag - use functional update to get latest state
        const newSalesAddress = computeInitialAddress(
          initialAddresses.salesAddress,
          addressFlags.salesAddressSameAsRooftop,
          rooftopAddress
        );
        setSalesDepartmentData((prev) => {
          const addressChanged =
            buildAddress(newSalesAddress?.address) !==
            buildAddress(prev.salesAddress?.address);

          const flagChanged =
            prev.salesAddressSameAsRooftop !==
            addressFlags.salesAddressSameAsRooftop;

          if (!addressChanged && !flagChanged) {
            return prev;
          }

          return {
            ...prev,
            salesAddress: addressChanged ? newSalesAddress : prev.salesAddress,
            salesAddressSameAsRooftop: addressFlags.salesAddressSameAsRooftop,
          };
        });

        // Update service address and "same as" flag - use functional update to get latest state
        const newServiceAddress = computeInitialAddress(
          initialAddresses.serviceAddress,
          addressFlags.serviceAddressSameAsSales,
          initialAddresses.salesAddress || rooftopAddress
        );
        setServiceDepartmentData((prev) => {
          const addressChanged =
            buildAddress(newServiceAddress?.address) !==
            buildAddress(prev.serviceAddress?.address);

          const flagChanged =
            prev.serviceAddressSameAsSales !==
            addressFlags.serviceAddressSameAsSales;

          if (!addressChanged && !flagChanged) {
            return prev;
          }

          return {
            ...prev,
            serviceAddress: addressChanged
              ? newServiceAddress
              : prev.serviceAddress,
            serviceAddressSameAsSales: addressFlags.serviceAddressSameAsSales,
          };
        });

        // Update parts address and "same as" flag - use functional update to get latest state
        const newPartsAddress = computeInitialAddress(
          initialAddresses.partsAddress,
          addressFlags.partsAddressSameAsService,
          initialAddresses.serviceAddress || rooftopAddress
        );
        setPartsDepartmentData((prev) => {
          const addressChanged =
            buildAddress(newPartsAddress?.address) !==
            buildAddress(prev.partsAddress?.address);

          const flagChanged =
            prev.partsAddressSameAsService !==
            addressFlags.partsAddressSameAsService;

          if (!addressChanged && !flagChanged) {
            return prev;
          }

          return {
            ...prev,
            partsAddress: addressChanged ? newPartsAddress : prev.partsAddress,
            partsAddressSameAsService: addressFlags.partsAddressSameAsService,
          };
        });

        // Update finance address and "same as" flag - use functional update to get latest state
        const newFinanceAddress = computeInitialAddress(
          initialAddresses.financeAddress,
          addressFlags.financeAddressSameAsSales,
          initialAddresses.salesAddress || rooftopAddress
        );
        setFinanceDepartmentData((prev) => {
          const addressChanged =
            buildAddress(newFinanceAddress?.address) !==
            buildAddress(prev.financeAddress?.address);

          const flagChanged =
            prev.financeAddressSameAsSales !==
            addressFlags.financeAddressSameAsSales;

          if (!addressChanged && !flagChanged) {
            return prev;
          }

          return {
            ...prev,
            financeAddress: addressChanged
              ? newFinanceAddress
              : prev.financeAddress,
            financeAddressSameAsSales: addressFlags.financeAddressSameAsSales,
          };
        });
      } else if (
        !prevInitialAddressesRef.current &&
        initialAddresses &&
        addressFlags
      ) {
        // Initialize refs on first mount
        prevInitialAddressesRef.current = initialAddresses;
        prevAddressFlagsRef.current = addressFlags;
        prevRooftopAddressRef.current = rooftopAddress;
      }
    }, [initialAddresses, addressFlags, rooftopAddress]);

    // Fetch vini config on component mount
    useEffect(() => {
      const fetchViniConfig = async () => {
        if (!enterpriseId || !teamId || !activeAgentTypeId) {
          return;
        }

        const agentType = agentTypes.find(
          (at) => at.agentTypeId === activeAgentTypeId
        );

        if (!agentType) {
          toast.error('Agent selected is not valid');
          return;
        }

        try {
          setIsLoadingConfig(true);
          const response = await fetchViniConfigAPI({
            enterpriseId,
            teamId,
            agentType: agentType.agentType,
            agentCallType: agentType.agentCallType,
            isCommonNeeded: true,
          });
          // Map response to component state
          if (response?.common) {
            // Handle nested structure from API
            // API returns: common.sales.workShiftTimings and common.service.workShiftTimings
            // We need to combine them into a single structure

            const salesData = response.common.sales;
            const serviceData = response.common.service;

            const partsData = serviceData?.workShiftTimings?.parts;
            const financeData = salesData?.workShiftTimings?.finance;

            const combinedWorkShiftTimings = {
              sales: salesData?.workShiftTimings?.sales || {
                availabilityHours: DEFAULT_AVAILABILITY_HOURS,
              },
              finance: financeData || {
                isSameAsSales: true,
                availabilityHours: DEFAULT_AVAILABILITY_HOURS,
              },
              service: serviceData?.workShiftTimings?.service || {
                isSameAsSales: false,
                availabilityHours: DEFAULT_AVAILABILITY_HOURS,
              },
              parts: partsData || {
                isSameAsService: true,
                availabilityHours: DEFAULT_AVAILABILITY_HOURS,
              },
            };

            const convertedShifts = convertWorkShiftTimingsToState(
              combinedWorkShiftTimings
            );
            setWorkingShiftsData(convertedShifts);

            const combinedHolidays = {
              sales: salesData?.holidays?.sales ?? { holidays: [] },
              finance: salesData?.holidays?.finance ?? {
                isSameAsSales: true,
                holidays: [],
              },
              service: serviceData?.holidays?.service ?? {
                isSameAsSales: false,
                holidays: [],
              },
              parts: serviceData?.holidays?.parts ?? {
                isSameAsService: true,
                holidays: [],
              },
            };

            const convertedHolidays = convertHolidaysToState(combinedHolidays);
            setHolidaysData(convertedHolidays);

            // Load department contacts from API (sales + finance under sales, service + parts under service)
            const salesContacts = salesData?.contacts;
            const serviceContacts = serviceData?.contacts;

            // Sync loaded shifts, holidays and contacts into department state so
            // Service/Parts/Finance get correct initialData in a single update per department
            setSalesDepartmentData((prev) => {
              const next = {
                ...prev,
                salesShifts: convertedShifts.sales,
                salesHolidays: convertedHolidays.sales,
              };

              if (salesContacts?.sales) {
                next.salesPhone = salesContacts.sales.phone;
              }

              return next;
            });

            setServiceDepartmentData((prev) => {
              const next = {
                ...prev,
                serviceShifts: convertedShifts.service.schedule,
                serviceShiftsSameAsSales: convertedShifts.service.sameAsSales,
                serviceHolidays: convertedHolidays.service.holidays,
                serviceHolidaysSameAsSales:
                  convertedHolidays.service.sameAsSales,
              };

              if (serviceContacts?.service) {
                next.servicePhone = serviceContacts.service.phone;
              }

              return next;
            });

            setPartsDepartmentData((prev) => {
              const next = {
                ...prev,
                partsShifts: convertedShifts.parts.schedule,
                partsShiftsSameAsService: convertedShifts.parts.sameAsService,
                partsHolidays: convertedHolidays.parts.holidays,
                partsHolidaysSameAsService:
                  convertedHolidays.parts.sameAsService,
              };

              if (serviceContacts?.parts) {
                next.partsPhone = serviceContacts.parts.phone;
              }

              return next;
            });

            setFinanceDepartmentData((prev) => {
              const next = {
                ...prev,
                financeShifts: convertedShifts.finance.schedule,
                financeShiftsSameAsSales: convertedShifts.finance.sameAsSales,
                financeHolidays: convertedHolidays.finance.holidays,
                financeHolidaysSameAsSales:
                  convertedHolidays.finance.sameAsSales,
              };

              if (salesContacts?.finance) {
                next.financePhone = salesContacts.finance.phone;
              }

              return next;
            });
          }
        } catch (error) {
          toast.error('Error fetching vini config');
        } finally {
          setIsLoadingConfig(false);
        }
      };

      fetchViniConfig();
    }, [enterpriseId, teamId, activeAgentTypeId, agentTypes]);

    // Notify parent of errors changes
    useEffect(() => {
      if (onErrorsChange) {
        const hasErrors =
          salesDepartmentErrors.hasErrors ||
          serviceDepartmentErrors.hasErrors ||
          partsDepartmentErrors.hasErrors ||
          financeDepartmentErrors.hasErrors;
        const errorData = {
          errors: {
            ...salesDepartmentErrors.errors,
            ...serviceDepartmentErrors.errors,
            ...partsDepartmentErrors.errors,
            ...financeDepartmentErrors.errors,
          },
          hasErrors,
          isValid: !hasErrors,
        };
        onErrorsChange(errorData);
      }
    }, [
      salesDepartmentErrors,
      serviceDepartmentErrors,
      partsDepartmentErrors,
      financeDepartmentErrors,
    ]);

    // Notify parent of form data changes
    useEffect(() => {
      if (onFormChange) {
        // Build workingShiftsData and holidaysData from actual department data
        const updatedWorkingShiftsData = {
          sales: salesDepartmentData.salesShifts,
          service: {
            sameAsSales: serviceDepartmentData.serviceShiftsSameAsSales,
            schedule: serviceDepartmentData.serviceShifts,
          },
          parts: {
            sameAsService: partsDepartmentData.partsShiftsSameAsService,
            schedule: partsDepartmentData.partsShifts,
          },
          finance: {
            sameAsSales: financeDepartmentData.financeShiftsSameAsSales,
            schedule: financeDepartmentData.financeShifts,
          },
        };

        const updatedHolidaysData = {
          sales: salesDepartmentData.salesHolidays,
          service: {
            sameAsSales: serviceDepartmentData.serviceHolidaysSameAsSales,
            holidays: serviceDepartmentData.serviceHolidays,
          },
          parts: {
            sameAsService: partsDepartmentData.partsHolidaysSameAsService,
            holidays: partsDepartmentData.partsHolidays,
          },
          finance: {
            sameAsSales: financeDepartmentData.financeHolidaysSameAsSales,
            holidays: financeDepartmentData.financeHolidays,
          },
        };

        const departmentContacts: RequestPayloadDepartmentContacts = {
          ...(salesDepartmentData.salesPhone
            ? {
                sales: {
                  name: 'sales',
                  phone: `${salesDepartmentData.isdCode}${salesDepartmentData.salesPhone}`,
                },
              }
            : {}),
          ...(serviceDepartmentData.servicePhone
            ? {
                service: {
                  name: 'service',
                  phone: `${serviceDepartmentData.isdCode}${serviceDepartmentData.servicePhone}`,
                },
              }
            : {}),
          ...(partsDepartmentData.partsPhone
            ? {
                parts: {
                  name: 'parts',
                  phone: `${partsDepartmentData.isdCode}${partsDepartmentData.partsPhone}`,
                },
              }
            : {}),
          ...(financeDepartmentData.financePhone
            ? {
                finance: {
                  name: 'finance',
                  phone: `${financeDepartmentData.isdCode}${financeDepartmentData.financePhone}`,
                },
              }
            : {}),
        };

        // Convert component state to API format
        const commonConfig = convertFormDataToCommonConfig(
          updatedWorkingShiftsData,
          updatedHolidaysData,
          departmentContacts
        );

        const formData: RooftopViniConfigFormData = {
          commonConfig,
          salesDepartment: salesDepartmentData,
          serviceDepartment: serviceDepartmentData,
          partsDepartment: partsDepartmentData,
          financeDepartment: financeDepartmentData,
        };
        onFormChange(formData);
      }
    }, [
      salesDepartmentData,
      serviceDepartmentData,
      partsDepartmentData,
      financeDepartmentData,
    ]);

    return (
      <div className="flex w-full flex-col gap-8 rounded-2xl border border-black/10 p-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4600f2] bg-[#4600f2]/10">
              <IoHomeSharp className="h-6 w-6 text-[#4600f2]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-[#111]">
                Department Details
              </h2>
              <p className="text-sm text-[#666]">
                Configure department-specific information
              </p>
            </div>
          </div>
          <div className="mt-6 flex w-full flex-col gap-4">
            {isLoadingConfig ? (
              <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-blue-700">
                  Loading configuration...
                </span>
              </div>
            ) : (
              <>
                <SalesDepartment
                  ref={salesDepartmentRef}
                  onFormChange={(data) => {
                    setSalesDepartmentData(data);
                  }}
                  onErrorsChange={(errorData) =>
                    setSalesDepartmentErrors(errorData)
                  }
                  initialData={salesDepartmentData}
                  rooftopAddress={rooftopAddress}
                  initialAddress={initialAddresses?.salesAddress}
                  initialShifts={workingShiftsData.sales}
                  initialHolidays={holidaysData.sales}
                  isOptional={isServiceAgent}
                />
                <hr className="my-4 h-px w-full bg-black/10" />
                <ServiceDepartment
                  ref={serviceDepartmentRef}
                  onFormChange={(data) => setServiceDepartmentData(data)}
                  onErrorsChange={(errorData) =>
                    setServiceDepartmentErrors(errorData)
                  }
                  initialData={serviceDepartmentData}
                  salesAddress={salesDepartmentData.salesAddress}
                  initialAddress={initialAddresses?.serviceAddress}
                  salesShifts={salesDepartmentData.salesShifts}
                  salesHolidays={salesDepartmentData.salesHolidays}
                  isOptional={isSalesAgent}
                />
                <hr className="my-4 h-px w-full bg-black/10" />
                <PartsDepartment
                  ref={partsDepartmentRef}
                  onFormChange={(data) => setPartsDepartmentData(data)}
                  onErrorsChange={(errorData) =>
                    setPartsDepartmentErrors(errorData)
                  }
                  initialData={partsDepartmentData}
                  serviceAddress={serviceDepartmentData.serviceAddress}
                  initialAddress={initialAddresses?.partsAddress}
                  serviceShifts={serviceDepartmentData.serviceShifts}
                  serviceHolidays={serviceDepartmentData.serviceHolidays}
                  isOptional={true}
                />
                <hr className="my-4 h-px w-full bg-black/10" />
                <FinanceDepartment
                  ref={financeDepartmentRef}
                  onFormChange={(data) => setFinanceDepartmentData(data)}
                  onErrorsChange={(errorData) =>
                    setFinanceDepartmentErrors(errorData)
                  }
                  initialData={financeDepartmentData}
                  salesAddress={salesDepartmentData.salesAddress}
                  initialAddress={initialAddresses?.financeAddress}
                  salesShifts={salesDepartmentData.salesShifts}
                  salesHolidays={salesDepartmentData.salesHolidays}
                  isOptional={true}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

RooftopViniConfiguration.displayName = 'RooftopViniConfiguration';

export default RooftopViniConfiguration;
