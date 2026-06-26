import {
  CommunicationPreferences,
  CreateDirectoryUserPayload,
  DirectoryApiResponse,
  DirectoryDepartmentApiResponse,
  DirectoryDepartmentRecord,
  EmployeeFormData,
  GetDirectoryResponse,
  RoutingDirectoryEmployee,
} from '@/app-models-settings/routing-directory/routing-directory.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import { StringUtils } from '@/utils-settings/StringUtils';

const USER_MGMT_DIRECTORY_BASE_URL = `${process.env.APP_BACKEND_BASEURL}/user-management/v1/directory`;
const DIRECTORY_URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/product-onboarding/vini/directory`;

export interface BulkUploadApiError {
  error: true;
  message: string;
  errorFileUrl?: string;
  errorFileKey?: string;
}

export const getDirectoryEmployeesAPI = async (
  enterpriseId: string,
  teamId: string,
  params?: {
    keyword?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }
): Promise<GetDirectoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.keyword?.trim())
    queryParams.set('keyword', params.keyword.trim());
  if (typeof params?.active === 'boolean') {
    queryParams.set('active', String(params.active));
  }
  queryParams.set('page', String(params?.page ?? 1));
  queryParams.set('limit', String(params?.limit ?? 10));

  const url = `${USER_MGMT_DIRECTORY_BASE_URL}/enterprise/${enterpriseId}/team/${teamId}/get-directory?${queryParams.toString()}`;
  const response = await CentralAPIHandler.handleGetRequest(url);
  const apiData: DirectoryApiResponse = response.data;

  const employees: RoutingDirectoryEmployee[] = (apiData.contacts ?? []).map(
    (contact) => ({
      id: String(contact.id),
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      designation: StringUtils.toCapitalize(contact.designation),
      dashboardRole: contact.dashboard_role ?? null,
      canAccessDashboard:
        contact.can_access_dashboard === true ||
        contact.can_access_dashboard === 1,
      callTransferEligible:
        contact.call_transfer_eligible === true ||
        contact.call_transfer_eligible === 1,
      department: StringUtils.toCapitalize(contact.department_name),
      departmentId: String(contact.department_id),
      phone: contact.phone,
      extension: contact.extension ?? undefined,
      status: contact.is_active === 1 ? 'active' : 'inactive',
      communicationPreferences:
        contact.communication_preferences ?? {
          email: {
            enabled: false,
            callSummaries: false,
            missedCalls: false,
            dailyDigest: false,
          },
        },
      availability:
        contact.availability ?? {
          workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          workingHours: { start: '09:00', end: '18:00' },
          exceptions: '',
        },
    })
  );

  return {
    employees,
    pagination: {
      page: Math.max(apiData.page ?? 1, 1),
      pageSize: Math.max(apiData.limit ?? 10, 1),
      totalCount: apiData.total ?? 0,
      totalPages: Math.max(apiData.totalPages ?? 1, 1),
      hasNext: apiData.hasNext,
      hasPrev: apiData.hasPrev,
    },
  };
};

export const createEmployeesAPI = async (
  enterpriseId: string,
  teamId: string,
  teamName: string,
  employees: EmployeeFormData[],
  departments: Array<{ id: string; name: string }>
): Promise<void> => {
  const users: CreateDirectoryUserPayload[] = employees.map((emp) => {
    const resolvedDepartmentId =
      departments.find((department) => department.name === emp.department)
        ?.id ?? emp.department;
    const user: CreateDirectoryUserPayload = {
      firstName: emp.firstName,
      lastName: emp.lastName,
      designation: emp.designation,
      dashboardRole: emp.canAccessDashboard ? (emp.dashboardRole || null) : null,
      canAccessDashboard: emp.canAccessDashboard,
      callTransferEligible: emp.callTransferEligible,
      departmentId: resolvedDepartmentId,
      isdCode: emp.isdCode,
      phoneNumber: emp.phoneNumber,
    };
    if (emp.extension) user.extension = emp.extension;
    if (emp.email) user.email = emp.email;
    if (emp.callTransferEligible) user.availability = emp.availability;
    return user;
  });

  await CentralAPIHandler.handlePostRequest(`${DIRECTORY_URL}/manual`, {
    enterpriseId,
    teamId,
    teamName,
    users,
  });
};

export const getDepartmentsAPI = async (
  enterpriseId: string,
  teamId: string
): Promise<DirectoryDepartmentRecord[]> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/user-management/v1/department/enterprise/${enterpriseId}/team/${teamId}`;
  const response = await CentralAPIHandler.handleGetRequest(url);
  const apiData: DirectoryDepartmentApiResponse = response.data;
  return (apiData.departments ?? []).map((department) => ({
    id: String(department.id),
    name: StringUtils.toCapitalize(department.department),
    workingDays: department.working_days,
    workingHours: department.working_hours,
  }));
};

export const updateEmployeeAPI = async (
  enterpriseId: string,
  teamId: string,
  contactId: string,
  employee: EmployeeFormData,
  departmentId: string
): Promise<void> => {
  const url = `${DIRECTORY_URL}/enterprise/${enterpriseId}/team/${teamId}/contact/${contactId}`;
  const payload: Record<string, unknown> = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    designation: employee.designation,
    dashboardRole: employee.canAccessDashboard
      ? employee.dashboardRole || null
      : null,
    canAccessDashboard: employee.canAccessDashboard,
    callTransferEligible: employee.callTransferEligible,
    departmentId,
    isdCode: employee.isdCode,
    phone: employee.phoneNumber,
  };
  if (employee.extension) payload.extension = employee.extension;
  if (employee.email.trim()) payload.email = employee.email;
  if (employee.callTransferEligible) payload.availability = employee.availability;
  await CentralAPIHandler.handlePatchRequest(url, {}, {}, undefined, payload);
};

export const updateCommunicationPreferencesAPI = async (
  enterpriseId: string,
  teamId: string,
  contactId: string,
  preferences: CommunicationPreferences
): Promise<void> => {
  const url = `${DIRECTORY_URL}/enterprise/${enterpriseId}/team/${teamId}/contact/${contactId}/communication-preferences`;
  await CentralAPIHandler.handlePatchRequest(url, {}, {}, undefined, {
    communicationPreferences: preferences,
  });
};

export const toggleEmployeeStatusAPI = async (
  enterpriseId: string,
  teamId: string,
  contactId: string
): Promise<void> => {
  const url = `${DIRECTORY_URL}/enterprise/${enterpriseId}/team/${teamId}/contact/${contactId}/status-toggle`;
  await CentralAPIHandler.handlePatchRequest(url);
};

export const bulkUploadEmployeesAPI = async (
  file: File,
  enterpriseId: string,
  teamId: string,
  teamName: string
): Promise<void> => {
  const url = `${DIRECTORY_URL}/file`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('enterpriseId', enterpriseId);
  formData.append('teamId', teamId);
  formData.append('teamName', teamName);
  try {
    await CentralAPIHandler.handlePostRequest(url, formData);
  } catch (error: any) {
    const responseData = error?.response?.data ?? error?.data ?? {};
    if (responseData?.error) {
      const uploadError: BulkUploadApiError = {
        error: true,
        message: responseData?.message ?? 'Upload failed',
        errorFileUrl: responseData?.errorFileUrl,
        errorFileKey: responseData?.errorFileKey,
      };
      throw uploadError;
    }
    throw error;
  }
};

export const getDirectoryTemplateFileUrlAPI = async (): Promise<string> => {
  const url = `${DIRECTORY_URL}/template-file-url`;
  const response = await CentralAPIHandler.handleGetRequest(url);
  return response?.data?.usersDirectoryTemplateFileUrl ?? '';
};
