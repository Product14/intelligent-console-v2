import React, { memo, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Spinner from '../../../components/common/skeleton&spinner/Spinner';
import PaginationWrapper from './PaginationWrapper';
import ActionBar from './actionBar/actionBar';
import ColumnsHeader from './columns/columnsHeader';
import { defaultEndMessage } from './constants';
import { GenericTableContext } from './genericTableContext';
import Rows from './rows/rows';

function GenericTable({
  tableId = 'genericTable',
  columnsHeader = [],
  rowsData = {},
  hasMore = false,
  loadMoreData = () => {},
  height = '500px',
  endMessage = '',
  loader = <Spinner />,
  filters = {},
  setFilters = () => {},
  showSearchBar = true,
  pagination = false,
  pageNo = 1,
  totalPage = 1,
  showGlobalDateFilter = true, // to enable global in action bar
  showResetButton = true, // to enable reset button in action bar
  showEditViewButton = true, // to enable edit view button in action bar
  tdClass = '', // apply css to all cells in the table
  trClass = '', // apply css to all rows in the table
  thClass = '', // apply css to header row in the table
  genericTableClass = '', // apply css to table  container
  infiniteScrollStyle = {}, // apply css to infinite scroll container
  advanceFilterHeader = true,
  advanceFilterConditions = true,
  searchPlaceholder = 'Search',
  cellProps = [],
}) {
  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
    let storedVisibleColumns = localStorage.getItem(
      String(tableId) + 'EditView',
    );
    let newVisibleColumns = [];
    if (storedVisibleColumns) {
      storedVisibleColumns = storedVisibleColumns.split(',');
      newVisibleColumns = storedVisibleColumns;
    } else {
      columnsHeader.forEach((columnHeader) => {
        if (columnHeader?.visibility) {
          newVisibleColumns.push(columnHeader.key);
        }
      });
    }
    setVisibleColumns(newVisibleColumns);
  }, []);

  return (
    <GenericTableContext.Provider
      value={{
        columnsHeader,
        rowsData,
        filters,
        setFilters,
        visibleColumns,
        setVisibleColumns,
        tableId,
        tdClass,
        trClass,
        thClass,
        advanceFilterHeader,
        advanceFilterConditions,
        cellProps,
      }}
    >
      <>
        {(showSearchBar ||
          showGlobalDateFilter ||
          showResetButton ||
          showEditViewButton) && (
          <div className="my-6 w-full">
            <ActionBar
              showSearchBar={showSearchBar}
              showGlobalDateFilter={showGlobalDateFilter}
              showResetButton={showResetButton}
              showEditViewButton={showEditViewButton}
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        <div
          className={`relative border-[1px] border-grey z-0 ${genericTableClass}`}
          id="generic_table"
        >
          <InfiniteScroll
            dataLength={rowsData?.length || 0}
            next={pagination ? null : loadMoreData}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8">
                <div
                  className={`absolute left-1/2 ${
                    !rowsData?.length ? 'top-1/2' : ''
                  } bottom-0 transform -translate-x-1/2 -translate-y-1/2 z-[-1] flex items-center justify-center`}
                >
                  {loader}
                </div>
              </div>
            }
            endMessage={
              endMessage && !pagination ? (
                <div className="text-center py-6">
                  <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 -translate-y-1/2 z-[-1]">
                    <b>{endMessage}</b>
                  </div>
                </div>
              ) : null
            }
            height={height}
            style={infiniteScrollStyle}
          >
            <table className="w-full min-w-max overflow-auto p-0">
              <thead className="sticky top-0 bg-white z-[21]">
                <ColumnsHeader />
              </thead>
              <tbody>
                {!hasMore && !rowsData?.length ? (
                  <div className="flex items-center justify-center absolute left-1/2 top-1/2">
                    {' '}
                    !! No Data Available{' '}
                  </div>
                ) : (
                  <Rows />
                )}
              </tbody>
            </table>
          </InfiniteScroll>
          {pagination && totalPage > 1 ? (
            <PaginationWrapper
              pageNo={pageNo}
              totalPage={totalPage}
              loadMoreData={loadMoreData}
            />
          ) : null}
        </div>
      </>
    </GenericTableContext.Provider>
  );
}

export default memo(GenericTable);
