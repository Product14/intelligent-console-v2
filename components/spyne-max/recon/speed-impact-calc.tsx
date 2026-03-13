"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Calculator, DollarSign } from "lucide-react"

export function SpeedImpactCalc() {
  const [cars, setCars] = React.useState(30)
  const [extraDays, setExtraDays] = React.useState(7)
  const [costPerDay, setCostPerDay] = React.useState(46.44)

  const totalBurned = cars * extraDays * costPerDay
  const monthlyNet = 105000
  const percentOfNet = ((totalBurned * 4) / monthlyNet * 100).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Speed Impact Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Cars sitting</Label>
            <Input
              type="number"
              value={cars}
              onChange={(e) => setCars(Number(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Extra days</Label>
            <Input
              type="number"
              value={extraDays}
              onChange={(e) => setExtraDays(Number(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">$/day holding</Label>
            <Input
              type="number"
              step="0.01"
              value={costPerDay}
              onChange={(e) => setCostPerDay(Number(e.target.value) || 0)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {cars} cars × {extraDays} days × ${costPerDay.toFixed(2)}/day
        </div>

        <div className={cn(
          "rounded-lg p-4 text-center",
          totalBurned > 5000 ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"
        )}>
          <div className="flex items-center justify-center gap-1">
            <DollarSign className={cn(
              "h-5 w-5",
              totalBurned > 5000 ? "text-red-600" : "text-amber-600"
            )} />
            <span className={cn(
              "text-2xl font-bold",
              totalBurned > 5000 ? "text-red-700" : "text-amber-700"
            )}>
              ${totalBurned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className={cn(
            "text-sm font-medium mt-1",
            totalBurned > 5000 ? "text-red-600" : "text-amber-600"
          )}>
            lost profit this week
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          That&apos;s nearly {percentOfNet}% of your monthly net
        </p>
      </CardContent>
    </Card>
  )
}
