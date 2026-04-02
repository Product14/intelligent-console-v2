"use client"

import { useState } from 'react'
import {
  Phone, MessageSquare, ArrowRight, Calendar,
  LayoutList, Columns, Clock, CheckCircle, AlertCircle,
  Car, DollarSign, ChevronDown, Search, Sparkles, X
} from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────

const TODAY_APPTS = [
  {
    id: '1', type: 'appointment', time: '10:00 – 11:00 AM', timeStart: 10.0, timeEnd: 11.0,
    customer: 'Rob Pattinson', phone: '+1 (555) 312-4490',
    agentAction: 'Outgoing Call by Emily', budget: '$10,000 – $20,000', vehicle: '2016 Mazda CX-5',
    status: 'started', statusLabel: 'Started 3 hours ago', due: 'Today',
  },
  {
    id: '2', type: 'close-deal', time: '12:30 – 1:00 PM', timeStart: 12.5, timeEnd: 13.0,
    customer: 'Rob Pattinson', phone: '+1 (555) 312-4490',
    agentAction: 'Outgoing Call by Emily', budget: '$10,000 – $20,000', vehicle: '2016 Mazda CX-5',
    status: 'showed-up', statusLabel: 'Showed up', due: 'Today',
  },
  {
    id: '3', type: 'test-drive', time: '12:30 – 1:00 PM', timeStart: 12.5, timeEnd: 13.0,
    customer: 'Rob Pattinson', phone: '+1 (555) 312-4490',
    agentAction: 'Outgoing Call by Emily', budget: '$10,000 – $20,000', vehicle: '2016 Mazda CX-5',
    status: 'starts-soon', statusLabel: 'Starts in 10 mins', due: 'Today',
  },
  {
    id: '4', type: 'test-drive', time: '1:30 – 2:00 PM', timeStart: 13.5, timeEnd: 14.0,
    customer: 'Emma Stone', phone: '+1 (555) 678-2210',
    agentAction: 'Incoming Call from John', budget: '$15,000 – $25,000', vehicle: '2018 Honda CR-V',
    status: 'upcoming', statusLabel: 'Starts in 1 hour', due: 'Today',
  },
  {
    id: '5', type: 'negotiation', time: '1:30 – 2:00 PM', timeStart: 13.5, timeEnd: 14.0,
    customer: 'Emma Stone', phone: '+1 (555) 678-2210',
    agentAction: 'Incoming Call from John', budget: '$15,000 – $25,000', vehicle: '2018 Honda CR-V',
    status: 'upcoming', statusLabel: 'Starts in 1 hour', due: 'Today',
  },
  {
    id: '6', type: 'pickup', time: '1:30 – 2:00 PM', timeStart: 13.5, timeEnd: 14.0,
    customer: 'Emma Stone', phone: '+1 (555) 678-2210',
    agentAction: 'Incoming Call from John', budget: '$15,000 – $25,000', vehicle: '2018 Honda CR-V',
    status: 'upcoming', statusLabel: 'Starts in 1 hour', due: 'Today',
  },
  {
    id: '7', type: 'negotiation', time: '2:00 – 2:30 PM', timeStart: 14.0, timeEnd: 14.5,
    customer: 'Daniel Craig', phone: '+1 (555) 901-3344',
    agentAction: 'Email Sent by Sarah', budget: '$20,000 – $30,000', vehicle: '2020 Toyota RAV4',
    status: 'upcoming', statusLabel: 'Starts in 1 hour', due: 'Today',
  },
  {
    id: '8', type: 'test-drive', time: '3:00 – 3:30 PM', timeStart: 15.0, timeEnd: 15.5,
    customer: 'James Carter', phone: '+1 (555) 445-7821',
    agentAction: 'Outgoing Call by Marcus', budget: '$25,000 – $35,000', vehicle: '2022 Ford Explorer',
    status: 'upcoming', statusLabel: 'Starts in 2 hours', due: 'Today',
  },
]

const TOMORROW_APPTS = [
  {
    id: 't1', type: 'appointment', time: '10:00 – 11:00 AM', timeStart: 10.0, timeEnd: 11.0,
    customer: 'Sarah Mitchell', phone: '+1 (555) 223-9900',
    agentAction: 'Incoming Call from Jake', budget: '$30,000 – $40,000', vehicle: '2023 Audi Q5',
    status: 'upcoming', statusLabel: 'Tomorrow 10:00 AM', due: 'Tomorrow',
  },
  {
    id: 't2', type: 'test-drive', time: '1:00 – 1:30 PM', timeStart: 13.0, timeEnd: 13.5,
    customer: 'Kevin Walsh', phone: '+1 (555) 551-0032',
    agentAction: 'Outgoing Call by Emily', budget: '$20,000 – $28,000', vehicle: '2021 Chevy Equinox',
    status: 'upcoming', statusLabel: 'Tomorrow 1:00 PM', due: 'Tomorrow',
  },
  {
    id: 't3', type: 'close-deal', time: '3:30 – 4:00 PM', timeStart: 15.5, timeEnd: 16.0,
    customer: 'Diana Torres', phone: '+1 (555) 447-2291',
    agentAction: 'Incoming Call from Marcus', budget: '$33,000 – $38,000', vehicle: '2024 Toyota RAV4 XLE',
    status: 'upcoming', statusLabel: 'Tomorrow 3:30 PM', due: 'Tomorrow',
  },
]

const LATER_APPTS = [
  {
    id: 'l1', type: 'appointment', time: 'Thu · 11:00 AM', timeStart: 11.0, timeEnd: 12.0,
    customer: 'Marcus Webb', phone: '+1 (555) 891-3344',
    agentAction: 'Re-engaged via SMS', budget: '$36,000 – $42,000', vehicle: '2023 Honda CR-V EX-L',
    status: 'upcoming', statusLabel: 'Thu, Apr 4', due: 'This week',
  },
  {
    id: 'l2', type: 'negotiation', time: 'Fri · 2:00 PM', timeStart: 14.0, timeEnd: 14.5,
    customer: 'Fleet Auto Group', phone: '+1 (555) 730-1100',
    agentAction: 'Outgoing Call by Sarah', budget: 'Fleet — 12 vehicles', vehicle: '2024 Ford Transit 150',
    status: 'upcoming', statusLabel: 'Fri, Apr 5', due: 'This week',
  },
  {
    id: 'l3', type: 'test-drive', time: 'Fri · 4:00 PM', timeStart: 16.0, timeEnd: 16.5,
    customer: 'Amanda Chen', phone: '+1 (555) 334-8812',
    agentAction: 'Incoming Call from Jake', budget: '$22,000 – $30,000', vehicle: '2022 Honda CR-V',
    status: 'upcoming', statusLabel: 'Fri, Apr 5', due: 'This week',
  },
]

const PAST_APPTS = [
  {
    id: 'p1', type: 'appointment', time: 'Yesterday · 10:00 AM',
    customer: 'Lisa Chang', phone: '+1 (555) 229-4401',
    agentAction: 'Outgoing Call by Marcus', budget: '$25,000 – $32,000', vehicle: '2021 Mazda CX-5',
    status: 'showed-up', statusLabel: 'Completed', due: 'Yesterday', outcome: 'Test drive done',
  },
  {
    id: 'p2', type: 'test-drive', time: 'Yesterday · 2:00 PM',
    customer: 'James Wilson', phone: '+1 (555) 770-5512',
    agentAction: 'Incoming Call from Emily', budget: '$18,000 – $24,000', vehicle: '2021 Ford F-150',
    status: 'started', statusLabel: 'No show', due: 'Yesterday', outcome: 'No show',
  },
  {
    id: 'p3', type: 'close-deal', time: 'Mon · 3:30 PM',
    customer: 'Rachel Green', phone: '+1 (555) 112-6678',
    agentAction: 'Email Sent by Sarah', budget: '$45,000 – $55,000', vehicle: '2022 Audi Q5',
    status: 'showed-up', statusLabel: 'Completed', due: 'Mon', outcome: 'Deal closed',
  },
]

// ── Calendar config ────────────────────────────────────────

const CAL_SLOTS = [
  { label: '9:00 am', hour: 9.0 },
  { label: '9:30',    hour: 9.5 },
  { label: '10:00',   hour: 10.0 },
  { label: '10:30',   hour: 10.5 },
  { label: '11:00',   hour: 11.0 },
  { label: '11:30',   hour: 11.5 },
  { label: '12:00 pm', hour: 12.0 },
  { label: '12:30',   hour: 12.5 },
  { label: '1:00',    hour: 13.0 },
  { label: '1:30',    hour: 13.5 },
  { label: '2:00',    hour: 14.0 },
  { label: '2:30',    hour: 14.5 },
  { label: '3:00',    hour: 15.0 },
  { label: '3:30',    hour: 15.5 },
  { label: '4:00',    hour: 16.0 },
  { label: '4:30',    hour: 16.5 },
]

// ── Config maps ────────────────────────────────────────────

const TYPE_CONFIG = {
  'appointment': { label: 'Appointment', bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE', accent: '3px solid #4F46E5' },
  'test-drive':  { label: 'Test Drive',  bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', accent: '3px solid #2563EB' },
  'negotiation': { label: 'Negotiation', bg: '#FFF1F2', color: '#E11D48', border: '#FECDD3', accent: '3px solid #E11D48' },
  'close-deal':  { label: 'Close Deal',  bg: '#F8FAFC', color: '#64748B', border: '#CBD5E1', accent: null },
  'pickup':      { label: 'Pickup',      bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', accent: '3px solid #16A34A' },
}

const STATUS_STAGE = {
  'started':     { label: 'In Progress', cls: 'warm' },
  'showed-up':   { label: 'Arrived',     cls: 'hot'  },
  'starts-soon': { label: 'Imminent',    cls: 'warm' },
  'upcoming':    { label: 'Scheduled',   cls: 'cool' },
}

const STATUS_FOOTER = {
  'started':     { icon: <Clock size={11} />,        color: '#94A3B8' },
  'showed-up':   { icon: <CheckCircle size={11} />,  color: '#16A34A' },
  'starts-soon': { icon: <AlertCircle size={11} />,  color: '#E11D48' },
  'upcoming':    { icon: <Clock size={11} />,        color: '#94A3B8' },
}

const SECTION_GROUPS = [
  { key: 'today',    label: 'Today',           color: 'var(--spyne-brand)', bg: 'var(--spyne-brand-subtle)', border: 'var(--spyne-brand-muted)', data: TODAY_APPTS },
  { key: 'tomorrow', label: 'Tomorrow',        color: '#D97706',            bg: '#FFFBEB',                   border: '#FDE68A',                  data: TOMORROW_APPTS },
  { key: 'later',    label: 'Later This Week', color: '#64748B',            bg: 'var(--spyne-bg)',           border: 'var(--spyne-border)',       data: LATER_APPTS },
]

const AI_OPENERS = {
  'appointment':  'Standard appointment — confirm vehicle availability and financing options beforehand. This lead has shown consistent interest. Open with prep.',
  'test-drive':   'Test drive booked — lead is evaluating. Have the car ready and warmed up. Don\'t rush to numbers; let them fall in love with the vehicle first.',
  'negotiation':  'Negotiation in progress — lead knows their budget. Come with a clear best offer and back-pocket incentive. Don\'t open with discounts.',
  'close-deal':   'Ready to close — lead has confirmed intent. Have all paperwork staged. Lead with availability of delivery date, not price.',
  'pickup':       'Vehicle pickup — congratulations. Make it memorable. Verify all documents are signed, detail is complete, and tank is full.',
}

// ── Helpers ────────────────────────────────────────────────

function getInitials(name) {
  const p = name.trim().split(' ')
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

// ── Shared badges ──────────────────────────────────────────

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG['appointment']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, borderRadius: 99,
      padding: '2px 8px', whiteSpace: 'nowrap',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

function StageBadge({ label, cls }) {
  const styles = {
    hot:  { background: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',          border: '1px solid var(--spyne-brand-muted)' },
    warm: { background: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)',   border: '1px solid var(--spyne-warning-muted)' },
    cool: { background: 'var(--spyne-border)',         color: 'var(--spyne-text-secondary)', border: '1px solid var(--spyne-border-strong)' },
  }
  return <span className="spyne-badge" style={styles[cls] || styles.cool}>{label}</span>
}

// ── Appointment Detail Panel ───────────────────────────────

function AppointmentDetailPanel({ appt, onClose }) {
  const cfg    = TYPE_CONFIG[appt.type] || TYPE_CONFIG['appointment']
  const stage  = STATUS_STAGE[appt.status] || STATUS_STAGE['upcoming']
  const footer = STATUS_FOOTER[appt.status] || STATUS_FOOTER['upcoming']
  const initials = getInitials(appt.customer)
  const opener = AI_OPENERS[appt.type] || AI_OPENERS['appointment']

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', zIndex: 59 }}
      />
      {/* Slide-in panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 420,
        display: 'flex', flexDirection: 'column',
        background: 'var(--spyne-surface)',
        borderLeft: '1px solid var(--spyne-border)',
        boxShadow: '-4px 0 32px rgba(79,70,229,0.12)',
        zIndex: 60,
        overflow: 'hidden',
      }}>
      {/* Sticky header */}
      <div style={{ flexShrink: 0, padding: '14px 16px 12px', borderBottom: '1px solid var(--spyne-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, flexShrink: 0,
            background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="spyne-heading" style={{ fontSize: 15, color: 'var(--spyne-text-primary)' }}>{appt.customer}</div>
            <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 1 }}>{appt.phone}</div>
          </div>
          <button
            onClick={onClose}
            className="spyne-btn-ghost"
            style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--spyne-border)', flexShrink: 0 }}
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>

        {/* Type + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, marginLeft: 50 }}>
          <TypeBadge type={appt.type} />
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#475569',
            background: '#F1F5F9', borderRadius: 6, padding: '2px 6px',
          }}>
            {appt.time}
          </span>
        </div>

        {/* Stage badge */}
        <div style={{ marginTop: 6, marginLeft: 50 }}>
          <StageBadge label={stage.label} cls={stage.cls} />
        </div>
      </div>

      {/* Key signals */}
      <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid var(--spyne-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
            <ArrowRight size={11} style={{ flexShrink: 0, color: 'var(--spyne-text-muted)' }} />
            {appt.agentAction}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
            <DollarSign size={11} style={{ flexShrink: 0, color: 'var(--spyne-text-muted)' }} />
            {appt.budget}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
            <Car size={11} style={{ flexShrink: 0, color: 'var(--spyne-text-muted)' }} />
            {appt.vehicle}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            {footer.icon}
            <span style={{ color: footer.color, fontWeight: appt.status === 'showed-up' || appt.status === 'starts-soon' ? 600 : 400 }}>
              {appt.statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* AI opener */}
      <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid var(--spyne-border)' }}>
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
            <Sparkles size={11} />Lead with this
          </div>
          <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.6 }}>
            {opener}
          </p>
        </div>
      </div>

      {/* Conversation thread placeholder */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--spyne-radius-lg)',
          background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MessageSquare size={18} />
        </div>
        <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)', textAlign: 'center', maxWidth: 200 }}>
          Conversation thread will appear here once the appointment is active.
        </p>
      </div>

      {/* Sticky footer */}
      <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: '1px solid var(--spyne-border)', display: 'flex', gap: 8 }}>
        <a
          href={`tel:${(appt.phone || '').replace(/\D/g, '')}`}
          className="spyne-btn-secondary"
          style={{ flex: 1, justifyContent: 'center', height: 40, fontSize: 13 }}
        >
          <Phone size={13} />Call Now
        </a>
        <button className="spyne-btn-primary" style={{ flex: 1, justifyContent: 'center', height: 40, fontSize: 13 }}>
          View Full Profile <ArrowRight size={12} />
        </button>
      </div>
    </div>
    </>
  )
}

// ── Calendar Panel ─────────────────────────────────────────

function CalendarPanel({ appts, onSelect }) {
  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const now = today.getHours() + today.getMinutes() / 60

  const slotMap = {}
  appts.forEach(a => {
    const key = a.timeStart
    if (!slotMap[key]) slotMap[key] = []
    slotMap[key].push(a)
  })

  return (
    <div className="spyne-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: '14px 16px 10px', borderBottom: '1px solid var(--spyne-border)' }}>
        <div className="spyne-label" style={{ color: 'var(--spyne-text-primary)', fontWeight: 700 }}>{dateLabel}</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Today · {appts.length} appointments</div>
      </div>

      {/* Scrollable time slots — fills remaining height */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {CAL_SLOTS.map(slot => {
          const events = slotMap[slot.hour] || []
          const isNow = now >= slot.hour && now < slot.hour + 0.5
          return (
            <div key={slot.hour} style={{ display: 'flex', gap: 8, minHeight: 44 }}>
              <div style={{
                width: 52, fontSize: 10,
                color: isNow ? 'var(--spyne-brand)' : '#94A3B8',
                fontWeight: isNow ? 700 : 400,
                paddingTop: 3, textAlign: 'right', flexShrink: 0,
              }}>
                {slot.label}
              </div>
              <div style={{
                flex: 1, paddingTop: 3,
                borderTop: isNow ? '2px solid var(--spyne-brand)' : '1px solid #F1F5F9',
                display: 'flex', flexWrap: 'wrap', gap: 3, alignContent: 'flex-start',
              }}>
                {events.map(ev => {
                  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG['appointment']
                  return (
                    <span
                      key={ev.id}
                      onClick={() => onSelect && onSelect(ev)}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        fontSize: 10, fontWeight: 600, borderRadius: 6,
                        padding: '2px 6px', whiteSpace: 'nowrap',
                        background: cfg.bg, color: cfg.color,
                        cursor: 'pointer',
                        transition: 'opacity 120ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      {cfg.label} – {ev.customer.split(' ')[0]}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Appointment Card ───────────────────────────────────────

function ApptCard({ appt, onSelect, isPast }) {
  const cfg    = TYPE_CONFIG[appt.type] || TYPE_CONFIG['appointment']
  const stage  = STATUS_STAGE[appt.status] || STATUS_STAGE['upcoming']
  const footer = STATUS_FOOTER[appt.status] || STATUS_FOOTER['upcoming']
  const initials = getInitials(appt.customer)
  const hasAccent = !!cfg.accent

  if (isPast) {
    return (
      <div
        className="spyne-card-interactive flex flex-col"
        style={{ opacity: 0.78 }}
        onClick={() => onSelect && onSelect(appt)}
      >
        <div className="flex flex-col gap-2 flex-1" style={{ padding: '14px 14px 10px' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--spyne-success)', color: '#fff' }}>✓</div>
              <span className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)' }}>{appt.customer}</span>
            </div>
            <TypeBadge type={appt.type} />
          </div>
          <div style={{ marginLeft: 40 }}>
            <span className="spyne-badge" style={{ background: 'var(--spyne-border)', color: 'var(--spyne-text-secondary)', border: '1px solid var(--spyne-border-strong)' }}>
              {appt.outcome}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
            <span style={{ fontWeight: 500 }}>{appt.vehicle}</span>
            <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
            <span>{appt.budget}</span>
          </div>
        </div>
        <div className="px-4 py-2.5 border-t" style={{ borderColor: 'var(--spyne-border)' }}>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{appt.time}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="spyne-card-interactive flex flex-col"
      style={hasAccent ? { borderLeft: cfg.accent } : {}}
      onClick={() => onSelect && onSelect(appt)}
    >
      <div className="flex flex-col gap-2 flex-1" style={{ padding: hasAccent ? '14px 14px 10px 12px' : '14px 14px 10px' }}>
        {/* Row 1: avatar + name + type badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
              {initials}
            </div>
            <span className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)' }}>
              {appt.customer}
            </span>
          </div>
          <TypeBadge type={appt.type} />
        </div>

        {/* Row 2: stage badge */}
        <div style={{ marginLeft: 40 }}>
          <StageBadge label={stage.label} cls={stage.cls} />
        </div>

        {/* Row 3: time */}
        <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', marginLeft: 40 }}>
          <Clock size={11} style={{ flexShrink: 0 }} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{appt.time}</span>
        </div>

        {/* Row 4: meta */}
        <div className="flex flex-col gap-1" style={{ marginLeft: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
            <ArrowRight size={11} style={{ flexShrink: 0 }} />{appt.agentAction}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{appt.vehicle}</span>
            <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
            <span>{appt.budget}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t"
        style={{ borderColor: 'var(--spyne-border)', padding: hasAccent ? '10px 14px 10px 12px' : '10px 14px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: footer.color, fontWeight: appt.status === 'showed-up' || appt.status === 'starts-soon' ? 600 : 400 }}>
          {footer.icon}{appt.statusLabel}
        </div>
        <button
          className="spyne-btn-secondary"
          style={{ fontSize: 11, padding: '4px 10px', height: 26 }}
          onClick={e => { e.stopPropagation(); }}
        >
          View <ArrowRight size={10} />
        </button>
      </div>
    </div>
  )
}

// ── Views ──────────────────────────────────────────────────

function SwimlaneView({ search, isPast, onSelect }) {
  const groups = isPast
    ? [{ key: 'past', label: 'Past', color: '#64748B', bg: 'var(--spyne-bg)', border: 'var(--spyne-border)', data: PAST_APPTS }]
    : SECTION_GROUPS

  const filterAppts = (appts) => {
    if (!search.trim()) return appts
    const q = search.toLowerCase()
    return appts.filter(a =>
      a.customer.toLowerCase().includes(q) ||
      a.vehicle.toLowerCase().includes(q) ||
      (TYPE_CONFIG[a.type]?.label || '').toLowerCase().includes(q)
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(({ key, label, color, bg, border, data }) => {
        const filtered = filterAppts(data)
        if (filtered.length === 0) return null
        return (
          <div key={key}>
            <div
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg"
              style={{ background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${color}` }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <span style={{
                minWidth: 20, height: 20, borderRadius: 'var(--spyne-radius-pill)',
                padding: '0 6px', background: color, color: '#fff',
                fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {filtered.length}
              </span>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {filtered.map(a => (
                <ApptCard key={a.id} appt={a} isPast={isPast} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TableView({ search, isPast, onSelect }) {
  const allAppts = isPast ? PAST_APPTS : [...TODAY_APPTS, ...TOMORROW_APPTS, ...LATER_APPTS]
  const filtered = search.trim()
    ? allAppts.filter(a =>
        a.customer.toLowerCase().includes(search.toLowerCase()) ||
        a.vehicle.toLowerCase().includes(search.toLowerCase()) ||
        (TYPE_CONFIG[a.type]?.label || '').toLowerCase().includes(search.toLowerCase())
      )
    : allAppts

  return (
    <div className="spyne-card overflow-hidden">
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--spyne-border)', background: 'var(--spyne-bg)' }}>
              {['Type', 'Customer', 'Vehicle', 'Agent Action', 'Time', 'Due', 'Status', ''].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 14px',
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                  color: 'var(--spyne-text-muted)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((appt, i) => {
              const stage  = STATUS_STAGE[appt.status] || STATUS_STAGE['upcoming']
              const initials = getInitials(appt.customer)
              return (
                <tr
                  key={appt.id}
                  onClick={() => onSelect && onSelect(appt)}
                  style={{
                    borderBottom: '1px solid var(--spyne-border)',
                    background: i % 2 === 0 ? 'var(--spyne-surface)' : 'var(--spyne-bg)',
                    cursor: 'pointer', transition: 'background 100ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--spyne-brand-subtle)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--spyne-surface)' : 'var(--spyne-bg)' }}
                >
                  <td style={{ padding: '10px 14px' }}><TypeBadge type={appt.type} /></td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{appt.customer}</div>
                        <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{appt.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', minWidth: 150 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--spyne-text-primary)' }}>{appt.vehicle}</div>
                    <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)', marginTop: 1 }}>{appt.budget}</div>
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 180 }}>
                    <p style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {appt.agentAction}
                    </p>
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{appt.time}</span>
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: appt.due === 'Today' ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)' }}>
                      {appt.due}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <StageBadge label={stage.label} cls={stage.cls} />
                  </td>
                  <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <a href={`tel:${(appt.phone || '').replace(/\D/g, '')}`}
                        className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label="Call">
                        <Phone size={12} />
                      </a>
                      <button className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label="Message">
                        <MessageSquare size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────

export default function AppointmentsPage() {
  const [view, setView]             = useState('cards')
  const [activeTab, setActiveTab]   = useState('upcoming')
  const [search, setSearch]         = useState('')
  const [selectedAppt, setSelectedAppt] = useState(null)

  const upcomingTotal = TODAY_APPTS.length + TOMORROW_APPTS.length + LATER_APPTS.length

  function handleSelect(appt) { setSelectedAppt(appt) }
  function handleClose()      { setSelectedAppt(null) }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ── LEFT: content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Page header */}
        <div className="flex items-center gap-2.5 flex-wrap mb-4">
          <h1 className="spyne-title">My Appointments</h1>
          <span
            className="flex items-center justify-center font-bold leading-none"
            style={{
              minWidth: 22, height: 22, borderRadius: 'var(--spyne-radius-pill)',
              padding: '0 6px', background: 'var(--spyne-brand)', color: 'var(--spyne-brand-on)', fontSize: 11,
            }}
          >
            {upcomingTotal}
          </span>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* View toggle */}
            <div className="flex" style={{ border: '1px solid var(--spyne-border)', borderRadius: 'var(--spyne-radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setView('table')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 12px', height: 30, fontSize: 12, border: 'none', cursor: 'pointer',
                  background: view === 'table' ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                  color: view === 'table' ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                  fontWeight: view === 'table' ? 600 : 500, fontFamily: 'inherit',
                  borderRight: '1px solid var(--spyne-border)',
                }}
              >
                <LayoutList size={12} />Table
              </button>
              <button
                onClick={() => setView('cards')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 12px', height: 30, fontSize: 12, border: 'none', cursor: 'pointer',
                  background: view === 'cards' ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                  color: view === 'cards' ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                  fontWeight: view === 'cards' ? 600 : 500, fontFamily: 'inherit',
                }}
              >
                <Columns size={12} />Cards
              </button>
            </div>

            {/* Filters */}
            {['Type', 'Status'].map(f => (
              <button key={f} className="spyne-pill" style={{ fontSize: 12, height: 30 }}>
                {f} <span style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>▾</span>
              </button>
            ))}

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                className="spyne-input"
                style={{ paddingLeft: 28, width: 160, fontSize: 12, height: 30 }}
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex mb-5" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          {[
            { id: 'upcoming', label: 'Upcoming',          count: upcomingTotal },
            { id: 'past',     label: 'Past Appointments', count: PAST_APPTS.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedAppt(null) }}
              className="flex items-center gap-1.5 pb-2.5 mr-5"
              style={{
                fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 500, border: 'none',
                background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: activeTab === tab.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--spyne-brand)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 150ms, border-color 150ms',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, borderRadius: 'var(--spyne-radius-pill)',
                padding: '0 5px', fontSize: 10, fontWeight: 700,
                background: activeTab === tab.id ? 'var(--spyne-brand-subtle)' : 'var(--spyne-border)',
                color: activeTab === tab.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {view === 'cards'
          ? <SwimlaneView search={search} isPast={activeTab === 'past'} onSelect={handleSelect} />
          : <TableView    search={search} isPast={activeTab === 'past'} onSelect={handleSelect} />
        }
      </div>

      {/* ── RIGHT: calendar (always visible on upcoming tab) ── */}
      {activeTab === 'upcoming' && (
        <div style={{
          width: 280,
          flexShrink: 0,
          position: 'sticky',
          top: 68,
          height: 'calc(100vh - 92px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <CalendarPanel appts={TODAY_APPTS} onSelect={handleSelect} />
        </div>
      )}

      {/* ── OVERLAY: appointment detail panel ── */}
      {selectedAppt && (
        <AppointmentDetailPanel appt={selectedAppt} onClose={handleClose} />
      )}

    </div>
  )
}
