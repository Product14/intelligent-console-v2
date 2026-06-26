import React, { useEffect, useRef, useState } from 'react';

import DatePickerDropdown from '@spyne-console/design-system/dropdown/date-picker-dropdown';
import SVG from '@spyne-console/design-system/svg';

import type { PaymentFilters, PaymentStatus } from '../types/payments';
import { paymentStatusOptions } from '../utils/config';

interface PaymentFiltersProps {
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
  onExportCSV: () => void;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const parseDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

export default function PaymentFiltersBar({
  filters,
  onFiltersChange,
  onExportCSV,
}: PaymentFiltersProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const transactionDateRef = useRef<HTMLDivElement>(null);
  const transactionDateButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleStatusFilter = (status: PaymentStatus) => {
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

  const clearTransactionDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFiltersChange({
      ...filters,
      transactionDateStart: undefined,
      transactionDateEnd: undefined,
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

  const hasTransactionDateFilter =
    filters.transactionDateStart && filters.transactionDateEnd;
  const hasStatusFilter = !!filters.status;
  const hasActiveFilters = hasTransactionDateFilter || hasStatusFilter;

  useEffect(() => {
    if (
      hasTransactionDateFilter &&
      transactionDateButtonRef.current &&
      transactionDateRef.current
    ) {
      transactionDateRef.current.style.minWidth = `${transactionDateButtonRef.current.offsetWidth}px`;
    } else if (transactionDateRef.current) {
      transactionDateRef.current.style.minWidth = '';
    }
  }, [
    hasTransactionDateFilter,
    filters.transactionDateStart,
    filters.transactionDateEnd,
  ]);

  const getStatusDisplayText = (): string => {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : filters.status
        ? [filters.status]
        : [];
    const labels = statuses
      .map((status) => {
        const option = paymentStatusOptions.find((opt) => opt.value === status);
        return option?.label;
      })
      .filter(Boolean) as string[];

    if (labels.length === 0) return '';
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return labels.join(', ');
    return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
  };

  return (
    <div className="flex items-center justify-end gap-3 overflow-visible rounded-t-xl border-x border-t border-gray-200 bg-white p-2 text-sm font-normal text-black/60">
      <div className="flex items-center gap-3 whitespace-nowrap">
        <div
          className="relative inline-flex min-w-fit overflow-visible"
          ref={transactionDateRef}
        >
          {hasTransactionDateFilter &&
            filters.transactionDateStart &&
            filters.transactionDateEnd && (
              <div className="pointer-events-none absolute left-0 top-0 z-10 flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const trigger = document.getElementById(
                      'transaction-date-picker'
                    );
                    if (trigger) {
                      (trigger as HTMLButtonElement).click();
                    }
                  }}
                  className="pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-lg border border-purple-500 bg-purple-50 py-1.5 pl-3 pr-2 text-sm font-medium transition-colors hover:bg-purple-100"
                  ref={transactionDateButtonRef}
                >
                  <span className="text-black/60">Transaction</span>
                  <span className="text-purple-600">
                    {filters.transactionDateStart === filters.transactionDateEnd
                      ? formatDisplayDate(filters.transactionDateStart)
                      : `${formatDisplayDate(filters.transactionDateStart)} - ${formatDisplayDate(filters.transactionDateEnd)}`}
                  </span>
                  <button
                    onClick={clearTransactionDate}
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
              hasTransactionDateFilter ? 'pointer-events-none opacity-0' : ''
            }
          >
            <DatePickerDropdown
              startDate={parseDate(filters.transactionDateStart)}
              endDate={parseDate(filters.transactionDateEnd)}
              onChange={(dateRange: { startDate: Date; endDate: Date }) => {
                onFiltersChange({
                  ...filters,
                  transactionDateStart: formatDate(dateRange.startDate),
                  transactionDateEnd: formatDate(dateRange.endDate),
                });
              }}
              minDate={new Date(2000, 0, 1)}
              maxDate={new Date(2100, 11, 31)}
              placeholder="Transaction Date"
              id="transaction-date-picker"
              className="px-3 py-1.5"
            />
          </div>
        </div>

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
              {paymentStatusOptions.map((option) => {
                const currentStatuses = Array.isArray(filters.status)
                  ? filters.status
                  : filters.status
                    ? [filters.status]
                    : [];
                const isSelected = currentStatuses.includes(
                  option.value as PaymentStatus
                );
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleStatusFilter(option.value as PaymentStatus)
                    }
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
      </div>

      <div className="flex items-center gap-3">
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
