import { EmployeeCapabilityFilter } from '@/app-models-settings/routing-directory/routing-directory.model';
import GenericInput from '@/internal-design-system-settings/input/generic-input';
import { Button } from '@spyne-console/design-system';

import { GoPlus } from 'react-icons/go';
import { IoArrowBack } from 'react-icons/io5';
import { LuUpload } from 'react-icons/lu';
import { MdOutlineSearch } from 'react-icons/md';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

import Breadcrumb from '@/components/settings/shared/breadcrumb';

interface DirectoryMenuBarProps {
  view: 'view-directory' | 'add-user' | 'bulk-upload';
  search: string;
  onSearchChange: (value: string) => void;
  capabilityFilter: EmployeeCapabilityFilter;
  onCapabilityFilterChange: (filter: EmployeeCapabilityFilter) => void;
  counts: {
    all: number | null;
    dashboardUsers: number | null;
    callTransfers: number | null;
  };
  onUploadCSV: () => void;
  onAddEmployee: () => void;
  onBack: () => void;
  onSwitchToUpload: () => void;
  onSwitchToManual: () => void;
}

const CAPABILITY_FILTERS: { label: string; value: EmployeeCapabilityFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Dashboard users', value: 'dashboardUsers' },
  { label: 'Call Directory', value: 'callTransfers' },
];

export const DirectoryMenuBar = ({
  view,
  search,
  onSearchChange,
  capabilityFilter,
  onCapabilityFilterChange,
  counts,
  onUploadCSV,
  onAddEmployee,
  onBack,
  onSwitchToUpload,
  onSwitchToManual,
}: DirectoryMenuBarProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
    {view === 'view-directory' ? (
      <div className="flex items-center gap-3">
        <GenericInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search employees..."
          size="small"
          width="w-52"
          prefixIcon={<MdOutlineSearch />}
        />
        <div className="flex items-center gap-1">
          {CAPABILITY_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onCapabilityFilterChange(value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                capabilityFilter === value
                  ? 'bg-neutral-950 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {counts[value] === null ? label : `${label} (${counts[value]})`}
            </button>
          ))}
        </div>
      </div>
    ) : (
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
      >
        <IoArrowBack className="h-4 w-4" />
        Back to Directory
      </button>
    )}

    {view === 'view-directory' ? (
      <div className="flex items-center gap-2">
        <Button
          type="bordered"
          label="Upload File"
          icon={<LuUpload className="h-3.5 w-3.5" />}
          iconUrl={undefined}
          onClick={onUploadCSV}
        />
        <Button
          type="primary"
          label="Add Employee"
          icon={<GoPlus className="h-4 w-4" />}
          iconUrl={undefined}
          onClick={onAddEmployee}
        />
      </div>
    ) : (
      <Breadcrumb
        items={[
          { label: 'Upload File', id: 0, onClick: onSwitchToUpload },
          { label: 'Add Manually', id: 1, onClick: onSwitchToManual },
        ]}
        activeIndex={view === 'bulk-upload' ? 0 : 1}
        highLightSelected={false}
        className="gap-6"
      />
    )}
  </div>
);
