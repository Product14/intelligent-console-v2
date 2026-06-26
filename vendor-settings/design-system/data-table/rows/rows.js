import { memo, useContext, useMemo } from 'react';

import { calculateColumsHeaderWidth, getNestedValue } from '../constants';
import { GenericTableContext } from '../genericTableContext';
import { getGroupedHeaders } from '../utils';

function Rows() {
  const {
    rowsData,
    columnsHeader,
    visibleColumns,
    tdClass,
    trClass,
    cellProps,
  } = useContext(GenericTableContext);

  const columnsWidth = useMemo(
    () => calculateColumsHeaderWidth(columnsHeader),
    [columnsHeader],
  );

  const getBottomView = (hierarchy) => {
    const bottomView = [];

    const findLeaves = (node) => {
      if (!node.children || node.children.length === 0) {
        // If the node has no children, it's a leaf node
        bottomView.push(node);
      } else {
        // Recursively look for leaf nodes in each child
        node.children.forEach(findLeaves);
      }
    };

    // Start finding leaves from each top-level node in the hierarchy
    Object.values(hierarchy).forEach((node) => findLeaves(node));

    return bottomView;
  };

  const groupedHeaders = useMemo(() => {
    return getGroupedHeaders(columnsHeader);
  }, [columnsHeader]);

  const bottomView = getBottomView(groupedHeaders);
  const skipColumns = {};

  return rowsData?.map((rowData, rowIndex) => (
    <tr key={rowData?.key || rowIndex} className={`${trClass}`}>
      {bottomView?.map((columnHeader, colIndex) => {
        if (skipColumns[colIndex]) {
          skipColumns[colIndex] -= 1; // Reduce the count, then skip this column
          return null;
        }

        const { class: cellClass = '', props: cellProp = {} } = {
          ...(cellProps?.find(
            (cell) => cell.row === rowIndex && cell.col === colIndex,
          ) ||
            cellProps?.find(
              (cell) => cell.row === rowIndex && cell.col === '*',
            ) ||
            cellProps?.find(
              (cell) => cell.row === '*' && cell.col === colIndex,
            ) ||
            cellProps?.find((cell) => cell.row === '*' && cell.col === '*') ||
            {}),
        };

        const cellRowSpan = cellProp?.rowSpan || 1;

        if (cellRowSpan > 1) {
          skipColumns[colIndex] = cellRowSpan - 1; // Set the skip count for subsequent rows
        }

        return (
          visibleColumns.includes(columnHeader.key) && (
            <td
              key={columnHeader?.key || colIndex}
              className={`border-r-[1px] border-b-[1px] !rounded-[0px] bg-white text-[#00000099] font-sans text-base font-normal ${tdClass} ${cellClass}`}
              style={{
                position: columnHeader?.fixed ? 'sticky' : 'relative',
                left: columnHeader?.fixed
                  ? `${columnsWidth[colIndex]}px`
                  : 'auto',
                zIndex: columnHeader?.fixed ? 20 : 'auto',
                width: columnHeader?.width || 'auto',
              }}
              {...cellProp}
            >
              {columnHeader?.cutomCellComponent ? (
                columnHeader.cutomCellComponent(rowData, columnHeader.key)
              ) : (
                <span className="px-4 py-1 font-[400] text-[14px] leading-[24px]">
                  {getNestedValue(rowData, columnHeader.key)}
                </span>
              )}
            </td>
          )
        );
      })}
    </tr>
  ));
}

export default memo(Rows);
