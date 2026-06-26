import React from 'react';

interface SwitcherOption {
  value: string;
  label: string;
  width?: string;
}

interface GenericSwitcherProps {
  options: SwitcherOption[];
  selectedValue?: string;
  onOptionSelect?: (value: string) => void;
  className?: string;
}

const GenericSwitcher: React.FC<GenericSwitcherProps> = ({
  options,
  selectedValue,
  onOptionSelect,
  className = '',
}) => {
  const handleOptionClick = (value: string) => {
    if (onOptionSelect) {
      onOptionSelect(value);
    }
  };

  const isConversationsRoute =
    typeof window !== 'undefined' &&
    window.location.pathname === '/conversations';

  return !isConversationsRoute ? (
    <div
      className={`flex h-8 items-center rounded-md border border-[rgba(0,9,50,0.12)] bg-[#f1f3f4] p-0.5 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleOptionClick(option.value)}
          className={`h-full rounded-md px-4 py-0 text-sm font-medium transition-all ${
            selectedValue === option.value
              ? 'bg-white text-[#4600f2] shadow-sm'
              : 'bg-transparent text-[rgba(0,5,9,0.89)] hover:bg-white/50'
          } flex items-center justify-center ${option.width || 'w-20'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  ) : null;
};

export default GenericSwitcher;
