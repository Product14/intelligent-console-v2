"use client"

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import InfoTooltip from './InfoTooltip'

const SECTION_LABEL = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--spyne-text-muted)',
  marginBottom: 8,
}

export default function AgentCard({ agent }) {
  const { name, role, photo, status, performance, agentType } = agent
  const [imgError, setImgError] = useState(false)
  const isOutbound = agentType === 'outbound'

  return (
    <div className="spyne-card spyne-animate-fade-in p-5 flex flex-col gap-4">
      {/* Agent header */}
      <div className="flex items-center gap-3">
        {photo && !imgError ? (
          <img
            src={photo}
            alt={name}
            onError={() => setImgError(true)}
            className="w-12 h-12 rounded-full object-cover object-top shrink-0"
            style={{ border: '2px solid var(--spyne-border)' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-base font-bold"
            style={{
              background: 'var(--spyne-brand-subtle)',
              color: 'var(--spyne-brand)',
              border: '2px solid var(--spyne-brand-muted)',
            }}
          >
            {name.charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="spyne-label" style={{ color: 'var(--spyne-text-primary)', fontWeight: 700 }}>{name}</span>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: status === 'online' ? 'var(--spyne-success)' : 'var(--spyne-text-muted)' }}
            />
            <InfoTooltip text="Vini AI's activity summary for the selected period — structured the same way you'd evaluate a BDC agent. Review overall contact activity, speed-to-response, and after-hours coverage side by side." />
          </div>
          <div className="spyne-caption mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>{role}</div>
        </div>
      </div>

      {/* Section 1: Overall Stats */}
      <div>
        <div style={SECTION_LABEL}>Overall Stats</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {isOutbound ? (
            <>
              <PerfStat value={performance.overall.leadsWorked}      label="leads worked" />
              <PerfStat value={performance.overall.responseRate}      label="response rate" accent />
              <PerfStat value={performance.overall.reEngagements}     label="re-engagements" />
              <PerfStat value={performance.overall.reEngagementRate}  label="re-engagement rate" accent />
            </>
          ) : (
            <>
              <PerfStat value={performance.overall.leadsInteracted}    label="leads interacted" />
              <PerfStat value={performance.overall.connectRate}        label="connect rate" accent />
              <PerfStat value={performance.overall.appointmentsBooked} label="appts booked" />
              <PerfStat value={performance.overall.apptBookingRate}    label="appt booking rate" accent />
            </>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--spyne-border)' }} />

      {/* Section 2: Speed-to-Lead (inbound) / Outreach Activity (outbound) */}
      <div>
        <div style={SECTION_LABEL}>{isOutbound ? 'Outreach Activity' : 'Speed-to-Lead'}</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {isOutbound ? (
            <>
              <PerfStat value={performance.outreachActivity.touchesSent}           label="touches sent" />
              <PerfStat value={performance.outreachActivity.avgReplyTime}          label="avg reply time" accent />
              <PerfStat value={performance.outreachActivity.sequenceCompletions}   label="sequence completions" />
              <PerfStat value={performance.outreachActivity.activeCampaigns}       label="active campaigns" accent />
            </>
          ) : (
            <>
              <PerfStat value={performance.speedToLead.avgFirstContact} label="avg first contact" accent />
              <PerfStat value={performance.speedToLead.pctWithin5Min}   label="within 5 min" accent />
              <PerfStat value={performance.speedToLead.leadsInstantly}  label="instantly reached" />
              <PerfStat value={performance.speedToLead.leadsEngaged}    label="engaged back" />
            </>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--spyne-border)' }} />

      {/* Section 3: After Hours */}
      <div>
        <div style={SECTION_LABEL}>After Hours</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <PerfStat value={performance.afterHours.leadsEngaged} label="leads engaged" />
          <PerfStat value={performance.afterHours.apptsBooked}  label="appts booked" />
        </div>
      </div>

      <button className="flex items-center gap-1 cursor-pointer mt-auto" style={{ background: 'none', border: 'none', padding: 0 }}>
        <span className="spyne-label" style={{ color: 'var(--spyne-brand)', fontWeight: 600 }}>View full performance</span>
        <ArrowRight size={11} style={{ color: 'var(--spyne-brand)' }} />
      </button>
    </div>
  )
}

function PerfStat({ value, label, accent }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="spyne-number"
        style={{
          fontSize: 18,
          lineHeight: 1.1,
          color: accent ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', lineHeight: 1.3 }}>{label}</span>
    </div>
  )
}
