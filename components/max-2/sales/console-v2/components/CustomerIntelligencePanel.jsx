"use client"

/** CustomerIntelligencePanel — the per-lead intelligence brief (memory, intent,
 *  finance, signals, appointment) derived from the customer record. */

import { MaterialSymbol } from '@/components/max-2/material-symbol'

const STAGE_LABEL = {
  RESEARCH: 'Researching',
  SHOPPING: 'Comparing options',
  EVALUATION: 'Ready to visit',
  NEGOTIATION: 'Talking numbers',
  CLOSING: 'Ready to buy',
}

const STAGE_CONFIDENCE = {
  RESEARCH: 0.78, SHOPPING: 0.82, EVALUATION: 0.88, NEGOTIATION: 0.9, CLOSING: 0.94,
}

const STAGE_TIMELINE = {
  RESEARCH: 'Not discussed', SHOPPING: '30–60 days', EVALUATION: 'This week',
  NEGOTIATION: 'This week', CLOSING: 'Now — finalizing',
}

// Same-segment alternate a shopper typically cross-shops, to seed a believable trail.
const SEGMENT_ALT = {
  Camry: { make: 'Honda', model: 'Accord' },
  Accord: { make: 'Toyota', model: 'Camry' },
  Civic: { make: 'Toyota', model: 'Corolla' },
  'RAV4': { make: 'Honda', model: 'CR-V' },
  'CR-V': { make: 'Toyota', model: 'RAV4' },
  Tahoe: { make: 'Chevrolet', model: 'Suburban' },
  Mustang: { make: 'Dodge', model: 'Challenger' },
  Crosstrek: { make: 'Honda', model: 'HR-V' },
  Tacoma: { make: 'Ford', model: 'Ranger' },
  Q5: { make: 'BMW', model: 'X3' },
}

const BODY_TYPE = {
  Camry: 'Sedan', Accord: 'Sedan', Civic: 'Sedan', Corolla: 'Sedan',
  RAV4: 'SUV', 'CR-V': 'SUV', 'HR-V': 'SUV', Crosstrek: 'SUV', Q5: 'SUV', X3: 'SUV',
  Tahoe: 'SUV', Suburban: 'SUV', Mustang: 'Coupe', Challenger: 'Coupe',
  Tacoma: 'Truck', Ranger: 'Truck',
}

// Makes whose name is two words — matched before the single-token make fallback.
const MULTI_WORD_MAKES = ['Land Rover', 'Alfa Romeo', 'Aston Martin', 'Rolls Royce', 'Mercedes Benz']

/** Parse "2024 Toyota Camry XSE" → {year, make, model, trim}. Tolerates a
 *  missing year and two-word makes; never returns a model that swallowed the make. */
function parseVehicle(s) {
  if (!s || typeof s !== 'string') return {}
  let rest = s.trim()
  let year
  const ym = rest.match(/^(\d{4})\s+(.*)$/)
  if (ym) {
    year = Number(ym[1])
    rest = ym[2]
  }
  let make
  const mw = MULTI_WORD_MAKES.find((m) => rest.toLowerCase().startsWith(m.toLowerCase() + ' '))
  if (mw) {
    make = mw
    rest = rest.slice(mw.length).trim()
  } else {
    const parts = rest.split(/\s+/)
    make = parts.shift()
    rest = parts.join(' ')
  }
  const parts = rest.split(/\s+/).filter(Boolean)
  const model = parts.shift()
  const trim = parts.length ? parts.join(' ') : undefined
  return { year, make, model, trim }
}

/** Map a customer record into the API-shaped intelligence brief. */
export function deriveCustomerIntelligence(c) {
  const v = parseVehicle(c.vehicle)
  const alt = v.model && SEGMENT_ALT[v.model]
  const stage = c.buyingStage || 'RESEARCH'
  const booked = c.swimlaneStage === 'APPOINTMENT_BOOKED'

  const motivations = []
  if (c.useCase) motivations.push(c.useCase)
  if (v.model) motivations.push(`Focused on the ${[v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')}`)
  if (c.lastSignal) motivations.push(c.lastSignal)

  const objections = []
  if (c.notes && /(compet|another dealer|autonation|across town|comparing)/i.test(c.notes)) {
    objections.push('Cross-shopping another dealer')
  }

  const doNotRepeat = []
  if (c.budget) doNotRepeat.push(`Budget confirmed (${c.budget}) — don't re-ask`)
  if (booked || c.nextAppointment) doNotRepeat.push('Appointment intent already captured')

  const watched = []
  if (v.model) watched.push({ ...v, price: c.vehiclePrice, daysOnLot: c.vehicleDaysOnLot, lastEngaged: c.lastInteracted || c.lastContact, inStock: true })
  if (alt) watched.push({ year: v.year, make: alt.make, model: alt.model, lastEngaged: 'earlier' })

  return {
    memory: c.lastInteractionSummary || c.conversationOpener || 'No conversation memory yet.',
    motivations,
    objections,
    doNotRepeat,
    purchaseIntent: {
      stage,
      confidence: STAGE_CONFIDENCE[stage] ?? 0.8,
      timelineToBuy: STAGE_TIMELINE[stage] ?? 'Not discussed',
      interestStrength: c.temperature === 'HOT' ? 'high' : c.temperature === 'COLD' ? 'low' : 'medium',
    },
    finance: {
      budget: c.budget || null,
      paymentMethod: /cash/i.test(c.financeType || '') ? 'CASH' : c.financeType ? 'FINANCE' : 'NOT_DISCUSSED',
    },
    vehicleSignals: {
      makes: [v.make, alt?.make].filter(Boolean),
      models: [v.model, alt?.model].filter(Boolean),
      bodyTypes: [BODY_TYPE[v.model], alt && BODY_TYPE[alt.model]].filter(Boolean),
      years: v.year ? [String(v.year)] : [],
      trims: v.trim ? [v.trim] : [],
    },
    featurePreference: c.features || [],
    watchedOtherVehicles: watched,
    tradeVehicles: c.tradeIn ? [c.tradeIn] : [],
    appointment: {
      promisedToBook: Boolean(c.nextAppointment) || booked,
      // Booked is the confirmed state; show its date when we have one, but never
      // leave a booked customer reading as merely "promised".
      bookedOn: booked ? (c.nextAppointment?.date ?? 'Scheduled') : null,
    },
    engagement: {
      lastContacted: c.lastInteracted || c.lastContact || null,
      touchCount: c.touchCount ?? null,
    },
    persona: `${(c.temperature || 'WARM').toLowerCase()} · ${STAGE_LABEL[stage]}`,
  }
}

/* ── UI bits ─────────────────────────────────────────────────────── */

function Chips({ items, bg, color }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {items.map((it, i) => (
        <span key={i} style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 8, background: bg, color }}>{it}</span>
      ))}
    </div>
  )
}

function SubLabel({ children }) {
  return <p className="spyne-caption" style={{ marginBottom: 4 }}>{children}</p>
}

export function CustomerIntelligencePanel({ customer }) {
  const intel = deriveCustomerIntelligence(customer)
  const pct = Math.round(intel.purchaseIntent.confidence * 100)

  return (
    <div
      style={{
        padding: '14px 14px',
        background: 'var(--spyne-surface)',
        border: '1px solid var(--spyne-border)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--spyne-text-muted)' }}>{intel.persona}</span>
      </div>

      {/* Conversation memory */}
      <div>
        <SubLabel>Conversation memory</SubLabel>
        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--spyne-text-primary)' }}>{intel.memory}</p>
        <Chips items={intel.motivations} bg="var(--spyne-success-subtle)" color="var(--spyne-success-text)" />
        <Chips items={intel.objections} bg="var(--spyne-warning-subtle)" color="var(--spyne-warning-text)" />
        {intel.doNotRepeat.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--spyne-text-muted)' }}>Do not repeat</span>
            <Chips items={intel.doNotRepeat} bg="var(--spyne-danger-subtle)" color="var(--spyne-danger-text)" />
          </div>
        )}
      </div>

      {/* Purchase intent */}
      <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 12 }}>
        <SubLabel>Purchase intent</SubLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="spyne-badge spyne-badge-brand">{STAGE_LABEL[intel.purchaseIntent.stage]}</span>
          <span style={{ fontSize: 11, color: 'var(--spyne-text-muted)' }}>confidence</span>
          <div style={{ width: 84, height: 6, borderRadius: 999, background: 'var(--spyne-border)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--spyne-success)' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--spyne-text-primary)' }}>{pct}%</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--spyne-text-muted)' }}>timeline: <strong style={{ color: 'var(--spyne-text-secondary)' }}>{intel.purchaseIntent.timelineToBuy}</strong></span>
        </div>
      </div>

      {/* Finance + trade */}
      <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
        <div>
          <SubLabel>Payment</SubLabel>
          <p className="spyne-label">
            {intel.finance.budget ? `${intel.finance.budget} · ` : ''}
            <span style={{ color: intel.finance.paymentMethod === 'CASH' ? 'var(--spyne-success-text)' : 'var(--spyne-text-primary)' }}>{intel.finance.paymentMethod.replace('_', ' ').toLowerCase()}</span>
          </p>
        </div>
        <div>
          <SubLabel>Trade-in</SubLabel>
          {intel.tradeVehicles.length > 0 ? (
            <p className="spyne-label">{intel.tradeVehicles.map((t) => (typeof t === 'string' ? t : [t.year, t.make, t.model].filter(Boolean).join(' '))).join(', ')}</p>
          ) : (
            <p className="spyne-label" style={{ color: 'var(--spyne-text-muted)' }}>None on file</p>
          )}
        </div>
      </div>

      {/* Considered vehicles (browsing trail) */}
      {intel.watchedOtherVehicles.length > 0 && (
        <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 12 }}>
          <SubLabel>Considered vehicles</SubLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {intel.watchedOtherVehicles.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--spyne-text-muted)', display: 'inline-flex' }}><MaterialSymbol name="directions_car" size={14} /></span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{[w.year, w.make, w.model, w.trim].filter(Boolean).join(' ')}</span>
                {w.inStock && <span className="spyne-badge spyne-badge-success" style={{ fontSize: 9.5 }}>In stock</span>}
                {w.price ? <span style={{ fontSize: 11, color: 'var(--spyne-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>${w.price.toLocaleString()}</span> : null}
                {w.lastEngaged && <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--spyne-text-muted)' }}>viewed {w.lastEngaged}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle signals */}
      <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 12 }}>
        <SubLabel>Signals</SubLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <SignalGroup label="Makes" items={intel.vehicleSignals.makes} />
          <SignalGroup label="Models" items={intel.vehicleSignals.models} />
          <SignalGroup label="Body" items={intel.vehicleSignals.bodyTypes} />
          {intel.featurePreference.length > 0 && <SignalGroup label="Features" items={intel.featurePreference} />}
        </div>
      </div>

      {/* Appointment intent + engagement */}
      <div style={{ borderTop: '1px solid var(--spyne-border)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ color: intel.appointment.bookedOn ? 'var(--spyne-success-text)' : intel.appointment.promisedToBook ? 'var(--spyne-warning-text)' : 'var(--spyne-text-muted)', display: 'inline-flex' }}><MaterialSymbol name="event_available" size={14} /></span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
          {intel.appointment.bookedOn ? `Booked · ${intel.appointment.bookedOn}` : intel.appointment.promisedToBook ? 'Promised to book' : 'No appointment yet'}
        </span>
        {intel.engagement.lastContacted && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--spyne-text-muted)' }}>
            last contacted {intel.engagement.lastContacted}{intel.engagement.touchCount != null ? ` · ${intel.engagement.touchCount} touches` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

function SignalGroup({ label, items }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--spyne-text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
        {items.map((it, i) => (
          <span key={i} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 7, background: 'var(--spyne-page-bg)', color: 'var(--spyne-text-secondary)' }}>{it}</span>
        ))}
      </div>
    </div>
  )
}
