import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { IoSearchOutline } from 'react-icons/io5';
import { PiWarningCircle } from 'react-icons/pi';

import classNames from 'classnames';

import Button from '@spyne-console/design-system/button';

import { DropDownMenuRenderer } from './dropdown-menu-renderer';
import { CIDropdownMenuOption } from './model';

type DropdownVariant = 'default' | 'filter' | 'minimal' | 'clean';

interface CIDropdownProps {
  label?: string;
  selectedValues: CIDropdownMenuOption[];
  options: CIDropdownMenuOption[];
  onChange: (values: CIDropdownMenuOption[]) => void;
  placeholder?: string;
  showCheckmark?: boolean;
  isMultiSelect?: boolean;
  error?: string;
  required?: boolean;
  variant?: DropdownVariant;
  allowContentOverflow?: boolean;
  overflowWidth?: number;
  allowDeselection?: boolean;
  showClearButton?: boolean;
  allowSearch?: boolean;
  isSearchLoading?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  customTrigger?: React.ReactNode;
  labelColor?: string; // New prop for custom label color
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showSelectAll?: boolean;
  triggerClassName?: string;
  disabled?: boolean;
  /** Upper bound (px) on the open menu height; still respects viewport-safe dynamic max. */
  menuMaxHeight?: number;
}

const CIDropdown = ({
  label,
  selectedValues,
  options,
  onChange,
  placeholder,
  showCheckmark = true,
  isMultiSelect = false,
  error,
  required = false,
  variant = 'default',
  allowContentOverflow = false,
  overflowWidth,
  allowDeselection = false,
  showClearButton = false,
  allowSearch = false,
  isSearchLoading = false,
  searchPlaceholder = 'Search...',
  onSearchChange,
  customTrigger,
  labelColor, // New prop
  open,
  onOpenChange,
  showSelectAll = false,
  triggerClassName = '',
  disabled = false,
  menuMaxHeight,
}: CIDropdownProps) => {
  const [selectedOptions, setSelectedOptions] =
    useState<CIDropdownMenuOption[]>(selectedValues);
  const [triggerWidth, setTriggerWidth] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [contentMaxHeight, setContentMaxHeight] = useState<number>(320);

  const hasError = Boolean(error);

  useEffect(() => {
    setSelectedOptions(selectedValues);
  }, [selectedValues]);
  // test check
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(overflowWidth ?? triggerRef.current.offsetWidth);
    }
  }, [overflowWidth]);

  // Dynamically calculate a safe max height for the menu based on viewport and trigger position
  useEffect(() => {
    const VIEWPORT_BUFFER_PX = 400; // keep dropdown within viewport with a bottom buffer

    const computeMaxHeight = () => {
      const viewportLimit = Math.max(
        160,
        window.innerHeight - VIEWPORT_BUFFER_PX
      );
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        setContentMaxHeight(viewportLimit);
        return;
      }
      const spaceBelow = window.innerHeight - rect.bottom - 8; // small padding
      const spaceAbove = rect.top - 8;
      const anchorSpace = Math.max(spaceBelow, spaceAbove);
      const maxHeight = Math.max(160, Math.min(anchorSpace, viewportLimit));
      setContentMaxHeight(maxHeight);
    };

    computeMaxHeight();
    window.addEventListener('resize', computeMaxHeight);
    window.addEventListener('scroll', computeMaxHeight, true);
    return () => {
      window.removeEventListener('resize', computeMaxHeight);
      window.removeEventListener('scroll', computeMaxHeight, true);
    };
  }, []);

  const handleOptionClick = (option: CIDropdownMenuOption) => {
    let nextSelected: CIDropdownMenuOption[];
    const isAlreadySelected = selectedOptions.find(
      (selectedOption) => selectedOption.value === option.value
    );
    if (isMultiSelect) {
      nextSelected = isAlreadySelected
        ? selectedOptions.filter(
            (selectedOption) => selectedOption.value !== option.value
          )
        : [...selectedOptions, option];
    } else {
      nextSelected = isAlreadySelected && allowDeselection ? [] : [option];
    }
    setSelectedOptions(nextSelected);
    onChange(nextSelected);
  };

  const handleClearSelection = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  const handleSelectAll = () => {
    setSelectedOptions(options);
    onChange(options);
  };

  const displayText = () => {
    const placeholderText = placeholder || 'Select an option';
    if (variant === 'filter' && selectedOptions.length > 0) {
      return (
        <span className="text-sm font-medium leading-tight tracking-tight text-[#8f8f8f]">
          {placeholderText}: &nbsp;
          <span className="text-sm font-medium leading-tight tracking-tight text-neutral-950">
            {selectedOptions[0].label}
            {`${selectedOptions.length > 1 ? ` +${selectedOptions.length - 1}` : ''}`}
          </span>
        </span>
      );
    }

    if (selectedOptions.length === 0) {
      return placeholderText;
    }

    if (isMultiSelect) {
      // For clean variant and multi-select, show "First Item + N" format
      if (variant === 'clean' && selectedOptions.length > 0) {
        return `${selectedOptions[0].label}${selectedOptions.length > 1 ? ` + ${selectedOptions.length - 1}` : ''}`;
      }
      // Default multi-select display
      return `${selectedOptions.length} Selected`;
    }

    if (selectedOptions[0].hideLabel && selectedOptions[0].icon) {
      return selectedOptions[0].selectedIcon || selectedOptions[0].icon;
    }
    return selectedOptions[0].label;
  };

  const getContainerStyles = () => {
    // Default variant styling - original design
    let baseStyles =
      'relative flex h-10 items-center rounded-md bg-white border outline-none transition-colors';

    if (variant === 'filter') {
      // Filter variant styling - clean, minimal design matching Figma
      return `${baseStyles} h-8`;
    }

    if (variant === 'minimal') {
      // Minimal variant - no input box styling, just content
      return 'relative flex items-center outline-none';
    }

    if (hasError) {
      return `${baseStyles} border-red-300`;
    }

    return `${baseStyles} border-gray-300`;
  };

  const getTextStyles = () => {
    // Default variant text styling
    let baseStyles = 'text-sm';

    if (variant === 'filter') {
      return `${baseStyles} font-medium`;
    }

    if (variant === 'minimal') {
      return 'text-xs font-medium text-neutral-950';
    }

    if (hasError) {
      return `${baseStyles} text-red-900`;
    }

    return `${baseStyles} text-gray-900`;
  };

  const getPlaceholderStyles = () => {
    let baseStyles = 'text-sm font-normal';

    if (variant === 'filter') {
      return `${baseStyles} font-medium`;
    }

    // Default variant placeholder styling - match GenericInput exactly
    if (hasError) {
      return 'text-red-400';
    }
    return 'text-sm font-normal text-gray-light_50';
  };

  const getTriggerPadding = () => {
    if (variant === 'filter') {
      return 'px-3 py-[6px]';
    }
    if (variant === 'minimal') {
      return 'p-0';
    }
    return 'px-3 py-2';
  };

  const getChevronStyles = () => {
    if (variant === 'filter') {
      return 'h-4 w-4 text-gray-700 ml-1';
    }
    if (variant === 'minimal') {
      return 'hidden'; // Hide chevron in minimal variant
    }
    return 'h-4 w-4 text-gray-400';
  };

  const getContentWidth = () => {
    const width = overflowWidth || triggerWidth || 'auto';
    if (allowContentOverflow) {
      return { minWidth: width }; // Let content size naturally
    }
    return { width: width };
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  // Filter options based on search value
  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  const openMenuMaxHeight =
    menuMaxHeight !== undefined
      ? Math.min(contentMaxHeight, menuMaxHeight)
      : contentMaxHeight;

  return (
    <div className={variant === 'filter' ? 'w-auto' : 'w-full'}>
      {label && (variant === 'default' || variant === 'clean') && (
        <label
          className={`mb-2 block text-xs font-medium ${labelColor ? `text-[${labelColor}]` : 'text-gray-700'}`}
        >
          {label}
          {required && <span className="text-gray-700">*</span>}
        </label>
      )}

      <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger asChild>
          {customTrigger ? (
            customTrigger
          ) : (
            <button
              ref={triggerRef}
              type="button"
              disabled={disabled}
              className={classNames(
                `${getContainerStyles()} ${getTriggerPadding()} ${
                  variant === 'filter'
                    ? 'w-auto min-w-fit'
                    : variant === 'minimal'
                      ? 'w-auto'
                      : 'w-full'
                } ${variant === 'minimal' ? '' : 'justify-between'} text-left`,
                disabled && 'cursor-not-allowed opacity-50',
                triggerClassName
              )}
            >
              <span
                className={`${
                  selectedOptions.length === 0
                    ? getPlaceholderStyles()
                    : getTextStyles()
                } whitespace-nowrap`}
              >
                {displayText()}
              </span>
              <FiChevronDown className={getChevronStyles()} />
            </button>
          )}
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
            sideOffset={4}
            collisionPadding={4}
            align="start"
            style={{
              ...getContentWidth(),
              maxHeight: openMenuMaxHeight,
              zIndex: 9999,
            }}
          >
            {/* Sticky Search Bar */}
            {allowSearch && (
              <div className="sticky top-0 z-10 border-none bg-white outline-none">
                <div
                  className={classNames(
                    'flex items-center gap-2 border-b px-2 py-[10px] outline-none',
                    isSearchFocused || searchValue
                      ? 'border-[#4600F2]'
                      : 'border-[#8F8F8F]'
                  )}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <IoSearchOutline className="h-4 w-4 text-[#8F8F8F]" />
                  <input
                    type="text"
                    value={searchValue}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder={searchPlaceholder}
                    disabled={false}
                    className={classNames(
                      'w-full focus:outline-none',
                      'text-sm font-normal leading-tight text-neutral-950 placeholder:text-[#8F8F8F]'
                    )}
                  />
                </div>
              </div>
            )}
            {isSearchLoading ? (
              <DropdownMenu.Item className="h-full w-full border-none outline-none">
                <div className="flex h-full items-center justify-center gap-2 p-5">
                  Loading...
                </div>
              </DropdownMenu.Item>
            ) : filteredOptions.length === 0 && searchValue.trim() ? (
              <div className="flex h-16 items-center justify-center text-sm text-gray-500">
                No results found
              </div>
            ) : (
              <DropDownMenuRenderer
                selectedOptions={selectedOptions}
                options={filteredOptions}
                handleOptionClick={handleOptionClick}
                showCheckmark={showCheckmark}
                isMultiSelect={isMultiSelect}
                showClearButton={showClearButton}
                variant={variant}
                clearSelection={handleClearSelection}
                showSelectAll={showSelectAll}
                selectAll={handleSelectAll}
                allSelected={selectedOptions.length === options.length}
              />
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Error Message Container - only show for default variant when there's an error */}
      {variant === 'default' && hasError && (
        <div className="mt-1">
          <div className="flex items-center gap-1 text-sm text-red-600">
            <PiWarningCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default CIDropdown;
