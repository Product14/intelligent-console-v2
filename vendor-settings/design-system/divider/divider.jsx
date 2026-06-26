import React from 'react';

import { cn } from '@spyne-console/utils/cn';

export default function Divider({ className }) {
  return (
    <div
      className={cn('h-[1px] w-full rounded-full bg-black/20', className)}
    ></div>
  );
}
