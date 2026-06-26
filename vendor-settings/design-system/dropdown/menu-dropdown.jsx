import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function MenuDropdown({ className, dropdownItems, onClick }) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 z-50 flex max-h-[200px] flex-col overflow-y-auto rounded-xl border border-gray-200/60 bg-white/95 text-sm font-medium text-gray-900 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 ease-out md:max-h-max',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {dropdownItems?.map((item, index) => {
        if (!item) return;
        return (
          <div key={index} className="w-full bg-white/95">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(item?.value);
              }}
              className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-all duration-150 ease-out hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 focus:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] active:bg-blue-100/50"
              tabIndex={0}
            >
              {item?.icon && (
                <div className="flex-shrink-0 text-gray-500 transition-colors duration-150 group-hover:text-blue-600 group-focus:text-blue-600">
                  {item.icon}
                </div>
              )}
              <span className="flex-1 text-sm font-medium leading-5 text-gray-700 transition-colors duration-150 group-hover:text-blue-700 group-focus:text-blue-700">
                {item.label}
              </span>
            </button>
            {index < dropdownItems.length - 1 && (
              <div className="h-px bg-gray-200/60" />
            )}
          </div>
        );
      })}
    </div>
  );
}
