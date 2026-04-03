"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type InventoryVehicleType = "all" | "new" | "used"

export interface Max2InventoryListHeaderProps {
  vehicleType: InventoryVehicleType
  onVehicleTypeChange: (t: InventoryVehicleType) => void
  counts: { all: number; new: number; used: number }
  /** Defaults to a VAuto-style line with current date/time */
  syncLabel?: string
  searchPlaceholder?: string
  /**
   * When non-empty (and motion is allowed), cycles these as the visible hint when the field is empty and unfocused.
   * Falls back to `searchPlaceholder` when unset or for `prefers-reduced-motion` (first hint only as static placeholder).
   */
  searchHintRotation?: string[]
  searchValue: string
  onSearchChange: (value: string) => void
  viewInput?: { checked: boolean; onCheckedChange: (v: boolean) => void }
  onApplyFiltersClick?: () => void
  addVehicleHref?: string
  addVehicleLabel?: string
  quickChips?: React.ReactNode
  /** Extra items in the overflow menu (Export, etc.) */
  moreMenuExtras?: React.ReactNode
}

function defaultSyncLabel() {
  const formatted = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date())
  return `Last synced from Vauto: ${formatted}`
}

const TAB_DEFS: { id: InventoryVehicleType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "used", label: "Pre-owned" },
]

export function Max2InventoryListHeader({
  vehicleType,
  onVehicleTypeChange,
  counts,
  syncLabel,
  searchPlaceholder = "Search",
  searchHintRotation,
  searchValue,
  onSearchChange,
  viewInput,
  onApplyFiltersClick,
  addVehicleHref,
  addVehicleLabel = "Add Vehicle",
  quickChips,
  moreMenuExtras,
}: Max2InventoryListHeaderProps) {
  const sync = syncLabel ?? defaultSyncLabel()

  const hints = React.useMemo(
    () => (searchHintRotation ?? []).map((s) => s.trim()).filter(Boolean),
    [searchHintRotation]
  )

  const [hintIndex, setHintIndex] = React.useState(0)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const useAnimatedHints = hints.length > 0 && !reducedMotion
  const showHintOverlay =
    useAnimatedHints && searchValue.length === 0 && !searchFocused

  React.useEffect(() => {
    setHintIndex(0)
  }, [hints.join("|")])

  React.useEffect(() => {
    if (!useAnimatedHints || hints.length <= 1) return
    const id = window.setInterval(() => {
      setHintIndex((i) => (i + 1) % hints.length)
    }, 3000)
    return () => window.clearInterval(id)
  }, [useAnimatedHints, hints.length])

  const searchAriaLabel =
    hints.length > 0
      ? `Search vehicles. You can search by: ${hints.map((h) => h.replace(/…/g, "")).join(", ")}`
      : searchPlaceholder

  const inputPlaceholder =
    hints.length === 0
      ? searchPlaceholder
      : reducedMotion
        ? hints[0] ?? searchPlaceholder
        : showHintOverlay
          ? ""
          : searchPlaceholder

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-spyne-border">
        <div className="flex flex-wrap gap-6 sm:gap-8">
          {TAB_DEFS.map((tab) => {
            const active = vehicleType === tab.id
            const n = tab.id === "all" ? counts.all : tab.id === "new" ? counts.new : counts.used
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onVehicleTypeChange(tab.id)}
                className={cn(
                  spyneComponentClasses.inventoryTab,
                  active && spyneComponentClasses.inventoryTabActive
                )}
              >
                {tab.label} ({n})
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-spyne-success pb-3 sm:pb-3">
          <MaterialSymbol name="cloud_done" size={20} className="shrink-0 text-spyne-success" />
          <span>{sync}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-[240px] sm:max-w-[280px] shrink-0 min-w-0">
          <MaterialSymbol
            name="search"
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-spyne-text-secondary"
          />
          <Input
            placeholder={inputPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label={searchAriaLabel}
            className="h-9 rounded-md border-spyne-border bg-spyne-surface pl-8 pr-3 text-[13px] leading-tight text-spyne-text shadow-none placeholder:text-spyne-text-secondary"
          />
          {showHintOverlay && hints[hintIndex] ? (
            <span
              key={hintIndex}
              className={cn(
                "pointer-events-none absolute left-8 right-3 top-1/2 -translate-y-1/2",
                spyneComponentClasses.inventorySearchHint
              )}
              aria-hidden
            >
              {hints[hintIndex]}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {viewInput && (
            <label className="inline-flex h-10 items-center gap-3 rounded-lg border border-spyne-border bg-spyne-surface px-3 text-sm font-medium text-spyne-text cursor-pointer">
              <span className="text-spyne-text-secondary whitespace-nowrap">View Input</span>
              <Switch
                checked={viewInput.checked}
                onCheckedChange={viewInput.onCheckedChange}
                className="data-[state=checked]:bg-spyne-primary"
              />
            </label>
          )}

          {onApplyFiltersClick && (
            <button
              type="button"
              onClick={onApplyFiltersClick}
              className={cn(spyneComponentClasses.btnSecondaryMd, "whitespace-nowrap")}
            >
              <MaterialSymbol name="filter_list" size={20} />
              Apply Filters
            </button>
          )}

          {addVehicleHref && (
            <Link
              href={addVehicleHref}
              className={cn(spyneComponentClasses.btnPrimaryMd, "no-underline whitespace-nowrap")}
            >
              <MaterialSymbol name="add" size={20} />
              {addVehicleLabel}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-spyne-border bg-spyne-surface text-spyne-text transition-colors hover:bg-[#f9fafb]"
                aria-label="More options"
              >
                <MaterialSymbol name="more_vert" size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Refresh from DMS
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Export view
              </DropdownMenuItem>
              {moreMenuExtras}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {quickChips ? (
        <div className="flex flex-wrap items-center gap-2">{quickChips}</div>
      ) : null}
    </div>
  )
}
