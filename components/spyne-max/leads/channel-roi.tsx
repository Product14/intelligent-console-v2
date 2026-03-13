"use client"

import { mockMarketingChannels } from "@/lib/spyne-max-mocks"
import type { MarketingChannel } from "@/services/spyne-max/spyne-max.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DollarSign } from "lucide-react"

const AVG_FRONT_GROSS = 1500

function cpsColor(cps: number): string {
  if (cps === 0) return "text-emerald-600"
  if (cps > AVG_FRONT_GROSS) return "text-red-600"
  if (cps > 300) return "text-amber-600"
  return "text-emerald-600"
}

function cpsBadge(ch: MarketingChannel) {
  if (ch.spend === 0) {
    return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">$0 — Best ROI</Badge>
  }
  return null
}

export function ChannelROI() {
  const totals = mockMarketingChannels.reduce(
    (acc, ch) => ({
      spend: acc.spend + ch.spend,
      leads: acc.leads + ch.leads,
      appointments: acc.appointments + ch.appointments,
      unitsSold: acc.unitsSold + ch.unitsSold,
    }),
    { spend: 0, leads: 0, appointments: 0, unitsSold: 0 }
  )
  const totalCPS = totals.unitsSold > 0 ? Math.round(totals.spend / totals.unitsSold) : 0
  const totalCPL = totals.leads > 0 ? +(totals.spend / totals.leads).toFixed(1) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <div>
            <CardTitle>Channel ROI</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Where&rsquo;s the money going — and what&rsquo;s it bringing back?
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Source</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Spend</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Leads</th>
                <th className="pb-3 font-medium text-muted-foreground text-right hidden sm:table-cell">Appts</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Units Sold</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">CPS</th>
                <th className="pb-3 font-medium text-muted-foreground text-right hidden md:table-cell">CPL</th>
              </tr>
            </thead>
            <tbody>
              {mockMarketingChannels.map((ch) => (
                <tr key={ch.source} className="border-b last:border-0">
                  <td className="py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {ch.source}
                      {cpsBadge(ch)}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono">${ch.spend.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">{ch.leads}</td>
                  <td className="py-3 text-right font-mono hidden sm:table-cell">{ch.appointments}</td>
                  <td className="py-3 text-right font-mono">{ch.unitsSold}</td>
                  <td className={cn("py-3 text-right font-mono font-semibold", cpsColor(ch.costPerSale))}>
                    ${ch.costPerSale}
                  </td>
                  <td className="py-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                    ${ch.costPerLead.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold">
                <td className="pt-3">Total</td>
                <td className="pt-3 text-right font-mono">${totals.spend.toLocaleString()}</td>
                <td className="pt-3 text-right font-mono">{totals.leads}</td>
                <td className="pt-3 text-right font-mono hidden sm:table-cell">{totals.appointments}</td>
                <td className="pt-3 text-right font-mono">{totals.unitsSold}</td>
                <td className={cn("pt-3 text-right font-mono", cpsColor(totalCPS))}>${totalCPS}</td>
                <td className="pt-3 text-right font-mono text-muted-foreground hidden md:table-cell">${totalCPL}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
