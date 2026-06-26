import React, { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import classNames from 'classnames';

import Dropdown from './Dropdown';

interface SelectOption {
  value: string | number;
  label: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  onChange: (value: string | number, option: SelectOption) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  showArrow?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  isFilterDropdown?: boolean;
}

const DropdownChildWithArrow = ({ child }: { child: React.ReactNode }) => {
  // Check if child is a valid React element that can accept props
  if (React.isValidElement(child)) {
    return React.cloneElement(child as React.ReactElement<any>, {
      isSelected: true,
    });
  }
  // If it's not a valid element, just render it as is
  return <>{child}</>;
};

export default function SelectDropdown({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  disabled = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  optionClassName = '',
  showArrow = true,
  searchable = false,
  searchPlaceholder = 'Search options...',
  isFilterDropdown = false,
}: SelectDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleOptionClick = (option: SelectOption) => {
    onChange(option.value, option);
    setSearchTerm('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm('');
    }
  };

  return (
    <Dropdown
      className={className}
      triggerClassName={triggerClassName}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      hasContent={!!selectedOption}
    >
      <Dropdown.Trigger
        disableTriggerStyle={!!selectedOption?.children}
        className={classNames(
          !selectedOption?.children &&
            'w-full rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50',
          !selectedOption?.children && triggerClassName,
          isFilterDropdown ? 'border-1 border-[#4600F2]' : 'border-gray-300'
        )}
        disabled={disabled}
        showArrow={!selectedOption?.children && showArrow}
      >
        {selectedOption?.children ? (
          <DropdownChildWithArrow child={selectedOption.children} />
        ) : (
          <span
            className={classNames(
              isFilterDropdown
                ? 'text-[#4600F2]'
                : selectedOption
                  ? 'text-gray-900'
                  : 'text-gray-500'
            )}
          >
            {selectedOption && !isFilterDropdown
              ? selectedOption.label
              : placeholder}
          </span>
        )}
      </Dropdown.Trigger>

      <Dropdown.Menu className={`max-h-60 py-1 ${menuClassName}`}>
        {searchable && (
          <div className="px-2 pb-2">
            <Dropdown.SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={searchPlaceholder}
              className="w-full"
            />
          </div>
        )}

        <Dropdown.Options>
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchable && searchTerm
                ? 'No matching options'
                : 'No options available'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <Dropdown.Option
                key={option.value}
                onClick={() => !option.disabled && handleOptionClick(option)}
                className={`${
                  option.disabled
                    ? 'cursor-not-allowed text-gray-400'
                    : option.value === value
                      ? 'bg-blue-4 text-[#4600F2]'
                      : 'text-gray-900'
                } ${optionClassName}`}
              >
                {option.children ?? option.label}
              </Dropdown.Option>
            ))
          )}
        </Dropdown.Options>
      </Dropdown.Menu>
    </Dropdown>
  );
}

// Export the types for convenience
export type { SelectOption, SelectDropdownProps };
