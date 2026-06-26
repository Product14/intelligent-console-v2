'use client';

import React from 'react';

interface LayoutHeaderProps {
  heading: string;
  description: string | React.ReactNode;
  isMainHeader?: boolean;
  readonly children?: React.ReactNode;
}

export default function LayoutHeader({
  heading,
  description,
  isMainHeader = true,
  children,
}: LayoutHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-1">
        <div
          className={`font-semibold ${isMainHeader ? 'text-2xl text-black' : 'text-lg text-black/80'}`}
        >
          {heading}
        </div>
        <div
          className={`font-normal ${isMainHeader ? 'text-base text-black/60' : 'text-xs text-black/40'}`}
        >
          {description}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {children && <div className="flex flex-col">{children}</div>}
      </div>
    </div>
  );
}
