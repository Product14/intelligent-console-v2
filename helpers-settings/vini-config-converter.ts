import {
  DEFAULT_AVAILABILITY_HOURS,
  HolidayData,
  WorkingShiftData,
} from '@/app/models/WorkingShift';
import {
  RequestPayloadAvailabilityHours,
  RequestPayloadCommonConfigs,
  RequestPayloadDepartmentContacts,
  RequestPayloadFinanceHolidays,
  RequestPayloadHolidays,
  RequestPayloadPartsHolidays,
  RequestPayloadWorkShiftTimings,
} from '@/types/vini-config';

/**
 * Converts API work shift timings to WorkingShiftData format
 * Now uses API format directly - no conversion needed
 */
export const convertWorkShiftTimingsToState = (
  workShiftTimings?: RequestPayloadWorkShiftTimings
): WorkingShiftData => {
  if (!workShiftTimings) {
    return {
      sales: DEFAULT_AVAILABILITY_HOURS,
      service: {
        sameAsSales: false,
        schedule: DEFAULT_AVAILABILITY_HOURS,
      },
      parts: {
        sameAsService: true,
        schedule: DEFAULT_AVAILABILITY_HOURS,
      },
      finance: {
        sameAsSales: false,
        schedule: DEFAULT_AVAILABILITY_HOURS,
      },
    };
  }

  return {
    sales: workShiftTimings.sales.availabilityHours,
    service: {
      sameAsSales: workShiftTimings.service.isSameAsSales,
      schedule: workShiftTimings.service.availabilityHours,
    },
    parts: {
      sameAsService: workShiftTimings.parts.isSameAsService,
      schedule: workShiftTimings.parts.availabilityHours,
    },
    finance: {
      sameAsSales: workShiftTimings.finance.isSameAsSales,
      schedule: workShiftTimings.finance.availabilityHours,
    },
  };
};

/**
 * Converts API holidays format to HolidayData format
 * Now uses API format directly - no conversion needed
 */
export const convertHolidaysToState = (
  holidays?: RequestPayloadHolidays
): HolidayData => {
  if (!holidays) {
    return {
      sales: [],
      service: {
        sameAsSales: false,
        holidays: [],
      },
      parts: {
        sameAsService: false,
        holidays: [],
      },
      finance: {
        sameAsSales: false,
        holidays: [],
      },
    };
  }

  return {
    sales: holidays.sales.holidays || [],
    service: {
      sameAsSales: holidays.service.isSameAsSales,
      holidays: holidays.service.holidays || [],
    },
    parts: {
      sameAsService: holidays.parts.isSameAsService,
      holidays: holidays.parts.holidays || [],
    },
    finance: {
      sameAsSales: holidays.finance.isSameAsSales,
      holidays: holidays.finance.holidays || [],
    },
  };
};

/**
 * Converts WorkingShiftData to API work shift timings format
 * Now using API format directly - no conversion needed
 */
export const convertWorkingShiftDataToApiFormat = (
  workingShifts: WorkingShiftData
): RequestPayloadWorkShiftTimings => {
  return {
    sales: {
      availabilityHours: workingShifts.sales,
    },
    service: {
      isSameAsSales: workingShifts.service.sameAsSales,
      availabilityHours: workingShifts.service.schedule,
    },
    parts: {
      isSameAsService: workingShifts.parts.sameAsService,
      availabilityHours: workingShifts.parts.schedule,
    },
    finance: {
      isSameAsSales: workingShifts.finance.sameAsSales,
      availabilityHours: workingShifts.finance.schedule,
    },
  };
};

/**
 * Converts HolidayData to API holidays format
 * Now using API format directly - no conversion needed
 */
export const convertHolidaysDataToApiFormat = (
  holidays: HolidayData
): RequestPayloadHolidays => {
  return {
    sales: {
      holidays: holidays.sales,
    },
    service: {
      isSameAsSales: holidays.service.sameAsSales,
      holidays: holidays.service.holidays,
    },
    parts: {
      isSameAsService: holidays.parts.sameAsService,
      holidays: holidays.parts.holidays,
    },
    finance: {
      isSameAsSales: holidays.finance.sameAsSales,
      holidays: holidays.finance.holidays,
    },
  };
};

/**
 * Converts complete form data to API common config format
 * Used for the vini config API request payload
 */
export const convertFormDataToCommonConfig = (
  workingShifts: WorkingShiftData,
  holidays: HolidayData,
  contacts: RequestPayloadDepartmentContacts
): RequestPayloadCommonConfigs => {
  const config: RequestPayloadCommonConfigs = {
    workShiftTimings: {
      timings: convertWorkingShiftDataToApiFormat(workingShifts),
    },
    holidays: convertHolidaysDataToApiFormat(holidays),
    contacts,
  };

  return config;
};
