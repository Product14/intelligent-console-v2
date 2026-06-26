import React, { useCallback, useEffect, useRef, useState } from 'react';

import StepWrapper from '../integrations/step-wrapper';
import SmartViewFormScreen from './smartview-form-screen';
import SmartViewIntroScreen from './smartview-intro-screen';
import smartviewService from './smartview-service';
import SmartViewSummaryScreen from './smartview-summary-screen';
import type {
  OnboardingCallbacks,
  SmartViewEntityConfig,
  SmartViewEntityResponse,
  SmartViewFlowScreen,
} from './types';
import { isSmartViewConfig } from './types';

export interface SmartViewFlowProps {
  /** Enterprise ID */
  readonly enterpriseId: string;
  /** Enterprise name */
  readonly enterpriseName: string;
  /** Team ID */
  readonly teamId: string;
  /** Team name */
  readonly teamName: string;
  /** User ID */
  readonly userId: string;
  /** Onboarding callbacks - abstracts studio/vini specific navigation */
  readonly onboardingCallbacks: OnboardingCallbacks;
  /** Callback when the user completes or skips SmartView (goes back to parent) */
  readonly onGoBack: () => void;
  /** Pre-fetched SmartView entity response (optional — if not provided, the flow fetches its own data) */
  readonly initialEntityResponse?: SmartViewEntityResponse | null;
  readonly product: 'studio' | 'vini';
  /** Optional error handler (e.g. toast.error). Falls back to console.error */
  readonly onShowError?: (message: string) => void;
  /** Optional success handler (e.g. toast.success). Falls back to console.log */
  readonly onShowSuccess?: (message: string) => void;
}

/**
 * SmartViewFlow — self-contained SmartView setup flow.
 *
 * Three screens:
 * 1. Intro — showcases SmartView features
 * 2. Form — website configuration form with Generate Script button
 * 3. Summary — shows generated script details with Edit and Finish options
 *
 * All external dependencies (onboarding navigation, data context) are passed
 * as props/callbacks so this component is reusable across micro-frontends.
 */
const SmartViewFlow: React.FC<SmartViewFlowProps> = ({
  enterpriseId,
  enterpriseName,
  teamId,
  teamName,
  userId,
  onboardingCallbacks,
  onGoBack,
  initialEntityResponse,
  product = 'studio',
  onShowError,
  onShowSuccess,
}) => {
  const showError = onShowError ?? ((msg: string) => console.error(msg));
  const showSuccess = onShowSuccess ?? ((msg: string) => console.log(msg));
  // ── state ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(!initialEntityResponse);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entityResponse, setEntityResponse] =
    useState<SmartViewEntityResponse | null>(initialEntityResponse ?? null);
  const [currentScreen, setCurrentScreen] =
    useState<SmartViewFlowScreen>('intro');
  const [savedConfig, setSavedConfig] = useState<SmartViewEntityConfig | null>(
    null
  );
  const [isFormValid, setIsFormValid] = useState(false);

  // Ref to imperatively trigger form submission from StepWrapper's Next button
  const formSubmitRef = useRef<(() => void | Promise<void>) | null>(null);

  // Derive entity config from the response
  const entityConfig: SmartViewEntityConfig | null =
    entityResponse?.entityconfig &&
    !Array.isArray(entityResponse.entityconfig) &&
    isSmartViewConfig(entityResponse.entityconfig)
      ? entityResponse.entityconfig
      : null;

  // ── toggle state (lifted from SmartViewIntroScreen) ─────────
  const getInitialToggle = (): boolean => {
    if (!entityConfig) return true;
    if (product === 'studio') {
      return Boolean(entityConfig.is_studio_enabled ?? 1);
    }
    return Boolean(entityConfig.is_ci_enabled ?? 1);
  };

  const [toggle, setToggle] = useState<boolean>(getInitialToggle);
  const [isToggleUpdating, setIsToggleUpdating] = useState<boolean>(false);

  // Keep toggle in sync when entityConfig loads for the first time
  useEffect(() => {
    if (!entityConfig) return;
    const value =
      product === 'studio'
        ? Boolean(entityConfig.is_studio_enabled ?? 1)
        : Boolean(entityConfig.is_ci_enabled ?? 1);
    setToggle(value);
  }, [entityConfig, product]);

  const handleToggle = useCallback(async () => {
    const previousValue = toggle;
    const newValue = !previousValue;

    setIsToggleUpdating(true);
    try {
      const updatedConfig: SmartViewEntityConfig = {
        ...entityConfig,
        ...(product === 'studio'
          ? {
              is_studio_enabled: newValue ? 1 : 0,
              is_ci_enabled: entityConfig?.is_ci_enabled ?? 1,
            }
          : {
              is_ci_enabled: newValue ? 1 : 0,
              is_studio_enabled: entityConfig?.is_studio_enabled ?? 1,
            }),
      };

      const response = await smartviewService.saveSmartViewEntityConfig(
        { enterpriseId, enterpriseName, teamId, teamName, userId },
        updatedConfig
      );

      if (response.success && response.data?.entityconfig) {
        setToggle(newValue);
        setEntityResponse((prev) =>
          prev ? { ...prev, entityconfig: response.data!.entityconfig } : prev
        );
        showSuccess(newValue ? 'Smart View enabled' : 'Smart View disabled');
      } else {
        setToggle(previousValue);
        showError('Failed to update toggle');
      }
    } catch (error) {
      setToggle(previousValue);
      console.error('Failed to update toggle:', error);
      showError('Failed to update toggle');
    } finally {
      setIsToggleUpdating(false);
    }
  }, [
    toggle,
    entityConfig,
    product,
    enterpriseId,
    enterpriseName,
    teamId,
    teamName,
    userId,
    showError,
    showSuccess,
  ]);

  // ── fetch data on mount (when no initial data provided) ────
  useEffect(() => {
    if (initialEntityResponse !== undefined) return; // already provided

    const fetchData = async () => {
      if (!enterpriseId || !teamId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await smartviewService.fetchSmartViewEntityConfig(
          enterpriseId,
          teamId
        );
        setEntityResponse(data);
      } catch (error) {
        console.error('Failed to fetch SmartView config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enterpriseId, teamId, initialEntityResponse]);

  // Sync savedConfig when entityConfig is available
  useEffect(() => {
    if (entityConfig?.script_url) {
      setSavedConfig(entityConfig);
    }
  }, [entityConfig]);

  // ── navigation handlers ────────────────────────────────────
  const handleBack = useCallback(() => {
    if (currentScreen === 'intro' || currentScreen === 'summary') {
      onGoBack();
    } else if (currentScreen === 'form') {
      setCurrentScreen('intro');
    }
  }, [currentScreen, onGoBack]);

  const handleSkip = useCallback(() => {
    onGoBack();
  }, [onGoBack]);

  const handleIntroNext = useCallback(() => {
    // If toggle is off, skip the SmartView form and go back to parent
    if (!toggle) {
      if (product === 'studio') {
        onGoBack();
      } else {
        onboardingCallbacks.handleNextStep();
      }
      return;
    }
    if (entityConfig?.script_url) {
      setCurrentScreen('summary');
    } else {
      setCurrentScreen('form');
    }
  }, [toggle, entityConfig, onGoBack]);

  const handleGenerateScript = useCallback(
    async (config: SmartViewEntityConfig) => {
      setIsSubmitting(true);
      try {
        const response = await smartviewService.saveSmartViewEntityConfig(
          { enterpriseId, enterpriseName, teamId, teamName, userId },
          config
        );

        if (!response.success) {
          showError(response.message || 'Failed to generate script');
          return;
        }

        // Update local state with saved response
        if (response.data) {
          setEntityResponse(response.data);
          if (
            response.data.entityconfig &&
            !Array.isArray(response.data.entityconfig) &&
            isSmartViewConfig(response.data.entityconfig)
          ) {
            setSavedConfig(response.data.entityconfig);
          }
        }

        showSuccess('Script generated successfully');
        setCurrentScreen('summary');
      } catch (error) {
        console.error('Failed to generate script:', error);
        showError('Failed to generate script');
      } finally {
        setIsSubmitting(false);
      }
    },
    [enterpriseId, enterpriseName, teamId, teamName, userId]
  );

  const handleEditScript = useCallback(() => {
    setCurrentScreen('form');
  }, []);

  const handleFinish = useCallback(() => {
    if (product === 'studio') {
      onGoBack();
    } else {
      onboardingCallbacks.handleNextStep();
    }
  }, [product, onGoBack, onboardingCallbacks]);

  // ── step wrapper props per screen ──────────────────────────
  const getStepWrapperProps = () => {
    switch (currentScreen) {
      case 'intro':
        return {
          title: 'Introducing publishing with Smart View',
          subtitle: "Explore our Spyne's Smart View",
          onNext: handleIntroNext,
          nextLabel: 'Next',
          secondaryButtonLabel: 'Skip',
          secondaryButtonOnClick: handleSkip,
          isNextDisabled: false,
          isLastStep: false,
          hideFooter: false,
        };
      case 'form':
        return {
          title: 'VDP SmartView Script Generation Tool',
          subtitle: 'A smart tool to generate smartview on vehicle detail page',
          onNext: () => {
            formSubmitRef.current?.();
          },
          nextLabel: 'Generate Script',
          secondaryButtonLabel: 'Back',
          secondaryButtonOnClick: handleBack,
          isNextDisabled: !isFormValid || isSubmitting,
          isLastStep: false,
        };
      case 'summary':
        return {
          title: 'VDP SmartView Script Generation Tool',
          subtitle: 'A smart tool to generate smartview on vehicle detail page',
          onNext: handleFinish,
          nextLabel: 'Finish',
          secondaryButtonLabel: undefined,
          secondaryButtonOnClick: undefined,
          isNextDisabled: false,
          isLastStep: false,
          hideFooter: true,
        };
      default:
        return {
          title: 'SmartView',
          subtitle: 'Configure SmartView',
          onNext: () => {},
          isNextDisabled: true,
          isLastStep: false,
        };
    }
  };

  // ── render the correct screen ──────────────────────────────
  const renderScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return (
          <SmartViewIntroScreen
            onNext={handleIntroNext}
            product={product}
            entityConfig={entityConfig}
            toggle={toggle}
            isToggleUpdating={isToggleUpdating}
            onToggle={handleToggle}
            onChangeScript={() => setCurrentScreen('form')}
          />
        );
      case 'form':
        return (
          <SmartViewFormScreen
            onBack={handleBack}
            onGenerateScript={handleGenerateScript}
            initialData={savedConfig || entityConfig}
            enterpriseName={enterpriseName}
            rooftopName={teamName}
            enterpriseId={enterpriseId}
            teamId={teamId}
            loading={isSubmitting}
            onFormValidityChange={setIsFormValid}
            submitRef={formSubmitRef}
          />
        );
      case 'summary':
        return savedConfig || entityConfig ? (
          <SmartViewSummaryScreen
            config={(savedConfig || entityConfig)!}
            onEditScript={handleEditScript}
            onFinish={handleFinish}
            enterpriseId={enterpriseId}
            teamId={teamId}
            loading={isSubmitting}
            onShowError={showError}
          />
        ) : null;
      default:
        return null;
    }
  };

  const stepWrapperProps = getStepWrapperProps();

  return (
    <StepWrapper
      title={stepWrapperProps.title}
      subtitle={stepWrapperProps.subtitle}
      onNext={stepWrapperProps.onNext}
      secondaryButtonLabel={stepWrapperProps.secondaryButtonLabel}
      secondaryButtonOnClick={stepWrapperProps.secondaryButtonOnClick}
      isLastStep={stepWrapperProps.isLastStep}
      isNextDisabled={stepWrapperProps.isNextDisabled || loading}
      hideFooter={stepWrapperProps.hideFooter}
      nextLabel={stepWrapperProps.nextLabel}
      onboardingStartTime={onboardingCallbacks.onboardingStartTime}
    >
      <div
        className={`flex-1 ${currentScreen === 'intro' ? 'flex h-full items-center justify-center' : ''}`}
      >
        {renderScreen()}
      </div>
    </StepWrapper>
  );
};

export default SmartViewFlow;
