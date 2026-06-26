import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import React, { useMemo } from 'react';
import { FiCheck, FiChevronRight } from 'react-icons/fi';
import { IoCheckmark } from 'react-icons/io5';

import Button from '@spyne-console/design-system/button';

import { CIDropdownMenuOption } from './model';

const SubMenuRenderer = ({
  option,
  selectedOptions,
  showCheckmark,
  isMultiSelect,
  handleOptionClick,
  showClearButton,
  clearSelection,
  variant = 'default',
}: {
  option: CIDropdownMenuOption;
  selectedOptions: CIDropdownMenuOption[];
  showCheckmark: boolean;
  isMultiSelect: boolean;
  handleOptionClick: (option: CIDropdownMenuOption) => void;
  showClearButton: boolean;
  clearSelection: () => void;
  variant?: 'default' | 'filter' | 'minimal' | 'clean';
}) => {
  return (
    <DropdownMenu.Sub
      open={option.subOpen}
      onOpenChange={option.onSubOpenChange}
    >
      <DropdownMenu.SubTrigger className="flex cursor-pointer select-none items-center justify-between px-3 py-2 text-sm outline-none transition-colors hover:bg-gray-50 data-[state=open]:bg-gray-50">
        <div className="flex items-center gap-2">
          {option.icon && (
            <span className="flex size-4 items-center justify-center text-gray-500">
              {option.icon}
            </span>
          )}
          <span className="text-gray-900">{option.label}</span>
        </div>
        <FiChevronRight className="size-4 text-gray-400" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className="data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade z-50 min-w-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg will-change-[opacity,transform]"
          sideOffset={8}
          alignOffset={-5}
          style={{ maxHeight: 'calc(100vh - 400px)' }}
          onPointerDownOutside={(e) => {
            if (option.customContent) e.preventDefault();
          }}
          onFocusOutside={(e) => {
            if (option.customContent) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (option.customContent) e.preventDefault();
          }}
        >
          {option.customContent ? (
            option.customContent
          ) : (
            <DropDownMenuRenderer
              isMultiSelect={isMultiSelect}
              selectedOptions={selectedOptions}
              showCheckmark={showCheckmark}
              options={option.subOptions || []}
              handleOptionClick={handleOptionClick}
              showClearButton={showClearButton}
              clearSelection={clearSelection}
              variant={variant}
            />
          )}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};

export const DropDownMenuRenderer = ({
  options,
  selectedOptions,
  showCheckmark,
  isMultiSelect,
  showClearButton,
  handleOptionClick,
  clearSelection,
  variant = 'default',
  showSelectAll = false,
  selectAll,
  allSelected = false,
}: {
  options: CIDropdownMenuOption[];
  selectedOptions: CIDropdownMenuOption[];
  showCheckmark: boolean;
  isMultiSelect: boolean;
  showClearButton: boolean;
  handleOptionClick: (option: CIDropdownMenuOption) => void;
  clearSelection: () => void;
  variant?: 'default' | 'filter' | 'minimal' | 'clean';
  showSelectAll?: boolean;
  selectAll?: () => void;
  allSelected?: boolean;
}) => {
  const optionList = useMemo(() => {
    return options.map((option) => {
      return {
        ...option,
        isSelected: !!selectedOptions.find(
          (selectedOption) => selectedOption.value === option.value
        ),
      };
    });
  }, [options, selectedOptions]);

  return (
    <div className="relative">
      {showSelectAll && isMultiSelect && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-3 py-2">
          <DropdownMenu.Item
            className="flex select-none items-center gap-3 rounded-lg p-1 text-sm outline-none transition-colors hover:bg-gray-50 focus:bg-gray-50"
            onSelect={(e) => {
              e.preventDefault();
              if (!allSelected) {
                selectAll?.();
              } else {
                clearSelection();
              }
            }}
          >
            <div
              className={`flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center rounded border transition-all ${
                allSelected
                  ? 'border-[#4600F2] bg-[#4600F2]'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              {allSelected && <IoCheckmark className="h-3 w-3 text-white" />}
            </div>
            <span className="font-medium text-gray-900">Select All</span>
          </DropdownMenu.Item>
        </div>
      )}
      <div className="scrollbar-hide max-h-[530px] overflow-y-auto">
        {optionList.map((option) => {
          return (
            <div key={option.id ?? option.value}>
              {option.sectionHeader && (
                <DropdownMenu.Label className="bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-500">
                  {option.sectionHeader}
                </DropdownMenu.Label>
              )}

              {option.customContent ||
              (option.subOptions && option.subOptions.length > 0) ? (
                <SubMenuRenderer
                  selectedOptions={selectedOptions}
                  showCheckmark={showCheckmark}
                  option={option}
                  isMultiSelect={isMultiSelect}
                  handleOptionClick={handleOptionClick}
                  showClearButton={showClearButton}
                  clearSelection={clearSelection}
                  variant={variant}
                />
              ) : (
                <DropdownMenu.Item
                  className={`relative flex select-none items-center text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
                    variant === 'clean'
                      ? 'justify-between p-3 hover:bg-gray-50 focus:bg-gray-50'
                      : 'rounded-lg p-2 hover:bg-gray-50 focus:bg-gray-50'
                  }`}
                  onSelect={(e) => {
                    if (isMultiSelect) {
                      e.preventDefault();
                    }
                    handleOptionClick(option);
                  }}
                  disabled={option.disabled}
                >
                  {variant === 'clean' ? (
                    // Clean variant design - matches Figma
                    <>
                      <div className="flex items-center gap-2">
                        {option.icon && (
                          <span className="flex items-center justify-center text-gray-500">
                            {option.icon}
                          </span>
                        )}
                        {!option.hideLabel && (
                          <span className="font-medium text-neutral-950">
                            {option.label}
                          </span>
                        )}
                      </div>
                      {option.isSelected && (
                        <FiCheck className="h-5 w-5 text-[#4600F2]" />
                      )}
                    </>
                  ) : (
                    // Default variant design
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isMultiSelect && (
                          <div
                            className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-all ${
                              option.isSelected
                                ? 'border-[#4600F2] bg-[#4600F2]'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionClick(option);
                            }}
                          >
                            {option.isSelected && (
                              <IoCheckmark className="h-3 w-3 text-white" />
                            )}
                          </div>
                        )}
                        {option.icon && (
                          <span className="flex items-center justify-center text-gray-500">
                            {option.icon}
                          </span>
                        )}
                        {!option.hideLabel && (
                          <span className="text-gray-900">{option.label}</span>
                        )}
                      </div>
                      {!isMultiSelect && showCheckmark && option.isSelected && (
                        <IoCheckmark className="size-5 text-[#4600F2]" />
                      )}
                    </div>
                  )}
                </DropdownMenu.Item>
              )}

              {option.showSeparator && (
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      {showClearButton && selectedOptions.length > 0 && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-1">
          <DropdownMenu.Item
            className="relative flex select-none items-center justify-end rounded-lg p-1 text-sm outline-none"
            onSelect={(e) => {
              e.preventDefault();
              clearSelection();
            }}
          >
            <Button
              type="outline"
              size="A"
              className="h-8"
              label="Clear"
              onClick={clearSelection}
            />
          </DropdownMenu.Item>
        </div>
      )}
    </div>
  );
};
