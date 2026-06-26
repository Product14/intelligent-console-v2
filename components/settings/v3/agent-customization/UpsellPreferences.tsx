import React from 'react';

import CustomizationInput from './CustomizationInput';
import CustomizationRadio from './CustomizationRadio';

interface UpsellPreferencesProps {
  value: {
    isOpted?: boolean;
    data?: string;
  };
  onChange: (field: string, value: string | boolean) => void;
  errors?: {
    upsell?: string;
  };
}

const UpsellPreferences: React.FC<UpsellPreferencesProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          Upsell Preferences
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          Guidelines for suggesting additional services during service selection
          without being pushy.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <CustomizationRadio
            name="upsellEnabled"
            value="on"
            label="Upsell On"
            checked={!!value?.isOpted}
            onChange={(value) => onChange('isOpted', true)}
          />
          <CustomizationRadio
            name="upsellEnabled"
            value="off"
            label="Upsell Off"
            checked={!value?.isOpted}
            onChange={(value) => onChange('isOpted', false)}
          />
        </div>

        {value?.isOpted && (
          <CustomizationInput
            description="Enter the offer details and till when its running to create fomo."
            value={value?.data || ''}
            onChange={(v) => onChange('data', v)}
            placeholder="Example: 20% off for new customers"
            multiline
            rows={3}
            error={errors.upsell}
          />
        )}
      </div>
    </div>
  );
};

export default UpsellPreferences;
