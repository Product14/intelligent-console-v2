"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Flame, DollarSign } from "lucide-react"

export function WhatItReallyCosts() {
  const [totalCars, setTotalCars] = React.useState(100)
  const [grossPerUnit, setGrossPerUnit] = React.useState(3500)
  const [n2gPct, setN2gPct] = React.useState(30)
  const [slowCars, setSlowCars] = React.useState(40)
  const [extraDays, setExtraDays] = React.useState(10)
  const [holdingCost, setHoldingCost] = React.useState(46)

  const monthlyNet = totalCars * grossPerUnit * (n2gPct / 100)
  const totalBurn = slowCars * extraDays * holdingCost
  const burnPct = monthlyNet > 0 ? (totalBurn / monthlyNet) * 100 : 0
  const barWidth = Math.min(burnPct, 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="h-4 w-4 text-orange-500" />
          What It Really Costs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Cars Sold/Mo", value: totalCars, onChange: setTotalCars },
            { label: "Gross/Unit ($)", value: grossPerUnit, onChange: setGrossPerUnit },
            { label: "N2G %", value: n2gPct, onChange: setN2gPct },
            { label: "Slow Cars", value: slowCars, onChange: setSlowCars },
            { label: "Extra Days", value: extraDays, onChange: setExtraDays },
            { label: "Holding $/Day", value: holdingCost, onChange: setHoldingCost },
          ].map((field) => (
            <div key={field.label} className="space-y-1">
              <Label className="text-xs">{field.label}</Label>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                className="h-8 text-sm font-mono"
              />
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-muted/40 p-4 space-y-4">
          <p className="text-sm leading-relaxed">
            You sell <strong>{totalCars}</strong> cars at{" "}
            <strong>${grossPerUnit.toLocaleString()}</strong> gross. N2G{" "}
            <strong>{n2gPct}%</strong> ={" "}
            <strong className="text-emerald-600">
              ${monthlyNet.toLocaleString()} net
            </strong>
            . If <strong>{slowCars}</strong> cars sit{" "}
            <strong>{extraDays}</strong> extra days at{" "}
            <strong>${holdingCost}/day</strong> ={" "}
            <strong className="text-red-600">
              ${totalBurn.toLocaleString()} burned
            </strong>
            . That&rsquo;s{" "}
            <strong className={cn(burnPct > 15 ? "text-red-600" : "text-amber-600")}>
              {burnPct.toFixed(1)}%
            </strong>{" "}
            of monthly net.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Monthly Net Profit</span>
              <span className="font-mono font-medium text-foreground">
                ${monthlyNet.toLocaleString()}
              </span>
            </div>
            <div className="relative h-8 rounded-full bg-emerald-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium z-10">
                ${monthlyNet.toLocaleString()} net
              </div>
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                  burnPct > 20 ? "bg-red-400" : burnPct > 10 ? "bg-amber-400" : "bg-orange-300"
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                "font-medium",
                burnPct > 15 ? "text-red-600" : "text-amber-600"
              )}>
                ${totalBurn.toLocaleString()} burned ({burnPct.toFixed(1)}%)
              </span>
              <span className="text-muted-foreground">
                ${(monthlyNet - totalBurn).toLocaleString()} remaining
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-lg font-bold text-emerald-700">${monthlyNet.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">Monthly Net</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
            <Flame className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-lg font-bold text-red-700">${totalBurn.toLocaleString()}</p>
            <p className="text-xs text-red-600">Holding Burn</p>
          </div>
          <div className={cn(
            "rounded-lg border p-3 text-center",
            burnPct > 15 ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
          )}>
            <p className={cn(
              "text-2xl font-bold",
              burnPct > 15 ? "text-red-700" : "text-amber-700"
            )}>
              {burnPct.toFixed(1)}%
            </p>
            <p className={cn("text-xs", burnPct > 15 ? "text-red-600" : "text-amber-600")}>
              Of Net Profit
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
