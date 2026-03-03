"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Smartphone, Bell, X, AlertTriangle, Flame, Clock, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobilePromotion({ className }: { className?: string }) {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) return null

  return (
    <div className={cn("rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4", className)}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-foreground/5 flex-shrink-0">
          <Smartphone className="h-5 w-5 text-foreground/60" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Enable Margin Alerts</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Your operational companion — get push notifications for critical signals:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { icon: Clock, label: "Near T-Max breach" },
              { icon: Flame, label: "Hot vehicle detected" },
              { icon: AlertTriangle, label: "Recon delay threshold" },
              { icon: EyeOff, label: "No leads after go-live" },
            ].map(item => (
              <span key={item.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border text-muted-foreground">
                <item.icon className="h-2.5 w-2.5" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
            <Bell className="h-3 w-3" />
            Enable Alerts
          </Button>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-md hover:bg-black/5 transition-colors mt-0.5">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
