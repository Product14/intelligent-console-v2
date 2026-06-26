import React from 'react';

declare module '@spyne-console/design-system/text-area' {
  export interface TextAreaProps {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    mandatory?: boolean;
    error?: string;
    debounceTime?: number;
    rows?: number;
    maxLength?: number;
    minLength?: number;
    autoComplete?: string;
    showCharacterCount?: boolean;
  }

  export default function TextArea(props: TextAreaProps): JSX.Element;
}
