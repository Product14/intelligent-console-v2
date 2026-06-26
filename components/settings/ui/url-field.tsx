'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/settings/cn';
import {
  checkUrlReachable,
  type UrlReachability,
} from '@/lib/settings/sales-policies-validation';

interface UrlFieldProps {
  value: string | undefined;
  onChange(next: string): void;
  placeholder?: string;
  disabled?: boolean;
  /** Width class for the text input. Default fits ~70 chars. */
  width?: string;
}

/**
 * Text input for an HTTPS URL paired with a "Test URL" button + reachability
 * indicator. Replaces the inline pattern that previously lived in the Finance
 * Pre-Qualify card so every URL field on the page has the same UX.
 */
export function UrlField({
  value,
  onChange,
  placeholder = 'https://…',
  disabled,
  width = 'w-72',
}: UrlFieldProps) {
  const [check, setCheck] = useState<UrlReachability>({ state: 'idle' });

  const runCheck = async () => {
    if (!value) return;
    setCheck({ state: 'checking' });
    const result = await checkUrlReachable(value);
    setCheck(result);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        type="url"
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setCheck({ state: 'idle' });
        }}
        className={cn(
          'h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-black-80 outline-none transition-colors',
          'focus:border-blue-light focus:ring-2 focus:ring-blue-12',
          'disabled:cursor-not-allowed disabled:opacity-50',
          width
        )}
      />
      <button
        type="button"
        onClick={runCheck}
        disabled={!value || check.state === 'checking' || disabled}
        className="inline-flex items-center gap-1 rounded-md border border-blue-light/30 px-2 py-1 text-xs font-medium text-blue-light transition-colors hover:bg-blue-2 disabled:opacity-50"
      >
        {check.state === 'checking' && (
          <Loader2 className="h-3 w-3 animate-spin" />
        )}
        Test URL
      </button>
      {check.state === 'reachable' && (
        <span className="inline-flex items-center gap-1 text-xs text-green-darker">
          <CheckCircle2 className="h-3 w-3" />
          Reachable
        </span>
      )}
      {check.state === 'unreachable' && (
        <span className="inline-flex items-center gap-1 text-xs text-red">
          <AlertCircle className="h-3 w-3" />
          {check.reason ?? 'Unreachable'}
        </span>
      )}
    </div>
  );
}
