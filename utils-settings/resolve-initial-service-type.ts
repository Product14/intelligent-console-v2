/** When landing without `serviceType`, this enterprise + team default to Service. */
const DEFAULT_SERVICE_ENTERPRISE_ID = '7d06f7427';
const DEFAULT_SERVICE_TEAM_ID = '9923577d07';

/**
 * Resolves initial `serviceType` from the URL query string.
 * Explicit `serviceType=sales` or `serviceType=service` always wins.
 * If `serviceType` is missing or any other value, uses Service only for the
 * configured `enterprise_id` + `team_id` pair; otherwise Sales.
 */
export function resolveInitialServiceType(search: string): 'sales' | 'service' {
  const params = new URLSearchParams(search);
  const urlServiceType = params.get('serviceType');
  if (urlServiceType === 'service') return 'service';
  if (urlServiceType === 'sales') return 'sales';

  const enterpriseId = params.get('enterprise_id') ?? '';
  const teamId = params.get('team_id') ?? '';
  if (
    enterpriseId === DEFAULT_SERVICE_ENTERPRISE_ID &&
    teamId === DEFAULT_SERVICE_TEAM_ID
  ) {
    return 'service';
  }
  return 'sales';
}

/**
 * Call Logs uses `tab=sales|service|receptionist`. That wins when present; otherwise same
 * rules as {@link resolveInitialServiceType} (`serviceType` + enterprise/team default).
 */
export function resolveCallLogsInitialTab(
  search: string
): 'sales' | 'service' | 'receptionist' {
  const params = new URLSearchParams(search);
  const tab = params.get('tab');
  if (tab === 'sales' || tab === 'service' || tab === 'receptionist')
    return tab;
  return resolveInitialServiceType(search);
}
