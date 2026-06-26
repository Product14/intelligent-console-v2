// ============================================
// SMARTVIEW SPECIFIC CONFIG TYPES
// ============================================

// Delivery config options
export type DeliveryConfigOption = 'QC_DONE' | 'AI_DONE' | 'BOTH';

// Vehicle ID through options
export type VehicleIdThrough = 'VIN' | 'STOCK_NUMBER';

// Integration type options
export type SmartViewIntegrationType = 'BUTTON' | 'PAGE_LOADER';

// SmartView version/template options
export type SmartViewVersion = 't1' | 't2';

// Button size options
export type ButtonSize = 'SMALL' | 'MEDIUM' | 'LARGE';

// Button color options
export type ButtonColorType = 'purple' | 'white' | 'custom';

// SmartView entity configuration
export interface SmartViewEntityConfig {
  // Website configuration
  website_url?: string;
  website_provider?: string;

  // Vehicle identification
  vehicle_id_through?: VehicleIdThrough;
  vehichle_id_xpath?: string;
  vehichle_id_xpath_mobile?: string;

  // Div paths for integration
  div_path?: string;
  div_path_mobile?: string;

  // Integration type flags (mutually exclusive)
  integration_button?: boolean;
  integration_page_loader?: boolean;

  // Version
  version?: SmartViewVersion;

  // Button configuration (only when integration_button is true)
  button_text?: string;
  button_size?: ButtonSize;
  button_color_type?: ButtonColorType;
  button_color_hex?: string;

  // Delivery configuration
  delivery_config_spin?: DeliveryConfigOption | 'OFF';
  delivery_config_image?: DeliveryConfigOption | 'OFF';
  delivery_config_video?: DeliveryConfigOption | 'OFF';

  // Generated script URL (returned after save)
  script_url?: string;
  script_id?: string;

  is_ci_enabled?: number | boolean;
  is_studio_enabled?: number | boolean;
}

// Publishing entity types needed for API calls
export type PublishingEntity =
  | 'FTP'
  | 'PARTNER'
  | 'SMARTVIEW'
  | 'SYNDICATION'
  | 'WEBHOOK'
  | 'API'
  | 'SPYNE_PLATFORM';

// API Response for GET entity data
export interface SmartViewEntityResponse {
  enterpriseName: string;
  TeamName: string;
  enterpriseID: string;
  userID: string;
  TeamId: string;
  domain: string;
  entity: PublishingEntity;
  entityconfig: SmartViewEntityConfig | Record<string, unknown>;
}

// Type guard for SmartView entity config
export function isSmartViewConfig(
  config: SmartViewEntityConfig | Record<string, unknown>
): config is SmartViewEntityConfig {
  return (
    'website_url' in config ||
    'vehichle_id_xpath' in config ||
    'script_url' in config ||
    'integration_button' in config ||
    'integration_page_loader' in config
  );
}

// Callbacks abstraction for onboarding navigation
export interface OnboardingCallbacks {
  handleNextStep: (options?: {
    skipCompletion?: boolean;
  }) => void | Promise<void>;
  handlePrevStep: () => void;
  onboardingStartTime?: string | number | null;
}

// Save entity request payload
export interface SaveSmartViewEntityRequest {
  enterpriseId: string;
  enterpriseName: string;
  teamId: string;
  teamName: string;
  userId: string;
  domain: 'publish';
  entity: 'SMARTVIEW';
  entityconfig: SmartViewEntityConfig;
}

// Save entity response
export interface SaveSmartViewEntityResponse {
  success: boolean;
  message: string;
  data?: SmartViewEntityResponse;
}

// SmartView flow screen type
export type SmartViewFlowScreen = 'intro' | 'form' | 'summary';
