import Image from 'next/image';
import { useContext, useEffect, useMemo, useState } from 'react';

import { filterSvg } from '../../../../public/assets/svg';
import { GenericTableContext } from '../genericTableContext';
import AdvanceFilters from './advanceFilters/advanceFilters';
import { advanceFilterTypes, sortOptions } from './constants';

const FilterButton = ({ onClick, isActive, children }) => (
  <span className="cursor-pointer" onClick={onClick}>
    {children}
  </span>
);

export default function Filters({ columnHeader }) {
  const { filters, setFilters, advanceFilterHeader } =
    useContext(GenericTableContext);
  const [openAdvanceFilters, setOpenAdvanceFilters] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(sortOptions[0]);

  const hasSortFilter = columnHeader?.filters?.includes('sort');
  const hasAdvanceFilters = advanceFilterTypes.some((value) =>
    columnHeader.filters?.includes(value),
  );

  const isAdvanceFiltersApplied = useMemo(() => {
    for (let i = 0; i < columnHeader?.filters?.length; i++) {
      const filterType = columnHeader.filters[i];
      for (let j = 0; j < filters?.[filterType]?.length; j++) {
        const filter = filters?.[filterType][j];
        if (filter?.key === columnHeader?.key) {
          return true;
        }
      }
    }
    return false;
  }, [filters]);

  const handleSortClick = () => {
    const newValue = (selectedSortOption.key + 1) % sortOptions.length;
    if (sortOptions[newValue]?.value === '0') {
      let newFilters = { ...filters };
      delete newFilters.sort;
      setFilters(newFilters);
    } else {
      setFilters((prev) => ({
        ...prev,
        sort: {
          key: columnHeader?.key,
          value: sortOptions[newValue]?.value,
        },
      }));
    }
    setSelectedSortOption(sortOptions[newValue]);
  };

  useEffect(() => {
    if (openAdvanceFilters) setOpenAdvanceFilters(true);
  }, [openAdvanceFilters]);

  useEffect(() => {
    if (columnHeader?.key === filters?.sort?.key) {
      sortOptions.forEach((option) => {
        if (option.value === filters?.sort?.value) {
          setSelectedSortOption(option);
        }
      });
    } else {
      setSelectedSortOption(sortOptions[0]);
    }
  }, [filters?.sort]);

  return columnHeader?.filters?.length > 0 ? (
    <div className="flex gap-[8px] relative">
      {hasAdvanceFilters && (
        <div className="relative h-[15px] w-[15px]">
          <div onClick={() => setOpenAdvanceFilters(true)}>
            {isAdvanceFiltersApplied ? (
              <Image
                src="https://spyne-static.s3.amazonaws.com/Filter.svg"
                height={15}
                width={15}
              />
            ) : (
              <FilterButton>
                {filterSvg('15px', '15px', 'none', 'black')}
              </FilterButton>
            )}
          </div>
          {openAdvanceFilters && (
            <AdvanceFilters
              columnHeader={columnHeader}
              filters={filters}
              setFilters={setFilters}
              close={() => setOpenAdvanceFilters(false)}
              advanceFilterHeader={advanceFilterHeader}
            />
          )}
        </div>
      )}
      {hasSortFilter && (
        <div className="relative h-[15px] w-[15px]">
          <FilterButton onClick={handleSortClick}>
            <Image
              className="cursor-pointer"
              src={selectedSortOption.icon}
              height={15}
              width={15}
            />
          </FilterButton>
        </div>
      )}
    </div>
  ) : null;
}
