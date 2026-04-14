"use client"

import { useState, useCallback, type ElementType, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { mockMerchandisingSummary, mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { cn } from "@/lib/utils"
import { max2Classes, spyneComponentClasses, spyneConsoleTokens } from "@/lib/design-system/max-2"
import {
  SpyneChip,
  SpyneMediaStatusChip,
  SpynePublishStatusChip,
  SpyneSeverityChip,
} from "@/components/max-2/spyne-ui"
import { Max2ActionTab, Max2ActionTabStrip } from "@/components/max-2/max2-action-tab"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"
import {
  Clock, Globe, Camera, FileText, Eye,
  ArrowRight, ImageOff, Tag, ExternalLink,
  Sun, Video, Images, AlertTriangle, Zap, Sparkles,
  ChevronRight, ChevronDown, Crown, Megaphone, BookOpen, Copy, Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { VehicleMediaTable } from "@/components/max-2/studio/vehicle-media-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MerchandisingVehicle, MediaStatus, PublishStatus } from "@/services/max-2/max-2.types"
import { RotateCw, Video as VideoIcon } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

type InsightTone = "success" | "warning" | "critical"

type InsightItem = {
  id: string
  cardTitle: string
  iconTone: InsightTone
  icon: ElementType
  metricLine: string
  inventoryHref: string
  metrics: { label: string; value: string }[]
}

const INSIGHT_ICON_WELL: Record<InsightTone, string> = {
  success: spyneComponentClasses.insightRowIconWellSuccess,
  warning: spyneComponentClasses.insightRowIconWellWarning,
  critical: spyneComponentClasses.insightRowIconWellCritical,
}

/** Icon color — darker tonal shade matching the well bg, sourced from design-system vars */
const INSIGHT_ICON_COLOR: Record<InsightTone, string> = {
  success: "text-[color:var(--spyne-success)]",
  warning: "text-[color:var(--spyne-warning-ink)]",
  critical: "text-[color:var(--spyne-error)]",
}

const INSIGHT_CHIP_TONE: Record<InsightTone, "success" | "warning" | "error"> = {
  success: "success",
  warning: "warning",
  critical: "error",
}

const INSIGHT_CHIP_LABEL: Record<InsightTone, string> = {
  success: "Resolved",
  warning: "In Progress",
  critical: "Needs Action",
}

function InsightRow({ item }: { item: InsightItem }) {
  const Icon = item.icon
  const tone = item.iconTone

  return (
    <div className={cn(spyneComponentClasses.insightRow, "p-0 overflow-hidden")}>
      <div className="flex gap-4 px-5 py-4">
        {/* Icon well */}
        <div className={cn(spyneComponentClasses.insightRowIconWell, INSIGHT_ICON_WELL[tone], "shrink-0 self-start mt-0.5")}>
          <Icon className={cn("h-4 w-4 shrink-0", INSIGHT_ICON_COLOR[tone])} aria-hidden />
        </div>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Title */}
          <p className={cn(spyneComponentClasses.insightRowTitle, "truncate")}>
            {item.cardTitle}
          </p>
          {/* Meta line */}
          <p className={spyneComponentClasses.insightRowMeta}>{item.metricLine}</p>
          {/* Metrics chips — single row, no wrap */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {item.metrics.map((m) => (
              <div
                key={m.label}
                className="flex shrink-0 items-center gap-1 rounded-full border border-spyne-border bg-white px-3 py-1"
              >
                <span className="text-xs font-bold tabular-nums text-spyne-text">{m.value}</span>
                <span className="text-xs text-spyne-text-secondary">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Details — top-right corner */}
        <Link
          href={item.inventoryHref}
          className="inline-flex shrink-0 items-center gap-1 self-start whitespace-nowrap text-xs font-medium text-spyne-primary transition-opacity hover:opacity-80"
        >
          View Details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

function fmtPrice(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p)
}

function HighlightNums({ text }: { text: string }) {
  const parts = text.split(/([\d,]+(?:\.\d+)?)/)
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="font-semibold text-[#1a1a1a]">{part}</span>
        ) : (
          part
        )
      )}
    </>
  )
}

function VehicleTable({ vehicles, issueBadge }: { vehicles: MerchandisingVehicle[]; issueBadge?: (v: MerchandisingVehicle) => ReactNode }) {
  if (vehicles.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No vehicles in this category.</p>
  }
  const TH = ({ children, right, center }: { children: ReactNode; right?: boolean; center?: boolean }) => (
    <th
      className={cn(
        "border-0 border-t border-solid border-spyne-border py-3 px-4 text-left text-xs font-medium uppercase tracking-wider text-spyne-text-secondary whitespace-nowrap bg-muted",
        right && "text-right",
        center && "text-center",
      )}
    >
      {children}
    </th>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-spyne-border">
            <TH><span className="sr-only">Thumb</span></TH>
            <TH>Vehicle</TH>
            <TH center>Media</TH>
            <TH center>Status</TH>
            <TH center>Score</TH>
            <TH center>Age</TH>
            <TH center>
              <span className="inline-flex items-center justify-center gap-1">
                Views
                <span
                  className="inline-flex leading-none text-spyne-text-secondary"
                  title="Vehicle Detail Page views"
                >
                  <MaterialSymbol name="info" size={16} />
                </span>
              </span>
            </TH>
            {issueBadge && <TH center>Issue</TH>}
            <TH center>Price</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {vehicles.map((v) => (
              <tr key={v.vin} className="transition-colors hover:bg-muted">
                <td className="py-3 px-4 w-16">
                  <div className="w-13 aspect-[4/3] shrink-0 overflow-hidden rounded">
                    {v.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/max-2/vehicle-thumbnail-empty.png"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </td>
                {/* Vehicle */}
                <td className="py-3 px-4 min-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{v.year} {v.make} {v.model}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.trim}</p>
                </td>
                {/* Media */}
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <SpyneMediaStatusChip mediaStatus={v.mediaStatus} compact className="shrink-0" />
                    {v.has360 && <RotateCw className="h-3 w-3 text-spyne-info shrink-0" />}
                    {v.hasVideo && <VideoIcon className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                </td>
                {/* Status */}
                <td className="py-3 px-4 text-center">
                  <SpynePublishStatusChip publishStatus={v.publishStatus} compact />
                </td>
                {/* Score */}
                <td className="py-3 px-4 text-center">
                  <span className={cn("text-sm font-semibold tabular-nums", v.listingScore >= 75 ? "text-spyne-success" : v.listingScore >= 50 ? "text-spyne-text" : "text-spyne-error")}>
                    {v.listingScore}
                  </span>
                </td>
                {/* Age */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <span className={cn("text-sm tabular-nums", v.daysInStock >= 45 ? "text-spyne-error font-semibold" : v.daysInStock >= 30 ? "text-spyne-text font-semibold" : "")}>
                    {v.daysInStock}d
                  </span>
                </td>
                {/* Views */}
                <td className="py-3 px-4 text-center text-sm tabular-nums text-muted-foreground">{v.vdpViews}</td>
                {/* Issue */}
                {issueBadge && <td className="py-3 px-4 text-center whitespace-nowrap">{issueBadge(v)}</td>}
                {/* Price */}
                <td className="py-3 px-4 text-center text-sm font-medium tabular-nums whitespace-nowrap">{fmtPrice(v.price)}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VehicleListModal({
  open,
  onClose,
  title,
  description,
  vehicles,
  inventoryHref,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  vehicles: MerchandisingVehicle[]
  inventoryHref: string
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
          <div className="max-h-[420px] overflow-y-auto rounded-xl border border-spyne-border">
            <VehicleMediaTable vehicles={vehicles} showCheckboxes={false} embedded />
          </div>
          <Link
            href={inventoryHref}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            See these vehicles in Active Inventory
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type TrainingGuideSection = { heading: string; bullets: string[] }

function PhotographerTrainingModal({
  open,
  onClose,
  title,
  badInput,
  improvement,
  sections,
}: {
  open: boolean
  onClose: () => void
  title: string
  badInput: string
  improvement: string
  sections: TrainingGuideSection[]
}) {
  const [copied, setCopied] = useState(false)

  const plainText = useCallback(() => {
    const body = sections
      .map((s) => `${s.heading}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n")
    return `Training note: ${title}\n\nIssue we saw: ${badInput}\nHow we fixed it: ${improvement}\n\n--- Photographer checklist ---\n\n${body}`
  }, [title, badInput, improvement, sections])

  const handleCopy = () => {
    void navigator.clipboard.writeText(plainText())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[min(90vh,640px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            Training guide for photographer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
            <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
              <p>
                <span className="font-semibold text-spyne-text">Bad input: </span>
                <span className="text-muted-foreground">{badInput}</span>
              </p>
              <p>
                <span className="font-semibold text-spyne-success">Made better: </span>
                <span className="text-muted-foreground">{improvement}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Send this checklist</p>
            {sections.map((sec) => (
              <div key={sec.heading} className="rounded-lg border p-3">
                <p className="text-sm font-semibold">{sec.heading}</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {sec.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied to clipboard" : "Copy for email / SMS"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DaysToFrontlineModal({
  open,
  onClose,
  value,
  actions,
}: {
  open: boolean
  onClose: () => void
  value: number
  actions: { count: number; label: string; severity: "critical" | "warning"; icon: ElementType; href: string }[]
}) {
  const isOnTarget = value <= 4

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-primary" />
            Days to Frontline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Status pill + definition */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Arrival → fully listed online with real photos &amp; description.
            </p>
            <SpyneChip
              variant="outline"
              tone={isOnTarget ? "success" : "warning"}
              compact
              className="ml-3 shrink-0"
            >
              {isOnTarget ? "On target" : `${(value - 4).toFixed(1)}d over`}
            </SpyneChip>
          </div>

          {/* Benchmarks row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Current", val: `${value}d`, color: isOnTarget ? "text-spyne-success" : "text-spyne-text" },
              { label: "Target", val: "4d", color: "text-foreground" },
              { label: "Industry avg", val: "5–7d", color: "text-muted-foreground" },
            ].map((b) => (
              <div key={b.label} className="rounded-lg bg-muted/50 py-2 px-1">
                <p className={cn("text-lg font-bold tabular-nums", b.color)}>{b.val}</p>
                <p className="text-[11px] text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">Actions required</p>
              <div className="space-y-1.5">
                {actions.map((action) => {
                  const Icon = action.icon
                  const isCritical = action.severity === "critical"
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      onClick={onClose}
                      className={cn(
                        spyneComponentClasses.insightRow,
                        spyneComponentClasses.insightRowCompact,
                        "group"
                      )}
                    >
                      <span
                        className={cn(
                          spyneComponentClasses.insightRowIconWell,
                          spyneComponentClasses.insightRowIconWellCompact,
                          isCritical
                            ? spyneComponentClasses.insightRowIconWellCritical
                            : spyneComponentClasses.insightRowIconWellWarning
                        )}
                      >
                        <Icon className="shrink-0" />
                      </span>
                      <span className={cn("text-sm font-bold tabular-nums w-5 shrink-0", isCritical ? "text-spyne-error" : "text-spyne-text")}>
                        {action.count}
                      </span>
                      <span className="text-sm text-muted-foreground flex-1 truncate">{action.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Recharts donut: score out of 10 (full ring = 10). */
function WebsiteScoreDonutCharts({
  score,
  potentialScore,
  potentialBoost,
}: {
  score: number
  potentialScore: number
  potentialBoost: number
}) {
  const track = spyneConsoleTokens.border

  function pieSlices(value: number) {
    const v = Math.min(Math.max(value, 0), 10)
    const rest = 10 - v
    if (rest <= 0.001) {
      return [{ name: "a", value: 10 }]
    }
    return [
      { name: "a", value: v },
      { name: "b", value: rest },
    ]
  }

  function Donut({ value, mainColor, label }: { value: number; mainColor: string; label: string }) {
    const slices = pieSlices(value)
    const fills = slices.length === 1 ? [mainColor] : [mainColor, track]

    return (
      <div className="relative flex w-[92px] shrink-0 flex-col items-center sm:w-[100px]">
        <div className="h-[88px] w-full sm:h-[92px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                paddingAngle={0}
                label={false}
              >
                {slices.map((_, i) => (
                  <Cell key={i} fill={fills[i] ?? track} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-[40%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          aria-hidden
        >
          <span className="text-xl font-bold tabular-nums leading-none" style={{ color: mainColor }}>
            {value.toFixed(1)}
          </span>
        </div>
        <p className="-mt-0.5 text-center text-[10px] leading-tight text-muted-foreground">{label}</p>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-nowrap items-end justify-center gap-2 overflow-x-auto rounded-lg border border-spyne-border bg-gradient-to-b from-muted/40 to-spyne-surface px-2 py-4 sm:gap-3 sm:px-4">
      <Donut value={score} mainColor={spyneConsoleTokens.warning} label="Your Score" />
      <div className="flex shrink-0 flex-col items-center gap-1 px-0.5 pb-1">
        <span className="max-w-[5.5rem] text-center text-xs font-semibold leading-tight text-spyne-success">
          +{potentialBoost.toFixed(0)} Potential Boost
        </span>
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <div className="h-px w-6 bg-muted-foreground/30 sm:w-7" />
          <ArrowRight className="h-3 w-3 shrink-0" />
        </div>
      </div>
      <Donut value={potentialScore} mainColor={spyneConsoleTokens.success} label="Potential Score" />
    </div>
  )
}

function WebsiteScoreModal({
  open,
  onClose,
  score,
  vehicles,
  summary,
}: {
  open: boolean
  onClose: () => void
  score: number
  vehicles: MerchandisingVehicle[]
  summary: typeof mockMerchandisingSummary
}) {
  const photosPresent = parseFloat(((summary.realPhotos / summary.totalVehicles) * 10).toFixed(1))
  const heroUniformity = parseFloat((((summary.totalVehicles - vehicles.filter(v => v.wrongHeroAngle).length) / summary.totalVehicles) * 10).toFixed(1))
  const bgUniformity = 6.0

  const potentialBoost = 1.8
  const potentialScore = parseFloat(Math.min(10, score + potentialBoost).toFixed(1))

  const subScores = [
    { label: "Photos Present",        desc: "Very few vehicles have real images",              val: photosPresent },
    { label: "Hero Image Uniformity", desc: "Hero angles need to be correct",                  val: heroUniformity },
    { label: "Background Uniformity", desc: "Mixed backgrounds present across website",         val: bgUniformity },
  ]

  const suggestions = [
    "Standardize vehicle photo backgrounds by choosing one approach (either studio-style or outdoor) and reprocessing the outliers to match.",
    "Enforce a single hero image angle rule (for example: front-left 3/4 view) at upload or processing time.",
    "Reorder image sets so the standardized hero angle always appears first on every vehicle card.",
    "Reprocess existing listings that break background or hero-angle consistency to visually align the grid.",
  ]

  const actionItems = [
    { label: "No Photos",    count: vehicles.filter(v => v.mediaStatus === "no-photos").length,   href: "/max-2/studio/inventory?media=no-photos",  Icon: ImageOff },
    { label: "CGI Photos",   count: vehicles.filter(v => v.mediaStatus === "clone-photos").length, href: "/max-2/studio/inventory?media=cgi",          Icon: Images   },
    { label: "< 8 Photos",   count: vehicles.filter(v => v.photoCount > 0 && v.photoCount < 8).length, href: "/max-2/studio/inventory?photos=low",    Icon: Camera   },
    { label: "Wrong Angle",  count: vehicles.filter(v => v.wrongHeroAngle).length,                 href: "/max-2/studio/inventory?issue=hero",         Icon: AlertTriangle },
  ]

  const barColor = (val: number) =>
    val >= 7 ? spyneConsoleTokens.success : val >= 5 ? spyneConsoleTokens.warning : spyneConsoleTokens.error

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Improve your website score</DialogTitle>
          <DialogDescription className="sr-only">
            How the score is measured, your current and potential score, insights, suggestions, and links to fix
            listing issues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* ── Score donuts (Recharts) above methodology ── */}
          <WebsiteScoreDonutCharts
            score={score}
            potentialScore={potentialScore}
            potentialBoost={potentialBoost}
          />

          {/* ── How the score is measured (trimmed) ── */}
          <div className="rounded-lg border border-spyne-border bg-muted/20 p-4 text-left">
            <p className="mb-2 text-xs font-semibold text-foreground">How we measure website score</p>
            <p className="text-sm text-muted-foreground">
              A <span className="font-medium text-foreground">0 to 10</span> composite of how complete and consistent
              your inventory looks on your site.
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
              <li>Real photo coverage</li>
              <li>Hero angle consistency</li>
              <li>Background cohesion</li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Descriptions, publish state, and media depth can also move the headline number.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">6.5</span> is a peer average for quick comparison.
            </p>
          </div>

          {/* ── Insights ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Insights</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/20 tracking-wide">
                  ✦ AI POWERED
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">Last synced 12 hours ago ↻</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {subScores.map((item) => (
                <div key={item.label} className="rounded-lg border p-3.5 flex flex-col gap-2.5">
                  <div>
                    <p className="text-xs font-semibold leading-tight">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(item.val / 10) * 100}%`, backgroundColor: barColor(item.val) }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: barColor(item.val) }}>
                      {item.val}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Suggestions ── */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-semibold text-primary">Suggestions to boost score</p>
            </div>
            <ul className="space-y-2">
              {suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-snug">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {sug}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Actions Required ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-spyne-error shrink-0" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-spyne-error">Actions Required</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actionItems.map((item) => {
                const Icon = item.Icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-semibold text-spyne-error tabular-nums">{item.count}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── Website link ── */}
          <a
            href="https://www.dealership.com/inventory"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium text-primary">View live inventory page</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MerchandisingSummary() {
  const router = useRouter()
  const s = mockMerchandisingSummary
  const vehicles = mockMerchandisingVehicles

  const [frontlineModalOpen, setFrontlineModalOpen] = useState(false)
  const [websiteScoreModalOpen, setWebsiteScoreModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [opportunityListModal, setOpportunityListModal] = useState<null | { title: string; description: string; vehicles: MerchandisingVehicle[]; href: string }>(null)
  const [trainingModal, setTrainingModal] = useState<null | {
    title: string
    badInput: string
    improvement: string
    sections: TrainingGuideSection[]
  }>(null)
  const [proPlanModalOpen, setProPlanModalOpen] = useState(false)

  const needRealPhotos = vehicles.filter(
    (v) => v.mediaStatus !== "real-photos"
  ).length
  const aged30Plus = vehicles.filter((v) => v.daysInStock >= 30).length
  const missingDesc = vehicles.filter((v) => !v.hasDescription).length
  const notPublished = vehicles.filter(
    (v) => v.publishStatus !== "live"
  ).length
  const preliminaryPhotos = vehicles.filter(
    (v) => v.photoCount > 0 && v.photoCount < 8
  ).length

  const actions = [
    {
      count: needRealPhotos,
      label: "need real photos",
      severity: "critical" as const,
      icon: Camera,
      href: "/max-2/studio/inventory?media=needs-real",
    },
    {
      count: aged30Plus,
      label: "aged 30+ days - review pricing",
      severity: "critical" as const,
      icon: Tag,
      href: "/max-2/studio/inventory?age=30",
    },
    {
      count: notPublished,
      label: "not yet published",
      severity: "warning" as const,
      icon: Eye,
      href: "/max-2/studio/inventory?status=unpublished",
    },
    {
      count: missingDesc,
      label: "missing descriptions",
      severity: "warning" as const,
      icon: FileText,
      href: "/max-2/studio/inventory?desc=missing",
    },
    {
      count: preliminaryPhotos,
      label: "with < 8 photos - schedule shoot",
      severity: "warning" as const,
      icon: ImageOff,
      href: "/max-2/studio/inventory?photos=low",
    },
  ]
    .filter((a) => a.count > 0)
    .sort((a, b) => {
      if (a.severity === "critical" && b.severity !== "critical") return -1
      if (a.severity !== "critical" && b.severity === "critical") return 1
      return b.count - a.count
    })
    .slice(0, 4)

  const frontlineGoalDays = 4
  const goalDaysHighlight = (
    <span className="font-semibold text-primary">Goal {frontlineGoalDays}d</span>
  )
  const frontlineSub =
    needRealPhotos > 0 ? (
      <>
        {goalDaysHighlight}
        {" · "}
        {needRealPhotos} on stock photos may slow publish
        {s.avgDaysToFrontline > frontlineGoalDays ? (
          <> · {`${(s.avgDaysToFrontline - frontlineGoalDays).toFixed(1)}d over`}</>
        ) : null}
      </>
    ) : s.avgDaysToFrontline <= frontlineGoalDays ? (
      goalDaysHighlight
    ) : (
      <>
        {goalDaysHighlight}
        {" · "}
        {`${(s.avgDaysToFrontline - frontlineGoalDays).toFixed(1)}d over`}
      </>
    )

  const websiteScoreComparison =
    s.websiteScore >= 6.5
      ? `+${(s.websiteScore - 6.5).toFixed(1)} vs 6.5 avg`
      : `${(6.5 - s.websiteScore).toFixed(1)} below 6.5 avg`

  return (
    <div className="flex flex-col gap-7">
      {/* ── Section 1: ROI metrics (same strip as Lot / Sales overview) ── */}
      <SpyneRoiKpiStrip gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
        {/* Days to Frontline — custom cell with mini distribution chart */}
        {(() => {
          const dtfData = [
            { label: "≤ 3d", count: 9, color: spyneConsoleTokens.success },
            { label: "4–6d", count: 8, color: spyneConsoleTokens.warningInk },
            { label: "7+ d", count: 5, color: spyneConsoleTokens.error },
          ]
          const maxCount = Math.max(...dtfData.map((d) => d.count))
          const valueColor =
            s.avgDaysToFrontline <= 4
              ? "text-spyne-success"
              : s.avgDaysToFrontline <= 5
              ? "text-spyne-text"
              : "text-spyne-error"

          return (
            <div className="flex min-w-0 w-full items-stretch">
              {/* Left: metric */}
              <div className="flex flex-col justify-between px-5 py-4 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={spyneComponentClasses.roiKpiMetricLabel}>Days to Frontline</p>
                  <span className="text-muted-foreground/40 text-[11px]">|</span>
                  <TooltipPrimitive.Provider delayDuration={300}>
                    <TooltipPrimitive.Root>
                      <TooltipPrimitive.Trigger asChild>
                        <button type="button" className="text-[11px] font-medium text-spyne-primary hover:underline outline-none whitespace-nowrap">
                          See how it's calculated
                        </button>
                      </TooltipPrimitive.Trigger>
                      <TooltipPrimitive.Portal>
                        <TooltipPrimitive.Content
                          side="top"
                          sideOffset={8}
                          className={spyneComponentClasses.darkTooltipRadixContent}
                        >
                          <div className={spyneComponentClasses.darkTooltipPanel}>
                            <p className="mb-3 text-[13px] font-semibold text-[var(--spyne-on-dark-text)]">How it's calculated</p>
                            <div className="flex flex-col gap-2">
                              {[
                                { icon: "local_shipping", label: "Arrived on lot" },
                                { icon: "photo_camera",   label: "Photos added" },
                                { icon: "auto_awesome",   label: "AI processed" },
                                { icon: "check_circle",   label: "Published to frontline" },
                              ].map((step, i, arr) => (
                                <div key={step.label}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                                      <MaterialSymbol name={step.icon} size={13} className="text-[var(--spyne-on-dark-text)]" />
                                    </div>
                                    <span className={cn("text-[12px]", i === arr.length - 1 ? "font-semibold text-[var(--spyne-on-dark-text)]" : "text-[var(--spyne-on-dark-text-muted)]")}>
                                      {step.label}
                                    </span>
                                  </div>
                                  {i < arr.length - 1 && (
                                    <div className="ml-[11px] h-3 w-px bg-white/15" />
                                  )}
                                </div>
                              ))}
                            </div>
                            <p className="mt-3 text-[11px] text-[var(--spyne-on-dark-text-muted)]">Avg time from step 1 → 4 across all units</p>
                          </div>
                          <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                        </TooltipPrimitive.Content>
                      </TooltipPrimitive.Portal>
                    </TooltipPrimitive.Root>
                  </TooltipPrimitive.Provider>
                </div>
                <div>
                  <p className={cn(spyneComponentClasses.roiKpiMetricValue, valueColor)}>
                    {s.avgDaysToFrontline}d
                  </p>
                  <p className={spyneComponentClasses.roiKpiMetricSub}>{frontlineSub}</p>
                </div>
              </div>

              {/* Right: mini bar chart — same box, no separator */}
              <div className="flex flex-col justify-center gap-2 px-5 py-4 w-[160px] shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Distribution</p>
                {dtfData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 text-[10px] tabular-nums text-muted-foreground">{d.label}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-spyne-border">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(d.count / maxCount) * 100}%`, background: d.color }}
                      />
                    </div>
                    <span className="shrink-0 text-right text-[10px] font-semibold tabular-nums text-spyne-text whitespace-nowrap">{d.count} vehicles</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
        <SpyneRoiKpiMetricCell
          label={
            <span className="flex items-center gap-1.5">
              Website Score
              <TooltipPrimitive.Provider delayDuration={300}>
                <TooltipPrimitive.Root>
                  <TooltipPrimitive.Trigger asChild>
                    <button type="button" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors outline-none">
                      <MaterialSymbol name="info" size={14} />
                    </button>
                  </TooltipPrimitive.Trigger>
                  <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                      side="top"
                      sideOffset={8}
                      className={spyneComponentClasses.darkTooltipRadixContent}
                    >
                      <div className={spyneComponentClasses.darkTooltipPanel}>
                        <p className="mb-2 text-[13px] font-semibold text-[var(--spyne-on-dark-text)]">Website Score</p>
                        <div className="space-y-1.5 text-[12px] text-[var(--spyne-on-dark-text-muted)]">
                          <p>A 0–10 score measuring the quality of your live VDP listings.</p>
                          <p>Factors include: photos, description copy, pricing vs market, and publish status.</p>
                          <p className="text-[var(--spyne-on-dark-text)]">Industry avg: 6.5 · Target: ≥ 7.5</p>
                        </div>
                      </div>
                      <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
                    </TooltipPrimitive.Content>
                  </TooltipPrimitive.Portal>
                </TooltipPrimitive.Root>
              </TooltipPrimitive.Provider>
            </span>
          }
          value={`${s.websiteScore}/10`}
          sub={
            missingDesc > 0
              ? `~+0.5 pts · From the last week · ${websiteScoreComparison}`
              : websiteScoreComparison
          }
          status={s.websiteScore >= 7.5 ? "good" : s.websiteScore >= 5 ? "watch" : "bad"}
          valueClassName={
            s.websiteScore >= 7.5
              ? "text-spyne-success"
              : s.websiteScore >= 5
              ? "text-spyne-warning-ink"
              : "text-spyne-error"
          }
          labelAccessory={
            <button
              type="button"
              className="text-xs font-medium text-spyne-primary hover:underline sm:text-sm"
              aria-haspopup="dialog"
              onClick={() => setWebsiteScoreModalOpen(true)}
            >
              View more
            </button>
          }
        />
      </SpyneRoiKpiStrip>

      {/* ── Section 2: Action Items (tabbed) ── */}
      {(() => {
        const tabDefs: {
          key: string
          label: string
          icon: ReactNode
          filter: (v: (typeof vehicles)[0]) => boolean
          href: string
        }[] = [
          {
            key: "no-photos",
            label: "No Photos",
            icon: (
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="14" height="10" rx="1.5" />
                <line x1="1" y1="3" x2="15" y2="13" strokeLinecap="round" />
              </svg>
            ),
            filter: (v) => v.mediaStatus === "no-photos",
            href: "/max-2/studio/inventory?media=no-photos",
          },
          {
            key: "cgi",
            label: "CGI Photos",
            icon: <MaterialSymbol name="auto_awesome" size={24} />,
            filter: (v) => v.mediaStatus === "clone-photos",
            href: "/max-2/studio/inventory?media=cgi",
          },
          {
            key: "less8",
            label: "Less <8 Photos",
            icon: <MaterialSymbol name="photo_size_select_small" size={24} />,
            filter: (v) => v.photoCount > 0 && v.photoCount < 8,
            href: "/max-2/studio/inventory?photos=low",
          },
          {
            key: "hero",
            label: "Wrong Hero Angle",
            icon: <MaterialSymbol name="crop_rotate" size={24} />,
            filter: (v) => v.wrongHeroAngle,
            href: "/max-2/studio/inventory?issue=hero",
          },
          {
            key: "no360",
            label: "No 360 Spin",
            icon: <MaterialSymbol name="3d_rotation" size={24} />,
            filter: (v) => !v.has360,
            href: "/max-2/studio/inventory?issue=no360",
          },
          {
            key: "incomplete",
            label: "Incomplete PhotoSet",
            icon: <MaterialSymbol name="burst_mode" size={24} />,
            filter: (v) => v.incompletePhotoSet,
            href: "/max-2/studio/inventory?issue=incomplete",
          },
        ]

        const tab = tabDefs[activeTab]
        const matched = vehicles.filter(tab.filter)
        const shown = matched.slice(0, 5)
        const hasMore = matched.length > 5

        return (
          <div
            className={cn(
              max2Classes.overviewPanelShell,
              "mt-0 grid grid-cols-1 gap-x-0 gap-y-0",
            )}
          >
            <div className={max2Classes.overviewPanelHeader}>
              <p className={spyneComponentClasses.cardTitle}>Action Items</p>
              <p className={max2Classes.overviewPanelDescription}>
                Vehicles grouped by media issue. Click a tab to review and fix.
              </p>
            </div>
            <Max2ActionTabStrip className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 !pt-0 !px-5 !pb-2">
              {tabDefs.map((t, i) => {
                const count = vehicles.filter(t.filter).length
                return (
                  <Max2ActionTab
                    key={t.key}
                    icon={t.icon}
                    title={t.label}
                    count={count}
                    selected={activeTab === i}
                    onClick={() => setActiveTab(i)}
                  />
                )
              })}
            </Max2ActionTabStrip>

            <div
              className={cn(
                "min-w-0",
                !hasMore && "border-t border-spyne-border",
              )}
            >
              {hasMore && (
                <div
                  className={cn(
                    max2Classes.overviewPanelFooterRow,
                    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
                  )}
                >
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Showing 5 of {matched.length} vehicles
                  </p>
                  <Link
                    href={tab.href}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:ml-auto"
                  >
                    View more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
              <VehicleMediaTable vehicles={shown} showCheckboxes={false} embedded />
            </div>
          </div>
        )
      })()}

      {/* ── Section 3: Insights & Opportunities ── */}
      {(() => {
        const sunGlareVehicles = vehicles.filter((v) => v.hasSunGlare)
        const walkaroundVehicles = vehicles.filter((v) => v.missingWalkaroundVideo)
        const lowPhotoVehicles = vehicles.filter((v) => v.photoCount >= 1 && v.photoCount < 25)
        const under8Vehicles = vehicles.filter((v) => v.photoCount > 0 && v.photoCount < 8)
        const notPublishedVehicles = vehicles.filter((v) => v.publishStatus !== "live")

        /** Demo rollup: total units flagged this period; remaining rows still show glare in inventory. */
        const demoSunGlareTotalFlagged = 12
        const sunGlareRemaining = sunGlareVehicles.length
        const sunGlareAutoFixed = Math.max(0, demoSunGlareTotalFlagged - sunGlareRemaining)
        const sunGlareAffected = sunGlareRemaining + sunGlareAutoFixed

        const insights = [
          {
            id: "sun-glare",
            cardTitle: "Sun glare in photos",
            iconTone: "warning" as const,
            icon: Sun,
            metricLine: `Studio AI automatically corrected all ${sunGlareAutoFixed} affected listings.`,
            inventoryHref: "/max-2/studio/inventory?issue=glare",
            badInput: "Shooting into direct sun left blown highlights on glass and paint; detail was lost in post.",
            improvement: `All ${sunGlareAffected} vehicles publish-ready. Studio AI saved your team ~2 hrs of manual retouching.`,
            metrics: [
              { label: "publish-ready", value: `${sunGlareAutoFixed}` },
              { label: "time saved", value: "~2 hrs" },
            ],
            severity: "warning" as const,
            sections: [
              {
                heading: "Shoot position",
                bullets: [
                  "Keep the sun behind you or at 45° — never straight into the lens for hero shots.",
                  "If the lot forces backlight, bracket exposure or use a polarizer on exterior glass.",
                ],
              },
              {
                heading: "Time of day",
                bullets: [
                  "Schedule north-facing rows in early morning; south-facing rows after 3pm when possible.",
                  "Avoid noon for dark paint — hotspots are hardest to recover then.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "walkaround-360",
            cardTitle: "Missing 360° Videos",
            iconTone: "warning" as const,
            icon: Video,
            metricLine: `Studio AI is generating 360° walk-arounds for ${walkaroundVehicles.length} vehicles right now.`,
            inventoryHref: "/max-2/studio/inventory?issue=no360",
            badInput: "Clips were too short, shaky, or skipped the full vehicle perimeter, so the 360 pipeline could not align frames.",
            improvement: `Videos auto-publish when done, ~1 day out. No action needed from your team.`,
            metrics: [
              { label: "queued", value: `${walkaroundVehicles.length}` },
              { label: "ETA", value: "~1 day" },
              { label: "dealer action", value: "not needed" },
            ],
            severity: "warning" as const,
            sections: [
              {
                heading: "Capture path",
                bullets: [
                  "Walk a full 360° at consistent distance (one car length) and steady height.",
                  "Start and end at the same point so the seam blends in processing.",
                ],
              },
              {
                heading: "Camera settings",
                bullets: [
                  "Lock exposure for the whole lap — no auto ISO ramping mid-walk.",
                  "Hold 1080p or higher; avoid digital zoom while moving.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "photo-count-industry",
            cardTitle: "Below Photo Standard",
            iconTone: "success" as const,
            icon: Images,
            metricLine: `Studio AI recovered ${Math.round(lowPhotoVehicles.length * 0.75)} of ${lowPhotoVehicles.length} vehicles.`,
            inventoryHref: "/max-2/studio/inventory?issue=incomplete",
            badInput: "Sets stopped after basics (front, rear, dash) without full exterior walk, interior detail, and feature shots.",
            improvement: `${lowPhotoVehicles.length - Math.round(lowPhotoVehicles.length * 0.75)} vehicles still need a reshoot. Studio AI can't fill angles never captured.`,
            metrics: [
              { label: "publish-ready", value: `${Math.round(lowPhotoVehicles.length * 0.75)}` },
              { label: "still need more photos", value: `${lowPhotoVehicles.length - Math.round(lowPhotoVehicles.length * 0.75)}` },
            ],
            severity: "warning" as const,
            sections: [
              {
                heading: "Minimum set",
                bullets: [
                  "Exterior: 3/4 front, 3/4 rear, straight sides, wheels, bed/trunk if applicable.",
                  "Interior: dash, seats, rear seat, cargo, infotainment, odometer, VIN plate.",
                ],
              },
              {
                heading: "Dealer standards",
                bullets: [
                  "Duplicate angles only if trim-specific (e.g. sunroof open/closed).",
                  "Upload full resolution — no aggressive in-camera crop.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
          {
            id: "under-8-exterior",
            cardTitle: "Missing Exterior Photos",
            iconTone: "critical" as const,
            icon: AlertTriangle,
            metricLine: `${under8Vehicles.length - Math.round(under8Vehicles.length * 0.6)} vehicles have exterior gaps Studio AI can’t fill.`,
            inventoryHref: "/max-2/studio/inventory?issue=under8",
            badInput: "Exteriors were rushed or partial, leaving gaps in the buyer’s visual walk-around.",
            improvement: `Too incomplete for AI recovery. Schedule a reshoot today. Each day offline costs ~$38/unit.`,
            metrics: [
              { label: "enhanced by AI", value: `${Math.round(under8Vehicles.length * 0.6)}` },
              { label: "need reshoot", value: `${under8Vehicles.length - Math.round(under8Vehicles.length * 0.6)}` },
              { label: "time saved", value: "~3 hrs" },
            ],
            severity: "critical" as const,
            sections: [
              {
                heading: "Exterior pass",
                bullets: [
                  "Count to 8 before leaving the vehicle: four corners + straight profile both sides minimum.",
                  "Include one tight front badge and one clean rear with plate frame visible.",
                ],
              },
              {
                heading: "QC before upload",
                bullets: [
                  "Scroll the filmstrip in Spyne — if any angle is blurry, re-take before sync.",
                  "Confirm first image is the approved hero angle for the store.",
                ],
              },
            ] satisfies TrainingGuideSection[],
          },
        ]

        const smartCampaignVehicles = vehicles.filter(
          (v) => v.listingScore < 70 || v.daysInStock >= 21
        )

        const opportunities = [
          {
            id: "go-live" as const,
            icon: Zap,
            title: "Go live instantly",
            desc: "Auto-publish the moment Studio AI finishes — no manual gate.",
            benefit: "Faster time-to-live",
            rank: 1 as const,
            proIncludes: [] as string[],
            count: notPublishedVehicles.length,
            countLabel: "not yet live",
            modalVehicles: notPublishedVehicles,
            href: "/max-2/studio/inventory?publishStatus=not-published",
            gradient: "from-spyne-warning to-spyne-warning",
            accent: "ring-spyne-warning/40",
          },
          {
            id: "smart-campaign" as const,
            icon: Megaphone,
            title: "Run smart campaigns",
            desc: "Auto-boost weak VDPs with targeted creative and budget rules.",
            benefit: "Lift leads on aged and weak listings",
            rank: 2 as const,
            proIncludes: [] as string[],
            count: smartCampaignVehicles.length,
            countLabel: "eligible units",
            modalVehicles: smartCampaignVehicles,
            href: "/max-2/studio/inventory?ageMin=21",
            gradient: "from-spyne-success to-spyne-success",
            accent: "ring-spyne-success/30",
          },
          {
            id: "pro-plan" as const,
            icon: Crown,
            title: "Pro Plan",
            desc: "Full-stack media, priority QA, and automation so every VDP ships complete.",
            benefit: "Best for high volume stores",
            rank: 3 as const,
            proIncludes: [
              "Unlimited AI background & window mask",
              "Priority processing queue & same-day fixes",
              "360° + video add-ons bundled",
              "Dedicated success manager + monthly shoot audits",
            ],
            count: undefined as number | undefined,
            countLabel: undefined as string | undefined,
            modalVehicles: [] as MerchandisingVehicle[],
            href: "/max-2/studio",
            gradient: "from-spyne-primary via-spyne-primary to-spyne-primary",
            accent: "ring-spyne-primary/25",
          },
        ]

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Insights */}
            <Card className="gap-0 pt-px pb-5 shadow-none">
              <CardHeader className="px-5 pb-4 pt-5">
                <CardTitle>Insights</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Studio AI recovered merchandising quality from incomplete media input.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((item) => (
                  <InsightRow key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="gap-0 pt-px pb-0 shadow-none overflow-hidden">
              <CardHeader className="px-5 pb-4 pt-5">
                <CardTitle>Opportunities</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Here's how Spyne can resolve the issues above automatically.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {/* Action rows — divider-separated, no border boxes */}
                <div className="divide-y divide-spyne-border/60">
                  {opportunities.filter((o) => o.id !== "pro-plan").map((opp) => {
                    const Icon = opp.icon
                    return (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => router.push(opp.href)}
                        className="group flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-white bg-gradient-to-br",
                            opp.gradient,
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-spyne-text leading-tight">{opp.title}</p>
                          <p className="mt-1 text-[12px] leading-snug text-spyne-text-secondary line-clamp-2">{opp.desc}</p>
                        </div>
                        {opp.count != null && (
                          <div className="shrink-0 text-right mt-0.5">
                            <p className="text-xl font-bold tabular-nums leading-none text-spyne-primary">{opp.count}</p>
                            <p className="mt-0.5 text-[10px] text-spyne-primary/60 whitespace-nowrap">{opp.countLabel}</p>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                      </button>
                    )
                  })}
                </div>

                {/* Pro Plan — dark gradient featured block */}
                {(() => {
                  const pro = opportunities.find((o) => o.id === "pro-plan")
                  if (!pro) return null
                  const ProIcon = pro.icon
                  return (
                    <div className="px-5 pt-4 pb-5">
                      <button
                        type="button"
                        onClick={() => setProPlanModalOpen(true)}
                        className="group w-full rounded-2xl text-left overflow-hidden transition-opacity hover:opacity-95"
                        style={{ background: "linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%)" }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-white" style={{ background: "var(--spyne-primary)" }}>
                                <ProIcon className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-bold text-spyne-text">{pro.title}</span>
                            </div>
                            <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4600f2 50%, #2563eb 100%)" }}>
                              Recommended
                            </span>
                          </div>
                          <p className="text-[12px] leading-relaxed text-spyne-text-secondary mb-4">{pro.desc}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
                            {pro.proIncludes.slice(0, 4).map((line) => (
                              <div key={line} className="flex items-start gap-1.5">
                                <MaterialSymbol name="check" size={13} className="text-spyne-primary shrink-0 mt-[1px]" />
                                <span className="text-[11px] leading-snug text-spyne-text-secondary">{line}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-spyne-primary group-hover:text-spyne-primary/80 transition-colors">
                            See what Pro includes
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {opportunityListModal && (
        <VehicleListModal
          open={!!opportunityListModal}
          onClose={() => setOpportunityListModal(null)}
          title={opportunityListModal.title}
          description={opportunityListModal.description}
          vehicles={opportunityListModal.vehicles}
          inventoryHref={opportunityListModal.href}
        />
      )}

      {trainingModal && (
        <PhotographerTrainingModal
          open={!!trainingModal}
          onClose={() => setTrainingModal(null)}
          title={trainingModal.title}
          badInput={trainingModal.badInput}
          improvement={trainingModal.improvement}
          sections={trainingModal.sections}
        />
      )}

      <Dialog open={proPlanModalOpen} onOpenChange={setProPlanModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4 text-primary" />
              Pro Plan — what you get
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-snug">
            Pro bundles everything your lot needs to keep VDPs complete, on-brand, and fast — without tying up your team on manual fixes.
          </p>
          <ul className="mt-3 space-y-2.5 text-sm">
            {[
              "Unlimited AI background replacement and window masking",
              "Priority processing queue with same-day turnaround on flagged units",
              "360° exterior spin and vehicle video included in the bundle",
              "Dedicated success manager plus monthly photographer and QA audits",
              "API-ready workflows for DMS and website partners",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="h-4 w-4 text-spyne-success shrink-0 mt-0.5" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/max-2/studio"
            onClick={() => setProPlanModalOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-2"
          >
            Talk to sales about Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <DaysToFrontlineModal
        open={frontlineModalOpen}
        onClose={() => setFrontlineModalOpen(false)}
        value={s.avgDaysToFrontline}
        actions={actions}
      />
      <WebsiteScoreModal
        open={websiteScoreModalOpen}
        onClose={() => setWebsiteScoreModalOpen(false)}
        score={s.websiteScore}
        vehicles={vehicles}
        summary={s}
      />
    </div>
  )
}
