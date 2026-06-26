import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import DurationHolder from '../common/DurationHolder';
import { EmailToggleCard } from './email-toggle-card';
import LeadToSpeedContainer from './lead-to-speed-container';
import LeadToSpeedSkeletonCard from './lead-to-speed-skeleton-card';
import {
  type LeadFilterOptionItem,
  type SpeedToLeadDataPayload,
  SpeedToLeadDataResponse,
  type SpeedToLeadSourceConfig,
  getLeadFilterOptionsAPI,
  getSpeedToLeadDataAPI,
  isSpeedToLeadMode,
  submitSpeedToLeadDataAPI,
} from './speed-to-lead-responses';
import {
  getDefaultSourceConfig,
  getDefaultSpeedToLeadPayload,
  mergeWithDefaultPayload,
  normalizeConfigForSubmit,
} from './static-config';

interface SpeedToLeadProps {
  onNext?: () => void;
  onBack?: () => void;
  isEditMode?: boolean;
}

export default function SpeedToLead({
  onNext,
  onBack,
  isEditMode = false,
}: SpeedToLeadProps = {}) {
  const { goToNextStep } = useOnboardingStepNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [payload, setPayload] = useState<SpeedToLeadDataPayload | null>(null);
  const { productLineId } = useMainContext();
  const { activeAgentId: teamAgentMappingId, activeAgentTypeId } =
    useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const { teamId, enterpriseId } = useUserDetails();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const [speedToLeadEnabled, setSpeedToLeadEnabled] = useState(true);
  const [modeValidationErrors, setModeValidationErrors] = useState<
    Record<string, string>
  >({});
  const [leadFilterOptions, setLeadFilterOptions] = useState<
    LeadFilterOptionItem[]
  >([]);
  const agentTypeData = useMemo(
    () => agentTypes.find((a) => a.agentTypeId === activeAgentTypeId),
    [agentTypes, activeAgentTypeId]
  );

  const leadTypeOptions = useMemo(
    () =>
      leadFilterOptions.length > 0
        ? leadFilterOptions
            .map((item) => item.external_type)
            .filter((t) => t !== 'empty')
        : ['INTERNET'],
    [leadFilterOptions]
  );

  // Lead source configuration is intentionally disabled.
  // const sourceOptions = useMemo(
  //   () => Array.from(new Set(leadFilterOptions.flatMap((item) => item.source))),
  //   [leadFilterOptions]
  // );
  // const hasLeadFilterData = leadFilterOptions.length > 0;

  useEffect(() => {
    if (isEditMode) return;
    updateTaskAndRefresh(
      {
        productLineId,
        taskName: OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  useEffect(() => {
    if (!enterpriseId || !teamId || !agentTypeData) return;
    let cancelled = false;
    setFetchLoading(true);
    Promise.all([
      getSpeedToLeadDataAPI({
        enterpriseId,
        teamId,
        agentId: teamAgentMappingId,
        agentType: agentTypeData?.agentType,
        agentCallType: agentTypeData?.agentCallType,
      }),
      getLeadFilterOptionsAPI(enterpriseId, teamId),
    ])
      .then(([speedData, filterOptions]) => {
        if (cancelled) return;
        setLeadFilterOptions(filterOptions);
        setSpeedToLeadEnabled(speedData?.isSpeedToLeadEnabled ?? true);
        const merged = mergeWithDefaultPayload(
          enterpriseId,
          teamId,
          teamAgentMappingId,
          speedData ?? null
        );
        if (
          filterOptions.length === 0 &&
          Object.keys(merged.speedToLeadByLeadType).length === 0
        ) {
          merged.speedToLeadByLeadType = {
            INTERNET: { isEnabled: true, mode: 'SILENT_HOURS' },
          };
        }
        setPayload(merged);
      })
      .catch((error: any) => {
        if (!cancelled) {
          setPayload(
            getDefaultSpeedToLeadPayload(
              enterpriseId,
              teamId,
              teamAgentMappingId
            )
          );
          toast.error(
            `${error?.response?.data?.message || error?.message || 'Failed to load speed to lead settings'}`
          );
        }
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enterpriseId, teamId]);

  // Lead source configuration is intentionally disabled.
  // const updateSource = useCallback(
  //   (key: string, config: SpeedToLeadSourceConfig) => {
  //     setPayload((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             speedToLeadBySource: {
  //               ...prev.speedToLeadBySource,
  //               [key]: config,
  //             },
  //           }
  //         : null
  //     );
  //     setModeValidationErrors((prev) => {
  //       const next = { ...prev };
  //       delete next[`source-${key}`];
  //       return next;
  //     });
  //   },
  //   []
  // );

  const updateLeadType = useCallback(
    (key: string, config: SpeedToLeadSourceConfig) => {
      setPayload((prev) =>
        prev
          ? {
              ...prev,
              speedToLeadByLeadType: {
                ...prev.speedToLeadByLeadType,
                [key]: config,
              },
            }
          : null
      );
      setModeValidationErrors((prev) => {
        const next = { ...prev };
        delete next[`leadType-${key}`];
        return next;
      });
    },
    []
  );

  // Lead source configuration is intentionally disabled.
  // const addSource = useCallback((key: string) => {
  //   setPayload((prev) =>
  //     prev
  //       ? {
  //           ...prev,
  //           speedToLeadBySource: {
  //             ...prev.speedToLeadBySource,
  //             [key]: getDefaultSourceConfig(),
  //           },
  //         }
  //       : null
  //   );
  //   setModeValidationErrors((prev) => {
  //     const next = { ...prev };
  //     delete next['source-_section'];
  //     return next;
  //   });
  // }, []);

  const addLeadType = useCallback((key: string) => {
    setPayload((prev) =>
      prev
        ? {
            ...prev,
            speedToLeadByLeadType: {
              ...prev.speedToLeadByLeadType,
              [key]: getDefaultSourceConfig(),
            },
          }
        : null
    );
    setModeValidationErrors((prev) => {
      const next = { ...prev };
      delete next['leadType-_section'];
      return next;
    });
  }, []);

  // Lead source configuration is intentionally disabled.
  // const removeSource = useCallback((key: string) => {
  //   setPayload((prev) => {
  //     if (!prev) return null;
  //     const next = { ...prev.speedToLeadBySource };
  //     delete next[key];
  //     return { ...prev, speedToLeadBySource: next };
  //   });
  // }, []);

  const removeLeadType = useCallback((key: string) => {
    setPayload((prev) => {
      if (!prev) return null;
      const next = { ...prev.speedToLeadByLeadType };
      delete next[key];
      return { ...prev, speedToLeadByLeadType: next };
    });
  }, []);

  const handleContinue = async () => {
    if (!payload || !enterpriseId || !teamId) return;

    if (speedToLeadEnabled) {
      const errors: Record<string, string> = {};

      if (Object.keys(payload.speedToLeadByLeadType).length === 0) {
        errors['leadType-_section'] = 'At least one lead type must be added';
      } else {
        Object.entries(payload.speedToLeadByLeadType).forEach(
          ([key, config]) => {
            if (!isSpeedToLeadMode(config.mode)) {
              errors[`leadType-${key}`] = 'Select hours';
            }
          }
        );
      }

      // Lead source validation is intentionally disabled.
      // if (hasLeadFilterData) {
      //   if (Object.keys(payload.speedToLeadBySource).length === 0) {
      //     errors['source-_section'] = 'At least one lead source must be added';
      //   } else {
      //     Object.entries(payload.speedToLeadBySource).forEach(
      //       ([key, config]) => {
      //         if (!isSpeedToLeadMode(config.mode)) {
      //           errors[`source-${key}`] = 'Select hours';
      //         }
      //       }
      //     );
      //   }
      // }

      if (Object.keys(errors).length > 0) {
        setModeValidationErrors(errors);
        toast.error('Please fix the errors before continuing');
        return;
      }
    }

    setModeValidationErrors({});
    setIsLoading(true);
    try {
      const normalizeSection = (
        section: Record<string, SpeedToLeadSourceConfig>
      ) =>
        Object.fromEntries(
          Object.entries(section).map(([k, v]) => [
            k,
            normalizeConfigForSubmit(v),
          ])
        );

      const submitPayload: SpeedToLeadDataPayload = {
        enterpriseId: payload.enterpriseId,
        teamId: payload.teamId,
        agentId: teamAgentMappingId,
        isSpeedToLeadEnabled: speedToLeadEnabled,
        speedToLeadByLeadType: normalizeSection(payload.speedToLeadByLeadType),
      };

      const response = await submitSpeedToLeadDataAPI(submitPayload);
      if (!isEditMode) {
        await updateTaskAndRefresh(
          {
            productLineId,
            taskName: OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION,
            agentType: agentTypeData?.agentType ?? '',
            agentCallType: agentTypeData?.agentCallType ?? '',
          },
          true
        );
      }
      toast.success(
        `${(response as unknown as SpeedToLeadDataResponse)?.message || 'Speed to lead settings saved successfully'}`
      );
      onNext ? onNext() : goToNextStep();
    } catch (error: any) {
      toast.error(
        `${error?.response?.data?.message || error?.message || 'Failed to save speed to lead settings'}`
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailEnabled = true;

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden pl-8">
        <OnboardingBackgroundGrid fadeRight={true} width="50%" />
        <div className="mr-12 flex h-full flex-1 flex-col gap-6 overflow-hidden pb-3 pt-8">
          <OnboardingStepHeader
            title="Speed to lead"
            description="Configure response time by lead type"
          >
            <DurationHolder />
          </OnboardingStepHeader>
          {fetchLoading || !payload ? (
            <div className="h-full w-full">
              <LeadToSpeedSkeletonCard />
            </div>
          ) : (
            <>
              <EmailToggleCard
                speedToLeadEnabled={speedToLeadEnabled}
                setSpeedToLeadEnabled={setSpeedToLeadEnabled}
                isEmailEnabled={isEmailEnabled}
              />
              <LeadToSpeedContainer
                payload={payload}
                leadTypeOptions={leadTypeOptions}
                // sourceOptions={sourceOptions}
                // hasLeadFilterData={hasLeadFilterData}
                updateLeadType={updateLeadType}
                addLeadType={addLeadType}
                removeLeadType={removeLeadType}
                // updateSource={updateSource}
                // addSource={addSource}
                // removeSource={removeSource}
                speedToLeadEnabled={speedToLeadEnabled}
                modeValidationErrors={modeValidationErrors}
              />
            </>
          )}
        </div>
      </div>
      <OnboardingFooter
        onContinue={handleContinue}
        onBack={onBack}
        showBackButton={!!onBack && isEditMode}
        disableContinue={isLoading}
        continueLabel={isLoading ? 'Saving...' : 'Next'}
      />
    </div>
  );
}
