// Types for VINI Configuration Create API

export interface RequestPayloadDayAvailability {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  isTransferAvailable: boolean;
}

export interface RequestPayloadAvailabilityHours {
  monday: RequestPayloadDayAvailability;
  tuesday: RequestPayloadDayAvailability;
  wednesday: RequestPayloadDayAvailability;
  thursday: RequestPayloadDayAvailability;
  friday: RequestPayloadDayAvailability;
  saturday: RequestPayloadDayAvailability;
  sunday: RequestPayloadDayAvailability;
}

export interface RequestPayloadSalesShift {
  availabilityHours: RequestPayloadAvailabilityHours;
}

export interface RequestPayloadServiceShift {
  isSameAsSales: boolean;
  availabilityHours: RequestPayloadAvailabilityHours;
}

export interface RequestPayloadPartsShift {
  isSameAsService: boolean;
  availabilityHours: RequestPayloadAvailabilityHours;
}

export interface RequestPayloadFinanceShift {
  isSameAsSales: boolean;
  availabilityHours: RequestPayloadAvailabilityHours;
}

export interface RequestPayloadWorkShiftTimings {
  sales: RequestPayloadSalesShift;
  service: RequestPayloadServiceShift;
  parts: RequestPayloadPartsShift;
  finance: RequestPayloadFinanceShift;
}

export interface RequestPayloadHoliday {
  name: string;
  reason: string;
  date: string;
  isClosed: boolean;
  startTime?: string;
  endTime?: string;
}

export interface RequestPayloadSalesHolidays {
  holidays: RequestPayloadHoliday[] | undefined;
}

export interface RequestPayloadServiceHolidays {
  isSameAsSales: boolean;
  holidays: RequestPayloadHoliday[] | undefined;
}

export interface RequestPayloadHolidays {
  sales: RequestPayloadSalesHolidays | undefined;
  service: RequestPayloadServiceHolidays;
  parts: RequestPayloadPartsHolidays;
  finance: RequestPayloadFinanceHolidays;
}

export interface RequestPayloadPartsHolidays {
  isSameAsService: boolean;
  holidays: RequestPayloadHoliday[] | undefined;
}

export interface RequestPayloadFinanceHolidays {
  isSameAsSales: boolean;
  holidays: RequestPayloadHoliday[] | undefined;
}
export interface RequestPayloadContact {
  name: string;
  phone: string;
}

export interface RequestPayloadContacts {
  pickAndDropoff: RequestPayloadContact;
  loanerBookings: RequestPayloadContact;
  roadsideAssistance: RequestPayloadContact;
  parts: RequestPayloadContact;
  service: RequestPayloadContact;
  managerEscalation: RequestPayloadContact;
}

export interface RequestPayloadRequestHandlingItem {
  isLink: boolean;
  data: string;
}

export interface RequestPayloadRequestHandling {
  tradeIn: RequestPayloadRequestHandlingItem;
  lease: RequestPayloadRequestHandlingItem;
}

export interface RequestPayloadCommon {
  contacts: RequestPayloadContacts | RequestPayloadDepartmentContacts;
  workShiftTimings: {
    timezone?: string;
    timings: RequestPayloadWorkShiftTimings;
  };
  holidays: RequestPayloadHolidays;
  requestHandling: RequestPayloadRequestHandling;
  discountRequests: string;
}

export interface RequestPayloadAgent {
  agentId: string;
  templateId: string;
  agentName: string;
  firstMessage: string;
  voicemailMessage: string;
  areaCode: string;
  isReadyToGoLive?: boolean;
  fileUrls: string[];
}

export interface RequestPayloadAgentCustomization
  extends Omit<
    RequestPayloadAgent,
    | 'templateId'
    | 'agentName'
    | 'fileUrls'
    | 'firstMessage'
    | 'voicemailMessage'
    | 'areaCode'
  > {
  firstMessage?: string;
  voicemailMessage?: string;
  areaCode?: string | null;
}

export interface RequestPayloadCommonAgentCustomization
  extends Omit<
    RequestPayloadCommon,
    'workShiftTimings' | 'holidays' | 'requestHandling' | 'discountRequests'
  > {}
export interface RequestPayloadDepartmentContacts {
  sales?: RequestPayloadContact;
  service?: RequestPayloadContact;
  parts?: RequestPayloadContact;
  finance?: RequestPayloadContact;
}

export interface RequestPayloadCommonConfigs
  extends Omit<RequestPayloadCommon, 'requestHandling' | 'discountRequests'> {}
export interface RequestPayloadVehicleType {
  new: boolean;
  preOwned: boolean;
}

export interface RequestPayloadEntityConfig {
  vehicleType?: RequestPayloadVehicleType;
  serviceAddress?: RequestPayloadServiceAddress;
  salesAddress?: RequestPayloadServiceAddress;
  serviceDepartmentAddress?: RequestPayloadServiceAddress;
  partsAddress?: RequestPayloadServiceAddress;
  financeAddress?: RequestPayloadServiceAddress;
  agent?: RequestPayloadAgentCustomization;
  common?:
    | RequestPayloadCommonConfigs
    | RequestPayloadCommonAgentCustomization
    | RequestPayloadCommon;
}

export interface RequestPayloadServiceAddress {
  address: RequestPayloadAddress;
  geoCoordinates: {
    lat: number;
    lng: number;
  };
}

export interface RequestPayloadAddress {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  district: string;
  zipcode: string;
  country: string;
  countryCode?: string;
}

export interface RequestPayloadRooftopConfigs {
  website: string;
  address: RequestPayloadAddress;
  geoCoordinates: {
    lat: number;
    lng: number;
  };
  regionType: string;
  timezone: string;
}

export interface RequestPayloadRooftopData {
  website: string;
  websiteListingUrl: string;
  address: RequestPayloadAddress;
  geoCoordinates: {
    lat: number;
    lng: number;
  };
  regionType: string;
  timeZone: string;
  userData: {
    userId: string;
    contactNo: string;
    isdCode: string;
  };
}

export interface RequestPayloadRooftopProfile
  extends Omit<FetchViniConfigPayload, 'isCommonNeeded' | 'agentId'> {
  domain: string;
  entity: string;
  teamName: string;
  userId?: string;
  rooftopData?: RequestPayloadRooftopData;
  entityConfig?: RequestPayloadEntityConfig;
}

export interface RequestPayloadCreateConfig
  extends Omit<RequestPayloadRooftopProfile, 'agentType' | 'agentCallType'> {
  userId: string;
  entityConfig: RequestPayloadEntityConfig;
  createPhoneNumber?: boolean;
}

export interface FetchViniConfigPayload {
  enterpriseId: string;
  teamId: string;
  agentType: string;
  agentCallType: string;
  isCommonNeeded?: boolean;
  agentId?: string;
}
