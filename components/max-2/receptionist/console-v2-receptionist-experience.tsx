"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import "@/styles/console-v2-sales.css"
import SecondaryNav from "@/components/max-2/sales/console-v2/components/SecondaryNav"
import MetricsBar from "@/components/max-2/sales/console-v2/components/MetricsBar"
import { ServiceTopIntentsTable, type ServiceTopIntentRow } from "@/components/max-2/service/service-top-intents-table"
import { dateRangeOptions, dealerData } from "@/components/max-2/sales/console-v2/mockData"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes, spyneComponentClasses, spyneSalesLayout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import {
  getReceptionistOverviewData,
  receptionistAgentData,
  receptionistFollowUps,
  receptionistCalls,
  type ReceptionistFollowUpItem,
} from "./receptionist-data"
import { ReceptionistAgentCard } from "./receptionist-agent-card"
import { ReceptionistRoutingPanel } from "./receptionist-routing-panel"
import { ReceptionistActionItems } from "./receptionist-action-items"
import { ReceptionistCallsTable } from "./receptionist-calls-table"
import { ReceptionistDataHealth } from "./receptionist-data-health"
import { ReceptionistKnowledge } from "./receptionist-knowledge"

export function ConsoleV2ReceptionistExperience() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab") ?? "overview"
  const [activePage, setActivePage] = useState<string>(tabParam)

  useEffect(() => {
    setActivePage(searchParams.get("tab") ?? "overview")
  }, [searchParams])

  function handlePageChange(page: string) {
    setActivePage(page)
    router.push(page === "overview" ? "/max-2/receptionist" : `/max-2/receptionist?tab=${page}`, { scroll: false })
  }

  return (
    <div className="console-v2-sales-root relative min-h-[calc(100dvh-4rem)] w-full min-w-0 bg-spyne-page">
      <SecondaryNav activePage={activePage} embedded onPageChange={handlePageChange} department="receptionist" />
      <main className="min-w-0 transition-all duration-200">
        <div className={max2Classes.moduleSecondaryNavPageBody}>
          {activePage === "overview"       && <ReceptionistOverviewPage />}
          {activePage === "data-health"    && <ReceptionistDataHealth />}
          {activePage === "calls"          && <ReceptionistCallsTable calls={receptionistCalls} />}
          {activePage === "action-items"   && <ReceptionistActionItems items={receptionistFollowUps} />}
          {activePage === "knowledge"      && <ReceptionistKnowledge />}
        </div>
      </main>
    </div>
  )
}

// ============= OVERVIEW PAGE =============
function ReceptionistOverviewPage() {
  const [dateRange, setDateRange] = useState("Last 30 days")
  const overview = getReceptionistOverviewData(dateRange)

  // Map receptionist rows to ServiceTopIntentRow shape (routed → resolved)
  const intentRows: ServiceTopIntentRow[] = overview.topIntents.map((r) => ({
    intent: r.intent,
    calls: r.calls,
    resolved: r.routed,
    appts: r.appts,
    ratePct: r.ratePct,
    tone: (r.tone === "danger" ? "warning" : r.tone) as ServiceTopIntentRow["tone"],
  }))

  return (
    <div className={spyneSalesLayout.pageStack}>
      <div
        className={cn(
          "sticky z-[30] -mx-max2-page bg-spyne-page px-max2-page pt-4 pb-3",
          "top-[6rem] lg:top-10",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className={max2Classes.pageTitle}>Hello {dealerData.userName}, Welcome back</h1>
            <p className={max2Classes.pageDescription}>Receptionist overview · {dateRange}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ReceptionistAgentChip />
            <DateRangeSelect value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      <MetricsBar metrics={overview.metricsBar} />

      <div className={cn("grid grid-cols-1 xl:grid-cols-[1.6fr_1fr]", spyneSalesLayout.sectionGap)}>
        <ServiceTopIntentsTable rows={intentRows} />
        <ReceptionistRoutingPanel
          rateLabel={overview.routingDistribution.rateLabel}
          rateCaption={overview.routingDistribution.rateCaption}
          deltaLabel={overview.routingDistribution.deltaLabel}
          segments={overview.routingDistribution.segments}
        />
      </div>

      <div className={cn(spyneSalesLayout.overviewAgentRow, spyneSalesLayout.sectionGap)}>
        <ReceptionistAgentCard agent={receptionistAgentData} />
        <PriorityFollowUpsCard items={receptionistFollowUps.filter((f) => f.priority === "Urgent" || f.priority === "High")} />
        <RecentCallsCard calls={receptionistCalls.slice(0, 5)} />
      </div>
    </div>
  )
}

function ReceptionistAgentChip() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-spyne-brand-subtle pl-1 pr-3 py-1">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white"
        style={{ background: "linear-gradient(135deg, var(--spyne-brand), color-mix(in srgb, var(--spyne-brand) 70%, black))" }}
      >
        R
      </div>
      <span className="text-[13px] font-semibold text-spyne-brand">Riley · Inbound</span>
    </div>
  )
}

function DateRangeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const options = (dateRangeOptions as string[]).filter((o) => o !== "Custom range")

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-spyne-border bg-spyne-surface px-3 py-2 text-[13px] font-semibold text-spyne-text-primary hover:bg-spyne-surface-hover"
      >
        {value}
        <MaterialSymbol name="expand_more" size={14} className="text-spyne-text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 min-w-[160px] rounded-lg border border-spyne-border bg-spyne-surface py-1.5 shadow-lg">
          {options.map((o: string) => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false) }}
              className={cn(
                "w-full px-3.5 py-2 text-left text-[13px] hover:bg-spyne-surface-hover",
                value === o && "bg-spyne-brand-subtle font-semibold text-spyne-brand"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PriorityFollowUpsCard({ items }: { items: ReceptionistFollowUpItem[] }) {
  return (
    <div className="spyne-card flex flex-col p-4">
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-1.5">
          <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Priority Follow-ups</h3>
        </div>
        <span
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
          style={{ background: "var(--spyne-success)" }}
        >
          {items.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-start gap-2.5 pb-3 last:pb-0 border-b border-spyne-border last:border-b-0">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "var(--spyne-brand)" }}
            >
              {(item.callerName ?? item.callerPhone).slice(-2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-spyne-text-primary">{item.callerName ?? item.callerPhone}</div>
              <div className="text-[11px] text-spyne-text-muted line-clamp-1 mt-0.5">{item.task}</div>
            </div>
            <span
              className={cn(
                "shrink-0 rounded px-2 py-0.5 text-[10px] font-bold",
                item.priority === "Urgent" ? "bg-spyne-error-subtle text-spyne-error" : "bg-spyne-warning-subtle text-[var(--spyne-warning-ink)]"
              )}
            >
              {item.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentCallsCard({ calls }: { calls: typeof receptionistCalls }) {
  return (
    <div className="spyne-card flex flex-col p-4">
      <h3 className={cn(spyneComponentClasses.cardTitle, "m-0 mb-3")}>Recent Calls</h3>
      <div className="flex flex-col gap-3">
        {calls.map((c) => {
          const m = c.startedAt.match(/T(\d{2}):(\d{2})/)
          const time = m ? `${(+m[1] % 12) || 12}:${m[2]} ${(+m[1]) >= 12 ? "PM" : "AM"}` : ""
          return (
            <div key={c.id} className="flex items-start gap-3 text-[13px]">
              <span className="w-14 shrink-0 tabular-nums text-[11px] font-medium text-spyne-text-muted">{time}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-spyne-text-primary truncate">{c.customerName ?? c.callerPhone}</div>
                <div className="text-[11px] text-spyne-text-muted line-clamp-1 mt-0.5">
                  {c.intentTitle} · {c.transferTarget === "—" ? "Answered directly" : `→ ${c.transferTarget}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
