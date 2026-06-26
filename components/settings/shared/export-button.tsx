'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BsFiletypeCsv } from 'react-icons/bs';
import { FaRegFileExcel } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
import { toast } from 'react-toastify';

import DropdownWrapper from '@spyne-console/design-system/dropdown-wrapper';
import {
  Add,
  ArrowRightAlt,
  BorderColor,
  ChevronRight,
  Description,
} from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import {
  ExportConversationData,
  exportToCsv,
  exportToXlsx,
  formatConversationForExport,
} from '@/utils-settings/export-utils';

interface ExportButtonProps {
  conversations: any[];
  disabled?: boolean;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  conversations,
  disabled = false,
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (!conversations || conversations.length === 0) {
      toast.warning('No data available to export');
      return;
    }

    try {
      setIsExporting(true);
      setShowDropdown(false);

      // Format conversations for export
      const exportData: ExportConversationData[] = conversations.map(
        formatConversationForExport
      );

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `conversations_${dateStr}.${format}`;

      // Export based on format
      if (format === 'csv') {
        exportToCsv(exportData, filename);
      } else {
        exportToXlsx(exportData, filename);
      }

      toast.success(
        `Exported ${conversations.length} conversations as ${format.toUpperCase()} successfully`
      );
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(
        `Failed to export conversations as ${format.toUpperCase()}. Please try again.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const DROPDOWN_ITEMS = [
    {
      icon: <BsFiletypeCsv className="-mr-0.5 h-5 w-5 text-black/50" />,
      title: 'Download CSV file',
      onClick: () => handleExport('csv'),
    },
    {
      icon: <FaRegFileExcel className="h-4 w-4 fill-black/40" />,
      title: 'Download Excel file',
      onClick: () => handleExport('xlsx'),
    },
  ];

  const dropdownContent = (
    <div className="w-full space-y-3 rounded-xl bg-white p-3">
      {DROPDOWN_ITEMS?.map((item) => (
        <button
          onClick={item?.onClick}
          className="bg-white-gray flex w-full cursor-pointer items-center rounded-lg p-3 transition-colors hover:bg-opacity-80"
        >
          {item?.icon}
          <div className="ml-3 flex w-full flex-col gap-1 text-left text-sm font-semibold text-black/80">
            {/* <h3 className="text-sm font-semibold text-black/80"> */}
            {item?.title}
            {/* </h3> */}
          </div>
          <ArrowRightAlt className="fill-blue-light/40 h-4 w-4 -rotate-45" />
        </button>
      ))}
    </div>
  );

  return (
    <DropdownWrapper
      isOpen={showDropdown}
      onClose={() => setShowDropdown(false)}
      dropdownContent={dropdownContent}
      dropdownClassName="w-[332px] sm:inline-block hidden"
      position="bottom"
      align="right"
      offset={8}
      className={cn('inline-block', className)}
      closeOnScroll={false}
    >
      <button
        className={cn(
          'bg-blue-light flex items-center gap-2 rounded-lg px-4 py-3 sm:px-3 sm:py-3',
          className
        )}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <MdOutlineFileDownload className="hidden h-5 w-5 fill-white md:block" />
        <span className="whitespace-nowrap text-sm font-semibold text-white">
          Export
        </span>
        <div className="hidden h-5 w-[1px] scale-y-[2] bg-white/60 sm:block" />
        <ChevronRight
          className={cn(
            'hidden h-5 w-5 rotate-90 fill-white transition-all duration-300 sm:block',
            showDropdown && 'rotate-[270deg]'
          )}
        />
      </button>
    </DropdownWrapper>
  );
};

export default ExportButton;
