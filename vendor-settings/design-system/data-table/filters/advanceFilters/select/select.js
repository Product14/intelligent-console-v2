import React, { useContext, useEffect, useMemo, useState } from 'react';

import UseDebounce from '../../../../../video/utils/UseDebounce';
import SelectDropdown from '../../../../selectDropdown/selectDropdown';
import { GenericTableContext } from '../../../genericTableContext';
import { selectConditionOptions } from './constants';
import Search from './search';

export default function Select({ columnHeader, close }) {
  const { filters, setFilters, advanceFilterConditions } =
    useContext(GenericTableContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = UseDebounce(searchText, 500);
  const [selectedCondition, setSelectedCondition] = useState(null);

  const options = useMemo(() => {
    return columnHeader?.getSelectFilterOptions(debouncedSearchText);
  }, [debouncedSearchText]);

  const handleSelectItem = (e) => {
    const value = e.target.value;
    let updatedSelectedItems = [...selectedItems];
    if (e.target.checked) {
      updatedSelectedItems.push(value);
    } else {
      updatedSelectedItems = updatedSelectedItems.filter(
        (item) => item !== value,
      );
    }
    setSelectedItems(updatedSelectedItems);
  };

  const updateSelectFilter = () => {
    let shouldUpdateFilter = false;
    const currentSelectFilters = filters?.select || [];
    const filterIndex = currentSelectFilters.findIndex(
      (item) => item.key === columnHeader.key,
    );

    if (!selectedItems || selectedItems.length === 0) {
      if (filterIndex !== -1) {
        shouldUpdateFilter = true;
        currentSelectFilters.splice(filterIndex, 1);
      }
    } else {
      if (filterIndex !== -1) {
        if (
          selectedItems.join(',') !==
            currentSelectFilters[filterIndex]?.value.join(',') ||
          currentSelectFilters[filterIndex].condition !==
            selectedCondition.value
        ) {
          shouldUpdateFilter = true;
        }
        currentSelectFilters[filterIndex].value = selectedItems;
        currentSelectFilters[filterIndex].condition = selectedCondition.value;
      } else {
        currentSelectFilters.push({
          key: columnHeader.key,
          condition: selectedCondition.value,
          value: selectedItems,
        });
        shouldUpdateFilter = true;
      }
    }

    if (shouldUpdateFilter) {
      let updatedFilters = { ...filters, select: currentSelectFilters };
      if (updatedFilters.select.length === 0) {
        delete updatedFilters.select;
      }
      setFilters(updatedFilters);
      close();
    }
  };

  const handleConditionChange = (option) => {
    setSelectedCondition(option);
    setSelectedItems([]);
  };

  useEffect(() => {
    let initialSelectedItems = [];
    let initialSelectedCondition = '';
    filters['select']?.forEach((option) => {
      if (option.key === columnHeader.key) {
        initialSelectedItems = option?.value || [];
        initialSelectedCondition = option.condition;
      }
    });

    const selectedConditionOption =
      selectConditionOptions.find(
        (option) => option.value === initialSelectedCondition,
      ) || selectConditionOptions[0];

    setSelectedCondition(selectedConditionOption);
    setSelectedItems(initialSelectedItems);
  }, []);

  return (
    <div>
      {advanceFilterConditions && (
        <div className="p-3">
          <SelectDropdown
            selectedOptionClass={
              'text-[#000000CC] font-[400] text-[16px] leading-[20px]'
            }
            dropdownClassName={
              'text-[#000000CC] font-[400] text-[16px] leading-[20px]'
            }
            options={selectConditionOptions}
            selectedOption={selectedCondition}
            onChange={handleConditionChange}
          />
        </div>
      )}

      {columnHeader.filters?.includes('search&select') && (
        <Search searchText={searchText} setSearchText={setSearchText} />
      )}
      <div className="min-w-[200px] max-h-[250px] overflow-auto">
        {options?.map((option) => (
          <div key={option.key} className="flex gap-4 pb-1 p-3">
            <input
              type="checkbox"
              value={option.value}
              checked={selectedItems.includes(option.value)}
              onChange={handleSelectItem}
              style={{ accentColor: '#4600F2' }}
            />
            <span className="font-400 text-[14px] leading-[20px]">
              {option.text}
            </span>
          </div>
        ))}
      </div>

      <hr className="mt-[5px]" />
      <div className="flex justify-between items-center p-3">
        <button
          className="flex justify-center items-center cursor-pointer inline-block rounded-[8px] w-[45%] border-[1px] rounded-[10px] border-grey p-[8px] active:transform active:scale-95 active:bg-gray-200"
          onClick={close}
        >
          Cancel
        </button>
        <button
          className="flex justify-center items-center cursor-pointer inline-block text-white w-[45%] bg-[#4600F2] rounded-[8px] p-[8px] active:transform active:scale-95 active:bg-[#3700C1]"
          onClick={updateSelectFilter}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
