import React from "react";

export function ReviewLoadingShimmer() {
  return (
    <div className="flex h-full bg-background">
      {/* Left Panel - Shimmer */}
      <div className="w-96 flex flex-col border-r border-border bg-card">
        {/* Enterprise/Team Selector Shimmer */}
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="w-20 h-5 bg-muted rounded animate-pulse" />
              <div className="w-48 h-9 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="w-20 h-5 bg-muted rounded animate-pulse" />
              <div className="w-48 h-9 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Header Shimmer */}
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="w-32 h-6 bg-muted rounded animate-pulse mb-1" />
          <div className="w-48 h-4 bg-muted rounded animate-pulse" />
        </div>

        {/* Call List Shimmer */}
        <div className="flex-1 min-h-0 overflow-y-scroll scrollbar-hidden">
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-muted rounded mb-1" />
                    <div className="w-32 h-3 bg-muted rounded" />
                  </div>
                  <div className="w-16 h-5 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-3 bg-muted rounded" />
                  <div className="w-16 h-3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel Shimmer */}
      <div className="flex-1 transition-all duration-300">
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse" />
              <div className="w-32 h-6 bg-muted rounded mx-auto mb-2 animate-pulse" />
              <div className="w-48 h-4 bg-muted rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

