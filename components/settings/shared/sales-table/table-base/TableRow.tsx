import { FC, ReactNode, memo } from 'react';

// TableRow component
interface TableRowProps {
  children: ReactNode;
  className?: string;
}

const TableRow: FC<TableRowProps> = ({ children, className = '' }) => {
  // Check if className contains gap utilities
  const hasGapClass = className.includes('gap-');

  // If gap classes are present, use flex display, otherwise use table-row
  const displayClass = hasGapClass ? 'flex' : 'table-row';

  return <tr className={`${displayClass} ${className}`}>{children}</tr>;
};

export default memo(TableRow);
