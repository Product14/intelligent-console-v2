export enum IntegrationStatus {
  NOT_STARTED = 'not_started',
  REQUEST_RAISED = 'request_raised',
  CONNECTED = 'connected',
}

// Interfaces
export interface Voip {
  entityName: string;
  businessEin: string;
  callerIdName: string;
  poc: {
    number: string;
    areaCode: string;
  };
}

export interface Address {
  fullAddress: string;
  district: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface DayShift {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityHours {
  monday: DayShift;
  tuesday: DayShift;
  wednesday: DayShift;
  thursday: DayShift;
  friday: DayShift;
  saturday: DayShift;
  sunday: DayShift;
}

export interface IntegrationState {
  status: IntegrationStatus;
  provider: string;
  metadata: Record<string, any>;
}

export interface SalesIntegrationStates {
  crm?: IntegrationState;
  ims?: IntegrationState;
}

export interface ServiceIntegrationStates {
  serviceSchedulerSystem: IntegrationState;
}

export interface IntegrationStates {
  states?: SalesIntegrationStates | ServiceIntegrationStates;
  hasOptedForNotification?: boolean;
}

export interface SalesLevelConfigs {
  requestsHandling: {
    tradeIn: {
      isLink: boolean;
      data: string;
    };
    financeLeasing: {
      isLink: boolean;
      data: string;
    };
  };
  discountRequests: string;
}

export interface ServiceLevelConfigs {
  [key: string]: any;
}
