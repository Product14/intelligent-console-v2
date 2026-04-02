"use client"

import {
  ChannelROITable,
  CampaignOpportunities,
  HotCarPromotions,
  ListingPerformance,
} from "@/components/max-2/marketing"
import { max2Classes } from "@/lib/design-system/max-2"

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className={max2Classes.pageTitle}>Marketing</h1>
        <p className={max2Classes.pageDescription}>
          Demand generation &mdash; put the right cars in front of the right
          buyers
        </p>
      </div>

      <ChannelROITable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignOpportunities />
        <HotCarPromotions />
      </div>

      <ListingPerformance />
    </div>
  )
}
