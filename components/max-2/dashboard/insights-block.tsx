"use client"

import { useState } from "react"
import { mockInsightPresets } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Sparkles, Send } from "lucide-react"

const categoryStyle: Record<string, string> = {
  service: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  sales: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  inventory: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  market: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
}

export function InsightsBlock() {
  const [query, setQuery] = useState("")

  return (
    <Card className="py-5 gap-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20 pointer-events-none" />

      <CardHeader className="pb-0 relative">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-950 dark:to-blue-950">
            <Sparkles className="h-4 w-4 text-violet-600" />
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
                "flex flex-col gap-2 rounded-lg border bg-card/80 backdrop-blur-sm p-3 text-left transition-all",
                "hover:shadow-sm hover:border-violet-300 dark:hover:border-violet-700 hover:-translate-y-0.5",
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
              className="pr-4 bg-card/80 backdrop-blur-sm"
            />
          </div>
          <Button
            size="icon"
            className="shrink-0 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
