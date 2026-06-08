"use client"

/**
 * Action Items — master/detail console (matches the vini-product reference).
 * LEFT: action items grouped by customer (N-items expansion, sorted by SLA
 * burn, breaching first). RIGHT: every open item for the selected lead stacked
 * in a list — each with what-needs-doing, the source message, assignee, and
 * Resolve / Incorrect. Manager vs My-queue scope + a manager SLA strip on top.
 */

import { useEffect, useMemo, useState } from 'react'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { SpyneLineTab, SpyneLineTabStrip } from '@/components/max-2/spyne-line-tabs'
import { EmptyState } from '../shared'
import {
  ACTION_ITEMS, INTENT_TAXONOMY, DEPT_BADGE, CHANNEL_META, CUSTOMERS, USERS,
  CURRENT_USER_ID, CLEARED_TODAY,
  ageLabel, ageMinutes, isPastSla, slaBurnRatio, deptOf,
} from './data'

const INCORRECT_REASONS = [
  { value: 'wrong_intent', label: 'Wrong intent' },
  { value: 'not_a_task', label: 'Not a task' },
  { value: 'customer_did_not_say_this', label: "Customer didn't say this" },
  { value: 'duplicate_of_existing', label: 'Duplicate of existing' },
  { value: 'other', label: 'Other' },
]

export function ActionItemsConsole() {
  const [items, setItems] = useState(ACTION_ITEMS)
  const [scope, setScope] = useState('manager') // 'manager' | 'mine'
  const [tab, setTab] = useState('unresolved')
  const [filters, setFilters] = useState({ search: '', assignment: 'all', channel: 'all', dept: 'all' })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [incorrectFor, setIncorrectFor] = useState(null) // action_item_id awaiting reason
  const [assigningFor, setAssigningFor] = useState(null) // action_item_id awaiting assignee
  const [toast, setToast] = useState(null)

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }

  const pending = useMemo(() => items.filter((i) => i.status === 'pending'), [items])
  const resolved = useMemo(() => items.filter((i) => i.status === 'completed'), [items])
  const incorrect = useMemo(() => items.filter((i) => i.status === 'incorrect'), [items])

  const filteredPending = useMemo(() => pending.filter((i) => {
    if (scope === 'mine' && i.assignee_user_id !== CURRENT_USER_ID) return false
    if (filters.assignment === 'unassigned' && i.assignee_user_id) return false
    if (filters.assignment === 'assigned' && !i.assignee_user_id) return false
    if (filters.channel !== 'all' && i.source_channel !== filters.channel) return false
    if (filters.dept !== 'all' && deptOf(i) !== filters.dept) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const name = CUSTOMERS[i.customer_id]?.name?.toLowerCase() ?? ''
      if (!i.intent_recap.toLowerCase().includes(q) && !name.includes(q) && !i.action_item_id.includes(q)) return false
    }
    return true
  }), [pending, filters, scope])

  // Group by customer, sort groups by worst SLA burn (breaching first).
  const groups = useMemo(() => {
    const map = new Map()
    for (const it of filteredPending) {
      if (!map.has(it.customer_id)) map.set(it.customer_id, [])
      map.get(it.customer_id).push(it)
    }
    const arr = [...map.entries()]
      .filter(([, its]) => its.length > 0)
      .map(([customerId, its]) => ({ customerId, items: [...its].sort((a, b) => slaBurnRatio(b) - slaBurnRatio(a)) }))
    const maxBurn = (its) => (its.length ? Math.max(...its.map(slaBurnRatio)) : -1)
    arr.sort((a, b) => maxBurn(b.items) - maxBurn(a.items))
    return arr
  }, [filteredPending])

  const metrics = useMemo(() => ({
    breaching: pending.filter(isPastSla).length,
    unassigned: pending.filter((i) => !i.assignee_user_id).length,
    repeatCallers: new Set(pending.filter((i) => i.repeat_caller_count >= 3).map((i) => i.customer_id)).size,
    clearedToday: CLEARED_TODAY,
  }), [pending])

  // Selected customer's items (all of them) for the right pane.
  const activeCustomer = selectedCustomer ?? groups[0]?.customerId ?? null
  const activeItems = useMemo(
    () => filteredPending.filter((i) => i.customer_id === activeCustomer).sort((a, b) => slaBurnRatio(b) - slaBurnRatio(a)),
    [filteredPending, activeCustomer]
  )

  const resolve = (id) => { setItems((p) => p.map((i) => (i.action_item_id === id ? { ...i, status: 'completed', resolution_type: 'info_provided' } : i))); flash('Resolved — moved to Resolved') }
  const resolveAll = (customerId) => { setItems((p) => p.map((i) => (i.customer_id === customerId && i.status === 'pending' ? { ...i, status: 'completed', resolution_type: 'info_provided' } : i))); if (selectedCustomer === customerId) setSelectedCustomer(null); flash('All items resolved'); setIncorrectFor(null) }
  const markIncorrect = (id, reason) => { setItems((p) => p.map((i) => (i.action_item_id === id ? { ...i, status: 'incorrect', incorrect_reason: reason } : i))); setIncorrectFor(null); flash('Marked incorrect — excluded from closure rate') }
  const undoIncorrect = (id) => { setItems((p) => p.map((i) => (i.action_item_id === id ? { ...i, status: 'pending', incorrect_reason: undefined } : i))); flash('Restored to Unresolved') }
  const assign = (id, userId) => { setItems((p) => p.map((i) => (i.action_item_id === id ? { ...i, assignee_user_id: userId } : i))); setAssigningFor(null); flash(`Assigned to ${USERS[userId]?.name ?? 'rep'}`) }

  // After resolving, if the selected lead has no remaining items, advance to the next.
  useEffect(() => {
    if (activeCustomer && activeItems.length === 0) {
      const next = groups[0]?.customerId ?? null
      if (next !== selectedCustomer) setSelectedCustomer(next)
    }
  }, [activeItems.length, activeCustomer, groups, selectedCustomer])

  return (
    <div className={spyneSalesLayout.pageStack}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={max2Classes.pageTitle}>Action items</h1>
          <p className={`${max2Classes.pageDescription} mt-0.5`}>Keep every promise to your customers — clear what's breaching first.</p>
        </div>
        <div className="inline-flex rounded-lg border border-spyne-border bg-spyne-surface p-0.5">
          {[['manager', 'Manager', 'groups'], ['mine', 'My queue', 'person']].map(([id, label, icon]) => (
            <button key={id} onClick={() => { setScope(id); setSelectedCustomer(null) }} className={cn('spyne-focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors', scope === id ? 'bg-spyne-primary text-white' : 'text-spyne-text-secondary hover:text-spyne-text-primary')}>
              <MaterialSymbol name={icon} size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* SLA banner */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl px-4 py-3" style={{ background: metrics.breaching > 0 ? 'var(--spyne-danger-subtle)' : 'var(--spyne-success-subtle)', border: `1px solid ${metrics.breaching > 0 ? 'var(--spyne-danger-muted)' : 'var(--spyne-success-muted)'}` }}>
        <span className="text-[28px] font-bold leading-none tabular-nums" style={{ color: metrics.breaching > 0 ? 'var(--spyne-danger-text)' : 'var(--spyne-success-text)' }}>{metrics.breaching}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>
            {metrics.breaching > 0 ? `${metrics.breaching} items are past their SLA — promises already broken.` : 'Nothing is breaching SLA right now.'}
          </p>
          <p className="text-[11.5px]" style={{ color: 'var(--spyne-text-secondary)' }}>{metrics.breaching > 0 ? "Clear these first — they're sorted to the top by SLA burn." : 'Items are sorted by SLA burn so the most urgent stays on top.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MetricChip dot="var(--spyne-danger-text)" n={metrics.breaching} label="Breaching" />
          <MetricChip dot="var(--spyne-warning)" n={metrics.unassigned} label="Unassigned" />
          <MetricChip dot="var(--spyne-primary)" n={metrics.repeatCallers} label="Repeat callers" />
          <MetricChip dot="var(--spyne-success-text)" n={metrics.clearedToday} label="Cleared today" />
        </div>
      </div>

      {/* Tabs */}
      <SpyneLineTabStrip>
        {[['unresolved', 'Unresolved', filteredPending.length], ['resolved', 'Resolved', resolved.length], ['incorrect', 'Incorrect', incorrect.length]].map(([id, label, n]) => (
          <SpyneLineTab key={id} active={tab === id} onClick={() => setTab(id)}>
            {label} <span className="rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums" style={tab === id ? { background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' } : { background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-muted)' }}>{n}</span>
          </SpyneLineTab>
        ))}
      </SpyneLineTabStrip>

      {tab === 'resolved' ? (
        <ResolvedList items={resolved} />
      ) : tab === 'incorrect' ? (
        <IncorrectList items={incorrect} onUndo={undoIncorrect} />
      ) : (
        <>
          {/* Filters */}
          <FilterBar filters={filters} onChange={setFilters} />

          {/* Master / detail */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,400px)_1fr]">
            {/* LEFT list */}
            <div className="flex max-h-[calc(100vh-360px)] flex-col gap-1.5 overflow-y-auto pr-1">
              {groups.length === 0 ? (
                <div className="spyne-card">
                  <EmptyState glyph="filter_alt_off" title="No items match these filters" helper="Try clearing a filter or switching scope to see more of the queue." />
                </div>
              ) : groups.map((g) => (
                <CustomerRow
                  key={g.customerId}
                  group={g}
                  active={activeCustomer === g.customerId}
                  expanded={!!expanded[g.customerId]}
                  onSelect={() => setSelectedCustomer(g.customerId)}
                  onToggle={() => setExpanded((m) => ({ ...m, [g.customerId]: !m[g.customerId] }))}
                  onResolveAll={() => resolveAll(g.customerId)}
                />
              ))}
            </div>

            {/* RIGHT detail */}
            <div className="spyne-card flex min-h-[420px] flex-col p-0">
              {activeItems.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center">
                  <span className="inline-flex" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="task_alt" size={24} /></span>
                  <p className="text-[13px]" style={{ color: 'var(--spyne-text-secondary)' }}>Select a lead to see their open items</p>
                </div>
              ) : (
                <RightPane
                  customerId={activeCustomer}
                  items={activeItems}
                  incorrectFor={incorrectFor}
                  assigningFor={assigningFor}
                  onResolve={resolve}
                  onResolveAll={() => resolveAll(activeCustomer)}
                  onAskIncorrect={setIncorrectFor}
                  onMarkIncorrect={markIncorrect}
                  onAskAssign={setAssigningFor}
                  onAssign={assign}
                />
              )}
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="spyne-animate-slide-up fixed left-1/2 bottom-6 z-[200] flex -translate-x-1/2 items-center gap-1.5 rounded-lg px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-lg" style={{ background: 'var(--spyne-text-primary)' }}>
          <MaterialSymbol name="check_circle" size={14} /> {toast}
        </div>
      )}
    </div>
  )
}

/* ── Metric chip ─────────────────────────────────────────────────── */

function MetricChip({ dot, n, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-spyne-border bg-spyne-surface px-2.5 py-1 text-[11.5px] font-semibold" style={{ color: 'var(--spyne-text-secondary)' }}>
      <span className="size-2 rounded-full" style={{ background: dot }} />
      <span className="tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{n}</span> {label}
    </span>
  )
}

/* ── Filters ─────────────────────────────────────────────────────── */

function FilterBar({ filters, onChange }) {
  return (
    <div className="spyne-card flex flex-wrap items-center gap-2 px-3 py-2.5">
      <div className="relative min-w-[220px] flex-1">
        <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 inline-flex" style={{ left: 10, color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="search" size={14} /></span>
        <input value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })} placeholder="Search name, recap, or ID" className="spyne-input w-full" style={{ paddingLeft: 30, fontSize: 12 }} />
      </div>
      <Select label="Assignment" value={filters.assignment} onChange={(v) => onChange({ ...filters, assignment: v })} options={[['all', 'All'], ['assigned', 'Assigned'], ['unassigned', 'Unassigned']]} />
      <Select label="Channel" value={filters.channel} onChange={(v) => onChange({ ...filters, channel: v })} options={[['all', 'All channels'], ['call', 'Call'], ['sms', 'SMS'], ['chat', 'Chat'], ['email', 'Email']]} />
      <Select label="Dept" value={filters.dept} onChange={(v) => onChange({ ...filters, dept: v })} options={[['all', 'All depts'], ['sales', 'Sales'], ['service', 'Service'], ['compliance', 'Compliance']]} />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
      {label}:
      <select value={value} onChange={(e) => onChange(e.target.value)} className="spyne-input cursor-pointer" style={{ fontSize: 12, height: 32, paddingRight: 22 }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

/* ── Left: customer row ──────────────────────────────────────────── */

function IntentBadge({ intentId }) {
  const intent = INTENT_TAXONOMY[intentId]
  if (!intent) return <span className="spyne-badge spyne-badge-neutral" style={{ fontSize: 10 }}>{intentId}</span>
  return <span className={cn('spyne-badge', DEPT_BADGE[intent.dept])} style={{ fontSize: 10 }}>{intent.display_name}</span>
}

function PastSlaPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--spyne-danger-subtle)', color: 'var(--spyne-danger-text)' }}>
      <MaterialSymbol name="warning" size={10} /> Past SLA
    </span>
  )
}

function Assignee({ userId }) {
  if (!userId) return <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: 'var(--spyne-warning-ink)' }}><MaterialSymbol name="mark_email_unread" size={11} /> Unassigned</span>
  const u = USERS[userId]
  return <span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name="person" size={11} /> {u?.name ?? userId}</span>
}

function CustomerRow({ group, active, expanded, onSelect, onToggle, onResolveAll }) {
  const cust = CUSTOMERS[group.customerId]
  const multi = group.items.length > 1
  const worst = group.items[0]
  const anyPast = group.items.some(isPastSla)

  return (
    <div className={cn('spyne-card-interactive', active && 'active-action-card')} style={{ borderLeft: `3px solid ${anyPast ? 'var(--spyne-danger-text)' : active ? 'var(--spyne-primary)' : 'transparent'}` }}>
      <button onClick={onSelect} className="spyne-focus-ring flex w-full items-start gap-2.5 rounded-lg p-3 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>{cust?.name ?? group.customerId}</span>
            {multi && <span className="rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums" style={{ background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-secondary)' }}>{group.items.length} items</span>}
            {worst.repeat_caller_count >= 3 && (
              <span title={`Repeat caller — ${worst.repeat_caller_count} contacts`} className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>
                <MaterialSymbol name="autorenew" size={11} /> ×{worst.repeat_caller_count}
              </span>
            )}
            <span className="ml-auto shrink-0">{anyPast ? <PastSlaPill /> : <span className="text-[10.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{ageLabel(ageMinutes(worst))}</span>}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>{worst.intent_recap}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex" style={{ color: 'var(--spyne-text-muted)' }}><MaterialSymbol name={CHANNEL_META[worst.source_channel]?.symbol ?? 'chat'} size={12} /></span>
            <Assignee userId={worst.assignee_user_id} />
            {multi && (
              <button onClick={(e) => { e.stopPropagation(); onToggle() }} className="spyne-focus-ring ml-auto inline-flex items-center gap-0.5 rounded text-[10.5px] font-semibold" style={{ color: 'var(--spyne-primary)' }}>
                {expanded ? 'Hide' : `See all ${group.items.length}`} <MaterialSymbol name={expanded ? 'expand_less' : 'expand_more'} size={13} />
              </button>
            )}
          </div>
        </div>
      </button>

      {multi && expanded && (
        <div className="border-t border-spyne-border px-3 py-2">
          <ul className="flex flex-col gap-1.5">
            {group.items.map((it) => (
              <li key={it.action_item_id} className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ background: 'var(--spyne-page-bg)' }}>
                <IntentBadge intentId={it.intent_id} />
                {isPastSla(it) ? <PastSlaPill /> : <span className="text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>{ageLabel(ageMinutes(it))}</span>}
                <span className="min-w-0 flex-1 truncate text-[11px]" style={{ color: 'var(--spyne-text-secondary)' }}>{it.intent_recap}</span>
              </li>
            ))}
          </ul>
          <button onClick={(e) => { e.stopPropagation(); onResolveAll() }} className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: 'var(--spyne-primary)' }}>
            <MaterialSymbol name="done_all" size={13} /> Resolve all {group.items.length}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Right: detail pane (all items for the lead, stacked) ────────── */

function RightPane({ customerId, items, incorrectFor, assigningFor, onResolve, onResolveAll, onAskIncorrect, onMarkIncorrect, onAskAssign, onAssign }) {
  const cust = CUSTOMERS[customerId]
  const multi = items.length > 1
  return (
    <>
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-spyne-border px-4 py-3">
        <div>
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>{cust?.name ?? customerId}</h2>
          <p className="text-[11px]" style={{ color: 'var(--spyne-text-muted)' }}>{cust?.phone} · {items.length} open item{items.length === 1 ? '' : 's'}</p>
        </div>
        {multi && (
          <button onClick={onResolveAll} className="spyne-btn-secondary !h-8 !text-[12px]"><MaterialSymbol name="done_all" size={13} /> Resolve all {items.length}</button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {items.map((it) => (
          <ItemCard
            key={it.action_item_id}
            item={it}
            askingIncorrect={incorrectFor === it.action_item_id}
            askingAssign={assigningFor === it.action_item_id}
            onResolve={() => onResolve(it.action_item_id)}
            onAskIncorrect={() => { onAskAssign(null); onAskIncorrect(it.action_item_id) }}
            onCancelIncorrect={() => onAskIncorrect(null)}
            onMarkIncorrect={(reason) => onMarkIncorrect(it.action_item_id, reason)}
            onAskAssign={() => { onAskIncorrect(null); onAskAssign(it.action_item_id) }}
            onCancelAssign={() => onAskAssign(null)}
            onAssign={(userId) => onAssign(it.action_item_id, userId)}
          />
        ))}
      </div>
    </>
  )
}

function ItemCard({ item, askingIncorrect, askingAssign, onResolve, onAskIncorrect, onCancelIncorrect, onMarkIncorrect, onAskAssign, onCancelAssign, onAssign }) {
  const intent = INTENT_TAXONOMY[item.intent_id]
  const ch = CHANNEL_META[item.source_channel] ?? { label: 'Unknown', symbol: 'chat' }
  const past = isPastSla(item)
  return (
    <div className="spyne-card p-0">
      <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-3">
        <IntentBadge intentId={item.intent_id} />
        <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-secondary)' }}>
          <MaterialSymbol name={ch?.symbol ?? 'chat'} size={10} /> {ch?.label}
        </span>
        {past && <PastSlaPill />}
        <span className="ml-auto text-[10.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{ageLabel(ageMinutes(item))}</span>
      </div>

      <div className="px-3.5 py-2.5">
        <p className="text-[9.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>What needs doing</p>
        <p className="mt-0.5 text-[13px] leading-snug" style={{ color: 'var(--spyne-text-primary)' }}>{item.intent_recap}</p>

        <div className="mt-2.5 rounded-lg border border-spyne-border p-2.5" style={{ background: 'var(--spyne-page-bg)' }}>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>
              <MaterialSymbol name="graphic_eq" size={11} /> Source message
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button title="Recording playback — coming soon" className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border border-spyne-border bg-spyne-surface px-2 py-1 text-[10.5px] font-semibold transition-colors hover:border-spyne-primary" style={{ color: 'var(--spyne-text-secondary)' }}><MaterialSymbol name="play_circle" size={12} /> Listen</button>
              <button title="Full transcript — coming soon" className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border border-spyne-border bg-spyne-surface px-2 py-1 text-[10.5px] font-semibold transition-colors hover:border-spyne-primary" style={{ color: 'var(--spyne-text-secondary)' }}><MaterialSymbol name="notes" size={12} /> Transcript</button>
            </div>
          </div>
          <p className="text-[12px] italic leading-snug" style={{ color: 'var(--spyne-text-secondary)' }}>“{item.source_message}”</p>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <Assignee userId={item.assignee_user_id} />
          <span className="ml-auto text-[10px]" style={{ color: 'var(--spyne-text-muted)' }}>SLA {intent?.sla_hours ?? '?'}h</span>
        </div>
      </div>

      {/* Actions */}
      {askingAssign ? (
        <div className="border-t border-spyne-border px-3.5 py-2.5">
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>Assign to</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(USERS).filter(([id]) => id !== 'vini_agent').map(([id, u]) => (
              <button key={id} onClick={() => onAssign(id)} className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border border-spyne-border px-2 py-1 text-[11px] font-medium transition-colors hover:border-spyne-primary" style={{ color: 'var(--spyne-text-secondary)' }}>
                <span className="flex size-4 items-center justify-center rounded-full text-[7.5px] font-bold" style={{ background: 'var(--spyne-primary-soft)', color: 'var(--spyne-primary)' }}>{u.initials}</span>
                {u.name}
              </button>
            ))}
            <button onClick={onCancelAssign} className="ml-auto text-[11px] font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Cancel</button>
          </div>
        </div>
      ) : askingIncorrect ? (
        <div className="border-t border-spyne-border px-3.5 py-2.5">
          <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--spyne-text-muted)' }}>Why is this incorrect?</p>
          <div className="flex flex-wrap gap-1.5">
            {INCORRECT_REASONS.map((r) => (
              <button key={r.value} onClick={() => onMarkIncorrect(r.value)} className="spyne-focus-ring rounded-lg border border-spyne-border px-2 py-1 text-[11px] font-medium transition-colors hover:border-spyne-primary" style={{ color: 'var(--spyne-text-secondary)' }}>{r.label}</button>
            ))}
            <button onClick={onCancelIncorrect} className="spyne-focus-ring ml-auto rounded text-[11px] font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t border-spyne-border px-3.5 py-2.5">
          <button onClick={onResolve} className="spyne-btn-primary !h-8 flex-1 justify-center !text-[12.5px]"><MaterialSymbol name="check_circle" size={14} /> Resolve</button>
          <button onClick={onAskAssign} className="spyne-btn-secondary !h-8 !text-[12px]"><MaterialSymbol name="person_add" size={13} /> Assign</button>
          <button onClick={onAskIncorrect} className="spyne-btn-secondary !h-8 !text-[12px]"><MaterialSymbol name="flag" size={13} /> Incorrect</button>
        </div>
      )}
    </div>
  )
}

/* ── Resolved tab ────────────────────────────────────────────────── */

function ResolvedList({ items }) {
  if (items.length === 0) return (
    <div className="spyne-card">
      <EmptyState glyph="task_alt" title="No resolved items yet" helper="Items you clear from the queue land here." />
    </div>
  )
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => {
        const cust = CUSTOMERS[it.customer_id]
        return (
          <div key={it.action_item_id} className="spyne-card flex flex-wrap items-center gap-2 p-3">
            <span className="inline-flex" style={{ color: 'var(--spyne-success-text)' }}><MaterialSymbol name="check_circle" size={14} /></span>
            <IntentBadge intentId={it.intent_id} />
            <span className="text-[13px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>{cust?.name ?? it.customer_id}</span>
            <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: 'var(--spyne-text-secondary)' }}>{it.resolution_note ?? it.intent_recap}</span>
            <span className="text-[10.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{it.assignee_user_id ? `by ${USERS[it.assignee_user_id]?.name ?? 'Unknown'}` : ''}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Incorrect tab (the AI-correction feedback loop — no longer a black hole) ── */

const INCORRECT_REASON_LABEL = Object.fromEntries(INCORRECT_REASONS.map((r) => [r.value, r.label]))

function IncorrectList({ items, onUndo }) {
  if (items.length === 0) return (
    <div className="spyne-card">
      <EmptyState glyph="flag" title="Nothing flagged incorrect" helper="When VINI mis-reads a conversation, flag it here — it's excluded from the closure rate and helps the model improve." />
    </div>
  )
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11.5px]" style={{ color: 'var(--spyne-text-muted)' }}>{items.length} flagged incorrect — excluded from the closure rate. Restore any that were flagged in error.</p>
      {items.map((it) => {
        const cust = CUSTOMERS[it.customer_id]
        return (
          <div key={it.action_item_id} className="spyne-card flex flex-wrap items-center gap-2 p-3">
            <span className="inline-flex" style={{ color: 'var(--spyne-warning-ink)' }}><MaterialSymbol name="flag" size={14} /></span>
            <IntentBadge intentId={it.intent_id} />
            <span className="text-[13px] font-bold" style={{ color: 'var(--spyne-text-primary)' }}>{cust?.name ?? it.customer_id}</span>
            <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: 'var(--spyne-text-secondary)' }}>{it.intent_recap}</span>
            {it.incorrect_reason && (
              <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-ink)' }}>{INCORRECT_REASON_LABEL[it.incorrect_reason] ?? it.incorrect_reason}</span>
            )}
            <button onClick={() => onUndo(it.action_item_id)} className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border border-spyne-border px-2 py-1 text-[11px] font-semibold transition-colors hover:border-spyne-primary" style={{ color: 'var(--spyne-primary)' }}>
              <MaterialSymbol name="undo" size={12} /> Restore
            </button>
          </div>
        )
      })}
    </div>
  )
}
