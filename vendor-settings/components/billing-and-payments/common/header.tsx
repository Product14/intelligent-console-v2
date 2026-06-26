import React from 'react';

import { useRouter } from 'next/router';

import SVG from '@spyne-console/design-system/svg';

export default function Header() {
  const router = useRouter();
  return (
    <div className="mb-7 flex items-center gap-3 text-xl font-semibold text-black/80">
      <button onClick={() => router.back()}>
        <SVG iconName="BackIcon" />
      </button>
      <h1>Billing and Plan</h1>
    </div>
  );
}
