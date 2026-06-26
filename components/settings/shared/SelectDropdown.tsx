import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OutsideClickHandler from 'react-outside-click-handler';

import { DropdownOption } from '@spyne-console/design-system/dropdown';
import Dropdown from '@spyne-console/design-system/dropdown';
import Spinner from '@spyne-console/design-system/spinner';

import LocationDropdown from './dropdown/LocationDropdown';

export const downArrowHeadSvg = (
  height: number,
  width: number,
  fill = 'none',
  stroke = 'black'
) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 10L12 15L17 10"
      stroke={stroke}
      stroke-width="2"
      stroke-linecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Define types for option and props
export interface OptionType extends Omit<DropdownOption, 'text'> {
  text?: string | ReactNode;
  value?: string | number;
  icon?: {
    height?: number;
    width?: number;
    fill?: string;
    stroke?: string;
  };
  class?: string;
  [key: string]: any; // For any additional properties
}

interface SelectDropdownProps {
  options?: OptionType[];
  selectedOption?: OptionType;
  onChange?: (option: OptionType) => void;
  selectedOptionClass?: string;
  disable?: boolean;
  loadMoreData?: () => void;
  hasMoreData?: boolean;
  loader?: ReactNode;
  onClick?: () => void;
  endMessage?: string;
  dropdownClassName?: string;
  dropdownOptionClassName?: string;
  onBlur?: () => void;
  placeholder?: string;
  placeholderClass?: string;
  showLoader?: boolean;
  textAtTop?: string;
}

export default function SelectDropdown({
  options = [],
  selectedOption = {},
  onChange = () => {},
  selectedOptionClass = '',
  disable = false,
  loadMoreData = () => {},
  hasMoreData = false,
  loader = <Spinner />,
  onClick = () => {},
  endMessage = '',
  dropdownClassName = '',
  dropdownOptionClassName = '',
  onBlur = () => {},
  placeholder = '',
  placeholderClass = '',
  showLoader = false,
  textAtTop = '',
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t: translate } = useTranslation();

  const handleToggleDropdown = () => {
    if (disable || showLoader) return;
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (option: OptionType) => {
    setIsOpen(false);
    onChange(option);
  };

  const onOutsideClick = () => {
    setIsOpen(false);
  };

  return (
    <OutsideClickHandler onOutsideClick={onOutsideClick}>
      <div className="relative" onClick={onClick}>
        <div
          className={`flex items-center justify-between rounded-[5px] border-[1px] border-gray-300 p-2 ${disable ? 'cursor-not-allowed' : 'cursor-pointer'} ${selectedOptionClass} ${selectedOption?.class}`}
          onClick={handleToggleDropdown}
          onBlur={onBlur}
          tabIndex={0}
        >
          <span
            className={`${selectedOption?.text ? '' : 'text-gray-400'} !${placeholderClass}`}
          >
            {textAtTop && selectedOption?.text && (
              <div>
                <span
                  className="!text-grey !absolute !left-[6px] !top-[0px] !-translate-y-1/2 bg-white !text-[12px]"
                  style={{
                    background: 'white',
                  }}
                >
                  {textAtTop}
                </span>
              </div>
            )}
            {typeof selectedOption?.text === 'object'
              ? selectedOption?.text
              : translate(
                  selectedOption?.text?.toString() ?? placeholder ?? ''
                )}
          </span>
          {/* Conditional loader */}
          {showLoader ? (
            <div className="ml-2">{loader}</div>
          ) : (
            downArrowHeadSvg(
              selectedOption?.icon?.height || 16,
              selectedOption?.icon?.width || 16,
              selectedOption?.icon?.fill || 'none',
              selectedOption?.icon?.stroke || '#00000099'
            )
          )}
        </div>
        {isOpen && !showLoader && (
          <LocationDropdown
            endMessage={endMessage}
            handleOptionClick={handleOptionClick}
            dropdownOptions={options as DropdownOption[]}
            dropdownClassName={dropdownClassName}
            loadMoreData={loadMoreData}
            hasMoreData={hasMoreData}
            dropdownOptionClassName={dropdownOptionClassName}
            loader={loader}
          />
        )}
      </div>
    </OutsideClickHandler>
  );
}
