import React from 'react';

import CustomizationInput from './CustomizationInput';
import CustomizationRadio from './CustomizationRadio';

interface TradeInRequestProps {
  values: {
    isLink: boolean;
    data: string;
  };
  onChange: (field: string, value: string) => void;
  errors?: {
    referenceUrl?: string;
  };
}

const TradeInRequest: React.FC<TradeInRequestProps> = ({
  values,
  onChange,
  errors,
}) => {
  const label = values.isLink
    ? 'Enter the URL to be shared with customer'
    : 'Enter the query to be noted';
  const placeholder = values.isLink
    ? 'https://example.com/trade-in'
    : 'Enter the query to be noted';
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold leading-7 text-black/80">
          Trade-In Request Handling
        </h3>
        <p className="text-sm font-normal leading-tight text-black/60">
          How should the agent handle trade-in evaluation?
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <CustomizationRadio
            name="tradeInHandling"
            value="false"
            label="Note query and Arrange callback"
            checked={!values.isLink}
            onChange={(value) => onChange('isLink', value)}
          />
          <CustomizationRadio
            name="tradeInHandling"
            value="true"
            label="Share link for reference"
            checked={values.isLink}
            onChange={(value) => onChange('isLink', value)}
          />
        </div>

        {values.isLink && (
          <CustomizationInput
            label={label}
            value={values.data || ''}
            onChange={(value) => onChange('data', value)}
            placeholder={placeholder}
            error={errors?.referenceUrl}
          />
        )}
      </div>
    </div>
  );
};

export default TradeInRequest;
