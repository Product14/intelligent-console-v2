import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import {
  type CommunicationPreference,
  type DeleteUserResponse,
  type GetUsersResponse,
  type InviteUserRequest,
  type InviteUserResponse,
  type User,
  defaultCommunicationPreference,
} from './types';

// API Base URLs
const USER_MANAGEMENT_BASE_URL = `${process.env.BACKEND_BASEURL}/user-management/v1`;
const CONSOLE_BASE_URL = `${process.env.BACKEND_BASEURL}/console/v1`;
// Transform API response to User type
const transformApiUserToUser = (apiUser: any): User => {
  return {
    id: apiUser.userId || apiUser.user_id || '',
    name: apiUser.name || apiUser.userName || '',
    designation: apiUser.designation || '',
    department: apiUser.department || '',
    contactNumber: apiUser.contactNo || '',
    isdCode: apiUser.isdCode || '',
    email: apiUser.email || '',
    communicationPreference: apiUser.communicationPreference
      ? transformApiCommunicationPreference(apiUser.communicationPreference)
      : defaultCommunicationPreference,
    role: apiUser.teamRole || 'TEAM_STANDARD',
    status:
      apiUser.active === 'Active'
        ? 'active'
        : apiUser.active === 'Inactive'
          ? 'inactive'
          : 'invite_sent',
  };
};

// Transform API CommunicationPreference to internal format
// API format: { studioAi: { email: ["Daily", "Weekly", "Every two weeks"] }, conversationAi: { email: ["Daily", "Post Call", "Campaign"], sms: ["Post Call"] } }
// Internal format: { studioCommunication: { emailPreferences: { daily, weekly, everyTwoWeeks } }, viniCommunication: { emailPreferences, smsPreferences } }
const transformApiCommunicationPreference = (
  apiPref: any
): CommunicationPreference => {
  // Studio: array of strings like ["Daily", "Weekly", "Every two weeks"]
  const studioEmails: string[] = Array.isArray(apiPref?.studioAi?.email)
    ? apiPref.studioAi.email
    : [];

  // VINI: arrays instead of booleans - if array length > 0, consider as true
  const viniEmailArray: string[] = Array.isArray(apiPref?.conversationAi?.email)
    ? apiPref.conversationAi.email
    : [];
  const viniSmsArray: string[] = Array.isArray(apiPref?.conversationAi?.sms)
    ? apiPref.conversationAi.sms
    : [];
  const viniDepartmentArray: string[] = Array.isArray(
    apiPref?.conversationAi?.department
  )
    ? apiPref.conversationAi.department
    : [];

  return {
    studioCommunication: {
      emailPreferences: {
        daily: studioEmails.includes('Daily'),
        weekly: studioEmails.includes('Weekly'),
        everyTwoWeeks: studioEmails.includes('Every two weeks'),
      },
    },
    viniCommunication: {
      emailPreferences: viniEmailArray.length > 0,
      smsPreferences: viniSmsArray.length > 0,
      department: viniDepartmentArray,
    },
  };
};

// Transform internal CommunicationPreference to API format for sending
// Internal format: { studioCommunication: { emailPreferences: { daily, weekly, everyTwoWeeks } }, viniCommunication: { emailPreferences, smsPreferences } }
// API format: { studioAi: { email: ["Daily", "Weekly", "Every two weeks"] }, conversationAi: { email: ["Daily", "Post Call", "Campaign"], sms: ["Post Call"] } }
const transformCommunicationPreferenceToApi = (
  pref: CommunicationPreference
) => {
  // Studio: build array of strings directly from checkboxes
  const studioEmails: string[] = [];
  if (pref.studioCommunication?.emailPreferences?.daily)
    studioEmails.push('Daily');
  if (pref.studioCommunication?.emailPreferences?.weekly)
    studioEmails.push('Weekly');
  if (pref.studioCommunication?.emailPreferences?.everyTwoWeeks)
    studioEmails.push('Every two weeks');

  // VINI: send arrays instead of booleans
  // email: if true, send ["Daily", "Post Call", "Campaign"], else []
  const viniEmail: string[] = pref.viniCommunication?.emailPreferences
    ? ['Daily', 'Post Call', 'Campaign']
    : [];

  // sms: if true, send ["Post Call"], else []
  const viniSms: string[] = pref.viniCommunication?.smsPreferences
    ? ['Post Call']
    : [];

  // department: send array of selected departments
  const viniDepartment: string[] = pref.viniCommunication?.department ?? [];

  return {
    studioAi: { email: studioEmails },
    conversationAi: {
      email: viniEmail,
      sms: viniSms,
      department: viniDepartment,
    },
  };
};

export interface GetUsersParams {
  teamId: string;
  enterpriseId: string;
}

export interface InviteUserParams {
  enterpriseId: string;
  teamId: string;
  teamName: string;
}

export interface UpdateUserParams {
  userId: string;
  enterpriseId: string;
  teamId: string;
}

export interface DeleteUserParams {
  userId: string;
  teamId: string;
}

export interface ActivateDeactivateUserParams {
  userId: string;
  teamId: string;
  isActive: boolean;
}

// Get all users for a team
export const getUsers = async (
  params: GetUsersParams
): Promise<GetUsersResponse> => {
  try {
    const resp = await CentralAPIHandler.handleGetRequest(
      `${USER_MANAGEMENT_BASE_URL}/team/get-team-users-details`,
      { teamId: params.teamId, enterpriseId: params.enterpriseId }
    );

    // Transform API response to User array
    const users: User[] = (resp?.data || resp?.users || []).map(
      transformApiUserToUser
    );

    return {
      success: true,
      data: users,
      total: users.length,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Invite a new user
export const inviteUser = async (
  userData: InviteUserRequest,
  params: InviteUserParams
): Promise<InviteUserResponse> => {
  try {
    const payload = {
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      teamName: params.teamName,
      userList: [
        {
          email: userData.email,
          roleName: userData.role,
          registered: false,
          teamRole: userData.role,
          designation: userData.designation || '',
          department: '',
          communicationPreference: transformCommunicationPreferenceToApi(
            userData.communicationPreference
          ),
          isdCode: userData?.isdCode || '',
          contactNo: userData?.contactNumber,
          userName: userData?.name,
        },
      ],
    };

    const data = await CentralAPIHandler.handlePostRequest(
      `${CONSOLE_BASE_URL}/user/send-invite-links`,
      payload
    );

    // Create a user object from the response
    const newUser: User = {
      id: data.data?.userId || data.data?.user_id || String(Date.now()),
      name: userData.name,
      designation: userData.designation,
      department: '',
      contactNumber: userData.contactNumber,
      isdCode: userData.isdCode,
      email: userData.email,
      communicationPreference: userData.communicationPreference,
      role: userData.role,
      status: 'invite_sent',
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      message: data.message || 'User invited successfully',
      data: newUser,
    };
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (
  userData: Partial<InviteUserRequest>,
  params: UpdateUserParams
): Promise<InviteUserResponse> => {
  try {
    // Build payload matching the API contract:
    // POST /console/v1/product-onboarding/update-team-user-details
    const payload: Record<string, unknown> = {
      enterpriseId: params.enterpriseId,
      teamId: params.teamId,
      email: userData.email,
      userId: params.userId,
    };

    // Add optional fields only if provided
    if (userData.name) {
      payload.userName = userData.name;
    }
    if (userData.role) {
      payload.teamRole = userData.role;
    }
    if (userData.designation) {
      payload.designation = userData.designation;
    }
    if (userData.isdCode) {
      payload.isdCode = userData.isdCode;
    }
    if (userData.contactNumber) {
      payload.contactNo = userData.contactNumber;
    }
    if (userData.communicationPreference) {
      payload.communicationPreference = transformCommunicationPreferenceToApi(
        userData.communicationPreference
      );
    }

    const data = await CentralAPIHandler.handlePutRequest(
      `${CONSOLE_BASE_URL}/product-onboarding/update-team-user-details`,
      payload
    );

    const communicationPreference: CommunicationPreference =
      userData.communicationPreference
        ? {
            studioCommunication: {
              ...defaultCommunicationPreference.studioCommunication,
              ...userData.communicationPreference.studioCommunication,
            },
            viniCommunication: {
              ...defaultCommunicationPreference.viniCommunication,
              ...userData.communicationPreference.viniCommunication,
              department:
                userData.communicationPreference.viniCommunication
                  ?.department ?? [],
            },
          }
        : defaultCommunicationPreference;

    const updatedUser: User = {
      id: params.userId,
      name: userData.name || '',
      designation: userData.designation || '',
      department: '',
      contactNumber: userData.contactNumber || '',
      isdCode: userData.isdCode || '',
      email: userData.email || '',
      communicationPreference,
      role: userData.role || 'TEAM_STANDARD',
      status: 'active',
    };

    return {
      success: true,
      message: data.message || 'User updated successfully',
      data: updatedUser,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (
  params: DeleteUserParams
): Promise<DeleteUserResponse> => {
  try {
    const data = await CentralAPIHandler.handleDeleteRequest(
      `${USER_MANAGEMENT_BASE_URL}/team/remove-user`,
      { user_id: params.userId, team_id: params.teamId }
    );

    return {
      success: true,
      message: data.message || 'User deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Activate or deactivate a user
export const activateDeactivateUser = async (
  params: ActivateDeactivateUserParams
): Promise<DeleteUserResponse> => {
  try {
    const queryParams = new URLSearchParams({
      teamId: params.teamId,
      userId: params.userId,
      isActive: String(params.isActive),
    }).toString();

    const data = await CentralAPIHandler.handlePutRequest(
      `${CONSOLE_BASE_URL}/product-onboarding/team/activate-deactivate-team-user?${queryParams}`,
      null
    );

    return {
      success: true,
      message:
        data.message ||
        (params.isActive
          ? 'User activated successfully'
          : 'User deactivated successfully'),
    };
  } catch (error) {
    console.error('Error activating/deactivating user:', error);
    throw error;
  }
};
