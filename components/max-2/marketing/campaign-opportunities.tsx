"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Rocket, TrendingUp } from "lucide-react"

const campaigns = [
  {
    id: "co1",
    vehicle: "2021 Ford F-150 XLT",
    segment: "Truck $30-45k",
    demandTrend: "Truck demand up 12%",
    suggestedCampaign: "Geo-targeted social ad",
  },
  {
    id: "co2",
    vehicle: "2022 Audi Q5 Premium",
    segment: "Luxury $40k+",
    demandTrend: "Luxury crossover demand strong",
    suggestedCampaign: "Premium display campaign",
  },
  {
    id: "co3",
    vehicle: "2020 Toyota RAV4 XLE",
    segment: "SUV < $30k",
    demandTrend: "SUV demand up 18%",
    suggestedCampaign: "Search + retargeting bundle",
  },
  {
    id: "co4",
    vehicle: "2021 Mazda CX-5 Touring",
    segment: "Crossover $25-40k",
    demandTrend: "Crossover demand rising 9%",
    suggestedCampaign: "Email blast to past inquiries",
  },
]

export function CampaignOpportunities() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle>Campaign Opportunities</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Vehicles ready for targeted campaigns
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{c.vehicle}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {c.segment}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {c.demandTrend}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Suggested: {c.suggestedCampaign}
              </p>
            </div>
            <Button size="sm" className="shrink-0">
              Launch Campaign
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
