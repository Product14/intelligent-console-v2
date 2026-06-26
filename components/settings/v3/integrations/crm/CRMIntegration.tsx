import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import {
  FtpEntityConfig,
  IntegrationEntityResponse,
  Partner,
} from '@/models/integrations.model';
import {
  createCrmIntegration,
  fetchCrmRegistryPartners,
  fetchEntityConfig,
  isIntegrationDone,
} from '@/services/settings/crm-integrations.service';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
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
import { CRMDetails } from '../crm/CRMDetails';
import CommonIntegrationCardShimmer from '../crm/common-integration-card-shimmer';
import ProviderInfoBadges from '../provider-info-badges';

export enum CRMIntegrationStep {
  ENTRY = 'entry',
  SELECTION = 'selection',
  DETAILS = 'details',
  NOT_LISTED = 'not-listed',
}

export type CrmSelectionType = 'partner' | 'not-listed' | null;

type IntegrationApiError = {
  message?: string;
  error?: string;
};

const getIntegrationErrorToastMessage = (
  error: unknown,
  fallbackMessage: string
) => {
  const apiError = error as IntegrationApiError;
  const message = apiError?.message || fallbackMessage;

  return apiError?.error ? `${message} (${apiError.error})` : message;
};

export default function CRMIntegration() {
  const [currentStep, setCurrentStep] = useState<CRMIntegrationStep>(
    CRMIntegrationStep.ENTRY
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
  const isDone = isIntegrationDone(entityConfig);

  const [partners, setPartners] = useState<Partner[]>([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [selectedOptionType, setSelectedOptionType] =
    useState<CrmSelectionType>(null);

  const [dealerId, setDealerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notListedPartnerName, setNotListedPartnerName] = useState('');
  const [notListedPocName, setNotListedPocName] = useState('');
  const [notListedPocEmail, setNotListedPocEmail] = useState('');
  const [notListedPocContact, setNotListedPocContact] = useState('');

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.CRM_INTEGRATION,
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
        const data = await fetchEntityConfig({
          enterpriseID: enterpriseId,
          TeamId: teamId,
          entity: 'CRM',
        });
        setEntityConfig(data);
        if (isIntegrationDone(data)) {
          setCurrentStep(CRMIntegrationStep.ENTRY);
          if (data?.entityconfig?.api) {
            const apiConfig = data.entityconfig.api as FtpEntityConfig;
            const partnerId = apiConfig.partnerId || null;
            if (partnerId) {
              setSelectedProviderId(partnerId);
              setSelectedOptionType('partner');
              setDealerId(apiConfig.dealerId || '');
            } else {
              setSelectedOptionType('not-listed');
              setNotListedPartnerName(apiConfig.partnerName || '');
              setNotListedPocName(apiConfig.poc_name || '');
              setNotListedPocEmail(apiConfig.poc_email || '');
              setNotListedPocContact(apiConfig.poc_contact || '');
            }
          }
        } else {
          setCurrentStep(CRMIntegrationStep.SELECTION);
        }
      } catch (error) {
        console.error('Failed to fetch CRM entity config:', error);
        setCurrentStep(CRMIntegrationStep.SELECTION);
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
        const data = await fetchCrmRegistryPartners('crm');
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch CRM partners:', error);
        toast.error('Failed to load CRM partners');
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

  const onImsNotListedSelect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType('not-listed');
  }, []);

  const onPartnerDeselect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType(null);
  }, []);

  const goToEntry = useCallback(() => {
    setCurrentStep(CRMIntegrationStep.ENTRY);
  }, []);

  const goToSelection = useCallback(() => {
    setCurrentStep(CRMIntegrationStep.SELECTION);
  }, []);

  const getOnSecondaryButtonClickHandler = useCallback(() => {
    return goToSelection;
  }, [goToSelection]);

  const getBackHandler = () => {
    switch (currentStep) {
      case CRMIntegrationStep.DETAILS:
      case CRMIntegrationStep.NOT_LISTED:
        return goToSelection;
      case CRMIntegrationStep.SELECTION:
        return isDone ? goToEntry : () => goToPrevStep();
      default:
        return undefined;
    }
  };

  const showBackButton = currentStep !== CRMIntegrationStep.ENTRY;

  const handleContinueToNextOnboardingStep = async () => {
    setIsLoading(true);
    try {
      await updateTaskAndRefresh(
        {
          productLineId: productLineId,
          taskName: OnboardingTaskName.CRM_INTEGRATION,
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

  const handleCreateCrmIntegration = async () => {
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
      const response = await createCrmIntegration(
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
        }
      );

      const freshData = await fetchEntityConfig({
        enterpriseID: enterpriseId,
        TeamId: teamId,
        entity: 'CRM',
      });
      setEntityConfig(freshData);
      setCurrentStep(CRMIntegrationStep.ENTRY);
      toast.success(response.message || 'CRM integration saved successfully');
    } catch (error) {
      console.error('Failed to create CRM integration:', error);
      toast.error(
        getIntegrationErrorToastMessage(error, 'Failed to save CRM integration')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueFromSelection = () => {
    if (selectedOptionType === 'partner' && selectedProviderId) {
      setCurrentStep(CRMIntegrationStep.DETAILS);
    } else if (selectedOptionType === 'not-listed') {
      setCurrentStep(CRMIntegrationStep.NOT_LISTED);
    }
  };

  const handleSubmitNotListed = async () => {
    if (!enterpriseId || !teamId || !userId) {
      toast.error('Missing required information');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createCrmIntegration(
        enterpriseId,
        enterpriseName,
        teamId,
        teamName,
        userId,
        {
          partnerName: notListedPartnerName.trim(),
          approved: false,
          poc_name: notListedPocName.trim(),
          poc_email: notListedPocEmail.trim(),
          poc_contact: notListedPocContact.trim(),
        }
      );

      const freshData = await fetchEntityConfig({
        enterpriseID: enterpriseId,
        TeamId: teamId,
        entity: 'CRM',
      });
      setEntityConfig(freshData);
      setCurrentStep(CRMIntegrationStep.ENTRY);
      toast.success(
        response.message || 'CRM integration request submitted successfully'
      );
    } catch (error) {
      console.error('Failed to submit not-listed CRM:', error);
      toast.error(
        getIntegrationErrorToastMessage(
          error,
          'Failed to submit CRM integration request'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContinueHandler = () => {
    switch (currentStep) {
      case CRMIntegrationStep.SELECTION:
        return handleContinueFromSelection;
      case CRMIntegrationStep.DETAILS:
        return handleCreateCrmIntegration;
      case CRMIntegrationStep.NOT_LISTED:
        return handleSubmitNotListed;
      case CRMIntegrationStep.ENTRY:
      default:
        return handleContinueToNextOnboardingStep;
    }
  };

  const isContinueDisabled = () => {
    if (fetchingEntityConfig || isSubmitting || isLoading) return true;
    switch (currentStep) {
      case CRMIntegrationStep.SELECTION:
        return !selectedProviderId && selectedOptionType !== 'not-listed';
      case CRMIntegrationStep.DETAILS:
        return isSubmitting || !dealerId.trim();
      case CRMIntegrationStep.NOT_LISTED:
        return isSubmitting || !notListedPartnerName.trim();
      case CRMIntegrationStep.ENTRY:
      default:
        return isLoading || !isDone;
    }
  };

  const getContinueLabel = () => {
    if (isSubmitting || isLoading) return 'Saving...';
    switch (currentStep) {
      case CRMIntegrationStep.SELECTION:
        return 'Continue';
      case CRMIntegrationStep.DETAILS:
        return 'Save';
      case CRMIntegrationStep.NOT_LISTED:
        return 'Confirm';
      case CRMIntegrationStep.ENTRY:
      default:
        return 'Next';
    }
  };

  const renderScreen = () => {
    switch (currentStep) {
      case CRMIntegrationStep.SELECTION:
        return (
          <PartnersSelection
            providerName="CRM"
            partnersData={partners}
            selectedPartnerId={selectedProviderId}
            selectedOptionType={selectedOptionType}
            handlePartnerClick={handlePartnerClick}
            onImsNotListedSelect={onImsNotListedSelect}
            onPartnerDeselect={onPartnerDeselect}
            loading={fetchingPartners}
            notListedLabel="My CRM is not listed here"
          />
        );
      case CRMIntegrationStep.DETAILS:
        return (
          <CRMDetails
            selectedProviderId={selectedProviderId ?? ''}
            getOnSecondaryButtonClickHandler={getOnSecondaryButtonClickHandler}
            isSubmitting={isSubmitting}
            dealerId={dealerId}
            setDealerId={setDealerId}
            partners={partners}
            enterpriseId={enterpriseId}
            teamId={teamId}
          />
        );
      case CRMIntegrationStep.NOT_LISTED:
        return (
          <ImsNotListedScreen
            onBack={goToSelection}
            providerName="CRM"
            partnerName={notListedPartnerName}
            onPartnerNameChange={setNotListedPartnerName}
            pocName={notListedPocName}
            onPocNameChange={setNotListedPocName}
            pocEmail={notListedPocEmail}
            onPocEmailChange={setNotListedPocEmail}
            pocContact={notListedPocContact}
            onPocContactChange={setNotListedPocContact}
          />
        );
      case CRMIntegrationStep.ENTRY:
      default:
        if (fetchingEntityConfig) {
          return <CommonIntegrationCardShimmer />;
        }
        return (
          <CommonIntegrationCard
            title="Your CRM Partner"
            subtitle="Select your CRM partner"
            iconUrl={getSafeStaticAssetUrl(
              'https://spyne-static.s3.us-east-1.amazonaws.com/inventory-provider.svg'
            )}
            mandatory={true}
            disabled={false}
            onClick={() => setCurrentStep(CRMIntegrationStep.SELECTION)}
            buttonLabel={isDone ? 'Change' : 'Add Now'}
            done={isDone}
            description={
              isDone ? (
                <ProviderInfoBadges
                  entityConfig={entityConfig?.entityconfig}
                  integrationType="CRM"
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
            title="Connect Your CRM"
            description="Set up your CRM integration to sync leads and customer data"
          >
            <DurationHolder />
          </OnboardingStepHeader>
          <div className="w-full overflow-y-auto">{renderScreen()}</div>
        </div>
      </div>

      <OnboardingFooter
        onContinue={getContinueHandler()}
        onBack={getBackHandler()}
        onSkip={
          currentStep === CRMIntegrationStep.SELECTION && !isDone
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
