import { memo, useContext, useState } from 'react';

import { crossSvg, editIconSvg } from '../../../../public/assets/svg';
import { GenericTableContext } from '../genericTableContext';

function EditView({ close }) {
  const { columnsHeader, visibleColumns, setVisibleColumns, tableId } =
    useContext(GenericTableContext);
  const [newVisibleColumns, setNewVisibleColumns] = useState(visibleColumns);

  const handleCheckboxChange = (columnKey) => {
    setNewVisibleColumns((prevVisibleColumns) =>
      prevVisibleColumns.includes(columnKey)
        ? prevVisibleColumns.filter((key) => key !== columnKey)
        : [...prevVisibleColumns, columnKey],
    );
  };

  const updateVisibleColumns = () => {
    localStorage.setItem(
      String(tableId) + 'EditView',
      newVisibleColumns.join(),
    );
    setVisibleColumns(newVisibleColumns);
    close();
  };

  const resetAllFilters = () => {
    setNewVisibleColumns(visibleColumns);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-30">
      <div className="mt-10 bg-white rounded-xl px-10 py-8 flex flex-col gap-10">
        <div className="flex items-center gap-5">
          <div className="!bg-[#4600F20A] rounded-full p-2.5">
            <span className="block !bg-[#4600F214] rounded-[100px] p-[5px]">
              {editIconSvg(30, 30, '#4600F2')}
            </span>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-black">
                Edit View
              </span>
              <span className="cursor-pointer" onClick={close}>
                {crossSvg(24, 24)}
              </span>
            </div>
            <span className="text-sm font-normal leading-5 text-gray-700">
              Enable or disable columns as per your convenience
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-x-10 gap-y-5">
          {columnsHeader.map((columnHeader) => (
            <span
              key={columnHeader.key}
              className="flex items-center gap-[10px]"
            >
              <input
                type="checkbox"
                className="w-[16px] h-[24px]"
                checked={newVisibleColumns.includes(columnHeader.key)}
                value={columnHeader.title}
                onChange={() => handleCheckboxChange(columnHeader.key)}
                disabled={columnHeader?.disableEditView}
                style={{
                  accentColor: columnHeader?.disableEditView
                    ? '#000000CC'
                    : '#4600F2',
                }}
              />
              <span className="!text-[14px] !font-[500] !leading-[20px] !text-[#000000CC]">
                {columnHeader.title}
              </span>
            </span>
          ))}
        </div>
        <div className="flex justify-between gap-5 w-full">
          <button
            className="cursor-pointer border-2 border-gray-300 w-full py-2.5 rounded-lg bg-white active:transform active:scale-95 active:bg-gray-200"
            onClick={resetAllFilters}
          >
            Reset All
          </button>
          <button
            className="cursor-pointer !bg-[#4600F2] w-full py-2.5 rounded-lg text-white font-semibold text-sm leading-6 active:transform active:scale-95"
            onClick={updateVisibleColumns}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(EditView);
