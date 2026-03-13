"use client"

import { mockMarketingChannels } from "@/lib/spyne-max-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Lightbulb } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

const paidChannels = mockMarketingChannels.filter((ch) => ch.spend > 0)
const totalSpend = paidChannels.reduce((s, ch) => s + ch.spend, 0)

const cpsData = paidChannels.map((ch) => ({
  name: ch.source,
  cps: ch.costPerSale,
  spend: ch.spend,
  pct: Math.round((ch.spend / totalSpend) * 100),
}))

function barColor(cps: number) {
  if (cps > 400) return "#ef4444"
  if (cps > 250) return "#f59e0b"
  return "#10b981"
}

const google = paidChannels.find((ch) => ch.source.includes("Google"))
const autotrader = paidChannels.find((ch) => ch.source.includes("AutoTrader"))

export function SpendOptimizer() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle>Spend Optimizer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {autotrader && google && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p>
                <span className="font-semibold">AutoTrader CPS (${autotrader.costPerSale})</span> is{" "}
                {(autotrader.costPerSale / google.costPerSale).toFixed(1)}x Google (${google.costPerSale}).
                Consider shifting 50% of AutoTrader budget to Google Search.
              </p>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-1">Current Allocation</h4>
          <div className="flex h-6 rounded-full overflow-hidden">
            {cpsData.map((ch) => (
              <div
                key={ch.name}
                className="flex items-center justify-center text-[10px] font-medium text-white"
                style={{
                  width: `${ch.pct}%`,
                  backgroundColor: barColor(ch.cps),
                  minWidth: ch.pct > 5 ? undefined : "24px",
                }}
                title={`${ch.name}: ${ch.pct}%`}
              >
                {ch.pct > 10 && `${ch.pct}%`}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {cpsData.map((ch) => (
              <div key={ch.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: barColor(ch.cps) }}
                />
                {ch.name}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Cost Per Sale by Channel</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cpsData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `$${v}`} fontSize={12} />
              <YAxis type="category" dataKey="name" width={130} fontSize={12} />
              <Tooltip
                formatter={(v: number) => [`$${v}`, "CPS"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="cps" radius={[0, 4, 4, 0]} barSize={24}>
                {cpsData.map((entry) => (
                  <Cell key={entry.name} fill={barColor(entry.cps)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
