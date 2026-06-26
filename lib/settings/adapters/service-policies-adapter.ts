// Adapter seam between the persisted ServicePolicies wire shape and the form
// shape. No-op today (form shape == wire shape) — mirrors the
// sales-policies-adapter pattern.

import type { ServicePolicies } from '@/types/settings/service-policies';

export function mapApiResponseToServicePolicies(raw: unknown): ServicePolicies {
  if (!raw || typeof raw !== 'object') return {};
  return raw as ServicePolicies;
}

export function mapServicePoliciesToApi(form: ServicePolicies): ServicePolicies {
  return form;
}
