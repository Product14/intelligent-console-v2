import React from 'react';

export default function LeadToSpeedSkeletonCard() {
  const S = ({ c = '' }) => (
    <div className={`animate-pulse rounded bg-gray-200 ${c}`} />
  );
  return (
    <div className="space-y-5">
      {/* Instant Response */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-4">
        <div className="flex items-center gap-3">
          <S c="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <S c="h-4 w-56" />
            <S c="h-3 w-80" />
          </div>
        </div>
        <S c="h-6 w-12 rounded-full" />
      </div>

      {/* Forward email */}
      <div className="space-y-2">
        <S c="h-4 w-52" />
        <div className="flex items-center justify-between rounded-xl border bg-white p-3">
          <S c="h-4 w-64" />
          <S c="h-5 w-5 rounded" />
        </div>
      </div>

      {/* Automated Response Settings */}
      <div className="space-y-3">
        <div className="space-y-2">
          <S c="h-5 w-64" />
          <S c="h-3 w-96" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Lead Type */}
          <div className="space-y-4 rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <S c="h-4 w-24" />
              <S c="h-9 w-40 rounded-lg" />
            </div>

            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <S c="h-4 w-40" />
                <div className="flex items-center gap-3">
                  <S c="h-8 w-32 rounded-lg" />
                  <S c="h-5 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Lead Source */}
          <div className="space-y-4 rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <S c="h-4 w-28" />
              <S c="h-9 w-40 rounded-lg" />
            </div>

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <S c="h-4 w-36" />
                <div className="flex items-center gap-3">
                  <S c="h-4 w-4 rounded" />
                  <S c="h-8 w-28 rounded-lg" />
                  <S c="h-5 w-10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
