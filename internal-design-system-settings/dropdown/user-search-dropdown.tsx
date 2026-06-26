import { UserListResponse } from '@/models/user.model';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';

import classNames from 'classnames';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import { UserUtils } from '@/utils-settings/UserUtils';

import useUserDetails from '../../hooks/useUserDetails';
import CIDropdown from './ci-dropdown';
import { CIDropdownMenuOption } from './model';

const UnassignedUserSelectedIcon: React.ReactNode = (
  <div className="flex w-full items-center gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
    <div className="flex h-5 w-5 items-center justify-center rounded border border-black/20 bg-gray-200 py-1">
      <div className="text-xs font-semibold leading-3 text-black/20">U</div>
    </div>
    <div className="overflow-hidden overflow-ellipsis text-xs font-medium leading-4 text-neutral-950">
      Unassigned
    </div>
  </div>
);

const UserIcon = ({
  user,
  hideEmail,
}: {
  user: UserListResponse;
  hideEmail?: boolean;
}) => {
  return (
    <div className="flex w-full items-center gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
      <div
        className="flex h-5 w-5 items-center justify-center rounded py-1"
        style={{ backgroundColor: UserUtils.getRandomColor(user.user_name) }}
      >
        <div className="text-xs font-semibold leading-3 text-white">
          {UserUtils.getInitials(user.user_name)[0]}
        </div>
      </div>

      <div
        className={classNames(
          'min-w-0 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap',
          hideEmail ? 'max-w-[200px]' : 'max-w-[100px]'
        )}
      >
        <span className="text-xs font-medium leading-4 text-neutral-950">
          {user.user_name}
        </span>
      </div>
      {!hideEmail && (
        <div className="min-w-0 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-xs font-normal leading-none text-neutral-400">
            {user.email_id}
          </span>
        </div>
      )}
    </div>
  );
};

const UnassignedUserOption: CIDropdownMenuOption = {
  id: 'unassigned',
  label: 'Unassigned',
  value: 'unassigned',
  icon: UnassignedUserSelectedIcon,
  selectedIcon: UnassignedUserSelectedIcon,
  showSeparator: true,
  hideLabel: true,
};

interface UserSearchDropdownProps {
  selectedValues: CIDropdownMenuOption[];
  onChange: (values: CIDropdownMenuOption[]) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  debounceDelay?: number;
  variant?: 'filter' | 'default' | 'minimal';
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  labelColor?: string; // New prop for custom label color
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const API_URL = `${process.env.APP_BACKEND_BASEURL}/console/v1/user/get-user-list`;

// The backend expects teamIds as a JSON array string, e.g. ["teamId1","teamId2"]
const formatTeamIdsForApi = (teamIds?: string | string[]) => {
  if (!teamIds) return '';
  if (Array.isArray(teamIds)) return JSON.stringify(teamIds);
  const trimmed = String(teamIds).trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
  return JSON.stringify([trimmed]);
};

const mapUsersToOptions = (
  users: UserListResponse[]
): CIDropdownMenuOption[] => {
  return users.map((u) => ({
    id: u.user_id,
    label: u.user_name,
    value: u.user_id,
    icon: <UserIcon user={u} />,
    selectedIcon: <UserIcon user={u} hideEmail={true} />,
    hideLabel: true,
  }));
};

export const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  selectedValues,
  onChange,
  label,
  variant = 'filter',
  placeholder = 'Assignee',
  onError,
  onLoadingChange,
  labelColor, // New prop
  open,
  onOpenChange,
}) => {
  const [options, setOptions] = useState<CIDropdownMenuOption[]>([]);
  const [allOptions, setAllOptions] = useState<UserListResponse[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(false);
  const { enterpriseId, teamId } = useUserDetails();

  const fetchUsers = useCallback(async () => {
    if (!enterpriseId) return;

    const params = new URLSearchParams();
    params.set('enterpriseId', enterpriseId);
    const teamIdsParam = formatTeamIdsForApi(teamId);
    if (teamIdsParam) params.set('teamIds', teamIdsParam);
    params.set('page', String(1));
    params.set('batchSize', String(100));
    params.set('onlyActive', String(true));

    const url = `${API_URL}?${params.toString()}`;

    setIsLoading(true);
    onLoadingChange?.(true);
    try {
      const res = await CentralAPIHandler.handleGetRequest(url);
      const rawData = res?.data?.activeUsers || {};
      const usersArray: UserListResponse[] = Object.values(
        rawData
      ) as UserListResponse[];
      const mapped = mapUsersToOptions(usersArray);
      setAllOptions(usersArray);
      setOptions(mapped);
    } catch (e: any) {
      toast.error('Failed to fetch users for assignee');
      setOptions([]);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  }, [enterpriseId, teamId]);

  useEffect(() => {
    if (!!searchValue.trim()) {
      const filteredOptions = allOptions.filter(
        (option) =>
          option.user_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          option.email_id.toLowerCase().includes(searchValue.toLowerCase())
      );
      setOptions(mapUsersToOptions(filteredOptions));
    } else {
      setOptions(mapUsersToOptions(allOptions));
    }
  }, [searchValue, allOptions]);

  useEffect(() => {
    fetchUsers();
    mountedRef.current = true;
  }, [fetchUsers]);

  return (
    <div className="w-full">
      <CIDropdown
        label={label}
        selectedValues={selectedValues}
        options={isLoading ? [] : [UnassignedUserOption, ...options]}
        onChange={onChange}
        placeholder={placeholder}
        showCheckmark={true}
        variant={variant}
        allowSearch={true}
        searchPlaceholder="Search User"
        isSearchLoading={isLoading}
        onSearchChange={setSearchValue}
        overflowWidth={300}
        allowDeselection={true}
        labelColor={labelColor}
        open={open}
        onOpenChange={onOpenChange}
      />
    </div>
  );
};

export default UserSearchDropdown;
