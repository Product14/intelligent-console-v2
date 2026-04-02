"use client"

import { useState } from 'react'
import { Phone, MessageSquare, Eye, ArrowRight, Calendar, Zap, Package, Star, X, Sparkles, LayoutList, Columns } from 'lucide-react'

const QUEUE = [
  {
    id: '1', type: 'urgent', priority: 'HIGH', initials: 'SD', name: 'Sarah Delgado',
    phone: '+1 (555) 234-7890', stageLabel: 'Ready to Buy', stageCls: 'hot',
    vehicle: '2024 Toyota Camry XSE', category: 'New', price: '$31,200', daysOnLot: null,
    due: 'Today',
    reason: 'Confirmed $450/mo budget and loved the Camry XSE. Agent hit ceiling — she\'s ready to close.',
    opener: 'Confirmed $450/mo, loved the Camry XSE — lead with the rate and Midnight Black availability. She\'s comparing with another dealer.',
    action: 'call',
  },
  {
    id: '2', type: 'urgent', priority: 'HIGH', initials: 'MW', name: 'Marcus Webb',
    phone: '+1 (555) 891-3344', stageLabel: 'Ready to Visit', stageCls: 'warm',
    vehicle: '2023 Honda CR-V EX-L', category: 'New', price: '$36,500', daysOnLot: null,
    due: 'Today',
    reason: 'Went cold 3 weeks ago. Re-engaged this morning — don\'t lead with price. Ask what changed.',
    opener: 'Marcus went cold after a price pushback. He just re-engaged — don\'t lead with price. Lead with new inventory and current incentives. Ask what changed.',
    action: 'convo',
  },
  {
    id: '3', type: 'appointment', priority: 'MEDIUM', initials: 'DT', name: 'Diana Torres',
    phone: '+1 (555) 447-2291', stageLabel: 'Ready to Visit', stageCls: 'warm',
    vehicle: '2024 Toyota RAV4 XLE', category: 'New', price: '$33,800', daysOnLot: null,
    apptTime: 'Tomorrow, 2:00 PM',
    due: 'Tomorrow',
    reason: 'Appointment tomorrow. Comparing RAV4 vs CR-V — came in once before. Prep the side-by-side.',
    opener: 'Appointment tomorrow at 2 PM. She\'s been comparing RAV4 vs CR-V. Have the side-by-side ready. This visit is decision-making, not discovery.',
    action: 'prep',
  },
  {
    id: '4', type: 'lot-match', priority: 'MEDIUM', initials: 'JW', name: 'James Whitfield',
    phone: '+1 (555) 670-5512', stageLabel: 'Comparing Options', stageCls: 'cool',
    vehicle: '2022 Chevrolet Tahoe LT', category: 'Used', price: '$52,900', daysOnLot: 47,
    due: 'This week',
    reason: '3-row SUV + $650/mo budget matches a Tahoe on lot 47 days. Moves aging inventory and protects margin.',
    opener: 'James wants a 3-row SUV for under $650/mo. The Tahoe LT has been on lot 47 days — use that as a lever. Lead with availability and what you can do today.',
    action: 'reach',
  },
  {
    id: '5', type: 'standard', priority: 'NORMAL', initials: 'KP', name: 'Kevin Park',
    phone: '+1 (555) 219-8830', stageLabel: 'Talking Numbers', stageCls: 'hot',
    vehicle: '2023 Honda Accord Sport', category: 'New', price: '$30,400', daysOnLot: null,
    due: 'Today',
    reason: 'Asked to speak directly. Wants to discuss trade-in — 2019 Accord, ~$8K equity. Come prepared.',
    opener: 'Kevin asked to talk directly. He wants to discuss trade-in — 2019 Accord, ~$8K equity. Have KBB pulled up before the call.',
    action: 'call',
  },
  {
    id: '6', type: 'high-value', priority: 'HIGH', initials: 'FA', name: 'Fleet Auto Group',
    phone: '+1 (555) 730-1100', stageLabel: 'Talking Numbers', stageCls: 'hot',
    vehicle: '2024 Ford Transit 150', category: 'New', price: '$46,000', daysOnLot: null,
    due: 'Today',
    reason: 'Fleet inquiry — 12 commercial vehicles. Wants a dedicated contact. Don\'t delegate this one.',
    opener: 'Fleet inquiry for 12 commercial vehicles. They want a dedicated point of contact — don\'t hand this off. Have fleet pricing and financing ready.',
    action: 'context',
  },
]

const OUTCOMES = ['Appointment set', 'VM left', 'Needs follow-up', 'Not interested']

const OUTCOME_BADGE = {
  'Appointment set': 'spyne-badge-success',
  'VM left':         'spyne-badge-warning',
  'Needs follow-up': 'spyne-badge-info',
  'Not interested':  'spyne-badge-neutral',
}

const OUTCOME_LABEL = {
  'Appointment set': '✓ Appt Set',
  'VM left':         '✓ VM Left',
  'Needs follow-up': '✓ Follow-up',
  'Not interested':  '✓ Not Interested',
}

const PRIORITY_CONFIG = {
  HIGH:   { dot: '#EF4444', label: 'High',   order: 0 },
  MEDIUM: { dot: '#F59E0B', label: 'Med',    order: 1 },
  NORMAL: { dot: '#94A3B8', label: 'Normal', order: 2 },
}

function StageBadge({ label, cls }) {
  const styles = {
    hot:  { background: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand)',        border: '1px solid var(--spyne-brand-muted)' },
    warm: { background: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)', border: '1px solid var(--spyne-warning-muted)' },
    cool: { background: 'var(--spyne-border)',         color: 'var(--spyne-text-secondary)', border: '1px solid var(--spyne-border-strong)' },
  }
  return <span className="spyne-badge" style={styles[cls]}>{label}</span>
}

function TypeBadge({ type }) {
  if (type === 'urgent')     return <span className="spyne-badge spyne-badge-warning"><Zap size={9} />Re-engaged</span>
  if (type === 'lot-match')  return <span className="spyne-badge spyne-badge-info"><Package size={9} />Lot Match</span>
  if (type === 'high-value') return <span className="spyne-badge spyne-badge-brand"><Star size={9} />High Value</span>
  if (type === 'appointment') return <span className="spyne-badge spyne-badge-neutral"><Calendar size={9} />Appointment</span>
  return null
}

function ActionButton({ action, onClick }) {
  const configs = {
    call:    { label: 'Call Now',        icon: <Phone size={12} />,        cls: 'spyne-btn-primary' },
    convo:   { label: 'Pick Up Convo',   icon: <MessageSquare size={12} />, cls: 'spyne-btn-secondary' },
    prep:    { label: 'View Prep',       icon: <Eye size={12} />,           cls: 'spyne-btn-secondary' },
    reach:   { label: 'Reach Out',       icon: <ArrowRight size={12} />,    cls: 'spyne-btn-secondary' },
    context: { label: 'View Context',    icon: <Eye size={12} />,           cls: 'spyne-btn-ghost' },
  }
  const { label, icon, cls } = configs[action]
  return (
    <button className={cls} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {icon}{label}
    </button>
  )
}

function QueueCard({ card, isActive, onOpen, resolved, outcome }) {
  const accentBorder = {
    'urgent':     '3px solid var(--spyne-warning)',
    'lot-match':  '3px solid var(--spyne-info)',
    'high-value': '3px solid var(--spyne-brand)',
  }[card.type]

  if (resolved) {
    return (
      <div className="spyne-card flex flex-col" style={{ opacity: 0.75 }}>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--spyne-success)', color: '#fff' }}>✓</div>
              <span className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)' }}>{card.name}</span>
            </div>
            <span className={`spyne-badge ${OUTCOME_BADGE[outcome]}`}>{OUTCOME_LABEL[outcome]}</span>
          </div>
          <div style={{ marginLeft: 40 }}><StageBadge label={card.stageLabel} cls={card.stageCls} /></div>
          <div className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--spyne-success)', marginTop: 1 }} />
            <span style={{ fontWeight: 500, color: 'var(--spyne-text-secondary)' }}>{card.vehicle}</span>
            <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
            <span>{card.category}</span>
            <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{card.price}</span>
          </div>
        </div>
        <div className="px-4 py-2.5 border-t" style={{ borderColor: 'var(--spyne-border)' }}>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Logged {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · <strong style={{ color: 'var(--spyne-text-secondary)', fontWeight: 500 }}>Dravid Roy</strong>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`spyne-card-interactive flex flex-col${isActive ? ' active-action-card' : ''}`}
      style={accentBorder ? { borderLeft: accentBorder } : {}}
      onClick={onOpen}
    >
      <div className="flex flex-col gap-2 flex-1" style={{ padding: accentBorder ? '14px 14px 10px 12px' : '14px 14px 10px' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
              {card.initials}
            </div>
            <span className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)' }}>{card.name}</span>
          </div>
          <TypeBadge type={card.type} />
        </div>
        <div style={{ marginLeft: 40 }}><StageBadge label={card.stageLabel} cls={card.stageCls} /></div>
        <div className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--spyne-success)', marginTop: 1 }} />
          <span style={{ fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{card.vehicle}</span>
          <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
          <span>{card.category}</span>
          <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{card.price}</span>
          {card.daysOnLot && (
            <>
              <span style={{ color: 'var(--spyne-border-strong)' }}>·</span>
              <span style={{ fontWeight: 600, color: 'var(--spyne-warning-text)' }}>{card.daysOnLot} days on lot ⚠</span>
            </>
          )}
        </div>
        {card.apptTime && (
          <div className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 600, color: 'var(--spyne-warning-text)' }}>
            <Calendar size={11} />{card.apptTime}
          </div>
        )}
        <p className="spyne-body-sm flex-1" style={{ color: 'var(--spyne-text-secondary)' }}>{card.reason}</p>
      </div>
      <div
        className="flex items-center justify-end border-t"
        style={{ borderColor: 'var(--spyne-border)', padding: accentBorder ? '10px 14px 10px 12px' : '10px 14px' }}
      >
        <ActionButton action={card.action} onClick={onOpen} />
      </div>
    </div>
  )
}

function TableView({ queue, onOpen }) {
  const [sortKey, setSortKey] = useState('priority')

  const sorted = [...queue].sort((a, b) => {
    if (sortKey === 'priority') return PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order
    if (sortKey === 'due') return a.due.localeCompare(b.due)
    return 0
  })

  return (
    <div className="spyne-card overflow-hidden">
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--spyne-border)', background: 'var(--spyne-bg)' }}>
              {[
                { key: 'priority', label: 'Priority' },
                { key: null,       label: 'Type' },
                { key: null,       label: 'Customer' },
                { key: null,       label: 'Vehicle' },
                { key: null,       label: 'Action Required' },
                { key: 'due',      label: 'Due' },
                { key: null,       label: 'Stage' },
                { key: null,       label: '' },
              ].map(({ key, label }) => (
                <th
                  key={label}
                  onClick={() => key && setSortKey(key)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    color: sortKey === key ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                    cursor: key ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {label}{sortKey === key ? ' ↓' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((card, i) => {
              const pc = PRIORITY_CONFIG[card.priority]
              return (
                <tr
                  key={card.id}
                  onClick={() => onOpen(card)}
                  style={{
                    borderBottom: '1px solid var(--spyne-border)',
                    background: i % 2 === 0 ? 'var(--spyne-surface)' : 'var(--spyne-bg)',
                    cursor: 'pointer',
                    transition: 'background 100ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--spyne-brand-subtle)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--spyne-surface)' : 'var(--spyne-bg)' }}
                >
                  {/* Priority */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1.5">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: pc.dot, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: pc.dot }}>{pc.label}</span>
                    </div>
                  </td>
                  {/* Type */}
                  <td style={{ padding: '10px 14px' }}><TypeBadge type={card.type} /></td>
                  {/* Customer */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
                        {card.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{card.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>{card.phone}</div>
                      </div>
                    </div>
                  </td>
                  {/* Vehicle */}
                  <td style={{ padding: '10px 14px', minWidth: 160 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--spyne-text-primary)' }}>{card.vehicle}</div>
                    <div className="flex items-center gap-1.5" style={{ marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{card.price}</span>
                      {card.daysOnLot && (
                        <span style={{ fontSize: 11, color: 'var(--spyne-warning-text)', fontWeight: 600 }}>⚠ {card.daysOnLot}d on lot</span>
                      )}
                    </div>
                  </td>
                  {/* Action Required */}
                  <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                    <p style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {card.reason}
                    </p>
                  </td>
                  {/* Due */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: card.due === 'Today' ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)' }}>
                      {card.due}
                    </span>
                  </td>
                  {/* Stage */}
                  <td style={{ padding: '10px 14px' }}>
                    <StageBadge label={card.stageLabel} cls={card.stageCls} />
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '10px 14px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <a href={`tel:${card.phone.replace(/\D/g, '')}`} className="spyne-btn-ghost" style={{ padding: '4px 8px', height: 28 }} aria-label="Call">
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

function SwimlaneView({ queue, onOpen }) {
  const groups = [
    { key: 'HIGH',   label: 'High Priority',  color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    { key: 'MEDIUM', label: 'Medium',          color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
    { key: 'NORMAL', label: 'Normal',          color: '#94A3B8', bg: 'var(--spyne-bg)', border: 'var(--spyne-border)' },
  ]

  return (
    <div className="space-y-6">
      {groups.map(({ key, label, color, bg, border }) => {
        const cards = queue.filter((c) => c.priority === key)
        if (cards.length === 0) return null
        return (
          <div key={key}>
            <div
              className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg"
              style={{ background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${color}` }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
              <span
                style={{
                  minWidth: 20, height: 20, borderRadius: 'var(--spyne-radius-pill)',
                  padding: '0 6px', background: color, color: '#fff',
                  fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {cards.length}
              </span>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {cards.map((card) => (
                <QueueCard key={card.id} card={card} isActive={false} onOpen={() => onOpen(card)} resolved={false} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Panel({ card, onClose, onSave }) {
  const [selected, setSelected] = useState(null)
  if (!card) return null

  return (
    <>
      <div className="fixed inset-0" style={{ background: 'rgba(15,23,42,0.25)', zIndex: 59 }} onClick={onClose} />
      <div
        className="fixed bottom-0 right-0 flex flex-col"
        style={{
          top: 0,
          width: 420,
          background: 'var(--spyne-surface)',
          borderLeft: '1px solid var(--spyne-border)',
          boxShadow: '-4px 0 32px rgba(79,70,229,0.12)',
          zIndex: 60,
          overflowY: 'auto',
        }}
      >
        <div className="flex flex-col gap-2 p-4" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
              {card.initials}
            </div>
            <span className="spyne-heading flex-1" style={{ fontSize: 15 }}>{card.name}</span>
            <button
              className="spyne-btn-ghost"
              style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--spyne-border)' }}
              onClick={onClose} aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>
          <div className="spyne-caption" style={{ marginLeft: 42, color: 'var(--spyne-text-secondary)' }}>{card.phone}</div>
          <div style={{ marginLeft: 42 }}><StageBadge label={card.stageLabel} cls={card.stageCls} /></div>
        </div>

        <div className="p-4" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div style={{
            borderLeft: '3px solid var(--spyne-brand)',
            borderTop: '1px solid var(--spyne-brand-muted)',
            borderRight: '1px solid var(--spyne-brand-muted)',
            borderBottom: '1px solid var(--spyne-brand-muted)',
            borderRadius: 'var(--spyne-radius-md)',
            background: 'var(--spyne-brand-subtle)',
            padding: '12px 14px',
          }}>
            <div className="flex items-center gap-1.5 mb-2"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--spyne-brand)' }}>
              <Sparkles size={11} />Lead with this
            </div>
            <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.6 }}>{card.opener}</p>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <a href={`tel:${card.phone.replace(/\D/g, '')}`} className="spyne-btn-primary w-full justify-center" style={{ height: 40 }}>
            <Phone size={14} />Call Now
          </a>
          <button className="spyne-btn-secondary w-full justify-center" style={{ height: 38 }}>
            View Full Profile<ArrowRight size={12} />
          </button>
        </div>

        <div className="p-4">
          <p className="spyne-subheading mb-3">Log what happened</p>
          <div className="flex flex-col gap-2">
            {OUTCOMES.map((o) => (
              <div
                key={o} onClick={() => setSelected(o)}
                className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
                style={{
                  borderRadius: 'var(--spyne-radius-md)',
                  border: selected === o ? '1.5px solid var(--spyne-brand)' : '1.5px solid var(--spyne-border)',
                  background: selected === o ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                  transition: 'all 150ms',
                }}
              >
                <div style={{
                  width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                  border: selected === o ? '4.5px solid var(--spyne-brand)' : '1.5px solid var(--spyne-border-strong)',
                  transition: 'all 150ms',
                }} />
                <span className="spyne-label" style={{ color: selected === o ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)', fontWeight: selected === o ? 600 : 500 }}>
                  {o}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="spyne-btn-primary"
              style={{ opacity: selected ? 1 : 0.35, pointerEvents: selected ? 'auto' : 'none' }}
              onClick={() => { if (selected) onSave(selected) }}
            >
              Save outcome<ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ActionItemsPage({ sidebarCollapsed }) {
  const [activeTab, setActiveTab]   = useState('act')
  const [view, setView]             = useState('table')
  const [activeCard, setActiveCard] = useState(null)
  const [filter, setFilter]         = useState('All')
  const [resolved, setResolved]     = useState({})
  const [actQueue, setActQueue]     = useState(QUEUE)
  const [doneQueue, setDoneQueue]   = useState([])
  const [toast, setToast]           = useState(null)

  function openPanel(card) { setActiveCard(card) }
  function closePanel()    { setActiveCard(null) }

  function saveOutcome(outcome) {
    const card = activeCard
    setResolved(r => ({ ...r, [card.id]: outcome }))
    setActQueue(q => q.filter(c => c.id !== card.id))
    setDoneQueue(d => [{ ...card, outcome }, ...d])
    closePanel()
    setToast('Outcome logged — moved to Done Today')
    setTimeout(() => setToast(null), 3200)
  }

  const filtered = (list) => {
    if (filter === 'New')  return list.filter(c => c.category === 'New')
    if (filter === 'Used') return list.filter(c => c.category === 'Used')
    return list
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <h1 className="spyne-title">Action Items</h1>
        <span
          className="flex items-center justify-center font-bold leading-none"
          style={{
            minWidth: 22, height: 22, borderRadius: 'var(--spyne-radius-pill)',
            padding: '0 6px', background: 'var(--spyne-brand)', color: 'var(--spyne-brand-on)', fontSize: 11,
          }}
        >
          {actQueue.length}
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
          {['Intent', 'Priority'].map(f => (
            <button key={f} className="spyne-pill" style={{ fontSize: 12, height: 30 }}>
              {f} <span style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>▾</span>
            </button>
          ))}
          <div className="flex" style={{ border: '1px solid var(--spyne-border)', borderRadius: 'var(--spyne-radius-pill)', overflow: 'hidden' }}>
            {['All', 'New', 'Used'].map(f => (
              <button
                key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '0 14px', height: 30, fontSize: 12, border: 'none', cursor: 'pointer',
                  background: filter === f ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                  color: filter === f ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                  fontWeight: filter === f ? 600 : 500, fontFamily: 'inherit',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-5" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
        {[
          { id: 'act',  label: 'To Act On',  count: actQueue.length },
          { id: 'done', label: 'Done Today',  count: doneQueue.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); closePanel() }}
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

      {/* To Act On */}
      {activeTab === 'act' && (
        filtered(actQueue).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div style={{ width: 52, height: 52, borderRadius: 'var(--spyne-radius-lg)', background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} />
            </div>
            <p className="spyne-heading">Queue is clear</p>
            <p className="spyne-body-sm" style={{ maxWidth: 260 }}>Vini is working the leads. When one is ready for a human touch, it'll show up here.</p>
          </div>
        ) : view === 'table' ? (
          <TableView queue={filtered(actQueue)} onOpen={openPanel} />
        ) : (
          <SwimlaneView queue={filtered(actQueue)} onOpen={openPanel} />
        )
      )}

      {/* Done Today */}
      {activeTab === 'done' && (
        doneQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div style={{ width: 52, height: 52, borderRadius: 'var(--spyne-radius-lg)', background: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              ✓
            </div>
            <p className="spyne-heading">Nothing logged yet</p>
            <p className="spyne-body-sm" style={{ maxWidth: 260 }}>When you log an outcome on a lead, it shows up here. Vini keeps working the rest.</p>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {filtered(doneQueue).map(card => (
              <QueueCard key={card.id} card={card} isActive={false} onOpen={() => {}} resolved={true} outcome={card.outcome} />
            ))}
          </div>
        )
      )}

      <Panel card={activeCard} onClose={closePanel} onSave={saveOutcome} />

      {toast && (
        <div
          className="fixed flex items-center gap-2 spyne-label"
          style={{
            bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--spyne-text-primary)', color: '#fff',
            padding: '10px 18px', borderRadius: 'var(--spyne-radius-md)',
            boxShadow: 'var(--spyne-shadow-lg)', zIndex: 200, whiteSpace: 'nowrap',
          }}
        >
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
