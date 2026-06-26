export interface RootState {
  authReducer: any;
  enterpriseTeamReducer: any;
  virttualStudioReducer: any;
  credit: any;
  virtialStudio360Reducer: any;
  inventoryReducer: any;
  staticDataReducer: any;
  crmDashboard: any;
  global: any;
  enterprise: any;
  pipeline: any;
  sidebar: any;
}

export interface Team {
  team_id: string;
  team_name: string;
  [key: string]: any;
}
