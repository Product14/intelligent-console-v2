"use client"

import {
  BattleMap,
  MarketDaySupply,
  CompetitorBoard,
  MarketShareByZip,
  MarketingFlywheel,
} from "@/components/spyne-max/market-intel"

export default function MarketPositionPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Position</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Where do I stand in my market, and where are the gaps?
        </p>
      </div>

      <BattleMap />

      <MarketDaySupply />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompetitorBoard />
        <MarketShareByZip />
      </div>

      <MarketingFlywheel />
    </div>
  )
}
