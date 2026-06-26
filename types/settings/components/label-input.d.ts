declare module '@spyne-console/design-system/input-field/input-field-2' {
  import * as React from 'react';

  export interface LabelInputProps {
    id: string;
    name: string;
    label: string;
    value: string | number;
    labelClassName?: string;
    onChange: (value: string | number) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    type?: 'text' | 'email' | 'number' | 'password';
    placeholder?: string;
    required?: boolean;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    mandatory?: boolean;
    error?: string;
    debounceTime?: number;
    autoComplete?: string;
    maxLength?: number;
  }

  const LabelInput: React.FC<LabelInputProps>;
  export default LabelInput;
}
