import React, { useContext, useEffect, useMemo, useState } from 'react';

import UseDebounce from '../../../../../video/utils/UseDebounce';
import { GenericTableContext } from '../../../genericTableContext';
import Search from './search';

export default function SelectOne({ columnHeader, close }) {
  const { filters, setFilters } = useContext(GenericTableContext);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = UseDebounce(searchText, 500);

  const options = useMemo(() => {
    return columnHeader?.getSelectFilterOptions(debouncedSearchText);
  }, [debouncedSearchText]);

  const handleSelectOneItem = (e) => {
    const value = e.target.value;
    setSelectedItem(value);
  };

  const updateSelectOneFilter = () => {
    let shouldUpdateFilter = false;
    const currentSelectOneFilters = filters?.selectOne || [];
    const filterIndex = currentSelectOneFilters.findIndex(
      (item) => item.key === columnHeader.key,
    );

    if (!selectedItem) {
      if (filterIndex !== -1) {
        shouldUpdateFilter = true;
        currentSelectOneFilters.splice(filterIndex, 1);
      }
    } else {
      if (filterIndex !== -1) {
        if (selectedItem !== currentSelectOneFilters[filterIndex]?.value) {
          shouldUpdateFilter = true;
          currentSelectOneFilters[filterIndex].value = selectedItem;
        }
      } else {
        currentSelectOneFilters.push({
          key: columnHeader.key,
          value: selectedItem,
        });
        shouldUpdateFilter = true;
      }
    }

    if (shouldUpdateFilter) {
      const updatedFilters = { ...filters, selectOne: currentSelectOneFilters };
      if (!updatedFilters.selectOne.length) delete updatedFilters.selectOne;
      setFilters(updatedFilters);
      close();
    }
  };

  const clearSelectOneFilter = () => {
    setSelectedItem('');
  };

  useEffect(() => {
    if (selectedItem === '') updateSelectOneFilter();
  }, [selectedItem]);

  useEffect(() => {
    let initialSelectOneItems = '';
    filters['selectOne']?.forEach((option) => {
      if (option.key === columnHeader.key)
        initialSelectOneItems = option?.value || '';
    });

    setSelectedItem(initialSelectOneItems);
  }, []);

  return (
    <div>
      {columnHeader.filters?.includes('search&selectOne') && (
        <Search searchText={searchText} setSearchText={setSearchText} />
      )}
      <div className="min-w-[200px] max-h-[250px] overflow-auto">
        {options?.map((option) => (
          <div key={option.key} className="flex gap-4 pb-1 p-3">
            <input
              type="radio"
              value={option.value}
              name="selectOneGroup"
              checked={selectedItem === option.value}
              onChange={handleSelectOneItem}
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
          className="flex justify-center items-center cursor-pointer rounded-[8px] w-[45%] border-[1px] border-grey p-[8px] active:transform active:scale-95 active:bg-gray-200"
          onClick={clearSelectOneFilter}
        >
          Clear
        </button>
        <button
          className="flex justify-center items-center cursor-pointer text-white w-[45%] bg-[#4600F2] rounded-[8px] p-[8px] active:transform active:scale-95 active:bg-[#3700C1]"
          onClick={updateSelectOneFilter}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
