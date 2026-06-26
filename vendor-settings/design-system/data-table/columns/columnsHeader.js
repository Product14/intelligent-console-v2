import React, { memo, useContext, useMemo } from 'react';

import { calculateColumsHeaderWidth } from '../constants';
import Filters from '../filters/filters';
import { GenericTableContext } from '../genericTableContext';
import { getGroupedHeaders, getMaxDepth } from '../utils';

function ColumnsHeader() {
  const { columnsHeader, visibleColumns, thClass } =
    useContext(GenericTableContext);

  const columnsWidth = useMemo(
    () => calculateColumsHeaderWidth(columnsHeader),
    [columnsHeader],
  );

  const groupedHeaders = useMemo(() => {
    return getGroupedHeaders(columnsHeader);
  }, [columnsHeader]);

  const dfsColSpan = (header, colSpan) => {
    colSpan[header.key] = 0;
    for (const child of header.children) {
      colSpan[header.key] += dfsColSpan(child, colSpan);
    }
    colSpan[header.key] = colSpan[header.key] || 1;
    return colSpan[header.key];
  };

  const colSpan = useMemo(() => {
    const newColSpan = {};
    Object.values(groupedHeaders).forEach((header) =>
      dfsColSpan(header, newColSpan),
    );
    return newColSpan;
  }, [groupedHeaders]);

  // BFS rendering logic
  const renderHeadersBFS = () => {
    const maxDepth = getMaxDepth(Object.values(groupedHeaders));
    const rows = []; // Store rows of headers to render
    let queue = Object.values(groupedHeaders); // Start with the root level headers
    let currentDepth = 1;

    while (queue.length) {
      const currentRow = [];
      const nextQueue = [];

      // Process each header in the current level
      while (queue.length) {
        const header = queue.shift(); // Remove and process the first element in the queue

        if (visibleColumns.includes(header.key)) {
          currentRow.push(
            <th
              colSpan={colSpan[header.key]}
              rowSpan={
                header.children?.length ? 1 : maxDepth - currentDepth + 1
              }
              key={header.key}
              className={`border-r border-b border-[#E7E7E8] bg-[#F9FAFB] px-[12px] py-[8px] text-sm font-semibold text-black-40 text-left  ${thClass}`}
              style={{
                position: header.fixed ? 'sticky' : 'relative',
                left: header.fixed
                  ? `${columnsWidth[columnsHeader.findIndex((h) => h.key === header.key)]}px`
                  : 'auto',
                zIndex: header.fixed ? 20 : 'auto',
                width: header.width || 'auto',
              }}
            >
              <div className="flex items-center gap-[15px] justify-between">
                <span className="text-[14px] leading-[20px] font-inter w-full">
                  {header.title}
                </span>
                <Filters columnHeader={header} />
              </div>
            </th>,
          );
        }

        // Add children to the queue for the next level
        if (header.children && header.children.length) {
          nextQueue.push(...header.children);
        }
      }

      currentDepth++;
      rows.push(<tr key={rows.length}>{currentRow}</tr>); // Add the current level as a row
      queue = nextQueue; // Move to the next level
    }

    return rows;
  };

  return <>{renderHeadersBFS()}</>;
}

export default memo(ColumnsHeader);
