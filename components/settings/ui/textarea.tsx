'use client';

import React from 'react';
import { cn } from '@/lib/settings/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, ...props }: TextareaProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-black-60">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-6 text-black-80 outline-none',
          'placeholder:text-black-40 focus:border-blue-light focus-visible:border-blue-light',
          className
        )}
        rows={3}
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-black-40">{hint}</span>}
    </label>
  );
}
