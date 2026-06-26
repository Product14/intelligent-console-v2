'use client';

// localStorage-backed shim — lets the UI roundtrip create/edit/toggle until a
// real backend is wired. Scope is per (enterpriseId, teamId). All mutations
// persist synchronously to window.localStorage. SSR-safe.

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AvailabilitySchedule,
  DirectoryDepartmentRecord,
  EMPTY_AVAILABILITY,
  EMPTY_COMMUNICATION_PREFERENCES,
  EmployeeCapabilityFilter,
  EmployeeFormData,
  RoutingDirectoryEmployee,
} from '@/app-models-settings/routing-directory/routing-directory.model';

type Department = DirectoryDepartmentRecord;

// Demo seed so the Department dropdown and dept-defaulted availability are
// testable end-to-end without a backend. Remove once GET /departments is wired.
const MOCK_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Sales', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], workingHours: { start: '09:00', end: '19:00' } },
  { id: '2', name: 'Service', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'], workingHours: { start: '08:00', end: '18:00' } },
  { id: '3', name: 'Finance', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'], workingHours: { start: '10:00', end: '17:00' } },
  { id: '4', name: 'BDC', workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], workingHours: { start: '08:00', end: '20:00' } },
];

const DEFAULT_PAGE_SIZE = 10;

interface UseRoutingDirectoryReturn {
  employees: RoutingDirectoryEmployee[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  search: string;
  setSearch: (v: string) => void;
  capabilityFilter: EmployeeCapabilityFilter;
  setCapabilityFilter: (v: EmployeeCapabilityFilter) => void;
  departments: Department[];
  counts: {
    all: number | null;
    dashboardUsers: number | null;
    callTransfers: number | null;
  };
  fetchEmployees: () => Promise<void>;
  createEmployees: (formData: EmployeeFormData[]) => Promise<void>;
  updateEmployee: (id: string, data: EmployeeFormData) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  toggleEmployeeStatus: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  refetch: () => void;
}

const STORAGE_PREFIX = 'spyne:routing-directory';
const storageKey = (enterpriseId: string, teamId: string) =>
  `${STORAGE_PREFIX}:${enterpriseId || 'anon'}:${teamId || 'anon'}`;

const readFromStorage = (
  enterpriseId: string,
  teamId: string
): RoutingDirectoryEmployee[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(enterpriseId, teamId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RoutingDirectoryEmployee[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeToStorage = (
  enterpriseId: string,
  teamId: string,
  employees: RoutingDirectoryEmployee[]
) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      storageKey(enterpriseId, teamId),
      JSON.stringify(employees)
    );
  } catch {
    /* quota or serialisation error — ignore in mock mode */
  }
};

const makeId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof (crypto as Crypto & { randomUUID?: () => string }).randomUUID ===
      'function'
  ) {
    return (crypto as Crypto & { randomUUID: () => string }).randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const cloneAvailability = (a?: AvailabilitySchedule): AvailabilitySchedule => ({
  workingDays: [...(a?.workingDays ?? EMPTY_AVAILABILITY.workingDays)],
  workingHours: { ...(a?.workingHours ?? EMPTY_AVAILABILITY.workingHours) },
  exceptions: a?.exceptions ?? '',
});

const formToEmployee = (
  form: EmployeeFormData,
  departments: Department[],
  existing?: RoutingDirectoryEmployee
): RoutingDirectoryEmployee => {
  const dept = departments.find((d) => d.name === form.department);
  return {
    id: existing?.id ?? makeId(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim() || undefined,
    designation: form.designation,
    dashboardRole: form.canAccessDashboard
      ? form.dashboardRole || null
      : null,
    canAccessDashboard: form.canAccessDashboard,
    callTransferEligible: form.callTransferEligible,
    department: form.department,
    departmentId: dept?.id ?? existing?.departmentId ?? '',
    phone: `${form.isdCode}${form.phoneNumber}`,
    extension: form.extension.trim() || undefined,
    status: existing?.status ?? 'active',
    communicationPreferences:
      form.communicationPreferences ??
      existing?.communicationPreferences ??
      EMPTY_COMMUNICATION_PREFERENCES,
    availability: cloneAvailability(form.availability),
  };
};

const matchesSearch = (
  employee: RoutingDirectoryEmployee,
  keyword: string
): boolean => {
  if (!keyword.trim()) return true;
  const q = keyword.trim().toLowerCase();
  return (
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(q) ||
    (employee.email?.toLowerCase().includes(q) ?? false) ||
    employee.phone.toLowerCase().includes(q) ||
    employee.designation.toLowerCase().includes(q) ||
    employee.department.toLowerCase().includes(q)
  );
};

const matchesCapability = (
  employee: RoutingDirectoryEmployee,
  filter: EmployeeCapabilityFilter
): boolean => {
  if (filter === 'all') return true;
  if (filter === 'dashboardUsers') return employee.canAccessDashboard;
  if (filter === 'callTransfers') return employee.callTransferEligible;
  return true;
};

export const useRoutingDirectory = (
  teamId: string = '',
  enterpriseId: string = '',
  _teamName: string = ''
): UseRoutingDirectoryReturn => {
  const [allEmployees, setAllEmployees] = useState<RoutingDirectoryEmployee[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [capabilityFilter, setCapabilityFilter] =
    useState<EmployeeCapabilityFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);

  // Hydrate from localStorage after mount (SSR-safe).
  useEffect(() => {
    setAllEmployees(readFromStorage(enterpriseId, teamId));
    setIsLoading(false);
  }, [enterpriseId, teamId]);

  const persist = useCallback(
    (next: RoutingDirectoryEmployee[]) => {
      writeToStorage(enterpriseId, teamId, next);
    },
    [enterpriseId, teamId]
  );

  const filteredEmployees = useMemo(
    () =>
      allEmployees.filter(
        (e) => matchesCapability(e, capabilityFilter) && matchesSearch(e, search)
      ),
    [allEmployees, capabilityFilter, search]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);
  const pagedEmployees = useMemo(
    () =>
      filteredEmployees.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredEmployees, currentPage, pageSize]
  );

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [search, capabilityFilter]);

  const counts = useMemo(
    () => ({
      all: allEmployees.length,
      dashboardUsers: allEmployees.filter((e) => e.canAccessDashboard).length,
      callTransfers: allEmployees.filter((e) => e.callTransferEligible).length,
    }),
    [allEmployees]
  );

  const fetchEmployees = useCallback(async () => {
    setAllEmployees(readFromStorage(enterpriseId, teamId));
  }, [enterpriseId, teamId]);

  const createEmployees = useCallback(
    async (forms: EmployeeFormData[]) => {
      setIsSubmitting(true);
      try {
        const created = forms.map((f) => formToEmployee(f, departments));
        setAllEmployees((prev) => {
          const next = [...prev, ...created];
          persist(next);
          return next;
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [departments, persist]
  );

  const updateEmployee = useCallback(
    async (id: string, form: EmployeeFormData) => {
      setIsSubmitting(true);
      try {
        setAllEmployees((prev) => {
          const next = prev.map((e) =>
            e.id === id ? formToEmployee(form, departments, e) : e
          );
          persist(next);
          return next;
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [departments, persist]
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      setAllEmployees((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleEmployeeStatus = useCallback(
    (id: string) => {
      setAllEmployees((prev) => {
        const next: RoutingDirectoryEmployee[] = prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status:
                  e.status === 'active'
                    ? ('inactive' as const)
                    : ('active' as const),
              }
            : e
        );
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return {
    employees: pagedEmployees,
    pagination: {
      page: currentPage,
      pageSize,
      totalCount: filteredEmployees.length,
      totalPages,
      hasNext: currentPage < totalPages,
    },
    isLoading,
    isSubmitting,
    search,
    setSearch,
    capabilityFilter,
    setCapabilityFilter,
    departments,
    counts,
    fetchEmployees,
    createEmployees,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    onPageChange: setPage,
    onPageSizeChange: (size) => {
      setPageSize(size);
      setPage(1);
    },
    refetch: fetchEmployees,
  };
};

export default useRoutingDirectory;
