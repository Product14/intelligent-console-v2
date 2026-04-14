"use client"

import * as React from "react"
import Link from "next/link"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { soldVehiclesStore } from "@/lib/sold-vehicles-store"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { cn } from "@/lib/utils"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"

function formatSoldAt(date: Date): { date: string; time: string } {
  const d = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
  const t = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
  return { date: d, time: t.toLowerCase() }
}

function SoldInventoryContent() {
  const [soldMap, setSoldMap] = React.useState(() => soldVehiclesStore.getAll())
  const [toastVin, setToastVin] = React.useState<string | null>(null)
  const toastTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    return soldVehiclesStore.subscribe(() => setSoldMap(soldVehiclesStore.getAll()))
  }, [])

  const unmarkSold = (vin: string) => {
    soldVehiclesStore.unmark(vin)
    setToastVin(vin)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVin(null), 4500)
  }

  const redoSold = (vin: string) => {
    soldVehiclesStore.mark(vin)
    setToastVin(null)
    clearTimeout(toastTimer.current)
  }

  const soldVehicles = mockMerchandisingVehicles
    .filter((v) => soldMap.has(v.vin))
    .map((v) => ({ ...v, soldEntry: soldMap.get(v.vin)! }))
    .sort((a, b) => b.soldEntry.soldAt.getTime() - a.soldEntry.soldAt.getTime())

  // Find the vehicle name for the undo toast
  const undoVehicle = toastVin
    ? mockMerchandisingVehicles.find((v) => v.vin === toastVin)
    : null

  return (
    <div className={cn(max2Layout.pageStack)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Sold Inventory</h1>
          <p className={max2Classes.pageDescription}>
            Vehicles marked as sold. Unmark to move them back to active inventory.
          </p>
        </div>
        <Link
          href="/max-2/studio/inventory"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-spyne-border bg-white px-3.5 py-2 text-sm font-medium text-spyne-text transition-colors hover:bg-muted"
        >
          <MaterialSymbol name="arrow_back" size={15} className="text-muted-foreground" />
          Active Inventory
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-spyne-border bg-white">
        {soldVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MaterialSymbol name="inventory_2" size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-spyne-text">No sold vehicles yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mark vehicles as sold from the{" "}
                <Link href="/max-2/studio/inventory" className="text-spyne-primary hover:underline">
                  inventory listing
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-spyne-border bg-muted">
                  <th className="py-3 pl-5 pr-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Vehicle
                  </th>
                  <th className="py-3 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    VIN / Stock
                  </th>
                  <th className="py-3 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Sold Date
                  </th>
                  <th className="py-3 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Sold Time
                  </th>
                  <th className="py-3 pl-4 pr-5 text-right align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {soldVehicles.map((v) => {
                  const { date, time } = formatSoldAt(v.soldEntry.soldAt)
                  const stockNum = v.stockNumber
                    ? v.stockNumber
                    : `STK${v.vin.replace(/\D/g, "").slice(0, 3)}`
                  return (
                    <tr key={v.vin} className="bg-white transition-colors hover:bg-muted">
                      {/* Vehicle */}
                      <td className="py-3.5 pl-5 pr-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="relative aspect-[4/3] w-12 shrink-0 overflow-hidden rounded bg-muted">
                            {v.thumbnailUrl ? (
                              <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <MaterialSymbol name="photo_camera" size={18} className="text-muted-foreground" />
                              </div>
                            )}
                            {/* Sold overlay */}
                            <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40">
                              <span className="text-[9px] font-bold uppercase tracking-wide text-white">Sold</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {v.year} {v.make} {v.model}
                              {v.trim ? ` ${v.trim}` : ""}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {v.isNew ? "New" : "Pre-Owned"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* VIN / Stock */}
                      <td className="py-3.5 px-4 align-middle">
                        <p className="font-mono text-xs text-spyne-text">VIN{v.vin}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{stockNum}</p>
                      </td>

                      {/* Sold Date */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className="text-sm font-medium text-gray-800">{date}</span>
                      </td>

                      {/* Sold Time */}
                      <td className="py-3.5 px-4 align-middle">
                        <span className="text-sm text-muted-foreground">{time}</span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pl-4 pr-5 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => unmarkSold(v.vin)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-spyne-border bg-white px-3 py-1.5 text-xs font-medium text-spyne-text transition-colors hover:border-gray-300 hover:bg-muted"
                        >
                          <MaterialSymbol name="undo" size={14} className="text-muted-foreground" />
                          Unmark Sold
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Undo toast */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-in-out",
          toastVin && undoVehicle
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-3 opacity-0 pointer-events-none",
        )}
      >
        {toastVin && undoVehicle && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.32),0_2px_12px_rgba(0,0,0,0.18)]"
            style={{ background: "#121212" }}
          >
            <MaterialSymbol name="undo" size={16} className="shrink-0 text-[#888888]" />
            <span className="whitespace-nowrap text-sm font-medium text-white">
              <span className="text-[#cccccc]">{undoVehicle.year} {undoVehicle.make} {undoVehicle.model}</span> unmarked
            </span>
            <div className="h-4 w-px shrink-0" style={{ background: "#2e2e2e" }} />
            <button
              type="button"
              onClick={() => redoSold(toastVin)}
              className="whitespace-nowrap text-sm font-semibold text-spyne-primary transition-colors hover:text-[var(--spyne-primary-hover)]"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => { clearTimeout(toastTimer.current); setToastVin(null) }}
              className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
            >
              <MaterialSymbol name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SoldInventoryPage() {
  return (
    <React.Suspense fallback={null}>
      <SoldInventoryContent />
    </React.Suspense>
  )
}
