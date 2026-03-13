"use client"

import {
  ChannelROITable,
  CampaignOpportunities,
  HotCarPromotions,
  ListingPerformance,
} from "@/components/max-2/marketing"

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
