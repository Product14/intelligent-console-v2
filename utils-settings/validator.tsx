// Type definitions
interface ValidationRule {
  pattern?: RegExp;
  message?: string;
  validate?: (value: string) => string | null;
}

interface ValidationOptions {
  required?: boolean;
  requiredMessage?: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormFields {
  [key: string]: string;
}

interface RequiredFields {
  [key: string]: boolean | { message?: string };
}

interface ValidationResult {
  errors: { [key: string]: string };
  isValid: boolean;
}

// Validation rules
const validationRules: ValidationRules = {
  email: {
    pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    message: 'Invalid email address',
  },
  owner_phone: {
    pattern: /^\+?[0-9]{8,14}$/,
    message: 'Invalid phone number',
    validate: (value: string): string | null => {
      if (!value?.trim()) return 'Phone number cannot be empty';
      if (!/^\+?[0-9]{8,14}$/.test(value)) {
        return 'Invalid phone number';
      }
      return null;
    },
  },
  name: {
    validate: (value: string): string | null => {
      if (!value?.trim()) return null;
      if (/^\s/.test(value)) {
        return 'Name cannot start with a space';
      }
      return null;
    },
  },
  company_name: {
    validate: (value: string): string | null => {
      if (!value?.trim()) return null;
      if (/^\s/.test(value)) {
        return 'Dealership name cannot start with a space';
      }
      return null;
    },
  },
  website: {
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    message: 'Invalid website URL',
  },
  designation: {
    validate: (value: string): string | null => {
      if (!value?.trim()) return null;
      if (/^\s/.test(value)) {
        return 'Designation cannot start with a space';
      }
      return null;
    },
  },
  message: {
    // No specific validation for message as it's optional
    // Just check for leading spaces if a message is provided
    validate: (value: string): string | null => {
      if (!value?.trim()) return null;
      if (/^\s/.test(value)) {
        return 'Message cannot start with a space';
      }
      return null;
    },
  },
};

// Default error messages
const defaultMessages = {
  required: (field: string): string => `${field} cannot be empty`,
};

// Generic validator function
export const validateField = (
  field: string,
  value: string,
  options: ValidationOptions = {}
): string | null => {
  const rules = validationRules[field];
  if (!rules) return null;

  // Check if required (based on form instance configuration)
  if (options.required && (!value || value.trim() === '')) {
    return options.requiredMessage ?? defaultMessages.required(field);
  }

  // If field is empty and not required, skip other validations
  if (!value || value.trim() === '') {
    return null;
  }

  // Check pattern if exists
  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message || null;
  }

  // Custom validation if exists
  if (rules.validate) {
    const customError = rules.validate(value);
    if (customError) return customError;
  }

  return null;
};

// Validate multiple fields at once
export const validateForm = (
  fields: FormFields,
  requiredFields: RequiredFields = {}
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  Object.entries(fields).forEach(([field, value]) => {
    const requiredField = requiredFields[field];
    const isRequired =
      typeof requiredField === 'boolean' ? requiredField : !!requiredField;
    const requiredMessage =
      typeof requiredField === 'object' && requiredField.message
        ? requiredField.message
        : undefined;

    const error = validateField(field, value, {
      required: isRequired,
      requiredMessage,
    });
    if (error) {
      errors[field] = error;
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

// =============================================================================
// Campaign setup — continue-button gate
// =============================================================================

export interface CampaignContinueGateParams {
  isLaunching: boolean;
  isUploadingMappedLeadFile: boolean;
  currentStep: number;
  leadUploadStatus: {
    isUploading: boolean;
    csvMappingComplete: boolean;
    hasNoPhoneNumbers?: boolean;
  };
  excelValidationStatus: { isLoading: boolean };
  unsavedOffer: boolean;
  /** Step 2 — recurring sales campaign is locked to CRM import */
  salesRecurringRequiresCrm?: boolean;
  importSource?: 'excel' | 'crm' | undefined;
  recurringCrmTimeWindowsInvalid?: boolean;
  recurringMaxTotalLeadsInvalid?: boolean;
}

/**
 * Returns true when the "Continue" button should be disabled.
 * Centralises all per-step blocking conditions so index.tsx stays clean.
 */
export const isCampaignContinueDisabled = ({
  isLaunching,
  isUploadingMappedLeadFile,
  currentStep,
  leadUploadStatus,
  excelValidationStatus,
  unsavedOffer,
  salesRecurringRequiresCrm,
  importSource,
  recurringCrmTimeWindowsInvalid,
  recurringMaxTotalLeadsInvalid,
}: CampaignContinueGateParams): boolean =>
  isLaunching ||
  isUploadingMappedLeadFile ||
  unsavedOffer ||
  (currentStep === 2 && leadUploadStatus.isUploading) ||
  (currentStep === 2 &&
    salesRecurringRequiresCrm === true &&
    importSource !== 'crm') ||
  (currentStep === 2 && recurringCrmTimeWindowsInvalid === true) ||
  (currentStep === 2 && recurringMaxTotalLeadsInvalid === true) ||
  (currentStep === 2 && !leadUploadStatus.csvMappingComplete) ||
  (currentStep === 2 && !!leadUploadStatus.hasNoPhoneNumbers) ||
  (currentStep === 2 && excelValidationStatus.isLoading);

// Add new validation rule
export const addValidationRule = (
  fieldName: string,
  rules: ValidationRule
): void => {
  validationRules[fieldName] = {
    ...validationRules[fieldName],
    ...rules,
  };
};
