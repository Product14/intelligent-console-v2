'use client';

import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { createViniConfigAPI } from '@/services/settings/vini-config.service';
import { RequestPayloadServiceAddress } from '@/types/settings/vini-config';
import { Spinner } from '@spyne-console/design-system';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { getCommonRooftopConfigs } from '@spyne-console/components/onboarding/rooftop-profile/api/get-common-rooftop-configs';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import {
  RooftopViniConfigFormData,
  default as RooftopViniConfiguration,
} from './RooftopViniConfiguration';

const compareAddresses = (address1: any, address2: any): boolean => {
  if (!address1 || !address2) {
    return false;
  }

  const normalize = (str: string) =>
    (str || '').toLowerCase().trim().replace(/\s+/g, ' ');

  return (
    normalize(address1.addressLine1) === normalize(address2.addressLine1) &&
    normalize(address1.addressLine2 || '') ===
      normalize(address2.addressLine2 || '') &&
    normalize(address1.city) === normalize(address2.city) &&
    normalize(address1.state) === normalize(address2.state) &&
    normalize(address1.country) === normalize(address2.country) &&
    normalize(address1.zipcode) === normalize(address2.zipcode)
  );
};

const compareGeoCoordinates = (
  geoCoordinates1: any,
  geoCoordinates2: any
): boolean => {
  if (!geoCoordinates1 || !geoCoordinates2) {
    return false;
  }
  return (
    geoCoordinates1.lat === geoCoordinates2.lat &&
    geoCoordinates1.lng === geoCoordinates2.lng
  );
};

const isAddressMatch = (
  address1: any,
  geoCoordinates1: any,
  address2: any,
  geoCoordinates2: any
): boolean => {
  // Returns true if the first address doesn't exist (same-as default)
  if (!address1) return true;
  if (!address2) return false;

  const addressMatch = compareAddresses(address1, address2);
  const geoMatch =
    geoCoordinates1 && geoCoordinates2
      ? compareGeoCoordinates(geoCoordinates1, geoCoordinates2)
      : false;

  return addressMatch && geoMatch;
};

const ViniAgentConfiguration = () => {
  const { enterpriseId, teamId, userId } = useUserDetails();
  const { activeAgentTypeId } = useActiveAgent();

  const { agentTypes } = useAgentTypesRedux({});

  const activeAgentTypeConfig = useMemo(() => {
    if (!activeAgentTypeId) return null;
    return (
      agentTypes.find((at) => at.agentTypeId === activeAgentTypeId) ?? null
    );
  }, [activeAgentTypeId, agentTypes]);

  const viniConfigRef = useRef<{
    showAllErrors?: () => void;
    scrollToError?: () => void;
  } | null>(null);

  const [fetchedAddresses, setFetchedAddresses] = useState<{
    salesAddress: any;
    serviceAddress: any;
    partsAddress: any;
    financeAddress: any;
  }>({
    salesAddress: null,
    serviceAddress: null,
    partsAddress: null,
    financeAddress: null,
  });
  const [fetchedRooftopAddress, setFetchedRooftopAddress] =
    useState<RequestPayloadServiceAddress | null>(null);

  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viniConfigFormData, setViniConfigFormData] =
    useState<RooftopViniConfigFormData | null>(null);

  const [viniErrors, setViniErrors] = useState<{
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!enterpriseId || !teamId) return;

      try {
        setIsFetchingAddresses(true);
        const [configData, teamDetailsResponse] = await Promise.all([
          getCommonRooftopConfigs({
            enterpriseId,
            teamId,
          }),
          CentralAPIHandler.handleGetRequest(
            `${process.env.BACKEND_BASEURL}/user-management/v1/team/get-team-details`,
            { team_id: teamId }
          ),
        ]);

        if (configData) {
          setFetchedAddresses({
            salesAddress: configData.salesAddress || null,
            serviceAddress: configData.serviceAddress || null,
            partsAddress: configData.partsAddress || null,
            financeAddress: configData.financeAddress || null,
          });
        }

        const team = teamDetailsResponse?.data?.team;
        if (team?.address && team?.geoCoordinates) {
          setFetchedRooftopAddress({
            address: team.address,
            geoCoordinates: team.geoCoordinates,
          });
        } else {
          setFetchedRooftopAddress(null);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching initial rooftop addresses:', error);
      } finally {
        setIsFetchingAddresses(false);
      }
    };

    fetchAddresses();
  }, [enterpriseId, teamId]);

  const rooftopAddress = useMemo<
    RequestPayloadServiceAddress | undefined
  >(() => {
    if (
      fetchedRooftopAddress?.address &&
      fetchedRooftopAddress?.geoCoordinates
    ) {
      return fetchedRooftopAddress;
    }
    const sales = fetchedAddresses.salesAddress;
    if (!sales?.address || !sales?.geoCoordinates) return undefined;
    return {
      address: sales.address,
      geoCoordinates: sales.geoCoordinates,
    };
  }, [fetchedRooftopAddress, fetchedAddresses.salesAddress]);

  const addressFlags = useMemo(() => {
    const sales = fetchedAddresses.salesAddress;
    const service = fetchedAddresses.serviceAddress;
    const parts = fetchedAddresses.partsAddress;
    const finance = fetchedAddresses.financeAddress;
    const rooftop = fetchedRooftopAddress;

    const hasRooftopAddress = Boolean(
      rooftop?.address && rooftop?.geoCoordinates
    );

    return {
      salesAddressSameAsRooftop: hasRooftopAddress
        ? isAddressMatch(
            sales?.address,
            sales?.geoCoordinates,
            rooftop?.address,
            rooftop?.geoCoordinates
          )
        : true,
      serviceAddressSameAsSales: isAddressMatch(
        service?.address,
        service?.geoCoordinates,
        sales?.address,
        sales?.geoCoordinates
      ),
      partsAddressSameAsService: isAddressMatch(
        parts?.address,
        parts?.geoCoordinates,
        service?.address,
        service?.geoCoordinates
      ),
      financeAddressSameAsSales: isAddressMatch(
        finance?.address,
        finance?.geoCoordinates,
        sales?.address,
        sales?.geoCoordinates
      ),
    };
  }, [fetchedAddresses, fetchedRooftopAddress]);

  const handlePost = async () => {
    if (!viniConfigFormData) {
      toast.error('No Vini configuration found to save');
      return;
    }

    if (viniErrors?.hasErrors) {
      viniConfigRef.current?.showAllErrors?.();
      viniConfigRef.current?.scrollToError?.();
      return;
    }

    const agentType = activeAgentTypeConfig?.agentType;
    const agentCallType = activeAgentTypeConfig?.agentCallType;
    if (!enterpriseId || !teamId || !userId || !agentType || !agentCallType) {
      toast.error('Missing required information to save configuration');
      return;
    }

    const entity =
      agentType && agentCallType
        ? `${agentType}_${agentCallType}`.toLowerCase()
        : '';

    const salesAddress = viniConfigFormData.salesDepartment?.salesAddress;
    const serviceAddress = viniConfigFormData.serviceDepartment
      ?.serviceAddressSameAsSales
      ? salesAddress
      : viniConfigFormData.serviceDepartment?.serviceAddress;
    const partsAddress = viniConfigFormData.partsDepartment
      ?.partsAddressSameAsService
      ? serviceAddress
      : viniConfigFormData.partsDepartment?.partsAddress;
    const financeAddress = viniConfigFormData.financeDepartment
      ?.financeAddressSameAsSales
      ? salesAddress
      : viniConfigFormData.financeDepartment?.financeAddress;

    const commonConfig = viniConfigFormData.commonConfig || ({} as any);
    const workShiftTimings = commonConfig.workShiftTimings?.timings || {};
    const holidays = commonConfig.holidays || {};

    const timezone = commonConfig.workShiftTimings?.timezone;

    const salesAvailabilityHours = workShiftTimings.sales?.availabilityHours;
    const serviceIsSameAsSales = Boolean(
      workShiftTimings.service?.isSameAsSales
    );
    const serviceAvailabilityHours = serviceIsSameAsSales
      ? salesAvailabilityHours
      : workShiftTimings.service?.availabilityHours;

    const partsIsSameAsService = Boolean(
      workShiftTimings.parts?.isSameAsService
    );
    const partsAvailabilityHours = partsIsSameAsService
      ? serviceAvailabilityHours
      : workShiftTimings.parts?.availabilityHours;

    const financeIsSameAsSales = Boolean(
      workShiftTimings.finance?.isSameAsSales
    );
    const financeAvailabilityHours = financeIsSameAsSales
      ? salesAvailabilityHours
      : workShiftTimings.finance?.availabilityHours;

    const salesHolidays = holidays.sales?.holidays || [];
    const serviceHolidaysSameAsSales = Boolean(holidays.service?.isSameAsSales);
    const serviceHolidays = serviceHolidaysSameAsSales
      ? salesHolidays
      : holidays.service?.holidays || [];

    const partsHolidaysSameAsService = Boolean(holidays.parts?.isSameAsService);
    const partsHolidays = partsHolidaysSameAsService
      ? serviceHolidays
      : holidays.parts?.holidays || [];

    const financeHolidaysSameAsSales = Boolean(holidays.finance?.isSameAsSales);
    const financeHolidays = financeHolidaysSameAsSales
      ? salesHolidays
      : holidays.finance?.holidays || [];

    // What we would post for the (next) Vini config API call.
    // This mirrors the expected Vini API structure.
    const payload = {
      enterpriseId,
      teamId,
      domain: 'product',
      entity,
      userId,
      entityConfig: {
        serviceAddress,
        salesAddress,
        partsAddress,
        financeAddress,
        common: {
          workShiftTimings: {
            // timezone,
            timings: {
              sales: {
                availabilityHours: salesAvailabilityHours,
              },
              service: {
                isSameAsSales: serviceIsSameAsSales,
                availabilityHours: serviceAvailabilityHours,
              },
              parts: {
                isSameAsService: partsIsSameAsService,
                availabilityHours: partsAvailabilityHours,
              },
              finance: {
                isSameAsSales: financeIsSameAsSales,
                availabilityHours: financeAvailabilityHours,
              },
            },
          },
          holidays: {
            sales: {
              holidays: salesHolidays,
            },
            service: {
              isSameAsSales: serviceHolidaysSameAsSales,
              holidays: serviceHolidays,
            },
            parts: {
              isSameAsService: partsHolidaysSameAsService,
              holidays: partsHolidays,
            },
            finance: {
              isSameAsSales: financeHolidaysSameAsSales,
              holidays: financeHolidays,
            },
          },
          contacts: commonConfig.contacts || {},
        },
      },
    };

    setIsSubmitting(true);
    try {
      await createViniConfigAPI(payload as any);
      toast.success('Vini configuration saved successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || 'Failed to save Vini configuration';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetchingAddresses) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 bg-[#F5F5F5] px-6 py-8">
      <div className="h-[calc(100%-60px)] overflow-y-auto rounded-2xl bg-white">
        <RooftopViniConfiguration
          ref={viniConfigRef as any}
          onFormChange={(data) => setViniConfigFormData(data)}
          onErrorsChange={(data) => setViniErrors(data)}
          rooftopAddress={rooftopAddress}
          initialAddresses={{
            salesAddress: fetchedAddresses.salesAddress,
            serviceAddress: fetchedAddresses.serviceAddress,
            partsAddress: fetchedAddresses.partsAddress,
            financeAddress: fetchedAddresses.financeAddress,
          }}
          addressFlags={addressFlags}
        />
      </div>

      <div className="flex w-full justify-end">
        <button
          type="button"
          onClick={handlePost}
          className="min-w-[100px] rounded-lg bg-[#4600f2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3c00d6] disabled:opacity-50"
          disabled={isFetchingAddresses || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

ViniAgentConfiguration.displayName = 'ViniAgentConfiguration';

export default ViniAgentConfiguration;
