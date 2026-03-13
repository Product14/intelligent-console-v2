"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers } from "lucide-react"

const tiers = [
  {
    level: "Top",
    label: "Domination",
    color: "bg-red-50 border-red-200",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    channels: ["Geo-target competitor stores", "Conquest campaigns", "Video ads"],
  },
  {
    level: "Middle",
    label: "Engagement",
    color: "bg-amber-50 border-amber-200",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    channels: ["Google Ads (Search + Retargeting)", "Meta Ads", "Marketplace listings", "Email / SMS"],
  },
  {
    level: "Foundation",
    label: "Visibility",
    color: "bg-emerald-50 border-emerald-200",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    channels: ["Google Business Profile", "Website", "SEO", "Local Ads"],
  },
]

export function MarketingPyramid() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-violet-500" />
          <CardTitle>Marketing Pyramid</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tiers.map((tier, idx) => (
          <div
            key={tier.level}
            className={`border rounded-lg p-4 ${tier.color}`}
            style={{ marginLeft: `${idx * 16}px`, marginRight: `${idx * 16}px` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={tier.badgeClass}>
                {tier.level}
              </Badge>
              <span className="text-sm font-semibold">{tier.label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tier.channels.map((ch) => (
                <Badge key={ch} variant="secondary" className="text-xs font-normal">
                  {ch}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
