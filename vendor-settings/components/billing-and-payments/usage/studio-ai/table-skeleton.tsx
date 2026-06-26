import React from 'react';

import { USAGE_TABLE_HEADERS } from '../config';

export default function TableSkeleton() {
  return (
    <div className="mt-6 h-full w-full">
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />

      <div className="w-full overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-[0px_1px_4px_0px_#0000000A]">
        <table className="w-full p-0 text-left">
          <thead className="bg-gray-light sticky top-0 z-[1]">
            <tr className="border-b border-black/10 text-black/60">
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
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <tr
                key={row}
                className="border-b border-black/5 text-sm last:border-b-0"
              >
                <td className="border-b border-black/10 px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="border-b border-black/10 px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="border-b border-black/10 px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="border-b border-black/10 px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="border-b border-black/10 px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
