import { memo, useCallback, useContext, useEffect, useState } from 'react';

import { editIconSvg } from '../../../../public/assets/svg';
import { findBestMatchingOption } from '../../datePickerDropdown/constants';
import DatePickerDropdown from '../../datePickerDropdown/datePickerDropdown';
import SearchBar from '../../searchBar/searchBar';
import { GenericTableContext } from '../genericTableContext';
import EditView from './editView';

function ActionBar({
  showSearchBar,
  showGlobalDateFilter,
  showResetButton,
  showEditViewButton,
  placeholder,
}) {
  const { filters, setFilters } = useContext(GenericTableContext);
  const [openEditView, setOpenEditView] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});

  const resetFilters = useCallback(() => {
    if (Object.keys(filters).length !== 0) {
      setFilters({});
    }
  }, [filters]);

  const updateFilters = (debounceSearchText) => {
    if (debounceSearchText === '') {
      setFilters((prev) => {
        const { search, ...rest } = prev;
        return rest;
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        search: debounceSearchText,
      }));
    }
  };
  const dateChangeHandler = (option) => {
    if (
      filters?.globalDateFilter?.startDate !== option?.value?.startDate ||
      filters?.globalDateFilter?.endDate !== option?.value?.endDate
    ) {
      setFilters((prev) => ({
        ...prev,
        globalDateFilter: option.value,
      }));
      setSelectedOption(option);
    }
  };

  useEffect(() => {
    if (showGlobalDateFilter) {
      let newSelectedOption = findBestMatchingOption(
        filters?.globalDateFilter?.startDate,
        filters?.globalDateFilter?.endDate,
      );
      setSelectedOption(newSelectedOption);
    }
  }, [filters?.globalDateFilter]);

  return (
    <div className="flex bg-[#F9FAFB] rounded-lg mb-1 w-full px-[16px] py-[12px] items-center justify-between">
      <div className="flex-1">
        {showSearchBar && (
          <div className="w-[400px]">
            {' '}
            <SearchBar
              value={filters?.search}
              textAtTop="Search"
              onChange={updateFilters}
              placeholder={placeholder}
            />{' '}
          </div>
        )}
      </div>
      <div className="flex gap-[10px] self-end !m-l-auto !relative">
        {showGlobalDateFilter && (
          <DatePickerDropdown
            selectedOption={selectedOption}
            dateChangeHandler={dateChangeHandler}
          />
        )}
        {showResetButton && (
          <button
            className="block py-[10px] px-[12px] rounded-[8px] border-[1px] border[#0000001A] bg-white active:transform active:scale-95 active:bg-gray-200"
            onClick={resetFilters}
            style={{
              transition:
                'transform 0.1s ease-in-out, background-color 0.1s ease-in-out',
            }}
          >
            <div className="flex items-center gap-[8px]">
              <img
                src={'https://spyne-static.s3.amazonaws.com/device_reset.svg'}
                className="h-[20px] w-[20px]"
                alt="Reset filters icon"
                width={20}
                height={20}
              />
              <span className="font-[600] text-[14px] leading-[20px] text-[#00000099]">
                Reset Filter
              </span>
            </div>
          </button>
        )}
        {showEditViewButton && (
          <button
            className="block py-[10px] px-[12px] rounded-[8px] border-[1px] border[#0000001A] bg-white active:transform active:scale-95 active:bg-gray-200"
            onClick={() => setOpenEditView(true)}
            style={{
              transition:
                'transform 0.1s ease-in-out, background-color 0.1s ease-in-out',
            }}
          >
            <div className="flex items-center gap-[8px]">
              <span className="h-[20px] w-[20px]">
                {editIconSvg(20, 20, '#00000099')}
              </span>
              <span className="font-[600] text-[14px] leading-[20px] text-[#00000099]">
                Edit View
              </span>
            </div>
          </button>
        )}
      </div>
      {openEditView && <EditView close={() => setOpenEditView(false)} />}
    </div>
  );
}

export default memo(ActionBar);
