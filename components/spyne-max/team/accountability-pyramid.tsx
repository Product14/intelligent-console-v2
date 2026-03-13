"use client"

import { mockAccountabilityTiers } from "@/lib/spyne-max-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pyramid } from "lucide-react"

const tierStyles = [
  { bg: "bg-violet-50 border-violet-200", badge: "bg-violet-100 text-violet-700 border-violet-200" },
  { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  { bg: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
]

export function AccountabilityPyramid() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pyramid className="h-5 w-5 text-violet-500" />
          <CardTitle>Accountability Pyramid</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {mockAccountabilityTiers.map((tier, idx) => {
          const style = tierStyles[idx]
          return (
            <div
              key={tier.level}
              className={`border rounded-lg p-4 ${style.bg}`}
              style={{ marginLeft: `${idx * 20}px`, marginRight: `${idx * 20}px` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={style.badge}>
                  {tier.label}
                </Badge>
                <span className="text-sm font-semibold">{tier.focus}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tier.metrics.map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs font-normal">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
