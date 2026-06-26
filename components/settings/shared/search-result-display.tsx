import React from 'react';

interface SearchResultDisplayProps {
  searchQuery?: string;
  resultCount?: number;
  className?: string;
}

const SearchResultDisplay: React.FC<SearchResultDisplayProps> = ({
  searchQuery,
  resultCount,
  className = '',
}) => {
  // Don't render if no search query
  if (!searchQuery || searchQuery.trim() === '') {
    return null;
  }

  const hasResults = resultCount !== undefined && resultCount > 0;

  return (
    <div className={`bg-white px-6 py-3 ${className}`}>
      <div className="flex flex-col gap-1">
        {/* When there are results, show only the "Showing X Results" line */}
        {hasResults ? (
          <div className="text-blue-light text-sm">
            Showing {resultCount} {resultCount === 1 ? 'Result' : 'Results'} for
            "{searchQuery}"
          </div>
        ) : (
          /* When no results, show only the "Search Results" line */
          <div className="text-blue-light text-sm font-medium">
            Search Results for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultDisplay;
