import { ActionItemIntentTypeLabel } from '@/models/action-item-intent.enum';

import { StringUtils } from '@/utils-settings/StringUtils';

export const SHARED_INTENT_VALUES = ['REQUEST_CALLBACK'] as const;

export type SharedIntentValue = (typeof SHARED_INTENT_VALUES)[number];

export const SALES_INTENT_VALUES = [
  ...SHARED_INTENT_VALUES,
  'SALES_SCHEDULE_TEST_DRIVE',
  'SALES_SEND_VEHICLE_INFO',
  'SALES_FOLLOW_UP_WITH_QUOTE',
  'SALES_SCHEDULE_SHOWROOM_VISIT',
  'SALES_FOLLOW_UP_BE_BACK',
  'SALES_TRADE_IN_FOLLOW_UP',
  'SALES_CONNECT_TO_FINANCE',
  'SALES_ESCALATE_TO_MANAGER',
  'SALES_LOST_LEAD',
] as const;

export type SalesIntentValue = (typeof SALES_INTENT_VALUES)[number];

export const SERVICE_INTENT_VALUES = [
  ...SHARED_INTENT_VALUES,
  'SERVICE_SCHEDULE_APPOINTMENT',
  'SERVICE_SEND_ESTIMATE',
  'SERVICE_PARTS_CALLBACK',
  'SERVICE_RECALL_FOLLOW_UP',
  'SERVICE_LOANER_ARRANGEMENT',
  'SERVICE_STATUS_UPDATE',
  'SERVICE_POST_SERVICE_FOLLOW_UP',
  'SERVICE_ESCALATE_TO_ADVISOR',
  'SERVICE_DISCUSS_EXTENDED_WARRANTY',
  'CUSTOM',
] as const;

export type ServiceIntentValue = (typeof SERVICE_INTENT_VALUES)[number];

function titleCaseFromDelimitedIntent(intent: string): string {
  return intent
    .replace(/[_\-\.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeIntentLabel(intent: string): string {
  if (!intent) return '';

  const enumLabel =
    ActionItemIntentTypeLabel[intent as keyof typeof ActionItemIntentTypeLabel];
  if (enumLabel) return enumLabel;

  if (intent.includes('_') || /^[A-Z0-9_]+$/.test(intent)) {
    return titleCaseFromDelimitedIntent(intent);
  }

  return StringUtils.camelCaseToReadable(intent);
}

export function getSalesIntentDropdownOptions(): {
  value: SalesIntentValue;
  label: string;
}[] {
  return SALES_INTENT_VALUES.map((value) => ({
    value,
    label: normalizeIntentLabel(value),
  }));
}

export function getServiceIntentDropdownOptions(): {
  value: ServiceIntentValue;
  label: string;
}[] {
  return SERVICE_INTENT_VALUES.map((value) => ({
    value,
    label: normalizeIntentLabel(value),
  }));
}
