import { memo, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {useDebounce} from "@spyne-console/hooks";
import Input from "../input/input";
import Dropdown from "../dropdown/dropdown";
import Spinner from "../skeleton&spinner/Spinner";
import OutsideClickHandler from "react-outside-click-handler";

function SearchBar({
  onChange = () => {},
  debounceDelay = 500,
  searchIconSrc = "https://spyne-static.s3.amazonaws.com/console/filter/searchIcon.svg",
  searchIconVisible = true,
  iconWidth = 20,

  iconHeight = 20,
  placeholder = "Search",
  value = "",
  className = "relative rounded-lg border border-black-10 bg-white h-full w-full",
  textAtTop = "Search",
  additionalInputProps = {},
  handleOptionClick=()=>{},
  dropdownOptions = [],
  loadMoreData = () => {},
  hasMoreData = false,
  loader = <Spinner />,
  endMessage = "",
  dropdownClassName = "",
  dropdownOptionClassName = "",
  showSearchOptions = false,
  searchDisabled = false,
  translate = () => {}
}) {
  const [searchText, setSearchText] = useState(value);
  const debounceSearchText = useDebounce(searchText, debounceDelay);
  const[isInputActive, setIsInputActive] = useState(false);

  const onSearchTextChange = useCallback((e) => {
    if (!searchDisabled){
    setSearchText(e.target.value);
    }
  }, []);

  useEffect(() => {
    onChange(debounceSearchText);
  }, [debounceSearchText]);

  useEffect(() => {
    setSearchText(value);
  }, [value]);
  const dropdownOptionClick =(data)=>{
    setIsInputActive(false)
    handleOptionClick(data)

  }

  return (
    <OutsideClickHandler onOutsideClick={()=>setIsInputActive(false)}>
    <div className="h-full w-full relative">
      <span onClick={()=>setIsInputActive(true)}>
        <Input
          className={`!pr-[40px] ${className}`}
          value={searchText}
          onChange={onSearchTextChange}
          placeholder={placeholder}
          textAtTop={textAtTop}
          {...additionalInputProps}
        />
      </span>
     
      {searchIconVisible && <span className="pl-2 absolute bottom-1/2 right-2 translate-y-[50%] z-2 bg-white overflow-hidden">
        <Image
          src={searchIconSrc}
          alt="Search icon"
          width={iconWidth}
          height={iconHeight}
        />
      </span>}
      {showSearchOptions && isInputActive && (dropdownOptions.length > 0 || endMessage) ? (
        <Dropdown
          handleOptionClick={dropdownOptionClick}
          dropdownOptions={dropdownOptions}
          loadMoreData={loadMoreData}
          hasMoreData={hasMoreData}
          loader={loader}
          endMessage={endMessage}
          dropdownClassName={dropdownClassName}
          dropdownOptionClassName={dropdownOptionClassName}
          translate={translate}
        />
      ):null}
    </div>
    </OutsideClickHandler>
  );
}

export default memo(SearchBar);
