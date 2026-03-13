"use client"

import { mockLeadershipMetrics } from "@/lib/spyne-max-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"

export function LeadershipMetrics() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <CardTitle>Leadership Metrics</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {mockLeadershipMetrics.map((m) => {
            const isGood = m.current >= m.target
            return (
              <div key={m.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold",
                      isGood ? "text-emerald-600" : "text-red-600"
                    )}>
                      {m.current}{m.unit}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {m.target}{m.unit}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        isGood
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {isGood ? "Above" : "Below"}
                    </Badge>
                  </div>
                </div>
                <Progress value={m.current} max={100} className="h-2" />
                <p className="text-[11px] text-muted-foreground">{m.formula}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
