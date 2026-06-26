'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Search } from '@spyne-console/design-system/icons';

import useOutsideClick from '@spyne-console/hooks/useOutsideClick';

import { cn } from '@spyne-console/utils/cn';

import Dropdown from '../dropdown/dropdown';
import Spinner from '../spinner/spinner';

export default function SearchBar({
  onChange = () => {},
  placeholder = 'Search',
  value = '',
  className = 'relative rounded-lg border border-black-10 bg-white h-full w-full',
  handleOptionClick = () => {},
  dropdownOptions = [],
  loadMoreData = () => {},
  hasMoreData = false,
  loader = <Spinner />,
  endMessage = '',
  dropdownClassName = '',
  dropdownOptionClassName = '',
  showSearchOptions = false,
  searchDisabled = false,
  searchIconVisible = true,
  searchIconClickable = false,
  searchOnBlur = false,
  searchOnEnter = false,
  searchOnType = true,
  label = '',
  inputClassName = '',
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isInputActive, setIsInputActive] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with external value when it changes (e.g., when filters are cleared)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle input change
  const handleChange = (e) => {
    if (searchDisabled) return;

    const newValue = e.target.value;
    setInputValue(newValue);

    // Always trigger onChange immediately if searchOnType is true
    if (searchOnType) {
      onChange(newValue);
    }
  };

  // Handle search icon click
  const handleSearchClick = () => {
    if (searchIconClickable) {
      onChange(inputValue);
    }
    setIsInputActive(true);
  };

  // Handle key press (Enter)
  const handleKeyPress = (e) => {
    if (searchOnEnter && e.key === 'Enter') {
      onChange(inputValue);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    if (searchOnBlur) {
      onChange(inputValue);
    }
  };

  // Handle dropdown option click
  const dropdownOptionClick = (data) => {
    setIsInputActive(false);
    handleOptionClick(data);
  };

  // Close dropdown when clicking outside
  useOutsideClick(dropdownRef, () => setIsInputActive(false));

  return (
    <div className="relative h-full w-full">
      <div
        className={cn('relative', className)}
        onClick={() => setIsInputActive(true)}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          disabled={searchDisabled}
          className={cn(
            'border-black-20 text-typography-200 peer w-full rounded-lg border px-3 py-2 text-sm font-normal leading-5',
            'focus:border-primary focus-visible:border-primary focus:outline-none focus-visible:outline-none',
            'placeholder:text-typography-100',
            { 'pr-8': searchIconVisible },
            inputClassName
          )}
        />
        {label && (
          <label
            className={cn(
              'peer-focus:text-primary text-typography-200 pointer-events-none absolute left-3 z-[2] bg-white px-0.5 text-xs font-normal transition ease-in-out',
              'top-3 -translate-y-5'
            )}
          >
            {label}
          </label>
        )}
      </div>

      {searchIconVisible && (
        <span
          ref={dropdownRef}
          onClick={handleSearchClick}
          className={cn(
            'absolute bottom-1/2 right-2 z-[2] translate-y-[50%] overflow-hidden bg-white pl-2',
            { 'cursor-pointer': searchIconClickable }
          )}
        >
          <Search className="fill-black-60 h-5 w-5" />
        </span>
      )}

      {showSearchOptions &&
      isInputActive &&
      (dropdownOptions.length > 0 || endMessage) ? (
        <Dropdown
          handleOptionClick={dropdownOptionClick}
          dropdownOptions={dropdownOptions}
          loadMoreData={loadMoreData}
          hasMoreData={hasMoreData}
          loader={loader}
          endMessage={endMessage}
          dropdownClassName={dropdownClassName}
          dropdownOptionClassName={dropdownOptionClassName}
        />
      ) : null}
    </div>
  );
}
