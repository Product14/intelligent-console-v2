import React, { ReactNode } from 'react';

import GenericSearch from '../generic-search';
import GenericSwitcher from '../generic-switcher';

interface SearchResult {
  id: string;
  type: 'customer' | 'vehicle' | 'agent' | 'appointment';
  title: string;
  subtitle?: string;
  metadata?: string;
}

interface HeaderAction {
  type: 'search' | 'switcher' | 'custom';
  component?: ReactNode;
  props?: any;
}

interface GenericHeaderProps {
  // Left side props
  icon?: ReactNode;
  title: string;
  iconBackgroundColor?: string;

  // Right side actions
  actions?: HeaderAction[];

  // Search specific props (for backward compatibility)
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  searchPlaceholder?: string;
  searchWidth?: string;

  // Search dropdown props
  showSearchDropdown?: boolean;
  searchResults?: SearchResult[];
  onSearchResultSelect?: (result: SearchResult) => void;
  isSearching?: boolean;

  // Switcher specific props (for backward compatibility)
  switcherOptions?: Array<{ value: string; label: string; width?: string }>;
  selectedSwitcherValue?: string;
  onSwitcherChange?: (value: string) => void;

  // Container styling
  className?: string;
}

const GenericHeader: React.FC<GenericHeaderProps> = ({
  icon,
  title,
  iconBackgroundColor = '#26b579',
  actions = [],
  onSearchChange,
  searchQuery,
  searchPlaceholder = 'Search',
  searchWidth = 'w-[200px]',
  showSearchDropdown = false,
  searchResults = [],
  onSearchResultSelect,
  isSearching = false,
  switcherOptions = [],
  selectedSwitcherValue,
  onSwitcherChange,
  className = '',
}) => {
  // Build actions array from legacy props if actions is empty
  const finalActions = actions.length > 0 ? actions : [];

  // Add search if legacy search props are provided
  if (onSearchChange && finalActions.length === 0) {
    finalActions.push({
      type: 'search',
      props: {
        value: searchQuery,
        onChange: onSearchChange,
        placeholder: searchPlaceholder,
        width: searchWidth,
        showSearchDropdown,
        searchResults,
        onSearchResultSelect,
        isSearching,
      },
    });
  }

  // Add switcher if legacy switcher props are provided
  if (switcherOptions.length > 0 && finalActions.length <= 1) {
    finalActions.push({
      type: 'switcher',
      props: {
        options: switcherOptions,
        selectedValue: selectedSwitcherValue,
        onOptionSelect: onSwitcherChange,
      },
    });
  }

  const renderAction = (action: HeaderAction, index: number) => {
    switch (action.type) {
      case 'search':
        return <GenericSearch key={`search-${index}`} {...action.props} />;
      case 'switcher':
        return <GenericSwitcher key={`switcher-${index}`} {...action.props} />;
      case 'custom':
        return <div key={`custom-${index}`}>{action.component}</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`border-black/6 border-b bg-white px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Icon + Title */}
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="flex items-center justify-center rounded p-1.5"
              style={{ backgroundColor: iconBackgroundColor }}
            >
              {icon}
            </div>
          )}
          <h3 className="text-base font-semibold tracking-[-0.04px] text-[#1c2024]">
            {title}
          </h3>
        </div>

        {/* Right side - Actions */}
        {finalActions.length > 0 && (
          <div className="flex items-center gap-3">
            {finalActions.map((action, index) => renderAction(action, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericHeader;
