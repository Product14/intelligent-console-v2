import { Button, Checkbox, SelectDropdown } from '@spyne-console/design-system';

import React, { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiEdit2, FiUserPlus } from 'react-icons/fi';
import PhoneInput from 'react-phone-input-2';

import { Cross } from '@spyne-console/design-system/icons';
import InputField from '@spyne-console/design-system/input-field';
import ModalWrapper from '@spyne-console/design-system/modal/modal-wrapper';

import OnboardingStartButton from '../buttons/onboarding-start-button';
import LearnMoreModal from './modals/learn-more-modal';
import type {
  CommunicationPreference,
  InviteUserRequest,
  User,
  UserRole,
} from './types';
import { defaultCommunicationPreference } from './types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: InviteUserRequest) => Promise<void>;
  isLoading?: boolean;
  mode?: 'invite' | 'edit';
  initialData?: User | null;
  error?: string | null;
  onClearError?: () => void;
  showDepartment?: boolean;
}

// Role options
const roleOptions = [
  { value: 'TEAM_STANDARD', text: 'Member', disabled: false },
  { value: 'TEAM_ADMIN', text: 'Admin', disabled: false },
  { value: 'ENTERPRISE_OWNER', text: 'Enterprise Owner', disabled: true },
];

// Designation options (based on mock data and common roles)
const OTHERS_DESIGNATION_VALUE = '__others__';
const designationOptions = [
  { value: 'Head of Business', text: 'Head of Business' },
  { value: 'Senior Manager', text: 'Senior Manager' },
  { value: 'Team Lead', text: 'Team Lead' },
  { value: 'Photographer', text: 'Photographer' },
  { value: 'Content Creator', text: 'Content Creator' },
  { value: 'Data Analyst', text: 'Data Analyst' },
  { value: 'Manager', text: 'Manager' },
  { value: 'Executive', text: 'Executive' },
  { value: 'Sales Manager', text: 'Sales Manager' },
  { value: 'Service Manager', text: 'Service Manager' },
  { value: 'General Manager', text: 'General Manager' },
  { value: OTHERS_DESIGNATION_VALUE, text: 'Others' },
];

/** Check if a designation value is a predefined option (not "Others") */
const isPredefinedDesignation = (value: string) =>
  designationOptions.some(
    (opt) => opt.value === value && opt.value !== OTHERS_DESIGNATION_VALUE
  );

// Custom label component for form fields
interface CustomLabelProps {
  label: string;
  required?: boolean;
  showLearnMore?: boolean;
  onLearnMoreClick?: () => void;
}

const CustomLabel: React.FC<CustomLabelProps> = ({
  label,
  required = false,
  showLearnMore = false,
  onLearnMoreClick,
}) => {
  return (
    <div className="flex items-center justify-between pt-2 text-sm font-medium leading-5 text-black/60">
      <span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {showLearnMore && (
        <p className="mt-1 text-xs text-gray-500">
          What does this mean?{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onLearnMoreClick?.();
            }}
            className="cursor-pointer text-purple-600 hover:underline"
          >
            Learn more
          </button>
        </p>
      )}
    </div>
  );
};

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  mode = 'invite',
  initialData = null,
  error = null,
  onClearError,
  showDepartment,
}) => {
  const isEditMode = mode === 'edit';

  const getInitialFormData = (): Partial<InviteUserRequest> => {
    if (isEditMode && initialData) {
      // Combine ISD code with contact number for display in PhoneInput
      const isdCode = initialData.isdCode ?? '';
      const contactNo = initialData.contactNumber ?? '';
      const sanitizedIsdCode = isdCode.replace('+', '');
      const combinedContactNumber =
        isdCode && contactNo ? sanitizedIsdCode + contactNo : contactNo;

      return {
        email: initialData.email ?? '',
        name: initialData.name ?? '',
        contactNumber: combinedContactNumber,
        isdCode: isdCode,
        role: initialData.role ?? 'TEAM_STANDARD',
        designation: initialData.designation ?? '',
        communicationPreference:
          initialData.communicationPreference ?? defaultCommunicationPreference,
      };
    }
    return {
      email: '',
      name: '',
      contactNumber: '',
      isdCode: '',
      role: 'TEAM_STANDARD',
      designation: '',
      communicationPreference: defaultCommunicationPreference,
    };
  };

  const getInitialCommunicationPrefs = (): CommunicationPreference => {
    if (isEditMode && initialData?.communicationPreference) {
      // Ensure all nested properties exist with defaults
      return {
        studioCommunication: {
          emailPreferences: {
            daily:
              initialData.communicationPreference?.studioCommunication
                ?.emailPreferences?.daily ?? false,
            weekly:
              initialData.communicationPreference?.studioCommunication
                ?.emailPreferences?.weekly ?? false,
            everyTwoWeeks:
              initialData.communicationPreference?.studioCommunication
                ?.emailPreferences?.everyTwoWeeks ?? false,
          },
        },
        viniCommunication: {
          emailPreferences:
            initialData.communicationPreference?.viniCommunication
              ?.emailPreferences ?? false,
          smsPreferences:
            initialData.communicationPreference?.viniCommunication
              ?.smsPreferences ?? false,
          department:
            initialData.communicationPreference?.viniCommunication
              ?.department ?? [],
        },
      };
    }
    return defaultCommunicationPreference;
  };

  const [formData, setFormData] =
    useState<Partial<InviteUserRequest>>(getInitialFormData());
  const [communicationPrefs, setCommunicationPrefs] =
    useState<CommunicationPreference>(getInitialCommunicationPrefs());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  // Track whether the user selected "Others" and is typing a custom designation
  // When opening with a custom designation from initialData, keep this false so the
  // dropdown is shown with the custom value visible and selected.
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);

  // Reset form and clear errors when modal opens with new data (especially for edit mode)
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setCommunicationPrefs(getInitialCommunicationPrefs());
      setErrors({});
      onClearError?.();
      // Always start with dropdown view; custom values will appear as a
      // selectable option in the dropdown via availableDesignationOptions.
      setIsCustomDesignation(false);
    }
  }, [isOpen, initialData, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const isdCode = formData.isdCode || '';
      const contactNo = formData.contactNumber || '';
      const sanitizedIsdCode = isdCode.replace('+', '');
      const sanitizedContactNo =
        isdCode && contactNo.startsWith(sanitizedIsdCode)
          ? contactNo.slice(sanitizedIsdCode.length)
          : contactNo;

      const userData: InviteUserRequest = {
        email: formData.email!,
        name: formData.name!,
        contactNumber: sanitizedContactNo,
        isdCode: isdCode,
        role: formData.role as UserRole,
        designation: formData.designation!,
        communicationPreference: communicationPrefs,
      };
      await onSave(userData);
      // Reset form on success
      setFormData({
        email: '',
        name: '',
        contactNumber: '',
        isdCode: '',
        role: 'TEAM_STANDARD',
        designation: '',
        communicationPreference: defaultCommunicationPreference,
      });
      setCommunicationPrefs(defaultCommunicationPreference);
      setIsCustomDesignation(false);
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error saving user:', error);
    }
  };
  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: '',
        name: '',
        contactNumber: '',
        isdCode: '',
        role: 'TEAM_STANDARD',
        designation: '',
        communicationPreference: defaultCommunicationPreference,
      });
      setCommunicationPrefs(defaultCommunicationPreference);
      setIsCustomDesignation(false);
      setErrors({});
      onClose();
    }
  };
  // Filter out ENTERPRISE_OWNER from options if current role is not ENTERPRISE_OWNER
  // This prevents users from selecting it, but allows it to be displayed if already selected
  const availableRoleOptions = useMemo(() => {
    if (formData.role === 'ENTERPRISE_OWNER') {
      // If ENTERPRISE_OWNER is selected, include it so it can be displayed
      return roleOptions;
    }
    // Otherwise, exclude ENTERPRISE_OWNER from selectable options
    return roleOptions.filter((opt) => opt.value !== 'ENTERPRISE_OWNER');
  }, [formData.role]);

  const selectedRole =
    roleOptions.find((opt) => opt.value === formData.role) ?? null;
  // Build designation options: include custom value if it exists and isn't predefined
  const availableDesignationOptions = useMemo(() => {
    const customValue = formData.designation?.trim();
    if (customValue && !isPredefinedDesignation(customValue)) {
      // Insert the custom value before "Others" so the user can see & re-select it
      const optionsWithoutOthers = designationOptions.filter(
        (opt) => opt.value !== OTHERS_DESIGNATION_VALUE
      );
      return [
        ...optionsWithoutOthers,
        { value: customValue, text: `${customValue} (custom)` },
        { value: OTHERS_DESIGNATION_VALUE, text: 'Others' },
      ];
    }
    return designationOptions;
  }, [formData.designation]);

  const selectedDesignation = isCustomDesignation
    ? null
    : (availableDesignationOptions.find(
        (opt) => opt.value === formData.designation
      ) ?? null);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[600px]"
      allowClose={!isLoading}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-[40px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
              <span className="material-icons text-2xl text-violet-800">
                {isEditMode ? <FiEdit2 /> : <FiUserPlus />}
              </span>
            </div>
            <div>
              <h1 className="font-['Inter'] text-lg font-semibold leading-7 text-black/90">
                {isEditMode ? 'Edit User' : 'Invite User'}
              </h1>
              <p className="mt-2 font-['Inter'] text-sm font-normal leading-5 text-black/60">
                {isEditMode
                  ? 'Update user details'
                  : 'Add new users to your rooftop'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-700">{error}</span>
            </div>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                className="text-red-500 hover:text-red-700"
              >
                <Cross width={16} height={16} className="text-red-500" />
              </button>
            )}
          </div>
        )}

        {/* Form Content */}
        <div className="max-h-[calc(100vh-300px)] space-y-4 overflow-y-auto pr-2">
          <div className="mb-4 grid grid-cols-2 gap-8">
            {/* Email Address */}
            <div>
              <CustomLabel label="Email Address" required />
              <InputField
                id="email"
                required
                value={formData.email ?? ''}
                onChange={(value: string | null) => {
                  if (!isEditMode) {
                    setFormData({ ...formData, email: value ?? '' });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }
                }}
                placeholder="Enter email address"
                floatingLabel={false}
                disabled={isEditMode}
                // @ts-ignore - error prop exists but not in type definition
                error={errors.email}
                className={isEditMode ? 'cursor-not-allowed bg-gray-100' : ''}
              />
            </div>

            {/* Name */}
            <div>
              <CustomLabel label="Name" required />
              <InputField
                id="name"
                value={formData.name ?? ''}
                onChange={(value: string | null) => {
                  setFormData({ ...formData, name: value ?? '' });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter name"
                required
                floatingLabel={false}
                // @ts-ignore - error prop exists but not in type definition
                error={errors.name}
                className="text-black"
              />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-8">
            {/* Phone Number */}
            <div className="flex flex-col gap-[3px]">
              <CustomLabel label="Phone Number" />
              <PhoneInput
                specialLabel=""
                value={String(formData.contactNumber ?? '')}
                containerClass="rooftop-phone-input"
                enableSearch
                country={'us'}
                placeholder="Enter phone number"
                onChange={(phone, data: { dialCode?: string } | null) => {
                  const safePhone = String(phone ?? '');
                  const dialCode = data?.dialCode || '';
                  setFormData({
                    ...formData,
                    contactNumber: safePhone,
                    isdCode: dialCode ? `+${dialCode}` : '',
                  });
                }}
              />
            </div>

            {/* Role */}
            <div>
              <CustomLabel
                label="Role"
                required
                showLearnMore={true}
                onLearnMoreClick={() => setShowLearnMoreModal(true)}
              />
              <SelectDropdown
                id="role"
                placeholder="Select role"
                options={availableRoleOptions}
                selectedOption={selectedRole as any}
                disabled={formData.role === 'ENTERPRISE_OWNER'}
                onChange={
                  ((
                    option:
                      | { text: string; value: string; disabled?: boolean }
                      | null
                      | undefined
                  ) => {
                    // Prevent selecting disabled options
                    if (option?.disabled) {
                      return;
                    }
                    // Safety check: Prevent changing to ENTERPRISE_OWNER if not already selected
                    if (
                      option?.value === 'ENTERPRISE_OWNER' &&
                      formData.role !== 'ENTERPRISE_OWNER'
                    ) {
                      return; // Don't allow changing to ENTERPRISE_OWNER
                    }
                    setFormData({
                      ...formData,
                      role: (option?.value as UserRole) ?? 'TEAM_STANDARD',
                    });
                    if (errors.role) setErrors({ ...errors, role: '' });
                  }) as any
                }
                required
                error={errors.role}
                className="pt-[3px]"
                scrollIntoView={false}
              />
            </div>
          </div>

          {/* Designation */}
          <div>
            <CustomLabel label="Designation" required />
            {isCustomDesignation ? (
              <div className="relative flex items-center pt-[3px]">
                <InputField
                  id="custom-designation"
                  value={formData.designation ?? ''}
                  onChange={(value: string | null) => {
                    const sanitized = (value ?? '').replaceAll(
                      /[^a-zA-Z\s]/g,
                      ''
                    );
                    setFormData({
                      ...formData,
                      designation: sanitized,
                    });
                    if (errors.designation)
                      setErrors({ ...errors, designation: '' });
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    // Allow control keys (Backspace, Tab, Arrow keys, etc.)
                    if (e.key.length > 1 || e.ctrlKey || e.metaKey) return;
                    // Only allow alphabets and spaces
                    if (!/^[a-zA-Z\s]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter your designation"
                  required
                  floatingLabel={false}
                  // @ts-ignore - error prop exists but not in type definition
                  error={errors.designation}
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDesignation(false);
                  }}
                  className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/3 items-center justify-center rounded-full text-black/40 hover:bg-gray-100 hover:text-black/70"
                  title="Back to list"
                >
                  <Cross width={14} height={14} className="text-black/40" />
                </button>
              </div>
            ) : (
              <SelectDropdown
                id="designation"
                placeholder="Select designation"
                options={availableDesignationOptions}
                selectedOption={selectedDesignation as any}
                onChange={
                  ((
                    option: { text: string; value: string } | null | undefined
                  ) => {
                    if (option?.value === OTHERS_DESIGNATION_VALUE) {
                      // "Others" clicked — open input with blank value
                      setIsCustomDesignation(true);
                      setFormData({ ...formData, designation: '' });
                    } else if (
                      option?.value &&
                      !isPredefinedDesignation(option.value)
                    ) {
                      // Custom value re-selected — open input with that value
                      setIsCustomDesignation(true);
                      setFormData({
                        ...formData,
                        designation: option.value,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        designation: option?.value ?? '',
                      });
                    }
                    if (errors.designation)
                      setErrors({ ...errors, designation: '' });
                  }) as any
                }
                required
                error={errors.designation}
                className="pt-[3px]"
                dropdownDrawerClassName="w-full"
                scrollIntoView={false}
              />
            )}
          </div>

          {showDepartment && (
            <div className="w-full">
              <CustomLabel label="Department" />
              <div className="flex w-full items-center justify-between gap-2">
                {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
                <Checkbox
                  id="vini-sales-department"
                  name="vini-sales-department"
                  label="Sales Department"
                  isChecked={
                    communicationPrefs?.viniCommunication?.department?.includes(
                      'sales'
                    ) ?? false
                  }
                  value={
                    communicationPrefs?.viniCommunication?.department?.includes(
                      'sales'
                    ) ?? false
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const currentDepartments =
                      communicationPrefs?.viniCommunication?.department ?? [];
                    const newDepartments = e.target.checked
                      ? [...currentDepartments, 'sales']
                      : currentDepartments.filter((dept) => dept !== 'sales');

                    setCommunicationPrefs({
                      ...communicationPrefs,
                      viniCommunication: {
                        ...communicationPrefs?.viniCommunication,
                        department: newDepartments,
                      },
                    });
                  }}
                />
                {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
                <Checkbox
                  id="vini-service-department"
                  name="vini-service-department"
                  label="Service Department"
                  isChecked={
                    communicationPrefs?.viniCommunication?.department?.includes(
                      'service'
                    ) ?? false
                  }
                  value={
                    communicationPrefs?.viniCommunication?.department?.includes(
                      'service'
                    ) ?? false
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const currentDepartments =
                      communicationPrefs?.viniCommunication?.department ?? [];
                    const newDepartments = e.target.checked
                      ? [...currentDepartments, 'service']
                      : currentDepartments.filter((dept) => dept !== 'service');

                    setCommunicationPrefs({
                      ...communicationPrefs,
                      viniCommunication: {
                        ...communicationPrefs?.viniCommunication,
                        department: newDepartments,
                      },
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* Studio Communication Section */}
          <div className="pt-4">
            <h3 className="mb-3 font-['Inter'] text-lg font-semibold leading-6 text-black/80">
              Studio Communication
            </h3>

            {/* Studio Email Preferences - Parent checkbox controls all children */}
            <div className="mb-3">
              {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
              <Checkbox
                id="studio-email-preferences"
                name="studio-email-preferences"
                label="Email Preferences"
                isChecked={
                  (communicationPrefs?.studioCommunication?.emailPreferences
                    ?.daily ??
                    false) ||
                  (communicationPrefs?.studioCommunication?.emailPreferences
                    ?.weekly ??
                    false) ||
                  (communicationPrefs?.studioCommunication?.emailPreferences
                    ?.everyTwoWeeks ??
                    false)
                }
                value={
                  (communicationPrefs?.studioCommunication?.emailPreferences
                    ?.daily ??
                    false) ||
                  (communicationPrefs?.studioCommunication?.emailPreferences
                    ?.weekly ??
                    false) ||
                  (communicationPrefs?.studioCommunication?.emailPreferences
                    ?.everyTwoWeeks ??
                    false)
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const checked = e.target.checked;
                  setCommunicationPrefs({
                    ...communicationPrefs,
                    studioCommunication: {
                      emailPreferences: {
                        daily: checked,
                        weekly: checked,
                        everyTwoWeeks: checked,
                      },
                    },
                  });
                }}
              />
            </div>

            {/* Studio Nested Email Preference Options */}
            <div className="ml-6 space-y-2 rounded-lg bg-gray-50 p-3">
              {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
              <Checkbox
                id="studio-daily"
                name="studio-daily"
                label="Daily"
                isChecked={
                  communicationPrefs?.studioCommunication?.emailPreferences
                    ?.daily ?? false
                }
                value={
                  communicationPrefs?.studioCommunication?.emailPreferences
                    ?.daily ?? false
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCommunicationPrefs({
                    ...communicationPrefs,
                    studioCommunication: {
                      emailPreferences: {
                        daily: e.target.checked,
                        weekly:
                          communicationPrefs?.studioCommunication
                            ?.emailPreferences?.weekly ?? false,
                        everyTwoWeeks:
                          communicationPrefs?.studioCommunication
                            ?.emailPreferences?.everyTwoWeeks ?? false,
                      },
                    },
                  })
                }
                labelStyles="text-sm text-gray-700"
              />
              <p className="-mt-2 mb-2 ml-7 text-xs text-gray-500">
                Receive daily summary emails
              </p>

              {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
              <Checkbox
                id="studio-weekly"
                name="studio-weekly"
                label="Weekly"
                isChecked={
                  communicationPrefs?.studioCommunication?.emailPreferences
                    ?.weekly ?? false
                }
                value={
                  communicationPrefs?.studioCommunication?.emailPreferences
                    ?.weekly ?? false
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCommunicationPrefs({
                    ...communicationPrefs,
                    studioCommunication: {
                      emailPreferences: {
                        daily:
                          communicationPrefs?.studioCommunication
                            ?.emailPreferences?.daily ?? false,
                        weekly: e.target.checked,
                        everyTwoWeeks:
                          communicationPrefs?.studioCommunication
                            ?.emailPreferences?.everyTwoWeeks ?? false,
                      },
                    },
                  })
                }
                labelStyles="text-sm text-gray-700"
              />
              <p className="-mt-2 mb-2 ml-7 text-xs text-gray-500">
                Receive emails after calls
              </p>

              {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
              <Checkbox
                id="studio-every-two-weeks"
                name="studio-every-two-weeks"
                label="Every two weeks"
                isChecked={
                  communicationPrefs?.studioCommunication?.emailPreferences
                    ?.everyTwoWeeks ?? false
                }
                value={
                  communicationPrefs?.studioCommunication?.emailPreferences
                    ?.everyTwoWeeks ?? false
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCommunicationPrefs({
                    ...communicationPrefs,
                    studioCommunication: {
                      emailPreferences: {
                        daily:
                          communicationPrefs?.studioCommunication
                            ?.emailPreferences?.daily ?? false,
                        weekly:
                          communicationPrefs?.studioCommunication
                            ?.emailPreferences?.weekly ?? false,
                        everyTwoWeeks: e.target.checked,
                      },
                    },
                  })
                }
                labelStyles="text-sm text-gray-700"
              />
              <p className="-mt-2 ml-7 text-xs text-gray-500">
                Receive campaign related emails
              </p>
            </div>
          </div>

          {/* Vini Communication Section */}
          <div className="pt-4">
            <h3 className="mb-3 font-['Inter'] text-lg font-semibold leading-6 text-black/80">
              Vini Communication
            </h3>

            {/* Vini Email Preferences - Simple boolean toggle */}
            <div className="mb-3">
              {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
              <Checkbox
                id="vini-email-preferences"
                name="vini-email-preferences"
                label="Email Preferences"
                isChecked={
                  communicationPrefs?.viniCommunication?.emailPreferences ??
                  false
                }
                value={
                  communicationPrefs?.viniCommunication?.emailPreferences ??
                  false
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCommunicationPrefs({
                    ...communicationPrefs,
                    viniCommunication: {
                      emailPreferences: e.target.checked,
                      smsPreferences:
                        communicationPrefs?.viniCommunication?.smsPreferences ??
                        false,
                      department:
                        communicationPrefs?.viniCommunication?.department ?? [],
                    },
                  });
                }}
              />
            </div>

            {/* Vini Email Info - shown when email preferences enabled */}
            {/* {communicationPrefs.viniCommunication.emailPreferences && ( */}
            <div className="ml-6 space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-700">Daily</span>
              </div>
              <p className="ml-4 text-xs text-gray-500">
                Receive daily summary emails
              </p>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Post Call
                </span>
              </div>
              <p className="ml-4 text-xs text-gray-500">
                Receive emails after calls
              </p>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Campaign
                </span>
              </div>
              <p className="ml-4 text-xs text-gray-500">
                Receive campaign related emails
              </p>
            </div>
            {/* )} */}

            {/* Vini SMS Preferences - Simple boolean toggle */}
            <div className="mb-3 mt-4">
              {/* @ts-ignore - Checkbox types require isChecked and name but value works */}
              <Checkbox
                id="vini-sms-preferences"
                name="vini-sms-preferences"
                label="SMS Preferences"
                isChecked={
                  communicationPrefs?.viniCommunication?.smsPreferences ?? false
                }
                value={
                  communicationPrefs?.viniCommunication?.smsPreferences ?? false
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCommunicationPrefs({
                    ...communicationPrefs,
                    viniCommunication: {
                      emailPreferences:
                        communicationPrefs?.viniCommunication
                          ?.emailPreferences ?? false,
                      smsPreferences: e.target.checked,
                      department:
                        communicationPrefs?.viniCommunication?.department ?? [],
                    },
                  });
                }}
              />
            </div>

            {/* Vini SMS Info - shown when sms preferences enabled */}
            {/* {communicationPrefs.viniCommunication.smsPreferences && ( */}
            <div className="ml-6 space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Post Call
                </span>
              </div>
              <p className="ml-4 text-xs text-gray-500">
                Receive SMS after calls
              </p>
            </div>
            {/* )} */}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex w-full items-center justify-between gap-3 pt-8">
          <Button
            label="Cancel"
            type="bordered"
            onClick={handleClose}
            disabled={isLoading}
            className="h-[52px] w-full min-w-[100px]"
            icon={undefined}
            iconUrl={undefined}
          />
          <OnboardingStartButton
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full min-w-[100px]"
            buttonClassName="w-full min-w-[100px] h-[52px] flex justify-center items-center"
            showIcon={false}
          >
            {(() => {
              if (isLoading) return isEditMode ? 'Saving...' : 'Adding...';
              return isEditMode ? 'Save' : 'Add User';
            })()}
          </OnboardingStartButton>
        </div>
      </div>

      {/* Learn More Modal */}
      <LearnMoreModal
        isOpen={showLearnMoreModal}
        onClose={() => setShowLearnMoreModal(false)}
      />
    </ModalWrapper>
  );
};

export default InviteUserModal;
