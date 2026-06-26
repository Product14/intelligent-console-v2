import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IoCheckmark, IoInformationCircleOutline } from 'react-icons/io5';
import { PiCopy } from 'react-icons/pi';

import InputField from '@spyne-console/design-system/input-field';

import ColorSquare from '@spyne-console/components/color-square';
import { ToggleSwitch } from '@spyne-console/components/onboarding/toggle-switch';

import type {
  ButtonColorType,
  ButtonSize,
  DeliveryConfigOption,
  SmartViewEntityConfig,
  SmartViewIntegrationType,
  SmartViewVersion,
  VehicleIdThrough,
} from './types';

// ID Copy Chip Component with copy effect and toast
interface IdCopyChipProps {
  readonly label: string;
  readonly id: string;
  readonly toastMessage?: string;
}

const IdCopyChip: React.FC<IdCopyChipProps> = ({ label, id, toastMessage }) => {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setShowToast(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);

      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <div className="inline-flex h-7 items-center justify-center gap-2 rounded-[54px] bg-[#F5F5F5] px-2 py-0.5 outline outline-1 outline-offset-[-1px] outline-black/5">
        <div className="text-center font-['Inter'] text-xs font-medium leading-5 text-[#363F72]">
          {label}:{id.slice(0, 8)}
        </div>
        <button
          type="button"
          className={`flex h-4 w-4 items-center justify-center transition-all duration-200 ${
            copied
              ? 'scale-110 text-green-600'
              : 'text-indigo-900/40 hover:text-indigo-900/70'
          }`}
          onClick={handleCopy}
          tabIndex={0}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <IoCheckmark className="h-3.5 w-3.5" />
          ) : (
            <PiCopy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="animate-fade-in absolute right-0 top-full z-50 mt-2">
          <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
            {toastMessage || `${label} copied!`}
          </div>
        </div>
      )}
    </div>
  );
};

// Delivery Config Card Component
interface DeliveryConfigCardProps {
  readonly label: string;
  readonly isEnabled: boolean;
  readonly onToggle: () => void;
  readonly selectedOption: DeliveryConfigOption;
  readonly onOptionSelect: (option: DeliveryConfigOption) => void;
  readonly disabled?: boolean;
  readonly error?: string;
}

const DeliveryConfigCard: React.FC<DeliveryConfigCardProps> = ({
  label,
  isEnabled,
  onToggle,
  selectedOption,
  onOptionSelect,
  disabled = false,
  error,
}) => {
  const options: { value: DeliveryConfigOption; label: string }[] = [
    { value: 'QC_DONE', label: 'QC Done' },
    { value: 'AI_DONE', label: 'AI Done' },
    { value: 'BOTH', label: 'Both' },
  ];

  return (
    <div className="flex flex-col">
      <div
        className={`flex flex-col gap-3 rounded-xl bg-[#F9FAFB] p-4 ${
          disabled ? 'pointer-events-none opacity-50' : ''
        } ${error ? 'ring-1 ring-red-500' : ''}`}
      >
        <div className="flex items-center gap-6">
          <div className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
            {label}
            <span className="text-rose-600">*</span>
          </div>
          <ToggleSwitch isOn={isEnabled} onToggle={onToggle} />
        </div>
        <div className="flex gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onOptionSelect(option.value)}
              disabled={disabled}
              className="inline-flex items-center justify-start gap-1.5 rounded-[30px] py-1.5 pl-3 pr-4 transition-all disabled:cursor-not-allowed"
              style={{
                background:
                  selectedOption === option.value
                    ? 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #6C5CE7, #FF6B6B) border-box'
                    : 'white',
                border:
                  selectedOption === option.value
                    ? '1px solid transparent'
                    : '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <span className="font-['Inter'] text-sm font-semibold leading-5 text-black/80">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

// Reusable gradient select chip component
interface GradientSelectChipProps {
  readonly label: string;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly className?: string;
}

const GradientSelectChip: React.FC<GradientSelectChipProps> = ({
  label,
  isSelected,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-start gap-1.5 rounded-[30px] py-1.5 pl-3 pr-4 transition-all ${className}`}
      style={{
        background: isSelected
          ? 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #6C5CE7, #FF6B6B) border-box'
          : 'white',
        border: isSelected
          ? '1px solid transparent'
          : '1px solid rgba(0,0,0,0.1)',
      }}
    >
      <span className="font-['Inter'] text-sm font-semibold leading-5 text-black/80">
        {label}
      </span>
    </button>
  );
};

export interface SmartViewFormScreenProps {
  readonly onBack: () => void;
  readonly onGenerateScript: (config: SmartViewEntityConfig) => Promise<void>;
  readonly initialData?: SmartViewEntityConfig | null;
  readonly enterpriseName: string;
  readonly rooftopName: string;
  readonly enterpriseId: string;
  readonly teamId: string;
  readonly loading?: boolean;
  readonly onboardingStartTime?: string | number | null;
  readonly onFormValidityChange?: (isValid: boolean) => void;
  readonly submitRef?: React.MutableRefObject<
    (() => void | Promise<void>) | null
  >;
}

// Form data structure
interface SmartViewFormData {
  enterprise_id: string;
  enterprise_name: string;
  selected_team_id: string;
  website_url_input: string;
  website_provider: string;
  vehicle_id_through: VehicleIdThrough;
  vehichle_id_xpath: string;
  vehichle_id_xpath_mobile: string;
  div_path: string;
  div_path_mobile: string;
  integration_type: SmartViewIntegrationType;
  version: SmartViewVersion;
  button_text: string;
  button_size: ButtonSize;
  button_color: string;
  button_color_type: ButtonColorType;
  delivery_config_spin: DeliveryConfigOption | 'OFF';
  delivery_config_image: DeliveryConfigOption | 'OFF';
  delivery_config_video: DeliveryConfigOption | 'OFF';
  is_ci_enabled: number | boolean;
  is_studio_enabled: number | boolean;
}

// Form validation errors interface
interface FormErrors {
  website_url?: string;
  vehichle_id_xpath?: string;
  vehichle_id_xpath_mobile?: string;
  div_path?: string;
  div_path_mobile?: string;
  website_provider?: string;
  button_text?: string;
  button_color?: string;
  vehicle_id_through?: string;
  version?: string;
  integration_type?: string;
  delivery_config_spin?: string;
  delivery_config_image?: string;
  delivery_config_video?: string;
}

// Button color constants
const BUTTON_COLORS = {
  purple: '#A020F0',
  white: '#ffffff',
};

// Helper to normalize URL by prepending https:// if missing
const normalizeUrl = (url: string): string => {
  if (!url) return url;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// Validation helper
const validateUrl = (url: string): boolean => {
  if (!url?.trim()) return false;
  try {
    const normalizedUrl = normalizeUrl(url.trim());
    const parsedUrl = new URL(normalizedUrl);
    return parsedUrl.hostname.length > 0 && parsedUrl.hostname.includes('.');
  } catch {
    return false;
  }
};

// Determine button color type from hex value
const getButtonColorTypeFromHex = (hex: string): ButtonColorType => {
  if (hex === BUTTON_COLORS.purple) return 'purple';
  if (hex === BUTTON_COLORS.white || hex === '#fffff') return 'white';
  return 'custom';
};

// Helper to determine integration type from initialData
const getInitialIntegrationType = (
  data: SmartViewEntityConfig | null | undefined
): SmartViewIntegrationType => {
  if (!data) return 'BUTTON';
  if (data.integration_button) return 'BUTTON';
  if (data.integration_page_loader) return 'PAGE_LOADER';
  return 'BUTTON';
};

const SmartViewFormScreen: React.FC<SmartViewFormScreenProps> = ({
  onBack,
  onGenerateScript,
  initialData,
  enterpriseName,
  rooftopName,
  enterpriseId,
  teamId,
  loading = false,
  onboardingStartTime,
  onFormValidityChange,
  submitRef,
}) => {
  const [formData, setFormData] = useState<SmartViewFormData>(() => ({
    enterprise_id: enterpriseId,
    enterprise_name: enterpriseName,
    selected_team_id: teamId,
    website_url_input: initialData?.website_url || '',
    website_provider: initialData?.website_provider || '',
    vehicle_id_through: initialData?.vehicle_id_through || 'VIN',
    vehichle_id_xpath: initialData?.vehichle_id_xpath || '',
    vehichle_id_xpath_mobile: initialData?.vehichle_id_xpath_mobile || '',
    div_path: initialData?.div_path || '',
    div_path_mobile: initialData?.div_path_mobile || '',
    integration_type: getInitialIntegrationType(initialData),
    version: initialData?.version || 't1',
    button_text: initialData?.button_text || '',
    button_size: initialData?.button_size || 'MEDIUM',
    button_color: initialData?.button_color_hex || BUTTON_COLORS.purple,
    button_color_type: initialData?.button_color_hex
      ? getButtonColorTypeFromHex(initialData.button_color_hex)
      : 'purple',
    delivery_config_spin: initialData?.delivery_config_spin || 'QC_DONE',
    delivery_config_image: initialData?.delivery_config_image || 'OFF',
    delivery_config_video: initialData?.delivery_config_video || 'OFF',
    is_ci_enabled: initialData?.is_ci_enabled || true,
    is_studio_enabled: initialData?.is_studio_enabled || true,
  }));

  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const spinEnabled = formData.delivery_config_spin !== 'OFF';
  const imageEnabled = formData.delivery_config_image !== 'OFF';
  const videoEnabled = formData.delivery_config_video !== 'OFF';

  const clearValidationError = (fieldName: keyof FormErrors) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleFormChange = <K extends keyof SmartViewFormData>(
    field: K,
    value: SmartViewFormData[K]
  ) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    const errorKey = field === 'website_url_input' ? 'website_url' : field;
    clearValidationError(errorKey as keyof FormErrors);
  };

  const handleVehicleIdSelection = (type: VehicleIdThrough) => {
    setFormData((prevState) => ({
      ...prevState,
      vehicle_id_through: type,
    }));
    clearValidationError('vehicle_id_through');
  };

  const handleVersionSelect = (ver: SmartViewVersion) => {
    setFormData((prevState) => ({
      ...prevState,
      version: ver,
    }));
    clearValidationError('version');
  };

  const handleIntegrationTypeSelect = (type: SmartViewIntegrationType) => {
    if (type === 'BUTTON') {
      setFormData((prevState) => ({
        ...prevState,
        integration_type: type,
        delivery_config_spin: 'QC_DONE',
        delivery_config_image: 'OFF',
        delivery_config_video: 'OFF',
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        integration_type: type,
      }));
    }
    clearValidationError('integration_type');
    clearValidationError('div_path');
    clearValidationError('div_path_mobile');
  };

  const handleButtonSizeSelect = (size: ButtonSize) => {
    setFormData((prevState) => ({
      ...prevState,
      button_size: size,
    }));
  };

  const handleButtonColorChange = (colorType: ButtonColorType) => {
    let buttonColor = formData.button_color;

    if (colorType === 'purple') {
      buttonColor = BUTTON_COLORS.purple;
    } else if (colorType === 'white') {
      buttonColor = BUTTON_COLORS.white;
    }

    setFormData((prevState) => ({
      ...prevState,
      button_color_type: colorType,
      button_color: buttonColor,
    }));
    clearValidationError('button_color');
  };

  const handleHexColorInput = (hexValue: string) => {
    setFormData((prevState) => ({
      ...prevState,
      button_color: hexValue,
      button_color_type: 'custom',
    }));
    clearValidationError('button_color');
  };

  const handleDeliveryConfigSpinSelect = (config: DeliveryConfigOption) => {
    setFormData((prevState) => ({
      ...prevState,
      delivery_config_spin: config,
    }));
    clearValidationError('delivery_config_spin');
  };

  const handleDeliveryConfigImageSelect = (config: DeliveryConfigOption) => {
    setFormData((prevState) => ({
      ...prevState,
      delivery_config_image: config,
    }));
    clearValidationError('delivery_config_image');
  };

  const handleDeliveryConfigVideoSelect = (config: DeliveryConfigOption) => {
    setFormData((prevState) => ({
      ...prevState,
      delivery_config_video: config,
    }));
    clearValidationError('delivery_config_video');
  };

  const handleDeliveryConfigToggle = (type: 'spin' | 'image' | 'video') => {
    const configKey = `delivery_config_${type}` as keyof SmartViewFormData;
    const currentValue = formData[configKey];

    if (currentValue === 'OFF') {
      setFormData((prevState) => ({
        ...prevState,
        [configKey]: 'QC_DONE',
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [configKey]: 'OFF',
      }));
    }
  };

  const validateField = (field: keyof FormErrors): string => {
    switch (field) {
      case 'website_url':
        if (!formData.website_url_input.trim()) {
          return 'Website URL is required';
        }
        if (!validateUrl(formData.website_url_input.trim())) {
          return 'Please enter a valid URL';
        }
        return '';
      case 'vehichle_id_xpath':
        if (!formData.vehichle_id_xpath.trim()) {
          return 'VIN/Stock Number XPath is required';
        }
        return '';
      case 'vehichle_id_xpath_mobile':
        return '';
      case 'div_path':
        if (!formData.div_path.trim()) {
          return 'Div path is required';
        }
        return '';
      case 'button_text':
        if (
          formData.integration_type === 'BUTTON' &&
          !formData.button_text.trim()
        ) {
          return 'Button Text is required';
        }
        return '';
      case 'button_color':
        if (formData.integration_type === 'BUTTON') {
          if (!formData.button_color.trim()) {
            return 'Button Color is required';
          }
          if (
            formData.button_color_type === 'custom' &&
            !/^#?[0-9A-Fa-f]{6}$/.test(formData.button_color.trim())
          ) {
            return 'Please enter a valid hex color (e.g. #FF5733)';
          }
        }
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'website_url' && formData.website_url_input.trim()) {
      const normalizedUrl = normalizeUrl(formData.website_url_input.trim());
      if (normalizedUrl !== formData.website_url_input) {
        setFormData((prev) => ({
          ...prev,
          website_url_input: normalizedUrl,
        }));
      }
    }

    const error = validateField(field as keyof FormErrors);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      clearValidationError(field as keyof FormErrors);
    }
  };

  const validateRequiredFields = useCallback((): boolean => {
    const errors: FormErrors = {};
    let hasErrors = false;

    if (!formData.website_url_input.trim()) {
      errors.website_url = 'Website URL is required';
      hasErrors = true;
    } else if (!validateUrl(formData.website_url_input.trim())) {
      errors.website_url = 'Please enter a valid URL';
      hasErrors = true;
    }

    if (!formData.vehichle_id_xpath.trim()) {
      errors.vehichle_id_xpath = 'VIN/Stock Number XPath is required';
      hasErrors = true;
    }

    if (!formData.div_path.trim()) {
      errors.div_path = 'Div path is required';
      hasErrors = true;
    }

    if (formData.integration_type === 'BUTTON') {
      if (!formData.button_text.trim()) {
        errors.button_text = 'Button Text is required';
        hasErrors = true;
      }
      if (!formData.button_color.trim()) {
        errors.button_color = 'Button Color is required';
        hasErrors = true;
      } else if (
        formData.button_color_type === 'custom' &&
        !/^#?[0-9A-Fa-f]{6}$/.test(formData.button_color.trim())
      ) {
        errors.button_color = 'Please enter a valid hex color (e.g. #FF5733)';
        hasErrors = true;
      }
    }

    if (formData.integration_type !== 'BUTTON') {
      if (!formData.delivery_config_spin) {
        errors.delivery_config_spin =
          'Delivery config for 360/Spin is required';
        hasErrors = true;
      }
      if (!formData.delivery_config_image) {
        errors.delivery_config_image = 'Delivery config for Images is required';
        hasErrors = true;
      }
      if (!formData.delivery_config_video) {
        errors.delivery_config_video = 'Delivery config for Video is required';
        hasErrors = true;
      }
    }

    setValidationErrors(errors);
    return hasErrors;
  }, [formData]);

  const handleGenerateScript = useCallback(async () => {
    const hasErrors = validateRequiredFields();
    if (hasErrors) {
      setTouched({
        website_url: true,
        vehichle_id_xpath: true,
        vehichle_id_xpath_mobile: true,
        div_path: true,
        button_text: true,
        button_color: true,
        delivery_config_spin: true,
        delivery_config_image: true,
        delivery_config_video: true,
      });
      return;
    }

    const config: SmartViewEntityConfig = {
      website_url: normalizeUrl(formData.website_url_input),
      website_provider: formData.website_provider,
      vehicle_id_through: formData.vehicle_id_through,
      vehichle_id_xpath: formData.vehichle_id_xpath,
      vehichle_id_xpath_mobile: formData.vehichle_id_xpath_mobile,
      div_path: formData.div_path,
      div_path_mobile: formData.div_path_mobile,
      integration_button: formData.integration_type === 'BUTTON',
      integration_page_loader: formData.integration_type === 'PAGE_LOADER',
      version: formData.version,
      ...(formData.integration_type === 'BUTTON' && {
        button_text: formData.button_text,
        button_size: formData.button_size,
        button_color_type: formData.button_color_type,
        button_color_hex: formData.button_color,
      }),
      delivery_config_spin: spinEnabled
        ? (formData.delivery_config_spin as DeliveryConfigOption)
        : 'OFF',
      delivery_config_image: imageEnabled
        ? (formData.delivery_config_image as DeliveryConfigOption)
        : 'OFF',
      delivery_config_video: videoEnabled
        ? (formData.delivery_config_video as DeliveryConfigOption)
        : 'OFF',
      is_ci_enabled: Boolean(formData?.is_ci_enabled) ? 1 : 0,
      is_studio_enabled: Boolean(formData?.is_studio_enabled) ? 1 : 0,
    };

    await onGenerateScript(config);
  }, [
    formData,
    onGenerateScript,
    validateRequiredFields,
    spinEnabled,
    imageEnabled,
    videoEnabled,
  ]);

  const isFormValid = useMemo((): boolean => {
    const hasWebsiteUrl =
      formData.website_url_input.trim() !== '' &&
      validateUrl(formData.website_url_input.trim());
    const hasVinXpath = formData.vehichle_id_xpath.trim() !== '';
    const hasDivPath = formData.div_path.trim() !== '';
    const baseValid = hasWebsiteUrl && hasVinXpath && hasDivPath;

    if (formData.integration_type === 'BUTTON') {
      const buttonValid = formData.button_text.trim() !== '';
      const colorValid =
        formData.button_color_type !== 'custom' ||
        (formData.button_color.trim() !== '' &&
          /^#?[0-9A-Fa-f]{6}$/.test(formData.button_color.trim()));
      return baseValid && buttonValid && colorValid;
    }

    return baseValid;
  }, [formData]);

  useEffect(() => {
    onFormValidityChange?.(isFormValid);
  }, [isFormValid, onFormValidityChange]);

  useEffect(() => {
    if (submitRef) {
      submitRef.current = handleGenerateScript;
    }
    return () => {
      if (submitRef) {
        submitRef.current = null;
      }
    };
  }, [submitRef, handleGenerateScript]);

  const getFieldError = (field: keyof FormErrors): string => {
    return touched[field] ? validationErrors[field] || '' : '';
  };

  return (
    <div className="relative mt-6 flex h-full w-full flex-col">
      {/* Form content */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="grid grid-cols-2 gap-6">
          {/* Enterprise Name */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="justify-center">
                <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                  Enterprise Name
                </span>
                <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                  *
                </span>
              </div>
              <IdCopyChip
                label="ENT ID"
                id={enterpriseId}
                toastMessage="Enterprise ID copied!"
              />
            </div>
            <InputField
              id="enterprise-name"
              name="enterpriseName"
              value={enterpriseName}
              onChange={() => {}}
              disabled={true}
              floatingLabel={false}
              className="w-full"
            />
          </div>

          {/* Rooftop Name */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="justify-center">
                <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                  Rooftop Name
                </span>
                <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                  *
                </span>
              </div>
              <IdCopyChip
                label="RT ID"
                id={teamId}
                toastMessage="Rooftop ID copied!"
              />
            </div>
            <InputField
              id="rooftop-name"
              name="rooftopName"
              value={rooftopName}
              onChange={() => {}}
              disabled={true}
              floatingLabel={false}
              className="w-full"
            />
          </div>

          {/* Website URL */}
          <div>
            <div className="mb-2 flex items-center gap-1">
              <div className="justify-center">
                <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                  Website
                </span>
                <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                  *
                </span>
              </div>
              <IoInformationCircleOutline className="h-4 w-4 text-gray-400" />
            </div>
            <InputField
              id="website-url"
              name="websiteUrl"
              value={formData.website_url_input}
              onChange={(val: string) =>
                handleFormChange('website_url_input', val)
              }
              onBlur={() => handleBlur('website_url')}
              placeholder="Enter website URL..."
              floatingLabel={false}
              error={getFieldError('website_url')}
              className="w-full"
            />
          </div>

          {/* Website Provider */}
          <div>
            <div className="mb-2 justify-center">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                Enter Your Website Provider
              </span>
            </div>
            <InputField
              id="website-provider"
              name="websiteProvider"
              value={formData.website_provider}
              onChange={(val: string) =>
                handleFormChange('website_provider', val)
              }
              placeholder="E.g. Dealer Inspire, Sincro, Other"
              floatingLabel={false}
              className="w-full"
            />
          </div>
        </div>

        {/* Vehicle Identification */}
        <div className="mt-6">
          <div className="mb-2 justify-center">
            <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
              Vehicle identification through
            </span>
            <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
              *
            </span>
          </div>
          <div className="flex gap-2">
            <GradientSelectChip
              label="VIN"
              isSelected={formData.vehicle_id_through === 'VIN'}
              onClick={() => handleVehicleIdSelection('VIN')}
            />
            <GradientSelectChip
              label="Stock Number"
              isSelected={formData.vehicle_id_through === 'STOCK_NUMBER'}
              onClick={() => handleVehicleIdSelection('STOCK_NUMBER')}
            />
          </div>
        </div>

        {/* Version for SmartView */}
        <div className="mt-6">
          <div className="mb-2 justify-center">
            <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
              Version for smart view
            </span>
            <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
              *
            </span>
          </div>
          <div className="flex gap-2">
            <GradientSelectChip
              label="Template 1"
              isSelected={formData.version === 't1'}
              onClick={() => handleVersionSelect('t1')}
            />
            <GradientSelectChip
              label="Template 2"
              isSelected={formData.version === 't2'}
              onClick={() => handleVersionSelect('t2')}
            />
          </div>
        </div>

        {/* XPath fields */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-2 justify-center">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                {formData.vehicle_id_through === 'VIN'
                  ? 'Enter VIN Number XPath'
                  : 'Enter Stock Number XPath'}
              </span>
              <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                *
              </span>
            </div>
            <InputField
              id="vin-xpath"
              name="vinXpath"
              value={formData.vehichle_id_xpath}
              onChange={(val: string) =>
                handleFormChange('vehichle_id_xpath', val)
              }
              onBlur={() => handleBlur('vehichle_id_xpath')}
              placeholder={`Enter ${formData.vehicle_id_through === 'VIN' ? 'VIN' : 'Stock'} number path here...`}
              floatingLabel={false}
              error={getFieldError('vehichle_id_xpath')}
              className="w-full"
            />
          </div>
          <div>
            <div className="mb-2 justify-center">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                {formData.vehicle_id_through === 'VIN'
                  ? 'Enter VIN Number XPath for mobile'
                  : 'Enter Stock Number XPath for mobile'}
              </span>
            </div>
            <InputField
              id="vin-xpath-mobile"
              name="vinXpathMobile"
              value={formData.vehichle_id_xpath_mobile}
              onChange={(val: string) =>
                handleFormChange('vehichle_id_xpath_mobile', val)
              }
              placeholder={`Enter ${formData.vehicle_id_through === 'VIN' ? 'VIN' : 'Stock'} number path for mobile here...`}
              floatingLabel={false}
              className="w-full"
            />
          </div>
        </div>

        {/* Div class name fields */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-2 justify-center">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                {formData.integration_type === 'BUTTON'
                  ? 'Add div XPath'
                  : 'Add div class name'}
              </span>
              <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                *
              </span>
            </div>
            <InputField
              id="div-path"
              name="divPath"
              value={formData.div_path}
              onChange={(val: string) => handleFormChange('div_path', val)}
              onBlur={() => handleBlur('div_path')}
              placeholder={
                formData.integration_type === 'BUTTON'
                  ? 'Enter div XPath here...'
                  : 'Enter div class name here...'
              }
              floatingLabel={false}
              error={getFieldError('div_path')}
              className="w-full"
            />
          </div>
          <div>
            <div className="mb-2 justify-center">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                {formData.integration_type === 'BUTTON'
                  ? 'Add div XPath for mobile'
                  : 'Add div class name for mobile'}
              </span>
            </div>
            <InputField
              id="div-path-mobile"
              name="divPathMobile"
              value={formData.div_path_mobile}
              onChange={(val: string) =>
                handleFormChange('div_path_mobile', val)
              }
              placeholder={
                formData.integration_type === 'BUTTON'
                  ? 'Enter div XPath for mobile here...'
                  : 'Enter div class name for mobile here...'
              }
              floatingLabel={false}
              className="w-full"
            />
          </div>
        </div>

        {/* Integration Type */}
        <div className="mt-6">
          <div className="mb-2 justify-center">
            <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
              Integration Type
            </span>
            <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
              *
            </span>
          </div>
          <div className="flex gap-2">
            <GradientSelectChip
              label="Button"
              isSelected={formData.integration_type === 'BUTTON'}
              onClick={() => handleIntegrationTypeSelect('BUTTON')}
            />
            <GradientSelectChip
              label="Page Loader"
              isSelected={formData.integration_type === 'PAGE_LOADER'}
              onClick={() => handleIntegrationTypeSelect('PAGE_LOADER')}
            />
          </div>
        </div>

        {/* Button Configuration (only when BUTTON is selected) */}
        {formData.integration_type === 'BUTTON' && (
          <div className="mt-6 space-y-6">
            <div className="mb-2 justify-center">
              <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                Configure button
              </span>
            </div>

            {/* Button Text */}
            <div>
              <div className="mb-2 justify-center">
                <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                  Button Text
                </span>
                <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                  *
                </span>
              </div>
              <InputField
                id="button-text"
                name="buttonText"
                value={formData.button_text}
                onChange={(val: string) => handleFormChange('button_text', val)}
                onBlur={() => handleBlur('button_text')}
                placeholder="Enter button text..."
                floatingLabel={true}
                error={getFieldError('button_text')}
                className="w-full"
              />
            </div>

            {/* Button Size */}
            <div>
              <div className="mb-2 justify-center">
                <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                  Button Size
                </span>
                <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                  *
                </span>
              </div>
              <div className="flex gap-2">
                {(['SMALL', 'MEDIUM', 'LARGE'] as ButtonSize[]).map((size) => (
                  <GradientSelectChip
                    key={size}
                    label={size.charAt(0) + size.slice(1).toLowerCase()}
                    isSelected={formData.button_size === size}
                    onClick={() => handleButtonSizeSelect(size)}
                  />
                ))}
              </div>
            </div>

            {/* Button Color */}
            <div>
              <div className="mb-2 justify-center">
                <span className="font-['Inter'] text-sm font-medium leading-5 text-black/60">
                  Button Color
                </span>
                <span className="font-['Inter'] text-sm font-medium leading-5 text-rose-600">
                  *
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {/* Purple Option */}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="buttonColor"
                    value="purple"
                    checked={formData.button_color_type === 'purple'}
                    onChange={() => handleButtonColorChange('purple')}
                    className="accent-[#4600F2]"
                  />
                  <span className="rounded-md border-[#4600F2] bg-[#4600F2] px-5 py-2 text-sm text-white">
                    Purple
                  </span>
                </label>

                {/* White Option */}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="buttonColor"
                    value="white"
                    checked={formData.button_color_type === 'white'}
                    onChange={() => handleButtonColorChange('white')}
                    className="accent-[#4600F2]"
                  />
                  <span className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm">
                    White
                  </span>
                </label>

                {/* Custom Option */}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="buttonColor"
                    value="custom"
                    checked={formData.button_color_type === 'custom'}
                    onChange={() => handleButtonColorChange('custom')}
                    className="accent-[#4600F2]"
                  />
                  <span className="text-sm text-black/60">Custom</span>
                </label>

                {/* Hex Color Input & Color Picker */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500">
                      Hex color
                    </span>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm focus-within:border-[#4600F2] focus-within:ring-2 focus-within:ring-[#4600F2]/20">
                      <input
                        type="text"
                        value={formData.button_color || ''}
                        onChange={(e) => {
                          handleHexColorInput(e.target.value);
                        }}
                        onBlur={() => handleBlur('button_color')}
                        placeholder="#7a4df3"
                        disabled={formData.button_color_type !== 'custom'}
                        className="w-24 bg-transparent py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400"
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      6-digit hex code
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ColorSquare
                      onAddColor={(hex: string) => {
                        handleHexColorInput(hex);
                      }}
                      hexCode={formData.button_color || '#ffffff'}
                      setColorInput={(hex: string) => {
                        handleHexColorInput(hex);
                      }}
                    />
                  </div>
                </div>
              </div>
              {getFieldError('button_color') && (
                <span className="ml-3 mt-1 block text-xs text-red-500">
                  {getFieldError('button_color')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Delivery Configuration */}
        <div className="mt-8">
          <h3 className="mb-4 font-['Inter'] text-xl font-semibold leading-8 text-black">
            Delivery Configuration
          </h3>
          {formData.integration_type === 'BUTTON' && (
            <p className="mb-4 text-sm text-gray-500">
              Delivery configuration is locked when Button integration type is
              selected
            </p>
          )}
          <div className="grid grid-cols-3 gap-6">
            <DeliveryConfigCard
              label="360 Spin"
              isEnabled={spinEnabled}
              onToggle={() => handleDeliveryConfigToggle('spin')}
              selectedOption={
                formData.delivery_config_spin === 'OFF'
                  ? 'QC_DONE'
                  : formData.delivery_config_spin
              }
              onOptionSelect={handleDeliveryConfigSpinSelect}
              disabled={formData.integration_type === 'BUTTON'}
              error={getFieldError('delivery_config_spin')}
            />
            <DeliveryConfigCard
              label="Image"
              isEnabled={imageEnabled}
              onToggle={() => handleDeliveryConfigToggle('image')}
              selectedOption={
                formData.delivery_config_image === 'OFF'
                  ? 'QC_DONE'
                  : formData.delivery_config_image
              }
              onOptionSelect={handleDeliveryConfigImageSelect}
              disabled={formData.integration_type === 'BUTTON'}
              error={getFieldError('delivery_config_image')}
            />
            <DeliveryConfigCard
              label="Video"
              isEnabled={videoEnabled}
              onToggle={() => handleDeliveryConfigToggle('video')}
              selectedOption={
                formData.delivery_config_video === 'OFF'
                  ? 'QC_DONE'
                  : formData.delivery_config_video
              }
              onOptionSelect={handleDeliveryConfigVideoSelect}
              disabled={formData.integration_type === 'BUTTON'}
              error={getFieldError('delivery_config_video')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartViewFormScreen;
