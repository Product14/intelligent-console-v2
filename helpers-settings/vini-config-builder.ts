import {
  RequestPayloadAddress,
  RequestPayloadAgent,
  RequestPayloadAgentCustomization,
  RequestPayloadAvailabilityHours,
  RequestPayloadContact,
  RequestPayloadCreateConfig,
  RequestPayloadDayAvailability,
  RequestPayloadHoliday,
  RequestPayloadHolidays,
  RequestPayloadRooftopProfile,
  RequestPayloadServiceAddress,
} from '../types/vini-config';

export const createDayAvailability = (
  isAvailable: boolean,
  startTime: string = '09:00',
  endTime: string = '17:00',
  isTransferAvailable: boolean = isAvailable
): RequestPayloadDayAvailability => ({
  isAvailable,
  startTime: isAvailable ? startTime : '00:00',
  endTime: isAvailable ? endTime : '00:00',
  isTransferAvailable: isAvailable ? isTransferAvailable : false,
});

export const createDefaultWorkWeek = (): RequestPayloadAvailabilityHours => ({
  monday: createDayAvailability(true, '09:00', '17:00'),
  tuesday: createDayAvailability(true, '09:00', '17:00'),
  wednesday: createDayAvailability(true, '09:00', '17:00'),
  thursday: createDayAvailability(true, '09:00', '17:00'),
  friday: createDayAvailability(true, '09:00', '17:00'),
  saturday: createDayAvailability(true, '10:00', '16:00'),
  sunday: createDayAvailability(false),
});

export const createCustomWorkWeek = (
  startTime: string,
  endTime: string,
  includeWeekend: boolean = true,
  saturdayHours?: { startTime: string; endTime: string }
): RequestPayloadAvailabilityHours => ({
  monday: createDayAvailability(true, startTime, endTime),
  tuesday: createDayAvailability(true, startTime, endTime),
  wednesday: createDayAvailability(true, startTime, endTime),
  thursday: createDayAvailability(true, startTime, endTime),
  friday: createDayAvailability(true, startTime, endTime),
  saturday: includeWeekend
    ? createDayAvailability(
        true,
        saturdayHours?.startTime || '10:00',
        saturdayHours?.endTime || '16:00'
      )
    : createDayAvailability(false),
  sunday: createDayAvailability(false),
});

export const createContact = (
  name: string,
  phone: string
): RequestPayloadContact => ({
  name,
  phone,
});

export const createHoliday = (
  name: string,
  date: string,
  reason: string,
  isClosed: boolean = true,
  hours?: { startTime: string; endTime: string }
): RequestPayloadHoliday => ({
  name,
  reason,
  date,
  isClosed,
  ...(hours &&
    !isClosed && { startTime: hours.startTime, endTime: hours.endTime }),
});

export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

export const isValidPhoneFormat = (phone: string): boolean => {
  // Basic validation for formats like +1-555-0101 or similar
  const phoneRegex = /^[\+\d][\d\-\s\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};
export const isValidAreaCode = (areaCode: string): boolean => {
  const areaCodeRegex = /^\d{3}$/;
  return areaCodeRegex.test(areaCode);
};

export const isValidConfig = (
  config: any
): config is RequestPayloadCreateConfig => {
  return (
    typeof config === 'object' &&
    config !== null &&
    typeof config.enterpriseId === 'string' &&
    typeof config.teamId === 'string' &&
    typeof config.entityConfig === 'object' &&
    typeof config.entityConfig.agent === 'object' &&
    typeof config.entityConfig.common === 'object'
  );
};

const getHolidays = (
  holidays: RequestPayloadHoliday[]
): RequestPayloadHoliday[] | undefined => {
  if (holidays.length) return [...holidays];
  return [];
};

export const buildRooftopProfilePayloadFromForm = (
  formData: any,
  enterpriseId: string,
  teamId: string,
  userId: string,
  agentType: string,
  agentCallType: string
): RequestPayloadCreateConfig => {
  const rooftopAddress = formData?.rooftopAddress;
  const viniConfig = formData?.viniConfig;

  // Parse address from rooftop address
  const address: RequestPayloadAddress = {
    addressLine1: rooftopAddress?.addressLine1 || '',
    addressLine2: rooftopAddress?.addressLine2 || '',
    city: rooftopAddress?.city || '',
    state: rooftopAddress?.state || '',
    district: rooftopAddress?.district || '',
    zipcode: rooftopAddress?.zipcode || '',
    country: rooftopAddress?.country || '',
  };

  // Build vehicle types
  const vehicleType = {
    new: formData?.vehicleTypes?.new || false,
    preOwned: formData?.vehicleTypes?.preOwned || false,
  };

  const commonConfig = viniConfig?.commonConfig;
  const workShiftTimings = commonConfig?.workShiftTimings.timings;
  const holidays = commonConfig?.holidays;

  // Parse department addresses
  const salesDepartment = viniConfig?.salesDepartment;
  const serviceDepartment = viniConfig?.serviceDepartment;
  const partsDepartment = viniConfig?.partsDepartment;
  const financeDepartment = viniConfig?.financeDepartment;

  const salesAddress: RequestPayloadServiceAddress =
    salesDepartment?.salesAddressSameAsRooftop
      ? { address, geoCoordinates: formData?.geoCoordinates || {} }
      : {
          address: salesDepartment?.salesAddress?.address || {},
          geoCoordinates: salesDepartment?.salesAddress?.geoCoordinates || {},
        };

  const serviceAddress: RequestPayloadServiceAddress =
    serviceDepartment?.serviceAddressSameAsSales
      ? salesAddress
      : {
          address: serviceDepartment?.serviceAddress?.address || {},
          geoCoordinates:
            serviceDepartment?.serviceAddress?.geoCoordinates || {},
        };

  const partsAddress: RequestPayloadServiceAddress =
    partsDepartment?.partsAddressSameAsService
      ? serviceAddress
      : {
          address: partsDepartment?.partsAddress?.address || {},
          geoCoordinates: partsDepartment?.partsAddress?.geoCoordinates || {},
        };

  const financeAddress: RequestPayloadServiceAddress =
    financeDepartment?.financeAddressSameAsSales
      ? salesAddress
      : {
          address: financeDepartment?.financeAddress?.address || {},
          geoCoordinates:
            financeDepartment?.financeAddress?.geoCoordinates || {},
        };

  const payload: RequestPayloadCreateConfig = {
    enterpriseId,
    teamId,
    domain: 'product',
    entity: `${agentType}_${agentCallType}`.toLowerCase(),
    teamName: formData?.rooftopName || '',
    userId,
    rooftopData: {
      website: formData?.website || '',
      websiteListingUrl: formData?.websiteListingUrl || '',
      address,
      geoCoordinates: formData?.geoCoordinates,
      regionType: formData?.region || '',
      timeZone: formData?.timezone || '',
      userData: {
        userId: formData?.adminUserId || '',
        contactNo: formData?.adminPhone || '',
        isdCode: formData?.isdCode || '',
      },
    },
    entityConfig: {
      vehicleType,
      serviceAddress,
      salesAddress,
      partsAddress,
      financeAddress,
      common: {
        workShiftTimings: {
          timezone: formData?.timezone || '',
          timings: {
            sales: workShiftTimings.sales,
            service: {
              isSameAsSales: workShiftTimings?.service?.isSameAsSales,
              availabilityHours: workShiftTimings?.service?.isSameAsSales
                ? { ...workShiftTimings.sales?.availabilityHours }
                : workShiftTimings.service?.availabilityHours,
            },
            parts: {
              isSameAsService: workShiftTimings?.parts?.isSameAsService,
              availabilityHours: workShiftTimings?.parts?.isSameAsService
                ? {
                    ...(workShiftTimings?.service?.isSameAsSales
                      ? workShiftTimings.sales?.availabilityHours
                      : workShiftTimings.service?.availabilityHours),
                  }
                : workShiftTimings.parts?.availabilityHours,
            },
            finance: {
              isSameAsSales: workShiftTimings?.finance?.isSameAsSales,
              availabilityHours: workShiftTimings?.finance?.isSameAsSales
                ? { ...workShiftTimings.sales?.availabilityHours }
                : workShiftTimings.finance?.availabilityHours,
            },
          },
        },
        holidays: {
          sales: { holidays: getHolidays(holidays.sales.holidays) },
          service: {
            isSameAsSales: holidays.service.isSameAsSales,
            holidays: holidays.service.isSameAsSales
              ? getHolidays(holidays.sales.holidays)
              : getHolidays(holidays.service.holidays),
          },
          parts: {
            isSameAsService: holidays.parts.isSameAsService,
            holidays: holidays.parts.isSameAsService
              ? holidays.service.isSameAsSales
                ? getHolidays(holidays.sales.holidays)
                : getHolidays(holidays.service.holidays)
              : getHolidays(holidays.parts.holidays),
          },
          finance: {
            isSameAsSales: holidays.finance.isSameAsSales,
            holidays: holidays.finance.isSameAsSales
              ? getHolidays(holidays.sales.holidays)
              : getHolidays(holidays.finance.holidays),
          },
        },
        contacts: commonConfig?.contacts || {},
      },
    },
  };

  return payload;
};

export const buildAgentCustomizationPayloadFromForm = (
  formData: any,
  teamAgentMappingId: string,
  enterpriseId: string,
  teamId: string,
  userId: string,
  agentType: string,
  agentCallType: string,
  createPhoneNumber: boolean = false
): RequestPayloadCreateConfig => {
  const agentSpecificConfig: RequestPayloadAgentCustomization = {
    agentId: teamAgentMappingId,
    ...('firstMessage' in formData && { firstMessage: formData.firstMessage }),
    ...('voicemailMessage' in formData && {
      voicemailMessage: formData.voicemailMessage,
    }),
    ...('areaCode' in formData && { areaCode: formData.areaCode }),
  };

  const payload: RequestPayloadCreateConfig = {
    enterpriseId,
    teamId,
    domain: 'product',
    entity: `${agentType}_${agentCallType}`.toLowerCase(),
    teamName: formData?.rooftopName || '',
    userId,
    entityConfig: {
      agent: agentSpecificConfig,
    },
    ...(createPhoneNumber && { createPhoneNumber: true }),
  };

  return payload;
};
