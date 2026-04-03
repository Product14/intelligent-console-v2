"use client"

import { useState } from "react"
import Link from "next/link"
import { mockThreats } from "@/lib/max-2-mocks"
import type { Threat } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { Shield, ArrowRight, ChevronRight, ChevronDown } from "lucide-react"

const sorted = [...mockThreats].sort((a, b) => {
  if (a.severity === "critical" && b.severity !== "critical") return -1
  if (a.severity !== "critical" && b.severity === "critical") return 1
  return 0
})

function ThreatCard({ threat }: { threat: Threat }) {
  const [open, setOpen] = useState(false)
  const isCritical = threat.severity === "critical"

  return (
    <div
      className={cn(
        "rounded-lg border transition-all border-spyne-border border-l-[3px]",
        isCritical
          ? cn(spyneComponentClasses.rowError, "border-l-spyne-error")
          : cn("bg-card", "border-l-spyne-error/40"),
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-left group"
      >
        <Badge
          variant="destructive"
          className="text-xs font-bold px-2 py-0.5 shrink-0 bg-spyne-error hover:bg-spyne-error/90"
        >
          {threat.count}
        </Badge>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{threat.label}</span>
            {isCritical && (
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-spyne-error hover:bg-spyne-error/90 text-white border-0">
                Critical
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {threat.description}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && threat.vehicles && threat.vehicles.length > 0 && (
        <div className="px-3 pb-3 space-y-1.5">
          <div className="border-t border-spyne-border pt-2">
            {threat.vehicles.map((v) => (
              <div
                key={v.vin}
                className="flex items-center gap-2 py-1.5 text-xs"
              >
                <span className="font-mono text-muted-foreground w-16 truncate shrink-0">
                  {v.vin.slice(-6)}
                </span>
                <span className="font-medium">
                  {v.year} {v.make} {v.model}
                </span>
                <span className="text-muted-foreground ml-auto truncate">
                  {v.detail}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={threat.href}
            className="inline-flex items-center gap-1 text-xs font-medium text-spyne-error hover:opacity-80 transition-opacity"
          >
            View all & take action
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

export function ThreatsBlock() {
  return (
    <Card className="py-5 gap-4">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-lg border border-spyne-border",
              spyneComponentClasses.rowError,
            )}
          >
            <Shield className="h-4 w-4 text-spyne-error" />
          </div>
          <div>
            <CardTitle className="text-base">Threats</CardTitle>
            <CardDescription className="text-xs">
              Immediate downside — loss prevention
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((t) => (
          <ThreatCard key={t.id} threat={t} />
        ))}
      </CardContent>
    </Card>
  )
}
