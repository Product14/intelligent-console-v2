import React from 'react';
import { BiSort } from 'react-icons/bi';
import { IoMdArrowDown, IoMdArrowUp } from 'react-icons/io';

export type SortOrder = 'asc' | 'desc' | null;

interface SortButtonProps {
  sortOrder: SortOrder;
  onSort: () => void;
  className?: string;
}

const SortButton: React.FC<SortButtonProps> = ({
  sortOrder,
  onSort,
  className = '',
}) => {
  return (
    <button
      onClick={onSort}
      className={`flex items-center justify-center rounded transition-colors hover:bg-gray-100 ${className}`}
      title={
        sortOrder === 'asc'
          ? 'Sort descending'
          : sortOrder === 'desc'
            ? 'Sort ascending'
            : 'Sort ascending'
      }
    >
      {sortOrder === 'asc' ? (
        <IoMdArrowUp className="h-4 w-4 text-gray-600" />
      ) : sortOrder === 'desc' ? (
        <IoMdArrowDown className="h-4 w-4 text-gray-600" />
      ) : (
        <BiSort className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
};

export default SortButton;
