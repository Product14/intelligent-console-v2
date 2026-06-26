import React from 'react';

import classNames from 'classnames';

export interface CINavbarTab {
  id?: string | number;
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
  badgeCount?: number;
  suffixRef?: React.ReactNode;
  onClick?: () => void;
}

interface CINavbarProps {
  tabs: CINavbarTab[];
  selectedValue: string | number;
  onToggle: (tab: CINavbarTab) => void;
  className?: string;
}

const CINavbar: React.FC<CINavbarProps> = ({
  tabs,
  selectedValue,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`flex w-full items-center gap-8`}>
      {tabs.map((tab) => {
        const isSelected = tab.value === selectedValue;

        const handleClick = (e: React.MouseEvent) => {
          if (tab.disabled) {
            e.preventDefault();
            return;
          }
          onToggle(tab);
        };

        return (
          <div
            key={String(tab.value)}
            aria-selected={isSelected}
            onClick={handleClick}
            className={classNames(
              'flex items-center justify-center bg-white py-3'
            )}
            style={{
              borderBottom: isSelected ? '2px solid #0A0A0A' : 'none',
            }}
          >
            <div
              className={classNames(
                'flex cursor-pointer items-center gap-[10px] rounded-md px-2 py-1.5',
                isSelected ? 'border border-black/5' : 'border-none'
              )}
              style={{
                backgroundColor: isSelected ? '#4850660A' : 'white',
              }}
            >
              {!!tab.icon && tab.icon}
              <div
                className={classNames(
                  'text-sm font-semibold leading-tight tracking-tight',
                  isSelected ? 'text-neutral-950' : 'text-[#8f8f8f]'
                )}
              >
                {tab.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CINavbar;
