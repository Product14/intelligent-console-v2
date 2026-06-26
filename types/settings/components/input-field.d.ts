declare module '@spyne-console/design-system/input-field' {
  export interface InputFieldProps {
    id: string;
    placeholder?: string;
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    type?: 'text' | 'email' | 'number' | 'password';
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

  const InputField: React.FC<InputFieldProps>;
  export default InputField;
}
