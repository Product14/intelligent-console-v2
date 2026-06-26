import React, { useContext, useEffect, useState } from 'react';

import SelectDropdown from '@/components/common/selectDropdown/selectDropdown';

import Input from '../../../../input/input';
import { GenericTableContext } from '../../../genericTableContext';
import { rangeFilterOptions } from './constants';

export default function Range({ close, columnHeader }) {
  const { filters, setFilters } = useContext(GenericTableContext);
  const [selectedOption, setSelectedOption] = useState();
  const [startNumber, setStartNumber] = useState('');
  const [endNumber, setEndNumber] = useState('');

  const onOptionChange = (option) => {
    setSelectedOption(option);
    setStartNumber('');
    setEndNumber('');
  };

  const onStartNumberChange = (e) => {
    setStartNumber(e.target.value);
  };

  const onEndNumberChange = (e) => {
    setEndNumber(e.target.value);
  };

  const updateRangeFilter = () => {
    let needToUpdateFilter = false;
    const newRangeArray = filters?.range ? [...filters.range] : [];
    const index = newRangeArray.findIndex(
      (item) => item.key === columnHeader.key,
    );

    if (startNumber === '' && endNumber === '') {
      if (index !== -1) {
        needToUpdateFilter = true;
        newRangeArray.splice(index, 1);
      }
    } else {
      if (index !== -1) {
        if (
          startNumber !== newRangeArray[index].value.start ||
          endNumber !== newRangeArray[index].value.end ||
          selectedOption.value !== newRangeArray[index].condition
        )
          needToUpdateFilter = true;
        newRangeArray[index] = {
          key: columnHeader.key,
          condition: selectedOption.value,
          value: { start: startNumber, end: endNumber },
        };
      } else {
        newRangeArray.push({
          key: columnHeader.key,
          condition: selectedOption.value,
          value: { start: startNumber, end: endNumber },
        });
        needToUpdateFilter = true;
      }
    }
    if (needToUpdateFilter) {
      let updatedFilters = { ...filters, range: newRangeArray };
      if (updatedFilters.range.length === 0) {
        delete updatedFilters.range;
      }
      setFilters(updatedFilters);
      close();
    }
  };

  useEffect(() => {
    let newStartNumber = '';
    let newEndNumber = '';
    let newCondition = '';
    if (filters?.range && filters.range?.length) {
      for (let i = 0; i < filters.range.length; i++) {
        const option = filters.range[i];
        if (option?.key === columnHeader?.key) {
          newStartNumber = option?.value?.start || '';
          newEndNumber = option?.value?.end || '';
          newCondition = option?.condition || '';
          break;
        }
      }
    }
    setStartNumber(newStartNumber);
    setEndNumber(newEndNumber);
    let newSelectedOption = {};
    for (let option of rangeFilterOptions) {
      if (option?.value === newCondition) {
        newSelectedOption = option;
        break;
      }
    }
    setSelectedOption(newSelectedOption);
  }, []);

  return (
    <div className="w-[280px] bg-white flex flex-col gap-2">
      <div className="w-full p-3">
        <SelectDropdown
          selectedOptionClass={
            'p-[16px] !font-[400] !text-[16px] !leading-[20px] p-[16px]'
          }
          selectedOption={selectedOption}
          options={rangeFilterOptions}
          onChange={onOptionChange}
        />
      </div>
      <div>
        <div className="flex justify-between gap-4 p-3 w-full">
          <Input
            className="border-[1px] rounded-[8px] border-grey w-full !text-[#000000CC] !font-[400] !text-[16px] !leading-[20px] p-[16px]"
            id="start"
            value={startNumber}
            type="number"
            onChange={onStartNumberChange}
            textAtTop="Number"
            placeholder="Number"
          />
          {selectedOption?.key === 'between' && (
            <Input
              className="border-[1px] rounded-[8px] border-grey w-full !text-[#000000CC] !font-[400] !text-[16px] !leading-[20px] p-[16px]"
              id="start"
              value={endNumber}
              type="number"
              onChange={onEndNumberChange}
              textAtTop="Number"
              placeholder="Number"
            />
          )}
        </div>
        <hr className="mt-[20px]" />
      </div>
      <div className="flex justify-between items-center p-3">
        <button
          className="flex justify-center items-center cursor-pointer inline-block rounded-[8px] w-[45%] border-[1px] rounded-[10px] border-grey p-[8px] active:transform active:scale-95 active:bg-gray-200"
          onClick={close}
          style={{
            transition:
              'transform 0.1s ease-in-out, background-color 0.1s ease-in-out',
          }}
        >
          Cancel
        </button>
        <button
          className="flex justify-center items-center cursor-pointer inline-block text-white w-[45%] bg-[#4600F2] rounded-[8px] p-[8px] active:transform active:scale-95 active:bg-[#3700C1]"
          onClick={updateRangeFilter}
          style={{
            transition:
              'transform 0.1s ease-in-out, background-color 0.1s ease-in-out',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
