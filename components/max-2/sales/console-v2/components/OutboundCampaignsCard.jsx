"use client"

import InfoTooltip from './InfoTooltip'

export default function OutboundCampaignsCard({ data }) {
  const { campaigns } = data

  const totalEnrolled  = campaigns.reduce((s, c) => s + c.enrolled, 0)
  const totalContacted = campaigns.reduce((s, c) => s + c.contacted, 0)
  const totalReEngaged = campaigns.reduce((s, c) => s + (c.reEngaged ?? 0), 0)
  const totalAppts     = campaigns.reduce((s, c) => s + c.apptsBooked, 0)
  const avgResponse    = (() => {
    const resp = campaigns.reduce((s, c) => s + c.contacted * parseFloat(c.responseRate), 0)
    return (resp / totalContacted).toFixed(1) + '%'
  })()

  return (
    <div className="spyne-card p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="spyne-heading">Campaign Performance</div>
        <InfoTooltip text="Tracks how each outbound campaign is converting dormant CRM leads. Re-engaged = a cold lead replied. Appts Booked = Vini converted the re-engagement into a confirmed visit." />
      </div>

      {/* Campaign stat tiles — mirrors source strip */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {campaigns.map((c) => (
          <div
            key={c.key}
            className="rounded-lg p-3 text-center"
            style={{ background: c.color + '12', borderTop: `3px solid ${c.color}` }}
          >
            <div className="spyne-number" style={{ color: c.color, fontSize: 22, lineHeight: 1.1 }}>
              {c.enrolled.toLocaleString()}
            </div>
            <div className="spyne-label mt-0.5" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.3 }}>
              {c.label}
            </div>
            <div className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
              {Math.round(c.contacted / c.enrolled * 100)}% contacted
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--spyne-border)', marginBottom: 12 }} />

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--spyne-border)' }}>
              <th style={thStyle}>Campaign</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Contacted</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Response Rate</th>
              <th style={{ ...thStyle, textAlign: 'center', color: 'var(--spyne-brand)' }}>Re-engaged</th>
              <th style={{ ...thStyle, textAlign: 'center', color: 'var(--spyne-brand)' }}>Appts Booked</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr
                key={c.key}
                style={{ background: i % 2 !== 0 ? 'var(--spyne-bg)' : 'transparent' }}
              >
                <td style={{ ...tdRowLabel, color: c.color }}>
                  {c.label}
                </td>
                <td style={tdCell}>{c.contacted.toLocaleString()}</td>
                <td style={{ ...tdCell, color: 'var(--spyne-text-secondary)' }}>{c.responseRate}</td>
                <td style={{ ...tdCell, color: 'var(--spyne-brand)', fontWeight: 700 }}>
                  {c.reEngaged != null ? c.reEngaged.toLocaleString() : <span style={{ color: 'var(--spyne-text-muted)', fontWeight: 400 }}>—</span>}
                </td>
                <td style={{ ...tdCell, color: 'var(--spyne-brand)', fontWeight: 700 }}>
                  {c.apptsBooked.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer totals */}
      <div style={{ height: 1, background: 'var(--spyne-border)', marginTop: 12, marginBottom: 10 }} />
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Total Enrolled',   value: totalEnrolled.toLocaleString() },
          { label: 'Total Contacted',  value: totalContacted.toLocaleString() },
          { label: 'Avg Response',     value: avgResponse },
          { label: 'Re-engaged',       value: totalReEngaged.toLocaleString(), highlight: true },
          { label: 'Appts Booked',     value: totalAppts.toLocaleString(),     highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span style={{ fontSize: 16, fontWeight: 700, color: highlight ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--spyne-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const thStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: 'var(--spyne-text-muted)',
  textAlign: 'left',
  padding: '0 10px 8px 0',
}

const tdRowLabel = {
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 10px 8px 0',
}

const tdCell = {
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'center',
  padding: '8px 10px',
  color: 'var(--spyne-text-primary)',
}
