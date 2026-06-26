import { memo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Spinner from '../skeleton&spinner/Spinner';

function Dropdown({
  handleOptionClick = () => {},
  dropdownOptions = [],
  loadMoreData = () => {},
  hasMoreData = false,
  loader = <Spinner />,
  endMessage = <div>No more results</div>,
  dropdownClassName = '',
  dropdownOptionClassName = '',
  translate,
}) {
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
          {dropdownOptions.map(
            (option, index) => (
              (option, 'oooo'),
              (
                <li
                  key={option.key || index}
                  className={`w-full cursor-pointer p-2 hover:bg-gray-100 ${dropdownOptionClassName} ${
                    option.class || ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {typeof option?.text === 'object'
                    ? option.text
                    : translate(option?.text) || option.text}
                </li>
              )
            )
          )}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

export default memo(Dropdown);
