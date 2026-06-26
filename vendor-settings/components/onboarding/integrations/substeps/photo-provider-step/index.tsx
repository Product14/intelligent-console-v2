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
import MainPhotoProviderScreen from './main-screen';

type FlowScreen =
  | 'main'
  | 'ims-selection'
  | 'ims-form'
  | 'ims-not-listed'
  | 'thanks';
type SelectionType = 'partner' | 'not-listed' | null;

// Helper to determine selection type from entityConfig
const getSelectionTypeFromConfig = (
  entityConfig: EntityConfig
): SelectionType => {
  if (entityConfig.ftp?.partnerId && entityConfig.ftp.partnerId !== '') {
    return 'partner';
  }
  if (entityConfig.ftp?.partnerName && entityConfig.ftp.partnerName !== '') {
    return 'not-listed';
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

interface PhotoProviderStepProps {
  onboardingCallbacks: OnboardingCallbacks;
}

const PhotoProviderStep: React.FC<PhotoProviderStepProps> = ({
  onboardingCallbacks,
}) => {
  const { onboardingStartTime } = onboardingCallbacks;
  const {
    confirmStep,
    goToMainScreen,
    allMandatoryDone,
    integrationsData,
    loading,
    enterpriseId,
    teamId,
  } = useIntegrations();

  // Get photo provider entity config
  const photoProviderData = integrationsData.photo;
  const entityConfig: EntityConfig = photoProviderData?.entityconfig || {};

  // Get existing inventory FTP config (if any)
  const inventoryFtpConfig = integrationsData.inventory?.entityconfig?.ftp;
  const hasInventoryFtp = !!(
    inventoryFtpConfig?.partnerId || inventoryFtpConfig?.partnerName
  );

  // Derive initial values from entityConfig
  const initialSelectedOptionType = useMemo(
    () => getSelectionTypeFromConfig(entityConfig),
    [entityConfig]
  );
  const initialSelectedProviderId = useMemo(
    () => getProviderIdFromConfig(entityConfig),
    [entityConfig]
  );

  // Preserve the photoWorkflowId from the initial photo entity response
  const initialPhotoWorkflowId = useMemo(
    () => entityConfig.ftp?.photoWorkflowId || '',
    [entityConfig.ftp?.photoWorkflowId]
  );

  // State management
  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('main');
  const [useInventoryIms, setUseInventoryIms] = useState<boolean>(false);
  const [useDifferentPartner, setUseDifferentPartner] =
    useState<boolean>(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    initialSelectedProviderId
  );
  const [selectedOptionType, setSelectedOptionType] = useState<SelectionType>(
    initialSelectedOptionType
  );
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
        const data = await fetchPartners({ entity: 'PHOTO' });
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch PHOTO partners:', error);
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
    if (entityConfig.ftp?.dealerId) {
      setDealerId(entityConfig.ftp.dealerId);
    }
    if (entityConfig.ftp?.partnerName) {
      setPartnerName(entityConfig.ftp.partnerName);
    }
  }, [entityConfig]);

  // Get inventory provider info for display
  const inventoryProviderInfo = useMemo(() => {
    if (!hasInventoryFtp || !inventoryFtpConfig) return null;
    return {
      partnerId: inventoryFtpConfig.partnerId || '',
      partnerName: inventoryFtpConfig.partnerName || '',
      icon: inventoryFtpConfig.logo || '',
    };
  }, [hasInventoryFtp, inventoryFtpConfig]);

  const handleSelectInventoryIms = useCallback(() => {
    setUseInventoryIms((prev) => {
      if (prev) return false;
      setUseDifferentPartner(false);
      return true;
    });
  }, []);

  const handleSelectDifferentPartner = useCallback(() => {
    setUseDifferentPartner((prev) => {
      if (prev) return false;
      setUseInventoryIms(false);
      return true;
    });
  }, []);

  // Determine initial selection based on whether photo partner matches inventory partner
  useEffect(() => {
    const photoPartnerId = entityConfig.ftp?.partnerId;
    const inventoryPartnerId = inventoryFtpConfig?.partnerId;

    if (photoPartnerId && inventoryPartnerId) {
      if (photoPartnerId === inventoryPartnerId) {
        setUseInventoryIms(true);
        setUseDifferentPartner(false);
      } else {
        setUseInventoryIms(false);
        setUseDifferentPartner(true);
      }
    } else {
      setUseInventoryIms(false);
      setUseDifferentPartner(false);
    }
  }, [
    entityConfig.ftp?.partnerId,
    inventoryFtpConfig?.partnerId,
    hasInventoryFtp,
  ]);

  const handleConfirmInventoryIms = useCallback(() => {
    if (!inventoryFtpConfig) return;
    setSelectedProviderId(inventoryFtpConfig.partnerId || null);
    setSelectedOptionType(inventoryFtpConfig.partnerId ? 'partner' : null);
    setDealerId(inventoryFtpConfig.dealerId || '');
    setCurrentScreen('ims-form');
  }, [inventoryFtpConfig]);

  const handleUseDifferentPartner = useCallback(() => {
    setCurrentScreen('ims-selection');
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
      setCurrentScreen('ims-form');
    } else if (selectedOptionType === 'not-listed') {
      setCurrentScreen('ims-not-listed');
    }
  }, [selectedOptionType, selectedProviderId]);

  const handleBackFromDetailScreen = useCallback(() => {
    if (currentScreen === 'ims-form' && useInventoryIms) {
      setCurrentScreen('main');
    } else if (
      currentScreen === 'ims-form' ||
      currentScreen === 'ims-not-listed'
    ) {
      setCurrentScreen('ims-selection');
    } else if (currentScreen === 'ims-selection') {
      setCurrentScreen('main');
      setSelectedProviderId(null);
      setSelectedOptionType(null);
    }
  }, [currentScreen, useInventoryIms]);

  const handleMainConfirm = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let config: EntityConfig;
      if (useInventoryIms && inventoryFtpConfig) {
        config = {
          app: true,
          ftp: {
            partnerId: inventoryFtpConfig.partnerId,
            partnerName: inventoryFtpConfig.partnerName,
            dealerId: inventoryFtpConfig.dealerId,
            approved: inventoryFtpConfig.approved || false,
            logo: inventoryFtpConfig.logo,
            isActive: true,
            ...(inventoryFtpConfig.workflowId && {
              workflowId: inventoryFtpConfig.workflowId,
            }),
            ...(initialPhotoWorkflowId && {
              photoWorkflowId: initialPhotoWorkflowId,
            }),
          },
          partnerProviderTypes: ['PHOTO', 'IMS'],
        };
      } else {
        config = {
          app: true,
          partnerProviderTypes: ['PHOTO'],
        };
      }
      await confirmStep('photo-provider', config);
    } catch {
      // Error already handled
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    useInventoryIms,
    inventoryFtpConfig,
    confirmStep,
    initialPhotoWorkflowId,
  ]);

  const buildThresholdPayload = useCallback(() => {
    return {
      new: threshold.newChecked ? threshold.newValue : -1,
      preOwned: threshold.preOwnedChecked ? threshold.preOwnedValue : -1,
    };
  }, [threshold]);

  const handleProceedToNextStep = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (isSubmitting) return;

    if (currentScreen === 'ims-form' && selectedProviderId) {
      setIsSubmitting(true);
      try {
        const thresholdPayload = buildThresholdPayload();
        let config: EntityConfig;

        if (useInventoryIms && inventoryFtpConfig) {
          // "Read from IMS partner": workflowId from inventory, photoWorkflowId from initial photo response
          config = {
            app: true,
            ftp: {
              partnerId: inventoryFtpConfig.partnerId,
              partnerName: inventoryFtpConfig.partnerName,
              dealerId: inventoryFtpConfig.dealerId,
              approved: inventoryFtpConfig.approved || false,
              logo: inventoryFtpConfig.logo,
              ...(inventoryFtpConfig.workflowId && {
                workflowId: inventoryFtpConfig.workflowId,
              }),
              isActive: true,
              ...(initialPhotoWorkflowId && {
                photoWorkflowId: initialPhotoWorkflowId,
              }),
              threshold: thresholdPayload,
            },
            partnerProviderTypes: ['PHOTO', 'IMS'],
          };
        } else {
          // "Choose a different partner": workflowId = photoWorkflowId (if exists), photoWorkflowId preserved
          const provider = partners.find((p) => p.id === selectedProviderId);
          if (!provider || !dealerId.trim()) return;

          config = {
            app: true,
            ftp: {
              partnerId: provider.id,
              partnerName: provider.name,
              dealerId: dealerId.trim(),
              approved: false,
              logo: provider.icon,
              ...(initialPhotoWorkflowId && {
                workflowId: initialPhotoWorkflowId,
                photoWorkflowId: initialPhotoWorkflowId,
              }),
              threshold: thresholdPayload,
              isActive: true,
            },
            partnerProviderTypes: ['PHOTO'],
          };
        }

        await confirmStep('photo-provider', config);
      } catch {
        // Error already handled
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentScreen === 'ims-not-listed' && partnerName.trim()) {
      // "IMS not listed" is also a "different partner" scenario
      setIsSubmitting(true);
      try {
        const config: EntityConfig = {
          app: true,
          ftp: {
            partnerName: partnerName.trim(),
            approved: false,
            poc_name: pocName.trim(),
            poc_email: pocEmail.trim(),
            poc_contact: pocContact.trim(),
            ...(initialPhotoWorkflowId && {
              workflowId: initialPhotoWorkflowId,
              photoWorkflowId: initialPhotoWorkflowId,
            }),
          },
          partnerProviderTypes: ['PHOTO'],
        };
        await confirmStep('photo-provider', config, true);
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
    useInventoryIms,
    inventoryFtpConfig,
    initialPhotoWorkflowId,
  ]);

  const handleBack = () => {
    goToMainScreen();
  };

  const canProceed = useMemo(() => {
    switch (currentScreen) {
      case 'main':
        return true;
      case 'ims-selection':
        if (selectedOptionType === 'partner') {
          return selectedProviderId !== null;
        }
        return selectedOptionType === 'not-listed';
      case 'ims-form':
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
        if (useInventoryIms && inventoryFtpConfig?.partnerId)
          return handleConfirmInventoryIms;
        if (useDifferentPartner) return handleUseDifferentPartner;
        return handleMainConfirm;
      case 'ims-selection':
        return handleContinueFromSelection;
      case 'ims-form':
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
      case 'ims-selection':
      case 'ims-form':
      case 'ims-not-listed':
        return handleBackFromDetailScreen;
      default:
        return handleBack;
    }
  };

  const getStepWrapperProps = (): StepWrapperPropsType => {
    const baseProps: StepWrapperPropsType = {
      title: 'Photo Provider',
      subtitle: 'Configure your photo input source',
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
          title: 'Introducing Spyne App for media input',
          subtitle: 'Use Spyne App to Shoot Media',
          nextLabel: 'Confirm',
          secondaryButtonLabel: 'Back',
        };
      case 'ims-selection':
        return {
          ...baseProps,
          title: 'Connect another media provider',
          subtitle: 'Choose a media provider',
          nextLabel: 'Confirm',
          secondaryButtonLabel: 'Back',
        };
      case 'ims-form':
        return {
          ...baseProps,
          title: 'Enter your Media Provider details',
          subtitle: 'Connect your photo provider',
          nextLabel: 'Confirm',
          hideHeader: true,
          secondaryButtonLabel: 'Back',
        };
      case 'ims-not-listed':
        return {
          ...baseProps,
          title: 'Enter your Media Provider name',
          subtitle: 'Tell us about your media provider',
          nextLabel: 'Confirm',
          hideHeader: true,
          secondaryButtonLabel: 'Back',
        };
      case 'thanks':
        return {
          ...baseProps,
          title: 'Thank you for connecting your Photo Provider',
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
          <MainPhotoProviderScreen
            hasInventoryFtp={hasInventoryFtp}
            inventoryProviderInfo={inventoryProviderInfo}
            useInventoryIms={useInventoryIms}
            useDifferentPartner={useDifferentPartner}
            onSelectInventoryIms={handleSelectInventoryIms}
            onSelectDifferentPartner={handleSelectDifferentPartner}
            loading={isSubmitting || loading}
          />
        );
      case 'ims-selection':
        return (
          <PartnersSelection
            providerName="Photo provider"
            partnersData={partners}
            selectedPartnerId={selectedProviderId}
            selectedOptionType={selectedOptionType}
            handlePartnerClick={handlePartnerClick}
            onImsNotListedSelect={handleImsNotListedSelect}
            onPartnerDeselect={handlePartnerDeselect}
            loading={fetchingPartners}
          />
        );
      case 'ims-form':
        return selectedProviderId ? (
          <PartnerDetailsForm
            providerName="Photo Provider"
            selectedProviderId={selectedProviderId}
            onBack={handleBackFromDetailScreen}
            loading={isSubmitting}
            dealerId={dealerId}
            onDealerIdChange={setDealerId}
            partners={partners}
            showThreshold
            threshold={threshold}
            onThresholdChange={setThreshold}
            disableFields={useInventoryIms}
            enterpriseId={enterpriseId}
            teamId={teamId}
          />
        ) : null;
      case 'ims-not-listed':
        return (
          <ImsNotListedScreen
            providerName="Photo Provider"
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
      title={stepWrapperProps.title || 'Photo Provider'}
      subtitle={
        stepWrapperProps.subtitle || 'Configure your photo input source'
      }
      onNext={stepWrapperProps.onNext}
      secondaryButtonLabel={stepWrapperProps.secondaryButtonLabel}
      secondaryButtonOnClick={stepWrapperProps.secondaryButtonOnClick}
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

export default PhotoProviderStep;
