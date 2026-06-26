import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import {
  IntegrationEntityResponse,
  Partner,
} from '@/models/integrations.model';
import {
  createCarHistoryIntegration,
  fetchCarHistoryEntityConfig,
  fetchCarHistoryPartners,
  isCarHistoryIntegrationDone,
} from '@/services/settings/car-history-integrations.service';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { useSelector } from '@spyne-console/store';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import {
  CommonIntegrationCard,
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

export enum CarHistoryIntegrationStep {
  ENTRY = 'entry',
  SELECTION = 'selection',
}

export type CarHistorySelectionType = 'partner' | null;

export default function CarHistoryIntegration() {
  const [currentStep, setCurrentStep] = useState<CarHistoryIntegrationStep>(
    CarHistoryIntegrationStep.ENTRY
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
  const isDone = isCarHistoryIntegrationDone(entityConfig);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [selectedOptionType, setSelectedOptionType] =
    useState<CarHistorySelectionType>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.CAR_HISTORY_INTEGRATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  useEffect(() => {
    if (!enterpriseId || !teamId) return;

    const loadEntityConfig = async () => {
      setFetchingEntityConfig(true);
      try {
        const data = await fetchCarHistoryEntityConfig({
          enterpriseID: enterpriseId,
          TeamId: teamId,
        });
        setEntityConfig(data);
        if (isCarHistoryIntegrationDone(data)) {
          setCurrentStep(CarHistoryIntegrationStep.ENTRY);
          if ((data?.entityconfig as any)?.partnerId) {
            setSelectedProviderId((data.entityconfig as any).partnerId || null);
            setSelectedOptionType('partner');
          }
        } else {
          setCurrentStep(CarHistoryIntegrationStep.SELECTION);
        }
      } catch (error) {
        console.error('Failed to fetch car history entity config:', error);
        setCurrentStep(CarHistoryIntegrationStep.SELECTION);
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
        const data = await fetchCarHistoryPartners();
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch car history partners:', error);
        toast.error('Failed to load car history partners');
      } finally {
        setFetchingPartners(false);
      }
    };

    loadPartners();
  }, []);

  const handlePartnerClick = useCallback((partnerId: string) => {
    setSelectedProviderId(partnerId);
    setSelectedOptionType('partner');
  }, []);

  const onPartnerDeselect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType(null);
  }, []);

  const goToEntry = useCallback(() => {
    setCurrentStep(CarHistoryIntegrationStep.ENTRY);
  }, []);

  const goToSelection = useCallback(() => {
    setCurrentStep(CarHistoryIntegrationStep.SELECTION);
  }, []);

  const getBackHandler = () => {
    switch (currentStep) {
      case CarHistoryIntegrationStep.SELECTION:
        return isDone ? goToEntry : () => goToPrevStep();
      default:
        return undefined;
    }
  };

  const showBackButton = currentStep !== CarHistoryIntegrationStep.ENTRY;

  const handleContinueToNextOnboardingStep = async () => {
    setIsLoading(true);
    try {
      await updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.CAR_HISTORY_INTEGRATION,
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

  const handleCreateCarHistoryIntegration = async () => {
    if (!selectedProviderId || !enterpriseId || !teamId || !userId) {
      toast.error('Missing required information');
      return;
    }

    const provider = partners.find((p) => p.id === selectedProviderId);
    if (!provider) {
      toast.error('Selected provider not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCarHistoryIntegration(
        enterpriseId,
        enterpriseName,
        teamId,
        teamName,
        userId,
        {
          partnerId: provider.id,
          partnerName: provider.name,
          logo: provider.icon,
          approved: false,
        }
      );

      const freshData = await fetchCarHistoryEntityConfig({
        enterpriseID: enterpriseId,
        TeamId: teamId,
      });
      setEntityConfig(freshData);
      setCurrentStep(CarHistoryIntegrationStep.ENTRY);
      toast.success('Car history integration saved successfully');
    } catch (error) {
      console.error('Failed to create car history integration:', error);
      toast.error('Failed to save car history integration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueFromSelection = () => {
    if (selectedOptionType === 'partner' && selectedProviderId) {
      handleCreateCarHistoryIntegration();
    }
  };

  const getContinueHandler = () => {
    switch (currentStep) {
      case CarHistoryIntegrationStep.SELECTION:
        return handleContinueFromSelection;
      case CarHistoryIntegrationStep.ENTRY:
      default:
        return handleContinueToNextOnboardingStep;
    }
  };

  const isContinueDisabled = () => {
    if (fetchingEntityConfig || isSubmitting || isLoading) return true;
    switch (currentStep) {
      case CarHistoryIntegrationStep.SELECTION:
        return !selectedProviderId || isSubmitting;
      case CarHistoryIntegrationStep.ENTRY:
      default:
        return isLoading;
    }
  };

  const getContinueLabel = () => {
    if (isSubmitting || isLoading) return 'Saving...';
    switch (currentStep) {
      case CarHistoryIntegrationStep.SELECTION:
        return 'Continue';
      case CarHistoryIntegrationStep.ENTRY:
      default:
        return 'Next';
    }
  };

  const renderScreen = () => {
    switch (currentStep) {
      case CarHistoryIntegrationStep.SELECTION:
        return (
          <PartnersSelection
            providerName="Car History"
            partnersData={partners}
            selectedPartnerId={selectedProviderId}
            selectedOptionType={selectedOptionType}
            handlePartnerClick={handlePartnerClick}
            onImsNotListedSelect={() => {}}
            onPartnerDeselect={onPartnerDeselect}
            loading={fetchingPartners}
            showNotListed={false}
          />
        );
      case CarHistoryIntegrationStep.ENTRY:
      default:
        if (fetchingEntityConfig) {
          return <CommonIntegrationCardShimmer />;
        }
        return (
          <CommonIntegrationCard
            title="Your Car History Partner"
            subtitle="Select your car history provider"
            iconUrl={getSafeStaticAssetUrl(
              'https://spyne-static.s3.us-east-1.amazonaws.com/inventory-provider.svg'
            )}
            mandatory={true}
            disabled={false}
            onClick={() => setCurrentStep(CarHistoryIntegrationStep.SELECTION)}
            buttonLabel={isDone ? 'Change' : 'Add Now'}
            done={isDone}
            description={
              isDone ? (
                <ProviderInfoBadges
                  entityConfig={entityConfig?.entityconfig}
                  integrationType="Car History"
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
            title="Connect Your Car History"
            description="Set up your car history integration to provide vehicle history reports"
          >
            <DurationHolder />
          </OnboardingStepHeader>
          <div className="w-full overflow-y-auto">{renderScreen()}</div>
        </div>
      </div>

      <OnboardingFooter
        onContinue={getContinueHandler()}
        onBack={getBackHandler()}
        showBackButton={showBackButton}
        disableContinue={isContinueDisabled()}
        continueLabel={getContinueLabel()}
      />
    </div>
  );
}
