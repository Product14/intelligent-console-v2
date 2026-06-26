import { useEffect, useRef, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';

import { advanceFilterTypes } from './constants';
import { renderAdvanceFilters } from './utils';

export default function AdvanceFilters({
  close,
  columnHeader,
  advanceFilterHeader,
}) {
  const [selectedFilter, setSelectedFilter] = useState();
  const [allowedAdvanceFilterTypes, setAllowedAdvanceFilterTypes] = useState(
    [],
  );
  const [isAtEnd, setIsAtEnd] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    const newAllowedAdvanceFilterTypes = advanceFilterTypes.filter((option) =>
      columnHeader.filters.includes(option.key),
    );
    setAllowedAdvanceFilterTypes(newAllowedAdvanceFilterTypes);
    setSelectedFilter(newAllowedAdvanceFilterTypes[0]);

    if (divRef.current) {
      const div = divRef.current;
      const parent = document.getElementById('generic_table');

      if (parent) {
        const divRect = div.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        setIsAtEnd(divRect.right + 300 >= parentRect.right);
      }
    }
  }, []);

  return (
    <OutsideClickHandler onOutsideClick={close}>
      <div
        ref={divRef}
        className={`absolute z-100 bg-white w-max rounded-[12px] top-[40px] border-grey border-[1px] z-10 overflow-hidden ${
          isAtEnd ? 'right-0' : 'left-0'
        }`}
      >
        {advanceFilterHeader && (
          <div className="flex">
            {allowedAdvanceFilterTypes?.map((filter) => (
              <div className="flex flex-col">
                <span
                  key={filter.key}
                  className={`cursor-pointer py-[9px] px-[30px]  font-400 text-[14px] ${
                    selectedFilter?.key === filter.key ? 'bg-[#F0EBFE]' : ''
                  }`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter.text}
                </span>
                {selectedFilter?.key === filter.key && (
                  <hr className="border-[#4600F2] border-t-[1px]" />
                )}
              </div>
            ))}
          </div>
        )}

        <hr />
        <div>
          {selectedFilter &&
            renderAdvanceFilters[selectedFilter?.key] &&
            renderAdvanceFilters[selectedFilter?.key](columnHeader, close)}
        </div>
      </div>
    </OutsideClickHandler>
  );
}
