import { EmployeeFormData } from '@/app-models-settings/routing-directory/routing-directory.model';
import { RoutingDirectoryEmployee } from '@/app-models-settings/routing-directory/routing-directory.model';
import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import {
  BulkUploadApiError,
  bulkUploadEmployeesAPI,
  getDirectoryTemplateFileUrlAPI,
} from '@/services/settings/routing-directory.service';

import { useCallback, useEffect, useMemo, useState } from 'react';

import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
import OnboardingFooter from '@spyne-console/components/onboarding/onboarding-footer';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useOnboardingStepNavigation } from '@/hooks/settings/use-onboarding-step-navigation';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import { useRoutingDirectory } from '@/hooks/settings/use-routing-directory';
import useUserDetails from '@/hooks/settings/useUserDetails';

import DurationHolder from '../common/DurationHolder';
import { AddUserForm } from './AddUserForm';
import { ExcelUpload } from './ExcelUpload';
import { UserDirectory } from './UserDirectory';
import { DirectoryMenuBar } from './directory-menu-bar';
import { EditEmployeeModal } from './edit-employee-modal';

enum View {
  VIEW_DIRECTORY = 'view-directory',
  ADD_USER = 'add-user',
  BULK_UPLOAD = 'bulk-upload',
}

export const RoutingDirectory = () => {
  const [view, setView] = useState<View>(View.VIEW_DIRECTORY);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<{
    message: string;
    errorFileUrl?: string;
  } | null>(null);
  const [sampleFileUrl, setSampleFileUrl] = useState('');
  const [editingEmployee, setEditingEmployee] =
    useState<RoutingDirectoryEmployee | null>(null);

  const { goToNextStep } = useOnboardingStepNavigation();
  const { productLineId } = useMainContext();
  const { activeAgentTypeId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const { teamId, enterpriseId, teamName } = useUserDetails();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();

  const agentTypeData = useMemo(
    () => agentTypes.find((a) => a.agentTypeId === activeAgentTypeId),
    [agentTypes, activeAgentTypeId]
  );

  useEffect(() => {
    updateTaskAndRefresh(
      {
        productLineId,
        taskName: OnboardingTaskName.ROUTING_DIRECTORY,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

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
      setView(View.VIEW_DIRECTORY);
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
        setView(View.VIEW_DIRECTORY);
      } catch (error: any) {
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

  const handleContinue = useCallback(async () => {
    if (view === View.BULK_UPLOAD) {
      setView(View.VIEW_DIRECTORY);
      return;
    }
    await updateTaskAndRefresh(
      {
        productLineId,
        taskName: OnboardingTaskName.ROUTING_DIRECTORY,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      true
    );
    goToNextStep();
  }, [view, productLineId, agentTypeData, updateTaskAndRefresh, goToNextStep]);

  useEffect(() => {
    const fetchTemplateFileUrl = async () => {
      try {
        const url = await getDirectoryTemplateFileUrlAPI();
        setSampleFileUrl(url);
      } catch {
        setSampleFileUrl('');
      }
    };
    fetchTemplateFileUrl();
  }, []);

  const renderContent = () => {
    if (view === View.ADD_USER) {
      return (
        <AddUserForm
          onSubmit={handleAddEmployeesSubmit}
          isSubmitting={isSubmitting}
          departments={departments}
        />
      );
    }
    if (view === View.BULK_UPLOAD) {
      return (
        <ExcelUpload
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          isUploading={isUploading}
          uploadError={uploadError}
          sampleFileUrl={sampleFileUrl}
        />
      );
    }
    return (
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
    );
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden pl-8">
        <OnboardingBackgroundGrid fadeRight={true} width="50%" />
        <div className="mr-12 flex h-full flex-1 flex-col gap-6 overflow-hidden py-8">
          <OnboardingStepHeader
            title="Setup your call directory"
            description="Manage your call transfers"
          >
            <DurationHolder />
          </OnboardingStepHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200">
            <DirectoryMenuBar
              view={view}
              search={search}
              onSearchChange={setSearch}
              capabilityFilter={capabilityFilter}
              onCapabilityFilterChange={setCapabilityFilter}
              counts={counts}
              onUploadCSV={() => setView(View.BULK_UPLOAD)}
              onAddEmployee={() => setView(View.ADD_USER)}
              onBack={() => setView(View.VIEW_DIRECTORY)}
              onSwitchToUpload={() => setView(View.BULK_UPLOAD)}
              onSwitchToManual={() => setView(View.ADD_USER)}
            />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter
        onContinue={handleContinue}
        showBackButton={view !== View.VIEW_DIRECTORY}
        onBack={() => setView(View.VIEW_DIRECTORY)}
        disableContinue={false}
        continueLabel="Continue"
      />

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
};
