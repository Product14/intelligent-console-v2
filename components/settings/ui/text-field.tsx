'use client';

import React from 'react';
import { cn } from '@/lib/settings/cn';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-black-80">
          {label}
          {required && <span className="ml-0.5 text-red">*</span>}
        </span>
        <input
          ref={ref}
          className={cn(
            'h-10 w-full rounded-lg border bg-white px-3 text-sm text-black-87 outline-none transition-colors',
            'placeholder:text-black-40 focus:border-blue-light focus:ring-2 focus:ring-blue-12',
            error ? 'border-red' : 'border-blue-1',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <span className="mt-1 block text-xs text-red">{error}</span>
        ) : hint ? (
          <span className="mt-1 block text-xs text-black-40">{hint}</span>
        ) : null}
      </label>
    );
  }
);
TextField.displayName = 'TextField';
