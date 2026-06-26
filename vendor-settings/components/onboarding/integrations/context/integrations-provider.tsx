import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import integrationsService, {
  AllIntegrationsData,
} from '../integrations-service';
import type { EntityConfig, IntegrationEntityResponse } from '../types';
import {
  CurrentView,
  IntegrationStep,
  IntegrationStepId,
  IntegrationsContext,
  IntegrationsContextType,
} from './integrations-context';

// Step configuration - defines all integration steps
const createStepsConfig = (
  hasNewVehicleEnabled: boolean,
  inventoryOnly: boolean
): Omit<IntegrationStep, 'done' | 'disabled'>[] => {
  const steps: Omit<IntegrationStep, 'done' | 'disabled'>[] = [
    {
      id: 'inventory-provider',
      title: 'Inventory Provider',
      subtitle: 'Add your inventory provider',
      iconUrl:
        'https://spyne-static.s3.us-east-1.amazonaws.com/inventory-provider.svg',
      mandatory: true,
    },
  ];

  // Skip photo and CGI steps when inventoryOnly is true
  if (!inventoryOnly) {
    steps.push({
      id: 'photo-provider',
      title: 'Photo Provider',
      subtitle: 'Add your photo provider',
      iconUrl:
        'https://spyne-static.s3.us-east-1.amazonaws.com/photo-provider.svg',
      mandatory: true,
    });

    if (hasNewVehicleEnabled) {
      steps.push({
        id: 'cgi-provider' as IntegrationStepId,
        title: 'CGI Provider',
        subtitle: 'Add your CGI provider',
        iconUrl: 'https://spyne-static.s3.us-east-1.amazonaws.com/cgi-icon.svg',
        mandatory: false,
      });
    }
  }

  return steps;
};

// Helper to get entity data key from step ID
const getEntityKey = (
  stepId: IntegrationStepId
): 'inventory' | 'photo' | 'cgi' => {
  switch (stepId) {
    case 'inventory-provider':
      return 'inventory';
    case 'photo-provider':
      return 'photo';
    case 'cgi-provider':
      return 'cgi';
  }
};

type ApiErrorData = {
  message?: string;
  errors?: Array<{ message?: string }>;
};

const formatApiErrorToast = (
  data: ApiErrorData | undefined,
  fallback: string
): React.ReactNode => {
  const title = data?.message || fallback;
  const errorMessages = (data?.errors ?? [])
    .map((item) => item.message)
    .filter(Boolean) as string[];

  if (errorMessages.length === 0) {
    return title;
  }

  return (
    <div>
      <div>{title}</div>
      <ul className="mt-1 list-disc pl-4">
        {errorMessages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

// Fetch vehicle type config to determine if new vehicles are enabled
const fetchVehicleTypeConfig = async (
  enterpriseId: string,
  teamId: string
): Promise<boolean> => {
  try {
    const url = `${process.env.BACKEND_BASEURL}/central-config/v1/integration`;
    const queryParams = {
      enterpriseId,
      teamId,
      domain: 'rooftop',
      entity: 'INFO',
    };
    const response = await CentralAPIHandler.handleGetRequest(url, queryParams);
    return !!response?.data?.entityconfig?.vehicleType?.new;
  } catch (error) {
    console.error('Error fetching vehicle type config:', error);
    return false;
  }
};

interface IntegrationsProviderProps {
  children: React.ReactNode;
  enterpriseId: string;
  enterpriseName: string;
  teamId: string;
  teamName: string;
  userId: string;
  userEmail: string;
  /** When true, only shows the Inventory Provider step and skips Photo & CGI */
  inventoryOnly?: boolean;
  /** Host app toast — required for API error toasts to appear in console */
  onShowError?: (content: React.ReactNode) => void;
}

export default function IntegrationsProvider({
  children,
  enterpriseId,
  enterpriseName,
  teamId,
  teamName,
  userId,
  userEmail,
  inventoryOnly = false,
  onShowError,
}: IntegrationsProviderProps) {
  const showApiErrorToast = useCallback(
    (content: React.ReactNode) => {
      if (onShowError) {
        onShowError(content);
      } else {
        toast.error(content as never);
      }
    },
    [onShowError]
  );
  // State for vehicle type - determines if CGI section should be shown
  const [hasNewVehicleEnabled, setHasNewVehicleEnabled] = useState(false);
  const [vehicleTypeLoaded, setVehicleTypeLoaded] = useState(false);
  // Raw integrations data from API
  const [integrationsData, setIntegrationsData] = useState<{
    inventory: IntegrationEntityResponse | null;
    photo: IntegrationEntityResponse | null;
    cgi: IntegrationEntityResponse | null;
  }>({
    inventory: null,
    photo: null,
    cgi: null,
  });

  // Current view state - which screen to show
  const [currentView, setCurrentView] = useState<CurrentView>('main');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track if data has been fetched at least once
  const [dataFetched, setDataFetched] = useState(false);

  // Initial determination done flag
  const [initialViewSet, setInitialViewSet] = useState(false);

  // Fetch vehicle type config (skip when inventoryOnly since CGI depends on it)
  useEffect(() => {
    if (inventoryOnly) {
      setVehicleTypeLoaded(true);
      return;
    }
    const loadVehicleTypeConfig = async () => {
      if (enterpriseId && teamId) {
        const hasNew = await fetchVehicleTypeConfig(enterpriseId, teamId);
        setHasNewVehicleEnabled(hasNew);
      }
      setVehicleTypeLoaded(true);
    };
    loadVehicleTypeConfig();
  }, [enterpriseId, teamId, inventoryOnly]);

  // Get steps configuration
  const stepsConfig = useMemo(
    () => createStepsConfig(hasNewVehicleEnabled, inventoryOnly),
    [hasNewVehicleEnabled, inventoryOnly]
  );

  // Derive completion status from integrationsData
  const completedSteps = useMemo(() => {
    const inventoryDone = integrationsService.isIntegrationDone(
      integrationsData.inventory
    );
    const photoDone = integrationsService.isIntegrationDone(
      integrationsData.photo
    );
    const cgiDone = integrationsService.isIntegrationDone(integrationsData.cgi);
    return {
      'inventory-provider': inventoryDone,
      'photo-provider': photoDone,
      'cgi-provider': cgiDone,
    };
  }, [integrationsData]);

  // Fetch initial data from API (skip photo/cgi when inventoryOnly)
  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      try {
        setLoading(true);
        if (inventoryOnly) {
          // Only fetch IMS entity config
          const imsData = await integrationsService
            .fetchEntityConfig({
              enterpriseID: enterpriseId,
              TeamId: teamId,
              entity: 'IMS',
            })
            .catch(() => null);
          setIntegrationsData({
            inventory: imsData,
            photo: null,
            cgi: null,
          });
        } else {
          const data: AllIntegrationsData =
            await integrationsService.fetchAllEntityConfigs(
              enterpriseId,
              teamId
            );
          setIntegrationsData({
            inventory: data.inventory,
            photo: data.photo,
            cgi: data.cgi,
          });
        }
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching integration status:', error);
        toast.error('Failed to load integration data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (enterpriseId && teamId) {
      fetchIntegrationStatus();
    } else {
      setLoading(false);
    }
  }, [enterpriseId, teamId, inventoryOnly]);

  // Calculate computed states
  const allMandatoryDone = useMemo(() => {
    return stepsConfig
      .filter((step) => step.mandatory)
      .every((step) => completedSteps[step.id]);
  }, [stepsConfig, completedSteps]);

  const anyMandatoryDone = useMemo(() => {
    return stepsConfig
      .filter((step) => step.mandatory)
      .some((step) => completedSteps[step.id]);
  }, [stepsConfig, completedSteps]);

  const allStepsDone = useMemo(() => {
    return stepsConfig.every((step) => completedSteps[step.id]);
  }, [stepsConfig, completedSteps]);

  const firstIncompleteMandatoryStep = useMemo(() => {
    return stepsConfig.find(
      (step) => step.mandatory && !completedSteps[step.id]
    );
  }, [stepsConfig, completedSteps]);

  // Determine initial view after data has been fetched
  useEffect(() => {
    if (!loading && dataFetched && !initialViewSet) {
      const targetSubstepData = sessionStorage.getItem(
        'onboarding_target_substep'
      );
      if (targetSubstepData) {
        try {
          const { parentStep, substepId } = JSON.parse(targetSubstepData);
          if (parentStep === 'integrations') {
            sessionStorage.removeItem('onboarding_target_substep');
            setCurrentView(substepId as IntegrationStepId);
            setInitialViewSet(true);
            return;
          }
        } catch (e) {
          console.error('Failed to parse target substep data:', e);
          sessionStorage.removeItem('onboarding_target_substep');
        }
      }

      if (anyMandatoryDone) {
        setCurrentView('main');
      } else if (firstIncompleteMandatoryStep) {
        setCurrentView(firstIncompleteMandatoryStep.id);
      }
      setInitialViewSet(true);
    }
  }, [
    loading,
    dataFetched,
    initialViewSet,
    anyMandatoryDone,
    firstIncompleteMandatoryStep,
  ]);

  // Build full steps array with done and disabled states
  const steps: IntegrationStep[] = useMemo(() => {
    return stepsConfig.map((stepConfig) => {
      const done = completedSteps[stepConfig.id];
      return {
        ...stepConfig,
        done,
        disabled: false,
      };
    });
  }, [stepsConfig, completedSteps]);

  // Navigation: Go to a specific step
  const goToStep = useCallback((stepId: IntegrationStepId) => {
    setCurrentView(stepId);
  }, []);

  // Navigation: Go to main screen
  const goToMainScreen = useCallback(() => {
    setCurrentView('main');
  }, []);

  // Confirm step: Save config via API and navigate to next step
  const confirmStep = useCallback(
    async (
      stepId: IntegrationStepId,
      entityConfig?: EntityConfig,
      skipMoveToNextStep?: boolean
    ) => {
      if (!enterpriseId || !teamId) {
        toast.error('Enterprise ID or team ID is not set');
        return;
      }
      if (!entityConfig) {
        toast.error('Please fill in all the fields');
        return;
      }
      try {
        setSaving(true);

        if (entityConfig && enterpriseId && teamId) {
          const response = await integrationsService.saveStepConfig(
            stepId,
            {
              enterpriseId,
              enterpriseName,
              teamId,
              teamName,
              userId,
            },
            entityConfig
          );

          if (!response.success) {
            showApiErrorToast(
              formatApiErrorToast(
                response,
                'Failed to save integration. Please try again.'
              )
            );
            return;
          }

          const key = getEntityKey(stepId);
          if (response.data) {
            setIntegrationsData((prev) => ({
              ...prev,
              [key]: response.data,
            }));
          } else {
            const entity = integrationsService.getEntityForStep(stepId);
            const freshData = await integrationsService.fetchEntityConfig({
              enterpriseID: enterpriseId,
              TeamId: teamId,
              entity,
            });
            setIntegrationsData((prev) => ({
              ...prev,
              [key]: freshData,
            }));
          }
        }

        const updatedCompletedSteps = {
          ...completedSteps,
          [stepId]: true,
        };
        if (!skipMoveToNextStep) {
          const nextIncompleteMandatory = stepsConfig.find(
            (step) => step.mandatory && !updatedCompletedSteps[step.id]
          );
          if (nextIncompleteMandatory) {
            setCurrentView(nextIncompleteMandatory.id);
          } else {
            setCurrentView('main');
          }
        }
      } catch (error) {
        console.error('Error confirming step:', error);
        const apiData = (error as { response?: { data?: ApiErrorData } })
          ?.response?.data;

        if (apiData) {
          showApiErrorToast(
            formatApiErrorToast(
              apiData,
              'Failed to save integration. Please try again.'
            )
          );
        } else if (
          !(
            error instanceof Error && error.message.startsWith('Request failed')
          )
        ) {
          showApiErrorToast(
            (error as Error)?.message ||
              'Failed to save integration. Please try again.'
          );
        }
      } finally {
        setSaving(false);
      }
    },
    [
      completedSteps,
      stepsConfig,
      enterpriseId,
      enterpriseName,
      teamId,
      teamName,
      userId,
      showApiErrorToast,
    ]
  );

  const canProceedToNextOnboardingStep = allMandatoryDone;

  const contextValue: IntegrationsContextType = useMemo(
    () => ({
      steps,
      currentView,
      goToStep,
      goToMainScreen,
      confirmStep,
      canProceedToNextOnboardingStep,
      allMandatoryDone,
      allStepsDone,
      loading: loading || !vehicleTypeLoaded,
      saving,
      hasNewVehicleEnabled,
      enterpriseId,
      teamId,
      userId,
      userEmail,
      integrationsData,
      inventoryOnly,
    }),
    [
      steps,
      currentView,
      goToStep,
      goToMainScreen,
      confirmStep,
      canProceedToNextOnboardingStep,
      allMandatoryDone,
      allStepsDone,
      loading,
      saving,
      vehicleTypeLoaded,
      hasNewVehicleEnabled,
      enterpriseId,
      teamId,
      userId,
      userEmail,
      integrationsData,
      inventoryOnly,
    ]
  );

  return (
    <IntegrationsContext.Provider value={contextValue}>
      {children}
    </IntegrationsContext.Provider>
  );
}
