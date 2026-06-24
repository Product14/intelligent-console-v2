"use client"

import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes, spyneComponentClasses, spyneSalesLayout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

type Severity = "err" | "warn" | "ok"

interface Issue {
  id: string
  severity: Severity
  title: string
  detail: string
  action: { label: string; href: string }
}

const ACTIVE_ISSUES: Issue[] = [
  {
    id: "i1",
    severity: "err",
    title: "Parts dept extension unreachable",
    detail: "Ext. 204 has failed on 5 of the last 7 transfer attempts. Calls are rolling to voicemail.",
    action: { label: "Open Routing Config", href: "/max-2/receptionist?tab=routing-config" },
  },
  {
    id: "i2",
    severity: "warn",
    title: "Parts department has no backup target",
    detail: "If the only target fails, calls have nowhere else to go. Add a fallback.",
    action: { label: "Add fallback in Routing Config", href: "/max-2/receptionist?tab=routing-config" },
  },
]

const RECENT_EVENTS = [
  { id: "r1", severity: "ok"   as Severity, title: "Configuration updated",            detail: "Lakshya reordered Sales fallback chain", when: "Today · 2:14 PM" },
  { id: "r2", severity: "ok"   as Severity, title: "Holiday added",                    detail: "Christmas Eve · early closure 2pm",      when: "Yesterday" },
  { id: "r3", severity: "warn" as Severity, title: "Parts ext. 204 unreachable",      detail: "Issue auto-detected · still open",       when: "4 hours ago" },
  { id: "r4", severity: "ok"   as Severity, title: "Recording retention purge ran",   detail: "Recordings older than 90 days removed", when: "Today · 3:00 AM" },
]

export function ReceptionistDataHealth() {
  const errCount  = ACTIVE_ISSUES.filter((i) => i.severity === "err").length
  const warnCount = ACTIVE_ISSUES.filter((i) => i.severity === "warn").length

  return (
    <div className={spyneSalesLayout.pageStack}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Data Health</h1>
          <p className={max2Classes.pageDescription}>
            Is Riley working right? What needs your attention? Where to go to fix it.
          </p>
        </div>
      </div>

      {/* Status strip — the single most important strip */}
      <div className="spyne-card p-5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-spyne-success-subtle text-spyne-success flex items-center justify-center">
                <MaterialSymbol name="check_circle" size={22} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-spyne-success border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="text-[16px] font-bold">Riley is live and answering calls</div>
              <div className="text-[12px] text-spyne-text-muted">Last call: 12 minutes ago · Live since June 1, 2026</div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="grid grid-cols-3 gap-5 text-right">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Uptime</div>
              <div className="text-[20px] font-bold tabular-nums text-spyne-success mt-0.5">99.7%</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Calls today</div>
              <div className="text-[20px] font-bold tabular-nums mt-0.5">142</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Issues</div>
              <div className={cn(
                "text-[20px] font-bold tabular-nums mt-0.5",
                errCount > 0  ? "text-spyne-error" :
                warnCount > 0 ? "text-[var(--spyne-warning-ink)]" :
                                "text-spyne-success"
              )}>
                {ACTIVE_ISSUES.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active issues — what needs your attention */}
      <div className="spyne-card overflow-hidden">
        <div className="px-5 py-3 border-b border-spyne-border flex items-center justify-between">
          <div>
            <h3 className={cn(spyneComponentClasses.cardTitle, "m-0 flex items-center gap-2")}>
              {errCount > 0 && <MaterialSymbol name="priority_high" size={16} className="text-spyne-error" />}
              {errCount === 0 && warnCount > 0 && <MaterialSymbol name="warning" size={16} className="text-[var(--spyne-warning-ink)]" />}
              {errCount === 0 && warnCount === 0 && <MaterialSymbol name="check_circle" size={16} className="text-spyne-success" />}
              What needs your attention
            </h3>
            <p className="text-[12px] text-spyne-text-muted mt-0.5">Things Riley flagged that you (or your CSM) need to fix.</p>
          </div>
          <span className="text-[12px] font-semibold text-spyne-text-muted">{ACTIVE_ISSUES.length} active</span>
        </div>
        {ACTIVE_ISSUES.length === 0 ? (
          <div className="py-12 text-center">
            <MaterialSymbol name="check_circle" size={32} className="text-spyne-success mb-2" />
            <div className="text-[14px] font-semibold">All clear.</div>
            <div className="text-[12px] text-spyne-text-muted mt-1">No issues flagged on your config.</div>
          </div>
        ) : ACTIVE_ISSUES.map((i) => (
          <div key={i.id} className="px-5 py-4 border-b border-spyne-border last:border-b-0 flex items-start gap-3">
            <StatusDot status={i.severity} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold mb-0.5">{i.title}</div>
              <p className="text-[13px] text-spyne-text-muted">{i.detail}</p>
            </div>
            <a href={i.action.href} className={cn(spyneComponentClasses.btnSecondaryMd, "shrink-0 flex items-center gap-1.5")}>
              {i.action.label} <MaterialSymbol name="arrow_forward" size={12} />
            </a>
          </div>
        ))}
      </div>

      {/* Routing target health — simple yes/no per target */}
      <div className="spyne-card overflow-hidden">
        <div className="px-5 py-3 border-b border-spyne-border">
          <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Routing target health</h3>
          <p className="text-[12px] text-spyne-text-muted mt-0.5">Whether each destination Riley routes to is currently reachable.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-spyne-border">
          <TargetRow name="Sales Inbound AI (Emily)" status="ok"   detail="24/7 · responsive" />
          <TargetRow name="Service Inbound AI (Eric)" status="ok"   detail="24/7 · responsive" />
          <TargetRow name="Sales dept · Ext. 100"     status="ok"   detail="Reachable during hours" />
          <TargetRow name="Service dept · Ext. 200"    status="ok"   detail="Reachable during hours" />
          <TargetRow name="Parts dept · Ext. 204"      status="err"  detail="5 of last 7 attempts failed" />
          <TargetRow name="Finance dept · Ext. 312"   status="ok"   detail="Reachable during hours" />
          <TargetRow name="Sales voicemail"             status="ok"   detail="Always reachable" />
          <TargetRow name="Service voicemail"           status="ok"   detail="Always reachable" />
        </div>
      </div>

      {/* Recording & compliance moved out — surfaces in Issues / Events only if broken */}

      {/* Recent events — operational log, simple */}
      <div className="spyne-card overflow-hidden">
        <div className="px-5 py-3 border-b border-spyne-border">
          <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Recent events</h3>
          <p className="text-[12px] text-spyne-text-muted mt-0.5">Operational changes and resolved issues, last 7 days.</p>
        </div>
        {RECENT_EVENTS.map((e) => (
          <div key={e.id} className="px-5 py-3 border-b border-spyne-border last:border-b-0 flex items-start gap-3">
            <StatusDot status={e.severity} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold">{e.title}</div>
              <div className="text-[12px] text-spyne-text-muted">{e.detail}</div>
            </div>
            <div className="text-[11px] text-spyne-text-subtle shrink-0">{e.when}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TargetRow({ name, status, detail }: { name: string; status: Severity; detail: string }) {
  return (
    <div className="px-5 py-3 flex items-center gap-3">
      <StatusDot status={status} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold">{name}</div>
        <div className="text-[11px] text-spyne-text-muted">{detail}</div>
      </div>
      {status === "err" && (
        <a href="/max-2/receptionist?tab=routing-config" className="text-[11px] font-semibold text-spyne-brand hover:opacity-80">
          Fix →
        </a>
      )}
    </div>
  )
}

function StatusDot({ status }: { status: Severity }) {
  const bg = status === "err" ? "var(--spyne-error)" : status === "warn" ? "var(--spyne-warning)" : "var(--spyne-success)"
  const icon = status === "err" ? "close" : status === "warn" ? "priority_high" : "check"
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: bg }}>
      <MaterialSymbol name={icon} size={12} className="text-white" />
    </span>
  )
}
