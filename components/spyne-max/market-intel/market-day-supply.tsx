"use client"

import * as React from "react"
import { mockMarketSegments } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CalendarClock } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

function supplyColor(yours: number, market: number) {
  const ratio = yours / market
  if (ratio > 1.3) return "text-red-600"
  if (ratio < 0.7) return "text-emerald-600"
  return "text-foreground"
}

function supplyLabel(yours: number, market: number) {
  const ratio = yours / market
  if (ratio > 1.3) return "Overweight"
  if (ratio < 0.7) return "Buy Zone"
  return "Balanced"
}

function supplyBadgeCls(yours: number, market: number) {
  const ratio = yours / market
  if (ratio > 1.3) return "bg-red-100 text-red-800"
  if (ratio < 0.7) return "bg-emerald-100 text-emerald-800"
  return "bg-gray-100 text-gray-800"
}

export function MarketDaySupply() {
  const data = mockMarketSegments.map((seg) => ({
    segment: seg.segment,
    "Market MDS": seg.marketDaySupply,
    "Your MDS": seg.yourDaySupply,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-primary" />
          Market Day Supply
        </CardTitle>
        <CardDescription>Per-segment comparison of days of supply</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/50 px-3 py-2">
          <p className="text-xs text-muted-foreground font-mono">
            Formula: (Total Market Inventory ÷ 30-Day Sales) × 30
          </p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 10, right: 20 }}>
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Market MDS" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Your MDS" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {mockMarketSegments.map((seg) => (
            <div key={seg.segment} className="rounded-lg border p-2 space-y-0.5">
              <p className="text-xs font-medium truncate">{seg.segment}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mkt: {seg.marketDaySupply}d</span>
                <span className={cn("text-xs font-semibold", supplyColor(seg.yourDaySupply, seg.marketDaySupply))}>
                  You: {seg.yourDaySupply}d
                </span>
              </div>
              <span className={cn("inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium", supplyBadgeCls(seg.yourDaySupply, seg.marketDaySupply))}>
                {supplyLabel(seg.yourDaySupply, seg.marketDaySupply)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
