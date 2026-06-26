import React from 'react';

import { Cross } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

const FilterChip = ({
  id,
  value,
  label,
  onRemove,
  class1 = '',
  class2 = '',
}) => {
  return (
    <div
      className={cn(
        'border-black-20 flex w-max items-center gap-2 rounded-full border px-3 py-1',
        class1
      )}
    >
      <div
        className={cn(
          'text-black-60 max-w-[min(calc(100vw-100px),500px)] truncate text-sm font-medium',
          class2
        )}
      >
        {label || value}
      </div>
      <div className="cursor-pointer" onClick={onRemove}>
        <Cross className="h-4 w-4" />
      </div>
    </div>
  );
};

export default FilterChip;
