import React from 'react';

import { TabsProps } from '../types/common';
import { billingAndPaymentsTabs } from '../utils/config';

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="border-b border-black/10">
      <div className="flex gap-10">
        {billingAndPaymentsTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative pb-2 text-sm font-normal transition-colors ${
              activeTab === tab.value
                ? 'font-semibold text-black/80'
                : 'text-black/60'
            } `}
          >
            {tab.label}
            {activeTab === tab.value && (
              <div className="bg-blue-light absolute bottom-[-1px] left-0 right-0 h-[3px] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
