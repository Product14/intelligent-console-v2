"use client"

import {
  HundredUnitMath,
  FrontEndHealth,
  BackEndHealth,
  ExpenseControl,
  PackBreakdown,
  NetToGrossTrend,
  BenchmarkLadder,
} from "@/components/spyne-max/profitability"

export default function ProfitabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profitability</h1>
        <p className="text-muted-foreground">
          Am I making real money — or just moving metal?
        </p>
      </div>

      <HundredUnitMath />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FrontEndHealth />
        <BackEndHealth />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseControl />
        <PackBreakdown />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NetToGrossTrend />
        <BenchmarkLadder />
      </div>
    </div>
  )
}
