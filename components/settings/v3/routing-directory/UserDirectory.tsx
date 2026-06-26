import {
  EmployeeCapabilityFilter,
  RoutingDirectoryEmployee,
} from '@/app-models-settings/routing-directory/routing-directory.model';
import CIChip from '@/internal-design-system-settings/chips/CIChip';

import { useMemo } from 'react';
import { MdOutlinePhone } from 'react-icons/md';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

import {
  GenericTable,
  GenericTableColumn,
  GenericTableProps,
} from '@/components/settings/actionItems/generic-table';

import { StringUtils } from '@/utils-settings/StringUtils';

import { ActionMenu } from './action-menu';

interface UserDirectoryProps {
  employees: RoutingDirectoryEmployee[];
  isLoading: boolean;
  pagination: GenericTableProps<RoutingDirectoryEmployee>['pagination'];
  search: string;
  capabilityFilter: EmployeeCapabilityFilter;
  onClearFilters: () => void;
  onToggleStatus: (id: string) => void;
  onEditEmployee?: (employee: RoutingDirectoryEmployee) => void;
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  agent: 'Agent',
  viewer: 'Viewer',
};

const EmployeeCell = ({ employee }: { employee: RoutingDirectoryEmployee }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4600f2]/10 text-xs font-semibold text-[#4600f2]">
      {getInitials(employee.firstName, employee.lastName)}
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium text-neutral-950">
        {StringUtils.toCapitalize(employee.firstName)}{' '}
        {StringUtils.toCapitalize(employee.lastName)}
      </span>
      {employee.email && (
        <span className="text-[11px] text-gray-400">{employee.email}</span>
      )}
    </div>
  </div>
);

const StatusToggle = ({
  employee,
  onToggle,
}: {
  employee: RoutingDirectoryEmployee;
  onToggle: (id: string) => void;
}) => {
  const isActive = employee.status === 'active';
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'text-xs font-medium',
          isActive ? 'text-neutral-950' : 'text-red-500'
        )}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
      <button
        role="switch"
        aria-checked={isActive}
        onClick={() => onToggle(employee.id)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
          isActive ? 'bg-neutral-950' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            isActive ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};

export const UserDirectory = ({
  employees,
  isLoading,
  pagination,
  search,
  capabilityFilter,
  onClearFilters,
  onToggleStatus,
  onEditEmployee,
}: UserDirectoryProps) => {
  const hasActiveFilters =
    search.trim().length > 0 || capabilityFilter !== 'all';

  const columns: Array<GenericTableColumn<RoutingDirectoryEmployee>> = useMemo(
    () => [
      {
        key: 'employee',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            EMPLOYEE
          </span>
        ),
        width: '20%',
        sticky: true,
        render: (employee) => <EmployeeCell employee={employee} />,
      },
      {
        key: 'designation',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            DESIGNATION
          </span>
        ),
        width: '13%',
        render: (employee) => (
          <span className="text-xs font-medium text-neutral-950">
            {StringUtils.toCapitalize(employee.designation)}
          </span>
        ),
      },
      {
        key: 'department',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            DEPARTMENT
          </span>
        ),
        width: '11%',
        render: (employee) => (
          <CIChip
            label={StringUtils.toCapitalize(employee.department)}
            backgroundColor="bg-gray-100"
            textColor="text-gray-700"
            size="default"
          />
        ),
      },
      {
        key: 'contact',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            CONTACT
          </span>
        ),
        width: '15%',
        render: (employee) => (
          <div className="flex items-center gap-1 text-xs font-medium text-neutral-950">
            <MdOutlinePhone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span>{StringUtils.formatPhoneNumber(employee.phone)}</span>
            {employee.extension && (
              <span className="text-gray-400">#{employee.extension}</span>
            )}
          </div>
        ),
      },
      {
        key: 'dashboard',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            DASHBOARD
          </span>
        ),
        width: '10%',
        render: (employee) =>
          employee.canAccessDashboard ? (
            <CIChip
              label={
                employee.dashboardRole
                  ? ROLE_LABEL[employee.dashboardRole] ?? 'Yes'
                  : 'Yes'
              }
              backgroundColor="bg-[#4600f2]/10"
              textColor="text-[#4600f2]"
              size="default"
            />
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        key: 'callDirectory',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            CALL DIRECTORY
          </span>
        ),
        width: '12%',
        render: (employee) =>
          employee.callTransferEligible ? (
            <CIChip
              label="Eligible"
              backgroundColor="bg-green-50"
              textColor="text-green-700"
              size="default"
            />
          ) : (
            <span className="text-xs text-gray-400">Off</span>
          ),
      },
      {
        key: 'status',
        header: (
          <span className="text-xs font-semibold text-neutral-950">STATUS</span>
        ),
        width: '12%',
        render: (employee) => (
          <StatusToggle employee={employee} onToggle={onToggleStatus} />
        ),
      },
      {
        key: 'actions',
        header: (
          <span className="text-xs font-semibold text-neutral-950">
            ACTIONS
          </span>
        ),
        width: '7%',
        render: (employee) => (
          <ActionMenu
            employee={employee}
            onEdit={onEditEmployee}
          />
        ),
      },
    ],
    [onToggleStatus, onEditEmployee]
  );

  return (
    <GenericTable<RoutingDirectoryEmployee>
      columns={columns}
      data={employees}
      isLoading={isLoading}
      loadingRows={8}
      rowKey={(employee) => employee.id}
      rowClassName={(employee) =>
        employee.status === 'inactive' ? 'opacity-70' : ''
      }
      showSelectionInfo={false}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm text-gray-400">
            {hasActiveFilters
              ? 'No employees match your current filters.'
              : 'No employees found. Add your first employee to get started.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm font-medium text-[#4600f2] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      }
      pagination={pagination}
    />
  );
};
