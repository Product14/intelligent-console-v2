import { createContext, useContext } from 'react';

import type { InviteUserRequest, User } from './types';

export interface InviteUserContextType {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;

  // Modal states
  showAddUserModal: boolean;
  showEditUserModal: boolean;
  showDeleteUserModal: boolean;
  showDeactivateUserModal: boolean;
  showReactivateUserModal: boolean;

  // Actions
  fetchUsers: () => Promise<void>;
  inviteUser: (userData: InviteUserRequest) => Promise<void>;
  editUser: (
    userId: string,
    userData: Partial<InviteUserRequest>
  ) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;

  // Modal handlers
  openAddUserModal: () => void;
  closeAddUserModal: () => void;
  openEditUserModal: (user: User) => void;
  closeEditUserModal: () => void;
  openDeleteUserModal: (user: User) => void;
  closeDeleteUserModal: () => void;
  openDeactivateUserModal: (user: User) => void;
  closeDeactivateUserModal: () => void;
  openReactivateUserModal: (user: User) => void;
  closeReactivateUserModal: () => void;

  // Setters
  setSelectedUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export const InviteUserContext = createContext<InviteUserContextType | null>(
  null
);

export const useInviteUser = (): InviteUserContextType => {
  const context = useContext(InviteUserContext);
  if (!context) {
    throw new Error('useInviteUser must be used within an InviteUserProvider');
  }
  return context;
};
