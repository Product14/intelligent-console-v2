'use client';

import { useMainContext } from '@/contexts/settings/mainContext';
import { CnamProfile } from '@/models/twilio.model';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import {
  fetchCnameProfilesAPI,
  registerCnameAPI,
} from '@/services/settings/twilio.service';
import { Toggle } from '@spyne-console/design-system';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingProgressRedux } from '@/hooks/settings/use-onboarding-progress-redux';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import {
  BUSINESS_INDUSTRIES,
  BUSINESS_TYPES,
  buildCnameRegistrationPayload,
} from '@/helpers-settings/cnam-config-builder';

import { DsButton } from '@/components/settings/ds';

import BusinessDetails, { BusinessDetailsFormData } from './BusinessDetails';

const getRooftopData = async (teamId: string) => {
  const url = `${process.env.BACKEND_BASEURL}/user-management/v1/team/get-team-details`;
  return CentralAPIHandler.handleGetRequest(url, { team_id: teamId });
};

const transformRooftopData = (apiData: any) => {
  const team = apiData?.data?.team;
  const user = apiData?.data?.user;
  const isdCode = user?.isdCode || '';
  const contactNo = user?.contactNo || '';
  const sanitizedIsdCode = isdCode.replace('+', '');

  return {
    rooftopId: team?.teamId || '',
    rooftopName: team?.teamName || '',
    website: team?.websiteLink || '',
    adminName: user?.userName || '',
    adminEmail: user?.emailId || '',
    adminPhone: `${sanitizedIsdCode}${contactNo}`,
    adminUserId: user?.userId || '',
    isdCode: isdCode || '',
    dealerType: team?.teamType || '',
    dealerSubType: team?.teamSubType || '',
    rooftopAddress: team?.address || null,
    region: team?.regionType || '',
    timezone: team?.timeZone || '',
    enterpriseId: team?.enterpriseId || '',
    geoCoordinates: team?.geoCoordinates || null,
  };
};

export default function CallerIdRegistrationStep() {
  const { activeAgentTypeId } = useActiveAgent();
  const { productLineId } = useMainContext();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { agentTypes } = useAgentTypesRedux({});
  const { enterpriseId, teamId } = useUserDetails();

  const [rooftopData, setRooftopData] = useState<any>(null);
  const [isRooftopLoading, setIsRooftopLoading] = useState(false);

  const [cnamProfile, setCnamProfile] = useState<CnamProfile | null>(null);
  const [isCnamFetching, setIsCnamFetching] = useState(false);

  const [cnamOptIn, setCnamOptIn] = useState(true);
  const businessDetailsRef = useRef<any>(null);

  const [businessFormData, setBusinessFormData] =
    useState<BusinessDetailsFormData | null>(null);

  const [businessErrors, setBusinessErrors] = useState<{
    hasErrors: boolean;
    isValid: boolean;
    errors: Record<string, string>;
  }>({
    hasErrors: false,
    isValid: true,
    errors: {},
  });

  const agentTypeData = useMemo(() => {
    return agentTypes.find((agent) => agent.agentTypeId === activeAgentTypeId);
  }, [agentTypes, activeAgentTypeId]);

  const { data: onboardingProgressData, getAgentProgressByType } =
    useOnboardingProgressRedux({});

  const brandRegistrationTask = useMemo(() => {
    if (!agentTypeData?.agentType || !agentTypeData?.agentCallType) {
      return null;
    }

    const agentProgress = getAgentProgressByType(
      agentTypeData.agentType,
      agentTypeData.agentCallType,
      onboardingProgressData ?? null
    );
    const brandRegistrationTask = agentProgress.progressSteps.find(
      (task) => task.taskName === OnboardingTaskName.BRAND_REGISTRATION
    );

    return brandRegistrationTask ?? null;
  }, [agentTypeData, getAgentProgressByType, onboardingProgressData]);

  const isBrandRegistrationTaskCompleted = useMemo(() => {
    return brandRegistrationTask?.status === 'COMPLETED';
  }, [brandRegistrationTask]);

  const isUsaRooftop =
    (rooftopData?.rooftopAddress?.country ?? '').toLowerCase() ===
    'united states';

  const isInitialLoading = isCnamFetching || isRooftopLoading;

  const isCnamReadonly =
    cnamProfile !== null && cnamProfile.status !== 'rejected';

  const cnamStatus = cnamProfile?.status;

  const cnamInitialData = useMemo(() => {
    if (!cnamProfile) return undefined;
    const bd = cnamProfile.business_details;
    const businessType =
      BUSINESS_TYPES.find((t) => t.label === bd.type)?.value ?? '';
    const businessIndustry =
      BUSINESS_INDUSTRIES.find((i) => i.code === bd.industry)?.value ?? '';
    return {
      legalBusinessName: bd.name,
      callerIdDisplayName: bd.display_name,
      businessType,
      businessIndustry,
      employerIdentificationNumber: bd.registration_id_value,
      representatives: cnamProfile.authorized_representatives.map((rep) => ({
        firstName: rep.first_name,
        lastName: rep.last_name,
        email: rep.email,
        phoneNumber: rep.phone_number?.replace('+', ''),
        title: rep.title,
        position: rep.position,
      })),
    };
  }, [cnamProfile]);

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.BRAND_REGISTRATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  useEffect(() => {
    if (!teamId) return;
    const load = async () => {
      const rooftopPromise = getRooftopData(teamId);
      const cnamPromise =
        enterpriseId && teamId
          ? fetchCnameProfilesAPI(enterpriseId, teamId)
          : Promise.resolve(null);

      try {
        setIsCnamFetching(true);
        setIsRooftopLoading(true);
        const [cnamResult, rooftopResult] = await Promise.allSettled([
          cnamPromise,
          rooftopPromise,
        ]);

        let profile: CnamProfile | null = null;
        if (cnamResult.status === 'fulfilled') {
          profile = (cnamResult.value as any)?.data?.[0] ?? null;
          setCnamProfile(profile);
        } else {
          setCnamProfile(null);
        }

        let transformedRooftop: any = null;
        if (rooftopResult.status === 'fulfilled') {
          transformedRooftop = transformRooftopData(rooftopResult.value);
          setRooftopData(transformedRooftop);
        } else {
          setRooftopData(null);
        }

        const hasCustomerProfileDetails = profile !== null;
        const isUsaCountrySelected =
          (transformedRooftop?.rooftopAddress?.country ?? '').toLowerCase() ===
          'united states';
        let shouldOptIn = true;
        if (isUsaCountrySelected && isBrandRegistrationTaskCompleted) {
          shouldOptIn = hasCustomerProfileDetails;
        } else if (!isUsaCountrySelected) {
          shouldOptIn = hasCustomerProfileDetails;
        }

        setCnamOptIn(shouldOptIn);
      } catch (error) {
        setRooftopData(null);
        setCnamProfile(null);
        setCnamOptIn(false);
        toast.error('Failed to load rooftop and CNAM details');
      } finally {
        setIsCnamFetching(false);
        setIsRooftopLoading(false);
      }
    };

    load();
  }, [enterpriseId, teamId]);

  const shouldShowBusinessDetails = isCnamReadonly || cnamOptIn;

  // Toggle stays interactive unless the profile is already submitted (server-locked).
  const isOptInToggleDisabled =
    cnamStatus === 'pending' || isCnamReadonly;

  const [isLoading, setIsLoading] = useState(false);

  const disableSave = isLoading || isInitialLoading || !rooftopData;

  const handleSave = async () => {
    const shouldRegisterCnam = !isCnamReadonly && cnamOptIn;

    if (shouldRegisterCnam) {
      if (
        businessErrors.hasErrors ||
        !businessErrors.isValid ||
        !businessFormData
      ) {
        businessDetailsRef.current?.showAllErrors();
        toast.error('Please fill in all the relevant details');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (shouldRegisterCnam && businessFormData) {
        const cnamePayload = buildCnameRegistrationPayload(
          {
            businessDetails: businessFormData,
            rooftopAddress: rooftopData?.rooftopAddress,
            website: rooftopData?.website,
          },
          enterpriseId,
          teamId
        );

        const cnamResponse = await registerCnameAPI(cnamePayload);
        if (cnamResponse?.data) setCnamProfile(cnamResponse.data);
      }

      await updateTaskAndRefresh(
        {
          productLineId,
          taskName: OnboardingTaskName.BRAND_REGISTRATION,
          agentType: agentTypeData.agentType ?? '',
          agentCallType: agentTypeData.agentCallType ?? '',
        },
        cnamOptIn
      );

      if (cnamOptIn) {
        toast.success('Caller ID registration saved');
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Error saving caller ID registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Section is US-only — render nothing for non-US so the page doesn't show a dead section.
  if (!isInitialLoading && rooftopData && !isUsaRooftop) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-3 text-base font-semibold text-black-80">Caller ID (CNAM)</h2>
      <p className="mb-4 text-sm text-black-60">
        Register your business caller ID so your dealership name appears on
        outgoing calls. Skipping this — calls may be flagged as spam.
      </p>

      {isInitialLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-black/10 p-6">
          <p className="text-sm text-black-60">Loading caller ID details…</p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-black/10 p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-black-dark">Enable Caller ID Registration</p>
              <p className="text-xs text-black-60">
                Turn off to skip registration for this rooftop.
              </p>
            </div>
            <Toggle
              id="cnam-opt-in-toggle"
              toggle={cnamOptIn}
              toggleHandler={() => setCnamOptIn((prev) => !prev)}
              disabled={isOptInToggleDisabled}
              className=""
            />
          </div>

          {shouldShowBusinessDetails && (
            <BusinessDetails
              ref={businessDetailsRef}
              onFormChange={(data) => setBusinessFormData(data)}
              onErrorsChange={(errorData) => setBusinessErrors(errorData)}
              isReadonly={isCnamReadonly}
              isFetching={isCnamFetching}
              initialData={cnamInitialData}
              status={cnamStatus}
            />
          )}

          {!isCnamReadonly && (
            <div className="flex justify-end">
              <DsButton
                label={isLoading ? 'Saving…' : 'Save'}
                onClick={handleSave}
                isLoading={isLoading}
                disabled={disableSave}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
