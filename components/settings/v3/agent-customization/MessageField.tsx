import React from 'react';

interface MessageFieldProps {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showRestoreDefault?: boolean;
  onRestoreDefault?: () => void;
  isDisabled?: boolean;
}

const MessageField: React.FC<MessageFieldProps> = ({
  title,
  description,
  placeholder,
  value,
  onChange,
  maxLength = 250,
  showRestoreDefault = false,
  onRestoreDefault,
  isDisabled = false,
}) => {
  const characterCount = value?.length || 0;
  const hasChanged = value !== '';

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-black/10 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold leading-7 text-black/80">
            {title}
          </h3>
          <p className="text-sm font-normal leading-tight text-black/60">
            {description}
          </p>
        </div>
        {showRestoreDefault && hasChanged && !isDisabled && (
          <button
            type="button"
            onClick={onRestoreDefault}
            className="text-sm font-semibold leading-[22px] text-[rgba(70,0,242,0.8)] underline hover:text-[rgba(70,0,242,1)]"
          >
            Restore default
          </button>
        )}
      </div>

      <div className="relative flex flex-col">
        <div
          className={`relative h-[174px] w-full overflow-clip rounded-lg border border-black/10 px-3 py-2.5 ${
            isDisabled ? 'bg-black/[0.04]' : 'bg-white'
          }`}
        >
          <textarea
            value={value}
            onChange={(e) => {
              if (!isDisabled && e.target.value.length <= maxLength) {
                onChange(e.target.value);
              }
            }}
            placeholder={placeholder}
            readOnly={isDisabled}
            disabled={isDisabled}
            className={`h-full w-full resize-none text-base leading-8 text-black/80 placeholder:text-black/30 focus:outline-none ${
              isDisabled
                ? 'cursor-not-allowed bg-transparent'
                : 'bg-transparent'
            }`}
            maxLength={maxLength}
          />
          <p className="absolute bottom-[25px] right-[26px] text-xs font-normal leading-4 text-black/30">
            {characterCount}/{maxLength}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageField;
