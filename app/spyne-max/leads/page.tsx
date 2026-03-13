"use client"

import {
  ChannelROI,
  MarketingPyramid,
  ChannelConversion,
  BDCScorecard,
  TOandClose,
  SpendOptimizer,
} from "@/components/spyne-max/leads"

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads &amp; Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Where are my leads coming from, and am I wasting money?
        </p>
      </div>

      <ChannelROI />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketingPyramid />
        <ChannelConversion />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BDCScorecard />
        <TOandClose />
      </div>

      <SpendOptimizer />
    </div>
  )
}
