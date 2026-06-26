import React from 'react';

import NoDataCard from '../../common/no-data-card';
import { USAGE_TABLE_HEADERS } from '../config';
import { UsageHistoryRow } from '../utils';
import TableSkeleton from './table-skeleton';

type UsageHistoryCardProps = {
  readonly rows: UsageHistoryRow[];
  readonly isLoading: boolean;
};

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-8 text-center">
        <NoDataCard />
      </td>
    </tr>
  );
}

export default function UsageHistoryCard({
  rows,
  isLoading,
}: UsageHistoryCardProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  const hasRows = rows.length > 0;
  return (
    <div className="mt-6 h-full w-full">
      <div className="mb-4 text-sm font-medium text-black/80">
        Usage History
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-[0px_1px_4px_0px_#0000000A]">
        <table className="w-full p-0 text-left">
          <thead className="bg-gray-light sticky top-0 z-[1]">
            <tr
              className="border-b border-black/10 text-black/60"
              style={{
                borderBottom: '1px solid #0000001A',
              }}
            >
              {USAGE_TABLE_HEADERS.map((header) => (
                <th
                  key={header.key}
                  className="border-b border-black/10 px-4 py-2 text-sm font-normal first:w-[300px]"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasRows ? (
              rows.map((row, index) => (
                <tr
                  key={row.monthLabel}
                  className="group border-b border-black/5 text-sm font-medium text-black/80 last:border-b-0"
                  style={{
                    borderBottom: '1px solid #0000001A',
                  }}
                >
                  <td className="border-b border-black/10 px-4 py-2">
                    {row.monthLabel}
                    {row.isCurrent && (
                      <span className="ml-1 font-normal text-black/60">
                        (Current)
                      </span>
                    )}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3">
                    {row.vinsProcessed.toLocaleString()}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3">
                    {row.images.toLocaleString()}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3">
                    {row.spins.toLocaleString()}
                  </td>
                  <td className="border-b border-black/10 px-4 py-3">
                    {row.videoTours.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
