import type { CallRecord } from '@/types/settings/call-record';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getCustomerDisplayName(call: CallRecord): string {
  return call.customer_name || 'Unknown Customer';
}

export function getCustomerInitials(call: CallRecord): string {
  const name = call.customer_name || 'Unknown';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase();
  }
  return name[0]?.toUpperCase() || 'C';
}

export function getCustomerDisplayPhone(call: CallRecord): string {
  return call.phoneNumber || 'Unknown Number';
}

export function getCallTypeDisplayText(callType?: string): string {
  switch (callType) {
    case 'inboundPhoneCall':
      return 'Inbound';
    case 'outboundPhoneCall':
      return 'Outbound';
    case 'webCall':
      return 'Web Call';
    default:
      return 'Call';
  }
}

/**
 * Returns a `Date` set to local midnight that represents the start of "today"
 * in the given IANA timezone (e.g. `"America/New_York"`).
 *
 * Use this for `minDate` on date pickers so a day that is still "today" in the
 * target zone is not disabled even if the user's browser clock is already past
 * midnight and showing tomorrow.
 */
export function getTodayInTimezone(timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  return new Date(get('year'), get('month') - 1, get('day'), 0, 0, 0, 0);
}

export function yyyyMmDdToPickerIsoString(
  yyyyMmDd: string | undefined | null
): string | null {
  if (yyyyMmDd == null || String(yyyyMmDd).trim() === '') {
    return null;
  }
  const trimmed = String(yyyyMmDd).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(year, month, day, 12, 0, 0, 0);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}T12:00:00`;
}

export function formatLocalDate(dateStr?: string, timezone?: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(timezone && { timeZone: timezone }),
  });
}

export function formatLocalTimeWithTimezone(
  dateStr?: string,
  timezone?: string
): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleTimeString();
}

export interface DateTimeFormatOptions {
  month?: 'short' | 'long' | 'numeric' | '2-digit';
  day?: 'numeric' | '2-digit';
  year?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  hour12?: boolean;
  timeZone?: string;
}

export function formatLocalDateTime(
  dateStr?: string,
  options?: DateTimeFormatOptions
): string {
  if (!dateStr) return 'N/A';

  const date = new Date(dateStr);
  const defaultOptions: DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const formatOptions = { ...defaultOptions, ...options };

  return date.toLocaleString(
    'en-US',
    formatOptions as Intl.DateTimeFormatOptions
  );
}

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

export function getTimezoneAbbreviation(
  timezone?: string | null,
  date: Date = new Date()
): string {
  const resolvedTimezone = timezone ?? undefined;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: resolvedTimezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find((part) => part.type === 'timeZoneName');
    return timeZoneName?.value ?? '';
  } catch (error) {
    console.warn('Error getting timezone abbreviation:', error);
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short',
      });
      const fallbackParts = fallbackFormatter.formatToParts(date);
      const fallbackName = fallbackParts.find((p) => p.type === 'timeZoneName');
      return fallbackName?.value ?? '';
    } catch {
      return '';
    }
  }
}

export interface FormattedTimestamp {
  fullDate?: string;
  date: string; // Format: "Jan 20, 2026"
  time: string; // Format: "8:36 AM EST"
  timezoneAbbr: string; // Timezone abbreviation
}

export function formatTimestampWithTimezone(
  utcTimestamp?: string | null,
  timezone?: string | null
): FormattedTimestamp {
  const effectiveTimezone = timezone ?? undefined;

  try {
    const date = utcTimestamp ? new Date(utcTimestamp) : new Date();

    if (isNaN(date.getTime())) {
      return {
        fullDate: undefined,
        date: 'N/A',
        time: 'N/A',
        timezoneAbbr: getTimezoneAbbreviation(effectiveTimezone),
      };
    }

    // Format date: "Jan 20, 2026"
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: effectiveTimezone,
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);

    // Format time: "8:36 AM"
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: effectiveTimezone,
    };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

    // Get timezone abbreviation
    const timezoneAbbr = getTimezoneAbbreviation(effectiveTimezone, date);

    return {
      fullDate: date.toLocaleString('en-US', {
        timeZone: effectiveTimezone,
      }),
      date: formattedDate,
      time: formattedTime,
      timezoneAbbr,
    };
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return {
      fullDate: undefined,
      date: 'N/A',
      time: 'N/A',
      timezoneAbbr: getTimezoneAbbreviation(effectiveTimezone),
    };
  }
}
