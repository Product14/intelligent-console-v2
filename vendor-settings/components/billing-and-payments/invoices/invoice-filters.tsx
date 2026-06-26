import React, { useEffect, useRef, useState } from 'react';

import DatePickerDropdown from '@spyne-console/design-system/dropdown/date-picker-dropdown';
import SVG from '@spyne-console/design-system/svg';

import { InvoiceFilters, InvoiceStatus } from '../types/invoices';
import { invoiceStatusOptions } from '../utils/config';
import { normalizeProductName } from '../utils/product-styles';

interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
  onExportCSV: () => void;
  products: Array<{ id: string; name: string }>;
}

export default function InvoiceFiltersComponent({
  filters,
  onFiltersChange,
  onExportCSV,
  products,
}: InvoiceFiltersProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const raisedDateRef = useRef<HTMLDivElement>(null);
  const dueDateRef = useRef<HTMLDivElement>(null);
  const raisedDateButtonRef = useRef<HTMLButtonElement>(null);
  const dueDateButtonRef = useRef<HTMLButtonElement>(null);

  // Helper to format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format date for display (e.g., "19 Oct, 2025")
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Helper to parse date string to Date object
  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProductFilter = (productId: string) => {
    if (!productId) {
      // Clear product filter for "All" button
      onFiltersChange({
        ...filters,
        product: undefined,
      });
    } else {
      // Toggle product filter
      onFiltersChange({
        ...filters,
        product: filters.product === productId ? undefined : productId,
      });
    }
  };

  const handleStatusFilter = (status: InvoiceStatus) => {
    const currentStatuses = Array.isArray(filters.status)
      ? filters.status
      : filters.status
        ? [filters.status]
        : [];

    const isSelected = currentStatuses.includes(status);
    const newStatuses = isSelected
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const clearRaisedDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFiltersChange({
      ...filters,
      raisedDateStart: undefined,
      raisedDateEnd: undefined,
    });
  };

  const clearDueDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFiltersChange({
      ...filters,
      dueDateStart: undefined,
      dueDateEnd: undefined,
    });
  };

  const clearStatusFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFiltersChange({
      ...filters,
      status: undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const hasRaisedDateFilter = filters.raisedDateStart && filters.raisedDateEnd;
  const hasDueDateFilter = filters.dueDateStart && filters.dueDateEnd;
  const hasStatusFilter = !!filters.status;

  // Update container width to match overlay button width
  useEffect(() => {
    if (
      hasRaisedDateFilter &&
      raisedDateButtonRef.current &&
      raisedDateRef.current
    ) {
      raisedDateRef.current.style.minWidth = `${raisedDateButtonRef.current.offsetWidth}px`;
    } else if (raisedDateRef.current) {
      raisedDateRef.current.style.minWidth = '';
    }
  }, [hasRaisedDateFilter, filters.raisedDateStart, filters.raisedDateEnd]);

  useEffect(() => {
    if (hasDueDateFilter && dueDateButtonRef.current && dueDateRef.current) {
      dueDateRef.current.style.minWidth = `${dueDateButtonRef.current.offsetWidth}px`;
    } else if (dueDateRef.current) {
      dueDateRef.current.style.minWidth = '';
    }
  }, [hasDueDateFilter, filters.dueDateStart, filters.dueDateEnd]);

  const getStatusLabels = (): string[] => {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : filters.status
        ? [filters.status]
        : [];
    return statuses
      .map((status) => {
        const option = invoiceStatusOptions.find((opt) => opt.value === status);
        return option?.label || '';
      })
      .filter(Boolean);
  };

  const getStatusDisplayText = (): string => {
    const labels = getStatusLabels();
    if (labels.length === 0) return '';
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return labels.join(', ');
    return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
  };

  return (
    <div className="flex items-center justify-between gap-3 overflow-visible rounded-t-xl border-x border-t border-gray-200 bg-white p-2 text-sm font-normal text-black/60">
      {/* All Button */}
      {/* remove this div when you uncomment below code */}
      <div></div>
      {/* <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1"> */}
      {/* <button
          onClick={() => handleProductFilter('')}
          className={`rounded-[4px] px-5 py-0.5 transition-colors ${
            !filters.product ? 'bg-gray-100' : 'bg-white'
          }`}
        >
          All
        </button> */}
      {/* Product Filters */}
      {/* {products.map((product) => (
          <div key={product.id}>
            <button
              onClick={() => handleProductFilter(product.id)}
              className={`whitespace-nowrap rounded-[4px] px-3 py-0.5 transition-colors ${
                filters.product === product.id ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              {normalizeProductName(product.name)}
            </button>
          </div>
        ))} */}
      {/* </div> */}

      {/* Raised On Dropdown */}
      <div className="flex items-center gap-3 whitespace-nowrap">
        <div
          className="relative inline-flex min-w-fit overflow-visible"
          ref={raisedDateRef}
        >
          {hasRaisedDateFilter &&
            filters.raisedDateStart &&
            filters.raisedDateEnd && (
              <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const trigger =
                      document.getElementById('raised-date-picker');
                    if (trigger) {
                      (trigger as HTMLButtonElement).click();
                    }
                  }}
                  className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-lg border border-purple-500 bg-purple-50 py-1.5 pl-3 pr-2 text-sm font-medium transition-colors hover:bg-purple-100"
                  ref={raisedDateButtonRef}
                >
                  <span className="text-black/60">Raised On</span>
                  <span className="text-purple-600">
                    {filters.raisedDateStart === filters.raisedDateEnd
                      ? formatDisplayDate(filters.raisedDateStart)
                      : `${formatDisplayDate(filters.raisedDateStart)} - ${formatDisplayDate(filters.raisedDateEnd)}`}
                  </span>
                  <button
                    onClick={clearRaisedDateFilter}
                    className="ml-1 flex shrink-0 items-center justify-center"
                  >
                    <SVG
                      iconName="cancel"
                      className="h-3 w-3 fill-purple-600"
                    />
                  </button>
                  <SVG
                    iconName="downArrow"
                    className="ml-1 h-2 w-2 shrink-0 fill-purple-600"
                  />
                </button>
              </div>
            )}
          <div
            className={
              hasRaisedDateFilter ? 'pointer-events-none opacity-0' : ''
            }
          >
            <DatePickerDropdown
              startDate={parseDate(filters.raisedDateStart)}
              endDate={parseDate(filters.raisedDateEnd)}
              onChange={(dateRange: { startDate: Date; endDate: Date }) => {
                onFiltersChange({
                  ...filters,
                  raisedDateStart: formatDate(dateRange.startDate),
                  raisedDateEnd: formatDate(dateRange.endDate),
                });
              }}
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2100, 11, 31)}
              placeholder="Raised On"
              id="raised-date-picker"
              className="px-3 py-1.5"
            />
          </div>
        </div>

        {/* Due On Dropdown */}
        <div
          className="relative inline-flex min-w-fit overflow-visible"
          ref={dueDateRef}
        >
          {hasDueDateFilter && filters.dueDateStart && filters.dueDateEnd && (
            <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-center whitespace-nowrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const trigger = document.getElementById('due-date-picker');
                  if (trigger) {
                    (trigger as HTMLButtonElement).click();
                  }
                }}
                className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-lg border border-purple-500 bg-purple-50 py-1.5 pl-3 pr-2 text-sm font-medium transition-colors hover:bg-purple-100"
                ref={dueDateButtonRef}
              >
                <span className="text-black/60">Due On</span>
                <span className="text-purple-600">
                  {filters.dueDateStart === filters.dueDateEnd
                    ? formatDisplayDate(filters.dueDateStart)
                    : `${formatDisplayDate(filters.dueDateStart)} - ${formatDisplayDate(filters.dueDateEnd)}`}
                </span>
                <button
                  onClick={clearDueDateFilter}
                  className="ml-1 flex shrink-0 items-center justify-center"
                >
                  <SVG iconName="cancel" className="h-3 w-3 fill-purple-600" />
                </button>
                <SVG
                  iconName="downArrow"
                  className="ml-1 h-2 w-2 shrink-0 fill-purple-600"
                />
              </button>
            </div>
          )}
          <div
            className={hasDueDateFilter ? 'pointer-events-none opacity-0' : ''}
          >
            <DatePickerDropdown
              startDate={parseDate(filters.dueDateStart)}
              endDate={parseDate(filters.dueDateEnd)}
              onChange={(dateRange: { startDate: Date; endDate: Date }) => {
                onFiltersChange({
                  ...filters,
                  dueDateStart: formatDate(dateRange.startDate),
                  dueDateEnd: formatDate(dateRange.endDate),
                });
              }}
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2100, 11, 31)}
              placeholder="Due On"
              id="due-date-picker"
              className="px-3 py-1.5"
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          {hasStatusFilter ? (
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-purple-500 bg-purple-50 py-1.5 pl-3 pr-2 text-sm font-medium transition-colors hover:bg-purple-100"
            >
              <span className="text-black/60">Status:</span>
              <span className="text-purple-600">{getStatusDisplayText()}</span>
              <button
                onClick={clearStatusFilter}
                className="ml-1 flex shrink-0 items-center justify-center"
              >
                <SVG iconName="cancel" className="h-3 w-3 fill-purple-600" />
              </button>
              <SVG
                iconName="downArrow"
                className="ml-1 h-2 w-2 shrink-0 fill-purple-600"
              />
            </button>
          ) : (
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-black/60 transition-colors hover:border-gray-300"
            >
              Status
              <SVG iconName="downArrow" className="h-2 w-2" />
            </button>
          )}
          {showStatusDropdown && (
            <div className="absolute right-0 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
              {invoiceStatusOptions.map((option) => {
                const currentStatuses = Array.isArray(filters.status)
                  ? filters.status
                  : filters.status
                    ? [filters.status]
                    : [];
                const isSelected = currentStatuses.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilter(option.value)}
                    className={`block w-full px-4 py-1.5 text-left hover:bg-gray-50 ${
                      isSelected
                        ? 'bg-violet-50 text-violet-600'
                        : 'text-black/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          isSelected
                            ? 'border-violet-600 bg-violet-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset Button - Only show when filters are applied */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-gray-200"></div>
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 font-medium text-violet-600"
            >
              Reset
            </button>
          </>
        )}

        {/* CSV Export Button */}
        <div className="h-6 w-px bg-gray-200"></div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-medium text-black/60"
        >
          CSV
          <SVG iconName="DownloadVirtual" className="fill-black/60" />
        </button>
      </div>
    </div>
  );
}
