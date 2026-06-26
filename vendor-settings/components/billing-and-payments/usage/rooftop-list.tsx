import React, { useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import SvgIcon from '@spyne-console/design-system/svg';

import EmptyRooftops from './empty-rooftops';
import RooftopsSkeleton from './rooftops-skeleton';
import { RooftopListProps } from './utils';

const SCROLL_CONTAINER_ID = 'rooftop-scroll-container';

export default function RooftopList({
  rooftops,
  selectedRooftopId,
  onSelectRooftop,
  isRooftopsLoading = true,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  onSearch,
}: Readonly<RooftopListProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const expandSearch = () => {
    setIsSearchExpanded(true);
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const collapseSearch = () => {
    if (!searchTerm.trim()) {
      setIsSearchExpanded(false);
    }
  };

  const trimmedSearch = searchTerm.trim();

  const filteredRooftops = useMemo(() => {
    if (!trimmedSearch) {
      return rooftops;
    }
    return rooftops.filter((rooftop) =>
      rooftop.name.toLowerCase().includes(trimmedSearch.toLowerCase())
    );
  }, [rooftops, trimmedSearch]);

  const renderRooftopsSkeleton = ({
    className,
    rows = 6,
  }: {
    className?: string;
    rows?: number;
  }) => {
    return <RooftopsSkeleton className={className} rows={rows} />;
  };
  const isSearching = Boolean(trimmedSearch);
  const hasNoRooftops = rooftops.length === 0;
  const canLoadMore = !isSearching && hasMore;

  let listContent: React.ReactNode;
  if (isRooftopsLoading && hasNoRooftops) {
    listContent = renderRooftopsSkeleton({ rows: 6 });
  } else if (hasNoRooftops) {
    listContent = <EmptyRooftops />;
  } else {
    listContent = (
      <InfiniteScroll
        dataLength={filteredRooftops.length}
        next={() => {
          if (canLoadMore) {
            onLoadMore?.();
          }
        }}
        hasMore={canLoadMore}
        loader={
          isFetchingMore ? (
            <div className="border-t border-black/10">
              {renderRooftopsSkeleton({ rows: 2 })}
            </div>
          ) : null
        }
        scrollableTarget={SCROLL_CONTAINER_ID}
        scrollThreshold={0.95}
      >
        {filteredRooftops.map((rooftop) => {
          const isActive = rooftop.id === selectedRooftopId;
          return (
            <button
              key={rooftop.id}
              type="button"
              onClick={() => onSelectRooftop(rooftop.id)}
              className={`flex w-full cursor-pointer items-center gap-3 border-t border-black/10 p-4 text-left text-sm transition-colors duration-300 ease-out ${
                isActive ? 'bg-purple-50' : 'hover:bg-black/5'
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold ${
                  isActive
                    ? 'bg-purpleGradient/85 text-white/90'
                    : 'bg-purpleLight/10 text-purpleGradient'
                }`}
              >
                {rooftop.initials}
              </div>
              <span className="truncate text-base font-semibold text-black/80">
                {rooftop.name}
              </span>
            </button>
          );
        })}
      </InfiniteScroll>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-l-3xl border-r border-black/10 bg-white">
      <div className="flex w-full items-center justify-between gap-2 px-4 py-3">
        <h2 className="text-base font-medium text-black/80">Rooftops</h2>
        <div
          className={`hover:border-blue-light/20 group flex items-center overflow-hidden rounded-lg border border-black/10 bg-white transition-[width,border-color] duration-300 ease-in-out ${
            isSearchExpanded ? 'border-blue-light/40 w-56' : 'w-9'
          }`}
        >
          <button
            type="button"
            aria-label="Search..."
            onClick={expandSearch}
            className="flex h-8 w-9 items-center justify-center px-2 transition-colors"
          >
            <SvgIcon
              iconName="search"
              className="group-hover:fill-blue-light h-4 w-4 fill-black/60"
            />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={collapseSearch}
            className={`bg-transparent text-sm text-black/60 outline-none transition-all duration-300 ease-in-out ${
              isSearchExpanded
                ? 'ml-1 w-full pr-2 opacity-100'
                : 'pointer-events-none ml-0 w-0 opacity-0'
            }`}
          />
        </div>
      </div>

      <div id={SCROLL_CONTAINER_ID} className="h-[73vh] w-full overflow-y-auto">
        {listContent}
      </div>
    </div>
  );
}
