import {
  RequestPayloadAvailabilityHours,
  RequestPayloadHoliday,
} from '@/types/vini-config';

export interface WorkingShiftData {
  sales: RequestPayloadAvailabilityHours;
  service: {
    sameAsSales: boolean;
    schedule: RequestPayloadAvailabilityHours;
  };
  parts: {
    sameAsService: boolean;
    schedule: RequestPayloadAvailabilityHours;
  };
  finance: {
    sameAsSales: boolean;
    schedule: RequestPayloadAvailabilityHours;
  };
}

export interface HolidayData {
  sales: RequestPayloadHoliday[];
  service: {
    sameAsSales: boolean;
    holidays: RequestPayloadHoliday[];
  };
  parts: {
    sameAsService: boolean;
    holidays: RequestPayloadHoliday[];
  };
  finance: {
    sameAsSales: boolean;
    holidays: RequestPayloadHoliday[];
  };
}

export const DEFAULT_AVAILABILITY_HOURS: RequestPayloadAvailabilityHours = {
  monday: {
    isAvailable: true,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: true,
  },
  tuesday: {
    isAvailable: true,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: true,
  },
  wednesday: {
    isAvailable: true,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: true,
  },
  thursday: {
    isAvailable: true,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: true,
  },
  friday: {
    isAvailable: true,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: true,
  },
  saturday: {
    isAvailable: false,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: false,
  },
  sunday: {
    isAvailable: false,
    startTime: '09:00',
    endTime: '17:30',
    isTransferAvailable: false,
  },
};
