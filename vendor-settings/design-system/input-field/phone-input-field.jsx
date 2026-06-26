import React from 'react';
import PhoneInput from 'react-phone-input-2';

import { cn } from '@spyne-console/utils/cn';

export default function PhoneInputField({
  label,
  country = 'us',
  value,
  onChange,
  error,
  onBlur,
}) {
  const handleChange = (value, country, event, formattedValue) => {
    onChange(value);
  };

  return (
    <div
      className={cn('input-login onboard-phone-input relative', {
        'border-red': error,
      })}
    >
      <PhoneInput
        country={country}
        enableSearch
        autoFocus
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
      />
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
