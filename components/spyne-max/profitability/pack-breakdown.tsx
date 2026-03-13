"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockPackStructure, mockDealerProfile } from "@/lib/spyne-max-mocks"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

const packItems = [
  { key: "advertising" as const, label: "Advertising" },
  { key: "lotExpense" as const, label: "Lot Expense" },
  { key: "salesSupplies" as const, label: "Sales Supplies" },
  { key: "reconVariance" as const, label: "Recon Variance" },
]

export function PackBreakdown() {
  const [pack, setPack] = React.useState({
    advertising: mockPackStructure.advertising,
    lotExpense: mockPackStructure.lotExpense,
    salesSupplies: mockPackStructure.salesSupplies,
    reconVariance: mockPackStructure.reconVariance,
  })

  const totalPack = pack.advertising + pack.lotExpense + pack.salesSupplies + pack.reconVariance
  const avgFrontGross = mockDealerProfile.avgFrontGross + totalPack
  const afterPackGross = avgFrontGross - totalPack

  const handleChange = (key: keyof typeof pack, value: string) => {
    setPack((prev) => ({ ...prev, [key]: Number(value) || 0 }))
  }

  const colors = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-rose-500" />
          <CardTitle>Pack Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {packItems.map((item) => (
            <div key={item.key} className="space-y-1.5">
              <Label className="text-xs">{item.label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={pack[item.key]}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="pl-7 h-9 font-mono"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 border p-3">
          <span className="text-sm font-medium">Total Pack / Unit</span>
          <span className="text-lg font-bold">${totalPack.toLocaleString()}</span>
        </div>

        {/* Visual bar */}
        <div className="space-y-2">
          <div className="flex h-4 rounded-full overflow-hidden">
            {packItems.map((item, i) => {
              const pct = totalPack > 0 ? (pack[item.key] / totalPack) * 100 : 25
              return (
                <div
                  key={item.key}
                  className={cn(colors[i], "transition-all duration-300")}
                  style={{ width: `${pct}%` }}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            {packItems.map((item, i) => (
              <div key={item.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={cn("h-2.5 w-2.5 rounded-full", colors[i])} />
                <span>{item.label} (${pack[item.key]})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-r from-emerald-50 to-blue-50 p-4 text-sm">
          <p className="text-muted-foreground">
            Pack turns <span className="font-semibold text-foreground">${avgFrontGross.toLocaleString()}</span> avg front gross into{" "}
            <span className="font-semibold text-emerald-700">${afterPackGross.toLocaleString()}</span> after-pack gross
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
