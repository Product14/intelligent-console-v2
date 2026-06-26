import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

import Spinner from '@spyne-console/design-system/spinner/spinner';

import { OptionType } from '../SelectDropdown';

type DropdownOption = {
  key?: string | number;
  text: string | ReactNode;
  class?: string;
  [key: string]: any; // For any additional properties
};

type DropdownProps = {
  handleOptionClick?: (option: OptionType) => void;
  dropdownOptions?: OptionType[];
  loadMoreData?: () => void;
  hasMoreData?: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  dropdownClassName?: string;
  dropdownOptionClassName?: string;
};

function Dropdown({
  handleOptionClick = () => {},
  dropdownOptions = [],
  loadMoreData = () => {},
  hasMoreData = false,
  loader = <Spinner />,
  endMessage = <div>No more results</div>,
  dropdownClassName = '',
  dropdownOptionClassName = '',
}: DropdownProps) {
  const { t: translate } = useTranslation();
  return (
    <div
      className={`border-grey absolute z-10 w-full overflow-auto rounded-[5px] rounded-t-none border-[1px] bg-white ${dropdownClassName}`}
      id="generic_dropdown"
    >
      <InfiniteScroll
        dataLength={dropdownOptions?.length}
        next={loadMoreData}
        hasMore={hasMoreData}
        loader={loader && <div className="py-2 text-center">{loader}</div>}
        endMessage={
          endMessage && (
            <div className="py-2 text-center">
              <b>{endMessage}</b>
            </div>
          )
        }
        scrollableTarget="generic_dropdown"
        style={{ overflow: 'visible' }}
      >
        <ul>
          {dropdownOptions.map((option, index) => (
            <li
              key={option.key ?? index}
              className={`w-full cursor-pointer p-2 hover:bg-gray-100 ${dropdownOptionClassName} ${
                option.class || ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.text}
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

export default memo(Dropdown);
