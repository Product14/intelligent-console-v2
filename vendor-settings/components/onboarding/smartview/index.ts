// SmartView flow — reusable across micro-frontends
export { default as SmartViewFlow } from './smartview-flow';
export type { SmartViewFlowProps } from './smartview-flow';

// Sub-screens (can be used standalone if needed)
export { default as SmartViewIntroScreen } from './smartview-intro-screen';
export { default as SmartViewFormScreen } from './smartview-form-screen';
export { default as SmartViewSummaryScreen } from './smartview-summary-screen';

// Service
export { default as smartviewService } from './smartview-service';

// Types
export type {
  SmartViewEntityConfig,
  SmartViewEntityResponse,
  SmartViewFlowScreen,
  OnboardingCallbacks,
  DeliveryConfigOption,
  VehicleIdThrough,
  SmartViewIntegrationType,
  SmartViewVersion,
  ButtonSize,
  ButtonColorType,
} from './types';
export { isSmartViewConfig } from './types';
