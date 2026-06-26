import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

import { DateValue } from '../models/date.model';

export class DateUtils {
  static getDateRangeForDateValue(dateValue: DateValue): {
    startDate: Date;
    endDate: Date;
  } {
    let selectedStartDate: Date | undefined = undefined;
    let selectedEndDate: Date | undefined = undefined;
    const today = new Date();

    switch (dateValue) {
      case DateValue.TODAY:
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.YESTERDAY:
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        selectedStartDate = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.LAST_7_DAYS:
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // Include today, so -6 for 7 days total
        selectedStartDate = new Date(
          sevenDaysAgo.getFullYear(),
          sevenDaysAgo.getMonth(),
          sevenDaysAgo.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.LAST_30_DAYS:
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29); // Include today, so -29 for 30 days total
        selectedStartDate = new Date(
          thirtyDaysAgo.getFullYear(),
          thirtyDaysAgo.getMonth(),
          thirtyDaysAgo.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.LAST_60_DAYS:
        const sixtyDaysAgo = new Date(today);
        sixtyDaysAgo.setDate(today.getDate() - 59); // Include today, so -59 for 60 days total
        selectedStartDate = new Date(
          sixtyDaysAgo.getFullYear(),
          sixtyDaysAgo.getMonth(),
          sixtyDaysAgo.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.LAST_90_DAYS:
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 89); // Include today, so -89 for 90 days total
        selectedStartDate = new Date(
          ninetyDaysAgo.getFullYear(),
          ninetyDaysAgo.getMonth(),
          ninetyDaysAgo.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.CURRENT_MONTH:
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.PREVIOUS_MONTH:
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.CURRENT_QUARTER:
        const currentQuarterStartMonth =
          today.getMonth() - (today.getMonth() % 3);
        selectedStartDate = new Date(
          today.getFullYear(),
          currentQuarterStartMonth,
          1,
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          currentQuarterStartMonth + 3,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.PREVIOUS_QUARTER:
        const previousQuarterStartMonth =
          today.getMonth() - (today.getMonth() % 3) - 3;
        selectedStartDate = new Date(
          today.getFullYear(),
          previousQuarterStartMonth,
          1,
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          previousQuarterStartMonth + 3,
          0,
          23,
          59,
          59,
          999
        );
        break;
      // Handle future date ranges for appointments
      case DateValue.NEXT_7_DAYS:
        // Use local date to avoid timezone issues
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 6); // Today + 6 more days = 7 days total
        selectedEndDate = new Date(
          sevenDaysFromNow.getFullYear(),
          sevenDaysFromNow.getMonth(),
          sevenDaysFromNow.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.NEXT_30_DAYS:
        // Use local date to avoid timezone issues
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 29); // Today + 29 more days = 30 days total
        selectedEndDate = new Date(
          thirtyDaysFromNow.getFullYear(),
          thirtyDaysFromNow.getMonth(),
          thirtyDaysFromNow.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.NEXT_60_DAYS:
        // Use local date to avoid timezone issues
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        const sixtyDaysFromNow = new Date(today);
        sixtyDaysFromNow.setDate(today.getDate() + 59); // Today + 59 more days = 60 days total
        selectedEndDate = new Date(
          sixtyDaysFromNow.getFullYear(),
          sixtyDaysFromNow.getMonth(),
          sixtyDaysFromNow.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.NEXT_90_DAYS:
        // Use local date to avoid timezone issues
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        const ninetyDaysFromNow = new Date(today);
        ninetyDaysFromNow.setDate(today.getDate() + 89); // Today + 89 more days = 90 days total
        selectedEndDate = new Date(
          ninetyDaysFromNow.getFullYear(),
          ninetyDaysFromNow.getMonth(),
          ninetyDaysFromNow.getDate(),
          23,
          59,
          59,
          999
        );
        break;
      case DateValue.NEXT_MONTH:
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1,
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth() + 2,
          0,
          23,
          59,
          59,
          999
        );
        break;
      default:
        selectedStartDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0
        );
        selectedEndDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999
        );
        break;
    }
    return {
      startDate: selectedStartDate,
      endDate: selectedEndDate,
    };
  }
}

/**
 * Local calendar Y/M/D from `Date` → `...T00:00:00.000Z` / `...T23:59:59.999Z` (no `toISOString()` shift).
 * Same pattern as appointments-navbar / meetings API query params.
 */
export function formatLocalDateToISO(date: Date, isEndOfDay = false): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (isEndOfDay) {
    return `${year}-${month}-${day}T23:59:59.999Z`;
  }
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

/**
 * Converts a UTC ISO string to a display date string in the given timezone.
 * When timezone is provided (real UTC timestamps from formatDateInTimezoneToISO),
 * uses date-fns-tz format to render the correct calendar day in the target timezone
 * without any browser-timezone double-conversion.
 * Without timezone, reads the YYYY-MM-DD prefix directly (fake-Z / local-midnight format).
 */
export function formatISODateForDisplay(
  isoString: string,
  timezone?: string | null
): string {
  if (!isoString) return '';

  if (timezone) {
    return formatInTimeZone(new Date(isoString), timezone, 'MMM d, yyyy');
  }

  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateInTimezoneToISO(
  date: Date,
  isEndOfDay = false,
  timezone?: string | null
): string {
  if (!timezone) {
    return formatLocalDateToISO(date, isEndOfDay);
  }

  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  const zonedBoundary = isEndOfDay
    ? new Date(y, m, d, 23, 59, 59, 999)
    : new Date(y, m, d, 0, 0, 0, 0);

  return fromZonedTime(zonedBoundary, timezone).toISOString();
}

export function getTodayInTimezone(timezone?: string | null): {
  year: number;
  month: number;
  day: number;
} {
  if (!timezone) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    };
  }

  const nowInClient = toZonedTime(new Date(), timezone);
  return {
    year: nowInClient.getFullYear(),
    month: nowInClient.getMonth(),
    day: nowInClient.getDate(),
  };
}

/**
 * Timezone-aware date range calculator for preset filters.
 * Accepts both DateValue enum values (e.g. DateValue.LAST_30_DAYS)
 * and human-readable label strings (e.g. 'Last 30 days') used by the Call Logs filter.
 * Falls back to local time when timezone is not provided.
 */
export function getDateRange(
  dateValue: DateValue | string,
  timezone?: string | null
): { startDate: string; endDate: string } {
  const { year: ty, month: tm, day: td } = getTodayInTimezone(timezone);

  const toISO = (y: number, m: number, d: number, isEnd: boolean): string =>
    formatDateInTimezoneToISO(new Date(y, m, d), isEnd, timezone);

  const offset = (n: number) => new Date(ty, tm, td + n);

  switch (dateValue) {
    case DateValue.TODAY:
    case 'Today':
      return {
        startDate: toISO(ty, tm, td, false),
        endDate: toISO(ty, tm, td, true),
      };

    case DateValue.YESTERDAY:
    case 'Yesterday': {
      const d = offset(-1);
      return {
        startDate: toISO(d.getFullYear(), d.getMonth(), d.getDate(), false),
        endDate: toISO(d.getFullYear(), d.getMonth(), d.getDate(), true),
      };
    }

    case DateValue.LAST_7_DAYS:
    case 'Last 7 days': {
      const s = offset(-6);
      return {
        startDate: toISO(s.getFullYear(), s.getMonth(), s.getDate(), false),
        endDate: toISO(ty, tm, td, true),
      };
    }

    case 'Last 14 days': {
      const s = offset(-13);
      return {
        startDate: toISO(s.getFullYear(), s.getMonth(), s.getDate(), false),
        endDate: toISO(ty, tm, td, true),
      };
    }

    case DateValue.LAST_30_DAYS:
    case 'Last 30 days': {
      const s = offset(-29);
      return {
        startDate: toISO(s.getFullYear(), s.getMonth(), s.getDate(), false),
        endDate: toISO(ty, tm, td, true),
      };
    }

    case DateValue.LAST_60_DAYS: {
      const s = offset(-59);
      return {
        startDate: toISO(s.getFullYear(), s.getMonth(), s.getDate(), false),
        endDate: toISO(ty, tm, td, true),
      };
    }

    case DateValue.LAST_90_DAYS:
    case 'Last 90 days': {
      const s = offset(-89);
      return {
        startDate: toISO(s.getFullYear(), s.getMonth(), s.getDate(), false),
        endDate: toISO(ty, tm, td, true),
      };
    }

    case DateValue.CURRENT_MONTH:
    case 'This month':
      return {
        startDate: toISO(ty, tm, 1, false),
        endDate: toISO(ty, tm + 1, 0, true),
      };

    case DateValue.PREVIOUS_MONTH:
    case 'Last month': {
      const firstOfLastMonth = new Date(ty, tm - 1, 1);
      const lastOfLastMonth = new Date(ty, tm, 0);
      return {
        startDate: toISO(
          firstOfLastMonth.getFullYear(),
          firstOfLastMonth.getMonth(),
          firstOfLastMonth.getDate(),
          false
        ),
        endDate: toISO(
          lastOfLastMonth.getFullYear(),
          lastOfLastMonth.getMonth(),
          lastOfLastMonth.getDate(),
          true
        ),
      };
    }

    case DateValue.CURRENT_QUARTER:
    case 'This quarter': {
      const quarterStart = Math.floor(tm / 3) * 3;
      return {
        startDate: toISO(ty, quarterStart, 1, false),
        endDate: toISO(ty, quarterStart + 3, 0, true),
      };
    }

    case DateValue.PREVIOUS_QUARTER: {
      const prevQStart = Math.floor(tm / 3) * 3 - 3;
      return {
        startDate: toISO(ty, prevQStart, 1, false),
        endDate: toISO(ty, prevQStart + 3, 0, true),
      };
    }

    case DateValue.NEXT_7_DAYS: {
      const e = offset(6);
      return {
        startDate: toISO(ty, tm, td, false),
        endDate: toISO(e.getFullYear(), e.getMonth(), e.getDate(), true),
      };
    }

    case DateValue.NEXT_30_DAYS: {
      const e = offset(29);
      return {
        startDate: toISO(ty, tm, td, false),
        endDate: toISO(e.getFullYear(), e.getMonth(), e.getDate(), true),
      };
    }

    case DateValue.NEXT_60_DAYS: {
      const e = offset(59);
      return {
        startDate: toISO(ty, tm, td, false),
        endDate: toISO(e.getFullYear(), e.getMonth(), e.getDate(), true),
      };
    }

    case DateValue.NEXT_90_DAYS: {
      const e = offset(89);
      return {
        startDate: toISO(ty, tm, td, false),
        endDate: toISO(e.getFullYear(), e.getMonth(), e.getDate(), true),
      };
    }

    case DateValue.NEXT_MONTH:
      return {
        startDate: toISO(ty, tm + 1, 1, false),
        endDate: toISO(ty, tm + 2, 0, true),
      };

    case 'Year to date':
      return {
        startDate: toISO(ty, 0, 1, false),
        endDate: toISO(ty, tm, td, true),
      };

    case 'Upcoming':
      return {
        startDate: toISO(ty, tm, td, false),
        endDate: toISO(ty + 2, tm, td, true),
      };

    default: {
      const s = offset(-29);
      return {
        startDate: toISO(s.getFullYear(), s.getMonth(), s.getDate(), false),
        endDate: toISO(ty, tm, td, true),
      };
    }
  }
}
