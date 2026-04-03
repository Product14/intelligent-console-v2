"use client"

import { useState } from "react"
import { mockInsightPresets } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { Sparkles, Send } from "lucide-react"

const categoryStyle: Record<string, string> = {
  service: cn("border", spyneComponentClasses.badgeWarning),
  sales: cn("border", spyneComponentClasses.badgeInfo),
  inventory: cn("border", spyneComponentClasses.badgeNeutral, "text-spyne-primary bg-spyne-primary-soft"),
  market: cn("border", spyneComponentClasses.badgeSuccess),
}

export function InsightsBlock() {
  const [query, setQuery] = useState("")

  return (
    <Card className="py-5 gap-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-spyne-primary-soft/80 via-transparent to-spyne-primary-soft/50 pointer-events-none" />

      <CardHeader className="pb-0 relative">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-spyne-primary-soft border border-spyne-border">
            <Sparkles className="h-4 w-4 text-spyne-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Insights</CardTitle>
            <CardDescription className="text-xs">
              Ask your dealership
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {mockInsightPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setQuery(preset.question)}
              className={cn(
                "flex flex-col gap-2 rounded-lg border border-spyne-border bg-card/80 backdrop-blur-sm p-3 text-left transition-all",
                "hover:shadow-sm hover:border-spyne-primary/40 hover:-translate-y-0.5",
              )}
            >
              <Badge
                variant="outline"
                className={cn("text-[10px] w-fit", categoryStyle[preset.category])}
              >
                {preset.category}
              </Badge>
              <span className="text-xs leading-snug text-foreground/90">
                {preset.question}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your dealership..."
              className="pr-4 bg-card/80 backdrop-blur-sm border-spyne-border"
            />
          </div>
          <Button
            size="icon"
            className="shrink-0 bg-spyne-primary hover:bg-[var(--spyne-primary-hover)] text-white shadow-md rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
