"use client"

import { useState, useMemo } from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { SpyneFilterSelectChevron, SpyneFilterSelectWrap } from "@/components/max-2/spyne-toolbar-controls"
import { max2Classes, spyneComponentClasses, spyneSalesLayout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { dateRangeOptions } from "@/components/max-2/sales/console-v2/mockData"
import type { ReceptionistCallRow } from "./receptionist-data"

const statusMeta: Record<ReceptionistCallRow["transferStatus"], { label: string; tone: "success" | "warning" | "info" | "error" }> = {
  connected:     { label: "Connected",          tone: "success" },
  voicemail:     { label: "Voicemail captured", tone: "warning" },
  message_taken: { label: "Message taken",      tone: "info" },
  info_provided: { label: "Answered directly",  tone: "info" },
  abandoned:     { label: "Abandoned",          tone: "error" },
}

const intentTone: Record<string, "success" | "brand" | "info" | "warning" | "error" | "neutral"> = {
  service_inquiry: "success",
  sales_inquiry: "brand",
  parts_inquiry: "info",
  finance_inquiry: "info",
  staff_request: "warning",
  general_info: "neutral",
  complaint_or_escalation: "error",
  after_hours_message: "warning",
  failed_transfer: "error",
  abandoned: "error",
}

export function ReceptionistCallsTable({ calls }: { calls: ReceptionistCallRow[] }) {
  const [tab, setTab] = useState<"all" | "routed" | "voicemails" | "abandoned">("all")
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<string>("Last 30 days")
  const [intent, setIntent] = useState<string>("all")
  const [outcome, setOutcome] = useState<string>("all")
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const selectedCall = calls.find((c) => c.id === selectedCallId)

  const allIntents = useMemo(() => Array.from(new Set(calls.map((c) => c.intent))).sort(), [calls])
  const allOutcomes = useMemo(() => Array.from(new Set(calls.map((c) => c.transferStatus))).sort(), [calls])

  const counts = useMemo(() => ({
    all: calls.length,
    routed: calls.filter((c) => ["routed_to_ai_agent", "routed_to_staff", "routed_to_dept"].includes(c.outcome)).length,
    voicemails: calls.filter((c) => ["voicemail", "message_taken"].includes(c.transferStatus)).length,
    abandoned: calls.filter((c) => c.transferStatus === "abandoned").length,
  }), [calls])

  const filtered = useMemo(() => {
    let r = calls
    if (tab === "routed") r = r.filter((c) => ["routed_to_ai_agent", "routed_to_staff", "routed_to_dept"].includes(c.outcome))
    else if (tab === "voicemails") r = r.filter((c) => ["voicemail", "message_taken"].includes(c.transferStatus))
    else if (tab === "abandoned") r = r.filter((c) => c.transferStatus === "abandoned")
    if (intent !== "all") r = r.filter((c) => c.intent === intent)
    if (outcome !== "all") r = r.filter((c) => c.transferStatus === outcome)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((c) =>
        c.callerPhone.includes(q) ||
        (c.customerName ?? "").toLowerCase().includes(q) ||
        c.intentTitle.toLowerCase().includes(q)
      )
    }
    return r
  }, [calls, tab, search, intent, outcome])

  const hasActiveFilters = period !== "Last 30 days" || intent !== "all" || outcome !== "all" || search.length > 0
  const clearFilters = () => { setPeriod("Last 30 days"); setIntent("all"); setOutcome("all"); setSearch("") }

  return (
    <div className={spyneSalesLayout.pageStack}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={max2Classes.pageTitle}>Calls</h1>
          <p className={max2Classes.pageDescription}>Every inbound call answered by Riley, where it went, and what happened next.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 flex-wrap justify-end">
          {/* Period */}
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

          {/* Intent */}
          <SpyneFilterSelectWrap>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className={cn(spyneComponentClasses.filterSelect, "min-w-[9rem] cursor-pointer")}
              aria-label="Intent"
            >
              <option value="all">All intents</option>
              {allIntents.map((i) => <option key={i} value={i}>{i.replace(/_/g, " ")}</option>)}
            </select>
            <SpyneFilterSelectChevron />
          </SpyneFilterSelectWrap>

          {/* Outcome */}
          <SpyneFilterSelectWrap>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className={cn(spyneComponentClasses.filterSelect, "min-w-[9rem] cursor-pointer")}
              aria-label="Outcome"
            >
              <option value="all">All outcomes</option>
              {allOutcomes.map((o) => <option key={o} value={o}>{statusMeta[o]?.label ?? o}</option>)}
            </select>
            <SpyneFilterSelectChevron />
          </SpyneFilterSelectWrap>

          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="text-[12px] font-semibold text-spyne-brand hover:opacity-80 ml-1">
              Clear
            </button>
          )}
        </div>
      </div>

      <SpyneLineTabStrip>
        <SpyneLineTab active={tab === "all"} onClick={() => setTab("all")}>
          All calls <SpyneLineTabBadge>{counts.all}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "routed"} onClick={() => setTab("routed")}>
          Routed <SpyneLineTabBadge>{counts.routed}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "voicemails"} onClick={() => setTab("voicemails")}>
          Voicemails <SpyneLineTabBadge>{counts.voicemails}</SpyneLineTabBadge>
        </SpyneLineTab>
        <SpyneLineTab active={tab === "abandoned"} onClick={() => setTab("abandoned")}>
          Abandoned <SpyneLineTabBadge>{counts.abandoned}</SpyneLineTabBadge>
        </SpyneLineTab>
      </SpyneLineTabStrip>

      <div className="spyne-card flex items-center gap-3 px-4 py-3">
        <MaterialSymbol name="search" size={16} className="text-spyne-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by phone, name, or intent"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-spyne-text-subtle"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-spyne-text-muted hover:text-spyne-text-primary">
            <MaterialSymbol name="close" size={14} />
          </button>
        )}
      </div>

      <div className="spyne-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[14px] font-semibold">No calls match</div>
            <div className="text-[13px] text-spyne-text-muted mt-1">Try clearing filters or switching tabs.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-spyne-border bg-spyne-surface-hover text-[11px] font-bold uppercase tracking-[0.04em] text-spyne-text-muted">
                <th className="px-5 py-3 text-left">Caller</th>
                <th className="px-5 py-3 text-left">When</th>
                <th className="px-5 py-3 text-left">Intent</th>
                <th className="px-5 py-3 text-left">Routed to</th>
                <th className="px-5 py-3 text-left">Outcome</th>
                <th className="px-5 py-3 text-left">Duration</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sm = statusMeta[c.transferStatus]
                const it = intentTone[c.intent] ?? "neutral"
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCallId(c.id)}
                    className={cn(
                      "border-b border-spyne-border last:border-b-0 transition-colors cursor-pointer",
                      selectedCallId === c.id ? "bg-spyne-brand-subtle" : "hover:bg-spyne-surface-hover"
                    )}
                  >
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedCallId(c.id); }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white hover:opacity-90 shadow-sm transition-shadow"
                          style={{ background: "linear-gradient(135deg, var(--spyne-brand), color-mix(in srgb, var(--spyne-brand) 75%, black))" }}
                          title="Play recording"
                        >
                          <MaterialSymbol name="play_arrow" size={20} />
                        </button>
                        <div className="min-w-0">
                          {c.customerName ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <div className="text-[13px] font-semibold truncate">{c.customerName}</div>
                                {c.isReturningCaller && (
                                  <span className="inline-flex items-center gap-0.5 rounded bg-spyne-success-subtle px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-spyne-success">
                                    <MaterialSymbol name="autorenew" size={10} /> Returning
                                  </span>
                                )}
                              </div>
                              <div className="text-[12px] text-spyne-text-muted font-mono mt-0.5">{c.callerPhone}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-[13px] font-semibold font-mono">{c.callerPhone}</div>
                              <div className="text-[11px] text-spyne-text-subtle mt-0.5">Unknown caller</div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="text-[13px] font-medium">{formatDate(c.startedAt)}</div>
                      <div className="text-[11px] text-spyne-text-muted tabular-nums">{formatTime(c.startedAt)}</div>
                    </td>
                    <td className="px-5 py-4 align-middle max-w-[280px]">
                      <div className="text-[13px] font-medium mb-1.5 truncate">{c.intentTitle}</div>
                      <Pill tone={it}>{c.intent.replace(/_/g, " ")}</Pill>
                    </td>
                    <td className="px-5 py-4 align-middle text-[13px]">
                      {c.outcome === "answered_directly" ? (
                        <span className="inline-flex items-center gap-1.5 text-spyne-text-muted">
                          <MaterialSymbol name="chat" size={13} /> Answered directly
                        </span>
                      ) : c.outcome === "abandoned" ? (
                        <span className="text-spyne-text-subtle">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <MaterialSymbol name="arrow_forward" size={13} className="text-spyne-brand" />
                          <strong className="font-semibold">{c.transferTarget}</strong>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Pill tone={sm.tone} icon={outcomeIcon(c.transferStatus)}>{sm.label}</Pill>
                    </td>
                    <td className="px-5 py-4 align-middle text-[13px] text-spyne-text-muted font-mono tabular-nums">
                      {formatDuration(c.durationSec)}
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedCallId(c.id); }}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-spyne-text-muted hover:text-spyne-brand transition-colors"
                      >
                        View <MaterialSymbol name="arrow_forward" size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedCall && <CallDetailDrawer call={selectedCall} onClose={() => setSelectedCallId(null)} />}
    </div>
  )
}

function CallDetailDrawer({ call, onClose }: { call: ReceptionistCallRow; onClose: () => void }) {
  const sm = statusMeta[call.transferStatus]
  const it = intentTone[call.intent] ?? "neutral"

  // Synthesize transcript + segments from the call data
  const segments = call.outcome === "answered_directly"
    ? [{ role: "receptionist" as const, agentName: "Riley", duration: call.durationSec, intent: call.intent, transferReason: null }]
    : [
        { role: "receptionist" as const, agentName: "Riley", duration: Math.round(call.durationSec * 0.4), intent: call.intent, transferReason: `Intent confirmed → ${call.transferTarget}` },
        { role: "downstream" as const, agentName: call.transferTarget, duration: Math.round(call.durationSec * 0.6), intent: call.intent, transferReason: null },
      ]

  const synthTranscript = [
    { speaker: "agent", name: "Riley", at: "0:00", text: call.isReturningCaller
      ? `Welcome back${call.customerName ? `, ${call.customerName.split(" ")[0]}` : ""}. How can I help today?`
      : "Thanks for calling Spyne Motors, this is Riley. How can I help?" },
    { speaker: "caller", name: "Caller", at: "0:08", text: callerOpener(call.intent) },
    { speaker: "agent", name: "Riley", at: "0:16", text: agentResponse(call) },
    ...(call.outcome === "answered_directly" ? [
      { speaker: "caller", name: "Caller", at: "0:24", text: "Thanks, that's all I needed." },
      { speaker: "agent", name: "Riley", at: "0:27", text: "You're welcome. Thanks for calling Spyne Motors." }
    ] : [
      { speaker: "transfer", name: "Transfer", at: `0:${(Math.round(call.durationSec * 0.4)).toString().padStart(2, "0")}`, text: `TRANSFER · receptionist → ${call.transferTarget}` },
    ]),
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 w-[640px] max-w-[90vw] bg-spyne-page shadow-2xl z-50 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-spyne-surface border-b border-spyne-border px-6 py-4 flex items-start justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-spyne-brand text-white font-bold flex items-center justify-center">
              {(call.customerName ?? call.callerPhone).slice(-2)}
            </div>
            <div>
              <div className="text-[16px] font-bold">{call.customerName ?? "Unknown caller"}</div>
              <div className="text-[12px] text-spyne-text-muted font-mono">{call.callerPhone}</div>
              {call.isReturningCaller && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-spyne-success mt-1">
                  <MaterialSymbol name="autorenew" size={11} /> Returning caller
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-spyne-text-muted hover:text-spyne-text-primary">
            <MaterialSymbol name="close" size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Recording + waveform */}
          <div className="spyne-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <button type="button" className="w-10 h-10 rounded-full bg-spyne-brand text-white flex items-center justify-center hover:opacity-90">
                <MaterialSymbol name="play_arrow" size={20} />
              </button>
              <div className="flex-1">
                <div className="flex items-end gap-px h-8">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const h = 30 + Math.abs(Math.sin(i * 0.4) * 40) + Math.random() * 15
                    return <div key={i} className="flex-1 rounded-full" style={{ height: `${h}%`, background: i < 16 ? "var(--spyne-brand)" : "var(--spyne-border-strong)" }} />
                  })}
                </div>
              </div>
              <span className="text-[11px] font-mono text-spyne-text-muted tabular-nums">0:00 / {formatDuration(call.durationSec)}</span>
              <button type="button" className="text-spyne-text-muted hover:text-spyne-text-primary" title="Download">
                <MaterialSymbol name="download" size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-[11px] pt-3 border-t border-spyne-border">
              <div>
                <div className="text-spyne-text-muted">Started</div>
                <div className="font-semibold">{formatDate(call.startedAt)} · {formatTime(call.startedAt)}</div>
              </div>
              <div>
                <div className="text-spyne-text-muted">Duration</div>
                <div className="font-semibold tabular-nums">{formatDuration(call.durationSec)}</div>
              </div>
              <div>
                <div className="text-spyne-text-muted">Outcome</div>
                <div className="font-semibold"><Pill tone={sm.tone}>{sm.label}</Pill></div>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="spyne-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <MaterialSymbol name="auto_awesome" size={16} className="text-spyne-brand" />
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-brand">AI Summary</div>
            </div>
            <p className="text-[13px] leading-relaxed">
              {summaryFor(call)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <Pill tone={it}>{call.intent}</Pill>
              {call.outcome !== "answered_directly" && (
                <Pill tone="brand">Routed to {call.transferTarget}</Pill>
              )}
            </div>
          </div>

          {/* Caller intelligence */}
          {call.isReturningCaller && (
            <div className="spyne-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <MaterialSymbol name="contacts" size={16} className="text-spyne-brand" />
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-brand">Caller intelligence used</div>
              </div>
              <div className="space-y-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <MaterialSymbol name="check_circle" size={12} className="text-spyne-success shrink-0" />
                  <span>Recognized via phone match · customer_id <code className="bg-spyne-surface-hover px-1 rounded font-mono text-[10px]">8842</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialSymbol name="check_circle" size={12} className="text-spyne-success shrink-0" />
                  <span>Greeted by name in opening</span>
                </div>
                {call.outcome !== "answered_directly" && (
                  <div className="flex items-center gap-2">
                    <MaterialSymbol name="check_circle" size={12} className="text-spyne-success shrink-0" />
                    <span>Vehicle context passed to {call.transferTarget}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Segments */}
          <div className="spyne-card p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted mb-3">Segments · {segments.length}</div>
            {segments.map((s, i) => (
              <div key={i}>
                <div className={cn(
                  "rounded-lg border border-l-[3px] p-3 mb-2",
                  s.role === "receptionist" ? "border-l-spyne-brand" : "border-l-spyne-success"
                )}>
                  <div className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                        s.role === "receptionist" ? "bg-spyne-brand-subtle text-spyne-brand" : "bg-spyne-success-subtle text-spyne-success"
                      )}>{i + 1}</span>
                      <span className="font-semibold">{s.agentName}</span>
                    </div>
                    <span className="font-mono tabular-nums text-spyne-text-muted">{formatDuration(s.duration)}</span>
                  </div>
                  {s.transferReason && (
                    <div className="text-[11px] text-spyne-text-muted mt-1 ml-7">Transfer reason: {s.transferReason}</div>
                  )}
                </div>
                {i < segments.length - 1 && (
                  <div className="flex justify-center my-1">
                    <MaterialSymbol name="south" size={14} className="text-spyne-text-subtle" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Transcript */}
          <div className="spyne-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-spyne-text-muted">Transcript</div>
              <div className="flex gap-2">
                <button type="button" className="text-[11px] font-semibold text-spyne-brand hover:opacity-80">
                  <MaterialSymbol name="share" size={11} className="mr-0.5" /> Share
                </button>
                <button type="button" className="text-[11px] font-semibold text-spyne-brand hover:opacity-80">
                  <MaterialSymbol name="flag" size={11} className="mr-0.5" /> Send to QA
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {synthTranscript.map((t, i) => {
                if (t.speaker === "transfer") {
                  return (
                    <div key={i} className="text-center text-[11px] text-spyne-brand font-bold tracking-wide py-1">
                      ↓ {t.text} ↓
                    </div>
                  )
                }
                return (
                  <div key={i} className={cn(
                    "rounded-md px-3 py-2 text-[13px] leading-relaxed",
                    t.speaker === "agent" ? "bg-spyne-surface-hover" : "bg-white border border-spyne-border"
                  )}>
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: t.speaker === "agent" ? "var(--spyne-brand)" : "var(--spyne-text-muted)" }}>
                      {t.name} · {t.at}
                    </div>
                    {t.text}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 sticky bottom-0 bg-spyne-page py-2 -mx-6 px-6 border-t border-spyne-border">
            <button type="button" className={cn(spyneComponentClasses.btnPrimaryMd, "flex items-center gap-1.5 flex-1 justify-center")}>
              <MaterialSymbol name="call" size={14} /> Call this customer
            </button>
            <button type="button" className={cn(spyneComponentClasses.btnSecondaryMd, "flex items-center gap-1.5")}>
              <MaterialSymbol name="add_task" size={14} /> Create action item
            </button>
            <button type="button" className={cn(spyneComponentClasses.btnSecondaryMd, "flex items-center gap-1.5")}>
              <MaterialSymbol name="label" size={14} /> Tag
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function callerOpener(intent: string): string {
  switch (intent) {
    case "service_inquiry":         return "Hi, I need to schedule an oil change for my truck."
    case "sales_inquiry":           return "I saw an F-150 on your website — is it still available?"
    case "general_info":            return "What time do you close today?"
    case "parts_inquiry":           return "Do you have brake pads for a 2022 Camry in stock?"
    case "staff_request":           return "Can I speak to Sam in Service?"
    case "after_hours_message":     return "Hi, I know you're closed but I need brake service ASAP."
    case "complaint_or_escalation": return "I'm extremely frustrated — I want to speak with a manager."
    default:                        return "Hi, calling to ask about something."
  }
}
function agentResponse(c: ReceptionistCallRow): string {
  if (c.outcome === "answered_directly") {
    return "We're open Monday to Friday 7am-7pm, Saturday 8am-5pm, and closed Sundays. Anything else?"
  }
  if (c.outcome === "abandoned") return "I'm sorry, I didn't catch that. Could you say it again?"
  return `Of course — let me get you to ${c.transferTarget}. One moment.`
}
function summaryFor(c: ReceptionistCallRow): string {
  if (c.outcome === "answered_directly") {
    return `Caller asked about ${c.intent.replace(/_/g, " ")}. Riley answered directly from the knowledge base. No transfer needed.`
  }
  if (c.outcome === "abandoned") {
    return `Caller hung up after ${formatDuration(c.durationSec)}. Intent was unclear — no follow-up actionable.`
  }
  return `${c.isReturningCaller && c.customerName ? `Returning customer ${c.customerName} called` : "Caller called"} about ${c.intent.replace(/_/g, " ")}. Riley routed to ${c.transferTarget}${c.transferStatus === "connected" ? " — connected" : c.transferStatus === "voicemail" ? " — rolled to voicemail" : ""}.`
}

function outcomeIcon(status: string): string {
  switch (status) {
    case "connected":     return "check_circle"
    case "voicemail":     return "voicemail"
    case "message_taken": return "mail"
    case "info_provided": return "chat"
    case "abandoned":     return "call_end"
    default:              return "info"
  }
}
function Pill({ tone, children, icon }: { tone: "success" | "brand" | "info" | "warning" | "error" | "neutral"; children: React.ReactNode; icon?: string }) {
  const cls =
    tone === "success" ? "bg-spyne-success-subtle text-spyne-success" :
    tone === "brand"   ? "bg-spyne-brand-subtle text-spyne-brand" :
    tone === "info"    ? "bg-spyne-info-subtle text-spyne-info" :
    tone === "warning" ? "bg-spyne-warning-subtle text-[var(--spyne-warning-ink)]" :
    tone === "error"   ? "bg-spyne-error-subtle text-spyne-error" :
                         "bg-spyne-border text-spyne-text-muted"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold capitalize", cls)}>
      {icon && <MaterialSymbol name={icon} size={11} />}
      {children}
    </span>
  )
}

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) }
function formatTime(iso: string) { return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }
function formatDuration(s: number) { return `${Math.floor(s / 60)}m ${s % 60}s` }
