import React from 'react';

export interface CiButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: 'default' | 'small' | 'medium';
  loading?: boolean;
  customClasses?: string;
  prefixIcon?: React.ReactNode;
}

export const CiButton: React.FC<CiButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  size = 'default',
  loading = false,
  prefixIcon,
  customClasses,
  ...props
}) => {
  const baseClasses = [
    // Base layout and sizing
    'box-border',
    'content-stretch',
    'flex',
    'gap-2',
    'items-center',
    'justify-center',
    'relative',
    'rounded-[6px]',
    'shrink-0',

    // Typography
    'font-medium',
    'text-[14px]',
    'leading-[24px]',
    'text-nowrap',

    // Transitions and interactions
    'transition-all',
    'duration-200',
    'ease-in-out',
    'cursor-pointer',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',

    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'cursor-wait',
  ].filter(Boolean);

  const variantClasses = {
    primary: [
      'bg-[#4600f2]',
      'text-white',
      'border-transparent',
      'hover:bg-[#3d00d9]',
      'active:bg-[#3400c0]',
      'focus:ring-[#4600f2]/20',
      disabled && 'hover:bg-[#4600f2]',
    ],
    secondary: [
      'bg-white',
      'text-neutral-950',
      'border',
      'border-[#cfcfcf]',
      'border-solid',
      'hover:bg-gray-50',
      'active:bg-gray-100',
      'focus:ring-gray-200',
      disabled && 'hover:bg-white',
    ],
  };

  const sizeClasses = {
    small: 'px-3 py-[3px]',
    default: 'pl-[8px] pr-[12px] py-[6px]',
    medium: 'px-4 py-2',
  };

  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant].filter(Boolean),
    sizeClasses[size],
    customClasses,
  ].join(' ');

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={allClasses}
      {...props}
    >
      {loading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!!prefixIcon && prefixIcon}
      <span className="whitespace-pre">{children}</span>
    </button>
  );
};

export default CiButton;
