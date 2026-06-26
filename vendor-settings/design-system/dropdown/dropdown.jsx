'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, Search } from 'lucide-react';

import useOnClickOutside from '@spyne-console/hooks/useOnClickOutside';

export default function Dropdown({
  id,
  label,
  options,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
  error,
  isRequired = false,
  disabled = false,
  enableSearch = false,
  containerClassName,
  theme = 'light',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // Find the selected option, handling both string and number types
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(selectedValue)
  );

  // Filter options based on search query
  useEffect(() => {
    if (!enableSearch || searchQuery.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options, enableSearch]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle clicks outside the dropdown
  useOnClickOutside(dropdownRef, () => {
    if (isOpen) {
      onToggle(id);
    }
  });

  return (
    <div className="flex flex-col" ref={dropdownRef}>
      <label
        htmlFor={id}
        className={`mb-2 text-xs font-normal md:text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      >
        {label}{' '}
        {isRequired && (
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            *
          </span>
        )}
      </label>
      <div className="relative">
        <button
          type="button"
          id={id}
          data-dropdown-toggle={id}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${containerClassName} ${
            theme === 'dark'
              ? 'bg-[#1e2532] text-white'
              : 'bg-white text-gray-900'
          } ${
            error
              ? 'border-red-500'
              : theme === 'dark'
                ? 'border-[#374151]'
                : 'border-gray-300'
          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          onClick={() => onToggle(id)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.image &&
              (selectedOption.imageType === 'icon' ? (
                <selectedOption.image className="fill-black-60 mr-2 h-6 w-6" />
              ) : (
                <img
                  src={selectedOption.image}
                  alt={selectedOption.text}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ))}
            <span
              className={`${!selectedValue ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xs md:text-sm`}
            >
              {selectedOption
                ? selectedOption.text
                : `Select ${label.toLowerCase()}`}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute z-10 mt-1 w-full rounded-xl border ${theme === 'dark' ? 'border-[#374151] bg-[#1e2532]' : 'border-gray-300 bg-white'} shadow-lg`}
          >
            {enableSearch && (
              <div
                className={`sticky top-0 rounded-t-xl border-b ${theme === 'dark' ? 'border-[#374151] bg-[#1e2532]' : 'border-gray-200 bg-white'} p-2`}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 pl-9 text-xs md:text-sm ${
                      theme === 'dark'
                        ? 'border-[#374151] bg-[#1e2532] text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    } focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <Search
                    className={`absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  />
                </div>
              </div>
            )}
            <ul className="max-h-60 overflow-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`flex cursor-pointer items-center px-4 py-2 ${theme === 'dark' ? 'hover:bg-[#2d3748]' : 'hover:bg-gray-100'} text-xs md:text-sm`}
                    onClick={() => onSelect(id, option)}
                  >
                    {option.image &&
                      (option.imageType === 'icon' ? (
                        <option.image className="fill-black-60 mr-2 h-6 w-6" />
                      ) : (
                        <img
                          src={option.image}
                          alt={option.text}
                          className="mr-2 h-6 w-6 rounded-full object-cover"
                        />
                      ))}
                    <span className="flex-grow">{option.text}</span>
                    {String(selectedValue) === String(option.value) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </li>
                ))
              ) : (
                <li
                  className={`px-4 py-2 text-xs md:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  No results found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 md:text-sm">{error}</p>}
    </div>
  );
}
