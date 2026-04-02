"use client"

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts'
import { Phone, MessageSquare, Mail, ChevronDown } from 'lucide-react'

const TOGGLES_INBOUND = [
  { id: 'appointments',     label: 'Appointments Booked' },
  { id: 'leadsEngaged',     label: 'Leads Engaged'       },
  { id: 'speedToLead',      label: 'Speed-to-Lead Avg'   },
  { id: 'followUpTouches',  label: 'Follow-up Touches'   },
]

const TOGGLES_OUTBOUND = [
  { id: 'reEngagements',      label: 'Re-engagements'  },
  { id: 'outreachSent',       label: 'Outreach Sent'   },
  { id: 'responseRate',       label: 'Response Rate'   },
  { id: 'appointmentsBooked', label: 'Appts Booked'    },
]

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="spyne-caption px-2.5 py-1.5 shadow-lg"
      style={{
        background: 'var(--spyne-text-primary)',
        color: '#fff',
        borderRadius: 'var(--spyne-radius-md)',
      }}
    >
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div>{payload[0].value}{unit}</div>
    </div>
  )
}

export default function ActivityChart({ data, agentType }) {
  const isOutbound = agentType === 'outbound'
  const TOGGLES = isOutbound ? TOGGLES_OUTBOUND : TOGGLES_INBOUND
  const [activeMetric, setActiveMetric] = useState(isOutbound ? 'reEngagements' : 'appointments')
  const [granularity, setGranularity]   = useState('daily')

  useEffect(() => {
    setActiveMetric(isOutbound ? 'reEngagements' : 'appointments')
  }, [isOutbound])

  // Use weekly if selected and available, otherwise fall back to daily
  const activeGranularity = (granularity === 'weekly' && data.weekly) ? 'weekly' : 'daily'
  const chartSource = data[activeGranularity] || data.daily
  // Guard: if activeMetric doesn't exist in current data (e.g. mid-render agent switch), fall back to first toggle
  const safeMetric = chartSource.metrics[activeMetric] ? activeMetric : TOGGLES[0].id
  const metric = chartSource.metrics[safeMetric]
  const unit = metric.unit || ''
  const lowerIsBetter = metric.lowerIsBetter

  const chartData = chartSource.days.map((day, i) => ({
    day,
    value: metric.data[i],
  }))

  return (
    <div className="spyne-card p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="spyne-heading">Recent Activity</div>
          {/* Granularity picker */}
          <div className="relative">
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="spyne-input appearance-none cursor-pointer"
              style={{ fontSize: 11, height: 28, paddingLeft: 10, paddingRight: 24, fontFamily: 'inherit' }}
              aria-label="Chart granularity"
            >
              <option value="daily">Daily</option>
              {data.weekly && <option value="weekly">Weekly</option>}
            </select>
            <ChevronDown
              size={11}
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--spyne-text-muted)' }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TOGGLES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveMetric(t.id)}
              className={`spyne-pill ${activeMetric === t.id ? 'spyne-pill-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--spyne-border)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--spyne-text-muted)', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
            interval={activeGranularity === 'daily' && chartData.length > 14 ? Math.floor(chartData.length / 10) : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--spyne-text-muted)', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'var(--spyne-brand-subtle)' }} />
          <Bar dataKey="value" fill="var(--spyne-brand)" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.length <= 14 && (
              <LabelList
                dataKey="value"
                position="top"
                style={{ fontSize: 10, fill: 'var(--spyne-text-secondary)', fontWeight: 600, fontFamily: 'inherit' }}
                formatter={(v) => `${v}${unit}`}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {lowerIsBetter && (
        <div className="text-center spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
          Lower is better — faster response time
        </div>
      )}

      {/* Channel summary */}
      <div
        className="flex items-center justify-center gap-5 mt-4 pt-4"
        style={{ borderTop: '1px solid var(--spyne-border)' }}
      >
        <ChannelStat icon={Phone}         label="Calls"  value={data.channelSummary.calls} />
        <ChannelStat icon={MessageSquare} label="SMS"    value={data.channelSummary.sms} />
        <ChannelStat icon={Mail}          label="Emails" value={data.channelSummary.emails} />
      </div>
    </div>
  )
}

function ChannelStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} style={{ color: 'var(--spyne-text-muted)' }} />
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>Total {label}:</span>
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-primary)', fontWeight: 700 }}>{value}</span>
    </div>
  )
}
