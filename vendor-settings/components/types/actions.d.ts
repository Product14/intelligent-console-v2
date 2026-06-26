declare module '@spyne-console/actions' {
  const actions: any;
  export default actions;
}

declare module '@spyne-console/actions/auth' {
  const authActions: any;
  export default authActions;
}

declare module '@spyne-console/actions/user' {
  const userActions: any;
  export default userActions;
}

declare module '@spyne-console/actions/app' {
  const appActions: any;
  export default appActions;
}

declare module '@spyne-console/actions/analytics' {
  const analyticsActions: any;
  export default analyticsActions;
}

declare module '@spyne-console/actions/notifications' {
  const notificationsActions: any;
  export default notificationsActions;
}

declare module '@spyne-console/actions/billing-payments/rooftops' {
  export const fetchTeamAssociatedWithEnterprise: (params: any) => Promise<any>;
  export const fetchRooftopUsageDetails: (params: any) => Promise<any>;
}

declare module '@spyne-console/actions/billing-payments/monthly-usage-team-agents' {
  export const fetchTeamMonthlyUsageSummary: (params: any) => Promise<any>;
  export const fetchTeamMonthlyUsageAgentTypes: (params: any) => Promise<any>;
}

declare module '@spyne-console/actions/billing-payments/get-unit-count' {
  export const fetchUnitCount: (params: any) => Promise<any>;
}

declare module '@spyne-console/actions/billing-payments/team-level-products' {
  export const fetchTeamLevelProducts: (params: any) => Promise<any>;
}
