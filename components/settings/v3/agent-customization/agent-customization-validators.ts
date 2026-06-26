export interface AgentCustomizationValidationErrors {
  preferredAreaCode?: string;
}

/**
 * Validates the agent customization form
 * Returns validation errors object
 */
export const validateAgentCustomizationForm = (customizationValues: {
  preferredAreaCode?: string;
}): {
  errors: AgentCustomizationValidationErrors;
  isValid: boolean;
} => {
  const errors: AgentCustomizationValidationErrors = {};

  // Validate Preferred Area Code (optional, but must follow format if provided)
  const areaCode = customizationValues.preferredAreaCode?.trim();
  if (areaCode) {
    if (!/^\d+$/.test(areaCode)) {
      errors.preferredAreaCode = 'Area code must contain only digits';
    } else if (areaCode.length !== 3) {
      errors.preferredAreaCode = 'Area code must be exactly 3 digits';
    } else if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
      errors.preferredAreaCode = 'Area code cannot start with 0 or 1';
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
