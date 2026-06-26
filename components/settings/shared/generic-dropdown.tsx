import React, { useState } from 'react';
import { IoMdCheckmark } from 'react-icons/io';

import { DropdownOption } from '@spyne-console/design-system/dropdown';

import CommonDropdown from '@/components/settings/shared/dropdown/Dropdown';

interface GenericDropdownProps {
  options: DropdownOption[];
  value: any;
  onChange: (value: any) => void;
  className?: string;
  maxHeight?: string;
  triggerClassName?: string;
  optionClassName?: (isSelected: boolean) => string;
  showSelectedIcon?: boolean;
  placeholder?: string;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
  options,
  value,
  onChange,
  className = 'w-full',
  placeholder,
  triggerClassName = '',
  optionClassName = (isSelected) =>
    isSelected ? 'bg-gray-100 text-black/80' : 'text-black/80',
  showSelectedIcon = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleBlur = () => {
    // setIsFocused(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsFocused(open);
  };

  const shouldFloatLabel = isFocused || selectedOption;

  return (
    <div
      className={`relative rounded-lg bg-white ${className}`}
      onBlur={handleBlur}
    >
      {placeholder && (
        <div
          className={`pointer-events-none absolute left-3 z-10 transition-all duration-200 ${shouldFloatLabel ? '-top-2 bg-white px-1 text-xs' : 'top-1/2 -translate-y-1/2 text-base'} ${isFocused ? 'text-blue-light' : 'text-black/40'}`}
        >
          {placeholder}
        </div>
      )}
      <CommonDropdown
        className="h-full w-full"
        triggerClassName={`${triggerClassName} h-full`}
        isOpen={isFocused}
        onOpenChange={handleOpenChange}
      >
        <CommonDropdown.Trigger
          className={`flex h-full w-full justify-between rounded-lg bg-white ${isFocused ? 'border-blue-light' : 'border-black/10'} px-3 py-2 text-sm ${triggerClassName}`}
          arrowClass="text-black/40 w-5 h-5 [&>svg]:w-5 [&>svg]:h-5"
        >
          <span>{selectedOption?.label}</span>
        </CommonDropdown.Trigger>
        <CommonDropdown.Menu>
          <CommonDropdown.Options className="max-h-60">
            {options.map((option) => (
              <CommonDropdown.Option
                key={option.value}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  onChange(option.value);
                }}
                className={
                  option.value === selectedOption?.value
                    ? 'bg-gray-100 font-medium text-purple-700'
                    : ''
                }
              >
                <div className="flex w-full items-center justify-between">
                  <span>{option.label}</span>
                  {option.value === selectedOption?.value && (
                    <IoMdCheckmark className="h-5 w-5 text-purple-700" />
                  )}
                </div>
              </CommonDropdown.Option>
            ))}
          </CommonDropdown.Options>
        </CommonDropdown.Menu>
      </CommonDropdown>
    </div>
  );
};

export default GenericDropdown;
