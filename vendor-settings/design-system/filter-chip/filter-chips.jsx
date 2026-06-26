import React from 'react';

import { cn } from '@spyne-console/utils/cn';

import FilterChip from './filter-chip';

const FilterChips = ({
  filters = [],
  onRemoveFilter,
  onClearAll,
  showClearAll = true,
  className = '',
  class1 = '',
  class2 = '',
  class3 = '',
}) => {
  return (
    <div className={cn('', className)}>
      {filters.length ? (
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {filters.map((filter, idx) => (
            <FilterChip
              key={idx}
              id={filter.id}
              value={filter.value}
              label={filter.label}
              onRemove={() => onRemoveFilter(filter.type, filter.value)}
              class1={class1}
              class2={class2}
            />
          ))}
          {showClearAll && filters.length > 0 && (
            <button
              className={cn(
                'text-primary ml-auto flex cursor-pointer items-center justify-end py-1 text-right text-sm font-medium',
                class3
              )}
              onClick={() => onClearAll()}
            >
              Clear all
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default FilterChips;
