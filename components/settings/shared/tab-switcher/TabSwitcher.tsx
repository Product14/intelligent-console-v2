import React, { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  showUnderline?: boolean;
  underlineClassName?: string;
  showBackground?: boolean;
  backgroundClassName?: string;
  inactiveBackgroundClassName?: string;
  gap?: string;
  height?: string;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  inactiveTabClassName = '',
  showUnderline = true,
  underlineClassName = 'bg-neutral-950',
  showBackground = true,
  backgroundClassName = 'border-black/4 bg-[rgba(72,80,102,0.04)]',
  inactiveBackgroundClassName = '',
  gap = 'gap-6',
  height = 'h-12',
}) => {
  return (
    <div className={`flex items-end ${height} ${className}`}>
      <div className={`flex h-full ${gap}`}>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className="relative flex h-full items-center justify-between"
          >
            <button
              onClick={() => !tab.disabled && onTabChange(tab.key)}
              disabled={tab.disabled}
              className={`flex h-fit items-center justify-center gap-2.5 ${tabClassName} ${
                activeTab === tab.key
                  ? `${showBackground ? backgroundClassName : ''}`
                  : `${inactiveBackgroundClassName}`
              } ${tab.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
            >
              {tab.icon && (
                <span
                  className={`flex items-center justify-center ${
                    activeTab === tab.key
                      ? 'text-neutral-950'
                      : 'text-[#8f8f8f]'
                  }`}
                >
                  {tab.icon}
                </span>
              )}
              <span
                className={`${
                  activeTab === tab.key
                    ? activeTabClassName ||
                      'text-sm font-semibold tracking-[0.0449px] text-black/80'
                    : inactiveTabClassName ||
                      'text-sm font-semibold tracking-[0.0449px] text-gray-500'
                }`}
              >
                {tab.label}
              </span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
                    activeTab === tab.key
                      ? 'bg-black/10 text-black/70'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
            {activeTab === tab.key && showUnderline && (
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${underlineClassName}`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabSwitcher;
