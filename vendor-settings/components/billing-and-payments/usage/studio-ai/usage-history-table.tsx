import React from 'react';

type UsageHistoryRow = {
  id: string;
  monthLabel: string;
  vinsProcessed: number;
  images: number;
  spins: number;
  videoTours: number;
  isCurrent?: boolean;
};

type UsageHistoryTableProps = {
  rows: UsageHistoryRow[];
};

export default function UsageHistoryTable({ rows }: UsageHistoryTableProps) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-black/80">Usage History</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-black/10 text-black/50">
              <th className="px-4 py-2 font-medium">Month</th>
              <th className="px-4 py-2 font-medium">VINs Processed</th>
              <th className="px-4 py-2 font-medium">Images</th>
              <th className="px-4 py-2 font-medium">360 Spins</th>
              <th className="px-4 py-2 font-medium">Video Tours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`text-black/70 ${
                  row.isCurrent ? 'bg-purple-50' : 'odd:bg-black/[0.015]'
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs font-medium">
                  {row.monthLabel}{' '}
                  {row.isCurrent && (
                    <span className="ml-1 text-[10px] font-normal text-purple-600">
                      (Current)
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-xs">
                  {row.vinsProcessed.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-xs">
                  {row.images.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-xs">
                  {row.spins.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-xs">
                  {row.videoTours.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
