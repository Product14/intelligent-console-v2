export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AppointmentType {
  MEETING = 'meeting',
  CALL = 'call',
  OTHER = 'other',
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  assignedToName: string;
  teamId: string;
  enterpriseId: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  userName: string;
  meetingId: string;
  callId: string;

  phoneNumber?: string;
  email?: string;
  vehicleName?: string;
  highlights?: string[];
  actionItems?: string[];
  aiSuggestions?: string[];
  audioUrl?: string;
  transcript?: string;
  transcriptUrl?: string;
  location?: string;
  tags?: string[];
  intent: string;
  servicePickupType?: string;
  vehicleDetails?: any;
  fullDetails: any;
  fullDetailsLoading: boolean;
  fullDetailsLoaded: boolean;
  fullDetailsError: boolean;
}

interface VehicleDetails {
  year: number;
  make: string;
  model: string;
  trim?: string;
  price?: string;
  fuel?: string;
  transmissionShort?: string;
  mileage?: string;
  vin?: string;
  stockNumber?: string;
  registrationNumber?: string;
  dealerVinId?: string;
  thumbnailUrl?: string;
}

interface CustomerData {
  customerId: string;
  emails: string[];
  mobileNumber: string;
  name: string;
  extractedName: string;
  customerStatus: string;
}

interface EntityData {
  entityId: string;
  externalId: string;
  vehicleDetails: VehicleDetails;
}

interface TradeInData {
  tradeRequested: string;
  whichTradeInVehicle: any;
}

export interface AppointmentResponse {
  id: string;
  meetingId: string;
  enterpriseId: string;
  teamId: string;
  leadId: string;
  assignedTo: {
    userId: string;
    userName: string;
  } | null;
  customerId: string;
  entityId: string;
  intent: string;
  meetingStartTime: string;
  timezone: string;
  duration: number;
  status: AppointmentStatus;
  callId: string;
  serviceType: string;
  tags?: string[];
  pickupType?: string | null;
  createdAt: string;
  updatedAt: string;
  customerData: CustomerData;
  entityData: EntityData | null;
  tradeInData: TradeInData;
  proposedVinsData: any[];
  transportationOption?: string;
  servicesRequested?: string[];
  externalCrmAppointmentId?: string;
  notes?: string[] | string | null;
  source?: string | null;
  advisor?: { name?: string | null; externalId?: string | null };
  proposedVins?: unknown[];
  meta?: {
    vehicles?: Array<{
      year?: number;
      make?: string;
      model?: string;
      vin?: string;
    }>;
    source?: string;
    tradeInData?: TradeInData;
    serviceVehicleData?: unknown;
  };
}

export interface AppointmentPaginationResponse {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
