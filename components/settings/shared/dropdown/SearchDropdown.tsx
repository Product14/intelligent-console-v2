import React, { useEffect, useRef, useState } from 'react';
import { IoMdCheckmark } from 'react-icons/io';

import { DropdownOption } from '@spyne-console/design-system/dropdown';

import CommonDropdown from './Dropdown';

interface SearchDropdownProps {
  options: DropdownOption[];
  value: any;
  onChange: (value: any) => void;
  className?: string;
  maxHeight?: string;
  triggerClassName?: string;
  placeholder?: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  options,
  value,
  onChange,
  className = 'w-full',
  maxHeight = 'max-h-60',
  triggerClassName = '',
  placeholder = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  // const optionsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const [searchTerm, setSearchTerm] = useState(selectedOption?.label || '');

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    }
  }, [selectedOption]);

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (!selectedOption) {
        setSearchTerm('');
      }
      // setIsFocused(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsFocused(open);
    if (!open) {
      setFilteredOptions(options);
      if (!selectedOption) {
        setSearchTerm('');
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFocused(true);
  };

  const shouldFloatLabel = isFocused || selectedOption || searchTerm;

  return (
    <div
      className={`relative rounded-lg bg-white ${className}`}
      onBlur={handleBlur}
    >
      <div
        className={`absolute left-3 z-10 bg-white transition-all duration-200 ease-in-out ${shouldFloatLabel ? '-top-2 text-xs' : 'pointer-events-none top-1/2 -translate-y-1/2 text-base'} ${isFocused ? 'text-blue-light' : 'text-black/40'}`}
      >
        {placeholder}
      </div>
      <CommonDropdown
        className="h-full w-full"
        triggerClassName={`${triggerClassName} h-full`}
        isOpen={isFocused}
        onOpenChange={handleOpenChange}
      >
        <CommonDropdown.Trigger
          className={`flex h-full w-full rounded-lg border bg-white transition-all duration-200 ease-in-out ${isFocused ? 'border-blue-light' : 'border-black/10'} p-3 text-sm ${triggerClassName}`}
          showArrow={false}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none transition-colors duration-200 ease-in-out placeholder:text-black/40 placeholder:transition-colors placeholder:duration-200 placeholder:ease-in-out"
            onClick={handleInputClick}
            onFocus={(e) => {
              e.stopPropagation();
              setIsFocused(true);
            }}
            placeholder={shouldFloatLabel ? '' : placeholder}
          />
        </CommonDropdown.Trigger>
        <CommonDropdown.Menu>
          <CommonDropdown.Options className={`${maxHeight} overflow-auto p-2`}>
            {filteredOptions.map((option) => (
              <CommonDropdown.Option
                key={option.value}
                onClick={() => {
                  console.log('SearchDropdown option clicked:', option.value);
                  onChange(option.value);
                  setSearchTerm(option.label);
                  setIsFocused(false);
                }}
                className={`transition-colors duration-150 ease-in-out ${
                  option.value === selectedOption?.value
                    ? 'bg-gray-100 font-medium text-purple-700'
                    : 'hover:bg-gray-50'
                }`}
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

export default SearchDropdown;
