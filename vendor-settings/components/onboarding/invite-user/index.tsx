/**
 * Invite User Step
 * Requirements: Create a table with invited and current users data
 * - Fetch from API -> fetch all users with their associated data
 * - Handle edit and delete actions with modals
 * - Add user button to add new user
 */
import { Button } from '@spyne-console/design-system';

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CiMail, CiSearch } from 'react-icons/ci';
import { FaPlus } from 'react-icons/fa6';
import { FiCheckCircle, FiUserPlus } from 'react-icons/fi';
import {
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';
import { IoCallOutline, IoInformationCircleOutline } from 'react-icons/io5';

import InputField from '@spyne-console/design-system/input-field';
import ModalWrapper from '@spyne-console/design-system/modal/modal-wrapper';
import OptionsPopup from '@spyne-console/design-system/options-popup';
import Spinner from '@spyne-console/design-system/spinner';
import Svg from '@spyne-console/design-system/svg';

import { useInviteUser } from './invite-user-context';
import InviteUserModal from './invite-user-modal';
import { InviteUserProvider } from './invite-user-provider';
import DeleteUserModal from './modals/delete-user-modal';
import type {
  CommunicationPreference,
  InviteUserRequest,
  User,
  UserStatus,
} from './types';

// Preference Label with Tooltip Component
interface PreferenceLabelProps {
  label: string;
  preferences: string[];
  tooltipTitle: string;
}

interface TooltipPosition {
  top: number;
  left: number;
}

const PreferenceLabel = ({
  label,
  preferences,
  tooltipTitle,
}: PreferenceLabelProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <span className="text-sm font-medium text-black/70">{label}</span>
      <div
        ref={iconRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <IoInformationCircleOutline className="cursor-pointer text-base text-black/40" />
        {showTooltip &&
          createPortal(
            <div
              className="fixed z-[9999]"
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                transform: 'translate(-50%, -100%)',
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="min-w-[180px] rounded-lg bg-[#1E1E1E] px-4 py-3 text-white shadow-lg">
                <p className="mb-2 text-xs font-medium text-white/80">
                  {tooltipTitle}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preferences.map((pref) => (
                    <span
                      key={pref}
                      className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#1E1E1E]"></div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
};

// Helper to get checked Studio email preferences
const getStudioEmailPreferences = (
  communicationPreference: CommunicationPreference
): string[] => {
  const prefs: string[] = [];
  const emailPrefs =
    communicationPreference?.studioCommunication?.emailPreferences;
  if (emailPrefs?.daily) prefs.push('Daily');
  if (emailPrefs?.weekly) prefs.push('Weekly');
  if (emailPrefs?.everyTwoWeeks) prefs.push('Every two weeks');
  return prefs;
};

// Helper to get checked VINI email preferences
const getViniEmailPreferences = (
  communicationPreference: CommunicationPreference
): boolean => {
  return communicationPreference?.viniCommunication?.emailPreferences;
};

// Helper to get checked VINI SMS preferences
const getViniSmsPreferences = (
  communicationPreference: CommunicationPreference
): boolean => {
  return communicationPreference?.viniCommunication?.smsPreferences;
};

// Communication Preference Cell Component
const CommunicationPreferenceCell = ({
  communicationPreference,
}: {
  communicationPreference: CommunicationPreference;
}) => {
  const studioEmailPrefs = getStudioEmailPreferences(communicationPreference);
  const viniEmailPrefs = getViniEmailPreferences(communicationPreference);
  const viniSmsPrefs = getViniSmsPreferences(communicationPreference);

  const hasStudioEmail = studioEmailPrefs.length > 0;
  const hasViniEmail = viniEmailPrefs;
  const hasViniSms = viniSmsPrefs;

  const hasAnyPreference = hasStudioEmail || hasViniEmail || hasViniSms;

  if (!hasAnyPreference) {
    return <span className="text-sm font-medium text-black/40">NA</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="min-w-[45px] text-xs font-medium text-black/50">
          Studio:
        </span>
        {hasStudioEmail ? (
          <PreferenceLabel
            label="Email"
            preferences={studioEmailPrefs}
            tooltipTitle="Email Preferences:"
          />
        ) : (
          <span className="text-sm font-medium text-black/40">NA</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="min-w-[45px] text-xs font-medium text-black/50">
          VINI:
        </span>
        <div className="flex items-center gap-3">
          {hasViniEmail && (
            <PreferenceLabel
              label="Email"
              preferences={
                viniEmailPrefs ? ['Daily', 'Post Call', 'Campaign'] : []
              }
              tooltipTitle="Email Preferences:"
            />
          )}
          {hasViniSms && (
            <PreferenceLabel
              label="SMS"
              preferences={viniSmsPrefs ? ['Post Call'] : []}
              tooltipTitle="SMS Preferences:"
            />
          )}
          {!hasViniEmail && !hasViniSms && (
            <span className="text-sm font-medium text-black/40">NA</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirm Action Modal for Deactivate/Reactivate
interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'danger' | 'success';
}

const ConfirmActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmLabel,
  variant,
}: ConfirmActionModalProps) => {
  const isDanger = variant === 'danger';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[400px]"
      allowClose={!isLoading}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`mx-auto mb-5 flex h-fit w-fit items-center justify-center rounded-full border-8 p-3 ${
            isDanger
              ? 'border-red-50 bg-[#FEE4E2]'
              : 'border-green-50 bg-[#D1FADF]'
          }`}
        >
          {isDanger ? (
            <HiOutlineShieldExclamation className="h-5 w-5 text-red-600" />
          ) : (
            <HiOutlineShieldCheck className="h-5 w-5 text-green-600" />
          )}
        </div>

        {/* Title */}
        <h2 className="mb-3 font-['Inter'] text-xl font-semibold leading-7 text-black/90">
          {title}
        </h2>

        {/* Description */}
        <p className="mb-8 font-['Inter'] text-base font-normal leading-6 text-black/60">
          {description}
        </p>

        {/* Actions */}
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            label="Cancel"
            type="bordered"
            onClick={onClose}
            disabled={isLoading}
            className="h-12 w-full min-w-[140px] rounded-lg"
            icon={undefined}
            iconUrl={undefined}
          />
          <Button
            label={confirmLabel}
            type="primary"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-12 w-full min-w-[140px] rounded-lg ${
              isDanger
                ? '!bg-[#C31812] hover:!bg-red-700'
                : '!bg-[#027A48] hover:!bg-green-700'
            }`}
            icon={undefined}
            iconUrl={undefined}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

// Main content component that uses the context
const InviteUserContent = ({ showDepartment }: { showDepartment: boolean }) => {
  const {
    users,
    loading,
    error,
    selectedUser,
    showAddUserModal,
    showEditUserModal,
    showDeleteUserModal,
    showDeactivateUserModal,
    showReactivateUserModal,
    inviteUser,
    editUser,
    removeUser,
    deactivateUser,
    activateUser,
    openAddUserModal,
    closeAddUserModal,
    closeEditUserModal,
    closeDeleteUserModal,
    openEditUserModal,
    openDeleteUserModal,
    openDeactivateUserModal,
    closeDeactivateUserModal,
    openReactivateUserModal,
    closeReactivateUserModal,
    setError,
  } = useInviteUser();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = user.name?.toLowerCase().includes(query);
    const emailMatch = user.email?.toLowerCase().includes(query);
    const phoneMatch = user.contactNumber?.toLowerCase().includes(query);
    return nameMatch || emailMatch || phoneMatch;
  });

  const getStatusDisplay = (status: UserStatus) => {
    const statusConfig: Record<
      UserStatus,
      { text: string; bgColor: string; textColor: string; border: string }
    > = {
      invite_sent: {
        text: 'Invite Sent',
        bgColor: 'bg-[#FFFAEB]',
        textColor: 'text-[#866800]',
        border: 'border border-[#8668001A]',
      },
      active: {
        text: 'Active User',
        bgColor: 'bg-[#ECFDF3]',
        textColor: 'text-[#027A48]',
        border: 'border border-[#027A481A]',
      },
      inactive: {
        text: 'Deactivated',
        bgColor: 'bg-[#FEF3F2]',
        textColor: 'text-[#B42318]',
        border: 'border border-[#B423181A]',
      },
    };
    return statusConfig[status];
  };

  const getRoleDisplay = (role: string) => {
    const roleConfig: Record<
      string,
      { text: string; bgColor: string; textColor: string; border: string }
    > = {
      TEAM_ADMIN: {
        text: 'Admin',
        bgColor: 'bg-[#F0F9FF]',
        textColor: 'text-[#026AA2]',
        border: 'border border-[#026AA21A]',
      },
      TEAM_STANDARD: {
        text: 'Member',
        bgColor: 'bg-[#F9F5FF]',
        textColor: 'text-[#6941C6]',
        border: 'border border-[#6941C61A]',
      },
      ENTERPRISE_OWNER: {
        text: 'Enterprise Owner',
        bgColor: 'bg-[#F0F9FF]',
        textColor: 'text-[#026AA2]',
        border: 'border border-[#026AA21A]',
      },
    };
    return roleConfig[role] || roleConfig.TEAM_STANDARD;
  };

  // Handle invite new user
  const handleInviteUser = async (userData: InviteUserRequest) => {
    await inviteUser(userData);
  };

  // Handle edit user
  const handleEditUser = async (
    userId: string,
    userData: Partial<InviteUserRequest>
  ) => {
    await editUser(userId, userData);
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    await removeUser(userId);
  };

  // Get menu options for OptionsPopup
  const getMenuOptions = (user: User) => {
    const options: {
      label: string;
      icon: string | React.ReactNode;
      onClick: () => void;
    }[] = [
      {
        label: 'Edit',
        icon: 'editPencilIcon',
        onClick: () => openEditUserModal(user),
      },
    ];

    // Deactivate only for active users with MEMBER role
    if (user.status === 'active' && user.role === 'TEAM_STANDARD') {
      options.push({
        label: 'Deactivate',
        icon: 'binIcon',
        onClick: () => openDeactivateUserModal(user),
      });
    }

    // Reactivate only for inactive users
    if (user.status === 'inactive') {
      options.push({
        label: 'Reactivate',
        icon: <FiCheckCircle className="h-4 w-4 text-black/60" />,
        onClick: () => openReactivateUserModal(user),
      });
    }

    return options;
  };

  return (
    <div className="z-[2] mx-auto w-full">
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          {users.length > 1 && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-[#F9FAFB] p-3">
              <InputField
                id="search"
                value={searchQuery}
                onChange={(value: string) => setSearchQuery(value)}
                placeholder="Search by name, email, phone number"
                leftIcon={<CiSearch size={20} strokeWidth={1} />}
                className="h-[40px] w-[500px] text-gray-400"
              />

              <Button
                label="Add User"
                type="bordered"
                onClick={openAddUserModal}
                className="h-[40px] rounded-lg text-sm font-semibold text-black/80"
                icon={<FiUserPlus strokeWidth={3} />}
                iconUrl={undefined}
              />
            </div>
          )}

          {/* Responsive Table Container */}
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className="max-h-full overflow-x-auto overflow-y-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead className="sticky top-0 z-10 bg-[#00000005]">
                  <tr>
                    <th className="w-[250px] border-r border-black/10 px-4 py-3 text-left text-sm font-medium text-black/60">
                      User Name
                    </th>
                    <th className="w-[200px] border-r border-black/10 px-4 py-3 text-left text-sm font-medium text-black/60">
                      Contact Details
                    </th>
                    <th className="w-[120px] border-r border-black/10 px-4 py-3 text-left text-sm font-medium text-black/60">
                      Communication Preference
                    </th>
                    <th className="w-[180px] border-r border-black/10 px-4 py-3 text-left text-center text-sm font-medium text-black/60">
                      Role
                    </th>
                    <th className="w-[140px] border-r border-black/10 px-4 py-3 text-left text-center text-sm font-medium text-black/60">
                      Status
                    </th>
                    <th className="w-[80px] px-4 py-3 text-center text-sm font-medium text-black/60"></th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        {searchQuery.trim()
                          ? 'No members found matching your search'
                          : 'No team members found'}
                      </td>
                    </tr>
                  ) : (
                    [...filteredUsers].reverse().map((member: User) => {
                      const statusConfig = getStatusDisplay(member.status);
                      const roleConfig = getRoleDisplay(member.role);
                      const memberNameExists =
                        member.name && member.name !== '';
                      const memberContactExists =
                        member.email && member.contactNumber !== '';

                      return (
                        <tr
                          key={member.id}
                          className="border-b border-black/10 transition-colors hover:bg-gray-50"
                        >
                          {/* User */}
                          <td className="flex flex-col justify-center gap-2 border-r border-black/10 p-4">
                            <div
                              className={`max-w-[150px] font-['Inter'] text-base font-semibold leading-6 text-black/80 ${memberNameExists ? '' : 'opacity-50'}`}
                            >
                              {memberNameExists ? member.name : 'Name'}
                            </div>
                            <div className="flex gap-2">
                              {member.designation && (
                                <div className="inline-block whitespace-nowrap rounded-full border border-[#363F721A] bg-[#F8F9FC] px-3 py-1 text-xs font-medium leading-4 text-[#363F72]">
                                  {member.designation}
                                </div>
                              )}
                              {member?.communicationPreference
                                ?.viniCommunication?.department?.length > 0 &&
                                showDepartment && (
                                  <div className="inline-block whitespace-nowrap rounded-full border border-[#363F721A] bg-[#F8F9FC] px-3 py-1 text-xs font-medium leading-4 text-[#363F72]">
                                    {member?.communicationPreference?.viniCommunication?.department
                                      .map(
                                        (dept) =>
                                          dept.charAt(0).toUpperCase() +
                                          dept.slice(1)
                                      )
                                      .join(', ')}
                                  </div>
                                )}
                            </div>
                          </td>

                          {/* Email and contact number */}
                          <td className="border-r border-black/10 p-4">
                            <div className="mb-2 flex items-center gap-2">
                              <CiMail className="flex-shrink-0 text-base" />
                              <span
                                className="block truncate text-sm font-medium leading-5 text-black/60"
                                title={member.email}
                              >
                                {member.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IoCallOutline className="flex-shrink-0 text-base" />
                              <span
                                className={`truncate ${memberContactExists ? '' : 'opacity-50'} text-sm font-medium leading-5 text-black/60`}
                              >
                                {memberContactExists
                                  ? `${member.isdCode ? `(${member.isdCode}) ` : ''}${member.contactNumber}`
                                  : 'Contact'}
                              </span>
                            </div>
                          </td>

                          {/* Communication Preference */}
                          <td className="border-r border-black/10 p-4">
                            <CommunicationPreferenceCell
                              communicationPreference={
                                member.communicationPreference
                              }
                            />
                          </td>

                          {/* Role */}
                          <td className="border-r border-black/10 p-4 text-center">
                            <span
                              className={`${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.border} inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium`}
                            >
                              {roleConfig.text}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="border-r border-black/10 p-4 text-center">
                            <span
                              className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.border} inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium`}
                            >
                              {statusConfig.text}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <OptionsPopup
                              options={getMenuOptions(member)}
                              popoverClassName="w-52 z-[10]"
                              buttonClassName="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              buttonContent={
                                <Svg
                                  iconName="threeDotIcon"
                                  className="h-4 w-4 fill-black/60 md:fill-black/60"
                                />
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {users.length >= 0 && users.length < 2 && (
            <div className="flex justify-center py-[60px]">
              <Button
                label="Add more Users"
                type="outline"
                onClick={openAddUserModal}
                className="h-[40px] w-fit rounded-lg text-sm font-semibold text-black/80"
                icon={<FaPlus strokeWidth={3} />}
                iconUrl={undefined}
              />
            </div>
          )}
        </>
      )}

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={showAddUserModal}
        onClose={closeAddUserModal}
        onSave={handleInviteUser}
        isLoading={loading}
        mode="invite"
        showDepartment={showDepartment}
        error={error}
        onClearError={() => setError(null)}
      />

      {/* Edit User Modal */}
      <InviteUserModal
        isOpen={showEditUserModal}
        onClose={closeEditUserModal}
        onSave={async (userData) => {
          if (selectedUser) {
            // If user is active, call editUser flow
            // If user is invite_sent (not active), call inviteUser flow again
            if (selectedUser.status === 'active') {
              await handleEditUser(selectedUser.id, userData);
            } else {
              // For invite_sent users, re-invite with updated data
              await handleInviteUser(userData as InviteUserRequest);
            }
          }
        }}
        showDepartment={showDepartment}
        isLoading={loading}
        mode="edit"
        initialData={selectedUser}
        error={error}
        onClearError={() => setError(null)}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteUserModal}
        onClose={closeDeleteUserModal}
        onConfirm={async () => {
          if (selectedUser) {
            await handleDeleteUser(selectedUser.id);
          }
        }}
        isLoading={loading}
      />

      {/* Deactivate User Confirmation Modal */}
      <ConfirmActionModal
        isOpen={showDeactivateUserModal}
        onClose={closeDeactivateUserModal}
        onConfirm={async () => {
          if (selectedUser) {
            await deactivateUser(selectedUser.id);
          }
        }}
        isLoading={loading}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${selectedUser?.name || 'this user'}? They will no longer have access.`}
        confirmLabel="Deactivate"
        variant="danger"
      />

      {/* Reactivate User Confirmation Modal */}
      <ConfirmActionModal
        isOpen={showReactivateUserModal}
        onClose={closeReactivateUserModal}
        onConfirm={async () => {
          if (selectedUser) {
            await activateUser(selectedUser.id);
          }
        }}
        isLoading={loading}
        title="Reactivate User"
        description={`Are you sure you want to reactivate ${selectedUser?.name || 'this user'}? They will regain access.`}
        confirmLabel="Reactivate"
        variant="success"
      />
    </div>
  );
};

// Props for the InviteUser component
export interface InviteUserProps {
  enterpriseId: string;
  teamId: string;
  teamName: string;
  showDepartment?: boolean;
}

// Main exported component with provider wrapper
const InviteUser: React.FC<InviteUserProps> = ({
  enterpriseId,
  teamId,
  teamName,
  showDepartment = false,
}) => {
  return (
    <InviteUserProvider
      enterpriseId={enterpriseId}
      teamId={teamId}
      teamName={teamName}
    >
      <InviteUserContent showDepartment={showDepartment} />
    </InviteUserProvider>
  );
};

export default InviteUser;

// Also export the context hook and provider for external use
export { useInviteUser } from './invite-user-context';
export { InviteUserProvider } from './invite-user-provider';
