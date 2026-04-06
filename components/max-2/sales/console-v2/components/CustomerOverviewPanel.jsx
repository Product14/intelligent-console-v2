"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { SpyneLineTab, SpyneLineTabStrip } from '@/components/max-2/spyne-line-tabs'
import { max2Classes } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { CHART_SERIES, SPYNE_DRAWER_SHADOW } from '../spyne-palette'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import ConversationThread from './ConversationThread'

// ── Stage config ───────────────────────────────────────────

const STAGES = [
  { key: 'RESEARCH',    label: 'Just Looking' },
  { key: 'SHOPPING',    label: 'Comparing Options' },
  { key: 'EVALUATION',  label: 'Ready to Visit' },
  { key: 'NEGOTIATION', label: 'Talking Numbers' },
  { key: 'CLOSING',     label: 'Ready to Buy' },
]

const STAGE_LABELS = Object.fromEntries(STAGES.map(s => [s.key, s.label]))

const STAGE_BADGE_CLASS = {
  CLOSING:     'spyne-badge-brand',
  NEGOTIATION: 'spyne-badge-brand',
  EVALUATION:  'spyne-badge-warning',
  SHOPPING:    'spyne-badge-neutral',
  RESEARCH:    'spyne-badge-neutral',
}

const SOURCE_BADGE_CLASS = {
  'Internet Lead': 'spyne-badge-info',
  'Phone Lead':    'spyne-badge-success',
  'Email Lead':    'spyne-badge-brand',
  'Walk-in':       'spyne-badge-warning',
  'Referral':      'spyne-badge-neutral',
  'Online Scheduler': 'spyne-badge-info',
  'Service Campaign': 'spyne-badge-brand',
}

// AI opener per stage — salesperson reads this before calling
const AI_OPENERS = {
  RESEARCH:    'Lead is early stage — don\'t push. Lead with curiosity: ask what brought them in and what they\'re driving today. Goal is to get them talking, not to close.',
  SHOPPING:    'Actively comparing options. Offer a concrete side-by-side vs their likely alternative. Ask what\'s most important — price, payment, or features. Don\'t discount yet.',
  EVALUATION:  'Ready to visit. Confirm the appointment and pre-sell the experience. Mention a specific vehicle you\'ve set aside. Give them a reason to show up.',
  NEGOTIATION: 'In numbers. Come with a clear best offer and one back-pocket concession. Don\'t open with discounts — let them make the first move. Have trade-in research ready.',
  CLOSING:     'Ready to buy. Don\'t oversell. Confirm delivery timeline, F&I process, and any open items. Remove friction — they\'ve already decided.',
}

// Channel filter tabs
const CHANNEL_FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'sms',         label: 'SMS' },
  { id: 'call',        label: 'Calls' },
  { id: 'appointment', label: 'Appointments' },
  { id: 'agent_action', label: 'Action Items' },
]

// ── Helpers ────────────────────────────────────────────────

function avatarBg(name = '') {
  const colors = CHART_SERIES
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[h]
}

// ── Left column components ─────────────────────────────────

function AiOpener({ stage }) {
  const text = AI_OPENERS[stage] || AI_OPENERS.RESEARCH
  return (
    <div style={{
      borderLeft: '3px solid var(--spyne-brand)',
      border: '1px solid var(--spyne-brand-muted)',
      borderLeft: '3px solid var(--spyne-brand)',
      borderRadius: 'var(--spyne-radius-md)',
      background: 'var(--spyne-brand-subtle)',
      padding: '10px 12px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--spyne-brand)', marginBottom: 6,
      }}>
        <MaterialSymbol name="auto_awesome" size={11} />Lead with this
      </div>
      <p style={{ fontSize: 12, color: 'var(--spyne-text-primary)', lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}

function StageProgress({ current }) {
  const currentIdx = STAGES.findIndex(s => s.key === current)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {STAGES.map((stage, i) => {
        const isActive = stage.key === current
        const isPast   = i < currentIdx
        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', position: 'relative' }}>
            {/* Connecting line */}
            {i < STAGES.length - 1 && (
              <div style={{
                position: 'absolute', left: 5, top: 20, width: 2, height: 16,
                background: isPast || isActive ? 'var(--spyne-brand)' : 'var(--spyne-border)',
                zIndex: 0,
              }} />
            )}
            {/* Dot */}
            <div style={{
              width: 12, height: 12, borderRadius: '50%', flexShrink: 0, zIndex: 1,
              background: isActive ? 'var(--spyne-brand)' : isPast ? 'var(--spyne-brand)' : 'var(--spyne-border)',
              border: isActive ? '2px solid var(--spyne-brand)' : isPast ? 'none' : '2px solid var(--spyne-border-strong)',
              boxShadow: isActive ? '0 0 0 3px var(--spyne-brand-subtle)' : 'none',
              opacity: isPast ? 0.45 : 1,
            }} />
            {/* Label */}
            <span style={{
              fontSize: 12,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? 'var(--spyne-brand)' : isPast ? 'var(--spyne-text-muted)' : 'var(--spyne-text-secondary)',
            }}>
              {stage.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function SignalRow({ label, value, warning }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--spyne-text-muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: warning ? 'var(--spyne-warning-text)' : 'var(--spyne-text-primary)' }}>
        {value}
        {warning && <span style={{ marginLeft: 5, fontSize: 11 }}>⚠</span>}
      </span>
    </div>
  )
}

// ── Right column: filtered thread ─────────────────────────

function FilteredThread({ timeline, filter }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <p style={{ fontSize: 13, color: 'var(--spyne-text-muted)' }}>No conversation history yet.</p>
      </div>
    )
  }

  const filtered = filter === 'all'
    ? timeline
    : timeline.filter(e => e.type === filter)

  // Sort newest first (highest sortKey first), then group by day label
  const sorted = [...filtered].sort((a, b) => b.sortKey - a.sortKey)

  // Group into day buckets (use timestamp string as rough day key)
  const groups = []
  let lastDay = null
  sorted.forEach(entry => {
    const day = entry.dayLabel || entry.timestamp?.split(' ')[0] || 'Earlier'
    if (day !== lastDay) {
      groups.push({ day, entries: [] })
      lastDay = day
    }
    groups[groups.length - 1].entries.push(entry)
  })

  return (
    <div>
      {groups.map((group, gi) => (
        <div key={gi}>
          {/* Day separator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 0 8px', position: 'sticky', top: 0,
            background: 'var(--spyne-surface)', zIndex: 2,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--spyne-border)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
              {group.day}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--spyne-border)' }} />
          </div>
          <ConversationThread timeline={group.entries} />
        </div>
      ))}
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────

export default function CustomerOverviewPanel({ customer, onClose, onViewProfile, inline = false }) {
  const [channelFilter, setChannelFilter] = useState('all')

  if (!customer) return null

  const stageCls = STAGE_BADGE_CLASS[customer.buyingStage] || STAGE_BADGE_CLASS.RESEARCH
  const srcCls   = SOURCE_BADGE_CLASS[customer.source] || SOURCE_BADGE_CLASS.Referral

  const trendColor =
    customer.engagementTrend === 'improving' ? 'var(--spyne-success-text)' :
    customer.engagementTrend === 'cooling'   ? 'var(--spyne-danger-text)'  : 'var(--spyne-text-muted)'
  const trendSymbol =
    customer.engagementTrend === 'improving' ? 'trending_up' :
    customer.engagementTrend === 'cooling'   ? 'trending_down' : 'trending_flat'

  const vehicleWarning = customer.vehicleDaysOnLot > 30
  const vehicleLabel = customer.vehicle
    ? `${customer.vehicle}${vehicleWarning ? ` · ${customer.vehicleDaysOnLot}d on lot` : ''}`
    : '—'

  const inner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >

      {/* ── Fixed header ── */}
      <div style={{
        flexShrink: 0,
        padding: '16px 20px 14px',
        borderBottom: '1px solid var(--spyne-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
            style={{ width: 42, height: 42, fontSize: 14, background: avatarBg(customer.name) }}
          >
            {customer.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <p className={max2Classes.pageTitle}>{customer.name}</p>
                <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 1 }}>
                  Last interacted · {customer.lastInteracted}
                </p>
              </div>
              <button
                onClick={onClose}
                className="spyne-btn-ghost"
                style={{ padding: '4px 6px', height: 28, flexShrink: 0, border: '1px solid var(--spyne-border)' }}
                aria-label="Close panel"
              >
                <MaterialSymbol name="close" size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span className={cn('spyne-badge', stageCls)}>
                {customer.serviceStageLabel || STAGE_LABELS[customer.buyingStage] || customer.buyingStage}
              </span>
              <span className={cn('spyne-badge', srcCls)}>
                {customer.source}
              </span>
              <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{customer.salesperson}</span>
            </div>
          </div>
        </div>

        {/* Engagement trend inline under header */}
        {customer.engagementDetail && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
            <MaterialSymbol name={trendSymbol} size={14} style={{ color: trendColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: trendColor }}>{customer.engagementDetail}</span>
          </div>
        )}
      </div>

      {/* ── Two-column body ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, minWidth: 0 }}>

        {/* LEFT COL: 260px, independently scrollable */}
        <div style={{
          width: 260, flexShrink: 0,
          borderRight: '1px solid var(--spyne-border)',
          overflowY: 'auto',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>

          {/* AI Opener */}
          <AiOpener stage={customer.buyingStage} />

          {/* Buying Stage */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--spyne-text-muted)', marginBottom: 10 }}>
              Buying Stage
            </p>
            <StageProgress current={customer.buyingStage} />
          </div>

          {/* Key Signals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--spyne-text-muted)' }}>
              Key Signals
            </p>
            {customer.budget && <SignalRow label="Budget" value={customer.budget} />}
            {customer.financeType && <SignalRow label="Finance" value={customer.financeType} />}
            {customer.vehicle && (
              <SignalRow
                label="Vehicle Interest"
                value={vehicleLabel}
                warning={vehicleWarning}
              />
            )}
            {customer.lastSignal && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--spyne-text-muted)' }}>
                  Last Signal
                </span>
                <p style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>
                  "{customer.lastSignal}"
                </p>
              </div>
            )}
          </div>

          {/* Next Appointment */}
          {customer.nextAppointment && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--spyne-text-muted)', marginBottom: 8 }}>
                Next Appointment
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px',
                background: 'var(--spyne-warning-subtle)',
                border: '1px solid var(--spyne-warning-muted)',
                borderRadius: 8,
              }}>
                <MaterialSymbol name="event" size={12} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
                    {customer.nextAppointment.type}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--spyne-warning-text)', opacity: 0.8 }}>
                    {customer.nextAppointment.date}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: conversation thread, flex-1, scrollable */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Channel filter tabs — sticky at top of right col */}
          <div
            style={{
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              background: 'var(--spyne-surface)',
              zIndex: 3,
            }}
            className="px-4 pt-2.5"
          >
            <SpyneLineTabStrip embedded compact className="min-w-0 overflow-x-auto">
              {CHANNEL_FILTERS.map((f) => (
                <SpyneLineTab
                  key={f.id}
                  active={channelFilter === f.id}
                  onClick={() => setChannelFilter(f.id)}
                  className="shrink-0 whitespace-nowrap"
                >
                  {f.label}
                </SpyneLineTab>
              ))}
            </SpyneLineTabStrip>
          </div>

          {/* Scrollable thread */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
            <FilteredThread timeline={customer.timeline} filter={channelFilter} />
          </div>
        </div>
      </div>

      {/* ── Fixed footer ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', gap: 8,
        padding: '12px 20px',
        borderTop: '1px solid var(--spyne-border)',
        minWidth: 0,
      }}>
        <a
          href={`tel:${customer.phone?.replace(/\D/g, '')}`}
          className="spyne-btn-secondary"
          style={{ flex: 1, minWidth: 0, justifyContent: 'center', textDecoration: 'none', height: 40 }}
        >
          <MaterialSymbol name="phone" size={13} />Call Now
        </a>
        <button
          onClick={onViewProfile}
          className="spyne-btn-primary"
          style={{ flex: 1, minWidth: 0, justifyContent: 'center', height: 40 }}
        >
          View Full Profile <MaterialSymbol name="arrow_forward" size={12} />
        </button>
      </div>
    </div>
  )

  /* ── Inline split-pane mode (table view) ── */
  if (inline) {
    return (
      <div style={{ height: '100%', background: 'var(--spyne-surface)' }}>
        {inner}
      </div>
    )
  }

  /* ── Overlay mode — portaled to body so `position: fixed` is viewport-relative.
      Ancestors with `transform` (e.g. `.spyne-animate-fade-in`) otherwise create a
      containing block and fake “margins” around the scrim and drawer. ── */
  const overlay = (
    <div className="console-v2-sales-root max2-spyne">
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', zIndex: 59 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(720px, 100%)',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        background: 'var(--spyne-surface)',
        borderLeft: '1px solid var(--spyne-border)',
        boxShadow: SPYNE_DRAWER_SHADOW,
        zIndex: 60,
        animation: 'spyne-slide-in-right 200ms cubic-bezier(0.0,0,0.2,1) both',
      }}>
        {inner}
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(overlay, document.body)
}
