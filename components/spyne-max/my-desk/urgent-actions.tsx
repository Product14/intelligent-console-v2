"use client"

import { mockUrgentActions } from "@/lib/spyne-max-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

const severityStyles = {
  high: { dot: "bg-red-500", border: "border-l-red-500", bg: "hover:bg-red-50/50" },
  medium: { dot: "bg-amber-500", border: "border-l-amber-500", bg: "hover:bg-amber-50/50" },
  low: { dot: "bg-blue-500", border: "border-l-blue-500", bg: "hover:bg-blue-50/50" },
}

export function UrgentActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Urgent Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 -mt-2">
        {mockUrgentActions.map((action) => {
          const styles = severityStyles[action.severity]
          return (
            <div
              key={action.id}
              className={cn(
                "flex items-center gap-3 px-3 py-3 border-l-[3px] rounded-r-md transition-colors",
                styles.border, styles.bg,
                "border-b last:border-b-0"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", styles.dot)} />
              <p className="text-sm flex-1 leading-snug">{action.message}</p>
              {action.href ? (
                <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs" asChild>
                  <Link href={action.href}>
                    {action.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs">
                  {action.actionLabel}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
