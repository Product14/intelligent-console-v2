import { DateValue } from '../../models/date.model';
import { CIDropdownMenuOption } from '../dropdown/model';

// Shared date value mapping
export const DATE_VALUE_TO_ID: Partial<Record<DateValue, string>> = {
  [DateValue.TODAY]: 'today',
  [DateValue.YESTERDAY]: 'yesterday',
  [DateValue.LAST_7_DAYS]: 'last_7_days',
  [DateValue.LAST_30_DAYS]: 'last_30_days',
  [DateValue.LAST_60_DAYS]: 'last_60_days',
  [DateValue.LAST_90_DAYS]: 'last_90_days',
  [DateValue.CURRENT_MONTH]: 'current_month',
  [DateValue.PREVIOUS_MONTH]: 'previous_month',
  [DateValue.CURRENT_QUARTER]: 'current_quarter',
  [DateValue.PREVIOUS_QUARTER]: 'previous_quarter',
  [DateValue.NEXT_7_DAYS]: 'next_7_days',
  [DateValue.NEXT_30_DAYS]: 'next_30_days',
  [DateValue.NEXT_60_DAYS]: 'next_60_days',
  [DateValue.NEXT_90_DAYS]: 'next_90_days',
  [DateValue.NEXT_MONTH]: 'next_month',
  [DateValue.CUSTOM]: 'custom',
};

export const DATE_FILTER_PAST_OPTIONS: CIDropdownMenuOption[] = [
  {
    label: 'Today',
    value: DateValue.TODAY,
    id: DATE_VALUE_TO_ID[DateValue.TODAY],
  },
  {
    label: 'Yesterday',
    value: DateValue.YESTERDAY,
    id: DATE_VALUE_TO_ID[DateValue.YESTERDAY],
  },
  {
    label: 'Last 7 days',
    value: DateValue.LAST_7_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.LAST_7_DAYS],
  },
  {
    label: 'Last 30 days',
    value: DateValue.LAST_30_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.LAST_30_DAYS],
  },
  {
    label: 'Last 60 days',
    value: DateValue.LAST_60_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.LAST_60_DAYS],
  },
  {
    label: 'Last 90 days',
    value: DateValue.LAST_90_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.LAST_90_DAYS],
  },
  {
    label: 'This Month',
    value: DateValue.CURRENT_MONTH,
    id: DATE_VALUE_TO_ID[DateValue.CURRENT_MONTH],
  },
  {
    label: 'Last Month',
    value: DateValue.PREVIOUS_MONTH,
    id: DATE_VALUE_TO_ID[DateValue.PREVIOUS_MONTH],
  },
  {
    label: 'This Quarter',
    value: DateValue.CURRENT_QUARTER,
    id: DATE_VALUE_TO_ID[DateValue.CURRENT_QUARTER],
  },
];

export const DATE_FILTER_FUTURE_OPTIONS: CIDropdownMenuOption[] = [
  {
    label: 'Today',
    value: DateValue.TODAY,
    id: DATE_VALUE_TO_ID[DateValue.TODAY],
  },
  {
    label: 'Next 7 days',
    value: DateValue.NEXT_7_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.NEXT_7_DAYS],
  },
  {
    label: 'Next 30 days',
    value: DateValue.NEXT_30_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.NEXT_30_DAYS],
  },
  {
    label: 'Next 60 days',
    value: DateValue.NEXT_60_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.NEXT_60_DAYS],
  },
  {
    label: 'Next 90 days',
    value: DateValue.NEXT_90_DAYS,
    id: DATE_VALUE_TO_ID[DateValue.NEXT_90_DAYS],
  },
  {
    label: 'This Month',
    value: DateValue.CURRENT_MONTH,
    id: DATE_VALUE_TO_ID[DateValue.CURRENT_MONTH],
  },
  {
    label: 'Next Month',
    value: DateValue.NEXT_MONTH,
    id: DATE_VALUE_TO_ID[DateValue.NEXT_MONTH],
  },
  {
    label: 'This Quarter',
    value: DateValue.CURRENT_QUARTER,
    id: DATE_VALUE_TO_ID[DateValue.CURRENT_QUARTER],
  },
];
