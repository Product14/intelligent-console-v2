"use client"

import { TrendingDown } from 'lucide-react'
import InfoTooltip from './InfoTooltip'

export default function SpeedToLeadPanel({ data }) {
  return (
    <div
      className="spyne-animate-slide-up h-full flex flex-col"
      style={{
        borderRadius: 'var(--spyne-radius-lg)',
        border: '1px solid var(--spyne-brand-muted)',
        borderLeft: '4px solid var(--spyne-brand)',
        background: 'var(--spyne-brand-subtle)',
        boxShadow: 'var(--spyne-shadow-brand)',
      }}
    >
      <div className="p-5 lg:p-6 flex-1 flex flex-col gap-4">

        {/* Top row: hero stat full width */}
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
            <div className="spyne-subheading">Speed-to-Lead</div>
            <InfoTooltip text="Measures how fast Vini responds to new leads. Research shows leads contacted within 5 minutes are 9× more likely to convert. This card tracks Vini's response speed and the appointments it generates from instant outreach." />
          </div>
            <div className="spyne-display" style={{ color: 'var(--spyne-brand)', fontSize: 44, lineHeight: 1 }}>
              {data.avgTime}
            </div>
            <div className="spyne-body mt-1" style={{ color: 'var(--spyne-text-secondary)' }}>
              avg first contact time
            </div>
          </div>
          <div className="flex flex-col gap-1.5 ml-2">
            <span
              className="flex items-center gap-1 px-2 py-0.5 spyne-caption"
              style={{
                borderRadius: 'var(--spyne-radius-pill)',
                background: 'var(--spyne-success-subtle)',
                color: 'var(--spyne-success-text)',
                fontWeight: 700,
                border: '1px solid var(--spyne-success-muted)',
                width: 'fit-content',
              }}
            >
              <TrendingDown size={11} />
              {data.improvement}
            </span>
            <div className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
              prior week: {data.priorPeriod}
            </div>
          </div>
        </div>

        {/* 2x2 stat grid — flex-1 so cells grow to fill remaining height */}
        <div className="grid grid-cols-2 gap-3 flex-1" style={{ gridTemplateRows: '1fr 1fr' }}>
          <StatCell value={data.leadsInstantlyReached}    label="leads instantly reached" />
          <StatCell value={data.leadsEngaged}             label="leads engaged (replied back)" />
          <StatCell value={data.apptsFromInstantResponse} label="appts from instant response" green />
          <StatCell value={`${data.crmLeadsCaptured}%`}  label="of CRM leads captured" />
        </div>
      </div>

      {/* Highlight bar */}
      <div
        className="px-5 py-2.5 flex items-center justify-center"
        style={{ background: '#DBEAFE', borderTop: '1px solid var(--spyne-brand-muted)' }}
      >
        <p className="spyne-caption text-center leading-relaxed" style={{ color: '#1D4ED8', fontWeight: 500 }}>
          <strong>{data.highlightBar.split('·')[0].trim()}</strong>
          {data.highlightBar.includes('·') && <> · {data.highlightBar.split('·')[1].trim()}</>}
        </p>
      </div>
    </div>
  )
}

function StatCell({ value, label, green }) {
  return (
    <div
      className="flex flex-col justify-center gap-1 p-3"
      style={{
        background: 'rgba(255,255,255,0.75)',
        borderRadius: 'var(--spyne-radius-md)',
        border: '1px solid var(--spyne-brand-muted)',
        boxShadow: 'var(--spyne-shadow-sm)',
      }}
    >
      <div
        className="spyne-number"
        style={{ color: green ? 'var(--spyne-success)' : 'var(--spyne-text-primary)', fontSize: 22 }}
      >
        {value}
      </div>
      <div className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)', lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  )
}
