"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { calculateProfitability } from "@/lib/spyne-max-mocks"
import { cn } from "@/lib/utils"
import { Calculator, ArrowRight, TrendingUp } from "lucide-react"

export function HundredUnitMath() {
  const [units, setUnits] = React.useState(100)
  const [frontGross, setFrontGross] = React.useState(1500)
  const [backGross, setBackGross] = React.useState(2000)
  const [n2gPercent, setN2gPercent] = React.useState(30)
  const [salesRevenue, setSalesRevenue] = React.useState(2330000)

  const result = calculateProfitability(units, frontGross, backGross, n2gPercent, salesRevenue)

  const fmt = (n: number) =>
    n >= 1000000
      ? `$${(n / 1000000).toFixed(2)}M`
      : n >= 1000
        ? `$${(n / 1000).toFixed(0)}K`
        : `$${n.toLocaleString()}`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>The Math of 100 Units</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Interactive profitability calculator — adjust any input to see the impact
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 items-start">
          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Inputs</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="units" className="text-xs">Units / Month</Label>
                <Input
                  id="units"
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value) || 0)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="front" className="text-xs">Avg Front Gross</Label>
                <Input
                  id="front"
                  type="number"
                  value={frontGross}
                  onChange={(e) => setFrontGross(Number(e.target.value) || 0)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="back" className="text-xs">Avg Back Gross</Label>
                <Input
                  id="back"
                  type="number"
                  value={backGross}
                  onChange={(e) => setBackGross(Number(e.target.value) || 0)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="n2g" className="text-xs">Net-to-Gross %</Label>
                <Input
                  id="n2g"
                  type="number"
                  value={n2gPercent}
                  onChange={(e) => setN2gPercent(Number(e.target.value) || 0)}
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="revenue" className="text-xs">Sales Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={salesRevenue}
                  onChange={(e) => setSalesRevenue(Number(e.target.value) || 0)}
                  className="h-10 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center pt-10">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Calculation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Calculation</h3>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{units} × ${frontGross.toLocaleString()}</span>
                <span className="font-semibold">{fmt(result.totalFrontGross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{units} × ${backGross.toLocaleString()}</span>
                <span className="font-semibold">{fmt(result.totalBackGross)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-muted-foreground">Combined Gross</span>
                <span className="font-bold">{fmt(result.combinedGross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{n2gPercent}% × {fmt(result.combinedGross)}</span>
                <span className="font-semibold">{fmt(result.netProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{fmt(result.netProfit)} ÷ {fmt(salesRevenue)}</span>
                <span className="font-semibold">{result.returnOnSales.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center pt-10">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Results</h3>
            <div className="space-y-3">
              <ResultCard label="Total Front Gross" value={fmt(result.totalFrontGross)} color="blue" />
              <ResultCard label="Total Back Gross" value={fmt(result.totalBackGross)} color="violet" />
              <ResultCard label="Combined Gross" value={fmt(result.combinedGross)} color="amber" />
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Net Profit</span>
                </div>
                <span className="text-lg font-bold text-emerald-700">{fmt(result.netProfit)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-3">
                <span className="text-sm font-medium">Return on Sales</span>
                <Badge variant={result.returnOnSales >= 4.5 ? "default" : "destructive"}>
                  {result.returnOnSales.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    violet: "bg-violet-50 border-violet-200 text-violet-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  }
  return (
    <div className={cn("rounded-lg border p-3 flex items-center justify-between", colors[color])}>
      <span className="text-sm font-medium">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
