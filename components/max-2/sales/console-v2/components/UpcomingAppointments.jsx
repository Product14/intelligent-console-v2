"use client"

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import InfoTooltip from './InfoTooltip'

export default function UpcomingAppointments({ appointments }) {
  const [activeTab, setActiveTab] = useState('today')
  const items = appointments[activeTab] ?? []

  return (
    <div className="spyne-card spyne-animate-fade-in p-5 flex flex-col gap-4" style={{ animationDelay: '50ms' }}>
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <span className="spyne-heading">Upcoming Appointments</span>
        <InfoTooltip text="AI-booked appointments scheduled for today and tomorrow. These are confirmed visits from leads Vini qualified and converted — no salesperson involvement required." />
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1">
        {['today', 'tomorrow'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`spyne-pill ${activeTab === tab ? 'spyne-pill-active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1 flex-1">
        {items.map((appt) => (
          <div
            key={appt.id}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: '1px solid var(--spyne-border)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="spyne-label truncate" style={{ color: 'var(--spyne-text-primary)', fontWeight: 600 }}>{appt.customer}</div>
              <div className="spyne-caption truncate" style={{ color: 'var(--spyne-text-muted)' }}>{appt.vehicle}</div>
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <span className="spyne-caption whitespace-nowrap" style={{ color: 'var(--spyne-text-secondary)' }}>
                {appt.timeStart} – {appt.timeEnd}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <button className="flex items-center gap-1 cursor-pointer" style={{ background: 'none', border: 'none', padding: 0 }}>
        <span className="spyne-label" style={{ color: 'var(--spyne-brand)', fontWeight: 600 }}>View all appointments</span>
        <ArrowRight size={11} style={{ color: 'var(--spyne-brand)' }} />
      </button>
    </div>
  )
}
