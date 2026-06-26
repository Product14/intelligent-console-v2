import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useIntegrations } from '../../context';
import {
  ImsNotListedScreen,
  ImsOptionType,
  PartnerDetailsForm,
  ThanksScreen,
} from '../../index';
import { fetchPartners } from '../../integrations-service';
import StepWrapper from '../../step-wrapper';
import type { EntityConfig, OnboardingCallbacks, Partner } from '../../types';
import ImsSelectionScreen from './ims-selection/ims-selection-screen';
import PublicApiScreen, { ApiKeyData } from './public-api/public-api-screen';

type FlowScreen =
  | 'selection'
  | 'ims-details'
  | 'public-api'
  | 'no-ims'
  | 'thanks';
export type SelectionType =
  | 'ims-provider'
  | 'public-api'
  | 'no-ims'
  | 'ims-not-listed'
  | null;

// Helper to determine selection type from entityConfig
const getSelectionTypeFromConfig = (
  entityConfig: EntityConfig
): SelectionType => {
  if (entityConfig.ftp?.partnerId && entityConfig.ftp.partnerId !== '') {
    return 'ims-provider';
  }
  if (entityConfig.ftp?.partnerName && entityConfig.ftp.partnerName !== '') {
    return 'ims-not-listed';
  }
  if (entityConfig.api?.apiKey && entityConfig.api.apiKey !== '') {
    return 'public-api';
  }
  if (entityConfig.console === true) {
    return 'no-ims';
  }
  return null;
};

// Helper to get provider ID from entityConfig
const getProviderIdFromConfig = (entityConfig: EntityConfig): string | null => {
  if (entityConfig.ftp?.partnerId && entityConfig.ftp.partnerId !== '') {
    return entityConfig.ftp.partnerId;
  }
  return null;
};

// Helper to get API key data from entityConfig
const getApiKeyDataFromConfig = (
  entityConfig: EntityConfig
): ApiKeyData | null => {
  if (entityConfig.api?.apiKey && entityConfig.api.apiKey !== '') {
    return {
      name: entityConfig.api.name || 'API Key',
      apiKey: entityConfig.api.apiKey,
      dateCreated: entityConfig.api.dateCreated || '',
      createdBy: entityConfig.api.createdBy || '',
    };
  }
  return null;
};

interface InventoryProviderStepProps {
  onboardingCallbacks: OnboardingCallbacks;
}

const InventoryProviderStep: React.FC<InventoryProviderStepProps> = ({
  onboardingCallbacks,
}) => {
  const { handlePrevStep, handleSkipStep, onboardingStartTime } =
    onboardingCallbacks;
  const {
    confirmStep,
    goToMainScreen,
    goToStep,
    steps,
    allMandatoryDone,
    allStepsDone,
    integrationsData,
    enterpriseId,
    teamId,
    userId,
    userEmail,
    inventoryOnly,
  } = useIntegrations();

  const inventoryStep = steps.find((step) => step.id === 'inventory-provider');
  const inventoryIsDone = inventoryStep?.done ?? false;
  const inventoryProviderData = integrationsData.inventory;
  const entityConfig: EntityConfig = inventoryProviderData?.entityconfig || {};

  // Derive initial values from entityConfig
  const initialSelectedOptionType = useMemo(
    () => getSelectionTypeFromConfig(entityConfig),
    [entityConfig]
  );
  const initialSelectedProviderId = useMemo(
    () => getProviderIdFromConfig(entityConfig),
    [entityConfig]
  );

  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('selection');
  const [selectedOptionType, setSelectedOptionType] = useState<SelectionType>(
    initialSelectedOptionType
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    initialSelectedProviderId
  );
  const [existingApiKey, setExistingApiKey] = useState<ApiKeyData | null>(
    getApiKeyDataFromConfig(entityConfig)
  );
  const [dealerId, setDealerId] = useState<string>(
    entityConfig.ftp?.dealerId || ''
  );
  const [partnerName, setPartnerName] = useState<string>(
    entityConfig.ftp?.partnerName || ''
  );
  const [pocName, setPocName] = useState<string>(
    entityConfig.ftp?.poc_name || ''
  );
  const [pocEmail, setPocEmail] = useState<string>(
    entityConfig.ftp?.poc_email || ''
  );
  const [pocContact, setPocContact] = useState<string>(
    entityConfig.ftp?.poc_contact || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);
  const [imsNotListedHasError, setImsNotListedHasError] = useState(false);

  // Fetch partners on mount
  useEffect(() => {
    const loadPartners = async () => {
      setFetchingPartners(true);
      try {
        const data = await fetchPartners({ entity: 'IMS' });
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch IMS partners:', error);
      } finally {
        setFetchingPartners(false);
      }
    };
    loadPartners();
  }, []);

  // Sync state when entityConfig changes
  useEffect(() => {
    const newOptionType = getSelectionTypeFromConfig(entityConfig);
    const newProviderId = getProviderIdFromConfig(entityConfig);

    if (newOptionType !== null) {
      setSelectedOptionType(newOptionType);
    }
    if (newProviderId !== null) {
      setSelectedProviderId(newProviderId);
    }
  }, [entityConfig]);

  const handleProviderSelect = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
    setSelectedOptionType('ims-provider');
  }, []);

  const handleProviderDeselect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType(null);
  }, []);

  const handleAlternativeSelect = useCallback((optionType: ImsOptionType) => {
    setSelectedProviderId(null);
    setSelectedOptionType(optionType);
  }, []);

  const handleImsNotListedSelect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType('ims-not-listed');
  }, []);

  const handleBack = () => {
    if (allMandatoryDone) {
      goToMainScreen();
    } else {
      handlePrevStep();
    }
  };

  const canProceed = useMemo(() => {
    switch (currentScreen) {
      case 'selection':
        return selectedOptionType !== null;
      case 'ims-details':
        return selectedProviderId !== null && dealerId.trim() !== '';
      case 'public-api':
        return existingApiKey !== null;
      case 'no-ims':
        return partnerName.trim() !== '' && !imsNotListedHasError;
      default:
        return true;
    }
  }, [
    currentScreen,
    selectedOptionType,
    selectedProviderId,
    dealerId,
    partnerName,
    existingApiKey,
    imsNotListedHasError,
  ]);

  const handleProceedToNextStep = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (isSubmitting) return;

    if (currentScreen === 'selection' && selectedOptionType === 'no-ims') {
      setIsSubmitting(true);
      try {
        const entityConfigPayload: EntityConfig = {
          app: true,
          console: true,
          partnerProviderTypes: ['IMS'],
        };
        await confirmStep('inventory-provider', entityConfigPayload);
      } catch {
        // Error already handled by confirmStep (toast shown)
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentScreen === 'ims-details' && selectedProviderId) {
      const provider = partners.find((p) => p.id === selectedProviderId);
      if (!provider || !dealerId.trim()) return;

      setIsSubmitting(true);
      try {
        const entityConfigPayload: EntityConfig = {
          ftp: {
            partnerId: provider.id,
            partnerName: provider.name,
            dealerId: dealerId.trim(),
            approved: false,
            logo: provider.icon,
            isActive: true,
            ...(entityConfig.ftp?.workflowId && {
              workflowId: entityConfig.ftp.workflowId,
            }),
          },
          partnerProviderTypes: ['IMS'],
        };
        await confirmStep('inventory-provider', entityConfigPayload);
      } catch {
        // Error already handled by confirmStep (toast shown)
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentScreen === 'no-ims' && partnerName.trim()) {
      setIsSubmitting(true);
      try {
        const entityConfigPayload: EntityConfig = {
          ftp: {
            partnerName: partnerName.trim(),
            approved: false,
            poc_name: pocName.trim(),
            poc_email: pocEmail.trim(),
            poc_contact: pocContact.trim(),
          },
          partnerProviderTypes: ['IMS'],
        };
        await confirmStep('inventory-provider', entityConfigPayload, true);
        setCurrentScreen('thanks');
      } catch {
        // Error already handled by confirmStep (toast shown)
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentScreen === 'public-api' && existingApiKey) {
      setIsSubmitting(true);
      try {
        const entityConfigPayload: EntityConfig = {
          api: {
            name: existingApiKey.name,
            apiKey: existingApiKey.apiKey,
            dateCreated: existingApiKey.dateCreated,
            createdBy: existingApiKey.createdBy,
          },
          partnerProviderTypes: ['IMS'],
        };
        await confirmStep('inventory-provider', entityConfigPayload);
      } catch {
        // Error already handled by confirmStep (toast shown)
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    isSubmitting,
    currentScreen,
    selectedOptionType,
    selectedProviderId,
    partners,
    dealerId,
    entityConfig,
    partnerName,
    pocName,
    pocEmail,
    pocContact,
    existingApiKey,
    confirmStep,
  ]);

  const handleContinueFromSelection = useCallback(async () => {
    if (!selectedOptionType) return;

    switch (selectedOptionType) {
      case 'ims-provider':
        setCurrentScreen('ims-details');
        break;
      case 'public-api':
        setCurrentScreen('public-api');
        break;
      case 'no-ims':
        await handleProceedToNextStep();
        break;
      case 'ims-not-listed':
        setCurrentScreen('no-ims');
        break;
      default:
        break;
    }
  }, [selectedOptionType, handleProceedToNextStep]);

  const handleBackFromDetailScreen = useCallback(() => {
    setCurrentScreen('selection');
  }, []);

  const getOnSecondaryButtonClickHandler = () => {
    if (currentScreen === 'selection') {
      return handleBack;
    }
    return handleBackFromDetailScreen;
  };

  const handleThanksScreenNext = useCallback(() => {
    if (allStepsDone) {
      goToMainScreen();
      return;
    }
    const nextNonMandatoryStep = steps.find(
      (step) => !step.mandatory && !step.done && !step.disabled
    );
    if (nextNonMandatoryStep) {
      goToStep(nextNonMandatoryStep.id);
    } else {
      goToMainScreen();
    }
  }, [allStepsDone, steps, goToStep, goToMainScreen]);

  const getOnNextHandler = () => {
    if (currentScreen === 'selection') {
      return handleContinueFromSelection;
    }
    if (currentScreen === 'thanks') {
      return handleThanksScreenNext;
    }
    return handleProceedToNextStep;
  };

  const getStepWrapperProps = (): {
    title: string;
    subtitle: string;
    onNext: () => void;
    secondaryButtonLabel?: string;
    secondaryButtonOnClick: () => void;
    isLastStep: boolean;
    isNextDisabled: boolean;
    hideFooter?: boolean;
    hideHeader?: boolean;
    nextLabel?: string;
  } => {
    const baseProps = {
      title: 'Connect your IMS',
      subtitle: 'Choose an IMS Provider',
      onNext: getOnNextHandler(),
      secondaryButtonOnClick: getOnSecondaryButtonClickHandler(),
      isLastStep: false,
      isNextDisabled: !canProceed || isSubmitting,
    };

    switch (currentScreen) {
      case 'selection':
        return {
          ...baseProps,
          title: 'Connect your IMS',
          subtitle: 'Choose an IMS Provider',
          nextLabel: 'Continue',
          secondaryButtonLabel: 'Back',
        };
      case 'ims-details':
        return {
          ...baseProps,
          title: 'Connect your IMS',
          subtitle: 'Enter your IMS details',
          hideHeader: true,
          nextLabel: 'Confirm',
          secondaryButtonLabel: 'Back',
        };
      case 'public-api':
        return {
          ...baseProps,
          title: 'Connect your IMS',
          subtitle: 'Use Public API',
          hideHeader: true,
          nextLabel: 'Continue',
          secondaryButtonLabel: 'Back',
        };
      case 'no-ims':
        return {
          ...baseProps,
          title: 'Connect your IMS',
          subtitle: 'Enter your IMS name',
          hideHeader: true,
          nextLabel: 'Confirm',
          secondaryButtonLabel: 'Back',
        };
      case 'thanks':
        return {
          ...baseProps,
          title: 'Thank you for connecting your IMS',
          subtitle: 'We will use your IMS to import media into your inventory',
          hideHeader: true,
          nextLabel: 'Confirm',
        };
      default:
        return baseProps;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'selection':
        return (
          <ImsSelectionScreen
            selectedProviderId={selectedProviderId}
            selectedOptionType={selectedOptionType}
            onProviderSelect={handleProviderSelect}
            onProviderDeselect={handleProviderDeselect}
            onAlternativeSelect={handleAlternativeSelect}
            onImsNotListedSelect={handleImsNotListedSelect}
            partners={partners}
            loadingPartners={fetchingPartners}
          />
        );
      case 'ims-details':
        return selectedProviderId ? (
          <PartnerDetailsForm
            selectedProviderId={selectedProviderId}
            onBack={getOnSecondaryButtonClickHandler()}
            providerName={'IMS'}
            loading={isSubmitting}
            dealerId={dealerId}
            onDealerIdChange={setDealerId}
            partners={partners}
          />
        ) : null;
      case 'public-api':
        return (
          <PublicApiScreen
            onBack={getOnSecondaryButtonClickHandler()}
            existingApiKey={existingApiKey}
            onApiKeyGenerated={setExistingApiKey}
            loading={isSubmitting}
            enterpriseId={enterpriseId}
            teamId={teamId}
            userId={userId}
            userEmail={userEmail}
          />
        );
      case 'no-ims':
        return (
          <ImsNotListedScreen
            onBack={getOnSecondaryButtonClickHandler()}
            partnerName={partnerName}
            onPartnerNameChange={setPartnerName}
            pocName={pocName}
            onPocNameChange={setPocName}
            pocEmail={pocEmail}
            onPocEmailChange={setPocEmail}
            pocContact={pocContact}
            onPocContactChange={setPocContact}
            onValidationChange={setImsNotListedHasError}
          />
        );
      case 'thanks':
        return <ThanksScreen />;
      default:
        return null;
    }
  };

  const stepWrapperProps = getStepWrapperProps();

  return (
    <StepWrapper
      title={stepWrapperProps.title || 'Connect your IMS'}
      subtitle={stepWrapperProps.subtitle || 'Choose an IMS Provider'}
      onNext={stepWrapperProps.onNext}
      secondaryButtonLabel={stepWrapperProps?.secondaryButtonLabel || undefined}
      secondaryButtonOnClick={
        stepWrapperProps?.secondaryButtonOnClick || undefined
      }
      isLastStep={stepWrapperProps.isLastStep}
      isNextDisabled={stepWrapperProps.isNextDisabled}
      hideFooter={stepWrapperProps.hideFooter}
      hideHeader={stepWrapperProps.hideHeader}
      nextLabel={stepWrapperProps.nextLabel}
      onboardingStartTime={onboardingStartTime}
      onSkip={
        inventoryOnly && currentScreen === 'selection' && !inventoryIsDone
          ? handleSkipStep
          : undefined
      }
    >
      <div className="h-full w-full flex-1">{renderScreen()}</div>
    </StepWrapper>
  );
};

export default InventoryProviderStep;
