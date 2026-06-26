import React, { useState } from 'react';

import { SvgRenderer } from './RenderSvg/SvgRenderer';

interface GenericSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
  isSearch?: boolean;
  size?: 'small' | 'medium';
  isValid?: boolean;
  hasError?: boolean;
  disabled?: boolean;
}

const GenericSearch: React.FC<GenericSearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Search',
  className = '',
  width = 'w-[200px]',
  isSearch = true,
  size = 'small',
  isValid,
  hasError = false,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (onChange && !disabled) {
      onChange(inputValue);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Size-based styling matching Figma design
  const sizeClasses = {
    small: {
      container: 'h-8',
      icon: 'h-4 w-4',
      text: 'text-sm',
      padding: 'px-1',
    },
    medium: {
      container: 'h-10',
      icon: 'h-4 w-4',
      text: 'text-sm',
      padding: 'px-1',
    },
  };

  const currentSize = sizeClasses[size];

  // State-based styling matching Figma design
  const getContainerStyles = () => {
    let baseStyles = `flex ${currentSize.container} items-center rounded-[6px] bg-[rgba(255,255,255,0.9)] ${currentSize.padding}`;

    if (disabled) {
      return `${baseStyles} border border-[#cfcfcf] cursor-not-allowed opacity-60`;
    }

    if (hasError) {
      return `${baseStyles} border border-red-400`;
    }

    if (isValid) {
      return `${baseStyles} border border-green-400`;
    }

    if (isFocused) {
      return `${baseStyles} border border-[rgba(70,0,242,0.6)]`;
    }

    // Default state - matching Figma design
    return `${baseStyles} border border-[#cfcfcf]`;
  };

  const getIconStyles = () => {
    let baseStyles = `${currentSize.icon}`;

    if (disabled) {
      return `${baseStyles} text-gray-400`;
    }

    if (hasError) {
      return `${baseStyles} text-red-500`;
    }

    if (isValid) {
      return `${baseStyles} text-green-500`;
    }

    if (isFocused) {
      return `${baseStyles} text-[rgba(70,0,242,0.8)]`;
    }

    // Default state
    return `${baseStyles} text-[rgba(0,5,29,0.45)]`;
  };

  const getInputStyles = () => {
    let baseStyles = `flex-1 bg-transparent px-2 py-0 ${currentSize.text} outline-none font-normal leading-5`;

    if (disabled) {
      return `${baseStyles} text-gray-400 cursor-not-allowed placeholder:text-gray-300`;
    }

    if (hasError) {
      return `${baseStyles} text-red-700 placeholder:text-red-400`;
    }

    if (isValid) {
      return `${baseStyles} text-green-700 placeholder:text-green-400`;
    }

    if (isFocused) {
      return `${baseStyles} text-neutral-950 placeholder:text-[#cfcfcf]`;
    }

    // Default state - matching Figma design
    return `${baseStyles} text-neutral-950 placeholder:text-[#cfcfcf]`;
  };

  return (
    <div className={`relative ${width} ${className}`}>
      <div className={getContainerStyles()}>
        {isSearch && (
          <div className="flex items-center justify-center px-1">
            <SvgRenderer fileName="search-icon" className={getIconStyles()} />
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputStyles()}
        />
      </div>
    </div>
  );
};

export default GenericSearch;
