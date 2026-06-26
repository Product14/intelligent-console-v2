import React from 'react';

interface CIChipProps {
  label: string;
  onClick?: () => void;
  className?: string;
  backgroundColor: string;
  textColor: string;
  size: 'sm' | 'default' | 'lg';
  prefixIcon?: React.ReactNode;
}

export default function CIChip({
  label,
  onClick,
  className,
  backgroundColor = 'bg-[#f6eee7]',
  textColor = 'text-white',
  size = 'default',
  prefixIcon,
}: CIChipProps) {
  const sizeConfig = {
    sm: 'text-xs font-medium leading-tight rounded-full px-3.5 py-2',
    default: 'text-xs font-medium rounded-md py-1 pl-[6px] pr-2',
    lg: 'text-base',
  };
  return (
    <div
      className={`flex items-center gap-1 ${backgroundColor} ${textColor} ${sizeConfig[size]} transition-colors duration-150 ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className} `.trim()}
      onClick={onClick}
    >
      {!!prefixIcon && prefixIcon}
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}
