// Type definitions for Invite User feature

export type UserRole =
  | 'TEAM_ADMIN'
  | 'TEAM_OWNER'
  | 'ENTERPRISE_OWNER'
  | 'TEAM_STANDARD';
export type UserStatus = 'active' | 'invite_sent' | 'inactive';

// Studio Communication - Email Preferences
export interface StudioEmailPreferences {
  daily: boolean; // Receive daily summary emails
  weekly: boolean; // Receive emails after calls
  everyTwoWeeks: boolean; // Receive campaign related emails
}

export interface StudioCommunication {
  emailPreferences: StudioEmailPreferences;
}

// Vini Communication - SMS Preferences
export interface ViniSmsPreferences {
  enabled: boolean;
  postCall: boolean; // Receive SMS after calls
}

export interface ViniCommunication {
  emailPreferences: boolean;
  smsPreferences: boolean;
  department: string[];
}

// Combined Communication Preferences
export interface CommunicationPreference {
  studioCommunication: StudioCommunication;
  viniCommunication: ViniCommunication;
}

// Default communication preference values
export const defaultCommunicationPreference: CommunicationPreference = {
  studioCommunication: {
    emailPreferences: {
      daily: false,
      weekly: false,
      everyTwoWeeks: false,
    },
  },
  viniCommunication: {
    emailPreferences: false,
    smsPreferences: false,
    department: [],
  },
};

export interface User {
  id: string;
  name: string;
  designation: string;
  department?: string;
  contactNumber: string;
  isdCode: string;
  email: string;
  communicationPreference: CommunicationPreference;
  role: UserRole;
  status: UserStatus;
  // createdAt: string;
  // updatedAt: string;
}

export interface InviteUserRequest {
  name: string;
  designation: string;
  contactNumber: string;
  isdCode: string;
  email: string;
  communicationPreference: CommunicationPreference;
  role: UserRole;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  total: number;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
