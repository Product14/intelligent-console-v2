'use client';

import { InfoTip } from './info-tip';

/** Always-shown page header. Carries the dashboard name + a one-line
 *  description so the dealer instantly knows what they're looking at. The
 *  Training Period sub-section sits below this, and only during training. */
export function DashboardHeader() {
  return (
    <div className="-mx-6 border-b border-black/8 bg-white px-6 py-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-black-dark">Vini Performance</h1>
        <InfoTip width={300}>
          A single view of how much of your dealership funnel Vini is touching
          today and what those conversations are producing. Updated daily from
          your CRM and Vini's conversation logs.
        </InfoTip>
      </div>
      <p className="mt-0.5 text-sm text-black-60">
        Coverage of your dealership funnel and Vini's performance on what's enabled.
      </p>
    </div>
  );
}
