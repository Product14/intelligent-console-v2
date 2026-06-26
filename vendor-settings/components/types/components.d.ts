declare module '@spyne-console/components/header' {
  const Header: any;
  export default Header;
}

declare module '@spyne-console/components/new-header' {
  const NewHeader: any;
  export default NewHeader;
}

declare module '@spyne-console/components/header-v2' {
  const Header: any;
  export default Header;
}

declare module '@spyne-console/components/sidebar' {
  const Sidebar: any;
  export default Sidebar;
}

declare module '@spyne-console/components/header-new' {
  const HeaderNew: any;
  export default HeaderNew;
}

declare module '@spyne-console/components/sidebar-new' {
  const SidebarNew: any;
  export default SidebarNew;
}

declare module '@spyne-console/components/not-found' {
  const NotFound: any;
  export default NotFound;
}

declare module '@spyne-console/components/error' {
  const Error: any;
  export default Error;
}

declare module '@spyne-console/components/loading' {
  const Loading: any;
  export default Loading;
}

declare module '@spyne-console/components/infinite-scroll' {
  const InfiniteScroll: any;
  export default InfiniteScroll;
}

declare module '@spyne-console/components/prefetch-cross-zone-links' {
  const PrefetchCrossZoneLinks: any;
  export default PrefetchCrossZoneLinks;
}

declare module '@spyne-console/components/GuestLoginModal' {
  const GuestLoginModal: any;
  export default GuestLoginModal;
}

declare module '@spyne-console/components/GuestLogin' {
  const GuestLogin: any;
  export default GuestLogin;
}

declare module '@spyne-console/components/GuestSignInSignUpModal' {
  const GuestSignInSignUpModal: any;
  export default GuestSignInSignUpModal;
}

declare module '@spyne-console/components/MainWrapper' {
  const MainWrapper: any;
  export default MainWrapper;
}

declare module '@spyne-console/components/GuestSignInSignUpButton' {
  const GuestSignInSignUpButton: any;
  export default GuestSignInSignUpButton;
}

declare module '@spyne-console/components/ResetPassword' {
  const ResetPassword: any;
  export default ResetPassword;
}

declare module '@spyne-console/components/SetPassword' {
  const SetPassword: any;
  export default SetPassword;
}

declare module '@spyne-console/components/EcomLoginModal' {
  const EcomLoginModal: any;
  export default EcomLoginModal;
}

declare module '@spyne-console/components/enterprise-team-selection' {
  const EnterpriseTeamSelection: any;
  export default EnterpriseTeamSelection;
}

declare module '@spyne-console/components/mobile-views/BottomModal' {
  const BottomModal: any;
  export default BottomModal;
}

declare module '@spyne-console/components/before-after-image-comparison-slider' {
  const BeforeAfterImageComparisonSlider: any;
  export default BeforeAfterImageComparisonSlider;
}

declare module '@spyne-console/components/video-embed-aspect-ratio-switcher' {
  const VideoEmbedAspectRatioSwitcher: any;
  export default VideoEmbedAspectRatioSwitcher;
}

declare module '@spyne-console/components/upgrade-modal' {
  const UpgradeModal: any;
  export default UpgradeModal;
}

declare module '@spyne-console/components/image-clone/cloning-data/clone-controller' {
  const CloneController: any;
  export default CloneController;
}

declare module '@spyne-console/components/image-clone/no-clone-data/no-clone-presenter' {
  const NoClonePresenter: any;
  export default NoClonePresenter;
}

declare module '@spyne-console/components/onboarding/onboarding-step-header' {
  const OnboardingStepHeader: any;
  export default OnboardingStepHeader;
}

declare module '@spyne-console/components/onboarding/onboarding-stepper' {
  const OnboardingStepper: any;
  export default OnboardingStepper;
}

declare module '@spyne-console/components/onboarding/rooftop-profile/onboarding-rooftop-details' {
  const OnboardingRooftopDetails: any;
  export default OnboardingRooftopDetails;
}

declare module '@spyne-console/components/onboarding/rooftop-profile/onboarding-rooftop-subscription' {
  const OnboardingRooftopSubscription: any;
  export default OnboardingRooftopSubscription;
}

declare module '@spyne-console/components/onboarding/rooftop-profile/api/get-common-rooftop-configs' {
  export function transformCommonRooftopConfigsResponse(
    apiResponse: unknown
  ): Record<string, unknown> | null;
  export function getCommonRooftopConfigs(params: {
    enterpriseId: string;
    teamId: string;
  }): Promise<Record<string, unknown> | null>;
}

declare module '@spyne-console/components/onboarding/onboarding-background-grid' {
  const OnboardingBackgroundGrid: any;
  export default OnboardingBackgroundGrid;
}

declare module '@spyne-console/components/onboarding/buttons/onboarding-primary-button' {
  import React from 'react';
  const OnboardingPrimaryButton: any;
  export default OnboardingPrimaryButton;
}

declare module '@spyne-console/components/onboarding/buttons/onboarding-secondary-button' {
  import React from 'react';
  const OnboardingSecondaryButton: any;
  export default OnboardingSecondaryButton;
}

declare module '@spyne-console/components/onboarding/buttons/onboarding-start-button' {
  const OnboardingStartButton: any;
  export default OnboardingStartButton;
}

declare module '@spyne-console/components/onboarding/badges' {
  export interface PlanBadgeProps {
    plan:
      | 'PRO'
      | 'LITE'
      | 'Pro'
      | 'Lite'
      | 'Growth'
      | 'Essential'
      | 'Comprehensive';
  }

  export interface StudioAiBadgeProps {
    plan:
      | 'PRO'
      | 'LITE'
      | 'Pro'
      | 'Lite'
      | 'Growth'
      | 'Essential'
      | 'Comprehensive';
    className?: string;
    labelClassName?: string;
    badgeClassName?: string;
  }

  export function PlanBadge(props: PlanBadgeProps): JSX.Element;
  export function StudioAiBadge(props: StudioAiBadgeProps): JSX.Element;
}

declare module '@spyne-console/components/onboarding/onboarding-footer' {
  const OnboardingFooter: any;
  export default OnboardingFooter;
}

declare module '@spyne-console/components/onboarding/onboarding-pdf-viewer' {
  const OnboardingPdfViewer: any;
  export default OnboardingPdfViewer;
}

declare module '@spyne-console/components/onboarding/integrations' {
  import React from 'react';

  // IMS Partners Data
  export interface ImsPartner {
    id: string;
    name: string;
    icon: string;
    type?: 'ftp' | 'api' | 'manual';
  }

  export const IMS_PARTNERS: ImsPartner[];

  export type ImsOptionType = 'public-api' | 'no-ims' | 'ims-not-listed';

  export interface ImsAlternativeOption {
    id: ImsOptionType;
    title: string;
    description: string;
    hasExternalLink?: boolean;
  }

  export const IMS_ALTERNATIVE_OPTIONS: ImsAlternativeOption[];

  // Partner Form Data
  export interface PartnerFormData {
    providerId: string;
    providerName: string;
    type: string;
    dealerId: string;
  }

  // Threshold Config
  export interface ThresholdConfig {
    new?: number;
    preOwned?: number;
  }

  // IMS Not Listed Screen Props
  export interface ImsNotListedScreenProps {
    providerName?: string;
    onBack: () => void;
    partnerName: string;
    onPartnerNameChange: (value: string) => void;
    pocName: string;
    onPocNameChange: (value: string) => void;
    pocEmail: string;
    onPocEmailChange: (value: string) => void;
    pocContact: string;
    onPocContactChange: (value: string) => void;
    onValidationChange?: (hasError: boolean) => void;
  }

  // Thanks Screen Props
  export interface ThanksScreenProps {
    title?: string;
    imageUrl?: string;
    backgroundUrl?: string;
  }

  // Onboarding Callbacks - abstracts studio/vini specific navigation
  export interface OnboardingCallbacks {
    handleNextStep: (options?: {
      skipCompletion?: boolean;
    }) => void | Promise<void>;
    handlePrevStep: () => void;
    handleSkipStep?: () => void;
    onboardingStartTime?: string | number | null;
  }

  // Entity types
  export type IntegrationEntity = 'IMS' | 'PHOTO' | 'CGI';
  export type IntegrationStepId =
    | 'inventory-provider'
    | 'photo-provider'
    | 'cgi-provider';
  export type CurrentView = 'main' | IntegrationStepId;

  export interface IntegrationStep {
    id: IntegrationStepId;
    title: string;
    subtitle: string;
    iconUrl: string;
    mandatory: boolean;
    done: boolean;
    disabled: boolean;
  }

  export interface EntityConfig {
    ftp?: any;
    api?: any;
    app?: boolean;
    console?: boolean;
    partnerProviderTypes?: string[];
    mediaclone?: boolean;
  }

  export interface IntegrationEntityResponse {
    enterpriseName: string;
    TeamName: string;
    enterpriseID: string;
    userID: string;
    TeamId: string;
    domain: string;
    entity: IntegrationEntity;
    entityconfig: EntityConfig;
  }

  export interface IntegrationsData {
    inventory: IntegrationEntityResponse | null;
    photo: IntegrationEntityResponse | null;
    cgi: IntegrationEntityResponse | null;
  }

  export interface IntegrationsContextType {
    steps: IntegrationStep[];
    currentView: CurrentView;
    goToStep: (stepId: IntegrationStepId) => void;
    goToMainScreen: () => void;
    confirmStep: (
      stepId: IntegrationStepId,
      entityConfig?: EntityConfig,
      skipMoveToNextStep?: boolean
    ) => Promise<void>;
    canProceedToNextOnboardingStep: boolean;
    allMandatoryDone: boolean;
    allStepsDone: boolean;
    loading: boolean;
    saving: boolean;
    hasNewVehicleEnabled: boolean;
    enterpriseId: string;
    teamId: string;
    userId: string;
    userEmail: string;
    inventoryOnly: boolean;
    integrationsData: IntegrationsData;
  }

  // IntegrationsFlow - reusable entry point
  export interface IntegrationsFlowProps {
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
    userEmail: string;
    onboardingCallbacks: OnboardingCallbacks;
    /** When true, only shows Inventory Provider step and skips Photo & CGI */
    inventoryOnly?: boolean;
  }

  export const IntegrationsFlow: React.FC<IntegrationsFlowProps>;

  // Context exports
  export const IntegrationsProvider: React.FC<{
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
    userEmail: string;
    inventoryOnly?: boolean;
    children: React.ReactNode;
  }>;
  export function useIntegrations(): IntegrationsContextType;

  // Common Components
  export const CommonIntegrationCard: any;
  export const PartnersSelection: any;
  export const PartnerDetailsForm: any;
  export const PartnerCard: any;
  export const ImsNotListedCard: any;
  export const ImsNotListedScreen: any;
  export const ThanksScreen: any;

  // Public API modals (shared with publishing)
  export const GenerateApiKeyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (name: string) => Promise<string>;
    isGenerating: boolean;
  }>;
  export const ResetApiKeyModal: React.FC<{
    onClose: () => void;
    onResetKey: () => void;
    isGenerating: boolean;
  }>;

  export default CommonIntegrationCard;
}

declare module '@spyne-console/components/onboarding/sync-approval' {
  import React from 'react';

  // Approval Status
  export type ApprovalStatus = 'pending' | 'mail sent' | 'approved' | 'skipped';

  // FTP config for approval cards
  export interface ApprovalFTPConfig {
    partnerName: string;
    partnerId: string;
    partnerIcon: string;
    dealerId: string;
    approved?: boolean;
  }

  // Approval data
  export interface ApprovalData {
    required: boolean;
    status: ApprovalStatus;
  }

  // Input type for approval cards
  export interface ApprovalInputType {
    FTP: ApprovalFTPConfig;
  }

  // Integration item for approval cards
  export interface IntegrationItem {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    type: 'Input' | 'Output';
    approvalData: ApprovalData;
    isDataAdded: boolean;
    inputType?: ApprovalInputType;
    outputType?: ApprovalInputType;
    originalEntityConfig?: any;
    entity?: string;
  }

  // Sync approval view state
  export type SyncApprovalView = 'main' | 'email-form';

  // Approval substep state
  export interface ApprovalSubstep {
    integrationIds: string[];
    partnerName: string;
    partnerId: string;
    dealerId: string;
    isInput: boolean;
    isGrouped: boolean;
    currentStatus: ApprovalStatus;
  }

  // Email form data
  export interface EmailFormData {
    toEmail: string;
    ccSpynePoc: string;
    ccDealershipEmail: string;
    dealerId: string;
    subject: string;
    message: string;
  }

  // Grouped integration
  export interface GroupedIntegration {
    partnerId: string;
    partnerName: string;
    partnerIcon: string;
    inputIntegrations: IntegrationItem[];
    outputIntegrations: IntegrationItem[];
    status: ApprovalStatus;
    firstInputIndex: number;
  }

  // Onboarding callbacks
  export interface OnboardingCallbacks {
    handleNextStep: (options?: {
      skipCompletion?: boolean;
    }) => void | Promise<void>;
    handlePrevStep: () => void;
    onboardingStartTime?: string | number | null;
  }

  // Prefill emails
  export interface PrefillEmails {
    pocEmail: string;
    dealerEmail: string;
  }

  // Raw data types
  export interface InputIntegrationsRawData {
    inventory: any;
    photo: any;
    cgi: any;
  }

  export interface OutputIntegrationsRawData {
    FTP: any;
    SYNDICATION: any;
    WEBHOOK: any;
    API: any;
    SMARTVIEW: any;
    SPYNE_PLATFORM: any;
  }

  // Context type
  export interface SyncApprovalContextType {
    inputIntegrationsData: IntegrationItem[];
    outputIntegrationsData: IntegrationItem[];
    rawInputData: InputIntegrationsRawData;
    rawOutputData: OutputIntegrationsRawData;
    currentView: SyncApprovalView;
    approvalSubstep: ApprovalSubstep | null;
    loading: boolean;
    saving: boolean;
    isScheduled: boolean;
    scheduledReminderTime: { start: string; end: string } | null;
    goToMainScreen: () => void;
    handleApprove: (
      integrationId: string,
      isInput: boolean,
      partnerName: string,
      partnerId: string,
      dealerId: string,
      currentStatus: ApprovalStatus
    ) => void;
    handleBatchApprove: (
      integrationIds: string[],
      partnerName: string,
      partnerId: string,
      dealerId: string,
      currentStatus: ApprovalStatus
    ) => void;
    handleSkip: (integrationId: string, isInput: boolean) => void;
    handleBatchSkip: (integrationIds: string[]) => void;
    handleUndo: (integrationId: string, isInput: boolean) => void;
    handleBatchUndo: (integrationIds: string[]) => void;
    handleChange: (integrationId: string) => void;
    handleSendEmail: (formData: EmailFormData) => Promise<void>;
    handleApproveConfirm: () => Promise<void>;
    handleFinalConfirm: () => void;
    handleBackToList: () => void;
    updateIntegrationStatus: (
      integrationId: string,
      newStatus: ApprovalStatus,
      isInput: boolean
    ) => void;
    refetchData: () => Promise<void>;
    prefillEmails: PrefillEmails;
    partnerEmail: string;
    partnerEmailLoading: boolean;
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
  }

  // SyncApprovalFlow - reusable entry point
  export interface SyncApprovalFlowProps {
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
    productLineId?: string;
    onboardingCallbacks: OnboardingCallbacks;
    onNavigateToStep?: (parentStep: string, substepId: string) => void;
    /** When true, only shows the IMS (inventory-provider) approval card and skips all others */
    imsOnly?: boolean;
    /** Optional error handler (e.g. toast.error). Falls back to console.error */
    onShowError?: (message: string) => void;
  }

  export const SyncApprovalFlow: React.FC<SyncApprovalFlowProps>;

  // Context exports
  export const SyncApprovalProvider: React.FC<{
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
    productLineId?: string;
    onNavigateToStep?: (parentStep: string, substepId: string) => void;
    onShowError?: (message: string) => void;
    imsOnly?: boolean;
    children: React.ReactNode;
  }>;
  export function useSyncApproval(): SyncApprovalContextType;

  // UI Components
  export const ApprovalIntegrationCard: any;
  export const GroupedApprovalCard: any;
  export const StatusBadge: any;

  // Email form components
  export const EmailApprovalForm: any;
  export const PendingEmailForm: any;
  export const ApprovalStatusScreen: any;
  export const SkippedScreen: any;

  // Service
  export const syncApprovalService: any;

  export default SyncApprovalFlow;
}

declare module '@spyne-console/components/onboarding/smartview' {
  import React from 'react';

  // SmartView config types
  export type DeliveryConfigOption = 'QC_DONE' | 'AI_DONE' | 'BOTH';
  export type VehicleIdThrough = 'VIN' | 'STOCK_NUMBER';
  export type SmartViewIntegrationType = 'BUTTON' | 'PAGE_LOADER';
  export type SmartViewVersion = 't1' | 't2';
  export type ButtonSize = 'SMALL' | 'MEDIUM' | 'LARGE';
  export type ButtonColorType = 'purple' | 'white' | 'custom';
  export type SmartViewFlowScreen = 'intro' | 'form' | 'summary';

  export interface SmartViewEntityConfig {
    website_url?: string;
    website_provider?: string;
    vehicle_id_through?: VehicleIdThrough;
    vehichle_id_xpath?: string;
    vehichle_id_xpath_mobile?: string;
    div_path?: string;
    div_path_mobile?: string;
    integration_button?: boolean;
    integration_page_loader?: boolean;
    version?: SmartViewVersion;
    button_text?: string;
    button_size?: ButtonSize;
    button_color_type?: ButtonColorType;
    button_color_hex?: string;
    delivery_config_spin?: DeliveryConfigOption | 'OFF';
    delivery_config_image?: DeliveryConfigOption | 'OFF';
    delivery_config_video?: DeliveryConfigOption | 'OFF';
    script_url?: string;
    script_id?: string;
  }

  export interface SmartViewEntityResponse {
    enterpriseName: string;
    TeamName: string;
    enterpriseID: string;
    userID: string;
    TeamId: string;
    domain: string;
    entity: string;
    entityconfig: SmartViewEntityConfig | Record<string, unknown>;
  }

  export interface OnboardingCallbacks {
    handleNextStep: (options?: {
      skipCompletion?: boolean;
    }) => void | Promise<void>;
    handlePrevStep: () => void;
    onboardingStartTime?: string | number | null;
  }

  export interface SmartViewFlowProps {
    enterpriseId: string;
    enterpriseName: string;
    teamId: string;
    teamName: string;
    userId: string;
    onboardingCallbacks: OnboardingCallbacks;
    onGoBack: () => void;
    initialEntityResponse?: SmartViewEntityResponse | null;
    product: 'studio' | 'vini';
    onShowError?: (message: string) => void;
    onShowSuccess?: (message: string) => void;
  }

  export const SmartViewFlow: React.FC<SmartViewFlowProps>;

  // Sub-screens
  export const SmartViewIntroScreen: React.FC<{ onNext: () => void }>;
  export const SmartViewFormScreen: React.FC<any>;
  export const SmartViewSummaryScreen: React.FC<any>;

  // Service
  export const smartviewService: {
    fetchSmartViewEntityConfig: (
      enterpriseId: string,
      teamId: string
    ) => Promise<SmartViewEntityResponse | null>;
    saveSmartViewEntityConfig: (
      params: {
        enterpriseId: string;
        enterpriseName: string;
        teamId: string;
        teamName: string;
        userId: string;
      },
      entityConfig: SmartViewEntityConfig
    ) => Promise<{
      success: boolean;
      message: string;
      data?: SmartViewEntityResponse;
    }>;
  };

  export function isSmartViewConfig(
    config: SmartViewEntityConfig | Record<string, unknown>
  ): config is SmartViewEntityConfig;

  export default SmartViewFlow;
}

declare module '@spyne-console/components/onboarding/rooftop-profile/onboarding-location-picker' {
  const OnboardingLocationPicker: any;
  export const LocationInputField: any;
  export default OnboardingLocationPicker;
}

declare module '@spyne-console/components/color-square' {
  import React from 'react';

  export interface ColorSquareProps {
    onAddColor: (hex: string) => void;
    hexCode: string;
    setColorInput: (hex: string) => void;
  }

  export const ColorSquare: any;
  export default ColorSquare;
}

declare module '@spyne-console/components/onboarding/toggle-switch' {
  export interface ToggleSwitchProps {
    isOn: boolean;
    onToggle: () => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
  }

  export const ToggleSwitch: any;
  export default ToggleSwitch;
}

declare module '@spyne-console/components/publishing' {
  import type { ReactNode } from 'react';

  export interface PublishingData {
    vehicleId?: string;
    title?: string;
    description?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    enterpriseId?: string;
    teamId?: string;
    dealerVinId?: string;
    mediaId?: string;
    vin?: string;
    outputProcessingList?: Record<string, boolean | null>;
    mediaChildRelations?: Record<string, { id: string; label: string } | null>;
    vehicleMedia?: unknown;
    [key: string]: unknown;
  }

  export interface PublishingProps {
    data?: PublishingData;
    trigger?: (props: { onClick: () => void }) => ReactNode;
    buttonClassName?: string;
    buttonText?: string;
    onDownloadClick?: () => void;
    showToast?: (message: string, type: 'success' | 'error') => void;
  }

  const Publishing: import('react').FC<PublishingProps>;
  export default Publishing;
}

declare module '@spyne-console/components' {
  // Toggle Switch
  export interface ToggleSwitchProps {
    isOn: boolean;
    onToggle: () => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
  }
  export const ToggleSwitch: any;

  // Other exports from main index
  export const Header: any;
  export const HeaderTeamsDropdown: any;
  export const HeaderCredits: any;
  export const Sidebar: any;
  export const NotFound: any;
  export const Loading: any;
  export const PrefetchCrossZoneLinks: any;
  export const WebsiteDropdown: any;
  export const UpgradeModal: any;
  export const GuestLoginModal: any;
  export const GuestLogin: any;
  export const GuestSignInSignUpModal: any;
  export const BeforeAfterImageComparisonSlider: any;
  export const GuestSignInSignUpButton: any;
  export const MainWrapper: any;
  export const EcomLoginModal: any;
  export const EnterpriseTeamSelection: any;
  export const ResetPassword: any;
  export const SetPassword: any;
  export const VideoEmbedAspectRatioSwitcher: any;
  export const FloatingHelpAndSupport: any;
  export const MainModal: any;
  export const BillingAndPayments: any;
  export const OnboardingStepper: any;
  export const OnboardingStepHeader: any;
  export const OnboardingRooftopSubscription: any;
  export const OnboardingRooftopDetails: any;
  export const CommonIntegrationCard: any;
  export const ColorSquare: any;
  export const PlanBadge: any;
  export const StudioAiBadge: any;
  export const StudioSidebar: any;
  export const ExistingParentVinModal: any;
}
