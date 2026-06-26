import React from 'react';

import CommonIntegrationCard from './common-integration-card';
import { IntegrationStepId, useIntegrations } from './context';
import ProviderInfoBadges from './provider-info-badges';
import StepWrapper from './step-wrapper';
import type { EntityConfig, OnboardingCallbacks } from './types';

interface IntegrationsMainScreenProps {
  onboardingCallbacks: OnboardingCallbacks;
}

/**
 * Main screen showing all integration cards with their status
 * Users can click "Change" on completed steps or "Add Now" on pending steps
 */
const IntegrationsMainScreen: React.FC<IntegrationsMainScreenProps> = ({
  onboardingCallbacks,
}) => {
  const {
    handleNextStep,
    handlePrevStep,
    handleSkipStep,
    onboardingStartTime,
  } = onboardingCallbacks;
  const { steps, goToStep, canProceedToNextOnboardingStep, integrationsData } =
    useIntegrations();

  const handleProceedToNextStep = () => {
    if (canProceedToNextOnboardingStep) {
      handleNextStep();
    }
  };

  const handleStepClick = (stepId: IntegrationStepId) => {
    goToStep(stepId);
  };

  /**
   * Get entity config for a specific step from integrationsData
   */
  const getEntityConfigForStep = (
    stepId: IntegrationStepId
  ): EntityConfig | undefined => {
    switch (stepId) {
      case 'inventory-provider':
        return integrationsData.inventory?.entityconfig;
      case 'photo-provider':
        return integrationsData.photo?.entityconfig;
      case 'cgi-provider':
        return integrationsData.cgi?.entityconfig;
      default:
        return undefined;
    }
  };

  return (
    <StepWrapper
      title="Where will Spyne get Inventory & Media from?"
      subtitle="Add your inventory and media providers"
      onNext={handleProceedToNextStep}
      secondaryButtonLabel="Back"
      secondaryButtonOnClick={handlePrevStep}
      isLastStep={false}
      isNextDisabled={!canProceedToNextOnboardingStep}
      onboardingStartTime={onboardingStartTime}
    >
      {/* Container with connector line */}
      <div className="relative flex flex-1 flex-col">
        {/* Vertical connector line */}
        <div className="absolute bottom-[60px] left-[40px] top-[60px] w-px border-l border-dashed border-gray-300" />

        {/* Integration cards */}
        <div className="flex flex-col gap-10">
          {steps.map((step) => {
            const entityConfig = getEntityConfigForStep(step.id);
            return (
              <div key={step.id} className="relative">
                <CommonIntegrationCard
                  title={step.title}
                  subtitle={step.subtitle}
                  iconUrl={step.iconUrl}
                  mandatory={step.mandatory}
                  disabled={step.disabled}
                  onClick={() => handleStepClick(step.id)}
                  buttonLabel={step.done ? 'Change' : 'Add Now'}
                  done={step.done}
                  description={
                    step.done ? (
                      <ProviderInfoBadges entityConfig={entityConfig} />
                    ) : null
                  }
                  isIntegrationFlow={true}
                />
              </div>
            );
          })}
        </div>
      </div>
    </StepWrapper>
  );
};

export default IntegrationsMainScreen;
