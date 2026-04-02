// ─────────────────────────────────────────────────────────────
// VINI CONSOLE — MOCK DATA
// Replace each export with a real API call when integrating.
// API endpoint hints are marked with TODO comments.
// ─────────────────────────────────────────────────────────────

// TODO: GET /api/dealer/:dealerId/agent?department=sales
export const salesAgentData = {
  name: 'Emily',
  role: 'Sales AI Agent',
  photo: 'https://randomuser.me/api/portraits/women/44.jpg',
  status: 'online',
  yesterdaySnapshot: {
    appointmentsBooked: 8,
    appointmentsAvgLastWeek: 5,
    speedToLeadAvg: '1m 47s',
    activeFollowUpLeads: 23,
  },
  performance: {
    overall: {
      leadsInteracted: 247,
      connectRate: '78%',
      appointmentsBooked: 32,
      apptBookingRate: '13%',
    },
    speedToLead: {
      avgFirstContact: '1m 47s',
      pctWithin5Min: '94%',
      leadsInstantly: 23,
      leadsEngaged: 18,
    },
    afterHours: {
      leadsEngaged: 19,
      apptsBooked: 6,
    },
  },
}

// TODO: GET /api/dealer/:dealerId/agent?department=sales&type=outbound
export const salesOutboundAgentData = {
  name: 'Jenny',
  role: 'Outbound Agent',
  photo: 'https://randomuser.me/api/portraits/women/68.jpg',
  status: 'online',
  agentType: 'outbound',
  performance: {
    overall: {
      leadsWorked: 312,
      responseRate: '18.4%',
      reEngagements: 44,
      reEngagementRate: '14.1%',
    },
    outreachActivity: {
      touchesSent: 847,
      avgReplyTime: '4h 22m',
      sequenceCompletions: 198,
      activeCampaigns: 4,
    },
    afterHours: {
      leadsEngaged: 31,
      apptsBooked: 8,
    },
  },
}

// TODO: GET /api/dealer/:dealerId/agent?department=service
export const serviceAgentData = {
  name: 'Mark',
  role: 'Service AI Agent',
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  status: 'online',
  yesterdaySnapshot: {
    appointmentsBooked: 5,
    appointmentsAvgLastWeek: 4,
    speedToLeadAvg: '2m 10s',
    activeFollowUpLeads: 17,
  },
  performance: {
    overall: {
      leadsInteracted: 184,
      connectRate: '82%',
      appointmentsBooked: 21,
      apptBookingRate: '11%',
    },
    speedToLead: {
      avgFirstContact: '2m 10s',
      pctWithin5Min: '88%',
      leadsInstantly: 17,
      leadsEngaged: 13,
    },
    afterHours: {
      leadsEngaged: 11,
      apptsBooked: 3,
    },
  },
}

// TODO: GET /api/dealer/:dealerId/appointments?view=upcoming
export const appointmentsData = {
  today: [
    { id: 1, customer: 'Tomee Lee',      vehicle: '2019 Toyota RAV4',                  timeStart: '2:00 PM',  timeEnd: '2:30 PM' },
    { id: 2, customer: 'Tomee Lee',      vehicle: 'AC Service · 2019 Toyota RAV4',     timeStart: '2:00 PM',  timeEnd: '2:30 PM' },
    { id: 3, customer: 'Michael Smith',  vehicle: '2019 Toyota RAV4',                  timeStart: '2:00 PM',  timeEnd: '2:30 PM' },
    { id: 4, customer: 'Michael Kang',   vehicle: 'Scratch Fix · 2019 Toyota RAV4',   timeStart: '2:00 PM',  timeEnd: '2:30 PM' },
    { id: 5, customer: 'Jessica Parker', vehicle: '2106 Mazda CX-5',                   timeStart: '2:00 PM',  timeEnd: '2:30 PM' },
  ],
  tomorrow: [
    { id: 6, customer: 'David Chen',   vehicle: '2023 Honda Civic Sport', timeStart: '10:00 AM', timeEnd: '10:30 AM' },
    { id: 7, customer: 'Laura Adams',  vehicle: '2024 Subaru Outback',    timeStart: '1:00 PM',  timeEnd: '1:30 PM'  },
    { id: 8, customer: 'Mark Rivera',  vehicle: '2022 Ford F-150',        timeStart: '3:30 PM',  timeEnd: '4:00 PM'  },
  ],
}

// TODO: GET /api/dealer/:dealerId/leads/priority-follow-ups
export const priorityFollowUpsData = {
  todaysCallbacks: [
    {
      id: 1, initials: 'JP', color: 'bg-violet-500',
      name: 'Jessica Parker', timeAgo: '2hrs ago',
      message: '"I want to service my car"',
      tag: 'Callback Requested', tagColor: 'bg-blue-100 text-blue-700',
      scheduledTime: '10:00 AM',
    },
    {
      id: 2, initials: 'TL', color: 'bg-teal-500',
      name: 'Tommy Lee', timeAgo: '2hrs ago',
      message: '"Voice call · 2:00 mins + Emily"',
      tag: 'Callback Requested', tagColor: 'bg-blue-100 text-blue-700',
      scheduledTime: '11:30 AM',
    },
  ],
  hot: [
    {
      id: 3, initials: 'BB', color: 'bg-orange-500',
      name: 'Brian Benstock', timeAgo: '2hrs ago',
      message: '"AC is not working"',
      tag: 'Needs human attention', tagColor: 'bg-red-100 text-red-700',
    },
    {
      id: 4, initials: 'BB', color: 'bg-orange-500',
      name: 'Brian Benstock', timeAgo: '2hrs ago',
      message: '"I have scratches on my vehicle"',
      tag: 'Needs human attention', tagColor: 'bg-red-100 text-red-700',
    },
    {
      id: 5, initials: 'MG', color: 'bg-pink-500',
      name: 'Maria Garcia', timeAgo: '4hrs ago',
      message: '"Need OTD price on the CR-V"',
      tag: 'Follow-up needed', tagColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 6, initials: 'DC', color: 'bg-indigo-500',
      name: 'David Chen', timeAgo: '5hrs ago',
      message: '"Can you beat my credit union rate?"',
      tag: 'Follow-up needed', tagColor: 'bg-amber-100 text-amber-700',
    },
  ],
  warm: [
    {
      id: 7, initials: 'SR', color: 'bg-cyan-500',
      name: 'Sarah Reynolds', timeAgo: '1d ago',
      message: '"Still thinking about the Accord"',
      tag: 'Follow-up needed', tagColor: 'bg-amber-100 text-amber-700',
    },
  ],
}

// TODO: GET /api/dealer/:dealerId/speed-to-lead?period=last7d
export const speedToLeadBase = {
  avgTime: '1m 47s',
  improvement: '▼ 25s faster than last week',
  priorPeriod: '2m 12s',
  crmLeadsCaptured: 94,
  highlightBar: '94% of new leads contacted within 5 minutes · 6 of 7 days avg was under 5 minutes',
}

// TODO: GET /api/dealer/:dealerId/callbacks?status=needs-attention
export const callbacksData = {
  needsAttention: [
    {
      id: 1, initials: 'MB', color: 'bg-blue-500',
      name: 'Michael Brown', lastInteracted: '25th July, 10:45 AM',
      actionType: 'Callback Today',
      actionColor: 'bg-amber-100 text-amber-800 border border-amber-200',
      events: [
        { actor: 'Sarah', action: 'sent a follow-up email', date: '20 July, 2:15 PM', subject: 'Inquiry about the new website launch' },
        { actor: 'Vini',  action: 'attempted a call',       date: '19 July, 10:00 AM', subject: null },
      ],
      moreEvents: 3,
    },
    {
      id: 2, initials: 'MG', color: 'bg-pink-500',
      name: 'Maria Garcia', lastInteracted: '23rd July, 1:15 PM',
      actionType: 'Human Requested',
      actionColor: 'bg-red-100 text-red-800 border border-red-200',
      events: [
        { actor: 'Vini',  action: 'sent a reply',               date: '12 July, 4:30 PM',  subject: 'Feedback on 2024 Subaru Outback test drive' },
        { actor: 'Maria', action: 'asked to speak with manager', date: '11 July, 2:00 PM',  subject: null },
      ],
      moreEvents: 4,
    },
    {
      id: 3, initials: 'BB', color: 'bg-orange-500',
      name: 'Brian Benstock', lastInteracted: '26th July, 11:30 AM',
      actionType: 'AI Escalated',
      actionColor: 'bg-orange-100 text-orange-800 border border-orange-200',
      events: [
        { actor: 'Tom',  action: 'sent a reminder',        date: '22 July, 9:00 AM',  subject: 'AC issue unresolved after 2 attempts' },
        { actor: 'Vini', action: 'flagged for human review', date: '21 July, 3:00 PM', subject: null },
      ],
      moreEvents: 2,
    },
  ],
  completed: [],
  totalOpenConversations: 12,
}

// TODO: GET /api/dealer/:dealerId/campaigns?type=outbound&period=<dateRange>
export const outboundCampaignsData = {
  campaigns: [
    { key: 'aged30',      label: 'Aged Leads (30-60d)', color: '#4F46E5', enrolled: 312, contacted: 298, responseRate: '14.2%', reEngaged: 44,   apptsBooked: 18 },
    { key: 'aged60',      label: 'Aged Leads (60-90d)', color: '#0D9488', enrolled: 187, contacted: 181, responseRate: '9.1%',  reEngaged: 17,   apptsBooked: 6  },
    { key: 'apptReminder', label: 'Appt Reminders',     color: '#D97706', enrolled: 43,  contacted: 43,  responseRate: '71.4%', reEngaged: null, apptsBooked: 31 },
    { key: 'lostDeals',   label: 'Lost Deals',          color: '#7C3AED', enrolled: 94,  contacted: 89,  responseRate: '11.2%', reEngaged: 11,   apptsBooked: 4  },
  ],
}

// TODO: GET /api/dealer/:dealerId/profile
export const dealerData = {
  name: 'Clay Cooley Auto Group',
  location: 'Rockwall Hyundai',
  userName: 'Nidhi',
}

export const dateRangeOptions = [
  'Last 7 days',
  'Last 14 days',
  'Last 30 days',
  'This month',
  'Last month',
  'Custom range',
]

// ─── Period-scaled Overview Data ─────────────────────────────
// TODO: All values below come from real API calls scoped to the selected period.
// The multipliers here are mock approximations only.

const PERIOD_MULTIPLIERS = {
  'Last 7 days':  1.0,
  'Last 14 days': 1.85,
  'Last 30 days': 3.8,
  'This month':   3.6,
  'Last month':   3.2,
}

// Returns chart data with both daily and weekly granularity options.
// ActivityChart selects which to display based on user's granularity picker.
function buildChartData(dateRange) {
  const D7_APPTS   = [8, 12, 6, 15, 11, 7, 9]
  const D7_LEADS   = [142, 198, 167, 221, 189, 134, 156]
  const D7_SPEED   = [112, 98, 134, 87, 103, 145, 107]
  const D7_TOUCHES = [41, 67, 52, 78, 63, 38, 47]
  const mk = (label, data, unit, lowerIsBetter) => ({ label, data, unit, lowerIsBetter })

  // Helper: aggregate daily arrays into weekly buckets
  function toWeekly(dailyData, weekLabels) {
    const chunkSize = Math.ceil(dailyData.length / weekLabels.length)
    return weekLabels.map((_, wi) => {
      const chunk = dailyData.slice(wi * chunkSize, (wi + 1) * chunkSize)
      return Math.round(chunk.reduce((a, b) => a + b, 0) / chunk.length)
    })
  }

  if (dateRange === 'Last 7 days' || dateRange === 'Custom range') {
    const dailyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weeklyLabels = ['This Week']
    return {
      daily: {
        days: dailyLabels,
        metrics: {
          appointments:    mk('Appointments Booked', D7_APPTS,   '', false),
          leadsEngaged:    mk('Leads Engaged',        D7_LEADS,   '', false),
          speedToLead:     mk('Speed-to-Lead Avg',    D7_SPEED,   's', true),
          followUpTouches: mk('Follow-up Touches',    D7_TOUCHES, '', false),
        },
      },
      weekly: null,
      channelSummary: { calls: 143, sms: 143, emails: 143 },
    }
  }

  if (dateRange === 'Last 14 days') {
    const d14Labels = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 2, 17 + i)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    const d14Appts   = [...D7_APPTS.map((v) => Math.round(v * 0.88)),   ...D7_APPTS.map((v) => Math.round(v * 1.05))]
    const d14Leads   = [...D7_LEADS.map((v) => Math.round(v * 0.88)),   ...D7_LEADS.map((v) => Math.round(v * 1.05))]
    const d14Speed   = [...D7_SPEED.map((v) => Math.round(v * 1.06)),   ...D7_SPEED]
    const d14Touches = [...D7_TOUCHES.map((v) => Math.round(v * 0.88)), ...D7_TOUCHES.map((v) => Math.round(v * 1.05))]
    const wkLabels14 = ['Week 1', 'Week 2']
    return {
      daily: {
        days: d14Labels,
        metrics: {
          appointments:    mk('Appointments Booked', d14Appts,   '', false),
          leadsEngaged:    mk('Leads Engaged',        d14Leads,   '', false),
          speedToLead:     mk('Speed-to-Lead Avg',    d14Speed,   's', true),
          followUpTouches: mk('Follow-up Touches',    d14Touches, '', false),
        },
      },
      weekly: {
        days: wkLabels14,
        metrics: {
          appointments:    mk('Appointments Booked', toWeekly(d14Appts, wkLabels14),   '', false),
          leadsEngaged:    mk('Leads Engaged',        toWeekly(d14Leads, wkLabels14),   '', false),
          speedToLead:     mk('Speed-to-Lead Avg',    toWeekly(d14Speed, wkLabels14),   's', true),
          followUpTouches: mk('Follow-up Touches',    toWeekly(d14Touches, wkLabels14), '', false),
        },
      },
      channelSummary: { calls: 265, sms: 265, emails: 265 },
    }
  }

  // Last 30 days / This month / Last month
  const isLastMonth = dateRange === 'Last month'
  const isThisMonth = dateRange === 'This month'
  const scale = isLastMonth ? 0.88 : 1.0
  const m = PERIOD_MULTIPLIERS[dateRange] ?? 1.0

  // Generate 30 daily bars
  const d30Labels = Array.from({ length: 30 }, (_, i) => {
    const base = isLastMonth ? new Date(2026, 1, 1) : new Date(2026, 2, 1)
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const d30Appts   = Array.from({ length: 30 }, (_, i) => Math.round((D7_APPTS[i % 7]   * 1.1 + i * 0.15) * scale))
  const d30Leads   = Array.from({ length: 30 }, (_, i) => Math.round((D7_LEADS[i % 7]   * 1.1 + i * 2)    * scale))
  const d30Speed   = Array.from({ length: 30 }, (_, i) => Math.round((D7_SPEED[i % 7]   * 0.98)            * scale))
  const d30Touches = Array.from({ length: 30 }, (_, i) => Math.round((D7_TOUCHES[i % 7] * 1.1 + i * 0.3)  * scale))

  const wkLabels = isLastMonth
    ? ['Feb Wk 1', 'Feb Wk 2', 'Feb Wk 3', 'Feb Wk 4']
    : isThisMonth
    ? ['Mar Wk 1', 'Mar Wk 2', 'Mar Wk 3', 'Mar Wk 4']
    : ['Mar Wk 1', 'Mar Wk 2', 'Mar Wk 3', 'Mar Wk 4', 'Mar Wk 5']

  return {
    daily: {
      days: d30Labels,
      metrics: {
        appointments:    mk('Appointments Booked', d30Appts,   '', false),
        leadsEngaged:    mk('Leads Engaged',        d30Leads,   '', false),
        speedToLead:     mk('Speed-to-Lead Avg',    d30Speed,   's', true),
        followUpTouches: mk('Follow-up Touches',    d30Touches, '', false),
      },
    },
    weekly: {
      days: wkLabels,
      metrics: {
        appointments:    mk('Appointments Booked', toWeekly(d30Appts, wkLabels),   '', false),
        leadsEngaged:    mk('Leads Engaged',        toWeekly(d30Leads, wkLabels),   '', false),
        speedToLead:     mk('Speed-to-Lead Avg',    toWeekly(d30Speed, wkLabels),   's', true),
        followUpTouches: mk('Follow-up Touches',    toWeekly(d30Touches, wkLabels), '', false),
      },
    },
    channelSummary: {
      calls:  Math.round(143 * m),
      sms:    Math.round(143 * m),
      emails: Math.round(143 * m),
    },
  }
}

// TODO: GET /api/dealer/:dealerId/metrics?period=<dateRange>&compare=true
export function getOverviewData(dateRange) {
  const m = PERIOD_MULTIPLIERS[dateRange] ?? 1.0
  const s = (n) => Math.round(n * m)

  return {
    metricsBar: [
      { label: 'Leads Interacted',          value: s(1200).toLocaleString(), delta: '+9%',  deltaDir: 'up', note: 'unique leads',    highlight: false },
      { label: 'Leads Qualified',           value: s(341).toLocaleString(),  delta: '+11%', deltaDir: 'up', note: 'vs last period',  highlight: false },
      { label: 'After Hours Leads Engaged', value: s(89).toLocaleString(),   delta: '+12%', deltaDir: 'up', note: 'vs last period',  highlight: false },
      { label: 'Human Handoffs',            value: String(s(38)),            delta: '+19%', deltaDir: 'up', note: 'warm transfers',   highlight: false },
      { label: 'Appointments Booked',       value: s(127).toLocaleString(),  delta: '+18%', deltaDir: 'up', note: 'AI-booked',        highlight: true  },
    ],
    speedToLead: {
      ...speedToLeadBase,
      leadsInstantlyReached:    s(23),
      leadsEngaged:             s(18),
      apptsFromInstantResponse: s(6),
    },
    followUpSequences: {
      touchesToday:              s(47),
      leadsInSequence:           s(23),
      apptsFromFollowUpThisWeek: s(18),
    },
    activityChart: buildChartData(dateRange),
  }
}

// TODO: GET /api/dealer/:dealerId/metrics?type=outbound&period=<dateRange>
export function getOutboundOverviewData(dateRange) {
  const m = PERIOD_MULTIPLIERS[dateRange] ?? 1.0
  const s = (n) => Math.round(n * m)

  return {
    metricsBar: [
      { label: 'CRM Leads Worked',   value: s(312).toLocaleString(),  delta: '+14%', deltaDir: 'up', note: 'from CRM',         highlight: false },
      { label: 'Response Rate',      value: '18.4%',                  delta: '+3.2pts', deltaDir: 'up', note: 'vs last period', highlight: false },
      { label: 'Re-engagements',     value: s(44).toLocaleString(),   delta: '+22%', deltaDir: 'up', note: 'cold leads revived', highlight: false },
      { label: 'Human Handoffs',     value: String(s(29)),            delta: '+11%', deltaDir: 'up', note: 'warm transfers',    highlight: false },
      { label: 'Appointments Booked', value: s(59).toLocaleString(),  delta: '+31%', deltaDir: 'up', note: 'AI-booked',         highlight: true  },
    ],
    reEngagement: {
      rate: '18.4%',
      improvement: '↑ 3.2pts vs last period',
      leadsReEngaged: s(44),
      qualifiedLeads: s(41),
      avgDaysCold: 22,
      apptsBooked: s(19),
      highlightBar: `${s(41)} dead CRM leads qualified by Vini · ${s(19)} appointments booked from re-engaged leads`,
    },
    activityChart: buildOutboundChartData(dateRange),
  }
}

function buildOutboundChartData(dateRange) {
  const D7_REENG   = [4, 7, 3, 9, 6, 2, 5]
  const D7_OUTREACH = [118, 134, 98, 156, 127, 89, 112]
  const D7_RESP    = [16, 19, 14, 22, 18, 11, 17]   // response rate %
  const D7_APPTS   = [3, 5, 2, 7, 4, 1, 4]
  const mk = (label, data, unit, lowerIsBetter) => ({ label, data, unit, lowerIsBetter })

  function toWeekly(dailyData, weekLabels) {
    const chunkSize = Math.ceil(dailyData.length / weekLabels.length)
    return weekLabels.map((_, wi) => {
      const chunk = dailyData.slice(wi * chunkSize, (wi + 1) * chunkSize)
      return Math.round(chunk.reduce((a, b) => a + b, 0) / chunk.length)
    })
  }

  if (dateRange === 'Last 7 days' || dateRange === 'Custom range') {
    return {
      daily: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        metrics: {
          reEngagements:      mk('Re-engagements', D7_REENG,   '', false),
          outreachSent:       mk('Outreach Sent',  D7_OUTREACH, '', false),
          responseRate:       mk('Response Rate',  D7_RESP,    '%', false),
          appointmentsBooked: mk('Appts Booked',   D7_APPTS,  '', false),
        },
      },
      weekly: null,
      channelSummary: { calls: 89, sms: 312, emails: 198 },
    }
  }

  if (dateRange === 'Last 14 days') {
    const d14Labels = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 2, 17 + i)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    const d14 = (base) => [...base.map((v) => Math.round(v * 0.88)), ...base.map((v) => Math.round(v * 1.05))]
    const wkLabels14 = ['Week 1', 'Week 2']
    const d14Reeng = d14(D7_REENG); const d14Out = d14(D7_OUTREACH); const d14Resp = d14(D7_RESP); const d14Appts = d14(D7_APPTS)
    return {
      daily: {
        days: d14Labels,
        metrics: {
          reEngagements:      mk('Re-engagements', d14Reeng, '', false),
          outreachSent:       mk('Outreach Sent',  d14Out,  '', false),
          responseRate:       mk('Response Rate',  d14Resp, '%', false),
          appointmentsBooked: mk('Appts Booked',   d14Appts,'', false),
        },
      },
      weekly: {
        days: wkLabels14,
        metrics: {
          reEngagements:      mk('Re-engagements', toWeekly(d14Reeng, wkLabels14), '', false),
          outreachSent:       mk('Outreach Sent',  toWeekly(d14Out,   wkLabels14), '', false),
          responseRate:       mk('Response Rate',  toWeekly(d14Resp,  wkLabels14), '%', false),
          appointmentsBooked: mk('Appts Booked',   toWeekly(d14Appts, wkLabels14), '', false),
        },
      },
      channelSummary: { calls: 165, sms: 578, emails: 367 },
    }
  }

  const isLastMonth = dateRange === 'Last month'
  const isThisMonth = dateRange === 'This month'
  const scale = isLastMonth ? 0.88 : 1.0
  const m = PERIOD_MULTIPLIERS[dateRange] ?? 1.0
  const d30Labels = Array.from({ length: 30 }, (_, i) => {
    const base = isLastMonth ? new Date(2026, 1, 1) : new Date(2026, 2, 1)
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const d30Reeng = Array.from({ length: 30 }, (_, i) => Math.round((D7_REENG[i % 7]    * 1.1 + i * 0.05) * scale))
  const d30Out   = Array.from({ length: 30 }, (_, i) => Math.round((D7_OUTREACH[i % 7] * 1.1 + i * 0.8)  * scale))
  const d30Resp  = Array.from({ length: 30 }, (_, i) => Math.round((D7_RESP[i % 7]     * 1.0)             * scale))
  const d30Appts = Array.from({ length: 30 }, (_, i) => Math.round((D7_APPTS[i % 7]    * 1.1 + i * 0.05) * scale))
  const wkLabels = isLastMonth ? ['Feb Wk 1','Feb Wk 2','Feb Wk 3','Feb Wk 4']
    : isThisMonth ? ['Mar Wk 1','Mar Wk 2','Mar Wk 3','Mar Wk 4']
    : ['Mar Wk 1','Mar Wk 2','Mar Wk 3','Mar Wk 4','Mar Wk 5']

  return {
    daily: {
      days: d30Labels,
      metrics: {
        reEngagements:      mk('Re-engagements', d30Reeng, '', false),
        outreachSent:       mk('Outreach Sent',  d30Out,  '', false),
        responseRate:       mk('Response Rate',  d30Resp, '%', false),
        appointmentsBooked: mk('Appts Booked',   d30Appts,'', false),
      },
    },
    weekly: {
      days: wkLabels,
      metrics: {
        reEngagements:      mk('Re-engagements', toWeekly(d30Reeng, wkLabels), '', false),
        outreachSent:       mk('Outreach Sent',  toWeekly(d30Out,   wkLabels), '', false),
        responseRate:       mk('Response Rate',  toWeekly(d30Resp,  wkLabels), '%', false),
        appointmentsBooked: mk('Appts Booked',   toWeekly(d30Appts, wkLabels), '', false),
      },
    },
    channelSummary: {
      calls:  Math.round(89  * m),
      sms:    Math.round(312 * m),
      emails: Math.round(198 * m),
    },
  }
}

// TODO: GET /api/dealer/:dealerId/customers
export const customersData = [
  {
    id: 'cust-001',
    name: 'Sarah Delgado',
    initials: 'SD',
    avatarColor: 'bg-violet-500',
    phone: '+1 (555) 234-7890',
    email: 'sdelgado@email.com',
    source: 'Internet Lead',
    salesperson: 'Jordan M.',
    buyingStage: 'CLOSING',
    outcome: 'qualified',
    swimlaneStage: 'APPOINTMENT_BOOKED',
    vehicle: '2024 Toyota Camry XSE',
    vehiclePrice: 31200,
    vehicleDaysOnLot: 14,
    lastContact: '2h ago',
    lastInteractedTs: Date.now() - 2 * 60 * 60 * 1000,
    lastInteracted: 'Today, 9:20 AM',
    lastInteractionSummary: 'Sarah re-confirmed her $450/mo budget and asked to come in this week to finalize the deal.',
    budget: '$450/mo',
    financeType: 'Finance',
    lastSignal: 'Budget confirmed · Ready to talk numbers',
    nextAppointment: { date: 'Today, TBD', type: 'Follow-up call' },
    touchCount: 8,
    actionItemCount: 2,
    engagementTrend: 'improving',
    engagementDetail: 'Responded 2 hours ago. 4 messages exchanged today.',
    conversationOpener: "Sarah confirmed her $450/mo budget and loved the Camry XSE on her test drive last week. Lead with financing — she's comparing with another dealer. Push on the rate and availability of the XSE in Midnight Black.",
    features: ['Sunroof', 'Sport package', 'Black exterior'],
    useCase: 'Daily commute — 35 miles each way',
    actionItems: [
      "Confirm financing rate — she's comparing with another dealer",
      'Check Midnight Black XSE availability before calling',
    ],
    stageHistory: [
      { stage: 'CLOSING',     label: 'Ready to Buy',    timestamp: 'Today, 9:21 AM',    source: 'agent' },
      { stage: 'NEGOTIATION', label: 'Talking Numbers', timestamp: 'Mar 21, 3:17 PM',   source: 'agent' },
      { stage: 'EVALUATION',  label: 'Ready to Visit',  timestamp: 'Mar 19, 10:05 AM',  source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 9, timestamp: 'Today, 9:20 AM', agent: false, body: 'Yes I am! Can I come in this week? I have a $450/mo limit in mind.' },
      { id: 't2', type: 'sms', sortKey: 8, timestamp: 'Today, 9:14 AM', agent: true, body: 'Hi Sarah! Following up on your test drive last week. The Camry XSE in Midnight Black is still available. Ready to talk numbers?' },
      { id: 't3', type: 'stage_change', sortKey: 7, timestamp: 'Today, 9:21 AM', agent: true, fromStage: 'Talking Numbers', toStage: 'Ready to Buy', title: 'Stage updated' },
      { id: 't4', type: 'agent_action', sortKey: 6, timestamp: 'Mar 21, 3:17 PM', agent: true, body: 'Action item created: Send financing comparison — XSE at loyalty rate vs SE.' },
      { id: 't5', type: 'call', sortKey: 5, timestamp: 'Mar 21, 3:15 PM', agent: true, body: 'Discussed financing options. Lead confirmed $450/mo ceiling. Explained payment estimates for XSE vs SE trim.', duration: '6:12', callOutcome: 'connected', transcript: [
        'Agent: Hi Sarah! How did you feel about the test drive?',
        'Sarah: I loved it honestly. The sport package feels really nice.',
        "Agent: At $31,200 on a 60-month term, you're at roughly $470–480 a month.",
        'Sarah: I really need to stay under $450.',
        "Agent: We can look at the SE trim or the loyalty financing rate. Let me pull the numbers.",
      ]},
      { id: 't6', type: 'appointment', sortKey: 4, timestamp: 'Mar 21, 11:00 AM', agent: false, body: 'Camry XSE test drive completed. Very positive reaction to sport package.', title: 'Test Drive · Attended' },
      { id: 't7', type: 'call', sortKey: 3, timestamp: 'Mar 20, 3:15 PM', agent: true, body: 'Confirmed test drive booking. Lead asked about directions and timing.', duration: '2:03', callOutcome: 'connected' },
      { id: 't8', type: 'stage_change', sortKey: 2, timestamp: 'Mar 19, 10:05 AM', agent: true, fromStage: 'Just Looking', toStage: 'Ready to Visit', title: 'Stage updated' },
      { id: 't9', type: 'call', sortKey: 1, timestamp: 'Mar 19, 10:00 AM', agent: true, body: 'First contact after internet inquiry. Confirmed interest, discussed available trims and pricing.', duration: '4:30', callOutcome: 'connected', transcript: [
        'Agent: Hi Sarah, thanks for reaching out about the Camry. Were you interested in the XSE trim?',
        'Sarah: Yeah, I saw it on the website. Does it come in black?',
        'Agent: Yes, Midnight Black Metallic is available in stock right now at $31,200.',
        'Sarah: Can I come in this week to take a look?',
        "Agent: Absolutely — I'll get you set up for a test drive.",
      ]},
    ],
  },
  {
    id: 'cust-002',
    name: 'Marcus Webb',
    initials: 'MW',
    avatarColor: 'bg-blue-500',
    phone: '+1 (555) 891-3344',
    email: 'mwebb@email.com',
    source: 'Phone Lead',
    salesperson: 'Mike D.',
    buyingStage: 'EVALUATION',
    outcome: 'in_progress',
    swimlaneStage: 'QUALIFIED',
    vehicle: '2023 Honda CR-V EX-L',
    vehiclePrice: 36500,
    vehicleDaysOnLot: 47,
    lastContact: '4h ago',
    lastInteractedTs: Date.now() - 4 * 60 * 60 * 1000,
    lastInteracted: 'Today, 8:05 AM',
    lastInteractionSummary: 'Marcus re-engaged after 3 weeks of silence — asked about current Honda incentives. Re-engagement is warm, not hot.',
    budget: '$35,000',
    financeType: 'Finance',
    lastSignal: 'Re-engaged after 21 days cold — window open',
    nextAppointment: null,
    touchCount: 6,
    actionItemCount: 1,
    engagementTrend: 'improving',
    engagementDetail: 'Re-engaged this morning after 21 days of silence.',
    conversationOpener: "Marcus went cold after a price pushback 3 weeks ago. He just re-engaged — don't lead with price. Lead with new inventory and current incentives. Ask what changed.",
    features: ['All-wheel drive', 'Heated seats', 'Apple CarPlay'],
    useCase: 'Family of 4 — school runs and weekend trips',
    actionItems: ["Don't lead with price — ask what changed since last contact."],
    stageHistory: [
      { stage: 'EVALUATION', label: 'Ready to Visit',    timestamp: 'Today, 8:06 AM', source: 'agent' },
      { stage: 'SHOPPING',   label: 'Comparing Options', timestamp: 'Mar 1, 2:10 PM', source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 5, timestamp: 'Today, 8:05 AM', agent: false, body: "Yeah I've been thinking about it actually. What incentives are available right now?" },
      { id: 't2', type: 'sms', sortKey: 4, timestamp: 'Today, 7:48 AM', agent: true, body: "Hey Marcus — just wanted to check back in. We have new CR-V inventory and current Honda incentives that might work better for you. Still interested?" },
      { id: 't3', type: 'stage_change', sortKey: 3, timestamp: 'Today, 8:06 AM', agent: true, fromStage: 'Comparing Options', toStage: 'Ready to Visit', title: 'Stage updated' },
      { id: 't4', type: 'call', sortKey: 2, timestamp: 'Mar 1, 2:10 PM', agent: true, body: "Price discussion. Lead pushed back on $36,500 — said he found similar for $34K online. Call ended without resolution.", duration: '8:02', callOutcome: 'connected' },
      { id: 't5', type: 'call', sortKey: 1, timestamp: 'Feb 26, 11:30 AM', agent: true, body: 'First contact after Cars.com inquiry. Strong interest in CR-V EX-L. Requested test drive.', duration: '5:18', callOutcome: 'connected', transcript: [
        'Agent: Hi Marcus, thanks for reaching out about the CR-V EX-L.',
        "Marcus: Yeah I saw it online. What's the difference between the EX-L and the Sport?",
        'Agent: The EX-L gives you the premium interior — leather seats, heated seats, power liftgate.',
        "Marcus: The EX-L sounds right. What's the price?",
        "Agent: The EX-L AWD is at $36,500. Can I set up a test drive?",
        'Marcus: Yeah, let\'s do it.',
      ]},
    ],
  },
  {
    id: 'cust-003',
    name: 'Jessica Parker',
    initials: 'JP',
    avatarColor: 'bg-pink-500',
    phone: '+1 (555) 417-0022',
    email: 'jparker@email.com',
    source: 'Email Lead',
    salesperson: 'Jordan M.',
    buyingStage: 'NEGOTIATION',
    outcome: 'appointment_set',
    swimlaneStage: 'APPOINTMENT_BOOKED',
    vehicle: '2024 Ford Mustang GT',
    vehiclePrice: 44800,
    vehicleDaysOnLot: 9,
    lastContact: 'Yesterday',
    lastInteractedTs: Date.now() - 24 * 60 * 60 * 1000,
    lastInteracted: 'Yesterday, 4:30 PM',
    lastInteractionSummary: 'Confirmed her Saturday 10 AM test drive appointment and asked about trade-in value for her 2020 Civic.',
    budget: '$500/mo',
    financeType: 'Finance',
    lastSignal: 'Appointment confirmed Saturday · Trade-in question pending',
    nextAppointment: { date: 'Sat, 10:00 AM', type: 'Test Drive' },
    touchCount: 5,
    actionItemCount: 1,
    engagementTrend: 'improving',
    engagementDetail: 'Appointment set. Last responded 18 hours ago.',
    conversationOpener: "Jessica is bringing her 2020 Civic for trade-in evaluation Saturday. Pull the trade-in estimate before she arrives. She's already excited about the GT — close on test drive day.",
    features: ['Manual transmission', 'Performance package', 'Race Red exterior'],
    useCase: 'Weekend driver — wants something exciting',
    actionItems: ['Pull trade-in estimate for 2020 Honda Civic Sport before Saturday appointment.'],
    stageHistory: [
      { stage: 'NEGOTIATION', label: 'Talking Numbers', timestamp: 'Yesterday, 4:31 PM', source: 'agent' },
      { stage: 'EVALUATION',  label: 'Ready to Visit',  timestamp: 'Mar 25, 11:05 AM',  source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 5, timestamp: 'Yesterday, 4:30 PM', agent: false, body: 'Yes, Saturday at 10 works! Will you be able to look at my current car for trade-in too?' },
      { id: 't2', type: 'sms', sortKey: 4, timestamp: 'Yesterday, 4:15 PM', agent: true, body: "Great news Jessica! We have the GT in Race Red with the performance package. Are you free Saturday at 10 AM for a test drive?" },
      { id: 't3', type: 'appointment', sortKey: 3, timestamp: 'Yesterday, 4:31 PM', agent: true, body: 'Test drive booked — Saturday at 10:00 AM. Ford Mustang GT.', title: 'Appointment Set' },
      { id: 't4', type: 'stage_change', sortKey: 2, timestamp: 'Yesterday, 4:31 PM', agent: true, fromStage: 'Ready to Visit', toStage: 'Talking Numbers', title: 'Stage updated' },
      { id: 't5', type: 'call', sortKey: 1, timestamp: 'Mar 25, 11:00 AM', agent: true, body: 'First contact via email inquiry. Confirmed interest in Mustang GT, manual transmission preference.', duration: '3:45', callOutcome: 'connected' },
    ],
  },
  {
    id: 'cust-004',
    name: 'David Chen',
    initials: 'DC',
    avatarColor: 'bg-indigo-500',
    phone: '+1 (555) 302-8891',
    email: 'dchen@email.com',
    source: 'Walk-in',
    salesperson: 'Sarah K.',
    buyingStage: 'SHOPPING',
    outcome: 'in_progress',
    swimlaneStage: 'ENGAGED',
    vehicle: '2024 Honda Civic Sport',
    vehiclePrice: 26400,
    vehicleDaysOnLot: 3,
    lastContact: '2 days ago',
    lastInteractedTs: Date.now() - 2 * 24 * 60 * 60 * 1000,
    lastInteracted: 'Mar 28, 2:00 PM',
    lastInteractionSummary: 'Came in as a walk-in and test drove the Civic Sport. No price decision yet — will think it over. Agent followed up via SMS, no reply.',
    budget: '$350/mo',
    financeType: 'Lease',
    lastSignal: 'Walk-in test drive completed · No decision yet',
    nextAppointment: null,
    touchCount: 3,
    actionItemCount: 0,
    engagementTrend: 'flat',
    engagementDetail: 'No response to follow-up SMS 2 days ago.',
    conversationOpener: "David walked in and test drove the Civic Sport. Hasn't responded to follow-up. Try a call — he may be comparing at other dealers.",
    features: ['Sunroof', 'Apple CarPlay', 'Sport trim'],
    useCase: 'First car after college — commuting to work',
    actionItems: [],
    stageHistory: [
      { stage: 'SHOPPING', label: 'Comparing Options', timestamp: 'Mar 28, 2:01 PM', source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 3, timestamp: 'Mar 28, 5:00 PM', agent: true, body: 'Hi David! Great meeting you today. Let me know if you have any questions about the Civic Sport — happy to help you compare options.' },
      { id: 't2', type: 'stage_change', sortKey: 2, timestamp: 'Mar 28, 2:01 PM', agent: true, fromStage: 'Just Looking', toStage: 'Comparing Options', title: 'Stage updated' },
      { id: 't3', type: 'appointment', sortKey: 1, timestamp: 'Mar 28, 2:00 PM', agent: false, body: 'Walk-in visit. Tested Honda Civic Sport. No purchase decision.', title: 'Walk-in · Test Drive' },
    ],
  },
  {
    id: 'cust-005',
    name: 'Laura Adams',
    initials: 'LA',
    avatarColor: 'bg-teal-500',
    phone: '+1 (555) 561-4409',
    email: 'ladams@email.com',
    source: 'Internet Lead',
    salesperson: 'Mike D.',
    buyingStage: 'RESEARCH',
    outcome: 'in_progress',
    swimlaneStage: 'NEW',
    vehicle: '2024 Subaru Outback',
    vehiclePrice: 32900,
    vehicleDaysOnLot: 21,
    lastContact: '3 days ago',
    lastInteractedTs: Date.now() - 3 * 24 * 60 * 60 * 1000,
    lastInteracted: 'Mar 27, 10:00 AM',
    lastInteractionSummary: 'Responded to speed-to-lead SMS asking about AWD options and towing capacity. Comparing Outback vs RAV4 vs CR-V — not yet ready to visit.',
    budget: '$400/mo',
    financeType: 'Finance',
    lastSignal: 'Asking about AWD + towing — early research phase',
    nextAppointment: null,
    touchCount: 2,
    actionItemCount: 0,
    engagementTrend: 'flat',
    engagementDetail: 'Two SMS exchanges. Researching, not yet ready to visit.',
    conversationOpener: "Laura is early-stage — comparing Outback vs RAV4 vs CR-V. She wants AWD and towing for camping. Lead with the Outback's towing rating. Don't push an appointment yet.",
    features: ['All-wheel drive', 'Towing package', 'Roof rails'],
    useCase: 'Weekend camping and hiking — needs AWD + towing',
    actionItems: [],
    stageHistory: [
      { stage: 'RESEARCH', label: 'Just Looking', timestamp: 'Mar 27, 10:01 AM', source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 3, timestamp: 'Mar 27, 10:00 AM', agent: false, body: "What's the towing capacity on the Outback? Also comparing to the RAV4 and CR-V." },
      { id: 't2', type: 'sms', sortKey: 2, timestamp: 'Mar 27, 9:50 AM', agent: true, body: "Hi Laura! Thanks for your interest in the Subaru Outback. I'd love to tell you more — what features matter most to you?" },
      { id: 't3', type: 'call', sortKey: 1, timestamp: 'Mar 27, 9:45 AM', agent: true, body: 'Speed-to-lead call. No answer.', duration: '0:28', callOutcome: 'no_answer' },
    ],
  },
  {
    id: 'cust-006',
    name: 'Brian Benstock',
    initials: 'BB',
    avatarColor: 'bg-orange-500',
    phone: '+1 (555) 778-2200',
    email: 'bbenstock@email.com',
    source: 'Referral',
    salesperson: 'Tom R.',
    buyingStage: 'EVALUATION',
    outcome: 'in_progress',
    swimlaneStage: 'QUALIFIED',
    vehicle: '2024 Toyota Tacoma TRD Off-Road',
    vehiclePrice: 48200,
    vehicleDaysOnLot: 6,
    lastContact: '4 days ago',
    lastInteractedTs: Date.now() - 4 * 24 * 60 * 60 * 1000,
    lastInteracted: 'Mar 26, 1:15 PM',
    lastInteractionSummary: 'Called in with an unresolved AC service complaint — escalated to Tom. Also expressed interest in the Tacoma TRD Off-Road.',
    budget: '$600/mo',
    financeType: 'Finance',
    lastSignal: 'Escalated — AC complaint + new vehicle interest',
    nextAppointment: null,
    touchCount: 4,
    actionItemCount: 2,
    engagementTrend: 'cooling',
    engagementDetail: 'Escalated to human. No resolution on service complaint yet.',
    conversationOpener: "Brian is frustrated about a service issue — resolve that first before pitching the Tacoma. Tom has context. Don't re-engage via AI until the complaint is closed.",
    features: ['TRD Off-Road package', 'Towing hitch', 'Bed liner'],
    useCase: 'Contractor work + weekend off-roading',
    actionItems: [
      'Resolve AC complaint — escalated to Tom R.',
      'Follow up on Tacoma TRD interest once service issue is closed.',
    ],
    stageHistory: [
      { stage: 'EVALUATION', label: 'Ready to Visit', timestamp: 'Mar 26, 1:16 PM', source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'call', sortKey: 3, timestamp: 'Mar 26, 1:15 PM', agent: false, body: 'Inbound — Brian called about unresolved AC service issue. Also mentioned interest in a new truck.', duration: '4:12', callOutcome: 'connected' },
      { id: 't2', type: 'agent_action', sortKey: 2, timestamp: 'Mar 26, 1:16 PM', agent: true, body: 'Escalated to Tom R. — service complaint requires human resolution before AI re-engagement.' },
      { id: 't3', type: 'stage_change', sortKey: 1, timestamp: 'Mar 26, 1:16 PM', agent: true, fromStage: 'Just Looking', toStage: 'Ready to Visit', title: 'Stage updated' },
    ],
  },
  {
    id: 'cust-007',
    name: 'Maria Garcia',
    initials: 'MG',
    avatarColor: 'bg-rose-500',
    phone: '+1 (555) 920-3311',
    email: 'mgarcia@email.com',
    source: 'Phone Lead',
    salesperson: 'Jordan M.',
    buyingStage: 'CLOSING',
    outcome: 'appointment_set',
    swimlaneStage: 'STORE_VISIT',
    vehicle: '2023 Honda CR-V EX-L',
    vehiclePrice: 35900,
    vehicleDaysOnLot: 33,
    lastContact: '5 days ago',
    lastInteractedTs: Date.now() - 5 * 24 * 60 * 60 * 1000,
    lastInteracted: 'Mar 25, 3:30 PM',
    lastInteractionSummary: "Confirmed OTD price of $35,900 works. Asked to have paperwork ready for Friday's purchase appointment.",
    budget: '$480/mo',
    financeType: 'Finance',
    lastSignal: 'OTD price confirmed · Friday purchase appointment set',
    nextAppointment: { date: 'Fri, 11:00 AM', type: 'Purchase' },
    touchCount: 9,
    actionItemCount: 0,
    engagementTrend: 'improving',
    engagementDetail: 'Friday purchase appointment confirmed. OTD paperwork requested.',
    conversationOpener: "Maria is ready to buy Friday — have OTD paperwork ready at $35,900. She's been price-sensitive but agreed. Have finance ready.",
    features: ['Leather seats', 'Heated seats', 'AWD'],
    useCase: 'Family SUV — 3 kids, school and errands',
    actionItems: [],
    stageHistory: [
      { stage: 'CLOSING',     label: 'Ready to Buy',    timestamp: 'Mar 25, 3:31 PM',  source: 'agent' },
      { stage: 'NEGOTIATION', label: 'Talking Numbers', timestamp: 'Mar 22, 10:00 AM', source: 'agent' },
      { stage: 'EVALUATION',  label: 'Ready to Visit',  timestamp: 'Mar 18, 2:00 PM',  source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 6, timestamp: 'Mar 25, 3:30 PM', agent: false, body: "That OTD price works for me. I'll see you Friday at 11. Can you have the paperwork ready?" },
      { id: 't2', type: 'sms', sortKey: 5, timestamp: 'Mar 25, 3:10 PM', agent: true, body: 'Hi Maria! OTD on the CR-V EX-L AWD including tax and fees comes to $35,900. Financing at $479/mo on 72 months. Does Friday at 11 AM work?' },
      { id: 't3', type: 'stage_change', sortKey: 4, timestamp: 'Mar 25, 3:31 PM', agent: true, fromStage: 'Talking Numbers', toStage: 'Ready to Buy', title: 'Stage updated' },
      { id: 't4', type: 'appointment', sortKey: 3, timestamp: 'Mar 25, 3:31 PM', agent: true, body: 'Purchase appointment set — Friday at 11:00 AM.', title: 'Appointment Set · Purchase' },
      { id: 't5', type: 'call', sortKey: 2, timestamp: 'Mar 22, 10:00 AM', agent: true, body: 'Discussed pricing in detail. Maria asked for OTD price to be sent via text after the call.', duration: '9:14', callOutcome: 'connected' },
      { id: 't6', type: 'call', sortKey: 1, timestamp: 'Mar 18, 2:00 PM', agent: true, body: 'First contact. Phone lead — Maria called the lot directly. Confirmed CR-V EX-L interest and booked a test drive.', duration: '6:30', callOutcome: 'connected' },
    ],
  },
  {
    id: 'cust-008',
    name: 'Tommy Lee',
    initials: 'TL',
    avatarColor: 'bg-cyan-500',
    phone: '+1 (555) 643-7781',
    email: 'tlee@email.com',
    source: 'Internet Lead',
    salesperson: 'Sarah K.',
    buyingStage: 'SHOPPING',
    outcome: 'in_progress',
    swimlaneStage: 'ENGAGED',
    vehicle: '2023 Toyota RAV4 XLE',
    vehiclePrice: 34200,
    vehicleDaysOnLot: 38,
    lastContact: '1 week ago',
    lastInteractedTs: Date.now() - 7 * 24 * 60 * 60 * 1000,
    lastInteracted: 'Mar 23, 11:00 AM',
    lastInteractionSummary: 'Responded to Day 7 follow-up asking about lease options. No appointment set. Lease vs finance still undecided.',
    budget: '$380/mo',
    financeType: 'Undecided',
    lastSignal: 'Asking about lease vs finance — still shopping',
    nextAppointment: null,
    touchCount: 4,
    actionItemCount: 0,
    engagementTrend: 'flat',
    engagementDetail: 'Low engagement. Responded once in 7 days.',
    conversationOpener: "Tommy is casually shopping. The RAV4 has been on the lot 38 days — incentive to move it. Try a lease offer at a lower monthly to reactivate interest.",
    features: ['Hybrid', 'Lane assist', 'Wireless CarPlay'],
    useCase: 'Replacing aging 2016 SUV — wife drives daily',
    actionItems: [],
    stageHistory: [
      { stage: 'SHOPPING', label: 'Comparing Options', timestamp: 'Mar 23, 11:01 AM', source: 'agent' },
    ],
    timeline: [
      { id: 't1', type: 'sms', sortKey: 4, timestamp: 'Mar 23, 11:00 AM', agent: false, body: "Are lease options available on the RAV4? What would the monthly look like?" },
      { id: 't2', type: 'sms', sortKey: 3, timestamp: 'Mar 23, 9:30 AM', agent: true, body: "Hi Tommy! Checking in on the RAV4 XLE — it's still available and we have some great options. Would you like to come in this week for a test drive?" },
      { id: 't3', type: 'sms', sortKey: 2, timestamp: 'Mar 18, 2:00 PM', agent: true, body: "Hi Tommy, thanks for your interest in the Toyota RAV4! I'd love to answer any questions you have." },
      { id: 't4', type: 'call', sortKey: 1, timestamp: 'Mar 18, 1:55 PM', agent: true, body: 'Speed-to-lead call. No answer.', duration: '0:30', callOutcome: 'no_answer' },
    ],
  },
]

// ─── Leads by Source ─────────────────────────────────────
// TODO: GET /api/dealer/:dealerId/leads-by-source?period=<dateRange>
export const leadsBySourceData = {
  sources: [
    { key: 'internet', label: 'Internet', count: 505, pct: 66.3, color: '#4F46E5' },
    { key: 'walkin',   label: 'Walk-in',  count: 117, pct: 15.4, color: '#0D9488' },
    { key: 'phone',    label: 'Phone',    count: 101, pct: 13.3, color: '#D97706' },
    { key: 'other',    label: 'Other',    count: 39,  pct: 5.1,  color: '#7C3AED' },
  ],
  // Each column = one MetricsBar funnel stage.
  // `rate` = conversion rate shown inline below the count.
  funnel: [
    {
      metric: 'Leads Interacted',
      internet: { count: 505  },
      walkin:   { count: 117  },
      phone:    { count: 101  },
      other:    { count: 39   },
    },
    {
      metric: 'Leads Qualified',
      internet: { count: 338,  rate: '66.9%' },
      walkin:   { count: 117,  rate: '100%'  },
      phone:    { count: 101,  rate: '100%'  },
      other:    { count: 39,   rate: '100%'  },
    },
    {
      metric: 'After Hours Leads',
      internet: { count: 61  },
      walkin:   { count: null },
      phone:    { count: 18  },
      other:    { count: 10  },
    },
    {
      metric: 'Human Handoffs',
      internet: { count: 22  },
      walkin:   { count: 14  },
      phone:    { count: 12  },
      other:    { count: 4   },
    },
    {
      metric: 'Appointments Booked',
      internet: { count: 109, rate: '21.6%' },
      walkin:   { count: null             },
      phone:    { count: 60,  rate: '59.4%' },
      other:    { count: 18,  rate: '46.2%' },
      highlight: true,
    },
  ],
}
