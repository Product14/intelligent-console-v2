import React, { ReactNode } from 'react';

interface ChipProps {
  label: string | ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  isSelectable?: boolean;
  isDisabled?: boolean;
  backgroundColor?: string;
  chipClassName?: string;
  height?: string;
  width?: string;
  className?: string;
  padding?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  onDelete,
  onEdit,
  onSelect,
  isSelected,
  isEditable,
  isDeletable,
  isSelectable,
  isDisabled,
  backgroundColor = 'bg-black/[0.04]',
  chipClassName = '',
  height = '',
  width = '',
  className = '',
  padding = 'px-4 py-2',
}) => {
  const handleClick = () => {
    if (!isDisabled && isSelectable && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      className={`rounded-full ${padding} ${backgroundColor} ${height} ${width} ${className}`}
      onClick={handleClick}
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable && !isDisabled ? 0 : undefined}
    >
      <span
        className={`font-inter flex items-center gap-2 text-center text-[15.206px] font-normal leading-[25.344px] text-black/90 ${chipClassName}`}
      >
        {label}
      </span>
    </div>
  );
};

export default Chip;
