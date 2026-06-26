import Image from 'next/image';

import SearchBar from '../../../../searchBar/searchBar';

export default function Search({ searchText, setSearchText }) {
  const onSearchChange = (text) => {
    setSearchText(text);
  };

  return (
    <div className="w-[300px] p-3">
      <SearchBar
        placeholder="search"
        onChange={onSearchChange}
        value={searchText}
        required=""
        type="text"
        id=""
        autoComplete="off"
        textAtTop="Search"
      />
    </div>
  );
}
