import { FC, ReactNode, memo } from 'react';

// TableCell component
interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
  style?: any;
}

const TableCell: FC<TableCellProps> = ({
  style,
  children,
  className = '',
  colSpan,
  rowSpan,
}) => {
  return (
    <td style={style} className={className} colSpan={colSpan} rowSpan={rowSpan}>
      {children}
    </td>
  );
};

export default memo(TableCell);
