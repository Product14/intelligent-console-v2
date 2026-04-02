"use client"

import { X, Phone, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import ConversationThread from './ConversationThread'

const STAGE_LABELS = {
  RESEARCH:    'Just Looking',
  SHOPPING:    'Comparing Options',
  EVALUATION:  'Ready to Visit',
  NEGOTIATION: 'Talking Numbers',
  CLOSING:     'Ready to Buy',
}

const STAGE_STYLE = {
  CLOSING:     { bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',          border: 'var(--spyne-brand-muted)' },
  NEGOTIATION: { bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',          border: 'var(--spyne-brand-muted)' },
  EVALUATION:  { bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)',   border: 'var(--spyne-warning-muted)' },
  SHOPPING:    { bg: 'var(--spyne-border)',          color: 'var(--spyne-text-secondary)', border: 'var(--spyne-border-strong)' },
  RESEARCH:    { bg: 'var(--spyne-border)',          color: 'var(--spyne-text-secondary)', border: 'var(--spyne-border-strong)' },
}

const SOURCE_STYLE = {
  'Internet Lead': { bg: 'var(--spyne-info-subtle)',    color: 'var(--spyne-info-text)',      border: 'var(--spyne-info-muted)' },
  'Phone Lead':    { bg: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)',   border: 'var(--spyne-success-muted)' },
  'Email Lead':    { bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',           border: 'var(--spyne-brand-muted)' },
  'Walk-in':       { bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)',   border: 'var(--spyne-warning-muted)' },
  'Referral':      { bg: 'var(--spyne-border)',          color: 'var(--spyne-text-secondary)', border: 'var(--spyne-border-strong)' },
}

export default function CustomerOverviewPanel({ customer, onClose, onViewProfile, inline = false }) {
  if (!customer) return null

  const ss  = STAGE_STYLE[customer.buyingStage]  || STAGE_STYLE.RESEARCH
  const src = SOURCE_STYLE[customer.source] || SOURCE_STYLE['Referral']

  const trendBg =
    customer.engagementTrend === 'improving' ? 'var(--spyne-success-subtle)' :
    customer.engagementTrend === 'cooling'   ? 'var(--spyne-danger-subtle)'  : 'var(--spyne-bg)'
  const trendColor =
    customer.engagementTrend === 'improving' ? 'var(--spyne-success-text)' :
    customer.engagementTrend === 'cooling'   ? 'var(--spyne-danger-text)'  : 'var(--spyne-text-muted)'
  const TrendIcon =
    customer.engagementTrend === 'improving' ? TrendingUp :
    customer.engagementTrend === 'cooling'   ? TrendingDown : Minus

  const inner = (
    <>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--spyne-border)',
          flexShrink: 0,
        }}
      >
        <div
          className={`${customer.avatarColor} flex items-center justify-center rounded-full text-white font-bold flex-shrink-0`}
          style={{ width: 40, height: 40, fontSize: 13 }}
        >
          {customer.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <p className="spyne-heading" style={{ color: 'var(--spyne-text-primary)' }}>{customer.name}</p>
              <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 1 }}>
                Last interacted · {customer.lastInteracted}
              </p>
            </div>
            <button
              onClick={onClose}
              className="spyne-btn-ghost"
              style={{ padding: '4px 6px', height: 28, flexShrink: 0 }}
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span className="spyne-badge" style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}>
              {STAGE_LABELS[customer.buyingStage]}
            </span>
            <span className="spyne-badge" style={{ background: src.bg, color: src.color, borderColor: src.border }}>
              {customer.source}
            </span>
            <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{customer.salesperson}</span>
          </div>
        </div>
      </div>

      {/* ── Engagement trend ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          background: trendBg,
          borderBottom: '1px solid var(--spyne-border)',
          flexShrink: 0,
        }}
      >
        <TrendIcon size={12} style={{ color: trendColor, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: trendColor }}>{customer.engagementDetail}</span>
      </div>

      {/* ── Key signals ── */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--spyne-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {customer.budget && (
            <>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{customer.budget}</span>
              <span style={{ fontSize: 11, color: 'var(--spyne-border-strong)' }}>·</span>
            </>
          )}
          <span style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>{customer.financeType}</span>
          <span style={{ fontSize: 11, color: 'var(--spyne-border-strong)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>{customer.vehicle}</span>
          {customer.vehicleDaysOnLot > 30 && (
            <span style={{ fontSize: 11, color: 'var(--spyne-warning-text)', fontWeight: 600 }}>
              ⚠ {customer.vehicleDaysOnLot}d on lot
            </span>
          )}
        </div>

        {customer.lastSignal && (
          <p style={{ fontSize: 11, color: 'var(--spyne-text-muted)', fontStyle: 'italic', marginTop: 4 }}>
            "{customer.lastSignal}"
          </p>
        )}

        {customer.nextAppointment && (
          <div
            style={{
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 10px',
              background: 'var(--spyne-warning-subtle)',
              border: '1px solid var(--spyne-warning-muted)',
              borderRadius: 8,
            }}
          >
            <Calendar size={12} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
              {customer.nextAppointment.type} · {customer.nextAppointment.date}
            </span>
          </div>
        )}
      </div>

      {/* ── Conversation thread label ── */}
      <div style={{ padding: '10px 16px 4px', flexShrink: 0 }}>
        <p className="spyne-subheading">Conversation History</p>
      </div>

      {/* ── Scrollable thread ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
        <ConversationThread timeline={customer.timeline} />
      </div>

      {/* ── Footer CTAs ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid var(--spyne-border)',
          flexShrink: 0,
        }}
      >
        <a
          href={`tel:${customer.phone.replace(/\D/g, '')}`}
          className="spyne-btn-secondary"
          style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
        >
          <Phone size={13} />
          Call Now
        </a>
        <button
          onClick={onViewProfile}
          className="spyne-btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          View Full Profile
        </button>
      </div>
    </>
  )

  /* ── Inline split-pane mode ── */
  if (inline) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--spyne-surface)' }}>
        {inner}
      </div>
    )
  }

  /* ── Overlay mode (fallback) ── */
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', zIndex: 30 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: 100,
          right: 0,
          bottom: 0,
          width: 520,
          background: 'var(--spyne-surface)',
          borderLeft: '1px solid var(--spyne-border)',
          zIndex: 35,
          display: 'flex',
          flexDirection: 'column',
          animation: 'spyne-slide-in-right 200ms cubic-bezier(0.0,0,0.2,1) both',
        }}
      >
        {inner}
      </div>
    </>
  )
}
