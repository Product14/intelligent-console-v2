"use client"

import { mockMarketingChannels } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { DollarSign } from "lucide-react"

function cpsColor(cps: number) {
  if (cps === 0) return "text-spyne-success"
  if (cps > 400) return "text-spyne-error"
  if (cps > 250) return "text-spyne-text"
  return "text-spyne-success"
}

export function ChannelROITable() {
  const totals = mockMarketingChannels.reduce(
    (acc, ch) => ({
      spend: acc.spend + ch.spend,
      leads: acc.leads + ch.leads,
      appointments: acc.appointments + ch.appointments,
      unitsSold: acc.unitsSold + ch.unitsSold,
    }),
    { spend: 0, leads: 0, appointments: 0, unitsSold: 0 },
  )
  const totalCPS = totals.unitsSold > 0 ? Math.round(totals.spend / totals.unitsSold) : 0
  const totalCPL = totals.leads > 0 ? +(totals.spend / totals.leads).toFixed(1) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-spyne-success" />
          <div>
            <CardTitle>Channel ROI</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Marketing spend vs. return by channel
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
                <tr
                  key={ch.source}
                  className={cn(
                    "border-b last:border-0",
                    ch.spend === 0 && spyneComponentClasses.rowPositive,
                  )}
                >
                  <td className="py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {ch.source}
                      {ch.spend === 0 && (
                        <Badge
                          variant="outline"
                          className={cn("border", spyneComponentClasses.badgeSuccess)}
                        >
                          $0 — Best ROI
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono">
                    ${ch.spend.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono">{ch.leads}</td>
                  <td className="py-3 text-right font-mono hidden sm:table-cell">
                    {ch.appointments}
                  </td>
                  <td className="py-3 text-right font-mono">{ch.unitsSold}</td>
                  <td
                    className={cn(
                      "py-3 text-right font-mono font-semibold",
                      cpsColor(ch.costPerSale),
                    )}
                  >
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
                <td className="pt-3 text-right font-mono">
                  ${totals.spend.toLocaleString()}
                </td>
                <td className="pt-3 text-right font-mono">{totals.leads}</td>
                <td className="pt-3 text-right font-mono hidden sm:table-cell">
                  {totals.appointments}
                </td>
                <td className="pt-3 text-right font-mono">{totals.unitsSold}</td>
                <td className={cn("pt-3 text-right font-mono", cpsColor(totalCPS))}>
                  ${totalCPS}
                </td>
                <td className="pt-3 text-right font-mono text-muted-foreground hidden md:table-cell">
                  ${totalCPL}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
