export type DashboardRole = 'admin' | 'manager' | 'agent' | 'viewer';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface AvailabilitySchedule {
  workingDays: WeekDay[];
  workingHours: { start: string; end: string };
  exceptions: string;
  useDepartmentDefaults: boolean;
}

export const EMPTY_AVAILABILITY: AvailabilitySchedule = {
  workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  workingHours: { start: '09:00', end: '18:00' },
  exceptions: '',
  useDepartmentDefaults: true,
};

export const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export interface EmailCommunicationPreferences {
  enabled: boolean;
  callSummaries: boolean;
  missedCalls: boolean;
  dailyDigest: boolean;
}

export interface CommunicationPreferences {
  email: EmailCommunicationPreferences;
}

export const EMPTY_EMAIL_COMMUNICATION_PREFERENCES: EmailCommunicationPreferences = {
  enabled: false,
  callSummaries: false,
  missedCalls: false,
  dailyDigest: false,
};

export const EMPTY_COMMUNICATION_PREFERENCES: CommunicationPreferences = {
  email: EMPTY_EMAIL_COMMUNICATION_PREFERENCES,
};

export interface RoutingDirectoryEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  designation: string;
  dashboardRole: DashboardRole | null;
  canAccessDashboard: boolean;
  callTransferEligible: boolean;
  department: string;
  departmentId: string;
  phone: string;
  extension?: string;
  status: 'active' | 'inactive';
  communicationPreferences: CommunicationPreferences;
  availability: AvailabilitySchedule;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  designation: string;
  dashboardRole: DashboardRole | '';
  canAccessDashboard: boolean;
  callTransferEligible: boolean;
  department: string;
  isdCode: string;
  phoneNumber: string;
  extension: string;
  email: string;
  availability: AvailabilitySchedule;
  communicationPreferences: CommunicationPreferences;
}

export interface CreateDirectoryUserPayload {
  firstName: string;
  lastName: string;
  designation: string;
  dashboardRole: DashboardRole | null;
  canAccessDashboard: boolean;
  callTransferEligible: boolean;
  departmentId: string;
  isdCode: string;
  phoneNumber: string;
  extension?: string;
  email?: string;
  availability?: AvailabilitySchedule;
}

export interface CreateDirectoryPayload {
  enterpriseId: string;
  teamId: string;
  teamName: string;
  users: CreateDirectoryUserPayload[];
}

export type EmployeeCapabilityFilter = 'all' | 'dashboardUsers' | 'callTransfers';

export interface DirectoryPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DirectoryApiContact {
  id: number;
  enterprise_id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  designation: string;
  dashboard_role?: DashboardRole | null;
  can_access_dashboard?: 0 | 1 | boolean;
  call_transfer_eligible?: 0 | 1 | boolean;
  phone: string;
  extension: string | null;
  is_active: 0 | 1;
  department_id: number;
  department_name: string;
  department_phone: string;
  communication_preferences?: CommunicationPreferences;
  availability?: AvailabilitySchedule;
}

export interface DirectoryApiResponse {
  count: number;
  contacts: DirectoryApiContact[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DirectoryDepartment {
  id: number;
  department: string;
  phone: string;
  is_active: boolean;
  working_days?: WeekDay[];
  working_hours?: { start: string; end: string };
}

export interface DirectoryDepartmentRecord {
  id: string;
  name: string;
  workingDays?: WeekDay[];
  workingHours?: { start: string; end: string };
}

export interface DirectoryDepartmentApiResponse {
  count: number;
  departments: DirectoryDepartment[];
}

export interface GetDirectoryResponse {
  employees: RoutingDirectoryEmployee[];
  pagination: DirectoryPagination;
}

export const EMPTY_EMPLOYEE_FORM: EmployeeFormData = {
  firstName: '',
  lastName: '',
  designation: '',
  dashboardRole: '',
  canAccessDashboard: false,
  callTransferEligible: false,
  department: '',
  isdCode: '',
  phoneNumber: '',
  extension: '',
  email: '',
  availability: EMPTY_AVAILABILITY,
  communicationPreferences: EMPTY_COMMUNICATION_PREFERENCES,
};

export const DESIGNATION_OPTIONS = [
  { label: 'Sales Consultant', value: 'Sales Consultant' },
  { label: 'Sales Manager', value: 'Sales Manager' },
  { label: 'Sales Representative', value: 'Sales Representative' },
  { label: 'Finance Manager', value: 'Finance Manager' },
  { label: 'Service Advisor', value: 'Service Advisor' },
  { label: 'Service Manager', value: 'Service Manager' },
  { label: 'Parts Manager', value: 'Parts Manager' },
  { label: 'BDC Agent', value: 'BDC Agent' },
  { label: 'General Manager', value: 'General Manager' },
  { label: 'Receptionist', value: 'Receptionist' },
  { label: 'Other', value: 'Other' },
];

export const DASHBOARD_ROLE_OPTIONS: { label: string; value: DashboardRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Agent', value: 'agent' },
  { label: 'Viewer', value: 'viewer' },
];

export const DEPARTMENT_OPTIONS = [
  { label: 'Sales', value: 'Sales' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Service', value: 'Service' },
  { label: 'Parts', value: 'Parts' },
  { label: 'BDC', value: 'BDC' },
  { label: 'Administration', value: 'Administration' },
  { label: 'Management', value: 'Management' },
];
