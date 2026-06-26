import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import {
  IntegrationEntityResponse,
  Partner,
  ServiceSchedulerConfig,
} from '@/models/integrations.model';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import {
  createServiceSchedulerIntegration,
  fetchServiceSchedulerEntityConfig,
  fetchServiceSchedulerPartners,
  isServiceSchedulerIntegrationDone,
} from '@/services/settings/service-scheduler-integrations.service';
import { useSelector } from '@spyne-console/store';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import {
  CommonIntegrationCard,
  ImsNotListedScreen,
  PartnersSelection,
} from '@spyne-console/components/onboarding/integrations';
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import DurationHolder from '../../common/DurationHolder';
import CommonIntegrationCardShimmer from '../crm/common-integration-card-shimmer';
import ProviderInfoBadges from '../provider-info-badges';
import ServiceSchedulerConfiguration, {
  FIELD_VISIBILITY,
  SERVICE_SCHEDULER_PLATFORM,
  ServiceSchedulerConfigData,
  ServiceSchedulerConfigErrors,
  ServiceSchedulerPlatformType,
} from './ServiceSchedulerConfiguration';
import { ServiceSchedulerDetails } from './ServiceSchedulerDetails';

export enum ServiceSchedulerIntegrationStep {
  ENTRY = 'entry',
  SELECTION = 'selection',
  DETAILS = 'details',
  CONFIGURATION = 'configuration',
  NOT_LISTED = 'not-listed',
}

export type ServiceSchedulerSelectionType = 'partner' | 'not-listed' | null;

const DEFAULT_SCHEDULER_CONFIG: ServiceSchedulerConfigData = {
  supportedVehicles: [],
  availableServices: [],
  transportationOptions: {
    pickupDropoff: { hasOpted: false },
    loaner: { hasOpted: false },
    shuttle: { hasOpted: false },
  },
  serviceRules: [],
  returnPrice: false,
  additionalCallBackAndTransferRules: [],
  upsellingRules: { isOpted: false },
};

export default function ServiceSchedulerIntegration() {
  const [currentStep, setCurrentStep] =
    useState<ServiceSchedulerIntegrationStep>(
      ServiceSchedulerIntegrationStep.ENTRY
    );
  const { goToNextStep, goToPrevStep } = useOnboardingStepNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { productLineId } = useMainContext();
  const { activeAgentTypeId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { enterpriseId, teamId, userId } = useUserDetails();
  const enterpriseTeamReducer = useSelector(
    (state: any) => state.enterpriseTeamReducer
  );
  const enterpriseName =
    enterpriseTeamReducer?.enterprise?.enterprise_name || '';
  const teamName = enterpriseTeamReducer?.selectedTeam?.team_name || '';

  const agentTypeData = useMemo(() => {
    return agentTypes.find((agent) => agent.agentTypeId === activeAgentTypeId);
  }, [agentTypes, activeAgentTypeId]);

  const [entityConfig, setEntityConfig] =
    useState<IntegrationEntityResponse | null>(null);
  const [fetchingEntityConfig, setFetchingEntityConfig] = useState(false);
  const isDone = isServiceSchedulerIntegrationDone(entityConfig);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [selectedOptionType, setSelectedOptionType] =
    useState<ServiceSchedulerSelectionType>(null);

  const [dealerId, setDealerId] = useState('');
  const [oemName, setOemName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notListedPartnerName, setNotListedPartnerName] = useState('');
  const [notListedPocName, setNotListedPocName] = useState('');
  const [notListedPocEmail, setNotListedPocEmail] = useState('');
  const [notListedPocContact, setNotListedPocContact] = useState('');

  const [schedulerConfig, setSchedulerConfig] =
    useState<ServiceSchedulerConfigData>(DEFAULT_SCHEDULER_CONFIG);

  const [configErrors, setConfigErrors] =
    useState<ServiceSchedulerConfigErrors>({});

  const handleConfigChange = (updates: Partial<ServiceSchedulerConfigData>) => {
    setSchedulerConfig((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
    // Clear related errors as user fixes them
    setConfigErrors((prev) => {
      const cleared = { ...prev };
      if (updates.upsellingRules !== undefined) delete cleared.upsellingRules;
      if (updates.serviceRules !== undefined) delete cleared.serviceRules;
      if (updates.additionalCallBackAndTransferRules !== undefined)
        delete cleared.additionalCallBackAndTransferRules;
      return cleared;
    });
  };

  const validateConfig = (): boolean => {
    const errs: ServiceSchedulerConfigErrors = {};

    if (
      schedulerConfig.upsellingRules.isOpted === true &&
      !schedulerConfig.upsellingRules.data?.trim()
    ) {
      errs.upsellingRules =
        'Please provide upselling guidelines when upsell is enabled.';
    }

    setConfigErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectedProviderName = useMemo(
    () =>
      partners.find((p) => p.id === selectedProviderId)?.name ??
      notListedPartnerName,
    [partners, selectedProviderId]
  );

  const platformType = useMemo((): ServiceSchedulerPlatformType => {
    if (
      selectedOptionType &&
      selectedOptionType === SERVICE_SCHEDULER_PLATFORM.NOT_LISTED
    )
      return SERVICE_SCHEDULER_PLATFORM.NOT_LISTED;
    const name = selectedProviderName?.toLowerCase() ?? '';
    if (name.includes(SERVICE_SCHEDULER_PLATFORM.XTIME))
      return SERVICE_SCHEDULER_PLATFORM.XTIME;
    if (name.includes(SERVICE_SCHEDULER_PLATFORM.TEKION))
      return SERVICE_SCHEDULER_PLATFORM.TEKION;
    if (name.includes(SERVICE_SCHEDULER_PLATFORM.PBS))
      return SERVICE_SCHEDULER_PLATFORM.PBS;
    if (name.includes(SERVICE_SCHEDULER_PLATFORM.CDK))
      return SERVICE_SCHEDULER_PLATFORM.CDK;
    if (name.includes(SERVICE_SCHEDULER_PLATFORM.DEALERFX))
      return SERVICE_SCHEDULER_PLATFORM.DEALERFX;
    return SERVICE_SCHEDULER_PLATFORM.OTHER;
  }, [selectedOptionType, selectedProviderName]);

  useEffect(() => {
    if (!enterpriseId || !teamId) return;

    const loadEntityConfig = async () => {
      setFetchingEntityConfig(true);
      try {
        const data = await fetchServiceSchedulerEntityConfig({
          enterpriseID: enterpriseId,
          TeamId: teamId,
        });
        setEntityConfig(data);
        if (isServiceSchedulerIntegrationDone(data)) {
          setCurrentStep(ServiceSchedulerIntegrationStep.ENTRY);
          if (data?.entityconfig?.api) {
            const api = data.entityconfig.api as any;
            if (api.partnerId) {
              setSelectedProviderId(api.partnerId);
              setSelectedOptionType('partner');
              setDealerId(api.dealerId || '');
              setOemName(api.oemName || '');
            } else {
              setSelectedOptionType('not-listed');
              setNotListedPartnerName(api.partnerName || '');
            }
          }
          if (data?.entityconfig?.serviceSchedulerConfig) {
            const saved = data.entityconfig.serviceSchedulerConfig;
            setSchedulerConfig({
              supportedVehicles: saved.supportedMakes ?? [],
              availableServices: saved.availableServices ?? [],
              transportationOptions: {
                pickupDropoff: {
                  hasOpted: saved.serviceFacilities?.pickAndDropoff ?? false,
                },
                loaner: {
                  hasOpted: saved.serviceFacilities?.loanerBookings ?? false,
                },
                shuttle: {
                  hasOpted: saved.serviceFacilities?.shuttle ?? false,
                },
              },
              serviceRules: saved.serviceRules ?? [],
              returnPrice: saved.highlightPrices ?? false,
              additionalCallBackAndTransferRules: saved.transferScenarios ?? [],
              upsellingRules: {
                isOpted: saved.upselling?.isOpted ?? false,
                data: saved.upselling?.data,
              },
              slotDuration:
                saved.slotDuration != null
                  ? String(saved.slotDuration)
                  : undefined,
              capacityPerSlot:
                saved.capacityPerSlot != null
                  ? String(saved.capacityPerSlot)
                  : undefined,
            });
          }
        } else {
          setCurrentStep(ServiceSchedulerIntegrationStep.SELECTION);
        }
      } catch (error) {
        console.error(
          'Failed to fetch service scheduler entity config:',
          error
        );
        setCurrentStep(ServiceSchedulerIntegrationStep.SELECTION);
      } finally {
        setFetchingEntityConfig(false);
      }
    };

    loadEntityConfig();
  }, [enterpriseId, teamId]);

  useEffect(() => {
    const loadPartners = async () => {
      setFetchingPartners(true);
      try {
        const data = await fetchServiceSchedulerPartners();
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch service scheduler partners:', error);
        toast.error('Failed to load service scheduler partners');
      } finally {
        setFetchingPartners(false);
      }
    };

    loadPartners();
  }, []);

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const handlePartnerClick = useCallback(
    (partnerId: string) => {
      if (partnerId !== selectedProviderId) {
        setSchedulerConfig(DEFAULT_SCHEDULER_CONFIG);
        setConfigErrors({});
      }
      setSelectedProviderId(partnerId);
      setSelectedOptionType('partner');
    },
    [selectedProviderId]
  );

  const onImsNotListedSelect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType('not-listed');
    setSchedulerConfig(DEFAULT_SCHEDULER_CONFIG);
    setConfigErrors({});
  }, []);

  const onPartnerDeselect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType(null);
    setSchedulerConfig(DEFAULT_SCHEDULER_CONFIG);
    setConfigErrors({});
  }, []);

  const goToEntry = useCallback(() => {
    setCurrentStep(ServiceSchedulerIntegrationStep.ENTRY);
  }, []);

  const goToSelection = useCallback(() => {
    setDealerId('');
    setNotListedPartnerName('');
    setNotListedPocName('');
    setNotListedPocEmail('');
    setNotListedPocContact('');
    setOemName('');
    setCurrentStep(ServiceSchedulerIntegrationStep.SELECTION);
  }, []);

  const getOnSecondaryButtonClickHandler = useCallback(() => {
    return goToSelection;
  }, [goToSelection]);

  const goToDetails = useCallback(() => {
    setCurrentStep(ServiceSchedulerIntegrationStep.DETAILS);
  }, []);

  const goToNotListed = useCallback(() => {
    setCurrentStep(ServiceSchedulerIntegrationStep.NOT_LISTED);
  }, []);

  const getBackHandler = () => {
    switch (currentStep) {
      case ServiceSchedulerIntegrationStep.DETAILS:
      case ServiceSchedulerIntegrationStep.NOT_LISTED:
        return goToSelection;
      case ServiceSchedulerIntegrationStep.SELECTION:
        return isDone ? goToEntry : () => goToPrevStep();
      case ServiceSchedulerIntegrationStep.CONFIGURATION:
        return selectedOptionType === 'not-listed'
          ? goToNotListed
          : goToDetails;
      default:
        return undefined;
    }
  };

  const showBackButton = currentStep !== ServiceSchedulerIntegrationStep.ENTRY;

  const handleContinueToNextOnboardingStep = async () => {
    setIsLoading(true);
    try {
      await updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION,
          agentType: agentTypeData?.agentType ?? '',
          agentCallType: agentTypeData?.agentCallType ?? '',
        },
        true
      );
      goToNextStep();
    } catch (error) {
      toast.error('Error updating onboarding task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFromSelection = () => {
    if (selectedOptionType === 'partner' && selectedProviderId) {
      setCurrentStep(ServiceSchedulerIntegrationStep.DETAILS);
    } else if (selectedOptionType === 'not-listed') {
      setCurrentStep(ServiceSchedulerIntegrationStep.NOT_LISTED);
    }
  };

  const handleContinueFromDetails = () => {
    setCurrentStep(ServiceSchedulerIntegrationStep.CONFIGURATION);
  };

  const handleContinueFromNotListed = () => {
    setCurrentStep(ServiceSchedulerIntegrationStep.CONFIGURATION);
  };

  const buildServiceSchedulerConfig = (): ServiceSchedulerConfig => {
    const show = FIELD_VISIBILITY[platformType];
    return {
      ...(show.availableSlotsDuration && {
        slotDuration: parseInt(schedulerConfig.slotDuration),
      }),
      ...(show.availableSlotsCapacity && {
        capacityPerSlot: parseInt(schedulerConfig.capacityPerSlot),
      }),
      ...(show.supportedMakes && {
        supportedMakes: schedulerConfig.supportedVehicles,
      }),
      ...(show.availableServices && {
        availableServices: schedulerConfig.availableServices,
      }),
      ...(show.serviceFacilities && {
        serviceFacilities: {
          pickAndDropoff:
            schedulerConfig.transportationOptions.pickupDropoff?.hasOpted ??
            false,
          loanerBookings:
            schedulerConfig.transportationOptions.loaner?.hasOpted ?? false,
          shuttle:
            schedulerConfig.transportationOptions.shuttle?.hasOpted ?? false,
        },
      }),
      ...(show.serviceRules && {
        serviceRules: schedulerConfig.serviceRules,
      }),
      ...(show.highlightPrices && {
        highlightPrices: schedulerConfig.returnPrice,
      }),
      ...(show.transferScenarios && {
        transferScenarios: schedulerConfig.additionalCallBackAndTransferRules,
      }),
      ...(show.upselling && {
        upselling: {
          isOpted: schedulerConfig.upsellingRules.isOpted,
          data: schedulerConfig.upsellingRules.data,
        },
      }),
    };
  };

  const handleSaveConfiguration = async () => {
    if (!validateConfig()) return;
    if (!enterpriseId || !teamId || !userId) {
      toast.error('Missing required information');
      return;
    }

    const serviceSchedulerConfig = buildServiceSchedulerConfig();
    setIsSubmitting(true);
    try {
      if (selectedOptionType === 'partner' && selectedProviderId) {
        const provider = partners.find((p) => p.id === selectedProviderId);
        if (!provider) {
          toast.error('Selected provider not found');
          return;
        }
        await createServiceSchedulerIntegration(
          enterpriseId,
          enterpriseName,
          teamId,
          teamName,
          userId,
          {
            partnerId: provider.id,
            partnerName: provider.name,
            dealerId: dealerId || undefined,
            logo: provider.icon,
            approved: false,
            ...(oemName ? { oemName: oemName } : {}),
          },
          serviceSchedulerConfig
        );
      } else if (selectedOptionType === 'not-listed') {
        await createServiceSchedulerIntegration(
          enterpriseId,
          enterpriseName,
          teamId,
          teamName,
          userId,
          {
            partnerName: notListedPartnerName.trim(),
            approved: false,
          },
          serviceSchedulerConfig
        );
      }

      const freshData = await fetchServiceSchedulerEntityConfig({
        enterpriseID: enterpriseId,
        TeamId: teamId,
      });
      setEntityConfig(freshData);
      toast.success('Service scheduler integration saved successfully');
      await handleContinueToNextOnboardingStep();
    } catch (error) {
      console.error('Failed to save service scheduler integration:', error);
      toast.error('Failed to save service scheduler integration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContinueHandler = () => {
    switch (currentStep) {
      case ServiceSchedulerIntegrationStep.SELECTION:
        return handleContinueFromSelection;
      case ServiceSchedulerIntegrationStep.DETAILS:
        return handleContinueFromDetails;
      case ServiceSchedulerIntegrationStep.NOT_LISTED:
        return handleContinueFromNotListed;
      case ServiceSchedulerIntegrationStep.CONFIGURATION:
        return handleSaveConfiguration;
      case ServiceSchedulerIntegrationStep.ENTRY:
      default:
        return handleContinueToNextOnboardingStep;
    }
  };

  const isContinueDisabled = () => {
    if (fetchingEntityConfig) return true;
    switch (currentStep) {
      case ServiceSchedulerIntegrationStep.SELECTION:
        return !selectedProviderId && selectedOptionType !== 'not-listed';
      case ServiceSchedulerIntegrationStep.DETAILS:
        return !dealerId.trim();
      case ServiceSchedulerIntegrationStep.NOT_LISTED:
        return !notListedPartnerName.trim();
      case ServiceSchedulerIntegrationStep.CONFIGURATION:
        return isLoading || isSubmitting;
      case ServiceSchedulerIntegrationStep.ENTRY:
      default:
        return isLoading || !isDone;
    }
  };

  const getContinueLabel = () => {
    switch (currentStep) {
      case ServiceSchedulerIntegrationStep.SELECTION:
        return 'Continue';
      case ServiceSchedulerIntegrationStep.DETAILS:
        return 'Continue';
      case ServiceSchedulerIntegrationStep.NOT_LISTED:
        return 'Continue';
      case ServiceSchedulerIntegrationStep.CONFIGURATION:
        return isSubmitting ? 'Saving...' : 'Save';
      case ServiceSchedulerIntegrationStep.ENTRY:
      default:
        return isLoading ? 'Saving...' : 'Next';
    }
  };

  const renderScreen = () => {
    switch (currentStep) {
      case ServiceSchedulerIntegrationStep.SELECTION:
        return (
          <PartnersSelection
            providerName="Service Scheduler"
            partnersData={partners}
            selectedPartnerId={selectedProviderId}
            selectedOptionType={selectedOptionType}
            handlePartnerClick={handlePartnerClick}
            onImsNotListedSelect={onImsNotListedSelect}
            onPartnerDeselect={onPartnerDeselect}
            loading={fetchingPartners}
            notListedLabel="My service scheduler is not listed here"
          />
        );
      case ServiceSchedulerIntegrationStep.CONFIGURATION:
        return (
          <ServiceSchedulerConfiguration
            partnerName={selectedProviderName}
            platformType={platformType}
            config={schedulerConfig}
            onConfigChange={handleConfigChange}
            errors={configErrors}
          />
        );
      case ServiceSchedulerIntegrationStep.DETAILS:
        return (
          <ServiceSchedulerDetails
            selectedProviderId={selectedProviderId ?? ''}
            getOnSecondaryButtonClickHandler={getOnSecondaryButtonClickHandler}
            dealerId={dealerId}
            setDealerId={setDealerId}
            partners={partners}
            oemName={oemName}
            setOemName={setOemName}
          />
        );
      case ServiceSchedulerIntegrationStep.NOT_LISTED:
        return (
          <ImsNotListedScreen
            onBack={goToSelection}
            partnerName={notListedPartnerName}
            onPartnerNameChange={setNotListedPartnerName}
            pocName={notListedPocName}
            onPocNameChange={setNotListedPocName}
            pocEmail={notListedPocEmail}
            onPocEmailChange={setNotListedPocEmail}
            pocContact={notListedPocContact}
            onPocContactChange={setNotListedPocContact}
            providerName="Service Scheduler"
            showHeader={true}
            showPocFields={false}
          />
        );
      case ServiceSchedulerIntegrationStep.ENTRY:
      default:
        if (fetchingEntityConfig) {
          return <CommonIntegrationCardShimmer />;
        }
        return (
          <CommonIntegrationCard
            title="Your Service Scheduler Partner"
            subtitle="Select your service scheduling provider"
            iconUrl={getSafeStaticAssetUrl(
              'https://spyne-static.s3.us-east-1.amazonaws.com/inventory-provider.svg'
            )}
            mandatory={true}
            disabled={false}
            onClick={() =>
              setCurrentStep(ServiceSchedulerIntegrationStep.SELECTION)
            }
            buttonLabel={isDone ? 'Change' : 'Add Now'}
            done={isDone}
            description={
              isDone ? (
                <ProviderInfoBadges
                  integrationType="Service Scheduler"
                  entityConfig={entityConfig?.entityconfig}
                />
              ) : null
            }
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden pl-8">
        <div className="mr-12 flex h-full flex-1 flex-col gap-6 overflow-hidden py-8">
          <OnboardingStepHeader
            title="Connect Your Service Scheduler"
            description="Set up your service scheduling integration to manage appointments"
          >
            <DurationHolder />
          </OnboardingStepHeader>
          <div key={currentStep} className="w-full overflow-y-auto">
            {renderScreen()}
          </div>
        </div>
      </div>

      <OnboardingFooter
        onContinue={getContinueHandler()}
        onBack={getBackHandler()}
        onSkip={
          currentStep === ServiceSchedulerIntegrationStep.SELECTION && !isDone
            ? () => goToNextStep()
            : undefined
        }
        showBackButton={showBackButton}
        disableContinue={isContinueDisabled()}
        continueLabel={getContinueLabel()}
      />
    </div>
  );
}
