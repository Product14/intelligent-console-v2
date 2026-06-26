import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useIntegrations } from '../../context';
import {
  ImsNotListedScreen,
  PartnerDetailsForm,
  PartnersSelection,
  ThanksScreen,
} from '../../index';
import type { ThresholdConfig } from '../../index';
import { fetchPartners } from '../../integrations-service';
import StepWrapper from '../../step-wrapper';
import type { EntityConfig, OnboardingCallbacks, Partner } from '../../types';
import MainCgiProviderScreen from './main-screen';

type FlowScreen =
  | 'main'
  | 'partner-selection'
  | 'partner-form'
  | 'ims-not-listed'
  | 'thanks';
type CgiOption = 'media-cloning' | 'different-partner';
type SelectionType = 'partner' | 'not-listed' | null;

// Helper to determine CGI option from entityConfig
const getCgiOptionFromConfig = (
  entityConfig: EntityConfig | null | undefined
): CgiOption => {
  if (!entityConfig) return 'different-partner';
  if (entityConfig.mediaclone === true) {
    return 'media-cloning';
  }
  return 'different-partner';
};

// Helper to get provider ID from entityConfig
const getProviderIdFromConfig = (
  entityConfig: EntityConfig | null | undefined
): string | null => {
  if (entityConfig?.ftp?.partnerId && entityConfig.ftp.partnerId !== '') {
    return entityConfig.ftp.partnerId;
  }
  return null;
};

// Helper to determine selection type from entityConfig
const getSelectionTypeFromConfig = (
  entityConfig: EntityConfig | null | undefined
): SelectionType => {
  if (entityConfig?.ftp?.partnerId && entityConfig.ftp.partnerId !== '') {
    return 'partner';
  }
  if (entityConfig?.ftp?.partnerName && entityConfig.ftp.partnerName !== '') {
    return 'not-listed';
  }
  return null;
};

interface StepWrapperPropsType {
  title: string;
  subtitle: string;
  onNext: () => void;
  secondaryButtonOnClick: () => void;
  isLastStep: boolean;
  isNextDisabled: boolean;
  nextLabel?: string;
  secondaryButtonLabel?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

interface CgiProviderStepProps {
  onboardingCallbacks: OnboardingCallbacks;
}

const CgiProviderStep: React.FC<CgiProviderStepProps> = ({
  onboardingCallbacks,
}) => {
  const { onboardingStartTime } = onboardingCallbacks;
  const {
    confirmStep,
    goToMainScreen,
    integrationsData,
    loading,
    enterpriseId,
    teamId,
  } = useIntegrations();

  // Get CGI provider entity config
  const cgiProviderData = integrationsData.cgi;
  const entityConfig: EntityConfig = useMemo(
    () => cgiProviderData?.entityconfig || {},
    [cgiProviderData?.entityconfig]
  );

  // Derive initial values from entityConfig
  const initialCgiOption = useMemo(
    () => getCgiOptionFromConfig(entityConfig),
    [entityConfig]
  );
  const initialSelectedProviderId = useMemo(
    () => getProviderIdFromConfig(entityConfig),
    [entityConfig]
  );
  const initialSelectionType = useMemo(
    () => getSelectionTypeFromConfig(entityConfig),
    [entityConfig]
  );

  // State management
  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('main');
  const [selectedCgiOption, setSelectedCgiOption] =
    useState<CgiOption>(initialCgiOption);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    initialSelectedProviderId
  );
  const [selectedOptionType, setSelectedOptionType] =
    useState<SelectionType>(initialSelectionType);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [threshold, setThreshold] = useState<ThresholdConfig>({
    newChecked:
      entityConfig.ftp?.threshold?.new !== undefined &&
      entityConfig.ftp.threshold.new >= 0,
    preOwnedChecked:
      entityConfig.ftp?.threshold?.preOwned !== undefined &&
      entityConfig.ftp.threshold.preOwned >= 0,
    newValue:
      entityConfig.ftp?.threshold?.new !== undefined &&
      entityConfig.ftp.threshold.new >= 0
        ? entityConfig.ftp.threshold.new
        : 0,
    preOwnedValue:
      entityConfig.ftp?.threshold?.preOwned !== undefined &&
      entityConfig.ftp.threshold.preOwned >= 0
        ? entityConfig.ftp.threshold.preOwned
        : 0,
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [fetchingPartners, setFetchingPartners] = useState(false);
  const [imsNotListedHasError, setImsNotListedHasError] = useState(false);

  // Fetch partners on mount
  useEffect(() => {
    const loadPartners = async () => {
      setFetchingPartners(true);
      try {
        const data = await fetchPartners({ entity: 'CGI' });
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch CGI partners:', error);
      } finally {
        setFetchingPartners(false);
      }
    };
    loadPartners();
  }, []);

  // Sync state when entityConfig changes
  useEffect(() => {
    const newCgiOption = getCgiOptionFromConfig(entityConfig);
    const newProviderId = getProviderIdFromConfig(entityConfig);
    const newSelectionType = getSelectionTypeFromConfig(entityConfig);

    setSelectedCgiOption(newCgiOption);
    if (newProviderId !== null) {
      setSelectedProviderId(newProviderId);
    }
    if (newSelectionType !== null) {
      setSelectedOptionType(newSelectionType);
    }
    if (entityConfig.ftp?.dealerId) {
      setDealerId(entityConfig.ftp.dealerId);
    }
    if (entityConfig.ftp?.partnerName) {
      setPartnerName(entityConfig.ftp.partnerName);
    }
  }, [entityConfig]);

  const handleCgiOptionChange = useCallback((option: CgiOption) => {
    setSelectedCgiOption(option);
  }, []);

  const handleUseDifferentPartner = useCallback(() => {
    setCurrentScreen('partner-selection');
  }, []);

  const handlePartnerClick = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
    setSelectedOptionType('partner');
  }, []);

  const handlePartnerDeselect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType(null);
  }, []);

  const handleImsNotListedSelect = useCallback(() => {
    setSelectedProviderId(null);
    setSelectedOptionType('not-listed');
  }, []);

  const handleContinueFromSelection = useCallback(() => {
    if (selectedOptionType === 'partner' && selectedProviderId) {
      setCurrentScreen('partner-form');
    } else if (selectedOptionType === 'not-listed') {
      setCurrentScreen('ims-not-listed');
    }
  }, [selectedOptionType, selectedProviderId]);

  const handleBackFromDetailScreen = useCallback(() => {
    if (
      currentScreen === 'partner-form' ||
      currentScreen === 'ims-not-listed'
    ) {
      setCurrentScreen('partner-selection');
    } else if (currentScreen === 'partner-selection') {
      setCurrentScreen('main');
      setSelectedProviderId(null);
      setSelectedOptionType(null);
    }
  }, [currentScreen]);

  const handleMainConfirm = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (selectedCgiOption === 'media-cloning') {
        const config: EntityConfig = {
          mediaclone: true,
          partnerProviderTypes: ['CGI'],
        };
        await confirmStep('cgi-provider', config);
      } else {
        setCurrentScreen('partner-selection');
      }
    } catch {
      // Error already handled by confirmStep
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, selectedCgiOption, confirmStep]);

  const buildThresholdPayload = useCallback(() => {
    return {
      new: threshold.newChecked ? threshold.newValue : -1,
      preOwned: threshold.preOwnedChecked ? threshold.preOwnedValue : -1,
    };
  }, [threshold]);

  const handleProceedToNextStep = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (isSubmitting) return;

    if (currentScreen === 'partner-form' && selectedProviderId) {
      const provider = partners.find((p) => p.id === selectedProviderId);
      if (!provider || !dealerId.trim()) return;

      setIsSubmitting(true);
      try {
        const thresholdPayload = buildThresholdPayload();
        const config: EntityConfig = {
          ftp: {
            partnerId: provider.id,
            partnerName: provider.name,
            dealerId: dealerId.trim(),
            approved: false,
            logo: provider.icon,
            isActive: true,
            threshold: thresholdPayload,
            ...(entityConfig.ftp?.workflowId && {
              workflowId: entityConfig.ftp.workflowId,
            }),
          },
          partnerProviderTypes: ['CGI'],
        };
        await confirmStep('cgi-provider', config);
      } catch {
        // Error already handled
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentScreen === 'ims-not-listed' && partnerName.trim()) {
      setIsSubmitting(true);
      try {
        const config: EntityConfig = {
          ftp: {
            partnerName: partnerName.trim(),
            approved: false,
            poc_name: pocName.trim(),
            poc_email: pocEmail.trim(),
            poc_contact: pocContact.trim(),
          },
          partnerProviderTypes: ['CGI'],
        };
        await confirmStep('cgi-provider', config, true);
        setCurrentScreen('thanks');
      } catch {
        // Error already handled
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    isSubmitting,
    currentScreen,
    selectedProviderId,
    dealerId,
    partnerName,
    pocName,
    pocEmail,
    pocContact,
    partners,
    confirmStep,
    buildThresholdPayload,
    entityConfig,
  ]);

  const handleSkip = useCallback(() => {
    goToMainScreen();
  }, [goToMainScreen]);

  const handleBack = useCallback(() => {
    goToMainScreen();
  }, [goToMainScreen]);

  const canProceed = useMemo(() => {
    switch (currentScreen) {
      case 'main':
        return true;
      case 'partner-selection':
        if (selectedOptionType === 'partner') {
          return selectedProviderId !== null;
        }
        return selectedOptionType === 'not-listed';
      case 'partner-form':
        return selectedProviderId !== null && dealerId.trim() !== '';
      case 'ims-not-listed':
        return partnerName.trim() !== '' && !imsNotListedHasError;
      case 'thanks':
        return true;
      default:
        return false;
    }
  }, [
    currentScreen,
    selectedOptionType,
    selectedProviderId,
    dealerId,
    partnerName,
    imsNotListedHasError,
  ]);

  const getOnNextHandler = () => {
    switch (currentScreen) {
      case 'main':
        return handleMainConfirm;
      case 'partner-selection':
        return handleContinueFromSelection;
      case 'partner-form':
      case 'ims-not-listed':
        return handleProceedToNextStep;
      case 'thanks':
        return goToMainScreen;
      default:
        return () => {};
    }
  };

  const getOnBackHandler = () => {
    switch (currentScreen) {
      case 'main':
        return handleBack;
      case 'partner-selection':
      case 'partner-form':
      case 'ims-not-listed':
        return handleBackFromDetailScreen;
      default:
        return handleBack;
    }
  };

  const getStepWrapperProps = (): StepWrapperPropsType => {
    const baseProps: StepWrapperPropsType = {
      title: 'CGI Provider',
      subtitle: 'Configure your CGI rendering settings',
      onNext: getOnNextHandler(),
      secondaryButtonOnClick: getOnBackHandler(),
      isLastStep: false,
      isNextDisabled:
        !canProceed || isSubmitting || loading || fetchingPartners,
    };

    switch (currentScreen) {
      case 'main':
        return {
          ...baseProps,
          title: 'How do you like to proceed with your CGI provider',
          subtitle: 'Choose your CGI input type to proceed',
          nextLabel: 'Confirm',
        };
      case 'partner-selection':
        return {
          ...baseProps,
          title: 'Connect a CGI partner',
          subtitle: 'Choose a CGI provider',
          nextLabel: 'Confirm',
          secondaryButtonLabel: 'Back',
        };
      case 'partner-form':
        return {
          ...baseProps,
          title: 'Enter your CGI Provider details',
          subtitle: 'Connect your CGI provider',
          nextLabel: 'Confirm',
          hideHeader: true,
          secondaryButtonLabel: 'Back',
        };
      case 'ims-not-listed':
        return {
          ...baseProps,
          title: 'Enter your CGI Provider name',
          subtitle: 'Tell us about your CGI provider',
          nextLabel: 'Confirm',
          hideHeader: true,
          secondaryButtonLabel: 'Back',
        };
      case 'thanks':
        return {
          ...baseProps,
          title: 'Thank you for connecting your CGI Provider',
          subtitle: 'Our onboarding team will get back to you',
          hideHeader: true,
          nextLabel: 'Continue',
        };
      default:
        return baseProps;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return (
          <MainCgiProviderScreen
            selectedOption={selectedCgiOption}
            onOptionChange={handleCgiOptionChange}
            onUseDifferentPartner={handleUseDifferentPartner}
            loading={isSubmitting || loading}
          />
        );
      case 'partner-selection':
        return (
          <PartnersSelection
            providerName="CGI Provider"
            partnersData={partners}
            selectedPartnerId={selectedProviderId}
            selectedOptionType={selectedOptionType}
            handlePartnerClick={handlePartnerClick}
            onImsNotListedSelect={handleImsNotListedSelect}
            onPartnerDeselect={handlePartnerDeselect}
            loading={fetchingPartners}
          />
        );
      case 'partner-form':
        return selectedProviderId ? (
          <PartnerDetailsForm
            onBack={handleBackFromDetailScreen}
            providerName="CGI Provider"
            selectedProviderId={selectedProviderId}
            loading={isSubmitting}
            dealerId={dealerId}
            onDealerIdChange={setDealerId}
            partners={partners}
            showThreshold
            threshold={threshold}
            onThresholdChange={setThreshold}
            enterpriseId={enterpriseId}
            teamId={teamId}
          />
        ) : null;
      case 'ims-not-listed':
        return (
          <ImsNotListedScreen
            providerName="CGI Provider"
            onBack={handleBackFromDetailScreen}
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
      title={stepWrapperProps.title || 'CGI Provider'}
      subtitle={
        stepWrapperProps.subtitle || 'Configure your CGI rendering settings'
      }
      onNext={stepWrapperProps.onNext}
      secondaryButtonLabel={stepWrapperProps.secondaryButtonLabel}
      secondaryButtonOnClick={
        currentScreen === 'main'
          ? handleSkip
          : stepWrapperProps.secondaryButtonOnClick
      }
      isLastStep={stepWrapperProps.isLastStep}
      isNextDisabled={stepWrapperProps.isNextDisabled}
      hideHeader={stepWrapperProps.hideHeader}
      hideFooter={stepWrapperProps.hideFooter}
      nextLabel={stepWrapperProps.nextLabel}
      onboardingStartTime={onboardingStartTime}
    >
      <div className="h-full w-full flex-1">{renderScreen()}</div>
    </StepWrapper>
  );
};

export default CgiProviderStep;
