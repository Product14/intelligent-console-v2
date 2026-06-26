'use client';

import { useId, useRef, useState } from 'react';

import SVG from '@spyne-console/design-system/svg';

import { useClickOutside } from '@spyne-console/hooks';

import { cn } from '@spyne-console/utils/cn';

export interface RadioSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface RadioSelectDropdownProps<T extends string> {
  readonly value: T | '';
  readonly options: readonly RadioSelectOption<T>[];
  readonly onChange: (value: T) => void;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly placeholder?: string;
  readonly error?: string;
  readonly className?: string;
  readonly triggerClassName?: string;
  readonly dropdownClassName?: string;
  readonly optionClassName?: string;
}

export default function RadioSelectDropdown<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  id = 'radio-select-dropdown',
  placeholder = 'Select',
  error,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  optionClassName = '',
}: RadioSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const optionId = (v: T | string) => `${listboxId}-option-${v}`;

  useClickOutside(containerRef, () => setIsOpen(false));

  const selectedOption =
    value === '' ? undefined : options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        id={id}
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={displayLabel}
        aria-invalid={!!error}
        className={cn(
          'flex min-w-[148px] items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm text-black/80 transition-colors',
          error ? 'border-red-500' : 'border-black/20',
          disabled && 'cursor-not-allowed opacity-60',
          !disabled && !error && 'hover:border-black/30 hover:bg-black/[0.02]',
          triggerClassName
        )}
      >
        <span
          className={cn(
            'truncate',
            selectedOption ? 'text-black/80' : 'text-black/50'
          )}
        >
          {displayLabel}
        </span>

        <SVG
          iconName="rightCaret"
          className={cn(
            'h-2.5 w-2.5 fill-black/50 transition-transform',
            isOpen ? 'rotate-[270deg]' : 'rotate-90'
          )}
        />
      </button>
      {error && (
        <p className="mt-0.5 text-[10px] text-red-600" role="alert">
          {error}
        </p>
      )}

      {isOpen && (
        // Custom radio-style dropdown (not native select) per design
        <div
          id={listboxId}
          role="listbox"
          tabIndex={0}
          aria-label={placeholder}
          aria-activedescendant={
            selectedOption ? optionId(selectedOption.value) : undefined
          }
          className={cn(
            'absolute left-0 top-full z-10 mt-1 max-h-[280px] min-w-full overflow-auto rounded-lg border border-black/15 bg-white py-1 shadow-lg',
            dropdownClassName
          )}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                id={optionId(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-blue-light/10 text-blue-light'
                    : 'text-black/80 hover:bg-black/5',
                  optionClassName
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected
                      ? 'border-blue-light bg-blue-light'
                      : 'border-black/30'
                  )}
                  aria-hidden
                >
                  {isSelected && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
