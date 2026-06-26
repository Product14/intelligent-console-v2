import {
  AvailabilitySchedule,
  CommunicationPreferences,
  DASHBOARD_ROLE_OPTIONS,
  DESIGNATION_OPTIONS,
  DashboardRole,
  DirectoryDepartmentRecord,
  EMPTY_AVAILABILITY,
  EMPTY_COMMUNICATION_PREFERENCES,
  EmployeeFormData,
  RoutingDirectoryEmployee,
  WEEK_DAYS,
  WeekDay,
} from '@/app-models-settings/routing-directory/routing-directory.model';
import CiButton from '@/internal-design-system-settings/button/ci-button';
import CIDropdown from '@/internal-design-system-settings/dropdown/ci-dropdown';
import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';
import { ToggleRow } from '@/components/settings/ui/toggle-row';

import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoWarning } from 'react-icons/io5';
import { MdClose, MdOutlineEmail } from 'react-icons/md';
// @ts-ignore
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { parsePhoneNumberFromString } from 'libphonenumber-js';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

const OTHER_DESIGNATION_VALUE = 'Other';

const INPUT_CLASS =
  'w-full h-[38px] rounded-lg border border-[rgba(0,0,0,0.2)] bg-white px-3 py-2.5 text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] focus:border-[#4600f2] focus:outline-none focus-visible:outline-none';

const PHONE_INPUT_CLASS =
  '!w-full !h-[38px] rounded-lg border border-[rgba(0,0,0,0.2)] bg-white pl-12 pr-3 text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] focus:border-[#4600f2] focus:outline-none focus-visible:outline-none';

const PHONE_BUTTON_CLASS = '!h-[38px] !border-[rgba(0,0,0,0.2)] !bg-white !rounded-l-lg';

type FieldErrors = Partial<Record<keyof EmployeeFormData, string>>;
type TouchedFields = Partial<Record<keyof EmployeeFormData, boolean>>;

const validateEmployee = (data: EmployeeFormData): FieldErrors => {
  const errors: FieldErrors = {};
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';
  if (!data.phoneNumber || data.phoneNumber.replace(/\D/g, '').length < 10)
    errors.phoneNumber = 'Valid phone number is required';

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.canAccessDashboard && !data.dashboardRole) {
    errors.dashboardRole = 'Pick a dashboard role';
  }

  if (data.callTransferEligible) {
    if (!data.designation) errors.designation = 'Designation is required';
    if (!data.department) errors.department = 'Department is required';
    if (!data.availability.workingDays.length)
      errors.availability = 'Pick at least one working day';
    else if (
      !data.availability.workingHours.start ||
      !data.availability.workingHours.end
    )
      errors.availability = 'Working hours are required';
  }

  return errors;
};

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-1">
    <IoWarning className="h-3.5 w-3.5 text-[#c31812]" />
    <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
      {message}
    </span>
  </div>
);

const SectionHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-sm font-semibold text-neutral-950">{title}</span>
    {description && (
      <span className="text-xs text-gray-500">{description}</span>
    )}
  </div>
);

const DAY_LABELS_FULL: Record<WeekDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const formatScheduleSummary = (value: AvailabilitySchedule): string => {
  const days = value.workingDays.length
    ? WEEK_DAYS.filter((d) => value.workingDays.includes(d.value))
        .map((d) => DAY_LABELS_FULL[d.value])
        .join(', ')
    : 'No days selected';
  const hours =
    value.workingHours.start && value.workingHours.end
      ? `${value.workingHours.start} – ${value.workingHours.end}`
      : 'Hours not set';
  return `${days} · ${hours}`;
};

const AvailabilityFields = ({
  value,
  onChange,
  error,
  department,
  inheritedFromName,
}: {
  value: AvailabilitySchedule;
  onChange: (next: AvailabilitySchedule) => void;
  error?: string;
  department: DirectoryDepartmentRecord | undefined;
  inheritedFromName?: string;
}) => {
  const canInherit = !!department && !!(department.workingDays || department.workingHours);
  const isInheriting = value.useDepartmentDefaults;

  const toggleDay = (day: WeekDay) => {
    const exists = value.workingDays.includes(day);
    onChange({
      ...value,
      workingDays: exists
        ? value.workingDays.filter((d) => d !== day)
        : [...value.workingDays, day],
    });
  };

  const handleInheritToggle = (next: boolean) => {
    if (next && department) {
      onChange({
        ...value,
        useDepartmentDefaults: true,
        workingDays: department.workingDays
          ? [...department.workingDays]
          : value.workingDays,
        workingHours: department.workingHours
          ? { ...department.workingHours }
          : value.workingHours,
      });
    } else {
      onChange({ ...value, useDepartmentDefaults: false });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label
        className={cn(
          'flex items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors',
          canInherit
            ? 'cursor-pointer border-black/10 bg-white hover:bg-gray-50'
            : 'cursor-not-allowed border-black/10 bg-gray-50 opacity-60'
        )}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#4600f2] focus:ring-[#4600f2] disabled:opacity-50"
          checked={isInheriting && canInherit}
          disabled={!canInherit}
          onChange={(e) => handleInheritToggle(e.target.checked)}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-neutral-950">
            Same as {inheritedFromName ?? 'department'}
          </span>
          <span className="text-xs text-gray-500">
            {canInherit
              ? 'Inherit working days and hours from the department. Exceptions stay per-employee.'
              : 'Pick a department to inherit its hours.'}
          </span>
        </div>
      </label>

      {isInheriting && canInherit ? (
        <div className="rounded-lg border border-dashed border-black/10 bg-white px-3 py-2.5">
          <span className="text-sm font-medium text-neutral-800">
            {formatScheduleSummary(value)}
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
              Working days <span className="text-[#c31812]">*</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.map(({ value: day, label }) => {
                const active = value.workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'h-8 min-w-[44px] rounded-full border px-3 text-xs font-medium transition-colors',
                      active
                        ? 'border-[#4600f2] bg-[#4600f2]/10 text-[#4600f2]'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                Available from <span className="text-[#c31812]">*</span>
              </span>
              <input
                type="time"
                value={value.workingHours.start}
                onChange={(e) =>
                  onChange({
                    ...value,
                    workingHours: { ...value.workingHours, start: e.target.value },
                  })
                }
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                Available till <span className="text-[#c31812]">*</span>
              </span>
              <input
                type="time"
                value={value.workingHours.end}
                onChange={(e) =>
                  onChange({
                    ...value,
                    workingHours: { ...value.workingHours, end: e.target.value },
                  })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
          Schedule exceptions{' '}
          <span className="text-xs font-normal text-gray-400">(Optional)</span>
        </span>
        <textarea
          value={value.exceptions}
          onChange={(e) =>
            onChange({ ...value, exceptions: e.target.value })
          }
          placeholder="e.g. Off every alternate Saturday, unavailable Dec 24–26"
          rows={2}
          className="w-full resize-none rounded-lg border border-[rgba(0,0,0,0.2)] bg-white px-3 py-2 text-sm leading-5 text-[rgba(0,0,0,0.8)] focus:border-[#4600f2] focus:outline-none"
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

const parseEmployeePhone = (
  fullPhone: string
): { isdCode: string; phoneNumber: string } => {
  const digits = fullPhone.replace(/\D/g, '');
  if (!digits) return { isdCode: '', phoneNumber: '' };

  const parsed = parsePhoneNumberFromString(`+${digits}`);
  if (parsed?.isValid()) {
    return {
      isdCode: `+${parsed.countryCallingCode}`,
      phoneNumber: parsed.nationalNumber as string,
    };
  }

  return { isdCode: '', phoneNumber: digits };
};

const buildInitialForm = (
  employee: RoutingDirectoryEmployee
): EmployeeFormData => {
  const { isdCode, phoneNumber } = parseEmployeePhone(employee.phone);
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    designation: employee.designation,
    dashboardRole: employee.dashboardRole ?? '',
    canAccessDashboard: employee.canAccessDashboard,
    callTransferEligible: employee.callTransferEligible,
    department: employee.department,
    isdCode,
    phoneNumber,
    extension: employee.extension ?? '',
    email: employee.email ?? '',
    availability: employee.availability ?? { ...EMPTY_AVAILABILITY },
    communicationPreferences:
      employee.communicationPreferences ?? EMPTY_COMMUNICATION_PREFERENCES,
  };
};

interface EditEmployeeModalProps {
  employee: RoutingDirectoryEmployee;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (id: string, data: EmployeeFormData) => Promise<void>;
  departments: DirectoryDepartmentRecord[];
}

export const EditEmployeeModal = ({
  employee,
  isSubmitting,
  onClose,
  onSave,
  departments,
}: EditEmployeeModalProps) => {
  const departmentOptions = useMemo(
    () => departments.map((d) => ({ label: d.name, value: d.name })),
    [departments]
  );
  const [form, setForm] = useState<EmployeeFormData>(() =>
    buildInitialForm(employee)
  );
  const [touched, setTouched] = useState<TouchedFields>({});

  const selectedDepartment = useMemo(
    () => departments.find((d) => d.name === form.department),
    [departments, form.department]
  );

  const isKnownDesignation = DESIGNATION_OPTIONS.some(
    (opt) => opt.value === employee.designation
  );
  const [designationSelection, setDesignationSelection] = useState<
    CIDropdownMenuOption[]
  >(
    employee.designation
      ? isKnownDesignation
        ? [{ label: employee.designation, value: employee.designation }]
        : [{ label: OTHER_DESIGNATION_VALUE, value: OTHER_DESIGNATION_VALUE }]
      : []
  );
  const [deptSelection, setDeptSelection] = useState<CIDropdownMenuOption[]>(
    employee.department
      ? [{ label: employee.department, value: employee.department }]
      : []
  );
  const dashboardRoleSelection = useMemo<CIDropdownMenuOption[]>(() => {
    if (!form.dashboardRole) return [];
    const found = DASHBOARD_ROLE_OPTIONS.find(
      (opt) => opt.value === form.dashboardRole
    );
    return found ? [{ label: found.label, value: found.value }] : [];
  }, [form.dashboardRole]);

  const isOtherDesignation =
    designationSelection[0]?.value === OTHER_DESIGNATION_VALUE;

  const errors = useMemo(() => validateEmployee(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const setField = useCallback(
    <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  const touch = useCallback(
    (field: keyof EmployeeFormData) =>
      setTouched((prev) => ({ ...prev, [field]: true })),
    []
  );

  const showError = (field: keyof EmployeeFormData) =>
    touched[field] && !!errors[field];

  const handleDesignationChange = (values: CIDropdownMenuOption[]) => {
    setDesignationSelection(values);
    const val = (values[0]?.value as string) ?? '';
    if (val === OTHER_DESIGNATION_VALUE) {
      setField('designation', '');
    } else {
      setField('designation', val);
    }
    touch('designation');
  };

  const handleDeptChange = (values: CIDropdownMenuOption[]) => {
    setDeptSelection(values);
    const deptName = (values[0]?.value as string) ?? '';
    setField('department', deptName);
    touch('department');
    const dept = departments.find((d) => d.name === deptName);
    if (form.availability.useDepartmentDefaults && dept) {
      setField('availability', {
        ...form.availability,
        workingDays: dept.workingDays
          ? [...dept.workingDays]
          : form.availability.workingDays,
        workingHours: dept.workingHours
          ? { ...dept.workingHours }
          : form.availability.workingHours,
      });
    }
  };

  const handleAvailabilityChange = (next: AvailabilitySchedule) => {
    setField('availability', next);
  };

  const handleDashboardRoleChange = (values: CIDropdownMenuOption[]) => {
    const val = (values[0]?.value as DashboardRole) ?? '';
    setField('dashboardRole', val);
    touch('dashboardRole');
  };

  const handleSubmit = async () => {
    const allTouched: TouchedFields = {
      firstName: true,
      lastName: true,
      designation: true,
      department: true,
      phoneNumber: true,
      email: true,
      dashboardRole: true,
      availability: true,
    };
    setTouched(allTouched);
    if (!isValid) return;
    await onSave(employee.id, form);
    onClose();
  };

  const departmentPlaceholder = departmentOptions.length
    ? 'Select department'
    : 'No departments yet — add some in Department Details';

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-[640px] flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-neutral-950">
              Edit Employee
            </h2>
            <p className="text-sm text-gray-500">
              Update the details for{' '}
              <span className="font-medium text-neutral-800">
                {employee.firstName} {employee.lastName}
              </span>
              . Fields marked with <span className="text-[#c31812]">*</span> are
              required.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Always — Identity + Phone */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    'text-sm font-medium leading-5',
                    showError('firstName')
                      ? 'text-[#c31812]'
                      : 'text-[rgba(0,0,0,0.6)]'
                  )}
                >
                  First Name <span className="text-[#c31812]">*</span>
                </span>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  onBlur={() => touch('firstName')}
                  placeholder="e.g. John"
                  className={cn(
                    INPUT_CLASS,
                    showError('firstName') &&
                      'border-[#c31812] focus:border-[#c31812]'
                  )}
                />
                {showError('firstName') && (
                  <ErrorMessage message={errors.firstName!} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    'text-sm font-medium leading-5',
                    showError('lastName')
                      ? 'text-[#c31812]'
                      : 'text-[rgba(0,0,0,0.6)]'
                  )}
                >
                  Last Name <span className="text-[#c31812]">*</span>
                </span>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  onBlur={() => touch('lastName')}
                  placeholder="e.g. Smith"
                  className={cn(
                    INPUT_CLASS,
                    showError('lastName') &&
                      'border-[#c31812] focus:border-[#c31812]'
                  )}
                />
                {showError('lastName') && (
                  <ErrorMessage message={errors.lastName!} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-4">
              <div className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    'text-sm font-medium leading-5',
                    showError('phoneNumber')
                      ? 'text-[#c31812]'
                      : 'text-[rgba(0,0,0,0.6)]'
                  )}
                >
                  Phone Number <span className="text-[#c31812]">*</span>
                </span>
                <PhoneInput
                  specialLabel=""
                  country="us"
                  value={`${form.isdCode.replace('+', '')}${form.phoneNumber}`}
                  onChange={(phone: string, country: { dialCode?: string }) => {
                    const dialCode = country.dialCode ?? '';
                    setField('isdCode', `+${dialCode}`);
                    setField('phoneNumber', phone.slice(dialCode.length));
                  }}
                  onBlur={() => touch('phoneNumber')}
                  placeholder="e.g. (555) 123-4567"
                  containerClass="w-full"
                  buttonClass={PHONE_BUTTON_CLASS}
                  inputClass={cn(
                    PHONE_INPUT_CLASS,
                    showError('phoneNumber') &&
                      '!border-[#c31812] focus:!border-[#c31812]'
                  )}
                />
                {showError('phoneNumber') && (
                  <ErrorMessage message={errors.phoneNumber!} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium leading-5 text-[rgba(0,0,0,0.6)]">
                  Extension{' '}
                  <span className="text-xs font-normal text-gray-400">
                    (Optional)
                  </span>
                </span>
                <input
                  type="text"
                  value={form.extension}
                  onChange={(e) => setField('extension', e.target.value)}
                  placeholder="e.g. 123"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span
                className={cn(
                  'text-sm font-medium leading-5',
                  showError('email')
                    ? 'text-[#c31812]'
                    : 'text-[rgba(0,0,0,0.6)]'
                )}
              >
                Email <span className="text-[#c31812]">*</span>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                onBlur={() => touch('email')}
                placeholder="e.g. john@dealer.com"
                className={cn(
                  INPUT_CLASS,
                  showError('email') &&
                    'border-[#c31812] focus:border-[#c31812]'
                )}
              />
              {showError('email') && (
                <ErrorMessage message={errors.email!} />
              )}
            </div>
          </div>

          {/* Capability toggles */}
          <div className="grid grid-cols-2 gap-4">
            <ToggleRow
              title="Eligible for call transfers"
              description="Vini can transfer live calls to this employee."
              enabled={form.callTransferEligible}
              onChange={(next) => {
                setField('callTransferEligible', next);
                touch('callTransferEligible');
              }}
            />
            <ToggleRow
              title="Allow Spyne dashboard access"
              description="Lets this employee log in to the Spyne console."
              enabled={form.canAccessDashboard}
              onChange={(next) => {
                setField('canAccessDashboard', next);
                if (!next) setField('dashboardRole', '');
                touch('canAccessDashboard');
              }}
            />
          </div>

          {/* Conditional — Call transfer details */}
          {form.callTransferEligible && (
            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-[#4600f2]/30 bg-[#4600f2]/[0.02] p-4">
              <SectionHeader
                title="Call transfer details"
                description="So Vini routes calls only when this employee is available."
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      'text-sm font-medium leading-5',
                      showError('designation')
                        ? 'text-[#c31812]'
                        : 'text-[rgba(0,0,0,0.6)]'
                    )}
                  >
                    Designation <span className="text-[#c31812]">*</span>
                  </span>
                  <CIDropdown
                    selectedValues={designationSelection}
                    options={DESIGNATION_OPTIONS}
                    onChange={handleDesignationChange}
                    placeholder="Select a designation"
                    variant="default"
                    showCheckmark
                    isMultiSelect={false}
                    allowDeselection={false}
                  />
                  {isOtherDesignation && (
                    <input
                      type="text"
                      value={form.designation}
                      onChange={(e) => setField('designation', e.target.value)}
                      onBlur={() => touch('designation')}
                      placeholder="Enter designation..."
                      className={cn(
                        INPUT_CLASS,
                        showError('designation') &&
                          'border-[#c31812] focus:border-[#c31812]'
                      )}
                    />
                  )}
                  {showError('designation') && (
                    <ErrorMessage message={errors.designation!} />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      'text-sm font-medium leading-5',
                      showError('department')
                        ? 'text-[#c31812]'
                        : 'text-[rgba(0,0,0,0.6)]'
                    )}
                  >
                    Department <span className="text-[#c31812]">*</span>
                  </span>
                  <CIDropdown
                    selectedValues={deptSelection}
                    options={departmentOptions}
                    onChange={handleDeptChange}
                    placeholder={departmentPlaceholder}
                    variant="default"
                    showCheckmark
                    isMultiSelect={false}
                    allowDeselection={false}
                  />
                  {showError('department') && (
                    <ErrorMessage message={errors.department!} />
                  )}
                </div>
              </div>

              <AvailabilityFields
                value={form.availability}
                onChange={handleAvailabilityChange}
                error={touched.availability ? errors.availability : undefined}
                department={selectedDepartment}
                inheritedFromName={
                  form.department ? `${form.department} department` : undefined
                }
              />
            </div>
          )}

          {/* Conditional — Dashboard access details */}
          {form.canAccessDashboard && (
            <div className="flex flex-col gap-4 rounded-xl border border-dashed border-[#4600f2]/30 bg-[#4600f2]/[0.02] p-4">
              <SectionHeader
                title="Dashboard access"
                description="Required to sign in to the Spyne console."
              />

              <div className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    'text-sm font-medium leading-5',
                    showError('dashboardRole')
                      ? 'text-[#c31812]'
                      : 'text-[rgba(0,0,0,0.6)]'
                  )}
                >
                  Dashboard Role <span className="text-[#c31812]">*</span>
                </span>
                <CIDropdown
                  selectedValues={dashboardRoleSelection}
                  options={DASHBOARD_ROLE_OPTIONS}
                  onChange={handleDashboardRoleChange}
                  placeholder="Pick a role"
                  variant="default"
                  showCheckmark
                  isMultiSelect={false}
                  allowDeselection={false}
                />
                {showError('dashboardRole') && (
                  <ErrorMessage message={errors.dashboardRole!} />
                )}
              </div>
            </div>
          )}

          <CommunicationPreferencesFields
            email={form.email}
            value={form.communicationPreferences}
            onChange={(next) => setField('communicationPreferences', next)}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <CiButton variant="secondary" onClick={onClose} size="medium">
            Cancel
          </CiButton>
          <CiButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            size="medium"
          >
            Save Changes
          </CiButton>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EMAIL_CATEGORIES: {
  key: 'callSummaries' | 'missedCalls' | 'dailyDigest';
  title: string;
  description: string;
}[] = [
  {
    key: 'callSummaries',
    title: 'Call summaries',
    description:
      'After every call, a recap with intent, sentiment, and next steps.',
  },
  {
    key: 'missedCalls',
    title: 'Missed calls',
    description:
      'Instant alert when Vini missed a call that should reach this employee.',
  },
  {
    key: 'dailyDigest',
    title: 'Daily digest',
    description: "Morning summary of yesterday's activity and follow-ups.",
  },
];

const CommunicationPreferencesFields = ({
  email,
  value,
  onChange,
}: {
  email: string;
  value: CommunicationPreferences;
  onChange: (next: CommunicationPreferences) => void;
}) => {
  const emailEnabled = value.email.enabled;

  const updateEmail = (patch: Partial<CommunicationPreferences['email']>) =>
    onChange({ ...value, email: { ...value.email, ...patch } });

  const handleMasterToggle = (next: boolean) => {
    if (next) {
      updateEmail({ enabled: true });
    } else {
      onChange({
        ...value,
        email: { ...EMPTY_COMMUNICATION_PREFERENCES.email },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-black/15 bg-white p-4">
      <SectionHeader
        title="Communication preferences"
        description="What this employee receives by email."
      />

      <ToggleRow
        title="Email notifications"
        description={
          email ? `Send to ${email}` : 'Add an email above to enable.'
        }
        enabled={emailEnabled}
        onChange={handleMasterToggle}
        disabled={!email}
      />

      <div
        className={cn(
          'flex flex-col gap-2 rounded-xl border border-black/10 p-3 transition-opacity',
          !emailEnabled && 'opacity-50'
        )}
      >
        <div className="flex items-center gap-2 pb-1">
          <MdOutlineEmail className="h-4 w-4 text-[#4600f2]" />
          <span className="text-sm font-semibold text-neutral-950">
            What to send
          </span>
        </div>
        {EMAIL_CATEGORIES.map((category) => (
          <label
            key={category.key}
            className={cn(
              'flex items-start gap-3 rounded-lg px-2 py-2 transition-colors',
              emailEnabled
                ? 'cursor-pointer hover:bg-gray-50'
                : 'cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#4600f2] focus:ring-[#4600f2] disabled:opacity-50"
              checked={value.email[category.key]}
              disabled={!emailEnabled}
              onChange={(e) =>
                updateEmail({ [category.key]: e.target.checked } as Partial<
                  CommunicationPreferences['email']
                >)
              }
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-950">
                {category.title}
              </span>
              <span className="text-xs text-gray-500">
                {category.description}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
