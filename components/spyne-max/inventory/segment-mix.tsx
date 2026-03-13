"use client"

import * as React from "react"
import { mockMarketSegments } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BarChart3, AlertTriangle } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

const AVG_FRONT_GROSS = 1500

export function SegmentMix() {
  const totalMarket = mockMarketSegments.reduce((s, seg) => s + seg.marketVolume, 0)
  const totalYours = mockMarketSegments.reduce((s, seg) => s + seg.yourVolume, 0)

  const data = mockMarketSegments.map((seg) => {
    const marketPct = (seg.marketVolume / totalMarket) * 100
    const yourPct = (seg.yourVolume / totalYours) * 100
    const gapPct = Math.abs(marketPct - yourPct)
    const dollarOpportunity = gapPct > 10 ? Math.round(((marketPct - yourPct) / 100) * totalYours * AVG_FRONT_GROSS) : 0
    return {
      segment: seg.segment,
      "Market %": +marketPct.toFixed(1),
      "Your %": +yourPct.toFixed(1),
      gapPct: +(marketPct - yourPct).toFixed(1),
      gapAbs: +gapPct.toFixed(1),
      dollarOpportunity,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          Segment Mix
        </CardTitle>
        <CardDescription>Your inventory vs market demand</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, "auto"]} unit="%" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="segment"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Market %" fill="#94a3b8" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Your %" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data
            .filter((d) => d.gapAbs > 10)
            .map((d) => (
              <div
                key={d.segment}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">{d.segment}</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                    Gap {d.gapAbs}%
                  </Badge>
                </div>
                {d.dollarOpportunity > 0 && (
                  <span className="text-sm font-mono font-semibold text-emerald-700">
                    +${d.dollarOpportunity.toLocaleString()} opportunity
                  </span>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
