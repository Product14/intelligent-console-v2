import React from 'react';

interface CustomizationInputProps {
  label?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  labelColor?: string;
  disabled?: boolean;
}

const CustomizationInput: React.FC<CustomizationInputProps> = ({
  label,
  description,
  value,
  onChange,
  placeholder = '',
  multiline = false,
  rows = 3,
  error,
  labelColor = 'text-black/80',
  disabled = false,
}) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {(!!label || !!description) && (
        <div className="flex flex-col gap-1">
          {!!label && (
            <label
              className={`text-sm font-semibold leading-normal ${labelColor}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs font-normal leading-tight text-black/60">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`rounded-lg border px-3 py-2.5 text-sm font-normal leading-tight text-black/80 placeholder:text-black/40 focus:border-[#4600f2] focus:outline-none ${
              error ? 'border-red-500' : 'border-black/10'
            } ${disabled ? 'cursor-not-allowed bg-black/5' : 'bg-white'}`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`rounded-lg border px-3 py-2.5 text-sm font-normal leading-tight text-black/80 placeholder:text-black/40 focus:border-[#4600f2] focus:outline-none ${
              error ? 'border-red-500' : 'border-black/10'
            } ${disabled ? 'cursor-not-allowed bg-black/5' : 'bg-white'}`}
          />
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
};

export default CustomizationInput;
