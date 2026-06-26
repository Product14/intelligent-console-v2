import React from 'react';

import { ConversationColumnHeader } from '@/components/settings/shared/sales-table/models/conversationColumnMeta';
import { TableColumn } from '@/components/settings/shared/sales-table/models/tableColumn';

interface ConversationSkeletonRendererProps {
  column: TableColumn;
}

const ConversationSkeletonRenderer: React.FC<
  ConversationSkeletonRendererProps
> = ({ column }) => {
  const renderSkeleton = () => {
    switch (column.header) {
      case ConversationColumnHeader.CUSTOMER:
        return (
          <div
            className="flex cursor-pointer flex-row justify-start gap-4 border-r border-black/10 p-3"
            style={{ minWidth: column.minWidth }}
          >
            <div className="flex w-full flex-col items-start justify-start gap-2">
              <div className="relative flex w-full items-center justify-between gap-1">
                <div className="flex w-[calc(100%-34px)] items-center gap-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-300"></div>
                </div>
                <div className="flex h-[30px] w-[30px] animate-pulse rounded-full bg-gray-300"></div>
              </div>
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full flex-row items-center justify-start gap-2">
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
                </div>
                <div className="flex w-full flex-row items-center gap-2">
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-300"></div>
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case ConversationColumnHeader.INTENT:
        return (
          <div className="flex" style={{ minWidth: column.minWidth }}>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.VEHICLE:
        return (
          <div className="flex" style={{ minWidth: column.minWidth }}>
            <div className="h-3 w-16 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.OUTCOME:
        return (
          <div
            className="flex items-center justify-start"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.DATE_AND_TIME:
        return (
          <div
            className="flex flex-col gap-1"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
            <div className="h-3 w-12 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.CUSTOMER_SENTIMENT:
        return (
          <div
            className="flex items-center justify-start"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-5 w-16 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.AI_SCORE:
        return (
          <div
            className="flex w-full max-w-[100px] items-center justify-center"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.ACTION_ITEMS:
        return (
          <div
            className="flex items-center justify-start"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-6 w-8 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.DURATION:
        return (
          <div
            className="flex items-center justify-start"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      case ConversationColumnHeader.NOTES:
        return (
          <div
            className="flex items-start justify-start"
            style={{ minWidth: column.minWidth }}
          >
            <div className="flex flex-col gap-1">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-300"></div>
              <div className="h-3 w-12 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
        );

      case ConversationColumnHeader.AGENTS:
        return (
          <div
            className="flex items-center justify-start"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-4 w-6 animate-pulse rounded bg-gray-300"></div>
          </div>
        );

      default:
        return (
          <div
            className="flex flex-col gap-2"
            style={{ minWidth: column.minWidth }}
          >
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300"></div>
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-300"></div>
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default ConversationSkeletonRenderer;
