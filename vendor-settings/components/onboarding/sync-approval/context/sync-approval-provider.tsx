import React, { useCallback, useEffect, useMemo, useState } from 'react';

import syncApprovalService from '../sync-approval-service';
import type {
  ApprovalFTPConfig,
  ApprovalInputType,
  ApprovalStatus,
  ApprovalSubstep,
  BaseEntityConfig,
  EmailFormData,
  EntityConfig,
  InputIntegrationsRawData,
  IntegrationItem,
  OutputIntegrationsRawData,
  PublishingEntityConfig,
  PublishingStepId,
  SyncApprovalView,
} from '../types';
import { isBaseEntityConfig } from '../types';
import { plainTextToHtml } from '../utils/plain-text-to-html';
import {
  type PrefillEmails,
  SyncApprovalContext,
  type SyncApprovalContextType,
} from './sync-approval-context';

// Default input integrations configuration
const DEFAULT_INPUT_INTEGRATIONS: Omit<
  IntegrationItem,
  'approvalData' | 'inputType' | 'originalEntityConfig' | 'isDataAdded'
>[] = [
  {
    id: 'inventory-provider',
    name: 'Add your Inventory Provider (IMS)',
    description: 'Connect your IMS to sync vehicles automatically',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/inventory-provider.svg',
    type: 'Input',
    entity: 'IMS',
  },
  {
    id: 'photo-provider',
    name: 'Add your Photo Provider',
    description: 'Connect your photo source to import images',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/photo-provider.svg',
    type: 'Input',
    entity: 'PHOTO',
  },
  {
    id: 'cgi-provider',
    name: 'Add your CGI Provider',
    description: 'Connect your CGI source to import CGI images',
    iconUrl: 'https://spyne-static.s3.us-east-1.amazonaws.com/cgi-icon.svg',
    type: 'Input',
    entity: 'CGI',
  },
];

// Default output integrations configuration
const DEFAULT_OUTPUT_INTEGRATIONS: Omit<
  IntegrationItem,
  'approvalData' | 'outputType' | 'originalEntityConfig' | 'isDataAdded'
>[] = [
  {
    id: 'publish-inventory-provider',
    name: 'Publish to your Inventory Provider (IMS)',
    description: 'Connect your IMS to sync vehicles automatically',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/inventory-provider.svg',
    type: 'Output',
    entity: 'FTP',
  },
  {
    id: 'publish-smartview',
    name: "Add Spyne's SmartView to your website",
    description: 'Connect SmartView to your website to publish media instantly',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/smartview-icon.svg',
    type: 'Output',
    entity: 'SMARTVIEW',
  },
  {
    id: 'publish-syndication-partner',
    name: 'Publish to your Syndication Partner',
    description:
      'Connect your Syndication Partner to sync vehicles automatically',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/syndication-icon.svg',
    type: 'Output',
    entity: 'SYNDICATION',
  },
  {
    id: 'publish-webhook-api',
    name: 'Get Media via Webhook / Public API',
    description:
      'Configure Webhook settings or use GET API to retrieve updated Media',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/webhook-api.svg',
    type: 'Output',
    entity: 'WEBHOOK',
  },
  {
    id: 'publish-platforms',
    name: 'Download Media from Spyne Platforms',
    description: 'Use Spyne App/Console to download merchandised media',
    iconUrl:
      'https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/platforms.svg',
    type: 'Output',
    entity: 'SPYNE_PLATFORM',
  },
];

// Create empty FTP config
const createEmptyFTPConfig = (): ApprovalFTPConfig => ({
  partnerName: '',
  partnerId: '',
  partnerIcon: '',
  dealerId: '',
});

// Create empty input type (FTP only - used for approval logic)
const createEmptyInputType = (): ApprovalInputType => ({
  FTP: createEmptyFTPConfig(),
});

/**
 * Check if approval is required based on FTP config
 * Approval is required only if ftp has either partnerName or partnerId
 */
const checkApprovalRequired = (
  ftpConfig: ApprovalFTPConfig | undefined
): boolean => {
  if (!ftpConfig) return false;
  return Boolean(ftpConfig.partnerName || ftpConfig.partnerId);
};

/**
 * Convert integration entity config to approval input type (FTP only)
 */
const convertToApprovalInputType = (
  entityConfig: EntityConfig | null | undefined
): ApprovalInputType => {
  if (!entityConfig) return createEmptyInputType();

  return {
    FTP: {
      partnerName: entityConfig.ftp?.partnerName || '',
      partnerId: entityConfig.ftp?.partnerId || '',
      partnerIcon: entityConfig.ftp?.logo || '',
      dealerId: entityConfig.ftp?.dealerId || '',
      approved: entityConfig.ftp?.approved === true,
    },
  };
};

/**
 * Convert publishing entity config to approval input type (FTP only)
 * Only BaseEntityConfig has FTP config
 */
const convertPublishingToApprovalInputType = (
  entityConfig: PublishingEntityConfig | null | undefined
): ApprovalInputType => {
  if (!entityConfig) return createEmptyInputType();

  if (isBaseEntityConfig(entityConfig)) {
    return {
      FTP: {
        partnerName: entityConfig.ftp?.partnerName || '',
        partnerId: entityConfig.ftp?.partnerId || '',
        partnerIcon: entityConfig.ftp?.logo || '',
        dealerId: entityConfig.ftp?.dealerId || '',
        approved: entityConfig.ftp?.approved === true,
      },
    };
  }

  return createEmptyInputType();
};

/**
 * Determine approval status from entity config.
 * Priority: approved > mailSent > pending
 */
const getApprovalStatus = (
  entityConfig: EntityConfig | PublishingEntityConfig | null | undefined
): ApprovalStatus => {
  if (!entityConfig) return 'pending';

  if ('ftp' in entityConfig) {
    if (entityConfig.ftp?.approved === true) {
      return 'approved';
    }
    if (entityConfig.ftp?.mailSent === true) {
      return 'mail sent';
    }
  }

  return 'pending';
};

// Mapping from sync-approval integration IDs to parent step + substep
const APPROVAL_TO_STEP_MAP: Record<
  string,
  { parentStep: string; substepId: string }
> = {
  'inventory-provider': {
    parentStep: 'integrations',
    substepId: 'inventory-provider',
  },
  'photo-provider': {
    parentStep: 'integrations',
    substepId: 'photo-provider',
  },
  'cgi-provider': { parentStep: 'integrations', substepId: 'cgi-provider' },
  'publish-inventory-provider': {
    parentStep: 'publishing',
    substepId: 'inventory-provider',
  },
  'publish-smartview': { parentStep: 'publishing', substepId: 'smartview' },
  'publish-syndication-partner': {
    parentStep: 'publishing',
    substepId: 'syndication',
  },
  'publish-webhook-api': {
    parentStep: 'publishing',
    substepId: 'webhook-api',
  },
  'publish-platforms': { parentStep: 'publishing', substepId: 'platforms' },
};

interface SyncApprovalProviderProps {
  readonly children: React.ReactNode;
  readonly enterpriseId: string;
  readonly enterpriseName: string;
  readonly teamId: string;
  readonly teamName: string;
  readonly userId: string;
  /** Product line ID — used to fetch POC and dealer emails */
  readonly productLineId?: string;
  /** Callback to navigate to a specific onboarding step and substep */
  readonly onNavigateToStep?: (parentStep: string, substepId: string) => void;
  /** Optional error handler (e.g. toast). Falls back to console.error */
  readonly onShowError?: (message: string) => void;
  /** When true, only fetches IMS (inventory-provider) data and skips photo, cgi and all output integrations */
  readonly imsOnly?: boolean;
}

export default function SyncApprovalProvider({
  children,
  enterpriseId,
  enterpriseName,
  teamId,
  teamName,
  userId,
  productLineId,
  onNavigateToStep,
  onShowError,
  imsOnly = false,
}: SyncApprovalProviderProps) {
  const showError = useCallback(
    (msg: string) => {
      if (onShowError) {
        onShowError(msg);
      } else {
        console.error(msg);
      }
    },
    [onShowError]
  );

  // Prefill emails fetched from API
  const [prefillEmails, setPrefillEmails] = useState<PrefillEmails>({
    pocEmail: '',
    dealerEmail: '',
  });

  // Raw data from APIs
  const [rawInputData, setRawInputData] = useState<InputIntegrationsRawData>({
    inventory: null,
    photo: null,
    cgi: null,
  });
  const [rawOutputData, setRawOutputData] = useState<OutputIntegrationsRawData>(
    {
      FTP: null,
      SYNDICATION: null,
      WEBHOOK: null,
      API: null,
      SMARTVIEW: null,
      SPYNE_PLATFORM: null,
    }
  );

  // Processed integration items for display
  const [inputIntegrationsData, setInputIntegrationsData] = useState<
    IntegrationItem[]
  >([]);
  const [outputIntegrationsData, setOutputIntegrationsData] = useState<
    IntegrationItem[]
  >([]);

  // Current view state
  const [currentView, setCurrentView] = useState<SyncApprovalView>('main');

  // Approval substep state
  const [approvalSubstep, setApprovalSubstep] =
    useState<ApprovalSubstep | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Partner email fetched by partner ID (for IMS email prefill)
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerEmailLoading, setPartnerEmailLoading] = useState(false);

  // Scheduled meeting flag
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledReminderTime, setScheduledReminderTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  /**
   * Process raw integration data into IntegrationItem format.
   * When imsOnly is true, only processes the inventory-provider (IMS) item.
   */
  const processInputIntegrations = useCallback(
    (data: InputIntegrationsRawData): IntegrationItem[] => {
      const entityMap: Record<
        string,
        import('../types').IntegrationEntityResponse | null
      > = {
        'inventory-provider': data.inventory,
        'photo-provider': data.photo,
        'cgi-provider': data.cgi,
      };

      const items = imsOnly
        ? DEFAULT_INPUT_INTEGRATIONS.filter((i) => i.entity === 'IMS')
        : DEFAULT_INPUT_INTEGRATIONS;

      return items.map((defaultItem) => {
        const response = entityMap[defaultItem.id];
        const entityConfig = response?.entityconfig || null;
        const inputType = convertToApprovalInputType(entityConfig);
        const approvalRequired = checkApprovalRequired(inputType.FTP);
        const isDataAdded = syncApprovalService.isIntegrationDone(response);

        return {
          ...defaultItem,
          inputType,
          isDataAdded,
          approvalData: {
            required: approvalRequired,
            status: getApprovalStatus(entityConfig),
          },
          originalEntityConfig: entityConfig,
        };
      });
    },
    [imsOnly]
  );

  /**
   * Process raw publishing data into IntegrationItem format
   */
  const processOutputIntegrations = useCallback(
    (data: OutputIntegrationsRawData): IntegrationItem[] => {
      const entityMap: Record<
        string,
        import('../types').PublishingEntityResponse | null
      > = {
        'publish-inventory-provider': data.FTP,
        'publish-syndication-partner': data.SYNDICATION,
        'publish-webhook-api': data.WEBHOOK,
        'publish-smartview': data.SMARTVIEW,
        'publish-platforms': data.SPYNE_PLATFORM,
      };

      const publishingStepMap: Record<string, PublishingStepId> = {
        'publish-inventory-provider': 'inventory-provider',
        'publish-smartview': 'smartview',
        'publish-syndication-partner': 'syndication',
        'publish-webhook-api': 'webhook-api',
        'publish-platforms': 'platforms',
      };

      return DEFAULT_OUTPUT_INTEGRATIONS.map((defaultItem) => {
        const response = entityMap[defaultItem.id];
        const entityConfig =
          response?.entityconfig && !Array.isArray(response.entityconfig)
            ? response.entityconfig
            : null;
        const outputType = convertPublishingToApprovalInputType(entityConfig);
        const approvalRequired = checkApprovalRequired(outputType.FTP);

        const stepId = publishingStepMap[defaultItem.id];
        const isDataAdded =
          defaultItem.id === 'publish-webhook-api'
            ? syncApprovalService.isWebhookApiStepDone(data.WEBHOOK, data.API)
            : syncApprovalService.isPublishingDone(response, stepId);

        return {
          ...defaultItem,
          outputType,
          isDataAdded,
          approvalData: {
            required: approvalRequired,
            status: getApprovalStatus(entityConfig),
          },
          originalEntityConfig: entityConfig,
        };
      });
    },
    []
  );

  /**
   * Fetch all integrations data from APIs.
   * When imsOnly is true, only fetches IMS entity config and skips output integrations entirely.
   */
  const fetchData = useCallback(async () => {
    if (!enterpriseId || !teamId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch input integrations — only IMS when imsOnly
      const inputData = imsOnly
        ? await syncApprovalService.fetchImsEntityConfig(enterpriseId, teamId)
        : await syncApprovalService.fetchAllEntityConfigs(enterpriseId, teamId);

      setRawInputData({
        inventory: inputData.inventory,
        photo: inputData.photo,
        cgi: inputData.cgi,
      });

      const processedInput = processInputIntegrations({
        inventory: inputData.inventory,
        photo: inputData.photo,
        cgi: inputData.cgi,
      });
      setInputIntegrationsData(processedInput);

      // Skip output integrations when imsOnly
      if (imsOnly) {
        setOutputIntegrationsData([]);
      } else {
        const outputData = await syncApprovalService.fetchAllPublishingConfigs(
          enterpriseId,
          teamId
        );
        setRawOutputData({
          FTP: outputData.FTP,
          SYNDICATION: outputData.SYNDICATION,
          WEBHOOK: outputData.WEBHOOK,
          API: outputData.API,
          SMARTVIEW: outputData.SMARTVIEW,
          SPYNE_PLATFORM: outputData.SPYNE_PLATFORM,
        });

        const processedOutput = processOutputIntegrations({
          FTP: outputData.FTP,
          SYNDICATION: outputData.SYNDICATION,
          WEBHOOK: outputData.WEBHOOK,
          API: outputData.API,
          SMARTVIEW: outputData.SMARTVIEW,
          SPYNE_PLATFORM: outputData.SPYNE_PLATFORM,
        });
        setOutputIntegrationsData(processedOutput);
      }
    } catch (error) {
      console.error('Failed to fetch integrations data:', error);
      showError('Failed to load integrations data. Please try again.');

      const fallbackInputItems = imsOnly
        ? DEFAULT_INPUT_INTEGRATIONS.filter((i) => i.entity === 'IMS')
        : DEFAULT_INPUT_INTEGRATIONS;

      setInputIntegrationsData(
        fallbackInputItems.map((item) => ({
          ...item,
          inputType: createEmptyInputType(),
          isDataAdded: false,
          approvalData: {
            required: false,
            status: 'pending' as ApprovalStatus,
          },
          originalEntityConfig: null,
        }))
      );

      if (imsOnly) {
        setOutputIntegrationsData([]);
      } else {
        setOutputIntegrationsData(
          DEFAULT_OUTPUT_INTEGRATIONS.map((item) => ({
            ...item,
            outputType: createEmptyInputType(),
            isDataAdded: false,
            approvalData: {
              required: false,
              status: 'pending' as ApprovalStatus,
            },
            originalEntityConfig: null,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    enterpriseId,
    teamId,
    imsOnly,
    processInputIntegrations,
    processOutputIntegrations,
    showError,
  ]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch POC and dealer emails for prefilling
  useEffect(() => {
    if (!productLineId || !enterpriseId) return;

    const fetchPrefillEmails = async () => {
      try {
        const emails = await syncApprovalService.fetchPocAndCustomerEmail(
          productLineId,
          enterpriseId
        );
        setPrefillEmails(emails);
      } catch (error) {
        console.error('Failed to fetch POC and dealer emails:', error);
      }
    };

    fetchPrefillEmails();
  }, [productLineId, enterpriseId]);

  // Fetch partner email when approval substep changes (for IMS email prefill)
  useEffect(() => {
    const partnerId = approvalSubstep?.partnerId;
    if (!partnerId) {
      setPartnerEmail('');
      return;
    }

    let cancelled = false;
    const fetchEmail = async () => {
      setPartnerEmailLoading(true);
      try {
        const email = await syncApprovalService.fetchPartnerEmail(partnerId);
        if (!cancelled) {
          setPartnerEmail(email);
        }
      } catch (error) {
        console.error('Failed to fetch partner email:', error);
        if (!cancelled) {
          setPartnerEmail('');
        }
      } finally {
        if (!cancelled) {
          setPartnerEmailLoading(false);
        }
      }
    };

    fetchEmail();

    return () => {
      cancelled = true;
    };
  }, [approvalSubstep?.partnerId]);

  /**
   * Update integration status in state
   */
  const updateIntegrationStatus = useCallback(
    (integrationId: string, newStatus: ApprovalStatus, isInput: boolean) => {
      if (isInput) {
        setInputIntegrationsData((prev) =>
          prev.map((item) =>
            item.id === integrationId
              ? {
                  ...item,
                  approvalData: { ...item.approvalData, status: newStatus },
                }
              : item
          )
        );
      } else {
        setOutputIntegrationsData((prev) =>
          prev.map((item) =>
            item.id === integrationId
              ? {
                  ...item,
                  approvalData: { ...item.approvalData, status: newStatus },
                }
              : item
          )
        );
      }
    },
    []
  );

  /**
   * Update multiple integration statuses at once
   */
  const updateMultipleIntegrationStatus = useCallback(
    (integrationIds: string[], newStatus: ApprovalStatus) => {
      setInputIntegrationsData((prev) =>
        prev.map((item) =>
          integrationIds.includes(item.id)
            ? {
                ...item,
                approvalData: { ...item.approvalData, status: newStatus },
              }
            : item
        )
      );
      setOutputIntegrationsData((prev) =>
        prev.map((item) =>
          integrationIds.includes(item.id)
            ? {
                ...item,
                approvalData: { ...item.approvalData, status: newStatus },
              }
            : item
        )
      );
    },
    []
  );

  /**
   * Save approval to API (marks approved: true in entityConfig.ftp)
   */
  const saveApprovalToApi = useCallback(
    async (integrationId: string, isInput: boolean): Promise<boolean> => {
      try {
        if (isInput) {
          const item = inputIntegrationsData.find(
            (i) => i.id === integrationId
          );
          if (!item?.originalEntityConfig) return false;

          const entityMap: Record<
            string,
            'inventory-provider' | 'photo-provider' | 'cgi-provider'
          > = {
            'inventory-provider': 'inventory-provider',
            'photo-provider': 'photo-provider',
            'cgi-provider': 'cgi-provider',
          };

          const stepId = entityMap[integrationId];
          if (!stepId) return false;

          const originalConfig = item.originalEntityConfig as EntityConfig;
          const updatedConfig: EntityConfig = {
            ...originalConfig,
            ftp: {
              ...originalConfig.ftp,
              partnerName: originalConfig.ftp?.partnerName || '',
              approved: true,
            },
          };

          const response = await syncApprovalService.saveIntegrationStepConfig(
            stepId,
            { enterpriseId, enterpriseName, teamId, teamName, userId },
            updatedConfig
          );

          return response.success;
        } else {
          const item = outputIntegrationsData.find(
            (i) => i.id === integrationId
          );
          if (!item?.originalEntityConfig) return false;

          const entityMap: Record<
            string,
            'inventory-provider' | 'syndication'
          > = {
            'publish-inventory-provider': 'inventory-provider',
            'publish-syndication-partner': 'syndication',
          };

          const stepId = entityMap[integrationId];
          if (!stepId) return false;

          const originalConfig = item.originalEntityConfig as BaseEntityConfig;
          const updatedConfig: BaseEntityConfig = {
            ...originalConfig,
            ftp: {
              ...originalConfig.ftp,
              partnerName: originalConfig.ftp?.partnerName || '',
              approved: true,
            },
          };

          const response = await syncApprovalService.savePublishingStepConfig(
            stepId,
            { enterpriseId, enterpriseName, teamId, teamName, userId },
            updatedConfig
          );

          return response.success;
        }
      } catch (error) {
        console.error('Failed to save approval:', error);
        return false;
      }
    },
    [
      inputIntegrationsData,
      outputIntegrationsData,
      enterpriseId,
      enterpriseName,
      teamId,
      teamName,
      userId,
    ]
  );

  /**
   * Save mailSent flag to API (marks mailSent: true in entityConfig.ftp)
   * Similar to saveApprovalToApi but for the email-sent state.
   */
  const saveEmailSentToApi = useCallback(
    async (integrationId: string, isInput: boolean): Promise<boolean> => {
      try {
        if (isInput) {
          const item = inputIntegrationsData.find(
            (i) => i.id === integrationId
          );
          if (!item?.originalEntityConfig) return false;

          const entityMap: Record<
            string,
            'inventory-provider' | 'photo-provider' | 'cgi-provider'
          > = {
            'inventory-provider': 'inventory-provider',
            'photo-provider': 'photo-provider',
            'cgi-provider': 'cgi-provider',
          };

          const stepId = entityMap[integrationId];
          if (!stepId) return false;

          const originalConfig = item.originalEntityConfig as EntityConfig;
          const updatedConfig: EntityConfig = {
            ...originalConfig,
            ftp: {
              ...originalConfig.ftp,
              partnerName: originalConfig.ftp?.partnerName || '',
              mailSent: true,
            },
          };

          const response = await syncApprovalService.saveIntegrationStepConfig(
            stepId,
            { enterpriseId, enterpriseName, teamId, teamName, userId },
            updatedConfig
          );

          return response.success;
        } else {
          const item = outputIntegrationsData.find(
            (i) => i.id === integrationId
          );
          if (!item?.originalEntityConfig) return false;

          const entityMap: Record<
            string,
            'inventory-provider' | 'syndication'
          > = {
            'publish-inventory-provider': 'inventory-provider',
            'publish-syndication-partner': 'syndication',
          };

          const stepId = entityMap[integrationId];
          if (!stepId) return false;

          const originalConfig = item.originalEntityConfig as BaseEntityConfig;
          const updatedConfig: BaseEntityConfig = {
            ...originalConfig,
            ftp: {
              ...originalConfig.ftp,
              partnerName: originalConfig.ftp?.partnerName || '',
              mailSent: true,
            },
          };

          const response = await syncApprovalService.savePublishingStepConfig(
            stepId,
            { enterpriseId, enterpriseName, teamId, teamName, userId },
            updatedConfig
          );

          return response.success;
        }
      } catch (error) {
        console.error('Failed to save mailSent flag:', error);
        return false;
      }
    },
    [
      inputIntegrationsData,
      outputIntegrationsData,
      enterpriseId,
      enterpriseName,
      teamId,
      teamName,
      userId,
    ]
  );

  // Navigation handlers
  const goToMainScreen = useCallback(() => {
    setCurrentView('main');
    setApprovalSubstep(null);
  }, []);

  // Approval handlers
  const handleApprove = useCallback(
    (
      integrationId: string,
      isInput: boolean,
      partnerName: string,
      partnerId: string,
      dealerId: string,
      currentStatus: ApprovalStatus
    ) => {
      setApprovalSubstep({
        integrationIds: [integrationId],
        partnerName: partnerName || 'IMS Provider',
        partnerId: partnerId || '',
        dealerId: dealerId || '',
        isInput,
        isGrouped: false,
        currentStatus,
      });
      setCurrentView('email-form');
    },
    []
  );

  const handleBatchApprove = useCallback(
    (
      integrationIds: string[],
      partnerName: string,
      partnerId: string,
      dealerId: string,
      currentStatus: ApprovalStatus
    ) => {
      setApprovalSubstep({
        integrationIds,
        partnerName: partnerName || 'IMS Provider',
        partnerId: partnerId || '',
        dealerId: dealerId || '',
        isInput: true,
        isGrouped: true,
        currentStatus,
      });
      setCurrentView('email-form');
    },
    []
  );

  const handleSkip = useCallback(
    (integrationId: string, isInput: boolean) => {
      updateIntegrationStatus(integrationId, 'skipped', isInput);
    },
    [updateIntegrationStatus]
  );

  const handleBatchSkip = useCallback(
    (integrationIds: string[]) => {
      updateMultipleIntegrationStatus(integrationIds, 'skipped');
    },
    [updateMultipleIntegrationStatus]
  );

  const handleUndo = useCallback(
    (integrationId: string, isInput: boolean) => {
      updateIntegrationStatus(integrationId, 'pending', isInput);
    },
    [updateIntegrationStatus]
  );

  const handleBatchUndo = useCallback(
    (integrationIds: string[]) => {
      updateMultipleIntegrationStatus(integrationIds, 'pending');
    },
    [updateMultipleIntegrationStatus]
  );

  const handleChange = useCallback(
    (integrationId: string) => {
      const stepMapping = APPROVAL_TO_STEP_MAP[integrationId];

      if (!stepMapping) {
        console.warn(`No step mapping found for integration: ${integrationId}`);
        return;
      }

      const { parentStep, substepId } = stepMapping;

      if (onNavigateToStep) {
        onNavigateToStep(parentStep, substepId);
      } else {
        console.warn('onNavigateToStep callback not provided');
      }
    },
    [onNavigateToStep]
  );

  // Email flow handlers
  const handleSendEmail = useCallback(
    async (formData: EmailFormData) => {
      if (!approvalSubstep) return;

      setSaving(true);
      try {
        await syncApprovalService.sendApprovalEmail({
          to: [formData.toEmail],
          cc: [formData.ccSpynePoc, formData.ccDealershipEmail].filter(Boolean),
          bcc: [],
          from: 'support@spyne.ai',
          subject:
            formData.subject ||
            `Request: IMS Feed Integration Approval for Dealer ${approvalSubstep.dealerId}`,
          template: 'email-integration-request-approval',
          templateData: {
            partnerName: approvalSubstep.partnerName,
            dealerId: approvalSubstep.dealerId,
            description: formData.message
              ? plainTextToHtml(formData.message)
              : '',
          },
        });

        // Persist mailSent: true in entity configs for all integration IDs
        await Promise.all(
          approvalSubstep.integrationIds.map((id) => {
            const isInput = inputIntegrationsData.some(
              (item) => item.id === id
            );
            return saveEmailSentToApi(id, isInput);
          })
        );

        updateMultipleIntegrationStatus(
          approvalSubstep.integrationIds,
          'mail sent'
        );
        setApprovalSubstep((prev) =>
          prev ? { ...prev, currentStatus: 'mail sent' } : null
        );
      } catch (error) {
        console.error('Failed to send email:', error);
        showError('Failed to send approval email. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [
      approvalSubstep,
      inputIntegrationsData,
      saveEmailSentToApi,
      updateMultipleIntegrationStatus,
      showError,
    ]
  );

  /**
   * Schedule an onboarding meeting with the OB POC email after approval
   */
  const scheduleApprovalMeeting = useCallback(
    async (partnerName: string) => {
      try {
        const pocEmail = prefillEmails.pocEmail;
        if (!pocEmail) {
          console.warn('No POC email available to schedule meeting');
          return false;
        }

        const now = new Date();
        const startTime = new Date(now.getTime() + 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        await syncApprovalService.scheduleMeeting({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeZone,
          attendees: [pocEmail],
          summary: `Reminder to enable export from ${partnerName}`,
        });

        const formatTime = (date: Date) =>
          date
            .toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
            .toLowerCase();

        setScheduledReminderTime({
          start: formatTime(startTime),
          end: formatTime(endTime),
        });
        setIsScheduled(true);
        return true;
      } catch (error) {
        console.error('Failed to schedule onboarding meeting:', error);
        return false;
      }
    },
    [prefillEmails.pocEmail]
  );

  const handleApproveConfirm = useCallback(async () => {
    if (!approvalSubstep) return;

    setSaving(true);
    try {
      const results = await Promise.all(
        approvalSubstep.integrationIds.map((id) => {
          const isInput = inputIntegrationsData.some((item) => item.id === id);
          return saveApprovalToApi(id, isInput);
        })
      );

      const allSuccessful = results.every(Boolean);

      if (allSuccessful) {
        updateMultipleIntegrationStatus(
          approvalSubstep.integrationIds,
          'approved'
        );
        setApprovalSubstep((prev) =>
          prev ? { ...prev, currentStatus: 'approved' } : null
        );
        await scheduleApprovalMeeting(approvalSubstep.partnerName);
      } else {
        showError('Some approvals failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to confirm approval:', error);
      showError('Failed to confirm approval. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [
    approvalSubstep,
    inputIntegrationsData,
    saveApprovalToApi,
    updateMultipleIntegrationStatus,
    scheduleApprovalMeeting,
    showError,
  ]);

  const handleFinalConfirm = useCallback(() => {
    setApprovalSubstep(null);
    setCurrentView('main');
  }, []);

  const handleBackToList = useCallback(() => {
    setApprovalSubstep(null);
    setCurrentView('main');
  }, []);

  // Refetch data
  const refetchData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const contextValue: SyncApprovalContextType = useMemo(
    () => ({
      inputIntegrationsData,
      outputIntegrationsData,
      rawInputData,
      rawOutputData,
      currentView,
      approvalSubstep,
      loading,
      saving,
      isScheduled,
      scheduledReminderTime,
      goToMainScreen,
      handleApprove,
      handleBatchApprove,
      handleSkip,
      handleBatchSkip,
      handleUndo,
      handleBatchUndo,
      handleChange,
      handleSendEmail,
      handleApproveConfirm,
      handleFinalConfirm,
      handleBackToList,
      updateIntegrationStatus,
      refetchData,
      prefillEmails,
      partnerEmail,
      partnerEmailLoading,
      enterpriseId,
      enterpriseName,
      teamId,
      teamName,
      userId,
    }),
    [
      inputIntegrationsData,
      outputIntegrationsData,
      rawInputData,
      rawOutputData,
      currentView,
      approvalSubstep,
      loading,
      saving,
      isScheduled,
      scheduledReminderTime,
      goToMainScreen,
      handleApprove,
      handleBatchApprove,
      handleSkip,
      handleBatchSkip,
      handleUndo,
      handleBatchUndo,
      handleChange,
      handleSendEmail,
      handleApproveConfirm,
      handleFinalConfirm,
      handleBackToList,
      updateIntegrationStatus,
      refetchData,
      prefillEmails,
      partnerEmail,
      partnerEmailLoading,
      enterpriseId,
      enterpriseName,
      teamId,
      teamName,
      userId,
    ]
  );

  return (
    <SyncApprovalContext.Provider value={contextValue}>
      {children}
    </SyncApprovalContext.Provider>
  );
}
