'use client';

// Typed wrappers around the real @spyne-console/design-system components
// (vendored under /vendor/design-system). These are the production primitives.

import React from 'react';
import RawInputField from '@/vendor-settings/design-system/input-field/input-field';
import RawButton from '@/vendor-settings/design-system/button/button';
import RawToggle from '@/vendor-settings/design-system/toggle/toggle';
import RawCheckbox from '@/vendor-settings/design-system/checkbox/checkbox';

const InputFieldAny = RawInputField as unknown as React.ComponentType<Record<string, unknown>>;
const ButtonAny = RawButton as unknown as React.ComponentType<Record<string, unknown>>;
const ToggleAny = RawToggle as unknown as React.ComponentType<Record<string, unknown>>;
const CheckboxAny = RawCheckbox as unknown as React.ComponentType<Record<string, unknown>>;

export interface InputProps {
  id?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  floatingLabel?: boolean;
  className?: string;
}

export function Input({ floatingLabel = false, ...props }: InputProps) {
  return <InputFieldAny floatingLabel={floatingLabel} {...props} />;
}

export interface DsButtonProps {
  label: string;
  onClick?: () => void;
  type?: 'primary' | 'bordered' | 'red';
  size?: 'A' | 'AA' | 'AAA';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function DsButton(props: DsButtonProps) {
  return <ButtonAny {...props} />;
}

export interface DsToggleProps {
  id: string;
  toggle: boolean;
  toggleHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export function DsToggle(props: DsToggleProps) {
  return <ToggleAny {...props} />;
}

export interface DsCheckboxProps {
  id: string;
  label?: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  allowDeselect?: boolean;
  disabled?: boolean;
}

export function DsCheckbox({ onChange, ...rest }: DsCheckboxProps) {
  return (
    <CheckboxAny
      {...rest}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(!!e?.target?.checked)}
    />
  );
}
