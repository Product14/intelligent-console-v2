import CIDropdown from '@/internal-design-system-settings/dropdown/ci-dropdown';
import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IoWarning } from 'react-icons/io5';
// @ts-ignore - PhoneInput library doesn't have types
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// @ts-ignore
import { cn } from '@spyne-console/utils/cn';

import {
  BUSINESS_INDUSTRIES,
  BUSINESS_TYPES,
} from '@/helpers-settings/cnam-config-builder';

import BusinessDetailsReadonly from './business-details-readonly';

const INPUT_CLASS =
  'w-full h-[38px] rounded-lg border border-[rgba(0,0,0,0.2)] bg-white px-3 py-2.5 text-sm font-medium leading-6 text-[rgba(0,0,0,0.8)] focus:border-[#4600f2] focus:outline-none focus-visible:outline-none';

const BUSINESS_TYPE_OPTIONS: CIDropdownMenuOption[] = BUSINESS_TYPES.map(
  (type) => ({
    label: type.label,
    value: type.value,
  })
);

const BUSINESS_INDUSTRY_OPTIONS: CIDropdownMenuOption[] =
  BUSINESS_INDUSTRIES.map((industry) => ({
    label: industry.label,
    value: industry.value,
  }));

const POSITION_OPTIONS: CIDropdownMenuOption[] = [
  { label: 'Director', value: 'Director' },
  { label: 'GM', value: 'GM' },
  { label: 'VP', value: 'VP' },
  { label: 'CEO', value: 'CEO' },
  { label: 'CFO', value: 'CFO' },
  { label: 'General Counsel', value: 'General Counsel' },
  { label: 'Other', value: 'Other' },
];

export interface BusinessDetailsFormData {
  legalBusinessName: string;
  callerIdDisplayName: string;
  businessType: string;
  businessIndustry: string;
  employerIdentificationNumber: string;
  representatives: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    title: string;
    position: string;
  }[];
}

interface BusinessDetailsProps {
  onFormChange?: (data: BusinessDetailsFormData) => void;
  onErrorsChange?: (data: {
    errors: Record<string, string>;
    hasErrors: boolean;
    isValid: boolean;
  }) => void;
  isReadonly?: boolean;
  isFetching?: boolean;
  initialData?: BusinessDetailsFormData;
  status?: string;
}

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

// Validation functions
const validateLegalBusinessName = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Legal Business Name is required';
  }
  if (value.trim().length < 2) {
    return 'Legal Business Name must be at least 2 characters';
  }
  if (value.length > 255) {
    return 'Legal Business Name must not exceed 255 characters';
  }
  return '';
};

const validateCallerIdDisplayName = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Caller ID Display Name is required';
  }
  if (value.length > 15) {
    return 'Caller ID Display Name must not exceed 15 characters';
  }
  return '';
};

const validateBusinessType = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Business Type is required';
  }
  if (value.length > 255) {
    return 'Business Type must not exceed 255 characters';
  }
  return '';
};

const validateBusinessIndustry = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Business Industry is required';
  }
  if (value.length > 255) {
    return 'Business Industry must not exceed 255 characters';
  }
  return '';
};

const validateEIN = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Employer Identification Number (EIN) is required';
  }
  if (value.length > 100) {
    return 'EIN must not exceed 100 characters';
  }
  return '';
};

const validateEmail = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Please enter a valid email address';
  }
  if (value.length > 255) {
    return 'Email must not exceed 255 characters';
  }
  return '';
};

const validatePhone = (value: string): string => {
  if (!value || value.trim() === '') {
    return 'Phone number is required';
  }
  // Basic validation - phone should have at least 10 digits (excluding country code)
  const phoneDigits = value.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return 'Please enter a valid phone number';
  }
  return '';
};

const validateRequired = (value: string, fieldName: string): string => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

const validateRequiredWithMaxLength = (
  value: string,
  fieldName: string,
  maxLength: number = 255
): string => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return '';
};

const BusinessDetails = forwardRef<
  {
    showAllErrors: () => void;
    scrollToError: () => void;
  },
  BusinessDetailsProps
>(
  (
    {
      onFormChange,
      onErrorsChange,
      isReadonly = false,
      isFetching = false,
      initialData,
      status,
    }: BusinessDetailsProps,
    ref
  ) => {
    const [isLoadingConfig] = useState(false);
    const [businessDetails, setBusinessDetails] = useState({
      legalBusinessName: '',
      callerIdDisplayName: '',
      businessType: '',
      businessIndustry: '',
      employerIdentificationNumber: '',
    });
    const [businessTypeSelection, setBusinessTypeSelection] = useState<
      CIDropdownMenuOption[]
    >([]);
    const [businessIndustrySelection, setBusinessIndustrySelection] = useState<
      CIDropdownMenuOption[]
    >([]);
    const [representatives, setRepresentatives] = useState<
      {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        title: string;
        position: string;
      }[]
    >([
      {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        title: '',
        position: '',
      },
      {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        title: '',
        position: '',
      },
    ]);
    const [positionSelections, setPositionSelections] = useState<
      CIDropdownMenuOption[][]
    >(() => representatives.map(() => []));

    // Error state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Touched fields state
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
      {}
    );

    // Keep latest callbacks in refs so effects don't need them as dependencies
    const onFormChangeRef = useRef(onFormChange);
    onFormChangeRef.current = onFormChange;
    const onErrorsChangeRef = useRef(onErrorsChange);
    onErrorsChangeRef.current = onErrorsChange;

    // Pre-fill form state when initialData is provided (e.g. from a fetched CNAM profile)
    useEffect(() => {
      if (!initialData) return;

      setBusinessDetails({
        legalBusinessName: initialData.legalBusinessName,
        callerIdDisplayName: initialData.callerIdDisplayName,
        businessType: initialData.businessType,
        businessIndustry: initialData.businessIndustry,
        employerIdentificationNumber: initialData.employerIdentificationNumber,
      });

      const typeOption = BUSINESS_TYPE_OPTIONS.find(
        (o) => o.value === initialData.businessType
      );
      setBusinessTypeSelection(typeOption ? [typeOption] : []);

      const industryOption = BUSINESS_INDUSTRY_OPTIONS.find(
        (o) => o.value === initialData.businessIndustry
      );
      setBusinessIndustrySelection(industryOption ? [industryOption] : []);

      if (initialData.representatives?.length) {
        setRepresentatives(initialData.representatives);
        setPositionSelections(
          initialData.representatives.map((rep) => {
            const posOption = POSITION_OPTIONS.find(
              (o) =>
                o.value.toString().toLowerCase() === rep.position?.toLowerCase()
            );
            return posOption ? [posOption] : [];
          })
        );
      }
    }, [initialData]);

    // Refs for scrolling to errors
    const legalBusinessNameRef = useRef<HTMLDivElement>(null);
    const callerIdDisplayNameRef = useRef<HTMLDivElement>(null);
    const businessTypeRef = useRef<HTMLDivElement>(null);
    const businessIndustryRef = useRef<HTMLDivElement>(null);
    const einRef = useRef<HTMLDivElement>(null);
    const representativeRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Helper function to validate a single field
    const validateField = (
      fieldName: string,
      value: string,
      index?: number
    ): string => {
      if (fieldName.startsWith('representative.')) {
        // Extract field name from "representative.{index}.{fieldName}"
        const parts = fieldName.split('.');
        const repField = parts[parts.length - 1];
        const repIndex = index ?? (parts.length > 2 ? parseInt(parts[1]) : 0);
        const rep = representatives[repIndex];
        if (!rep) return '';

        switch (repField) {
          case 'firstName':
            return validateRequiredWithMaxLength(value, 'First Name', 255);
          case 'lastName':
            return validateRequiredWithMaxLength(value, 'Last Name', 255);
          case 'email':
            return validateEmail(value);
          case 'phoneNumber':
            return validatePhone(value);
          case 'title':
            return validateRequiredWithMaxLength(value, 'Title', 255);
          case 'position':
            return validateRequiredWithMaxLength(value, 'Position', 255);
          default:
            return '';
        }
      }

      switch (fieldName) {
        case 'legalBusinessName':
          return validateLegalBusinessName(value);
        case 'callerIdDisplayName':
          return validateCallerIdDisplayName(value);
        case 'businessType':
          return validateBusinessType(value);
        case 'businessIndustry':
          return validateBusinessIndustry(value);
        case 'employerIdentificationNumber':
          return validateEIN(value);
        default:
          return '';
      }
    };

    // Helper function to validate all fields
    const validateAllFields = () => {
      const newErrors: Record<string, string> = {};

      // Validate business details
      newErrors.legalBusinessName = validateField(
        'legalBusinessName',
        businessDetails.legalBusinessName
      );
      newErrors.callerIdDisplayName = validateField(
        'callerIdDisplayName',
        businessDetails.callerIdDisplayName
      );
      newErrors.businessType = validateField(
        'businessType',
        businessDetails.businessType
      );
      newErrors.businessIndustry = validateField(
        'businessIndustry',
        businessDetails.businessIndustry
      );
      newErrors.employerIdentificationNumber = validateField(
        'employerIdentificationNumber',
        businessDetails.employerIdentificationNumber
      );

      // Validate representatives
      representatives.forEach((rep, index) => {
        newErrors[`representative.${index}.firstName`] = validateField(
          `representative.${index}.firstName`,
          rep.firstName,
          index
        );
        newErrors[`representative.${index}.lastName`] = validateField(
          `representative.${index}.lastName`,
          rep.lastName,
          index
        );
        newErrors[`representative.${index}.email`] = validateField(
          `representative.${index}.email`,
          rep.email,
          index
        );
        newErrors[`representative.${index}.phoneNumber`] = validateField(
          `representative.${index}.phoneNumber`,
          rep.phoneNumber,
          index
        );
        newErrors[`representative.${index}.title`] = validateField(
          `representative.${index}.title`,
          rep.title,
          index
        );
        newErrors[`representative.${index}.position`] = validateField(
          `representative.${index}.position`,
          rep.position,
          index
        );
      });

      setErrors((prev) => {
        const hasChanged =
          Object.keys(newErrors).some((key) => newErrors[key] !== prev[key]) ||
          Object.keys(prev).some((key) => !(key in newErrors));
        return hasChanged ? newErrors : prev;
      });
    };

    // Expose ref method to mark all fields as touched (for form submission)
    useImperativeHandle(ref, () => ({
      showAllErrors: () => {
        const allTouched: Record<string, boolean> = {
          legalBusinessName: true,
          callerIdDisplayName: true,
          businessType: true,
          businessIndustry: true,
          employerIdentificationNumber: true,
        };

        representatives.forEach((_, index) => {
          allTouched[`representative.${index}.firstName`] = true;
          allTouched[`representative.${index}.lastName`] = true;
          allTouched[`representative.${index}.email`] = true;
          allTouched[`representative.${index}.phoneNumber`] = true;
          allTouched[`representative.${index}.title`] = true;
          allTouched[`representative.${index}.position`] = true;
        });

        setTouchedFields(allTouched);
        validateAllFields();
      },
      scrollToError: () => {
        // Scroll to first error found
        if (errors.legalBusinessName && legalBusinessNameRef.current) {
          legalBusinessNameRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (errors.callerIdDisplayName && callerIdDisplayNameRef.current) {
          callerIdDisplayNameRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (errors.businessType && businessTypeRef.current) {
          businessTypeRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (errors.businessIndustry && businessIndustryRef.current) {
          businessIndustryRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        if (errors.employerIdentificationNumber && einRef.current) {
          einRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          return;
        }
        // Check representative errors
        for (let i = 0; i < representatives.length; i++) {
          const repErrors = [
            `representative.${i}.firstName`,
            `representative.${i}.lastName`,
            `representative.${i}.email`,
            `representative.${i}.phoneNumber`,
            `representative.${i}.title`,
            `representative.${i}.position`,
          ];
          for (const errorKey of repErrors) {
            if (errors[errorKey] && representativeRefs.current[i]) {
              representativeRefs.current[i]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              return;
            }
          }
        }
      },
    }));

    // Validate all fields whenever data changes
    useEffect(() => {
      validateAllFields();
    }, [businessDetails, representatives]);

    // Notify parent of errors changes (use ref so the callback is never a dep)
    useEffect(() => {
      const hasErrors = Object.values(errors).some((error) => error !== '');
      onErrorsChangeRef.current?.({ errors, hasErrors, isValid: !hasErrors });
    }, [errors]);

    useEffect(() => {
      return () => {
        onErrorsChangeRef.current?.({
          errors: {},
          hasErrors: false,
          isValid: true,
        });
      };
    }, []);

    // Notify parent of form data changes (use ref so the callback is never a dep)
    useEffect(() => {
      onFormChangeRef.current?.({ ...businessDetails, representatives });
    }, [businessDetails, representatives]);

    // Handle field change
    const handleFieldChange =
      (field: keyof typeof businessDetails) => (value: string) => {
        setBusinessDetails((prev) => ({
          ...prev,
          [field]: value ?? '',
        }));

        // Validate field on change
        const error = validateField(field, value ?? '');
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      };

    // Handle field blur
    const handleFieldBlur = (field: keyof typeof businessDetails) => () => {
      setTouchedFields((prev) => ({
        ...prev,
        [field]: true,
      }));
      const error = validateField(field, businessDetails[field]);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    };

    const handleDropdownChange = useCallback(
      (field: 'businessType' | 'businessIndustry') =>
        (values: CIDropdownMenuOption[]) => {
          if (field === 'businessType') {
            setBusinessTypeSelection(values);
          } else {
            setBusinessIndustrySelection(values);
          }

          const selectedValue = values[0]?.value?.toString() ?? '';
          setBusinessDetails((prev) => ({
            ...prev,
            [field]: selectedValue,
          }));

          setTouchedFields((prev) => ({
            ...prev,
            [field]: true,
          }));
          const error = validateField(field, selectedValue);
          setErrors((prev) => ({
            ...prev,
            [field]: error,
          }));
        },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const handleRepresentativeChange = (
      index: number,
      field:
        | 'firstName'
        | 'lastName'
        | 'email'
        | 'phoneNumber'
        | 'title'
        | 'position',
      value: string
    ) => {
      setRepresentatives((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          [field]: value ?? '',
        };
        return next;
      });

      // Validate representative field on change
      const errorKey = `representative.${index}.${field}`;
      const error = validateField(errorKey, value ?? '', index);
      setErrors((prev) => ({
        ...prev,
        [errorKey]: error,
      }));
    };

    const handlePositionChange = useCallback(
      (index: number) => (values: CIDropdownMenuOption[]) => {
        const selectedValue = (values[0]?.value as string) ?? '';
        setPositionSelections((prev) => {
          const next = [...prev];
          next[index] = values;
          return next;
        });
        setRepresentatives((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], position: selectedValue };
          return next;
        });
        const errorKey = `representative.${index}.position`;
        const error = validateField(errorKey, selectedValue, index);
        setErrors((prev) => ({ ...prev, [errorKey]: error }));
        setTouchedFields((prev) => ({ ...prev, [errorKey]: true }));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    // Handle representative field blur
    const handleRepresentativeBlur =
      (
        index: number,
        field:
          | 'firstName'
          | 'lastName'
          | 'email'
          | 'phoneNumber'
          | 'title'
          | 'position'
      ) =>
      () => {
        const errorKey = `representative.${index}.${field}`;
        setTouchedFields((prev) => ({
          ...prev,
          [errorKey]: true,
        }));
        const rep = representatives[index];
        if (rep) {
          const error = validateField(errorKey, rep[field], index);
          setErrors((prev) => ({
            ...prev,
            [errorKey]: error,
          }));
        }
      };

    const positionChangeHandlers = useMemo(
      () => representatives.map((_, index) => handlePositionChange(index)),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [representatives.length, handlePositionChange]
    );

    // Helper to check if error should be shown (never show when readonly)
    const shouldShowError = (fieldName: string): boolean => {
      if (isReadonly) return false;
      return touchedFields[fieldName] === true && !!errors[fieldName];
    };

    if (isReadonly && initialData) {
      return <BusinessDetailsReadonly data={initialData} status={status} />;
    }

    if (isReadonly && isFetching) {
      return (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-blue-700">
            Loading caller ID details...
          </span>
        </div>
      );
    }

    const statusInfo = status ? STATUS_DISPLAY[status] : undefined;

    return (
      <div className="flex w-full flex-col gap-8 rounded-2xl border border-black/10 p-4">
        <div className="flex w-full flex-col gap-4">
          {statusInfo && (
            <div className="flex justify-end">
              <span
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold',
                  statusInfo.className
                )}
              >
                {statusInfo.label}
              </span>
            </div>
          )}
          <div className="flex w-full flex-col gap-4">
            {isFetching ? (
              <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-blue-700">
                  Loading caller ID details...
                </span>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-8">
                <div className="flex w-full flex-col gap-4">
                  <p className="text-sm font-semibold text-[#666]">
                    Category 1 - Profile Details
                  </p>
                  <div className="grid w-full gap-6 md:grid-cols-2">
                    <div
                      ref={legalBusinessNameRef}
                      className="flex flex-col gap-2"
                    >
                      <span
                        className={cn(
                          'text-sm font-medium leading-5',
                          shouldShowError('legalBusinessName')
                            ? 'text-[#c31812]'
                            : 'text-[rgba(0,0,0,0.6)]'
                        )}
                      >
                        Legal Business Name*
                      </span>
                      <input
                        type="text"
                        value={businessDetails.legalBusinessName}
                        onChange={(event) =>
                          handleFieldChange('legalBusinessName')(
                            event.target.value
                          )
                        }
                        onBlur={handleFieldBlur('legalBusinessName')}
                        placeholder="Auto Motors Inc."
                        className={cn(
                          INPUT_CLASS,
                          shouldShowError('legalBusinessName') &&
                            'border-[#c31812] focus:border-[#c31812]'
                        )}
                        maxLength={255}
                      />
                      {shouldShowError('legalBusinessName') && (
                        <div className="flex items-center gap-1">
                          <IoWarning className="h-4 w-4 text-[#c31812]" />
                          <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                            {errors.legalBusinessName}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      ref={callerIdDisplayNameRef}
                      className="flex flex-col gap-2"
                    >
                      <span
                        className={cn(
                          'text-sm font-medium leading-5',
                          shouldShowError('callerIdDisplayName')
                            ? 'text-[#c31812]'
                            : 'text-[rgba(0,0,0,0.6)]'
                        )}
                      >
                        Caller ID Display Name*
                      </span>
                      <input
                        type="text"
                        value={businessDetails.callerIdDisplayName}
                        onChange={(event) =>
                          handleFieldChange('callerIdDisplayName')(
                            event.target.value
                          )
                        }
                        onBlur={handleFieldBlur('callerIdDisplayName')}
                        placeholder="Auto Motors of Texas"
                        className={cn(
                          INPUT_CLASS,
                          shouldShowError('callerIdDisplayName') &&
                            'border-[#c31812] focus:border-[#c31812]'
                        )}
                        maxLength={15}
                      />
                      <span className="text-[10px] font-medium leading-[14px] text-[rgba(0,0,0,0.4)]">
                        Maximum 15 characters allowed
                      </span>
                      {shouldShowError('callerIdDisplayName') && (
                        <div className="flex items-center gap-1">
                          <IoWarning className="h-4 w-4 text-[#c31812]" />
                          <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                            {errors.callerIdDisplayName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4">
                  <p className="text-sm font-semibold text-[#666]">
                    Category 2 - Business Details
                  </p>
                  <div className="grid w-full gap-6 md:grid-cols-2">
                    <div ref={businessTypeRef} className="flex flex-col gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium leading-5',
                          shouldShowError('businessType')
                            ? 'text-[#c31812]'
                            : 'text-[rgba(0,0,0,0.6)]'
                        )}
                      >
                        Business Type*
                      </span>
                      <CIDropdown
                        selectedValues={businessTypeSelection}
                        options={BUSINESS_TYPE_OPTIONS}
                        onChange={handleDropdownChange('businessType')}
                        placeholder="Select Business Type"
                        variant="default"
                        showCheckmark
                        isMultiSelect={false}
                        allowDeselection={false}
                      />
                      {shouldShowError('businessType') && (
                        <div className="flex items-center gap-1">
                          <IoWarning className="h-4 w-4 text-[#c31812]" />
                          <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                            {errors.businessType}
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      ref={businessIndustryRef}
                      className="flex flex-col gap-2"
                    >
                      <span
                        className={cn(
                          'text-sm font-medium leading-5',
                          shouldShowError('businessIndustry')
                            ? 'text-[#c31812]'
                            : 'text-[rgba(0,0,0,0.6)]'
                        )}
                      >
                        Business Industry*
                      </span>
                      <CIDropdown
                        selectedValues={businessIndustrySelection}
                        options={BUSINESS_INDUSTRY_OPTIONS}
                        onChange={handleDropdownChange('businessIndustry')}
                        placeholder="Select Business Industry"
                        variant="default"
                        showCheckmark
                        isMultiSelect={false}
                        allowDeselection={false}
                      />
                      {shouldShowError('businessIndustry') && (
                        <div className="flex items-center gap-1">
                          <IoWarning className="h-4 w-4 text-[#c31812]" />
                          <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                            {errors.businessIndustry}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div ref={einRef} className="flex w-full flex-col gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium leading-5',
                        shouldShowError('employerIdentificationNumber')
                          ? 'text-[#c31812]'
                          : 'text-[rgba(0,0,0,0.6)]'
                      )}
                    >
                      Employer Identification Number (EIN)*
                    </span>
                    <input
                      type="text"
                      value={businessDetails.employerIdentificationNumber}
                      onChange={(event) =>
                        handleFieldChange('employerIdentificationNumber')(
                          event.target.value
                        )
                      }
                      onBlur={handleFieldBlur('employerIdentificationNumber')}
                      placeholder="XX-XXXXXXXX"
                      className={cn(
                        INPUT_CLASS,
                        shouldShowError('employerIdentificationNumber') &&
                          'border-[#c31812] focus:border-[#c31812]'
                      )}
                      maxLength={100}
                    />
                    {shouldShowError('employerIdentificationNumber') && (
                      <div className="flex items-center gap-1">
                        <IoWarning className="h-4 w-4 text-[#c31812]" />
                        <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                          {errors.employerIdentificationNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-4">
                  <p className="text-sm font-semibold text-[#666]">
                    Category 3 - Authorized Representatives
                  </p>
                  <div className="flex w-full flex-col gap-6">
                    {representatives.map((rep, index) => (
                      <div
                        key={index}
                        ref={(el) => {
                          representativeRefs.current[index] = el;
                        }}
                        className="flex w-full flex-col gap-4"
                      >
                        <p className="text-sm font-semibold text-[#666]">
                          {`Representative #${index + 1}`}
                        </p>
                        <div className="flex w-full flex-col gap-4">
                          <div className="grid w-full gap-3 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-5',
                                  shouldShowError(
                                    `representative.${index}.firstName`
                                  )
                                    ? 'text-[#c31812]'
                                    : 'text-[rgba(0,0,0,0.6)]'
                                )}
                              >
                                First Name*
                              </span>
                              <input
                                type="text"
                                value={rep.firstName}
                                onChange={(event) =>
                                  handleRepresentativeChange(
                                    index,
                                    'firstName',
                                    event.target.value
                                  )
                                }
                                onBlur={handleRepresentativeBlur(
                                  index,
                                  'firstName'
                                )}
                                placeholder="Jon"
                                className={cn(
                                  INPUT_CLASS,
                                  shouldShowError(
                                    `representative.${index}.firstName`
                                  ) && 'border-[#c31812] focus:border-[#c31812]'
                                )}
                                maxLength={255}
                              />
                              {shouldShowError(
                                `representative.${index}.firstName`
                              ) && (
                                <div className="flex items-center gap-1">
                                  <IoWarning className="h-4 w-4 text-[#c31812]" />
                                  <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                                    {
                                      errors[
                                        `representative.${index}.firstName`
                                      ]
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-5',
                                  shouldShowError(
                                    `representative.${index}.lastName`
                                  )
                                    ? 'text-[#c31812]'
                                    : 'text-[rgba(0,0,0,0.6)]'
                                )}
                              >
                                Last Name*
                              </span>
                              <input
                                type="text"
                                value={rep.lastName}
                                onChange={(event) =>
                                  handleRepresentativeChange(
                                    index,
                                    'lastName',
                                    event.target.value
                                  )
                                }
                                onBlur={handleRepresentativeBlur(
                                  index,
                                  'lastName'
                                )}
                                placeholder="Doe"
                                className={cn(
                                  INPUT_CLASS,
                                  shouldShowError(
                                    `representative.${index}.lastName`
                                  ) && 'border-[#c31812] focus:border-[#c31812]'
                                )}
                                maxLength={255}
                              />
                              {shouldShowError(
                                `representative.${index}.lastName`
                              ) && (
                                <div className="flex items-center gap-1">
                                  <IoWarning className="h-4 w-4 text-[#c31812]" />
                                  <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                                    {errors[`representative.${index}.lastName`]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid w-full grid-cols-1 gap-3">
                            <div className="flex flex-col gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-5',
                                  shouldShowError(
                                    `representative.${index}.email`
                                  )
                                    ? 'text-[#c31812]'
                                    : 'text-[rgba(0,0,0,0.6)]'
                                )}
                              >
                                Email*
                              </span>
                              {index === 0 && (
                                <p className="text-xs text-[rgba(0,0,0,0.5)]">
                                  Suggestion: Please provide official dealership
                                  email IDs and not personal email IDs on
                                  domains like Gmail, Yahoo etc
                                </p>
                              )}
                              <input
                                type="email"
                                value={rep.email}
                                onChange={(event) =>
                                  handleRepresentativeChange(
                                    index,
                                    'email',
                                    event.target.value
                                  )
                                }
                                onBlur={handleRepresentativeBlur(
                                  index,
                                  'email'
                                )}
                                placeholder="jon.doe@auto.com"
                                className={cn(
                                  INPUT_CLASS,
                                  shouldShowError(
                                    `representative.${index}.email`
                                  ) && 'border-[#c31812] focus:border-[#c31812]'
                                )}
                                maxLength={255}
                              />
                              {shouldShowError(
                                `representative.${index}.email`
                              ) && (
                                <div className="flex items-center gap-1">
                                  <IoWarning className="h-4 w-4 text-[#c31812]" />
                                  <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                                    {errors[`representative.${index}.email`]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-5',
                                  shouldShowError(
                                    `representative.${index}.title`
                                  )
                                    ? 'text-[#c31812]'
                                    : 'text-[rgba(0,0,0,0.6)]'
                                )}
                              >
                                Title*
                              </span>
                              <input
                                type="text"
                                value={rep.title}
                                onChange={(event) =>
                                  handleRepresentativeChange(
                                    index,
                                    'title',
                                    event.target.value
                                  )
                                }
                                onBlur={handleRepresentativeBlur(
                                  index,
                                  'title'
                                )}
                                placeholder="General Manager"
                                className={cn(
                                  INPUT_CLASS,
                                  shouldShowError(
                                    `representative.${index}.title`
                                  ) && 'border-[#c31812] focus:border-[#c31812]'
                                )}
                                maxLength={255}
                              />
                              {shouldShowError(
                                `representative.${index}.title`
                              ) && (
                                <div className="flex items-center gap-1">
                                  <IoWarning className="h-4 w-4 text-[#c31812]" />
                                  <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                                    {errors[`representative.${index}.title`]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid w-full gap-3 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-5',
                                  shouldShowError(
                                    `representative.${index}.phoneNumber`
                                  )
                                    ? 'text-[#c31812]'
                                    : 'text-[rgba(0,0,0,0.6)]'
                                )}
                              >
                                Phone number*
                              </span>
                              <PhoneInput
                                key={`rep-phone-${index}`}
                                specialLabel=""
                                country="us"
                                value={rep.phoneNumber}
                                onChange={(phone: string) =>
                                  handleRepresentativeChange(
                                    index,
                                    'phoneNumber',
                                    phone
                                  )
                                }
                                onBlur={() =>
                                  handleRepresentativeBlur(
                                    index,
                                    'phoneNumber'
                                  )()
                                }
                                placeholder="+1 (YYY) XXX XXXX"
                                containerClass={cn(
                                  'rooftop-phone-input w-full',
                                  shouldShowError(
                                    `representative.${index}.phoneNumber`
                                  ) &&
                                    '!border-[#c31812] [&:focus-within]:!border-[#c31812]'
                                )}
                              />
                              {shouldShowError(
                                `representative.${index}.phoneNumber`
                              ) && (
                                <div className="flex items-center gap-1">
                                  <IoWarning className="h-4 w-4 text-[#c31812]" />
                                  <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                                    {
                                      errors[
                                        `representative.${index}.phoneNumber`
                                      ]
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <span
                                className={cn(
                                  'text-sm font-medium leading-5',
                                  shouldShowError(
                                    `representative.${index}.position`
                                  )
                                    ? 'text-[#c31812]'
                                    : 'text-[rgba(0,0,0,0.6)]'
                                )}
                              >
                                Position*
                              </span>
                              <CIDropdown
                                selectedValues={positionSelections[index] ?? []}
                                options={POSITION_OPTIONS}
                                onChange={positionChangeHandlers[index]}
                                placeholder={'Select Position'}
                                variant="default"
                                showCheckmark
                                isMultiSelect={false}
                                allowDeselection={false}
                              />
                              {shouldShowError(
                                `representative.${index}.position`
                              ) && (
                                <div className="flex items-center gap-1">
                                  <IoWarning className="h-4 w-4 text-[#c31812]" />
                                  <span className="text-[10px] font-medium leading-[14px] text-[#c31812]">
                                    {errors[`representative.${index}.position`]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

BusinessDetails.displayName = 'BusinessDetails';

export default BusinessDetails;
