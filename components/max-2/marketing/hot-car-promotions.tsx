"use client"

import { mockOpportunities } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, TrendingUp } from "lucide-react"

export function HotCarPromotions() {
  const hotOpp = mockOpportunities.find((o) => o.category === "hot-vehicle")
  const items = hotOpp?.items ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <CardTitle>Hot Car Promotions</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Rising demand + strong inventory
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Hot
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {item.detail}
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0">
              Promote
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
