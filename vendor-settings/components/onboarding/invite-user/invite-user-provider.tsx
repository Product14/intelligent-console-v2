import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import * as api from './api-handlers';
import {
  InviteUserContext,
  InviteUserContextType,
} from './invite-user-context';
import type { InviteUserRequest, User } from './types';

export interface InviteUserProviderProps {
  children: React.ReactNode;
  enterpriseId: string;
  teamId: string;
  teamName: string;
}

export const InviteUserProvider: React.FC<InviteUserProviderProps> = ({
  children,
  enterpriseId,
  teamId,
  teamName,
}) => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showDeactivateUserModal, setShowDeactivateUserModal] = useState(false);
  const [showReactivateUserModal, setShowReactivateUserModal] = useState(false);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!teamId || !enterpriseId) {
      setError('Team ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.getUsers({ teamId, enterpriseId });
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Invite a new user
  const inviteUser = useCallback(
    async (userData: InviteUserRequest) => {
      if (!enterpriseId || !teamId || !teamName) {
        throw new Error('Enterprise ID, Team ID, and Team Name are required');
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.inviteUser(userData, {
          enterpriseId,
          teamId,
          teamName,
        });
        if (response.success) {
          // Refresh users list
          await fetchUsers();
          // Close both modals - inviteUser can be called from add modal or edit modal (for re-inviting)
          setShowAddUserModal(false);
          setShowEditUserModal(false);
          setSelectedUser(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to invite user';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error inviting user:', err);
      } finally {
        setLoading(false);
      }
    },
    [enterpriseId, teamId, teamName, fetchUsers]
  );

  // Edit an existing user
  const editUser = useCallback(
    async (userId: string, userData: Partial<InviteUserRequest>) => {
      if (!enterpriseId || !teamId) {
        throw new Error('Enterprise ID and Team ID are required');
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.updateUser(userData, {
          userId,
          enterpriseId,
          teamId,
        });
        if (response.success) {
          // Refresh users list
          await fetchUsers();
          // Close modal and clear selection on success
          setShowEditUserModal(false);
          setSelectedUser(null);
          toast.success('User updated successfully');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update user';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error updating user:', err);
        // Don't re-throw - let the modal stay open so user can retry
      } finally {
        setLoading(false);
      }
    },
    [enterpriseId, teamId, fetchUsers]
  );

  // Remove a user
  const removeUser = useCallback(
    async (userId: string) => {
      if (!teamId) {
        throw new Error('Team ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.deleteUser({
          userId,
          teamId,
        });
        if (response.success) {
          // Refresh users list
          await fetchUsers();
          setShowDeleteUserModal(false);
          setSelectedUser(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete user';
        setError(errorMessage);
        console.error('Error deleting user:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [teamId, fetchUsers]
  );

  // Deactivate a user
  const deactivateUser = useCallback(
    async (userId: string) => {
      if (!teamId) {
        throw new Error('Team ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.activateDeactivateUser({
          userId,
          teamId,
          isActive: false,
        });
        if (response.success) {
          await fetchUsers();
          setShowDeactivateUserModal(false);
          setSelectedUser(null);
          toast.success('User deactivated successfully');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to deactivate user';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error deactivating user:', err);
      } finally {
        setLoading(false);
      }
    },
    [teamId, fetchUsers]
  );

  // Activate a user
  const activateUser = useCallback(
    async (userId: string) => {
      if (!teamId) {
        throw new Error('Team ID is required');
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.activateDeactivateUser({
          userId,
          teamId,
          isActive: true,
        });
        if (response.success) {
          await fetchUsers();
          setShowReactivateUserModal(false);
          setSelectedUser(null);
          toast.success('User activated successfully');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to activate user';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error activating user:', err);
      } finally {
        setLoading(false);
      }
    },
    [teamId, fetchUsers]
  );

  // Modal handlers
  const openAddUserModal = useCallback(() => {
    setShowAddUserModal(true);
  }, []);

  const closeAddUserModal = useCallback(() => {
    setShowAddUserModal(false);
    setError(null);
  }, []);

  const openEditUserModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  }, []);

  const closeEditUserModal = useCallback(() => {
    setShowEditUserModal(false);
    setSelectedUser(null);
    setError(null);
  }, []);

  const openDeleteUserModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  }, []);

  const closeDeleteUserModal = useCallback(() => {
    setShowDeleteUserModal(false);
    setSelectedUser(null);
    setError(null);
  }, []);

  const openDeactivateUserModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeactivateUserModal(true);
  }, []);

  const closeDeactivateUserModal = useCallback(() => {
    setShowDeactivateUserModal(false);
    setSelectedUser(null);
    setError(null);
  }, []);

  const openReactivateUserModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowReactivateUserModal(true);
  }, []);

  const closeReactivateUserModal = useCallback(() => {
    setShowReactivateUserModal(false);
    setSelectedUser(null);
    setError(null);
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (teamId) {
      fetchUsers();
    }
  }, [teamId, fetchUsers]);

  // If teamId never resolves within 1.5s, stop the loader and surface an error
  useEffect(() => {
    if (teamId) return;
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Unable to load team. Please refresh and try again.');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [teamId]);

  // Context value
  const contextValue: InviteUserContextType = useMemo(
    () => ({
      // State
      users,
      loading,
      error,
      selectedUser,

      // Modal states
      showAddUserModal,
      showEditUserModal,
      showDeleteUserModal,
      showDeactivateUserModal,
      showReactivateUserModal,

      // Actions
      fetchUsers,
      inviteUser,
      editUser,
      removeUser,
      deactivateUser,
      activateUser,

      // Modal handlers
      openAddUserModal,
      closeAddUserModal,
      openEditUserModal,
      closeEditUserModal,
      openDeleteUserModal,
      closeDeleteUserModal,
      openDeactivateUserModal,
      closeDeactivateUserModal,
      openReactivateUserModal,
      closeReactivateUserModal,

      // Setters
      setSelectedUser,
      setError,
    }),
    [
      users,
      loading,
      error,
      selectedUser,
      showAddUserModal,
      showEditUserModal,
      showDeleteUserModal,
      showDeactivateUserModal,
      showReactivateUserModal,
      fetchUsers,
      inviteUser,
      editUser,
      removeUser,
      deactivateUser,
      activateUser,
      openAddUserModal,
      closeAddUserModal,
      openEditUserModal,
      closeEditUserModal,
      openDeleteUserModal,
      closeDeleteUserModal,
      openDeactivateUserModal,
      closeDeactivateUserModal,
      openReactivateUserModal,
      closeReactivateUserModal,
    ]
  );

  return (
    <InviteUserContext.Provider value={contextValue}>
      {children}
    </InviteUserContext.Provider>
  );
};

export default InviteUserProvider;
