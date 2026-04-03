"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Phone, MessageSquare, X, Car, DollarSign, Sparkles, Wrench } from 'lucide-react'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { SPYNE, SPYNE_SOFT_BG } from '../spyne-palette'
import { SERVICE_CONSOLE_TAB_CONTENT } from '@/lib/max-2/service-console-tab-content'

// ── Mock data (2 weeks) ───────────────────────────────────────

const WEEK_DATA = [
  {
    weekLabel: 'Mar 31 – Apr 6',
    days: [
      {
        key: 'mon-mar31', dayLabel: 'Mon', date: 'Mar 31', isToday: false,
        appts: [
          { id: 'a1', type: 'test-drive',  timeStart: 10.0, timeEnd: 11.0, customer: 'Robert Kim',    phone: '+1 (555) 112-3344', vehicle: '2024 Toyota Highlander XLE', budget: '$42,000',       agentAction: 'Vini AI confirmed appointment', status: 'upcoming' },
          { id: 'a2', type: 'negotiation', timeStart: 14.0, timeEnd: 14.5, customer: 'Nina Patel',    phone: '+1 (555) 877-2200', vehicle: '2023 Subaru Outback XT',    budget: '$35,000',       agentAction: 'Inbound inquiry via Cars.com', status: 'upcoming' },
        ],
      },
      {
        key: 'tue-apr1', dayLabel: 'Tue', date: 'Apr 1', isToday: false,
        appts: [
          { id: 'b1', type: 'close-deal',  timeStart: 9.0,  timeEnd: 10.0, customer: 'Alex Turner',  phone: '+1 (555) 334-9910', vehicle: '2023 Honda CR-V EX-L AWD', budget: '$37,500 OTD',  agentAction: 'OTD price confirmed by customer', status: 'upcoming' },
          { id: 'b2', type: 'test-drive',  timeStart: 11.0, timeEnd: 12.0, customer: 'Claire Wong',  phone: '+1 (555) 662-7711', vehicle: '2024 Mazda CX-5 Turbo',    budget: '$38,000',       agentAction: 'Vini AI booked test drive', status: 'upcoming' },
          { id: 'b3', type: 'negotiation', timeStart: 15.0, timeEnd: 15.5, customer: 'Ryan Brooks',  phone: '+1 (555) 990-4412', vehicle: '2022 Jeep Wrangler Sport',  budget: '$45,000',       agentAction: 'Price comparison requested', status: 'upcoming' },
        ],
      },
      {
        key: 'wed-apr2', dayLabel: 'Wed', date: 'Apr 2', isToday: false,
        appts: [],
      },
      {
        key: 'thu-apr3', dayLabel: 'Thu', date: 'Apr 3', isToday: true,
        appts: [
          { id: '1', type: 'test-drive',  timeStart: 9.0,  timeEnd: 10.0, customer: 'Sarah Delgado',  phone: '+1 (555) 312-4490', vehicle: '2025 Toyota Camry XSE · Midnight Black', budget: '$450/mo',     agentAction: 'Vini AI confirmed appointment', status: 'started' },
          { id: '2', type: 'negotiation', timeStart: 10.5, timeEnd: 11.0, customer: 'Marcus Webb',    phone: '+1 (555) 891-3344', vehicle: '2023 Honda CR-V EX-L',                  budget: '$36,500',     agentAction: 'Inbound call — price discussion pending', status: 'upcoming' },
          { id: '3', type: 'test-drive',  timeStart: 12.5, timeEnd: 13.0, customer: 'Jessica Parker', phone: '+1 (555) 678-9901', vehicle: '2024 Ford Mustang GT · Race Red',        budget: '$42,000',     agentAction: 'Vini AI booked test drive', status: 'upcoming' },
          { id: '4', type: 'close-deal',  timeStart: 12.5, timeEnd: 13.5, customer: 'Maria Torres',   phone: '+1 (555) 234-5678', vehicle: '2023 Honda CR-V EX-L AWD',              budget: '$35,900 OTD', agentAction: 'Paperwork requested by customer', status: 'upcoming' },
          { id: '5', type: 'test-drive',  timeStart: 14.0, timeEnd: 14.5, customer: 'Emma Stone',     phone: '+1 (555) 678-2210', vehicle: '2018 Honda CR-V',                       budget: '$15,000 – $25,000', agentAction: 'Outgoing SMS by Vini', status: 'upcoming' },
          { id: '6', type: 'negotiation', timeStart: 15.0, timeEnd: 15.5, customer: 'Daniel Craig',   phone: '+1 (555) 901-3344', vehicle: '2020 Toyota RAV4',                      budget: '$20,000 – $30,000', agentAction: 'Email sent by Vini', status: 'upcoming' },
          { id: '7', type: 'pickup',      timeStart: 16.5, timeEnd: 17.0, customer: 'James Carter',   phone: '+1 (555) 445-7821', vehicle: '2022 Ford Explorer',                    budget: '$25,000 – $35,000', agentAction: 'Outgoing call by Marcus', status: 'upcoming' },
        ],
      },
      {
        key: 'fri-apr4', dayLabel: 'Fri', date: 'Apr 4', isToday: false,
        appts: [
          { id: 't1', type: 'test-drive',  timeStart: 10.0, timeEnd: 11.0, customer: 'Sarah Mitchell', phone: '+1 (555) 223-9900', vehicle: '2023 Audi Q5',          budget: '$30,000 – $40,000', agentAction: 'Incoming call from Jake', status: 'upcoming' },
          { id: 't2', type: 'negotiation', timeStart: 13.0, timeEnd: 13.5, customer: 'Kevin Walsh',    phone: '+1 (555) 551-0032', vehicle: '2021 Chevy Equinox',     budget: '$20,000 – $28,000', agentAction: 'Outgoing call by Vini', status: 'upcoming' },
          { id: 't3', type: 'close-deal',  timeStart: 15.5, timeEnd: 16.0, customer: 'Diana Torres',   phone: '+1 (555) 447-2291', vehicle: '2024 Toyota RAV4 XLE',  budget: '$33,000 – $38,000', agentAction: 'Incoming call from Marcus', status: 'upcoming' },
        ],
      },
      {
        key: 'sat-apr5', dayLabel: 'Sat', date: 'Apr 5', isToday: false,
        appts: [
          { id: 's1', type: 'test-drive', timeStart: 10.0, timeEnd: 11.0, customer: 'Jessica Parker', phone: '+1 (555) 678-9901', vehicle: '2024 Ford Mustang GT', budget: '$42,000', agentAction: 'Vini AI confirmed', status: 'upcoming' },
        ],
      },
      {
        key: 'sun-apr6', dayLabel: 'Sun', date: 'Apr 6', isToday: false,
        appts: [],
      },
    ],
  },
  {
    weekLabel: 'Apr 7 – Apr 13',
    days: [
      {
        key: 'mon-apr7', dayLabel: 'Mon', date: 'Apr 7', isToday: false,
        appts: [
          { id: 'w2a', type: 'test-drive',  timeStart: 9.5,  timeEnd: 10.5, customer: 'Lena Fischer',  phone: '+1 (555) 321-6677', vehicle: '2024 BMW X3 xDrive30i', budget: '$55,000',       agentAction: 'Vini AI confirmed test drive', status: 'upcoming' },
          { id: 'w2b', type: 'close-deal',  timeStart: 14.0, timeEnd: 15.0, customer: 'Tom Bradley',   phone: '+1 (555) 883-4420', vehicle: '2023 Ford F-150 XLT',   budget: '$50,000 OTD',  agentAction: 'Financing approved — ready to sign', status: 'upcoming' },
        ],
      },
      {
        key: 'tue-apr8', dayLabel: 'Tue', date: 'Apr 8', isToday: false,
        appts: [
          { id: 'w2c', type: 'negotiation', timeStart: 11.0, timeEnd: 11.5, customer: 'Amy Santos',    phone: '+1 (555) 776-2201', vehicle: '2024 Hyundai Tucson SEL', budget: '$34,000',     agentAction: 'Lease vs finance comparison pending', status: 'upcoming' },
        ],
      },
      {
        key: 'wed-apr9', dayLabel: 'Wed', date: 'Apr 9', isToday: false,
        appts: [
          { id: 'w2d', type: 'pickup',     timeStart: 10.0, timeEnd: 10.5, customer: 'Brian Moore',   phone: '+1 (555) 440-8833', vehicle: '2022 Honda Accord Sport', budget: '$28,000',      agentAction: 'Vehicle prepped and ready', status: 'upcoming' },
          { id: 'w2e', type: 'test-drive', timeStart: 13.5, timeEnd: 14.5, customer: 'Olivia Nash',   phone: '+1 (555) 119-3305', vehicle: '2024 Kia Telluride SX',   budget: '$48,000',      agentAction: 'Incoming CarGurus lead', status: 'upcoming' },
        ],
      },
      { key: 'thu-apr10', dayLabel: 'Thu', date: 'Apr 10', isToday: false, appts: [] },
      {
        key: 'fri-apr11', dayLabel: 'Fri', date: 'Apr 11', isToday: false,
        appts: [
          { id: 'w2f', type: 'close-deal', timeStart: 15.0, timeEnd: 16.0, customer: 'Carlos Rivera', phone: '+1 (555) 557-9920', vehicle: '2023 Toyota Tacoma TRD',  budget: '$46,000 OTD',  agentAction: 'All docs prepared — finance waiting', status: 'upcoming' },
        ],
      },
      { key: 'sat-apr12', dayLabel: 'Sat', date: 'Apr 12', isToday: false, appts: [] },
      { key: 'sun-apr13', dayLabel: 'Sun', date: 'Apr 13', isToday: false, appts: [] },
    ],
  },
]

// ── Config ────────────────────────────────────────────────────

const TYPE_CONFIG = {
  'test-drive':  { label: 'Test Drive',  color: SPYNE.primary, bg: SPYNE_SOFT_BG.primary },
  'close-deal':  { label: 'Close Deal',  color: SPYNE.success, bg: SPYNE_SOFT_BG.success },
  'negotiation': { label: 'Negotiation', color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning },
  'pickup':      { label: 'Pickup',      color: SPYNE.info, bg: SPYNE_SOFT_BG.info },
  'appointment': { label: 'Appointment', color: SPYNE.pink, bg: SPYNE_SOFT_BG.pink },
}

const SERVICE_TYPE_CONFIG = {
  ...TYPE_CONFIG,
  mpi: { label: 'MPI / inspection', color: SPYNE.primary, bg: SPYNE_SOFT_BG.primary },
  'oil-change': { label: 'Express service', color: SPYNE.success, bg: SPYNE_SOFT_BG.success },
  diagnostic: { label: 'Diagnostic', color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning },
  repair: { label: 'Repair RO', color: SPYNE.info, bg: SPYNE_SOFT_BG.info },
  recall: { label: 'Recall', color: SPYNE.pink, bg: SPYNE_SOFT_BG.pink },
}

function buildServiceDriveWeekData(base) {
  const data = JSON.parse(JSON.stringify(base))
  const thu = data[0]?.days?.find((d) => d.key === 'thu-apr3')
  if (thu) {
    thu.appts = [
      { id: 'sv1', type: 'mpi', timeStart: 8, timeEnd: 8.75, customer: 'Lisa Chang', phone: '+1 (555) 555-0912', bookedService: 'MPI and express oil change', vehicle: '2017 Honda HR-V EX', budget: 'MPI + oil ~$189', agentAction: 'Express lane · advisor Tony R.', status: 'started' },
      { id: 'sv2', type: 'oil-change', timeStart: 9, timeEnd: 9.5, customer: 'Carlos Mendez', phone: '+1 (555) 555-0391', bookedService: 'Express oil change', vehicle: '2019 Ford Escape SE', budget: '$89.95 coupon', agentAction: 'Brake noise noted on check-in', status: 'upcoming' },
      { id: 'sv3', type: 'recall', timeStart: 10, timeEnd: 11.5, customer: 'Elena Ruiz', phone: '+1 (555) 220-1144', bookedService: 'Recall repair (no charge)', vehicle: '2019 Toyota RAV4', budget: 'Recall · no charge', agentAction: 'Loaner reserved · bay 2', status: 'upcoming' },
      { id: 'sv4', type: 'diagnostic', timeStart: 11.5, timeEnd: 12.5, customer: 'James Whitfield', phone: '+1 (555) 670-5512', bookedService: 'Driveability diagnostic', vehicle: '2017 Tundra SR5', budget: 'Diag auth $165', agentAction: 'Declined brake revisit · priority', status: 'upcoming' },
      { id: 'sv5', type: 'repair', timeStart: 13, timeEnd: 15, customer: 'Rachel Green', phone: '+1 (555) 555-0104', bookedService: '40k service and rear brakes', vehicle: '2019 BMW X3', budget: 'RO open · $1.2K auth', agentAction: '40k + rear brakes · loaner out', status: 'upcoming' },
      { id: 'sv6', type: 'pickup', timeStart: 16, timeEnd: 16.5, customer: 'Maria Gonzalez', phone: '+1 (555) 555-0218', bookedService: 'Pickup and RO closeout', vehicle: '2021 Highlander XLE', budget: 'RO closing today', agentAction: 'Ready for pickup · cashier', status: 'upcoming' },
    ]
  }
  return data
}

const SERVICE_WEEK_DATA = buildServiceDriveWeekData(WEEK_DATA)

const HOUR_START = 8
const HOUR_END   = 19
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const ROW_HEIGHT = 64 // px per hour

// ── Appointment Detail Overlay ────────────────────────────────

function AppointmentDetailPanel({ appt, onClose, typeConfig = TYPE_CONFIG, isService = false }) {
  if (!appt) return null
  const cfg    = typeConfig[appt.type] || typeConfig.appointment || TYPE_CONFIG.appointment
  const startH = Math.floor(appt.timeStart)
  const startM = ((appt.timeStart % 1) * 60).toString().padStart(2, '0')
  const endH   = Math.floor(appt.timeEnd)
  const endM   = ((appt.timeEnd % 1) * 60).toString().padStart(2, '0')
  const fmt    = (h, m) => `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 59 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: 'var(--spyne-surface)', borderLeft: '1px solid var(--spyne-border)',
        zIndex: 60, display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--spyne-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: cfg.color, background: cfg.bg,
                borderRadius: 'var(--spyne-radius-pill)', padding: '2px 8px', marginBottom: 8,
              }}>
                {cfg.label}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--spyne-text-primary)', margin: 0 }}>{appt.customer}</h2>
              {appt.phone ? (
                <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)', marginTop: 4, marginBottom: 0 }}>
                  {appt.phone}
                </p>
              ) : null}
              <p style={{ fontSize: 13, color: 'var(--spyne-text-muted)', marginTop: 3 }}>
                {fmt(startH, startM)} – {fmt(endH, endM)}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--spyne-text-muted)', padding: 4 }}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isService && appt.bookedService ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Wrench size={14} style={{ color: 'var(--spyne-text-muted)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--spyne-text-muted)', marginBottom: 2 }}>
                  {SERVICE_CONSOLE_TAB_CONTENT.appointments.detailBookedServiceLabel}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{appt.bookedService}</p>
              </div>
            </div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Car size={14} style={{ color: 'var(--spyne-text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Vehicle</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{appt.vehicle}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <DollarSign size={14} style={{ color: 'var(--spyne-text-muted)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--spyne-text-muted)', marginBottom: 2 }}>
                {isService ? SERVICE_CONSOLE_TAB_CONTENT.appointments.detailEstimateLabel : 'Budget'}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{appt.budget}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Sparkles size={14} style={{ color: 'var(--spyne-brand)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--spyne-text-muted)', marginBottom: 2 }}>
                {isService ? SERVICE_CONSOLE_TAB_CONTENT.appointments.detailAgentNoteLabel : 'Agent Note'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)', lineHeight: 1.5 }}>{appt.agentAction}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
            <a href={`tel:${appt.phone}`} className="spyne-btn-primary" style={{ flex: 1, justifyContent: 'center', gap: 6, fontSize: 13 }}>
              <Phone size={13} /> Call
            </a>
            <button className="spyne-btn-ghost" style={{ flex: 1, justifyContent: 'center', gap: 6, fontSize: 13 }}>
              <MessageSquare size={13} /> Message
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Column appointment layout (overlap detection) ─────────────

function layoutAppts(list) {
  const sorted = [...list].sort((a, b) => a.timeStart - b.timeStart)
  const columns = []
  sorted.forEach((appt) => {
    let placed = false
    for (const col of columns) {
      if (appt.timeStart >= col[col.length - 1].timeEnd) {
        col.push(appt)
        placed = true
        break
      }
    }
    if (!placed) columns.push([appt])
  })
  const totalCols = columns.length
  return columns.flatMap((col, colIdx) =>
    col.map((appt) => ({ appt, colIdx, totalCols }))
  )
}

// ── Week grid ─────────────────────────────────────────────────

function WeekGrid({ days, onSelectAppt, typeConfig = TYPE_CONFIG }) {
  const GUTTER = 52

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Day column headers */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--spyne-border)', paddingBottom: 10, marginBottom: 0 }}>
        {/* Gutter spacer */}
        <div style={{ width: GUTTER, flexShrink: 0 }} />
        {days.map((day) => {
          const total = day.appts.length
          return (
            <div
              key={day.key}
              style={{
                flex: 1, textAlign: 'center', paddingBottom: 8,
                borderLeft: '1px solid var(--spyne-border)',
                background: day.isToday ? 'var(--spyne-brand-subtle)' : 'transparent',
              }}
            >
              <p style={{
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: day.isToday ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                marginBottom: 3, paddingTop: 10,
              }}>
                {day.dayLabel}
              </p>
              <p style={{
                fontSize: 16, fontWeight: 700,
                color: day.isToday ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)',
                lineHeight: 1,
              }}>
                {day.date.split(' ')[1]}
              </p>
              <p style={{ fontSize: 10, color: 'var(--spyne-text-muted)', marginTop: 2 }}>
                {day.date.split(' ')[0]}
              </p>
              {total > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 5, minWidth: 18, height: 18, borderRadius: 'var(--spyne-radius-pill)',
                  padding: '0 5px', fontSize: 10, fontWeight: 700,
                  background: day.isToday ? 'var(--spyne-brand)' : 'var(--spyne-border)',
                  color: day.isToday ? '#fff' : 'var(--spyne-text-secondary)',
                }}>
                  {total}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Time gutter */}
        <div style={{ width: GUTTER, flexShrink: 0, position: 'relative' }}>
          {HOURS.map((h) => (
            <div key={h} style={{ height: ROW_HEIGHT, position: 'relative' }}>
              <span style={{
                position: 'absolute', top: -8, right: 8,
                fontSize: 10, fontWeight: 500, color: 'var(--spyne-text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const laid = layoutAppts(day.appts)
          return (
            <div
              key={day.key}
              style={{
                flex: 1,
                position: 'relative',
                borderLeft: '1px solid var(--spyne-border)',
                background: day.isToday ? 'var(--spyne-brand-subtle)' : 'transparent',
              }}
            >
              {/* Hour lines */}
              {HOURS.map((h) => (
                <div key={h} style={{
                  position: 'absolute', left: 0, right: 0,
                  top: (h - HOUR_START) * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                  borderTop: `1px solid ${day.isToday ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`,
                  opacity: day.isToday ? 0.5 : 1,
                }} />
              ))}

              {/* Spacer to set column height */}
              <div style={{ height: HOURS.length * ROW_HEIGHT }} />

              {/* Appointment blocks */}
              {laid.map(({ appt, colIdx, totalCols }) => {
                const cfg    = typeConfig[appt.type] || typeConfig.appointment || TYPE_CONFIG.appointment
                const top    = (appt.timeStart - HOUR_START) * ROW_HEIGHT + 2
                const height = Math.max((appt.timeEnd - appt.timeStart) * ROW_HEIGHT - 4, 22)
                const width  = totalCols > 1 ? `calc(${100 / totalCols}% - 3px)` : 'calc(100% - 6px)'
                const left   = totalCols > 1 ? `calc(${(colIdx / totalCols) * 100}% + 3px)` : '3px'

                return (
                  <div
                    key={appt.id}
                    onClick={() => onSelectAppt(appt)}
                    style={{
                      position: 'absolute',
                      top, left, width, height,
                      background: cfg.bg,
                      border: `1.5px solid ${cfg.color}44`,
                      borderLeft: `3px solid ${cfg.color}`,
                      borderRadius: 5,
                      padding: '3px 6px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      boxShadow: appt.status === 'started' ? `0 0 0 2px ${cfg.color}` : 'none',
                      transition: 'box-shadow 150ms',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 2px 8px ${cfg.color}44`}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = appt.status === 'started' ? `0 0 0 2px ${cfg.color}` : 'none'}
                  >
                    <p style={{ fontSize: 11, fontWeight: 700, color: cfg.color, lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appt.customer.split(' ')[0]}
                    </p>
                    {height > 32 && (
                      <p style={{ fontSize: 9, color: cfg.color, opacity: 0.8, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cfg.label}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────

const SERVICE_LEGEND_KEYS = ['mpi', 'oil-change', 'recall', 'diagnostic', 'repair', 'pickup']

export default function AppointmentsPage({ department = 'sales' }) {
  const isService = department === 'service'
  const weekSource = isService ? SERVICE_WEEK_DATA : WEEK_DATA
  const typeConfig = isService ? SERVICE_TYPE_CONFIG : TYPE_CONFIG

  const [weekIdx,      setWeekIdx]      = useState(0)
  const [selectedAppt, setSelectedAppt] = useState(null)

  const week = weekSource[weekIdx]
  const totalAppts = week.days.reduce((s, d) => s + d.appts.length, 0)

  return (
    <div className={cn('spyne-animate-fade-in', spyneSalesLayout.pageStack)}>
      {/* Sticky header — matches Sales Overview rhythm */}
      <div
        className={cn(
          'sticky z-[30] -mx-max2-page bg-spyne-page px-max2-page pt-6 pb-3 -mt-6',
          'top-[6rem] lg:top-10',
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className={max2Classes.pageTitle}>Appointments</h1>
            <p className={`${max2Classes.pageDescription} mt-0.5`}>
              {week.weekLabel} · {totalAppts}{' '}
              {isService ? `drive appointment${totalAppts !== 1 ? 's' : ''}` : `appointment${totalAppts !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Legend */}
            <div className="mr-2 flex flex-wrap items-center gap-2.5">
              {(isService
                ? SERVICE_LEGEND_KEYS.map((key) => [key, typeConfig[key]])
                : Object.entries(typeConfig)
              ).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-sm" style={{ background: cfg.color }} />
                  <span className="text-[11px] font-medium text-spyne-text-secondary">{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Week navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setWeekIdx((i) => Math.max(0, i - 1))}
                disabled={weekIdx === 0}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-spyne-border bg-spyne-surface text-spyne-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                onClick={() => setWeekIdx(0)}
                className={cn(
                  'h-8 cursor-pointer rounded-md border border-spyne-border px-3 font-semibold text-xs',
                  weekIdx === 0
                    ? 'bg-spyne-primary-soft text-spyne-primary'
                    : 'bg-spyne-surface text-spyne-text-secondary',
                )}
              >
                This Week
              </button>

              <button
                type="button"
                onClick={() => setWeekIdx((i) => Math.min(weekSource.length - 1, i + 1))}
                disabled={weekIdx === weekSource.length - 1}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-spyne-border bg-spyne-surface text-spyne-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week grid card */}
      <div className="spyne-card overflow-x-auto">
        <div style={{ minWidth: 720 }}>
          <WeekGrid days={week.days} onSelectAppt={setSelectedAppt} typeConfig={typeConfig} />
        </div>
      </div>

      {selectedAppt && (
        <AppointmentDetailPanel
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          typeConfig={typeConfig}
          isService={isService}
        />
      )}
    </div>
  )
}
