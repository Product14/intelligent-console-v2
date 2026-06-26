import React from 'react';

import CustomizationInput from './CustomizationInput';

interface PreferredAreaCodeProps {
  value?: string;
  onChange: (value: string) => void;
  errors?: {
    preferredAreaCode?: string;
  };
  disabled?: boolean;
}

const PreferredAreaCode: React.FC<PreferredAreaCodeProps> = ({
  value,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const handleChange = (inputValue: string) => {
    // Remove non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, '');
    // Limit to 3 digits
    const limitedValue = digitsOnly.slice(0, 3);
    onChange(limitedValue);
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          Choose Preferred Area Code
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          Enter the 3-digit area code for your phone number
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <CustomizationInput
          value={value || ''}
          onChange={handleChange}
          placeholder="Eg: (347)-xxx xxxx"
          error={errors.preferredAreaCode}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default PreferredAreaCode;
