import React from 'react';

import Image from 'next/image';

export default function NoDataCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Image
        src={`https://spyne-static.s3.us-east-1.amazonaws.com/console/history-empty.svg`}
        alt="Empty state"
        width={100}
        height={100}
      />
      <p className="text-sm font-medium text-black/70">No usage history</p>
      <p className="text-xs text-black/40">
        All your usage information will be available here
      </p>
    </div>
  );
}
