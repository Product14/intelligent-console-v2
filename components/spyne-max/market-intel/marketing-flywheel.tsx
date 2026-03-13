"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { RefreshCw, ChevronRight } from "lucide-react"

const steps = [
  {
    title: "Inventory That Fits Demand",
    description: "Stock what the market wants — segment-aligned, priced right, fresh.",
    color: "bg-indigo-100 border-indigo-300 text-indigo-900",
    iconBg: "bg-indigo-500",
  },
  {
    title: "Messaging That Connects",
    description: "Photos, descriptions, and ads that speak to buyer intent.",
    color: "bg-violet-100 border-violet-300 text-violet-900",
    iconBg: "bg-violet-500",
  },
  {
    title: "Leads That Convert",
    description: "Fast response, smart follow-up, BDC discipline.",
    color: "bg-purple-100 border-purple-300 text-purple-900",
    iconBg: "bg-purple-500",
  },
  {
    title: "Appointments That Close",
    description: "Show rate, TO rate, and desk process execution.",
    color: "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900",
    iconBg: "bg-fuchsia-500",
  },
  {
    title: "Reviews That Feed Traffic",
    description: "CSI, Google reviews, and repeat/referral loops.",
    color: "bg-pink-100 border-pink-300 text-pink-900",
    iconBg: "bg-pink-500",
  },
]

export function MarketingFlywheel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RefreshCw className="h-4 w-4 text-primary" />
          Marketing Flywheel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center flex-1 min-w-0">
              <div className={cn(
                "flex-1 rounded-xl border p-4 flex flex-col gap-1.5 min-w-0",
                step.color,
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shrink-0",
                    step.iconBg,
                  )}>
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold leading-tight">{step.title}</h3>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mx-1 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Continuous cycle — step 5 feeds back to step 1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
