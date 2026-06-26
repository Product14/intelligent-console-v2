// Predefined / standard holidays the operator can bulk-import into a
// rooftop's holiday list. First-cut data: US federal holidays for 2026 + 2027.
// Add more countries / years by extending PREDEFINED_HOLIDAYS below.

import type { HolidayRecurrence } from '@/services/settings/types';

export interface PredefinedHoliday {
  /** Stable identifier per country/year so we can detect duplicates on
   *  re-import (used as the `id` when materializing into a HolidayConfig). */
  key: string;
  name: string;
  /** YYYY-MM-DD. */
  date: string;
  /** Fixed-date holidays (Christmas, July 4) repeat yearly; floating ones
   *  (MLK Day, Thanksgiving) recur on a different date each year and are
   *  stored as one-off entries per year (`recurrence: 'none'`). */
  recurrence: HolidayRecurrence;
}

export interface CountryHolidays {
  /** ISO-3166 alpha-2 code. */
  country: string;
  countryName: string;
  /** Holidays grouped by calendar year. */
  byYear: Record<number, PredefinedHoliday[]>;
}

/** Slug suffix for ID generation. Kept stable so re-imports detect dupes. */
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function fixed(country: string, year: number, name: string, monthDay: string): PredefinedHoliday {
  return {
    key: `predefined-${country.toLowerCase()}-${slug(name)}`, // fixed-date keys don't include year — same Christmas every year
    name,
    date: `${year}-${monthDay}`,
    recurrence: 'yearly',
  };
}

function floating(country: string, year: number, name: string, isoDate: string): PredefinedHoliday {
  return {
    key: `predefined-${country.toLowerCase()}-${year}-${slug(name)}`, // year-specific key — re-importing next year is allowed
    name,
    date: isoDate,
    recurrence: 'none',
  };
}

// ---------------------------------------------------------------------------
// US federal holidays
// ---------------------------------------------------------------------------
//
// Floating holidays (always Nth weekday of month) need a date per year:
//   - MLK Day              3rd Monday of January
//   - Presidents Day       3rd Monday of February
//   - Memorial Day         last Monday of May
//   - Labor Day            1st Monday of September
//   - Columbus Day         2nd Monday of October
//   - Thanksgiving         4th Thursday of November
//
// Fixed-date holidays repeat yearly:
//   - New Year's Day       Jan 1
//   - Juneteenth           Jun 19
//   - Independence Day     Jul 4
//   - Veterans Day         Nov 11
//   - Christmas Day        Dec 25
//
// Dates use the actual calendar day, not the observed day when a holiday
// falls on a weekend. Operators can adjust per-entry in the edit modal if
// they prefer the observed date.

function usHolidays(year: number, floatingDates: {
  mlk: string; presidents: string; memorial: string; labor: string; columbus: string; thanksgiving: string;
}): PredefinedHoliday[] {
  return [
    fixed('US', year, "New Year's Day", '01-01'),
    floating('US', year, 'Martin Luther King Jr. Day', floatingDates.mlk),
    floating('US', year, "Presidents' Day", floatingDates.presidents),
    floating('US', year, 'Memorial Day', floatingDates.memorial),
    fixed('US', year, 'Juneteenth', '06-19'),
    fixed('US', year, 'Independence Day', '07-04'),
    floating('US', year, 'Labor Day', floatingDates.labor),
    floating('US', year, 'Columbus Day', floatingDates.columbus),
    fixed('US', year, 'Veterans Day', '11-11'),
    floating('US', year, 'Thanksgiving Day', floatingDates.thanksgiving),
    fixed('US', year, 'Christmas Day', '12-25'),
  ];
}

const US_HOLIDAYS: CountryHolidays = {
  country: 'US',
  countryName: 'United States',
  byYear: {
    2026: usHolidays(2026, {
      mlk: '2026-01-19',
      presidents: '2026-02-16',
      memorial: '2026-05-25',
      labor: '2026-09-07',
      columbus: '2026-10-12',
      thanksgiving: '2026-11-26',
    }),
    2027: usHolidays(2027, {
      mlk: '2027-01-18',
      presidents: '2027-02-15',
      memorial: '2027-05-31',
      labor: '2027-09-06',
      columbus: '2027-10-11',
      thanksgiving: '2027-11-25',
    }),
  },
};

// ---------------------------------------------------------------------------

export const PREDEFINED_HOLIDAYS: CountryHolidays[] = [US_HOLIDAYS];

export const SUPPORTED_COUNTRIES: Array<{ code: string; name: string }> =
  PREDEFINED_HOLIDAYS.map((g) => ({ code: g.country, name: g.countryName }));

export function getHolidaysFor(country: string, year: number): PredefinedHoliday[] {
  const group = PREDEFINED_HOLIDAYS.find((g) => g.country === country);
  if (!group) return [];
  return group.byYear[year] ?? [];
}

export function getAvailableYears(country: string): number[] {
  const group = PREDEFINED_HOLIDAYS.find((g) => g.country === country);
  if (!group) return [];
  return Object.keys(group.byYear)
    .map(Number)
    .sort((a, b) => a - b);
}
