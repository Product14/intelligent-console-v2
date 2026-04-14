"use client"

import * as React from "react"
import Link from "next/link"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneDarkTooltipPanel } from "@/components/max-2/spyne-ui"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { soldVehiclesStore } from "@/lib/sold-vehicles-store"

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

/** Proxy for VDP / merchandising rows when API does not send front gross yet. */
const STUDIO_HOLDING_COST_PER_DAY = 38

function estimatedFrontGrossForMerch(v: MerchandisingVehicle): number {
  if (v.estimatedFrontGross != null && v.estimatedFrontGross > 0) return v.estimatedFrontGross
  return Math.max(600, Math.round(v.price * 0.088))
}

function holdingUtilizedPctLabel(holdingAccumulated: number, grossMargin: number): string {
  if (grossMargin <= 0) return "—"
  return `${((holdingAccumulated / grossMargin) * 100).toFixed(1)}%`
}

/**
 * Resolution hints aligned with Lot View issue buckets (reprice, liquidate, Smart Campaign, exit, high holding).
 */
function merchandisingHoldingResolutions(
  v: MerchandisingVehicle,
  holdingAccum: number,
  estGross: number,
): string[] {
  const days = v.daysInStock
  const pctOfGross = estGross > 0 ? (holdingAccum / estGross) * 100 : 0
  const live = v.publishStatus === "live"
  const actions: string[] = []

  if (days > 60) {
    actions.push("Exit now: wholesale or auction")
  } else if (days >= 46) {
    actions.push("Liquidate: deep reprice or wholesale")
  } else if (days >= 45) {
    actions.push("Reprice or liquidate (aged 45+ days)")
  } else if (days >= 31 && days <= 44 && live) {
    actions.push("Reprice to competitive market (31–45 day window)")
  }

  if (live && days >= 10 && v.vdpViews < 45) {
    actions.push("Run Smart Campaign to lift VDP views")
  }

  if (holdingAccum >= 1500 || pctOfGross >= 12) {
    actions.push("High holding cost: prioritize sale or reprice")
  }

  if (actions.length === 0) {
    if (days >= 16) {
      actions.push("Monitor pricing before the 31-day repricing window")
    } else {
      actions.push("On track: keep photos and price competitive")
    }
  }

  return [...new Set(actions)].slice(0, 5)
}


function formatMiles(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

/** Lines for the dark vehicle-spec tooltip (odometer, fuel economy, optional DMS fields). */
function merchandisingVehicleSpecLines(v: MerchandisingVehicle): string[] {
  const lines: string[] = [`Odometer: ${formatMiles(v.odometer)} mi`]
  if (v.combinedMpg != null && v.combinedMpg > 0) {
    lines.push(`Fuel mileage (EPA combined): ${v.combinedMpg} MPG`)
  }
  if (v.bodyStyle) lines.push(`Body style: ${v.bodyStyle}`)
  if (v.exteriorColor) lines.push(`Exterior: ${v.exteriorColor}`)
  if (v.fuelType) lines.push(`Fuel type: ${v.fuelType}`)
  return lines
}

function stockLabel(v: MerchandisingVehicle): string {
  if (v.stockNumber) return v.stockNumber
  const n = v.vin.replace(/\D/g, "")
  return n ? `STK${n.slice(0, 3)}` : `STK${v.vin.slice(0, 3)}`
}

function listingCorrelationId(v: MerchandisingVehicle): string {
  if (v.listingExternalId) return v.listingExternalId
  const raw = `${v.vin}STUDIO`.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const chunk = raw + raw
  return chunk.slice(0, 16)
}

function formatInventoryCreatedDateLine(v: MerchandisingVehicle): string {
  if (v.inventoryCreatedAt) {
    const d = new Date(v.inventoryCreatedAt)
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(d)
    }
  }
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - v.daysInStock)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

function formatSyncTooltipTimestamp(iso: string | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)
  const compact = formatted.replace(/\s(am|pm)$/i, (_, m: string) => m.toLowerCase())
  return `Last published: ${compact}`
}

function SyncStatusTooltipContent({ lastPublishedAt }: { lastPublishedAt?: string }) {
  const sub = formatSyncTooltipTimestamp(lastPublishedAt)
  return (
    <div className={spyneComponentClasses.darkTooltipPanel}>
      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-[var(--spyne-on-dark-text)]">
        <MaterialSymbol name="sync" size={20} className="text-[var(--spyne-on-dark-text)]" />
        <span>Sync Status</span>
      </div>
      <div className={cn("mb-2", spyneComponentClasses.darkTooltipInnerWell)}>
        <div className="grid grid-cols-2 gap-3">
          <span className={spyneComponentClasses.darkTooltipSectionLabel}>Platform</span>
          <span className={spyneComponentClasses.darkTooltipSectionLabel}>Status</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 items-start gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--spyne-on-dark-text)]"
              style={{ background: "var(--spyne-chip-orange)" }}
              aria-hidden
            >
              V
            </span>
            <span className="font-medium text-[var(--spyne-on-dark-text)]">Vauto</span>
          </div>
          <div className="min-w-0 text-left">
            <div className="font-medium text-[var(--spyne-on-dark-text)]">Published</div>
            {sub ? <div className={cn("mt-0.5", spyneComponentClasses.darkTooltipMeta)}>{sub}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewStatusBadge({ v }: { v: MerchandisingVehicle }) {
  const copyNeedsReview = !v.hasDescription
  const vehicleNeedsReview = v.mediaStatus !== "real-photos" || v.incompletePhotoSet || v.wrongHeroAngle
  const needsReview = copyNeedsReview || vehicleNeedsReview

  if (!needsReview) {
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeSuccess)}>
        Ready
      </span>
    )
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeWarning)}>
      In Review
    </span>
  )
}

function PublishStateBadge({ v }: { v: MerchandisingVehicle }) {
  const { publishStatus: status } = v

  if (status === "live") {
    const chip = (
      <span className={cn("inline-flex cursor-default items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeBrand)}>
        Published
      </span>
    )
    return (
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild onClick={(e) => e.stopPropagation()}>
          {chip}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={10}
            className={spyneComponentClasses.darkTooltipRadixContent}
          >
            <SyncStatusTooltipContent lastPublishedAt={v.lastPublishedAt ?? v.listingUpdatedAt} />
            <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    )
  }
  if (status === "pending") {
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeInfo)}>
        Pending
      </span>
    )
  }
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeNeutral)}>
      Not Published
    </span>
  )
}

function ImagePreviewCell({ v }: { v: MerchandisingVehicle }) {
  const [hovered, setHovered] = React.useState(false)
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const cellRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (!cellRef.current) return
    const rect = cellRef.current.getBoundingClientRect()
    setPos({
      top: rect.top + window.scrollY + rect.height / 2,
      left: rect.right + window.scrollX + 12,
    })
    setHovered(true)
  }

  return (
    <div
      ref={cellRef}
      className="relative aspect-[4/3] w-14 overflow-hidden rounded bg-gray-100 shrink-0 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {v.thumbnailUrl ? (
        <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <MaterialSymbol name="photo_camera" size={22} />
        </div>
      )}
      {v.photoCount > 0 && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-white/90 px-1 text-[10px] font-semibold tabular-nums text-gray-700 shadow-sm">
          {v.photoCount}
        </span>
      )}

      {hovered && v.thumbnailUrl && typeof document !== "undefined" && (
        <ImagePreviewPortal src={v.thumbnailUrl} top={pos.top} left={pos.left} />
      )}
    </div>
  )
}

function ImagePreviewPortal({ src, top, left }: { src: string; top: number; left: number }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const { createPortal } = require("react-dom")
  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ top, left, transform: "translateY(-50%)" }}
    >
      <div className="overflow-hidden rounded-xl border border-spyne-border bg-white shadow-[0_8px_32px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.08)]"
        style={{ width: 280 }}
      >
        <img src={src} alt="" className="h-auto w-full object-cover" style={{ aspectRatio: "4/3" }} />
      </div>
    </div>,
    document.body
  )
}

type RenameField = "vin" | "stock" | "reg"

const RENAME_META: Record<RenameField, { label: string; maxLen: number; placeholder: string }> = {
  vin:   { label: "VIN",           maxLen: 17, placeholder: "17-character VIN" },
  stock: { label: "Stock Number",  maxLen: 20, placeholder: "e.g. STK-12345" },
  reg:   { label: "Reg. Number",   maxLen: 20, placeholder: "e.g. REG-7890" },
}

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i

function validateRename(
  field: RenameField,
  value: string,
  vehicles: MerchandisingVehicle[],
  currentVin: string,
  renames: Map<string, { vin?: string; stock?: string; reg?: string }>,
): string | null {
  const trimmed = value.trim()
  if (!trimmed) return `${RENAME_META[field].label} cannot be empty.`

  if (field === "vin") {
    if (trimmed.length !== 17) return "VIN must be exactly 17 characters."
    if (!VIN_RE.test(trimmed)) return "VIN may only contain letters A–Z and digits 0–9 (no I, O, or Q)."
    const clash = vehicles.find((v) => {
      const effective = renames.get(v.vin)?.vin ?? v.vin
      return v.vin !== currentVin && effective.toUpperCase() === trimmed.toUpperCase()
    })
    if (clash) return `VIN ${trimmed.toUpperCase()} is already used by ${clash.year} ${clash.make} ${clash.model}.`
  } else {
    if (trimmed.length > RENAME_META[field].maxLen)
      return `${RENAME_META[field].label} must be ${RENAME_META[field].maxLen} characters or fewer.`
    const clash = vehicles.find((v) => {
      if (v.vin === currentVin) return false
      const ov = renames.get(v.vin)
      const effective = field === "stock"
        ? (ov?.stock ?? v.stockNumber ?? "")
        : (ov?.reg ?? "")
      return effective.trim().toLowerCase() === trimmed.toLowerCase()
    })
    if (clash) return `${RENAME_META[field].label} "${trimmed}" is already used by ${clash.year} ${clash.make} ${clash.model}.`
  }
  return null
}

function RenameModal({
  open,
  field,
  currentValue,
  vehicle,
  vehicles,
  renames,
  onSave,
  onClose,
}: {
  open: boolean
  field: RenameField
  currentValue: string
  vehicle: MerchandisingVehicle
  vehicles: MerchandisingVehicle[]
  renames: Map<string, { vin?: string; stock?: string; reg?: string }>
  onSave: (value: string) => void
  onClose: () => void
}) {
  const [value, setValue] = React.useState(currentValue)
  const [error, setError] = React.useState<string | null>(null)
  const meta = RENAME_META[field]

  React.useEffect(() => {
    if (open) {
      setValue(currentValue)
      setError(null)
    }
  }, [open, currentValue])

  const handleSave = () => {
    const err = validateRename(field, value, vehicles, vehicle.vin, renames)
    if (err) { setError(err); return }
    onSave(value.trim())
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Rename {meta.label}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim ? ` ${vehicle.trim}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-spyne-text">{meta.label}</label>
            <Input
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
              placeholder={meta.placeholder}
              maxLength={field === "vin" ? 17 : 20}
              className={cn(
                "h-9 text-sm",
                error && "border-spyne-error focus-visible:ring-spyne-error/30",
              )}
            />
            {error ? (
              <p className="flex items-start gap-1.5 text-xs text-spyne-error">
                <MaterialSymbol name="error" size={14} className="mt-[1px] shrink-0" />
                {error}
              </p>
            ) : field === "vin" ? (
              <p className="text-[11px] text-muted-foreground">17 chars · A–Z, 0–9 · no I, O, Q</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Max {meta.maxLen} characters</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-spyne-border px-3.5 py-1.5 text-sm font-medium text-spyne-text transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-spyne-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--spyne-primary-hover)]"
            >
              Save
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface VehicleMediaTableProps {
  vehicles?: MerchandisingVehicle[]
  title?: string
  /**
   * Hide the select-all checkbox column and the floating bulk-action bar.
   * Use when embedding the table inside an existing card/section (e.g. Studio Overview).
   * Design-system: always pair with `embedded` so border/radius are also suppressed.
   */
  showCheckboxes?: boolean
  /**
   * Strip the table's own outer border and rounded corners.
   * Use whenever the table is nested inside a parent that already provides
   * border + border-radius (e.g. a Card or a rounded section container).
   */
  embedded?: boolean
}

export function VehicleMediaTable({ vehicles, title, showCheckboxes = true, embedded = false }: VehicleMediaTableProps) {
  const data = vehicles ?? mockMerchandisingVehicles

  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [soldMap, setSoldMap] = React.useState(() => soldVehiclesStore.getAll())
  const [toast, setToast] = React.useState<{ vin: string; label: string } | null>(null)
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  // Local rename overrides: vin → { vin?, stock?, reg? }
  const [renames, setRenames] = React.useState<Map<string, { vin?: string; stock?: string; reg?: string }>>(
    () => new Map()
  )
  const [renameModal, setRenameModal] = React.useState<{
    field: RenameField
    vehicle: MerchandisingVehicle
  } | null>(null)

  const saveRename = React.useCallback((vin: string, field: RenameField, value: string) => {
    setRenames((prev) => {
      const next = new Map(prev)
      const existing = next.get(vin) ?? {}
      next.set(vin, { ...existing, [field]: value })
      return next
    })
    setRenameModal(null)
  }, [])

  React.useEffect(() => {
    return soldVehiclesStore.subscribe(() => setSoldMap(soldVehiclesStore.getAll()))
  }, [])

  const toggleOne = React.useCallback((vin: string, next: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (next) n.add(vin)
      else n.delete(vin)
      return n
    })
  }, [])

  const toggleSold = React.useCallback((vin: string, vehicleLabel: string) => {
    const wasSold = soldVehiclesStore.isSold(vin)
    if (wasSold) {
      soldVehiclesStore.unmark(vin)
      setToast(null)
      clearTimeout(toastTimerRef.current)
    } else {
      soldVehiclesStore.mark(vin)
      setToast({ vin, label: vehicleLabel })
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setToast(null), 5000)
    }
  }, [])

  const selectedOnPage = data.filter((v) => selected.has(v.vin)).length
  const headerChecked =
    data.length === 0 ? false
    : selectedOnPage === data.length ? true
    : selectedOnPage > 0 ? "indeterminate"
    : false

  const copyStockLine = React.useCallback(async (v: MerchandisingVehicle) => {
    const line = `${stockLabel(v)} • ${listingCorrelationId(v)}`
    try { await navigator.clipboard.writeText(line) } catch { /* ignore */ }
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
    <div className={cn("overflow-hidden bg-white", !embedded && "rounded-xl border border-spyne-border")}>
      {title ? (
        <div className="border-b border-spyne-border px-5 py-3.5">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          {/* Header */}
          <thead>
            <tr className="border-b border-spyne-border bg-muted">
              {showCheckboxes && (
                <th className="w-10 py-3 pl-4 pr-3 align-middle">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={(c) =>
                      c === true
                        ? setSelected(new Set(data.map((v) => v.vin)))
                        : setSelected(new Set())
                    }
                    aria-label="Select all vehicles"
                  />
                </th>
              )}
              {/* Stock Image — no label, just the col width */}
              <th className={cn("w-20 py-3 pr-4 align-middle", !showCheckboxes && "pl-4")} />
              <th className="py-3 pr-4 text-start align-middle text-xs font-medium uppercase tracking-wider text-gray-500">
                Vehicle
              </th>
              <th className="py-3 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-gray-500 whitespace-nowrap">
                Type
              </th>

              <th className="py-3 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="py-3 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-gray-500 whitespace-nowrap">
                Publish State
              </th>
              <th className="py-3 px-4 text-right align-middle text-xs font-medium uppercase tracking-wider text-gray-500 whitespace-nowrap">
                Age
              </th>
              <th className="py-3 px-4 text-right align-middle text-xs font-medium uppercase tracking-wider text-gray-500 whitespace-nowrap">
                Holding cost
              </th>
              <th className="py-3 px-4 text-right align-middle text-xs font-medium uppercase tracking-wider text-gray-500">
                Price
              </th>
              <th className="w-10 py-3 pl-4 pr-5 align-middle" />
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {data.map((v) => {
              const override = renames.get(v.vin)
              const displayVin = override?.vin ?? v.vin
              const displayStock = override?.stock ?? stockLabel(v)
              const displayReg = override?.reg ?? ""
              const holdingAccum = v.daysInStock * STUDIO_HOLDING_COST_PER_DAY
              const estGross = estimatedFrontGrossForMerch(v)
              const holdingPct = holdingUtilizedPctLabel(holdingAccum, estGross)
              const resolutionHints = merchandisingHoldingResolutions(v, holdingAccum, estGross)
              return (
                <tr
                  key={v.vin}
                  className="group cursor-pointer bg-white transition-colors hover:bg-muted"
                  onClick={() => window.location.href = `/max-2/studio/inventory?vin=${encodeURIComponent(v.vin)}`}
                >
                  {/* Checkbox */}
                  {showCheckboxes && (
                    <td className="py-3.5 pl-4 pr-3 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(v.vin)}
                        onCheckedChange={(c) => toggleOne(v.vin, c === true)}
                        aria-label={`Select ${v.year} ${v.make} ${v.model}`}
                      />
                    </td>
                  )}

                  {/* Stock Image */}
                  <td className={cn("py-3 pr-4 align-middle", !showCheckboxes && "pl-4")}>
                    <ImagePreviewCell v={v} />
                  </td>

                  {/* Vehicle */}
                  <td className="py-3.5 pr-4 align-middle">
                    <TooltipPrimitive.Root>
                      <TooltipPrimitive.Trigger asChild>
                        <div className="w-full min-w-0 cursor-default text-start">
                          <p className="font-semibold text-gray-900">
                            {v.year} {v.make} {v.model}
                            {v.trim ? ` ${v.trim}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            VIN{displayVin} • {displayStock}
                            {displayReg ? ` • ${displayReg}` : ""}
                          </p>
                        </div>
                      </TooltipPrimitive.Trigger>
                      <TooltipPrimitive.Portal>
                        <TooltipPrimitive.Content
                          side="top"
                          align="start"
                          sideOffset={8}
                          className={spyneComponentClasses.darkTooltipRadixContent}
                        >
                          <SpyneDarkTooltipPanel
                            title="Vehicle specifications"
                            lines={merchandisingVehicleSpecLines(v)}
                          />
                          <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                        </TooltipPrimitive.Content>
                      </TooltipPrimitive.Portal>
                    </TooltipPrimitive.Root>
                  </td>


                  {/* Type */}
                  <td className="py-3.5 px-4 align-middle">
                    {v.isNew ? (
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeInfo)}>
                        New
                      </span>
                    ) : (
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", spyneComponentClasses.badgeNeutral)}>
                        Pre-Owned
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 align-middle">
                    <ReviewStatusBadge v={v} />
                  </td>

                  {/* Publish State */}
                  <td className="py-3.5 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <PublishStateBadge v={v} />
                  </td>

                  {/* Days in Stock + created date (aligned and styled like Holding cost column) */}
                  <td className="py-3.5 px-4 align-middle text-right">
                    <div
                      className={cn(
                        "inline-flex max-w-full flex-col items-end text-right",
                        v.daysInStock >= 45 ? "text-red-600" : "text-spyne-text",
                      )}
                    >
                      <span className="text-sm font-medium tabular-nums leading-tight">
                        {v.daysInStock} <span className="font-medium">days</span>
                      </span>
                      <span className="mt-0.5 text-[11px] font-medium tabular-nums leading-tight text-gray-500">
                        {formatInventoryCreatedDateLine(v)}
                      </span>
                    </div>
                  </td>

                  {/* Holding cost ($) with % of est. gross margin below; hover shows lot-style resolutions */}
                  <td className="py-3.5 px-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <TooltipPrimitive.Root>
                      <TooltipPrimitive.Trigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "inline-flex max-w-full cursor-default flex-col items-end text-right rounded-md outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30",
                            v.daysInStock >= 45 ? "text-red-600" : "text-spyne-text",
                          )}
                        >
                          <span className="text-sm font-medium tabular-nums leading-tight">
                            {formatPrice(holdingAccum)}
                          </span>
                          <span className="mt-0.5 text-[11px] font-medium tabular-nums leading-tight text-gray-500">
                            {holdingPct === "—" ? "—" : `${holdingPct} of est. margin`}
                          </span>
                        </button>
                      </TooltipPrimitive.Trigger>
                      <TooltipPrimitive.Portal>
                        <TooltipPrimitive.Content
                          side="top"
                          align="end"
                          sideOffset={8}
                          className={spyneComponentClasses.darkTooltipRadixContent}
                        >
                          <SpyneDarkTooltipPanel title="Suggested actions" lines={resolutionHints} />
                          <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                        </TooltipPrimitive.Content>
                      </TooltipPrimitive.Portal>
                    </TooltipPrimitive.Root>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 align-middle text-right">
                    <span className="text-sm font-medium tabular-nums text-spyne-text">
                      {formatPrice(v.price)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 pl-4 pr-5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/30"
                            aria-label="Row actions"
                          >
                            <MaterialSymbol name="more_vert" size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[200px]">
                          {/* Mark as sold — toggle row */}
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); toggleSold(v.vin, `${v.year} ${v.make} ${v.model}`) }}
                            className="flex items-center justify-between gap-3"
                          >
                            <span>Mark as sold</span>
                            <Switch
                              checked={soldMap.has(v.vin)}
                              onCheckedChange={() => toggleSold(v.vin, `${v.year} ${v.make} ${v.model}`)}
                              onClick={(e) => e.stopPropagation()}
                              className="pointer-events-none scale-90"
                            />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); setRenameModal({ field: "vin", vehicle: v }) }}
                            className="flex items-center gap-2"
                          >
                            <MaterialSymbol name="edit" size={15} className="text-gray-400" />
                            Rename VIN
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); setRenameModal({ field: "stock", vehicle: v }) }}
                            className="flex items-center gap-2"
                          >
                            <MaterialSymbol name="edit" size={15} className="text-gray-400" />
                            Rename Stock number
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); setRenameModal({ field: "reg", vehicle: v }) }}
                            className="flex items-center gap-2"
                          >
                            <MaterialSymbol name="edit" size={15} className="text-gray-400" />
                            Rename Reg. number
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <MaterialSymbol name="delete" size={15} className="text-red-500" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Sold toast */}
    <div
      className={cn(
        "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-in-out",
        toast
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-3 opacity-0 pointer-events-none",
      )}
    >
      {toast && (
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.32),0_2px_12px_rgba(0,0,0,0.18)]" style={{ background: "#121212" }}>
          <MaterialSymbol name="check_circle" size={16} className="shrink-0 text-spyne-success" />
          <span className="text-sm font-medium text-white whitespace-nowrap">
            <span className="text-[#cccccc]">{toast.label}</span> marked as sold
          </span>
          <div className="h-4 w-px shrink-0" style={{ background: "#2e2e2e" }} />
          <button
            type="button"
            onClick={() => { toggleSold(toast.vin, toast.label); setToast(null) }}
            className="whitespace-nowrap rounded-md bg-white/10 px-2.5 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => { clearTimeout(toastTimerRef.current); setToast(null) }}
            className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Dismiss"
          >
            <MaterialSymbol name="close" size={16} />
          </button>
        </div>
      )}
    </div>

    {/* Rename modal */}
    {renameModal && (
      <RenameModal
        open
        field={renameModal.field}
        currentValue={
          renameModal.field === "vin"
            ? (renames.get(renameModal.vehicle.vin)?.vin ?? renameModal.vehicle.vin)
            : renameModal.field === "stock"
            ? (renames.get(renameModal.vehicle.vin)?.stock ?? stockLabel(renameModal.vehicle))
            : (renames.get(renameModal.vehicle.vin)?.reg ?? "")
        }
        vehicle={renameModal.vehicle}
        vehicles={data}
        renames={renames}
        onSave={(value) => saveRename(renameModal.vehicle.vin, renameModal.field, value)}
        onClose={() => setRenameModal(null)}
      />
    )}

    {/* Floating selection action bar */}
    {showCheckboxes && <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-in-out",
        selected.size > 0
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.32),0_2px_12px_rgba(0,0,0,0.18)]" style={{ background: "#121212" }}>
        <span className="mr-1 text-sm font-semibold tabular-nums text-white">
          {selected.size} selected
        </span>
        <div className="h-4 w-px" style={{ background: "#2e2e2e" }} />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#cccccc] transition-colors hover:bg-white/10 hover:text-white"
        >
          <MaterialSymbol name="download" size={16} className="text-[#888888]" />
          Download
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#cccccc] transition-colors hover:bg-white/10 hover:text-white"
        >
          <MaterialSymbol name="delete" size={16} className="text-[#888888]" />
          Delete
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-spyne-primary px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--spyne-primary-hover)]"
        >
          <MaterialSymbol name="campaign" size={16} />
          Run Campaign
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss selection"
        >
          <MaterialSymbol name="close" size={16} />
        </button>
      </div>
    </div>}
    </TooltipProvider>
  )
}
