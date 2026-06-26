'use client';

// Comprehensive Team & Directory — merges User Management (invite/edit users)
// + Employee Directory Management (searchable, filterable, bulk-upload).
// Add Employee + Upload File open as portal modals over the directory table.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';

import type {
  EmployeeFormData,
  RoutingDirectoryEmployee,
} from '@/app-models-settings/routing-directory/routing-directory.model';
import useUserDetails from '@/hooks/settings/useUserDetails';
import { useRoutingDirectory } from '@/hooks/settings/use-routing-directory';
import {
  BulkUploadApiError,
  bulkUploadEmployeesAPI,
  getDirectoryTemplateFileUrlAPI,
} from '@/services/settings/routing-directory.service';

import { UserDirectory } from '@/components/settings/v3/routing-directory/UserDirectory';
import { AddUserForm } from '@/components/settings/v3/routing-directory/AddUserForm';
import { ExcelUpload } from '@/components/settings/v3/routing-directory/ExcelUpload';
import { DirectoryMenuBar } from '@/components/settings/v3/routing-directory/directory-menu-bar';
import { EditEmployeeModal } from '@/components/settings/v3/routing-directory/edit-employee-modal';

const ModalShell = ({
  title,
  description,
  onClose,
  maxWidth = 'max-w-[820px]',
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  maxWidth?: string;
  /** Body should manage its own scroll + sticky footer via flex layout. */
  children: React.ReactNode;
}) =>
  createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div
        className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-neutral-950">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>,
    document.body
  );

export function TeamAndDirectory() {
  const { teamId, enterpriseId, teamName } = useUserDetails();

  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<{
    message: string;
    errorFileUrl?: string;
  } | null>(null);
  const [sampleFileUrl, setSampleFileUrl] = useState('');
  const [editingEmployee, setEditingEmployee] =
    useState<RoutingDirectoryEmployee | null>(null);

  const {
    employees,
    pagination,
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
    toggleEmployeeStatus,
    onPageChange,
    onPageSizeChange,
  } = useRoutingDirectory(teamId ?? '', enterpriseId ?? '', teamName ?? '');

  const tablePagination = useMemo(
    () => ({
      selectedCount: 0,
      totalRows: pagination.totalCount,
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      pageSize: pagination.pageSize,
      onPageChange,
      onPageSizeChange,
      onFirstPage: () => onPageChange(1),
      onPreviousPage: () => onPageChange(Math.max(1, pagination.page - 1)),
      onNextPage: () =>
        onPageChange(Math.min(pagination.totalPages, pagination.page + 1)),
      onLastPage: () => onPageChange(pagination.totalPages),
    }),
    [pagination, onPageChange, onPageSizeChange]
  );

  const handleAddEmployeesSubmit = useCallback(
    async (formData: EmployeeFormData[]) => {
      await createEmployees(formData);
      setShowAdd(false);
    },
    [createEmployees]
  );

  const handleUploadStart = useCallback((_file: File) => {
    setIsUploading(true);
    setUploadError(null);
  }, []);

  const handleUploadComplete = useCallback(
    async (file: File) => {
      try {
        await bulkUploadEmployeesAPI(
          file,
          enterpriseId ?? '',
          teamId ?? '',
          teamName ?? ''
        );
        await fetchEmployees();
        setShowBulk(false);
      } catch (error) {
        const apiError = error as BulkUploadApiError;
        setUploadError({
          message: apiError?.message ?? 'Upload failed. Please try again.',
          errorFileUrl: apiError?.errorFileUrl,
        });
      } finally {
        setIsUploading(false);
      }
    },
    [enterpriseId, teamId, teamName, fetchEmployees]
  );

  const closeBulk = () => {
    if (isUploading) return;
    setShowBulk(false);
    setUploadError(null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const url = await getDirectoryTemplateFileUrlAPI();
        setSampleFileUrl(url);
      } catch {
        setSampleFileUrl('');
      }
    };
    load();
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-black-dark">Team & Directory</h1>
        <p className="mt-1 text-sm text-black-60">
          Invite users, set permissions, and manage the employee directory used
          for call transfers.
        </p>
      </header>

      <div className="flex min-h-[600px] flex-col overflow-hidden rounded-xl border border-black/10">
        <DirectoryMenuBar
          view="view-directory"
          search={search}
          onSearchChange={setSearch}
          capabilityFilter={capabilityFilter}
          onCapabilityFilterChange={setCapabilityFilter}
          counts={counts}
          onUploadCSV={() => setShowBulk(true)}
          onAddEmployee={() => setShowAdd(true)}
          onBack={() => {}}
          onSwitchToUpload={() => setShowBulk(true)}
          onSwitchToManual={() => setShowAdd(true)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          <UserDirectory
            employees={employees}
            isLoading={isLoading}
            pagination={tablePagination}
            search={search}
            capabilityFilter={capabilityFilter}
            onClearFilters={() => {
              setSearch('');
              setCapabilityFilter('all');
            }}
            onToggleStatus={toggleEmployeeStatus}
            onEditEmployee={setEditingEmployee}
          />
        </div>
      </div>

      {showAdd && (
        <ModalShell
          title="Add Employees"
          description="Add one or more employees. The fields you fill depend on whether they need dashboard access, appear in call routing, or both."
          onClose={() => setShowAdd(false)}
        >
          <AddUserForm
            onSubmit={handleAddEmployeesSubmit}
            isSubmitting={isSubmitting}
            departments={departments}
          />
        </ModalShell>
      )}

      {showBulk && (
        <ModalShell
          title="Upload Employees"
          description="Upload a CSV to add many employees at once. Download the template for the expected columns."
          onClose={closeBulk}
          maxWidth="max-w-[720px]"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ExcelUpload
              onUploadStart={handleUploadStart}
              onUploadComplete={handleUploadComplete}
              isUploading={isUploading}
              uploadError={uploadError}
              sampleFileUrl={sampleFileUrl}
            />
          </div>
        </ModalShell>
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          isSubmitting={isSubmitting}
          onClose={() => setEditingEmployee(null)}
          onSave={updateEmployee}
          departments={departments}
        />
      )}
    </div>
  );
}
