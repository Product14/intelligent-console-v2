import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { GenericTableContext } from '../../../genericTableContext';
import {
  displayDateFormat,
  formattedDate,
  last14Days,
  last30Days,
  last90Days,
  lastWeek,
  today,
  yesterday,
} from './utils';

const minDate = '';
const maxDate = '';
const dateOptionsConfig = '';
const customFormatDate = '';
const dateChangeHandler = '';

function DateFilter({ columnHeader, close }) {
  const { filters, setFilters } = useContext(GenericTableContext);
  const [selectedDateOption, setSelectedDateOption] = useState();
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const defaultDateOptions = useMemo(
    () => [
      { label: 'Today', value: { startDate: today, endDate: today } },
      {
        label: 'Yesterday',
        value: { startDate: yesterday, endDate: yesterday },
      },
      { label: 'Last Week', value: { startDate: lastWeek, endDate: today } },
      {
        label: 'Last 14 Days',
        value: { startDate: last14Days, endDate: today },
      },
      {
        label: 'Last 30 Days',
        value: { startDate: last30Days, endDate: today },
      },
      {
        label: 'Last 90 Days',
        value: { startDate: last90Days, endDate: today },
      },
      { label: 'Specific Dates', value: { startDate: '', endDate: '' } },
    ],
    [],
  );

  const dateOptions = dateOptionsConfig || defaultDateOptions;
  const format = customFormatDate || displayDateFormat;

  const onDateOptionChange = (option) => {
    setSelectedDateOption(option);
    if (option.label === 'Specific Dates') {
      setOpenDatePicker(true);
    } else {
      setStartDate(option.value.startDate);
      setEndDate(option.value.endDate);
    }
    if (dateChangeHandler) dateChangeHandler(option);
  };

  const handleDateSelect = (ranges) => {
    const { selection } = ranges;
    setStartDate(selection.startDate);
    setEndDate(selection.endDate);
    if (dateChangeHandler)
      dateChangeHandler({
        label: 'Specific Dates',
        value: { startDate: selection.startDate, endDate: selection.endDate },
      });
  };

  const selectionRange = {
    startDate: startDate || today,
    endDate: endDate || today,
    key: 'selection',
  };

  const updateDateFilter = () => {
    let updateFilter = false;
    const newDateArray = filters?.date ? [...filters.date] : [];
    const index = newDateArray.findIndex(
      (item) => item.key === columnHeader.key,
    );

    if (!startDate && !endDate) {
      if (index !== -1) {
        newDateArray.splice(index, 1);
        updateFilter = true;
      }
    } else {
      if (index !== -1) {
        if (
          startDate !== newDateArray[index].value.startDate ||
          endDate !== newDateArray[index].value.endDate
        )
          updateFilter = true;
        newDateArray[index] = {
          key: columnHeader.key,
          value: {
            startDate: formattedDate(startDate),
            endDate: formattedDate(endDate),
          },
        };
      } else {
        newDateArray.push({
          key: columnHeader.key,
          value: {
            startDate: formattedDate(startDate),
            endDate: formattedDate(endDate),
          },
        });
        updateFilter = true;
      }
    }
    if (updateFilter) {
      setFilters((prev) => ({
        ...prev,
        date: newDateArray,
      }));
      close();
    }
  };

  useEffect(() => {
    setOpenDatePicker(selectedDateOption?.label === 'Specific Dates');
  }, [selectedDateOption]);

  useEffect(() => {
    let newStartDate = '';
    let newEndDate = '';

    filters['date']?.forEach((option) => {
      if (option.key === columnHeader.key) {
        newStartDate = new Date(option?.value?.startDate) || '';
        newEndDate = new Date(option?.value?.endDate) || '';
      }
    });
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  return (
    <div className="min-w-[300px]">
      {openDatePicker ? (
        <div className="p-3">
          <DateRange
            ranges={[selectionRange]}
            onChange={handleDateSelect}
            minDate={minDate ? new Date(minDate) : new Date(2000, 0, 1)}
            maxDate={maxDate ? new Date(maxDate) : today}
            showMonthAndYearPickers={false}
            rangeColors={['#4600f2', '#4600f214', '#000000']}
            retainEndDateOnFirstSelection={true}
            moveRangeOnFirstSelection={false}
          />
          <hr className="mt-[5px]" />
          <div className="flex justify-between items-center p-3">
            <button
              className="flex justify-center items-center cursor-pointer inline-block rounded-[8px] w-[45%] border-[1px] rounded-[10px] border-grey p-[8px] active:transform active:scale-95 active:bg-gray-200"
              onClick={() => setOpenDatePicker(false)}
            >
              Back
            </button>
            <button
              className="flex justify-center items-center cursor-pointer inline-block text-white w-[45%] bg-[#4600F2] rounded-[8px] p-[8px] active:transform active:scale-95 active:bg-[#3700C1]"
              onClick={updateDateFilter}
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          {(startDate || endDate) && (
            <div className="newinput-wrapper disabled-input relative w-full mb-1 ">
              <div className="p-3">
                <input
                  className="block w-full !font-400 !text-[14px] !leading-[28px] !text-[#000000DE] cursor-pointer !p-2 !h-auto"
                  value={
                    startDate
                      ? `${format(startDate)}${
                          startDate !== endDate ? ' - ' + format(endDate) : ''
                        }`
                      : ''
                  }
                  type="text"
                  placeholder="Select Date Range"
                  onClick={() => setOpenDatePicker(true)}
                  readOnly
                />
              </div>
              <hr className="mt-1" />
            </div>
          )}

          {dateOptions.map((dateOption, index) => (
            <div
              key={index}
              className="cursor-pointer font-inter text-[14px] font-[500] text-[#00000099] leading-[20px] text-left py-[10px] px-[16px]"
              onClick={() => onDateOptionChange(dateOption)}
            >
              {dateOption.label}
            </div>
          ))}
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
              onClick={updateDateFilter}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateFilter;
