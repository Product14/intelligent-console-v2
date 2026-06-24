"use client"

import { useState, useMemo } from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { SpyneFilterSelectChevron, SpyneFilterSelectWrap } from "@/components/max-2/spyne-toolbar-controls"
import { max2Classes, spyneComponentClasses, spyneSalesLayout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { dateRangeOptions } from "@/components/max-2/sales/console-v2/mockData"
import type { ReceptionistFollowUpItem, ReceptionistFollowUpType } from "./receptionist-data"

const typeMeta: Record<ReceptionistFollowUpType, { label: string; tone: "warning" | "info" | "brand" | "error" | "neutral"; icon: string }> = {
  after_hours_message: { label: "After-hours msg", tone: "warning", icon: "bedtime"           },
  failed_transfer:     { label: "Failed transfer", tone: "info",    icon: "call_missed"       },
  voicemail:           { label: "Voicemail",       tone: "info",    icon: "voicemail"          },
  callback_scheduled:  { label: "Callback",        tone: "brand",   icon: "schedule"           },
  manager_escalation:  { label: "Escalation",      tone: "error",   icon: "report"             },
  config_gap:          { label: "Config gap",      tone: "neutral", icon: "build_circle"      },
}

const stageMeta: Record<ReceptionistFollowUpType, string> = {
  after_hours_message: "Voicemail captured",
  failed_transfer:     "Callback needed",
  voicemail:           "Voicemail captured",
  callback_scheduled:  "Scheduled",
  manager_escalation:  "Manager queue",
  config_gap:          "Admin review",
}

type Status = "open" | "completed" | "dismissed"

export function ReceptionistActionItems({ items: initial }: { items: ReceptionistFollowUpItem[] }) {
  const [items, setItems] = useState(initial.map((i) => ({ ...i })))
  const [tab, setTab] = useState<"to_act_on" | "done" | "archived">("to_act_on")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>("Last 30 days")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const selected = items.find((i) => i.id === selectedId)

  const filtered = useMemo(() => {
    let list = items.filter((i) =>
      tab === "to_act_on" ? i.status === "open" :
      tab === "done" ? i.status === "completed" :
      i.status === "dismissed"
    )
    if (typeFilter !== "all") list = list.filter((i) => i.type === typeFilter)
    if (priorityFilter !== "all") list = list.filter((i) => i.priority === priorityFilter)
    return [...list].sort((a, b) => {
      const order = { Urgent: 0, High: 1, Normal: 2 }
      return order[a.priority] - order[b.priority]
    })
  }, [items, tab, typeFilter, priorityFilter])

  const filtersActive = typeFilter !== "all" || priorityFilter !== "all" || period !== "Last 30 days"
  const clearFilters = () => { setPeriod("Last 30 days"); setTypeFilter("all"); setPriorityFilter("all") }

  const counts = {
    open: items.filter((i) => i.status === "open").length,
    done: items.filter((i) => i.status === "completed").length,
    archived: items.filter((i) => i.status === "dismissed").length,
  }

  const markDone = (id: string) => setItems((curr) => curr.map((i) => i.id === id ? { ...i, status: "completed" as Status } : i))
  const dismiss = (id: string) => setItems((curr) => curr.map((i) => i.id === id ? { ...i, status: "dismissed" as Status } : i))

  return (
    <div className={spyneSalesLayout.pageStack}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Action Items</h1>
          <p className={max2Classes.pageDescription}>Voicemails, failed transfers, escalations, and config gaps surfaced by Riley.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <SpyneFilterSelectWrap>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={cn(spyneComponentClasses.filterSelect, "min-w-[8.5rem] cursor-pointer")}
              aria-label="Date range"
            >
              {(dateRangeOptions as string[]).filter((o) => o !== "Custom range").map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <SpyneFilterSelectChevron />
          </SpyneFilterSelectWrap>
          <SpyneFilterSelectWrap>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={cn(spyneComponentClasses.filterSelect, "min-w-[9rem] cursor-pointer")}
              aria-label="Type"
            >
              <option value="all">All types</option>
              {(Object.keys(typeMeta) as ReceptionistFollowUpType[]).map((k) => (
                <option key={k} value={k}>{typeMeta[k].label}</option>
              ))}
            </select>
            <SpyneFilterSelectChevron />
          </SpyneFilterSelectWrap>
          <SpyneFilterSelectWrap>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={cn(spyneComponentClasses.filterSelect, "min-w-[8rem] cursor-pointer")}
              aria-label="Priority"
            >
              <option value="all">All priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>
            <SpyneFilterSelectChevron />
          </SpyneFilterSelectWrap>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="text-[12px] font-semibold text-spyne-brand hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <SpyneLineTabStrip>
        <SpyneLineTab active={tab === "to_act_on"} onClick={() => setTab("to_act_on")}>
          To Act On <SpyneLineTabBadge>{counts.open}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "done"} onClick={() => setTab("done")}>
          Done Today <SpyneLineTabBadge>{counts.done}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "archived"} onClick={() => setTab("archived")}>
          Archived <SpyneLineTabBadge>{counts.archived}</SpyneLineTabBadge>
        </SpyneLineTab>
      </SpyneLineTabStrip>

      <div className="spyne-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[14px] font-semibold">All caught up. 🎉</div>
            <div className="text-[13px] text-spyne-text-muted mt-1">Nothing else needs attention right now.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-spyne-border bg-spyne-surface-hover text-[11px] font-bold uppercase tracking-[0.04em] text-spyne-text-muted">
                <th className="px-5 py-3 text-left">Priority</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Caller</th>
                <th className="px-5 py-3 text-left">Action Required</th>
                <th className="px-5 py-3 text-left">Due</th>
                <th className="px-5 py-3 text-left">Stage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const tm = typeMeta[i.type]
                const isDone = i.status === "completed"
                return (
                  <tr
                    key={i.id}
                    onClick={() => setSelectedId(i.id)}
                    className={cn(
                      "border-b border-spyne-border last:border-b-0 cursor-pointer transition-colors",
                      selectedId === i.id ? "bg-spyne-brand-subtle" : "hover:bg-spyne-surface-hover",
                      isDone && "opacity-60"
                    )}
                  >
                    <td className="px-5 py-4 align-middle">
                      <PriorityBadge p={i.priority} />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Pill tone={tm.tone} icon={tm.icon}>{tm.label}</Pill>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <CallerCell name={i.callerName} phone={i.callerPhone} />
                    </td>
                    <td className="px-5 py-4 align-middle text-[13px] max-w-[320px]">
                      <div className="line-clamp-2">{i.task}</div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="text-[13px] font-semibold text-spyne-brand">{i.dueDate}</span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Pill tone="warning">{stageMeta[i.type]}</Pill>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <div className="inline-flex items-center gap-2 text-spyne-text-muted" onClick={(e) => e.stopPropagation()}>
                        <button type="button" title="Call now" className="p-1 rounded hover:bg-spyne-brand-subtle hover:text-spyne-brand transition-colors">
                          <MaterialSymbol name="call" size={16} />
                        </button>
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => markDone(i.id)}
                            title="Mark as done"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold hover:bg-spyne-success-subtle hover:text-spyne-success transition-colors"
                          >
                            <MaterialSymbol name="check_circle" size={13} /> Done
                          </button>
                        )}
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => dismiss(i.id)}
                            title="Archive (dismiss)"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold hover:bg-spyne-surface-hover hover:text-spyne-text-primary transition-colors"
                          >
                            <MaterialSymbol name="archive" size={13} /> Archive
                          </button>
                        )}
                        <button type="button" onClick={() => setSelectedId(i.id)} title="View details" className="p-1 rounded hover:bg-spyne-brand-subtle hover:text-spyne-brand transition-colors">
                          <MaterialSymbol name="chevron_right" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && <DetailPanel item={selected} onClose={() => setSelectedId(null)} onMarkDone={() => { markDone(selected.id); setSelectedId(null); }} onDismiss={() => { dismiss(selected.id); setSelectedId(null); }} />}
    </div>
  )
}

function DetailPanel({ item, onClose, onMarkDone, onDismiss }: { item: ReceptionistFollowUpItem; onClose: () => void; onMarkDone: () => void; onDismiss: () => void }) {
  const tm = typeMeta[item.type]
  const [outcome, setOutcome] = useState<string | null>(null)
  const leadCopy: Record<ReceptionistFollowUpType, string> = {
    after_hours_message: "Caller left a message outside business hours. Riley captured intent + callback number. Same-day callbacks convert 3× better.",
    failed_transfer:     "Riley tried to reach the staff member asked for. No answer. The caller agreed to a callback — keep that promise.",
    voicemail:           "Voicemail captured with structured intent. Listen to the recording before calling back.",
    callback_scheduled:  "Caller explicitly asked for a callback at a specific time. Honour the window — late callbacks hurt CSAT.",
    manager_escalation:  "Caller was frustrated and asked for a manager. Sentiment was elevated. Listen to the recording before calling back.",
    config_gap:          "Riley surfaced a routing target that isn't responding. Until fixed, callers needing this route are falling to voicemail.",
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 w-[440px] max-w-[90vw] bg-spyne-page shadow-2xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-spyne-surface border-b border-spyne-border px-6 py-4 flex items-start justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <CallerCell name={item.callerName} phone={item.callerPhone} />
          </div>
          <button type="button" onClick={onClose} className="text-spyne-text-muted hover:text-spyne-text-primary">
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Pill tone={tm.tone} icon={tm.icon}>{tm.label}</Pill>
            <PriorityBadge p={item.priority} />
          </div>

          {/* LEAD WITH THIS */}
          <div className="spyne-card p-4 bg-spyne-brand-subtle/40 border-spyne-brand/20">
            <div className="flex items-center gap-1.5 mb-2">
              <MaterialSymbol name="lightbulb" size={14} className="text-spyne-brand" />
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-brand">Lead with this</span>
            </div>
            <p className="text-[13px] leading-relaxed">{leadCopy[item.type]}</p>
          </div>

          {/* Quick actions */}
          <button type="button" className="w-full bg-spyne-brand hover:opacity-90 text-white rounded-lg py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5">
            <MaterialSymbol name="call" size={14} /> Call now
          </button>
          <button type="button" className="w-full border border-spyne-border bg-spyne-surface py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-spyne-surface-hover">
            <MaterialSymbol name="voicemail" size={14} /> Listen to recording
          </button>

          {/* Context */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted mb-2">Context</div>
            <div className="space-y-1.5 text-[12px]">
              <ContextRow label="Task" value={item.task} />
              <ContextRow label="Source intent" value={item.sourceIntent} />
              <ContextRow label="Due" value={item.dueDate} />
              <ContextRow label="Assigned to" value={item.assignedTo ?? "—"} />
              <ContextRow label="Status" value={item.status} />
            </div>
          </div>

          {/* Log outcome */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted mb-2.5">Log outcome</div>
            <div className="space-y-1.5">
              {["Customer called back · resolved", "Voicemail left", "Needs another attempt", "Resolved by team", "Not relevant / spam"].map((label) => (
                <label key={label} className={cn(
                  "flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors",
                  outcome === label ? "border-spyne-brand bg-spyne-brand-subtle" : "border-spyne-border hover:bg-spyne-surface-hover"
                )}>
                  <input type="radio" name="outcome" checked={outcome === label} onChange={() => setOutcome(label)} className="w-3.5 h-3.5 accent-spyne-brand" />
                  <span className="text-[12px]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="button" onClick={onMarkDone} disabled={!outcome} className={cn(
            "w-full py-2.5 rounded-lg font-bold text-[13px]",
            outcome ? "bg-spyne-brand hover:opacity-90 text-white" : "bg-spyne-border text-spyne-text-subtle cursor-not-allowed"
          )}>
            Save outcome &amp; mark done
          </button>
          <button type="button" onClick={onDismiss} className="w-full py-2 text-[12px] font-semibold text-spyne-text-muted hover:text-spyne-error inline-flex items-center justify-center gap-1.5">
            <MaterialSymbol name="archive" size={13} /> Archive instead
          </button>
        </div>
      </aside>
    </>
  )
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-spyne-text-muted shrink-0">{label}</span>
      <span className="font-medium text-right break-words min-w-0">{value}</span>
    </div>
  )
}

function PriorityBadge({ p }: { p: ReceptionistFollowUpItem["priority"] }) {
  if (p === "Urgent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-spyne-error-subtle px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-spyne-error">
        <MaterialSymbol name="priority_high" size={12} /> Urgent
      </span>
    )
  }
  if (p === "High") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-spyne-warning-subtle px-2 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--spyne-warning-ink)" }}>
        <MaterialSymbol name="arrow_upward" size={12} /> High
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-spyne-border px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-spyne-text-muted">
      <MaterialSymbol name="remove" size={12} /> Normal
    </span>
  )
}

function Pill({ tone, children, icon }: { tone: "warning" | "info" | "brand" | "error" | "neutral"; children: React.ReactNode; icon?: string }) {
  const cls =
    tone === "warning" ? "bg-spyne-warning-subtle text-[var(--spyne-warning-ink)]" :
    tone === "info"    ? "bg-spyne-info-subtle text-spyne-info" :
    tone === "brand"   ? "bg-spyne-brand-subtle text-spyne-brand" :
    tone === "error"   ? "bg-spyne-error-subtle text-spyne-error" :
                         "bg-spyne-border text-spyne-text-muted"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold", cls)}>
      {icon && <MaterialSymbol name={icon} size={11} />}
      {children}
    </span>
  )
}

function CallerCell({ name, phone }: { name?: string; phone: string }) {
  const initials = (name ?? "?").slice(0, 2).toUpperCase()
  // Deterministic gradient per caller for visual rhythm
  const seed = (name ?? phone).split("").reduce((s, c) => s + c.charCodeAt(0), 0)
  const gradients = [
    "linear-gradient(135deg, var(--spyne-brand), color-mix(in srgb, var(--spyne-brand) 60%, black))",
    "linear-gradient(135deg, #8a5cf6, #5b21b6)",
    "linear-gradient(135deg, #ec4899, #be185d)",
    "linear-gradient(135deg, #10b981, #047857)",
    "linear-gradient(135deg, #f59e0b, #b45309)",
  ]
  const bg = gradients[seed % gradients.length]
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-sm" style={{ background: bg }}>
        {initials}
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-spyne-text-primary truncate">{name ?? "Unknown caller"}</div>
        <div className="text-[12px] text-spyne-text-muted font-mono mt-0.5">{phone === "—" ? "—" : phone}</div>
      </div>
    </div>
  )
}
