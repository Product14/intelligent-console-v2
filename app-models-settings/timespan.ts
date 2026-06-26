import { DropdownOption } from '@spyne-console/design-system/dropdown';

export enum TimeSpan {
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  THIS_YEAR = 'this_year',
}

export const callHistoryDateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Last 30 days', value: 'last_30_days' },
  { label: 'Last 60 days', value: 'last_60_days' },
  { label: 'Last 90 days', value: 'last_90_days' },
  { label: 'This Month', value: 'current_month' },
  { label: 'Last Month', value: 'previous_month' },
  { label: 'This Quarter', value: 'current_quarter' },
  { label: 'Specific Dates', value: 'custom' },
];

export enum CallHistoryTimeSpan {
  LAST_1_WEEK = 'last_1_week',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
}

// Create time options for CallHistoryTimeSpan
export const callHistoryTimeOptions = [
  {
    text: 'Last 1 Week',
    value: CallHistoryTimeSpan.LAST_1_WEEK,
  },
  {
    text: 'Last 30 Days',
    value: CallHistoryTimeSpan.LAST_30_DAYS,
  },
  {
    text: 'Last 90 Days',
    value: CallHistoryTimeSpan.LAST_90_DAYS,
  },
];

export const timeOptions = [
  {
    text: 'Today',
    value: TimeSpan.TODAY,
  },
  {
    text: 'This Week',
    value: TimeSpan.THIS_WEEK,
  },
  {
    text: 'This Month',
    value: TimeSpan.THIS_MONTH,
  },
  {
    text: 'This Year',
    value: TimeSpan.THIS_YEAR,
  },
];

export const TimespanOptions: DropdownOption[] = [
  {
    key: TimeSpan.TODAY,
    id: TimeSpan.TODAY,
    label: 'Today',
    text: 'Today',
    value: TimeSpan.TODAY,
    onClick: () => {
      console.log('clicked today');
    },
  },
  {
    key: TimeSpan.THIS_WEEK,
    id: TimeSpan.THIS_WEEK,
    label: 'This Week',
    text: 'This Week',
    value: TimeSpan.THIS_WEEK,
    onClick: () => {
      console.log('clicked this week');
    },
  },
  {
    key: TimeSpan.THIS_MONTH,
    id: TimeSpan.THIS_MONTH,
    label: 'This Month',
    text: 'This Month',
    value: TimeSpan.THIS_MONTH,
    onClick: () => {
      console.log('clicked this month');
    },
  },
  {
    key: TimeSpan.THIS_YEAR,
    id: TimeSpan.THIS_YEAR,
    label: 'This Year',
    text: 'This Year',
    value: TimeSpan.THIS_YEAR,
    onClick: () => {
      console.log('clicked this year');
    },
  },
];
