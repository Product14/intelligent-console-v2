import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  Eye,
  Filter,
  GitBranch,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Pause,
  Phone,
  PhoneOutgoing,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
  XCircle,
  X,
  AlertTriangle,
  Rocket,
  PhoneCall,
  Car,
  DollarSign,
  Megaphone,
  Download,
  Info,
  PhoneOff,
  PhoneMissed,
  VoicemailIcon,
  UserX,
  XOctagon,
} from 'lucide-react'

/* ─── Status / type configs ──────────────────────────────────────── */

const CAMPAIGN_STATUS = {
  active:    { label: 'Active',    bg: 'var(--spyne-success-subtle)', color: 'var(--spyne-success-text)', border: 'var(--spyne-success-muted)', dot: 'var(--spyne-success)' },
  paused:    { label: 'Paused',    bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)', border: 'var(--spyne-warning-muted)', dot: 'var(--spyne-warning)' },
  draft:     { label: 'Draft',     bg: 'var(--spyne-surface-hover)',  color: 'var(--spyne-text-muted)',   border: 'var(--spyne-border)',         dot: 'var(--spyne-border-strong)' },
  completed: { label: 'Completed', bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand-dark)',   border: 'var(--spyne-brand-muted)',    dot: 'var(--spyne-brand)' },
}

const STEP_TYPE_CONFIG = {
  trigger:   { label: 'Trigger',      icon: Zap,            color: 'var(--spyne-warning)',     bg: 'var(--spyne-warning-subtle)' },
  sms:       { label: 'Send SMS',     icon: MessageSquare,  color: 'var(--spyne-brand)',       bg: 'var(--spyne-brand-subtle)' },
  call:      { label: 'AI Call',      icon: Phone,          color: 'var(--spyne-info)',        bg: 'var(--spyne-info-subtle)' },
  email:     { label: 'Send Email',   icon: Mail,           color: 'var(--spyne-danger)',      bg: 'var(--spyne-danger-subtle)' },
  wait:      { label: 'Wait',         icon: Clock,          color: 'var(--spyne-text-muted)',  bg: 'var(--spyne-surface-hover)' },
  condition: { label: 'Condition',    icon: GitBranch,      color: 'var(--spyne-warning)',     bg: 'var(--spyne-warning-subtle)' },
  action:    { label: 'AI Action',    icon: Sparkles,       color: 'var(--spyne-brand)',       bg: 'var(--spyne-brand-subtle)' },
  transfer:  { label: 'Warm Transfer', icon: UserCheck,     color: 'var(--spyne-success)',     bg: 'var(--spyne-success-subtle)' },
  end:       { label: 'End',          icon: Check,          color: 'var(--spyne-success)',     bg: 'var(--spyne-success-subtle)' },
}

/* ─── Main Component ─────────────────────────────────────────────── */

/* ─── Outbound pipeline configs ──────────────────────────────────── */

const CHANNEL_ICON = {
  SMS: MessageSquare,
  Voice: Phone,
  Email: Mail,
  AI: Sparkles,
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', bg: 'var(--spyne-danger-subtle)', color: 'var(--spyne-danger-text)', border: 'var(--spyne-danger-muted)' },
  high:     { label: 'High',     bg: 'var(--spyne-warning-subtle)', color: 'var(--spyne-warning-text)', border: 'var(--spyne-warning-muted)' },
  medium:   { label: 'Medium',   bg: 'var(--spyne-info-subtle)',    color: 'var(--spyne-info-text)',    border: 'var(--spyne-info-muted)' },
  low:      { label: 'Low',      bg: 'var(--spyne-brand-subtle)',   color: 'var(--spyne-brand-dark)',   border: 'var(--spyne-brand-muted)' },
}

const LEAD_STATUS_CONFIG = {
  awaiting_contact: { label: 'Awaiting Contact', color: 'var(--spyne-warning-text)', bg: 'var(--spyne-warning-subtle)' },
  in_sequence:      { label: 'In Sequence',      color: 'var(--spyne-brand-dark)',   bg: 'var(--spyne-brand-subtle)' },
  responded:        { label: 'Responded',         color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
  no_response:      { label: 'No Response',       color: 'var(--spyne-text-muted)',   bg: 'var(--spyne-surface-hover)' },
  booked:           { label: 'Appt Booked',       color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
}

const SUB_TABS = [
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'pipeline',  label: 'Pipeline',  icon: Sparkles },
]

/* ─── Main Component ─────────────────────────────────────────────── */

export default function CampaignsPage({ data, outboundData, agent, prefillVehicles, onClearPrefill, lotData }) {
  const [subTab, setSubTab] = useState('campaigns')
  const [view, setView] = useState('list')             // 'list' | 'detail' | 'builder'
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [showPreLaunch, setShowPreLaunch] = useState(false)
  const [pendingCampaign, setPendingCampaign] = useState(null)
  const [showLotCampaign, setShowLotCampaign] = useState(false)
  const [lotVehicles, setLotVehicles] = useState(null)

  // Handle prefill from Lot View
  useEffect(() => {
    if (prefillVehicles && prefillVehicles.length > 0) {
      setLotVehicles(prefillVehicles)
      setShowLotCampaign(true)
      onClearPrefill?.()
    }
  }, [prefillVehicles])

  const selectedCampaign = data.campaigns.find((c) => c.id === selectedId)

  const openDetail = (id) => { setSelectedId(id); setView('detail') }
  const openBuilder = (id) => { setSelectedId(id); setView('builder') }
  const goBack = () => { setView('list'); setSelectedId(null) }

  const handleCreateComplete = (campaignDraft) => {
    setPendingCampaign(campaignDraft)
    setShowCreateWizard(false)
    setShowPreLaunch(true)
  }

  const handleLaunch = () => {
    setShowPreLaunch(false)
    setPendingCampaign(null)
  }

  const handleLotCampaignLaunch = () => {
    setShowLotCampaign(false)
    setLotVehicles(null)
  }

  if (view === 'detail' && selectedCampaign) {
    return <CampaignDetail campaign={selectedCampaign} onBack={goBack} onEditWorkflow={() => openBuilder(selectedCampaign.id)} />
  }
  if (view === 'builder' && selectedCampaign) {
    return <WorkflowBuilder campaign={selectedCampaign} onBack={() => openDetail(selectedCampaign.id)} />
  }

  /* ─── List view ─── */
  const filtered = data.campaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Campaigns</h1>
          <p className="spyne-body-sm mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>
            {data.campaigns.length} campaigns · {data.campaigns.filter((c) => c.status === 'active').length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          {agent && <AgentStatusPill agent={agent} />}
          <button className="spyne-btn-primary" style={{ gap: 6 }} onClick={() => setShowCreateWizard(true)}>
            <Plus size={14} strokeWidth={2.5} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 p-1" style={{ background: 'var(--spyne-surface-hover)', borderRadius: 'var(--spyne-radius-md)', width: 'fit-content' }}>
        {SUB_TABS.map((tab) => {
          const active = subTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 transition-all cursor-pointer"
              style={{
                borderRadius: 'var(--spyne-radius-sm)',
                background: active ? 'var(--spyne-surface)' : 'transparent',
                color: active ? 'var(--spyne-text-primary)' : 'var(--spyne-text-muted)',
                fontWeight: active ? 600 : 500,
                fontSize: 12,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <tab.icon size={13} strokeWidth={active ? 2.2 : 1.8} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {subTab === 'campaigns' && (
        <>
          {/* Summary metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.summaryMetrics.map((m) => (
              <div key={m.label} className="spyne-card p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <m.icon size={13} strokeWidth={2} style={{ color: 'var(--spyne-text-muted)' }} />
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{m.label}</span>
                </div>
                <span className="spyne-number" style={{ fontSize: 22, color: 'var(--spyne-text-primary)' }}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Recommended: Holding Cost Campaign */}
          {lotData && <HoldingCostRecommendation lotData={lotData} onCreateCampaign={(vehicles) => {
            setLotVehicles(vehicles)
            setShowLotCampaign(true)
          }} />}

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--spyne-text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="spyne-input w-full pl-9"
                style={{ fontSize: 12, height: 34 }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {['all', 'active', 'paused', 'draft', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`spyne-pill ${statusFilter === s ? 'spyne-pill-active' : ''}`}
                  style={{ height: 28, fontSize: 11, padding: '0 10px' }}
                >
                  {s === 'all' ? 'All' : CAMPAIGN_STATUS[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign cards */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="spyne-card px-5 py-12 text-center">
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No campaigns match your filters</p>
              </div>
            )}
            {filtered.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onOpen={() => openDetail(campaign.id)}
                onEditWorkflow={() => openBuilder(campaign.id)}
              />
            ))}
          </div>
        </>
      )}

      {subTab === 'pipeline' && outboundData && (
        <PipelineView data={outboundData} agent={agent} />
      )}

      {/* Create Campaign Wizard Modal */}
      {showCreateWizard && (
        <CreateCampaignWizard
          onClose={() => setShowCreateWizard(false)}
          onComplete={handleCreateComplete}
        />
      )}

      {/* Pre-Launch Intelligence Modal */}
      {showPreLaunch && (
        <PreLaunchIntelligenceModal
          campaign={pendingCampaign}
          onClose={() => { setShowPreLaunch(false); setPendingCampaign(null) }}
          onLaunch={handleLaunch}
          onOptimize={handleLaunch}
        />
      )}

      {/* Lot Holding Cost Campaign Modal */}
      {showLotCampaign && lotVehicles && (
        <LotCampaignModal
          vehicles={lotVehicles}
          onClose={() => { setShowLotCampaign(false); setLotVehicles(null) }}
          onLaunch={handleLotCampaignLaunch}
        />
      )}
    </div>
  )
}

/* ─── Campaign Card (list item) ──────────────────────────────────── */

function CampaignCard({ campaign, onOpen, onEditWorkflow }) {
  const st = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft

  return (
    <div
      className="spyne-card-interactive overflow-hidden"
      onClick={onOpen}
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: st.dot }}
              />
              <h3 className="spyne-heading truncate" style={{ color: 'var(--spyne-text-primary)' }}>
                {campaign.name}
              </h3>
              <span
                className="spyne-badge shrink-0"
                style={{ background: st.bg, color: st.color, borderColor: st.border }}
              >
                {st.label}
              </span>
            </div>
            <p className="spyne-body-sm ml-[18px]" style={{ color: 'var(--spyne-text-muted)' }}>
              {campaign.description}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="spyne-btn-ghost"
              onClick={(e) => { e.stopPropagation(); onEditWorkflow() }}
              title="Edit workflow"
            >
              <GitBranch size={13} />
              Workflow
            </button>
            <button className="spyne-btn-ghost" onClick={(e) => e.stopPropagation()} title="More options">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-6 ml-[18px] flex-wrap">
          <CampaignMiniMetric label="Enrolled" value={campaign.leadsEnrolled} />
          <CampaignMiniMetric label="Active" value={campaign.leadsActive} />
          <CampaignMiniMetric label="Response Rate" value={`${campaign.responseRate}%`} highlight={campaign.responseRate >= 50} />
          <CampaignMiniMetric label="Appts Booked" value={campaign.appointmentsBooked} highlight />
          <CampaignMiniMetric label="Conversion" value={`${campaign.conversionRate}%`} />

          {/* Mini workflow preview */}
          <div className="ml-auto flex items-center gap-1">
            {campaign.workflowSteps.slice(0, 5).map((step, i) => {
              const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
              const Icon = cfg.icon
              return (
                <div key={step.id} className="flex items-center gap-1">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: cfg.bg }}
                    title={step.label}
                  >
                    <Icon size={11} strokeWidth={2.2} style={{ color: cfg.color }} />
                  </div>
                  {i < Math.min(campaign.workflowSteps.length, 5) - 1 && (
                    <ArrowRight size={10} style={{ color: 'var(--spyne-border-strong)' }} />
                  )}
                </div>
              )
            })}
            {campaign.workflowSteps.length > 5 && (
              <span className="spyne-caption ml-1" style={{ color: 'var(--spyne-text-muted)' }}>
                +{campaign.workflowSteps.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 ml-[18px] mt-3 pt-3" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Type: <strong style={{ color: 'var(--spyne-text-secondary)' }}>{campaign.type}</strong>
          </span>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Created {campaign.createdAt}
          </span>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Channels: {campaign.channels.join(', ')}
          </span>
        </div>
      </div>
    </div>
  )
}

function CampaignMiniMetric({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-0">
      <span
        className="spyne-caption tabular-nums font-bold"
        style={{ color: highlight ? 'var(--spyne-success-text)' : 'var(--spyne-text-primary)', fontSize: 14 }}
      >
        {value}
      </span>
      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>{label}</span>
    </div>
  )
}

/* ─── Holding Cost Recommendation Card ──────────────────────────── */

function HoldingCostRecommendation({ lotData, onCreateCampaign }) {
  const [dismissed, setDismissed] = useState(false)

  const highCostVehicles = lotData.vehicles.filter((v) => v.daysOnLot >= 30)
  const criticalVehicles = lotData.vehicles.filter((v) => v.daysOnLot >= 45)
  const totalHoldingCost = highCostVehicles.reduce((sum, v) => sum + v.holdingCost, 0)
  const totalMatchedLeads = highCostVehicles.reduce((sum, v) => sum + v.matchedLeads, 0)
  const avgDays = highCostVehicles.length > 0
    ? Math.round(highCostVehicles.reduce((sum, v) => sum + v.daysOnLot, 0) / highCostVehicles.length)
    : 0

  if (dismissed || highCostVehicles.length === 0) return null

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: 'var(--spyne-radius-lg)',
        border: '1px solid var(--spyne-warning-muted)',
        background: 'var(--spyne-surface)',
      }}
    >
      {/* Accent top bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--spyne-warning), var(--spyne-danger))' }} />

      <div className="px-5 py-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'var(--spyne-warning-subtle)' }}
          >
            <DollarSign size={20} strokeWidth={2.2} style={{ color: 'var(--spyne-warning)' }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="spyne-caption px-1.5 py-0.5 font-bold" style={{
                borderRadius: 'var(--spyne-radius-pill)',
                background: 'var(--spyne-warning-subtle)',
                color: 'var(--spyne-warning-text)',
                fontSize: 10,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
                Recommended
              </span>
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>·</span>
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Based on lot inventory</span>
            </div>
            <h3 className="spyne-heading mb-1" style={{ color: 'var(--spyne-text-primary)' }}>
              Aging Inventory Push — {highCostVehicles.length} Vehicles Need Outbound
            </h3>
            <p className="spyne-body-sm mb-3" style={{ color: 'var(--spyne-text-muted)' }}>
              {criticalVehicles.length > 0 && (
                <span style={{ color: 'var(--spyne-danger-text)', fontWeight: 600 }}>
                  {criticalVehicles.length} critical (45+ days)
                </span>
              )}
              {criticalVehicles.length > 0 && ' · '}
              ${totalHoldingCost.toLocaleString()} accumulated holding cost · avg {avgDays} days on lot · {totalMatchedLeads} matched leads in CRM
            </p>

            {/* Vehicle pills */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {highCostVehicles.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
                  style={{
                    background: v.daysOnLot >= 45 ? 'var(--spyne-danger-subtle)' : 'var(--spyne-warning-subtle)',
                    border: `1px solid ${v.daysOnLot >= 45 ? 'var(--spyne-danger-muted)' : 'var(--spyne-warning-muted)'}`,
                  }}
                >
                  <Car size={11} style={{ color: v.daysOnLot >= 45 ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }} />
                  <span className="spyne-caption font-medium" style={{ color: v.daysOnLot >= 45 ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }}>
                    {v.year} {v.make} {v.model}
                  </span>
                  <span className="spyne-caption font-bold tabular-nums" style={{ color: v.daysOnLot >= 45 ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }}>
                    {v.daysOnLot}d
                  </span>
                </div>
              ))}
              {highCostVehicles.length > 4 && (
                <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-muted)' }}>
                  +{highCostVehicles.length - 4} more
                </span>
              )}
            </div>

            {/* AI insight */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md mb-3" style={{ background: 'var(--spyne-brand-subtle)' }}>
              <Sparkles size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--spyne-brand)' }} />
              <p className="spyne-caption" style={{ color: 'var(--spyne-brand-dark)' }}>
                <strong>Vini AI:</strong> SMS + voice combo targeting matched leads could generate 3–5 appointments within 48h, saving an estimated ${Math.round(totalHoldingCost * 0.3).toLocaleString()} in future holding costs.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="spyne-btn-primary"
                style={{ fontSize: 12, height: 32, gap: 5, background: 'var(--spyne-warning)', boxShadow: 'none' }}
                onClick={() => onCreateCampaign(highCostVehicles)}
              >
                <Megaphone size={13} />
                Create Outbound Campaign
              </button>
              <button
                className="spyne-btn-ghost"
                style={{ fontSize: 12, height: 32 }}
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Right side stats */}
          <div className="hidden md:flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <span className="spyne-number tabular-nums block" style={{ fontSize: 28, color: 'var(--spyne-warning-text)', lineHeight: 1 }}>
                ${totalHoldingCost.toLocaleString()}
              </span>
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>total holding cost</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="spyne-label font-bold tabular-nums block" style={{ color: 'var(--spyne-text-primary)' }}>
                  {highCostVehicles.length}
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>vehicles</span>
              </div>
              <div className="text-right">
                <span className="spyne-label font-bold tabular-nums block" style={{ color: 'var(--spyne-text-primary)' }}>
                  {totalMatchedLeads}
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>leads</span>
              </div>
              <div className="text-right">
                <span className="spyne-label font-bold tabular-nums block" style={{ color: 'var(--spyne-text-primary)' }}>
                  {avgDays}d
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>avg age</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Campaign Detail View ───────────────────────────────────────── */

function CampaignDetail({ campaign, onBack, onEditWorkflow }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLead, setSelectedLead] = useState(null)
  const st = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft

  const detailTabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'workflow',  label: 'Workflow' },
    { id: 'leads',     label: `Leads (${campaign.leadsEnrolled})` },
    { id: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="flex gap-0 spyne-animate-fade-in" style={{ minHeight: 0 }}>
      {/* Main content */}
      <div className="space-y-5" style={{ flex: 1, minWidth: 0, transition: 'all 250ms ease' }}>
        {/* Back + header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={onBack} className="spyne-btn-ghost" style={{ marginLeft: -10 }}>
              <ArrowLeft size={14} />
            </button>
            <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Campaign /</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)', fontSize: 24 }}>{campaign.name}</h1>
                <button className="spyne-btn-ghost" style={{ padding: 4 }}><Copy size={14} style={{ color: 'var(--spyne-text-muted)' }} /></button>
                <span
                  className="spyne-badge flex items-center gap-1.5"
                  style={{ background: st.bg, color: st.color, borderColor: st.border, padding: '4px 12px', borderRadius: 'var(--spyne-radius-pill)' }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                  {st.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'active' ? (
                <button className="spyne-btn-secondary"><Pause size={13} /> Pause</button>
              ) : campaign.status === 'paused' ? (
                <button className="spyne-btn-primary"><Play size={13} /> Resume</button>
              ) : null}
              <button className="spyne-btn-secondary" onClick={onEditWorkflow}><Edit3 size={13} /> Edit Workflow</button>
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex items-center gap-8 mt-4 flex-wrap">
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Scheduled for:</span>
              <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.createdAt}</span>
            </div>
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Campaign Type</span>
              <span className="spyne-label font-medium flex items-center gap-1.5" style={{ color: 'var(--spyne-success-text)' }}>
                <Target size={13} />
                {campaign.type}
              </span>
            </div>
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Created on:</span>
              <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{campaign.createdAt}</span>
            </div>
            <div>
              <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>Agents Deployed:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}>
                  V
                </div>
                <span className="spyne-label font-medium" style={{ color: 'var(--spyne-text-primary)' }}>Vini AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 border-b-2 transition-colors cursor-pointer"
              style={{
                borderColor: activeTab === tab.id ? 'var(--spyne-brand)' : 'transparent',
                color: activeTab === tab.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: 13,
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--spyne-brand)' : 'transparent'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <DetailOverviewTab campaign={campaign} />}
        {activeTab === 'workflow' && <DetailWorkflowTab campaign={campaign} onEdit={onEditWorkflow} />}
        {activeTab === 'leads' && <DetailLeadsTab campaign={campaign} selectedLead={selectedLead} onSelectLead={setSelectedLead} />}
        {activeTab === 'analytics' && <DetailAnalyticsTab campaign={campaign} />}
      </div>

      {/* Right-side lead detail panel */}
      {selectedLead && (
        <LeadCallDetailPanel lead={selectedLead} campaign={campaign} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  )
}

/* ─── Detail: Overview Tab ───────────────────────────────────────── */

function DetailOverviewTab({ campaign }) {
  const [leadSearch, setLeadSearch] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAllLeads, setShowAllLeads] = useState(false)

  const LEAD_STATUS = {
    active:    { label: 'Active',    color: 'var(--spyne-brand-dark)',   bg: 'var(--spyne-brand-subtle)' },
    responded: { label: 'Responded', color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    booked:    { label: 'Booked',    color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    completed: { label: 'Completed', color: 'var(--spyne-text-muted)',   bg: 'var(--spyne-surface-hover)' },
    dropped:   { label: 'Dropped',   color: 'var(--spyne-danger-text)',  bg: 'var(--spyne-danger-subtle)' },
  }

  // Compute campaign metrics from data
  const totalLeads = campaign.leadsEnrolled || 0
  const voicemailLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'voicemail').length
  const failedLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'no_answer' || l.callOutcome === 'no_speak').length
  const connectedLeads = campaign.enrolledLeads.filter(l => l.callOutcome === 'connected')
  const avgDurationSecs = connectedLeads.length > 0
    ? connectedLeads.reduce((sum, l) => {
        const parts = (l.callDuration || '0:00').split(':')
        return sum + (parseInt(parts[0]) * 60 + parseInt(parts[1]))
      }, 0) / connectedLeads.length
    : 0
  const avgMin = Math.floor(avgDurationSecs / 60)
  const avgSec = Math.round(avgDurationSecs % 60)
  const rejectedLeads = campaign.enrolledLeads.filter(l => l.status === 'dropped').length
  const optedOutLeads = 0 // placeholder

  const voicemailPct = totalLeads ? Math.round((voicemailLeads / totalLeads) * 100) : 0
  const failedPct = totalLeads ? Math.round((failedLeads / totalLeads) * 100) : 0
  const rejectedPct = totalLeads ? Math.round((rejectedLeads / totalLeads) * 100) : 0
  const optedOutPct = totalLeads ? Math.round((optedOutLeads / totalLeads) * 100) : 0

  // Filter leads
  const filteredLeads = campaign.enrolledLeads.filter((lead) => {
    if (leadSearch.length >= 3) {
      const q = leadSearch.toLowerCase()
      if (!lead.name.toLowerCase().includes(q) && !lead.phone?.includes(q)) return false
    }
    if (outcomeFilter !== 'all' && lead.callOutcome !== outcomeFilter) return false
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    return true
  })
  const visibleLeads = showAllLeads ? filteredLeads : filteredLeads.slice(0, 10)

  // Funnel stages
  const funnelStages = campaign.funnel.length >= 3 ? [
    campaign.funnel[0],
    campaign.funnel[Math.floor(campaign.funnel.length / 2)],
    campaign.funnel[campaign.funnel.length - 1],
  ] : campaign.funnel

  // Percentage between stages
  const funnelPcts = funnelStages.map((stage, i) => {
    if (i === 0) return null
    const prev = funnelStages[i - 1]
    return prev.count > 0 ? Math.round((stage.count / prev.count) * 100) : 0
  })

  const FUNNEL_COLORS = ['#4F46E5', '#94A3B8', '#E2E8F0']
  const FUNNEL_LABELS = ['Customer contact initiated', 'Contacted successfully', 'Appointments scheduled']

  return (
    <div className="space-y-6">
      {/* ── Calls & Analytics heading ── */}
      <div>
        <h2 className="spyne-heading" style={{ color: 'var(--spyne-text-primary)', fontSize: 16, fontWeight: 600 }}>
          Calls & Analytics
        </h2>
      </div>

      {/* ── Campaign Funnel ── */}
      <div className="spyne-card p-5">
        <span className="spyne-subheading mb-5 block" style={{ fontWeight: 600 }}>Campaign Funnel</span>
        <div className="flex items-stretch gap-0" style={{ minHeight: 120 }}>
          {funnelStages.map((stage, i) => {
            const maxCount = funnelStages[0].count || 1
            const widthPct = Math.max(((stage.count / maxCount) * 100), 15)
            return (
              <div key={stage.label} className="flex items-center" style={{ flex: i === 0 ? widthPct : undefined, minWidth: i === 0 ? '25%' : undefined }}>
                {/* Percentage connector */}
                {i > 0 && (
                  <div className="flex flex-col items-center justify-center px-2" style={{ minWidth: 40 }}>
                    <span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-muted)', fontSize: 13 }}>
                      {funnelPcts[i]}%
                    </span>
                  </div>
                )}
                {/* Funnel bar */}
                <div className="flex-1 flex flex-col" style={{ minWidth: 120 }}>
                  <div
                    className="rounded-lg flex items-center justify-center"
                    style={{
                      background: FUNNEL_COLORS[i] || FUNNEL_COLORS[2],
                      height: 90,
                      width: '100%',
                      transition: 'all 300ms ease',
                    }}
                  />
                  <div className="mt-3">
                    <span className="spyne-number block" style={{ fontSize: 20, color: 'var(--spyne-text-primary)' }}>
                      {stage.count}
                    </span>
                    <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginTop: 2 }}>
                      {FUNNEL_LABELS[i] || stage.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Campaign Metrics ── */}
      <div className="spyne-card p-5">
        <span className="spyne-subheading mb-4 block" style={{ fontWeight: 600 }}>Campaign Metrics</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <MetricCard
            icon={VoicemailIcon}
            iconColor="var(--spyne-warning)"
            iconBg="var(--spyne-warning-subtle)"
            label="Voice Mail %"
            value={`${voicemailLeads} (${voicemailPct}%)`}
          />
          <MetricCard
            icon={PhoneOff}
            iconColor="var(--spyne-danger)"
            iconBg="var(--spyne-danger-subtle)"
            label="Call Failed %"
            value={`${failedLeads} (${failedPct}%)`}
          />
          <MetricCard
            icon={Clock}
            iconColor="var(--spyne-success)"
            iconBg="var(--spyne-success-subtle)"
            label="Avg. Duration"
            value={`${avgMin}:${String(avgSec).padStart(2, '0')}`}
          />
          <MetricCard
            icon={UserX}
            iconColor="var(--spyne-brand)"
            iconBg="var(--spyne-brand-subtle)"
            label="Rejected %"
            value={`${rejectedLeads} (${rejectedPct}%)`}
          />
          <MetricCard
            icon={XOctagon}
            iconColor="var(--spyne-danger)"
            iconBg="var(--spyne-danger-subtle)"
            label="Opted Out %"
            value={`${optedOutLeads} (${optedOutPct}%)`}
          />
        </div>
      </div>

      {/* ── Search & filter bar for leads ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative" style={{ minWidth: 260 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--spyne-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by customer, phone (min 3 chars)"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              className="spyne-input pl-9"
              style={{ width: '100%', fontSize: 13 }}
            />
          </div>
          <div className="relative">
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="spyne-input pr-8 appearance-none cursor-pointer"
              style={{ fontSize: 13, minWidth: 140, paddingRight: 30 }}
            >
              <option value="all">All Outcomes</option>
              <option value="connected">Connected</option>
              <option value="voicemail">Voicemail</option>
              <option value="no_answer">No Answer</option>
              <option value="no_speak">No Speak</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="spyne-input pr-8 appearance-none cursor-pointer"
              style={{ fontSize: 13, minWidth: 130, paddingRight: 30 }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="responded">Responded</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            {filteredLeads.length} result{filteredLeads.length !== 1 ? 's' : ''} found
          </span>
          <button className="spyne-btn-secondary" style={{ fontSize: 13 }}>
            <Download size={13} /> Download
          </button>
        </div>
      </div>

      {/* ── Leads Table ── */}
      <div className="spyne-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--spyne-surface-hover)' }}>
              <th className="text-left px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
                <div className="flex items-center gap-1">Customer Details <ChevronDown size={12} /></div>
              </th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Status</th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
                <div className="flex items-center gap-1">Timestamp <ChevronDown size={12} /></div>
              </th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Duration</th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Outcome</th>
              <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Agent</th>
              <th className="text-right px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>
                <div className="flex items-center gap-1 justify-end">Quality Score <ChevronDown size={12} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
            {visibleLeads.map((lead) => {
              const ls = LEAD_STATUS[lead.status] || LEAD_STATUS.active
              const outcomeConfig = {
                connected: { label: 'Connected', color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
                voicemail: { label: 'Voicemail', color: 'var(--spyne-warning-text)', bg: 'var(--spyne-warning-subtle)' },
                no_answer: { label: 'No Answer', color: 'var(--spyne-danger-text)', bg: 'var(--spyne-danger-subtle)' },
                no_speak:  { label: 'Call Failed', color: 'var(--spyne-danger-text)', bg: 'var(--spyne-danger-subtle)' },
              }
              const oc = outcomeConfig[lead.callOutcome] || outcomeConfig.no_answer
              return (
                <tr
                  key={lead.id}
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--spyne-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}
                      >
                        {lead.initials}
                      </div>
                      <div>
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{lead.name}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="spyne-caption px-2 py-0.5 inline-flex items-center gap-1"
                      style={{ borderRadius: 'var(--spyne-radius-pill)', background: oc.bg, color: oc.color }}
                    >
                      {lead.callOutcome === 'no_speak' || lead.callOutcome === 'no_answer' ? <XCircle size={11} /> : null}
                      {oc.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <span className="spyne-caption block" style={{ color: 'var(--spyne-text-primary)' }}>
                        {lead.callTimestamp?.split(',')[0]}
                      </span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                        {lead.callTimestamp?.split(',').slice(1).join(',').trim()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-secondary)' }}>
                      {lead.callDuration && lead.callDuration !== '0:00' ? lead.callDuration : '--'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                      {lead.callOutcome === 'connected' ? 'Qualified' : '--'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)', fontSize: 9 }}>V</div>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>Vini AI</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
                      {lead.callOutcome === 'connected' && lead.callDuration !== '0:00' ? '85%' : '--'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {visibleLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center">
                  <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No leads found</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination / View More */}
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--spyne-border)', background: 'var(--spyne-surface)' }}>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            1-{visibleLeads.length} of {filteredLeads.length}
          </span>
          <div className="flex items-center gap-2">
            {!showAllLeads && filteredLeads.length > 10 && (
              <button
                className="spyne-btn-primary"
                style={{ fontSize: 12, padding: '6px 16px' }}
                onClick={() => setShowAllLeads(true)}
              >
                View More
              </button>
            )}
            {showAllLeads && filteredLeads.length > 10 && (
              <button
                className="spyne-btn-secondary"
                style={{ fontSize: 12, padding: '6px 16px' }}
                onClick={() => setShowAllLeads(false)}
              >
                Show Less
              </button>
            )}
            <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
              1 / {Math.ceil(filteredLeads.length / 10)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Campaign Details & Channel Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="spyne-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
            <span className="spyne-subheading" style={{ fontWeight: 600 }}>Campaign Details</span>
          </div>
          <div className="p-5 space-y-4">
            <DetailInfoRow icon={Target} label="Type" value={campaign.type} valueColor="var(--spyne-brand)" />
            <DetailInfoRow icon={Zap} label="Trigger" value={campaign.triggerDescription} />
            <DetailInfoRow icon={Calendar} label="Created" value={campaign.createdAt} />
            <DetailInfoRow icon={GitBranch} label="Sequence" value={`${campaign.workflowSteps.length} steps`} />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--spyne-surface-hover)' }}>
                <MessageSquare size={14} style={{ color: 'var(--spyne-text-muted)' }} />
              </div>
              <div className="flex-1">
                <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 4 }}>Channels</span>
                <div className="flex items-center gap-2">
                  {campaign.channels.map((ch) => {
                    const ChIcon = CHANNEL_ICON[ch] || MessageSquare
                    return (
                      <span key={ch} className="spyne-caption px-2.5 py-1 flex items-center gap-1.5" style={{ background: 'var(--spyne-surface-hover)', borderRadius: 'var(--spyne-radius-pill)', color: 'var(--spyne-text-secondary)' }}>
                        <ChIcon size={12} /> {ch}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="spyne-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--spyne-border)' }}>
            <span className="spyne-subheading" style={{ fontWeight: 600 }}>Channel Breakdown</span>
          </div>
          <div className="p-5 space-y-4">
            {campaign.channelBreakdown.map((ch) => {
              const maxSent = Math.max(...campaign.channelBreakdown.map(c => c.sent))
              const barPct = maxSent > 0 ? (ch.sent / maxSent) * 100 : 0
              return (
                <div key={ch.channel} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--spyne-surface-hover)' }}>
                        <ch.icon size={14} style={{ color: 'var(--spyne-text-muted)' }} />
                      </div>
                      <div>
                        <span className="spyne-label font-medium block" style={{ color: 'var(--spyne-text-primary)' }}>{ch.channel}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{ch.sent} sent</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="spyne-number" style={{ fontSize: 18, color: 'var(--spyne-success-text)' }}>{ch.responseRate}%</span>
                      <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)' }}>response</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--spyne-border)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${barPct}%`, background: ch.responseRate >= 50 ? 'var(--spyne-success)' : ch.responseRate >= 30 ? 'var(--spyne-brand)' : 'var(--spyne-warning)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, iconColor, iconBg, label, value }) {
  return (
    <div className="spyne-card p-4 flex items-center gap-3" style={{ border: '1px solid var(--spyne-border)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
          <Info size={12} style={{ color: 'var(--spyne-text-muted)', opacity: 0.5 }} />
        </div>
        <span className="spyne-label font-bold tabular-nums" style={{ color: 'var(--spyne-text-primary)', fontSize: 14 }}>{value}</span>
      </div>
    </div>
  )
}

function DetailInfoRow({ icon: Icon, label, value, valueColor }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--spyne-surface-hover)' }}>
        <Icon size={14} style={{ color: 'var(--spyne-text-muted)' }} />
      </div>
      <div className="flex-1">
        <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 1 }}>{label}</span>
        <span className="spyne-label font-medium" style={{ color: valueColor || 'var(--spyne-text-primary)' }}>{value}</span>
      </div>
    </div>
  )
}

function KPICard({ label, value, highlight }) {
  return (
    <div className="spyne-card p-4">
      <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
      <span
        className="spyne-number"
        style={{ fontSize: 22, color: highlight ? 'var(--spyne-success-text)' : 'var(--spyne-text-primary)' }}
      >
        {value}
      </span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>{label}</span>
      <span className="spyne-body-sm font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{value}</span>
    </div>
  )
}

/* ─── Detail: Workflow Tab (read-only preview) ───────────────────── */

function DetailWorkflowTab({ campaign, onEdit }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>
          {campaign.workflowSteps.length} steps in this workflow
        </span>
        <button className="spyne-btn-primary" onClick={onEdit}>
          <Edit3 size={13} /> Edit Workflow
        </button>
      </div>
      <WorkflowPreview steps={campaign.workflowSteps} />
    </div>
  )
}

function WorkflowPreview({ steps }) {
  return (
    <div className="spyne-card p-6 overflow-x-auto">
      <div className="flex items-start gap-0 min-w-min">
        {steps.map((step, i) => {
          const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
          const Icon = cfg.icon
          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center" style={{ width: 160 }}>
                {/* Node */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: cfg.bg, border: `2px solid ${cfg.color}` }}
                >
                  <Icon size={20} strokeWidth={2} style={{ color: cfg.color }} />
                </div>
                <span className="spyne-label text-center font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>
                  {step.label}
                </span>
                {step.config?.delay && (
                  <span className="spyne-caption mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>
                    {step.config.delay}
                  </span>
                )}
                {step.config?.template && (
                  <span className="spyne-caption mt-0.5 text-center" style={{ color: 'var(--spyne-text-muted)' }}>
                    {step.config.template}
                  </span>
                )}
                {step.metrics && (
                  <div
                    className="mt-2 px-2 py-1 text-center"
                    style={{ borderRadius: 'var(--spyne-radius-sm)', background: 'var(--spyne-surface-hover)' }}
                  >
                    <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
                      {step.metrics.conversionPct !== undefined ? `${step.metrics.conversionPct}% pass-through` : ''}
                    </span>
                  </div>
                )}
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="flex items-center self-center mt-[-20px] px-1" style={{ paddingTop: 6 }}>
                  <div className="w-8 h-0.5" style={{ background: 'var(--spyne-border-strong)' }} />
                  <ArrowRight size={14} style={{ color: 'var(--spyne-border-strong)', margin: '-0 -4px' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Detail: Leads Tab ──────────────────────────────────────────── */

function DetailLeadsTab({ campaign, selectedLead, onSelectLead }) {
  const LEAD_STATUS = {
    active:    { label: 'Active',    color: 'var(--spyne-brand-dark)',   bg: 'var(--spyne-brand-subtle)' },
    responded: { label: 'Responded', color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    booked:    { label: 'Booked',    color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
    completed: { label: 'Completed', color: 'var(--spyne-text-muted)',   bg: 'var(--spyne-surface-hover)' },
    dropped:   { label: 'Dropped',   color: 'var(--spyne-danger-text)',  bg: 'var(--spyne-danger-subtle)' },
  }

  return (
    <div className="spyne-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr style={{ background: 'var(--spyne-surface-hover)' }}>
            <th className="text-left px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Lead</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Vehicle</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Current Step</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Status</th>
            <th className="text-left px-3 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Last Activity</th>
            <th className="text-right px-5 py-3 spyne-caption font-semibold" style={{ color: 'var(--spyne-text-muted)' }}>Next Touch</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
          {campaign.enrolledLeads.map((lead) => {
            const ls = LEAD_STATUS[lead.status] || LEAD_STATUS.active
            const isSelected = selectedLead?.id === lead.id
            return (
              <tr
                key={lead.id}
                className="transition-colors cursor-pointer"
                onClick={() => onSelectLead?.(isSelected ? null : lead)}
                style={{
                  background: isSelected ? 'var(--spyne-brand-subtle)' : undefined,
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--spyne-surface-hover)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '' }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: isSelected ? 'var(--spyne-brand)' : 'var(--spyne-brand-subtle)', color: isSelected ? '#fff' : 'var(--spyne-brand)' }}
                    >
                      {lead.initials}
                    </div>
                    <div>
                      <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{lead.name}</span>
                      <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.source}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>{lead.vehicle}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-caption font-medium" style={{ color: 'var(--spyne-text-primary)' }}>
                    Step {lead.currentStep}/{campaign.workflowSteps.length}
                  </span>
                  <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)' }}>
                    {campaign.workflowSteps[lead.currentStep - 1]?.label}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="spyne-caption px-2 py-0.5"
                    style={{ borderRadius: 'var(--spyne-radius-pill)', background: ls.bg, color: ls.color }}
                  >
                    {ls.label}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.lastActivity}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>{lead.nextTouch}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Lead Call Detail Panel (right side) ────────────────────────── */

const CALL_OUTCOME_CONFIG = {
  connected: { label: 'Connected',                              icon: Phone,     color: 'var(--spyne-success-text)', bg: 'var(--spyne-success-subtle)' },
  no_speak:  { label: 'Call received but the customer did not speak', icon: PhoneCall, color: 'var(--spyne-warning-text)', bg: 'var(--spyne-warning-subtle)' },
  voicemail: { label: 'Voicemail left',                         icon: Phone,     color: 'var(--spyne-info-text)',    bg: 'var(--spyne-info-subtle)' },
  no_answer: { label: 'No answer',                              icon: PhoneCall, color: 'var(--spyne-danger-text)',  bg: 'var(--spyne-danger-subtle)' },
}

function LeadCallDetailPanel({ lead, campaign, onClose }) {
  const [activeTab, setActiveTab] = useState('highlights')
  const outcome = CALL_OUTCOME_CONFIG[lead.callOutcome] || CALL_OUTCOME_CONFIG.no_answer
  const OutcomeIcon = outcome.icon

  const panelTabs = [
    { id: 'highlights',  label: 'Highlights' },
    { id: 'customer',    label: 'Customer' },
    { id: 'summary',     label: 'Summary' },
    { id: 'appointment', label: 'Appointment' },
    { id: 'transcript',  label: 'Transcript' },
  ]

  return (
    <div
      style={{
        width: 380,
        flexShrink: 0,
        borderLeft: '1px solid var(--spyne-border)',
        background: 'var(--spyne-surface)',
        display: 'flex',
        flexDirection: 'column',
        marginTop: -20,
        marginBottom: -20,
        marginRight: -20,
        animation: 'spyne-slide-in-right 200ms cubic-bezier(0.0,0,0.2,1) both',
      }}
    >
      {/* Panel header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--spyne-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: outcome.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <OutcomeIcon size={16} style={{ color: outcome.color }} />
            </div>
            <div>
              <p className="spyne-heading" style={{ color: 'var(--spyne-text-primary)', fontSize: 14, lineHeight: 1.4 }}>
                {outcome.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Clock size={11} style={{ color: 'var(--spyne-text-muted)' }} />
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                  {lead.callDaysAgo === 0 ? 'Today' : lead.callDaysAgo === 1 ? 'Yesterday' : `${lead.callDaysAgo} days ago`}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="spyne-btn-ghost"
            style={{ padding: '4px 6px', height: 28, flexShrink: 0 }}
            aria-label="Close panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Recording section */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--spyne-border)', flexShrink: 0 }}>
        {lead.hasRecording ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'var(--spyne-surface-hover)',
              borderRadius: 'var(--spyne-radius-md)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--spyne-brand-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <Play size={14} style={{ color: 'var(--spyne-brand)', marginLeft: 2 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 4,
                  background: 'var(--spyne-border)',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '0%', height: '100%', background: 'var(--spyne-brand)', borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>0:00</span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.callDuration}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="spyne-body-sm" style={{ color: 'var(--spyne-danger-text)', textAlign: 'center' }}>
            No recording available
          </p>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--spyne-border)',
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        {panelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--spyne-brand)' : 'transparent'}`,
              background: 'none',
              border: 'none',
              borderBottomWidth: 2,
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === tab.id ? 'var(--spyne-brand)' : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'highlights' && <PanelHighlightsTab lead={lead} />}
        {activeTab === 'customer' && <PanelCustomerTab lead={lead} campaign={campaign} />}
        {activeTab === 'summary' && <PanelSummaryTab lead={lead} />}
        {activeTab === 'appointment' && <PanelAppointmentTab lead={lead} />}
        {activeTab === 'transcript' && <PanelTranscriptTab lead={lead} />}
      </div>
    </div>
  )
}

function PanelHighlightsTab({ lead }) {
  if (!lead.highlights || lead.highlights === 'Call received but the customer did not speak') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No report data available</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div
        style={{
          padding: '12px',
          background: 'var(--spyne-surface-hover)',
          borderRadius: 'var(--spyne-radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Sparkles size={14} style={{ color: 'var(--spyne-brand)', marginTop: 2, flexShrink: 0 }} />
          <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.6 }}>
            {lead.highlights}
          </p>
        </div>
      </div>
      {lead.callDuration && lead.callDuration !== '0:00' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Timer size={12} style={{ color: 'var(--spyne-text-muted)' }} />
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Call duration: {lead.callDuration}</span>
        </div>
      )}
    </div>
  )
}

function PanelCustomerTab({ lead, campaign }) {
  const rows = [
    { label: 'Name', value: lead.name },
    { label: 'Phone', value: lead.phone },
    { label: 'Email', value: lead.email },
    { label: 'Source', value: lead.source },
    { label: 'Vehicle Interest', value: lead.vehicle },
    { label: 'Current Step', value: `Step ${lead.currentStep}/${campaign.workflowSteps.length} — ${campaign.workflowSteps[lead.currentStep - 1]?.label}` },
  ]
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <span className="spyne-caption block" style={{ color: 'var(--spyne-text-muted)', marginBottom: 2 }}>{r.label}</span>
          <span className="spyne-body-sm font-medium" style={{ color: 'var(--spyne-text-primary)' }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function PanelSummaryTab({ lead }) {
  if (!lead.summary) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No report data available</p>
      </div>
    )
  }
  return (
    <div>
      <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.7 }}>
        {lead.summary}
      </p>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={11} style={{ color: 'var(--spyne-text-muted)' }} />
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{lead.callTimestamp}</span>
      </div>
    </div>
  )
}

function PanelAppointmentTab({ lead }) {
  if (!lead.appointmentDate) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No appointment scheduled</p>
      </div>
    )
  }
  return (
    <div>
      <div
        style={{
          padding: '14px',
          background: 'var(--spyne-success-subtle)',
          border: '1px solid var(--spyne-success-muted)',
          borderRadius: 'var(--spyne-radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} style={{ color: 'var(--spyne-success-text)' }} />
          <div>
            <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-success-text)' }}>
              Appointment Scheduled
            </span>
            <span className="spyne-body-sm" style={{ color: 'var(--spyne-success-text)', marginTop: 2, display: 'block' }}>
              {lead.appointmentDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PanelTranscriptTab({ lead }) {
  if (!lead.transcript) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No transcript available</p>
      </div>
    )
  }
  const lines = lead.transcript.split('\n')
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const isAgent = line.startsWith('Agent:')
        const text = line.replace(/^(Agent|[A-Za-z]+):?\s*/, '')
        const speaker = isAgent ? 'Vini AI' : line.split(':')[0]
        return (
          <div key={i}>
            <span className="spyne-caption font-semibold block" style={{ color: isAgent ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)', marginBottom: 2 }}>
              {speaker}
            </span>
            <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-primary)', lineHeight: 1.6 }}>
              {text}
            </p>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Detail: Analytics Tab ──────────────────────────────────────── */

function DetailAnalyticsTab({ campaign }) {
  return (
    <div className="space-y-5">
      {/* Funnel */}
      <div className="spyne-card p-5">
        <span className="spyne-subheading mb-4 block">Campaign Funnel</span>
        <div className="space-y-2">
          {campaign.funnel.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="spyne-body-sm w-32 text-right shrink-0" style={{ color: 'var(--spyne-text-secondary)' }}>
                {stage.label}
              </span>
              <div className="flex-1 h-8 rounded-md overflow-hidden relative" style={{ background: 'var(--spyne-border)' }}>
                <div
                  className="h-full rounded-md transition-all flex items-center justify-end pr-3"
                  style={{
                    width: `${stage.pct}%`,
                    background: i === 0
                      ? 'var(--spyne-brand-muted)'
                      : i === campaign.funnel.length - 1
                      ? 'var(--spyne-success)'
                      : 'var(--spyne-brand)',
                    minWidth: 60,
                  }}
                >
                  <span className="spyne-caption font-bold" style={{ color: '#fff' }}>{stage.count}</span>
                </div>
              </div>
              <span className="spyne-caption tabular-nums w-12 shrink-0" style={{ color: 'var(--spyne-text-muted)' }}>
                {stage.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Time-based metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-2 block">Avg Response Time</span>
          <span className="spyne-number" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>
            {campaign.analytics.avgResponseTime}
          </span>
          <span className="spyne-caption block mt-1" style={{ color: 'var(--spyne-text-muted)' }}>from first touch</span>
        </div>
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-2 block">Avg Time to Book</span>
          <span className="spyne-number" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>
            {campaign.analytics.avgTimeToBook}
          </span>
          <span className="spyne-caption block mt-1" style={{ color: 'var(--spyne-text-muted)' }}>from enrollment</span>
        </div>
        <div className="spyne-card p-5">
          <span className="spyne-subheading mb-2 block">Best Performing Channel</span>
          <span className="spyne-number" style={{ fontSize: 28, color: 'var(--spyne-brand)' }}>
            {campaign.analytics.bestChannel}
          </span>
          <span className="spyne-caption block mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
            {campaign.analytics.bestChannelRate}% response rate
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Workflow Builder ────────────────────────────────────────────── */

function WorkflowBuilder({ campaign, onBack }) {
  const [steps, setSteps] = useState(campaign.workflowSteps)
  const [selectedStep, setSelectedStep] = useState(null)
  const [showAddMenu, setShowAddMenu] = useState(null) // index after which to insert

  const addStep = (afterIndex, type) => {
    const id = `step-${Date.now()}`
    const cfg = STEP_TYPE_CONFIG[type]
    const newStep = {
      id,
      type,
      label: cfg?.label || type,
      config: type === 'wait' ? { delay: '1 hour' } : type === 'sms' ? { template: 'New template' } : {},
      metrics: null,
    }
    const updated = [...steps]
    updated.splice(afterIndex + 1, 0, newStep)
    setSteps(updated)
    setShowAddMenu(null)
    setSelectedStep(id)
  }

  const removeStep = (id) => {
    if (steps.length <= 1) return
    setSteps(steps.filter((s) => s.id !== id))
    if (selectedStep === id) setSelectedStep(null)
  }

  const moveStep = (id, direction) => {
    const idx = steps.findIndex((s) => s.id === id)
    if (idx < 0) return
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= steps.length) return
    const updated = [...steps]
    ;[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]]
    setSteps(updated)
  }

  const selectedStepData = steps.find((s) => s.id === selectedStep)

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      {/* Header */}
      <div>
        <button onClick={onBack} className="spyne-btn-ghost mb-3" style={{ marginLeft: -10 }}>
          <ArrowLeft size={14} />
          Back to Campaign
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Workflow Builder</h1>
            <p className="spyne-body-sm mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>
              {campaign.name} · {steps.length} steps
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="spyne-btn-secondary" onClick={onBack}>Cancel</button>
            <button className="spyne-btn-primary"><Check size={14} /> Save Workflow</button>
          </div>
        </div>
      </div>

      {/* Builder layout: canvas + config panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Canvas — 2/3 */}
        <div className="xl:col-span-2 spyne-card p-6 overflow-x-auto">
          <div className="flex flex-col items-center gap-0 min-w-min">
            {steps.map((step, i) => {
              const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
              const Icon = cfg.icon
              const isSelected = selectedStep === step.id

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step node */}
                  <button
                    onClick={() => setSelectedStep(step.id)}
                    className="flex items-center gap-3 px-5 py-3 transition-all cursor-pointer"
                    style={{
                      borderRadius: 'var(--spyne-radius-lg)',
                      border: isSelected
                        ? '2px solid var(--spyne-brand)'
                        : '2px solid var(--spyne-border)',
                      background: isSelected ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(79, 70, 229, 0.12)' : 'var(--spyne-shadow-sm)',
                      minWidth: 280,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: cfg.bg }}
                    >
                      <Icon size={18} strokeWidth={2} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>
                        {step.label}
                      </span>
                      {step.config?.delay && (
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                          Wait: {step.config.delay}
                        </span>
                      )}
                      {step.config?.template && (
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                          Template: {step.config.template}
                        </span>
                      )}
                      {step.config?.script && (
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                          Script: {step.config.script}
                        </span>
                      )}
                    </div>
                    <span className="spyne-caption shrink-0 tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
                      {i + 1}
                    </span>
                  </button>

                  {/* Add step button between nodes */}
                  {i < steps.length - 1 && (
                    <div className="flex flex-col items-center py-1 relative">
                      <div className="w-0.5 h-4" style={{ background: 'var(--spyne-border-strong)' }} />
                      <button
                        onClick={() => setShowAddMenu(showAddMenu === i ? null : i)}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer"
                        style={{
                          background: showAddMenu === i ? 'var(--spyne-brand)' : 'var(--spyne-surface)',
                          border: `2px solid ${showAddMenu === i ? 'var(--spyne-brand)' : 'var(--spyne-border-strong)'}`,
                          color: showAddMenu === i ? 'var(--spyne-brand-on)' : 'var(--spyne-text-muted)',
                        }}
                        title="Add step"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                      {showAddMenu === i && (
                        <AddStepMenu onAdd={(type) => addStep(i, type)} onClose={() => setShowAddMenu(null)} />
                      )}
                      <div className="w-0.5 h-4" style={{ background: 'var(--spyne-border-strong)' }} />
                      <ChevronDown size={12} style={{ color: 'var(--spyne-border-strong)', marginTop: -4 }} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add at end */}
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4" style={{ background: 'var(--spyne-border-strong)' }} />
              <button
                onClick={() => setShowAddMenu(showAddMenu === 'end' ? null : 'end')}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer relative"
                style={{
                  background: showAddMenu === 'end' ? 'var(--spyne-brand)' : 'var(--spyne-surface)',
                  border: `2px solid ${showAddMenu === 'end' ? 'var(--spyne-brand)' : 'var(--spyne-border-strong)'}`,
                  color: showAddMenu === 'end' ? 'var(--spyne-brand-on)' : 'var(--spyne-text-muted)',
                }}
                title="Add step at end"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
              {showAddMenu === 'end' && (
                <AddStepMenu onAdd={(type) => addStep(steps.length - 1, type)} onClose={() => setShowAddMenu(null)} />
              )}
            </div>
          </div>
        </div>

        {/* Config panel — 1/3 */}
        <div className="xl:col-span-1">
          {selectedStepData ? (
            <StepConfigPanel
              step={selectedStepData}
              onRemove={() => removeStep(selectedStepData.id)}
              onMoveUp={() => moveStep(selectedStepData.id, -1)}
              onMoveDown={() => moveStep(selectedStepData.id, 1)}
              stepIndex={steps.findIndex((s) => s.id === selectedStepData.id)}
              totalSteps={steps.length}
            />
          ) : (
            <div className="spyne-card p-5 text-center">
              <div className="py-12">
                <Settings size={28} style={{ color: 'var(--spyne-border-strong)', margin: '0 auto 12px' }} />
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>
                  Select a step to configure it
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddStepMenu({ onAdd, onClose }) {
  const types = ['sms', 'call', 'email', 'wait', 'condition', 'action', 'transfer']
  return (
    <div
      className="absolute top-full mt-1 z-30 py-1.5"
      style={{
        borderRadius: 'var(--spyne-radius-md)',
        background: 'var(--spyne-surface)',
        border: '1px solid var(--spyne-border)',
        boxShadow: 'var(--spyne-shadow-lg)',
        minWidth: 180,
      }}
    >
      {types.map((type) => {
        const cfg = STEP_TYPE_CONFIG[type]
        const Icon = cfg.icon
        return (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex items-center gap-2.5 w-full px-3 py-2 transition-colors cursor-pointer text-left"
            style={{ background: 'transparent', border: 'none', fontSize: 13 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--spyne-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center shrink-0"
              style={{ background: cfg.bg }}
            >
              <Icon size={12} strokeWidth={2.2} style={{ color: cfg.color }} />
            </div>
            <span className="spyne-label" style={{ color: 'var(--spyne-text-primary)' }}>{cfg.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function StepConfigPanel({ step, onRemove, onMoveUp, onMoveDown, stepIndex, totalSteps }) {
  const cfg = STEP_TYPE_CONFIG[step.type] || STEP_TYPE_CONFIG.action
  const Icon = cfg.icon

  return (
    <div className="spyne-card overflow-hidden sticky top-28">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--spyne-border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
          <Icon size={16} strokeWidth={2} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1">
          <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>
            {step.label}
          </span>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Step {stepIndex + 1} · {cfg.label}
          </span>
        </div>
      </div>

      {/* Config fields */}
      <div className="p-5 space-y-4">
        <div>
          <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
            Step Name
          </label>
          <input
            type="text"
            defaultValue={step.label}
            className="spyne-input w-full"
            style={{ fontSize: 13 }}
          />
        </div>

        {(step.type === 'sms' || step.type === 'email') && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
              Template
            </label>
            <div className="relative">
              <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                <option>{step.config?.template || 'Select template'}</option>
                <option>Speed-to-lead intro</option>
                <option>Follow-up Day 3</option>
                <option>Re-engagement</option>
                <option>Appointment reminder</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
            </div>
          </div>
        )}

        {step.type === 'call' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
              Call Script
            </label>
            <div className="relative">
              <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                <option>{step.config?.script || 'Select script'}</option>
                <option>Intro call</option>
                <option>Follow-up call</option>
                <option>Appointment booking</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
            </div>
            <div className="mt-3">
              <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
                If No Answer
              </label>
              <div className="relative">
                <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                  <option>Leave voicemail</option>
                  <option>Skip</option>
                  <option>Retry in 1 hour</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
              </div>
            </div>
          </div>
        )}

        {step.type === 'wait' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
              Wait Duration
            </label>
            <input
              type="text"
              defaultValue={step.config?.delay || '1 hour'}
              className="spyne-input w-full"
              style={{ fontSize: 13 }}
              placeholder="e.g. 2 hours, 1 day"
            />
          </div>
        )}

        {step.type === 'condition' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
              Condition
            </label>
            <div className="relative">
              <select className="spyne-input w-full appearance-none pr-8 cursor-pointer" style={{ fontSize: 13 }}>
                <option>Lead responded</option>
                <option>Appointment booked</option>
                <option>No response after wait</option>
                <option>Lead opted out</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--spyne-text-muted)' }} />
            </div>
          </div>
        )}

        {step.type === 'trigger' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
              Trigger Source
            </label>
            <div className="space-y-1.5">
              {['Internet Lead', 'Phone Lead', 'Walk-in', 'Referral', 'Marketplace'].map((src) => (
                <label key={src} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={src === 'Internet Lead' || src === 'Marketplace'} />
                  <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>{src}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Timing */}
        {step.type !== 'trigger' && step.type !== 'wait' && step.type !== 'condition' && (
          <div>
            <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
              Quiet Hours
            </label>
            <div className="flex items-center gap-2">
              <input type="time" defaultValue="09:00" className="spyne-input flex-1" style={{ fontSize: 13 }} />
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>to</span>
              <input type="time" defaultValue="20:00" className="spyne-input flex-1" style={{ fontSize: 13 }} />
            </div>
          </div>
        )}

        {/* Metrics if available */}
        {step.metrics && (
          <div
            className="p-3"
            style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-surface-hover)' }}
          >
            <span className="spyne-caption font-semibold block mb-2" style={{ color: 'var(--spyne-text-secondary)' }}>
              Performance
            </span>
            <div className="space-y-1">
              {step.metrics.sent !== undefined && (
                <div className="flex justify-between">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Sent</span>
                  <span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.sent}</span>
                </div>
              )}
              {step.metrics.delivered !== undefined && (
                <div className="flex justify-between">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Delivered</span>
                  <span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.delivered}</span>
                </div>
              )}
              {step.metrics.connected !== undefined && (
                <div className="flex justify-between">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Connected</span>
                  <span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.connected}</span>
                </div>
              )}
              {step.metrics.replied !== undefined && (
                <div className="flex justify-between">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Reply Rate</span>
                  <span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-success-text)' }}>{step.metrics.replied}%</span>
                </div>
              )}
              {step.metrics.conversionPct !== undefined && (
                <div className="flex justify-between">
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Pass-through</span>
                  <span className="spyne-caption font-semibold tabular-nums" style={{ color: 'var(--spyne-text-primary)' }}>{step.metrics.conversionPct}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--spyne-border)' }}>
        <div className="flex items-center gap-1">
          <button
            className="spyne-btn-ghost"
            onClick={onMoveUp}
            disabled={stepIndex === 0}
            style={{ opacity: stepIndex === 0 ? 0.4 : 1 }}
            title="Move up"
          >
            Move Up
          </button>
          <button
            className="spyne-btn-ghost"
            onClick={onMoveDown}
            disabled={stepIndex === totalSteps - 1}
            style={{ opacity: stepIndex === totalSteps - 1 ? 0.4 : 1 }}
            title="Move down"
          >
            Move Down
          </button>
        </div>
        {step.type !== 'trigger' && (
          <button
            className="spyne-btn-ghost"
            onClick={onRemove}
            style={{ color: 'var(--spyne-danger)' }}
          >
            <Trash2 size={13} /> Remove
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Pipeline View (Outbound Agent content) ────────────────────── */

function PipelineView({ data, agent }) {
  const [queueFilter, setQueueFilter] = useState('all')
  const [expandedLead, setExpandedLead] = useState(null)
  const { queue, sequences, activity, metrics } = data

  const filteredQueue = queueFilter === 'all'
    ? queue
    : queue.filter((l) => l.priority === queueFilter)

  return (
    <div className="space-y-5">
      {/* Top metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <PipelineMetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Two-column layout: Queue + Sequences */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Lead Queue — wider */}
        <div className="xl:col-span-3 spyne-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'var(--spyne-border)' }}>
            <div className="flex items-center gap-2">
              <Target size={14} style={{ color: 'var(--spyne-brand)' }} />
              <span className="spyne-subheading">Lead Queue</span>
              <span
                className="spyne-caption px-2 py-0.5 font-bold"
                style={{
                  borderRadius: 'var(--spyne-radius-pill)',
                  background: 'var(--spyne-brand)',
                  color: 'var(--spyne-brand-on)',
                }}
              >
                {queue.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {['all', 'critical', 'high', 'medium'].map((f) => (
                <button
                  key={f}
                  onClick={() => setQueueFilter(f)}
                  className={`spyne-pill ${queueFilter === f ? 'spyne-pill-active' : ''}`}
                  style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                >
                  {f === 'all' ? 'All' : PRIORITY_CONFIG[f]?.label}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
            {filteredQueue.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)' }}>No leads in this filter</p>
              </div>
            )}
            {filteredQueue.map((lead) => (
              <LeadQueueRow
                key={lead.id}
                lead={lead}
                expanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              />
            ))}
          </div>
        </div>

        {/* Active Sequences — narrower */}
        <div className="xl:col-span-2 spyne-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--spyne-border)' }}>
            <RefreshCw size={14} style={{ color: 'var(--spyne-brand)' }} />
            <span className="spyne-subheading">Active Sequences</span>
            <span
              className="spyne-caption px-2 py-0.5 font-bold"
              style={{
                borderRadius: 'var(--spyne-radius-pill)',
                background: 'var(--spyne-brand-subtle)',
                color: 'var(--spyne-brand)',
              }}
            >
              {sequences.length}
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--spyne-border)' }}>
            {sequences.map((seq) => (
              <SequenceRow key={seq.id} sequence={seq} />
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="spyne-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--spyne-border)' }}>
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: 'var(--spyne-brand)' }} />
            <span className="spyne-subheading">Live Activity</span>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--spyne-success)' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--spyne-success)' }} />
            </span>
          </div>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Last 24 hours · {activity.length} actions
          </span>
        </div>
        <div className="px-5 py-3">
          <div className="space-y-0">
            {activity.map((item, i) => (
              <ActivityRow key={item.id} item={item} isLast={i === activity.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentStatusPill({ agent }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2 shrink-0"
      style={{
        borderRadius: 'var(--spyne-radius-pill)',
        border: '1px solid var(--spyne-border)',
        background: 'var(--spyne-surface)',
      }}
    >
      {agent.photo ? (
        <img src={agent.photo} alt={agent.name} className="w-7 h-7 rounded-full object-cover object-top" />
      ) : (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}
        >
          {agent.name.charAt(0)}
        </div>
      )}
      <div className="flex flex-col">
        <span className="spyne-caption font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>
          {agent.name}
        </span>
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)', fontSize: 10 }}>
          {agent.role}
        </span>
      </div>
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: agent.status === 'online' ? 'var(--spyne-success)' : 'var(--spyne-text-muted)' }}
      />
    </div>
  )
}

function PipelineMetricCard({ metric }) {
  const isPositive = metric.deltaDir === 'up'
  return (
    <div className="spyne-card p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <metric.icon size={13} strokeWidth={2} style={{ color: 'var(--spyne-text-muted)' }} />
        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{metric.label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="spyne-number" style={{ color: 'var(--spyne-text-primary)', fontSize: 22 }}>
          {metric.value}
        </span>
        {metric.delta && (
          <span
            className="spyne-caption font-semibold mb-0.5"
            style={{ color: isPositive ? 'var(--spyne-success-text)' : 'var(--spyne-danger-text)' }}
          >
            {metric.delta}
          </span>
        )}
      </div>
      {metric.note && (
        <span className="spyne-caption mt-1 block" style={{ color: 'var(--spyne-text-muted)' }}>
          {metric.note}
        </span>
      )}
    </div>
  )
}

function LeadQueueRow({ lead, expanded, onToggle }) {
  const pri = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.medium
  const status = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.awaiting_contact

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors cursor-pointer"
        style={{ background: expanded ? 'var(--spyne-surface-hover)' : 'transparent' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: pri.bg, color: pri.color }}
        >
          {lead.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="spyne-label font-semibold truncate" style={{ color: 'var(--spyne-text-primary)' }}>
              {lead.name}
            </span>
            <span
              className="spyne-caption px-1.5 py-0.5 shrink-0"
              style={{ borderRadius: 'var(--spyne-radius-sm)', background: pri.bg, color: pri.color, border: `1px solid ${pri.border}` }}
            >
              {pri.label}
            </span>
          </div>
          <div className="spyne-caption mt-0.5 truncate" style={{ color: 'var(--spyne-text-muted)' }}>
            {lead.vehicle} · {lead.source}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="spyne-caption px-2 py-0.5"
            style={{ borderRadius: 'var(--spyne-radius-pill)', background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
          <div className="flex items-center gap-1">
            {lead.channels.map((ch) => {
              const Icon = CHANNEL_ICON[ch] || MessageSquare
              return <Icon key={ch} size={12} strokeWidth={2} style={{ color: 'var(--spyne-text-muted)' }} />
            })}
          </div>
          <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
            {lead.waitTime}
          </span>
          <ChevronRight
            size={14}
            style={{
              color: 'var(--spyne-text-muted)',
              transform: expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 150ms ease',
            }}
          />
        </div>
      </button>
      {expanded && (
        <div
          className="px-5 pb-4 pt-1 ml-14 space-y-2"
          style={{ animation: 'spyne-fade-in 150ms ease both' }}
        >
          <div className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>
            {lead.aiInsight}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
              Recommended:
            </span>
            <span className="spyne-badge spyne-badge-brand" style={{ fontSize: 11 }}>
              {lead.recommendedAction}
            </span>
            <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
              · Next touch: {lead.nextTouch}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function SequenceRow({ sequence }) {
  const progress = Math.round((sequence.currentStep / sequence.totalSteps) * 100)
  const status = LEAD_STATUS_CONFIG[sequence.status] || LEAD_STATUS_CONFIG.in_sequence

  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{ background: 'var(--spyne-brand-subtle)', color: 'var(--spyne-brand)' }}
          >
            {sequence.initials}
          </div>
          <span className="spyne-label font-semibold truncate" style={{ color: 'var(--spyne-text-primary)' }}>
            {sequence.name}
          </span>
        </div>
        <span
          className="spyne-caption px-2 py-0.5 shrink-0"
          style={{ borderRadius: 'var(--spyne-radius-pill)', background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>
      <div className="ml-9">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--spyne-border)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: sequence.status === 'responded' || sequence.status === 'booked'
                  ? 'var(--spyne-success)'
                  : 'var(--spyne-brand)',
              }}
            />
          </div>
          <span className="spyne-caption tabular-nums shrink-0" style={{ color: 'var(--spyne-text-muted)' }}>
            {sequence.currentStep}/{sequence.totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            {sequence.lastAction}
          </span>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>·</span>
          <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
            Next: {sequence.nextAction}
          </span>
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ item, isLast }) {
  const iconMap = {
    sms_sent: { icon: Send, color: 'var(--spyne-brand)' },
    call_made: { icon: PhoneOutgoing, color: 'var(--spyne-info)' },
    call_connected: { icon: Phone, color: 'var(--spyne-success)' },
    call_no_answer: { icon: Phone, color: 'var(--spyne-text-muted)' },
    email_sent: { icon: Mail, color: 'var(--spyne-warning)' },
    appt_booked: { icon: Calendar, color: 'var(--spyne-success)' },
    stage_change: { icon: TrendingUp, color: 'var(--spyne-brand)' },
    lead_ingested: { icon: Zap, color: 'var(--spyne-warning)' },
    warm_transfer: { icon: UserCheck, color: 'var(--spyne-success)' },
    voicemail: { icon: Phone, color: 'var(--spyne-text-muted)' },
  }
  const cfg = iconMap[item.type] || { icon: Sparkles, color: 'var(--spyne-text-muted)' }
  const Icon = cfg.icon

  return (
    <div className="flex gap-3 relative">
      {!isLast && (
        <div
          className="absolute left-[11px] top-[28px] bottom-0 w-px"
          style={{ background: 'var(--spyne-border)' }}
        />
      )}
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-1 z-10"
        style={{ background: 'var(--spyne-surface)', border: `2px solid ${cfg.color}` }}
      >
        <Icon size={10} strokeWidth={2.5} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="spyne-label" style={{ color: 'var(--spyne-text-primary)' }}>
              {item.description}
            </span>
            {item.detail && (
              <p className="spyne-caption mt-0.5" style={{ color: 'var(--spyne-text-muted)' }}>
                {item.detail}
              </p>
            )}
          </div>
          <span className="spyne-caption shrink-0 tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
            {item.time}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CREATE CAMPAIGN WIZARD
   ═══════════════════════════════════════════════════════════════════ */

const CAMPAIGN_TYPES = [
  { id: 'speed-to-lead',  label: 'Speed to Lead',    desc: 'Instant outreach to new leads within minutes',                     icon: Zap },
  { id: 're-engagement',  label: 'Re-engagement',     desc: 'Win back leads that went cold after 14+ days',                     icon: RefreshCw },
  { id: 'nurture',        label: 'Nurture',           desc: 'Pre-appointment warmup to reduce no-shows',                        icon: TrendingUp },
  { id: 'after-hours',    label: 'After Hours',       desc: 'Engage leads arriving outside business hours',                     icon: Clock },
  { id: 'cross-sell',     label: 'Cross-Sell',        desc: 'Target service customers for new vehicle interest',                icon: Target },
  { id: 'custom',         label: 'Custom',            desc: 'Build a fully custom campaign from scratch',                       icon: Settings },
]

const SEGMENT_OPTIONS = [
  { id: 'new-internet',      label: 'New Internet Leads',         count: 47  },
  { id: 'waiting-response',  label: 'Waiting for Response',       count: 133 },
  { id: 'cold-14d',          label: 'Cold 14+ Days',              count: 68  },
  { id: 'appt-booked',       label: 'Appointment Booked',         count: 18  },
  { id: 'after-hours',       label: 'After-Hours Leads',          count: 12  },
  { id: 'service-customers', label: 'Service Customers (60K+ mi)', count: 214 },
]

const WIZARD_STEPS = ['Type', 'Details', 'Segment', 'Channels']

function CreateCampaignWizard({ onClose, onComplete }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState({
    type: null,
    name: '',
    description: '',
    segment: null,
    channels: { sms: true, voice: true, email: false },
    quietHoursStart: '09:00',
    quietHoursEnd: '20:00',
  })

  const canNext =
    (step === 0 && draft.type) ||
    (step === 1 && draft.name.trim()) ||
    (step === 2 && draft.segment) ||
    step === 3

  const handleNext = () => {
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete(draft)
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="spyne-animate-scale-in"
        style={{
          width: 580,
          maxWidth: '95vw',
          maxHeight: '90vh',
          borderRadius: 'var(--spyne-radius-xl)',
          background: 'var(--spyne-surface)',
          boxShadow: 'var(--spyne-shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div>
            <h2 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Create Campaign</h2>
            <p className="spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
              Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 flex" style={{ background: 'var(--spyne-border)' }}>
          <div
            className="h-full transition-all"
            style={{
              width: `${((step + 1) / WIZARD_STEPS.length) * 100}%`,
              background: 'var(--spyne-brand)',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: 320 }}>
          {step === 0 && (
            <div className="space-y-3">
              <p className="spyne-body-sm mb-4" style={{ color: 'var(--spyne-text-secondary)' }}>
                Choose the type of campaign you want to create
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CAMPAIGN_TYPES.map((t) => {
                  const selected = draft.type === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDraft({ ...draft, type: t.id, name: draft.name || `${t.label} Campaign` })}
                      className="text-left p-4 transition-all cursor-pointer"
                      style={{
                        borderRadius: 'var(--spyne-radius-md)',
                        border: selected ? '2px solid var(--spyne-brand)' : '2px solid var(--spyne-border)',
                        background: selected ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                        boxShadow: selected ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <t.icon size={16} style={{ color: selected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }} />
                        <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{t.label}</span>
                      </div>
                      <p className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{t.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="spyne-input w-full"
                  style={{ fontSize: 14 }}
                  placeholder="e.g. Speed to Lead — Internet Leads"
                  autoFocus
                />
              </div>
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Description
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="spyne-input w-full"
                  style={{ fontSize: 13, height: 80, padding: '10px 12px', resize: 'vertical' }}
                  placeholder="What does this campaign do?"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="spyne-body-sm mb-4" style={{ color: 'var(--spyne-text-secondary)' }}>
                Choose the lead segment this campaign will target
              </p>
              {SEGMENT_OPTIONS.map((seg) => {
                const selected = draft.segment === seg.id
                return (
                  <button
                    key={seg.id}
                    onClick={() => setDraft({ ...draft, segment: seg.id })}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-all cursor-pointer"
                    style={{
                      borderRadius: 'var(--spyne-radius-md)',
                      border: selected ? '2px solid var(--spyne-brand)' : '2px solid var(--spyne-border)',
                      background: selected ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                    }}
                  >
                    <div>
                      <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>
                        {seg.label}
                      </span>
                    </div>
                    <span className="spyne-caption font-bold tabular-nums" style={{ color: selected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }}>
                      {seg.count} leads
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="spyne-caption font-semibold block mb-3" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Outreach Channels
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'sms',   label: 'SMS',   icon: MessageSquare, desc: 'Text messages' },
                    { key: 'voice', label: 'AI Voice Call', icon: Phone, desc: 'AI-powered calls with voicemail fallback' },
                    { key: 'email', label: 'Email',  icon: Mail, desc: 'Email outreach' },
                  ].map((ch) => (
                    <label
                      key={ch.key}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        borderRadius: 'var(--spyne-radius-md)',
                        border: `1px solid ${draft.channels[ch.key] ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`,
                        background: draft.channels[ch.key] ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={draft.channels[ch.key]}
                        onChange={() => setDraft({ ...draft, channels: { ...draft.channels, [ch.key]: !draft.channels[ch.key] } })}
                      />
                      <ch.icon size={16} style={{ color: draft.channels[ch.key] ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }} />
                      <div>
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{ch.label}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{ch.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Quiet Hours
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={draft.quietHoursStart}
                    onChange={(e) => setDraft({ ...draft, quietHoursStart: e.target.value })}
                    className="spyne-input flex-1"
                    style={{ fontSize: 13 }}
                  />
                  <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>to</span>
                  <input
                    type="time"
                    value={draft.quietHoursEnd}
                    onChange={(e) => setDraft({ ...draft, quietHoursEnd: e.target.value })}
                    className="spyne-input flex-1"
                    style={{ fontSize: 13 }}
                  />
                </div>
                <p className="spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
                  No outreach outside these hours
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <button
            className="spyne-btn-secondary"
            onClick={step === 0 ? onClose : () => setStep(step - 1)}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
              {step + 1} / {WIZARD_STEPS.length}
            </span>
            <button
              className="spyne-btn-primary"
              onClick={handleNext}
              disabled={!canNext}
              style={{ opacity: canNext ? 1 : 0.5 }}
            >
              {step === WIZARD_STEPS.length - 1 ? (
                <><Rocket size={14} /> Review & Launch</>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PRE-LAUNCH INTELLIGENCE MODAL
   ═══════════════════════════════════════════════════════════════════ */

function PreLaunchIntelligenceModal({ campaign, onClose, onLaunch, onOptimize }) {
  const segment = SEGMENT_OPTIONS.find((s) => s.id === campaign?.segment) || SEGMENT_OPTIONS[1]

  // Mock intelligence data
  const leadPool = { total: 47, high: 12, medium: 28, low: 7, flagged: 3 }
  const pickup = { avg: 58, high: 14, medium: 22, low: 11 }

  const highPct = Math.round((leadPool.high / leadPool.total) * 100)
  const medPct  = Math.round((leadPool.medium / leadPool.total) * 100)
  const lowPct  = Math.round((leadPool.low / leadPool.total) * 100)

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="spyne-animate-scale-in"
        style={{
          width: 620,
          maxWidth: '95vw',
          maxHeight: '90vh',
          borderRadius: 'var(--spyne-radius-xl)',
          background: 'var(--spyne-surface)',
          boxShadow: 'var(--spyne-shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Pre-Launch Intelligence</h2>
            <p className="spyne-body-sm mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
              Segment: <strong style={{ color: 'var(--spyne-text-primary)' }}>{segment.label}</strong> · {segment.count} leads
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Gradient divider */}
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg, var(--spyne-brand-muted), var(--spyne-success-muted), var(--spyne-brand-muted))' }} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Lead Pool Quality ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--spyne-brand-subtle)' }}
              >
                <Users size={18} style={{ color: 'var(--spyne-brand)' }} />
              </div>
              <span className="spyne-heading" style={{ color: 'var(--spyne-text-primary)' }}>Lead Pool Quality</span>
            </div>

            {/* Numbers row */}
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{leadPool.total}</span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Total</span>
              </div>
              <div className="text-center">
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-success-text)' }}>{leadPool.high}</span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>High</span>
              </div>
              <div className="text-center">
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>{leadPool.medium}</span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Medium</span>
              </div>
              <div className="text-center">
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-danger-text)' }}>{leadPool.low}</span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Low</span>
              </div>
            </div>

            {/* Segmented bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-3" style={{ background: 'var(--spyne-border)' }}>
              <div style={{ width: `${highPct}%`, background: 'var(--spyne-success)', transition: 'width 0.5s ease' }} />
              <div style={{ width: `${medPct}%`,  background: 'var(--spyne-border-strong)', transition: 'width 0.5s ease' }} />
              <div style={{ width: `${lowPct}%`,  background: 'var(--spyne-danger-muted)', transition: 'width 0.5s ease' }} />
            </div>

            {/* Flagged warning */}
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: 'var(--spyne-text-muted)' }} />
              <span className="spyne-body-sm" style={{ color: 'var(--spyne-text-secondary)' }}>
                {leadPool.flagged} leads flagged for review (compliance or conflict)
              </span>
            </div>
          </div>

          {/* ── Pickup Confidence Distribution ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--spyne-success-subtle)' }}
              >
                <PhoneCall size={18} style={{ color: 'var(--spyne-success)' }} />
              </div>
              <span className="spyne-heading" style={{ color: 'var(--spyne-text-primary)' }}>Pickup Confidence Distribution</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* Avg confidence — plain */}
              <div className="text-center py-3">
                <span className="block font-bold tabular-nums" style={{ fontSize: 32, color: 'var(--spyne-text-primary)' }}>
                  {pickup.avg}%
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Avg confidence</span>
              </div>
              {/* High card */}
              <div
                className="text-center py-3 px-2"
                style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-success-subtle)' }}
              >
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-success-text)' }}>
                  {pickup.high}
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-success-text)' }}>High (&gt;75%)</span>
              </div>
              {/* Medium card */}
              <div className="text-center py-3 px-2">
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-text-primary)' }}>
                  {pickup.medium}
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>Medium</span>
              </div>
              {/* Low card */}
              <div
                className="text-center py-3 px-2"
                style={{ borderRadius: 'var(--spyne-radius-md)', background: 'var(--spyne-danger-subtle)' }}
              >
                <span className="block font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--spyne-danger-text)' }}>
                  {pickup.low}
                </span>
                <span className="spyne-caption" style={{ color: 'var(--spyne-danger-text)' }}>Low (&lt;50%)</span>
              </div>
            </div>
          </div>

          {/* ── AI Recommendation banner ── */}
          <div
            className="flex items-start gap-3 px-4 py-3.5"
            style={{
              borderRadius: 'var(--spyne-radius-md)',
              background: 'var(--spyne-info-subtle)',
              border: '1px solid var(--spyne-info-muted)',
            }}
          >
            <TrendingUp size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--spyne-info)' }} />
            <div>
              <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>
                Schedule Voice steps for Tue–Thu 6–8pm
              </span>
              <span className="spyne-caption" style={{ color: 'var(--spyne-text-secondary)' }}>
                Projected +23% pickup rate vs default timing
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--spyne-border)' }}
        >
          <button className="spyne-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <div className="flex items-center gap-2.5">
            <button className="spyne-btn-secondary" onClick={onLaunch} style={{ gap: 6 }}>
              <Rocket size={14} />
              Launch as configured
            </button>
            <button
              className="spyne-btn-primary"
              onClick={onOptimize}
              style={{
                gap: 6,
                background: 'var(--spyne-brand)',
                boxShadow: 'var(--spyne-shadow-brand)',
              }}
            >
              <Zap size={14} />
              Let Vini Optimize
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   LOT HOLDING COST CAMPAIGN MODAL
   Shown when user navigates from Lot View → Create Campaign
   ═══════════════════════════════════════════════════════════════════ */

function LotCampaignModal({ vehicles, onClose, onLaunch }) {
  const [step, setStep] = useState(0) // 0 = review vehicles, 1 = configure, 2 = confirm
  const [channels, setChannels] = useState({ sms: true, voice: true, email: false })
  const [campaignName, setCampaignName] = useState('Aging Inventory — Outbound Push')

  const totalHoldingCost = vehicles.reduce((sum, v) => sum + v.holdingCost, 0)
  const avgDays = Math.round(vehicles.reduce((sum, v) => sum + v.daysOnLot, 0) / vehicles.length)
  const totalMatchedLeads = vehicles.reduce((sum, v) => sum + v.matchedLeads, 0)

  const steps = ['Review Vehicles', 'Configure Campaign', 'Launch']

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="spyne-animate-scale-in"
        style={{
          width: 640,
          maxWidth: '95vw',
          maxHeight: '90vh',
          borderRadius: 'var(--spyne-radius-xl)',
          background: 'var(--spyne-surface)',
          boxShadow: 'var(--spyne-shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: '1px solid var(--spyne-border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone size={18} style={{ color: 'var(--spyne-warning)' }} />
              <h2 className="spyne-title" style={{ color: 'var(--spyne-text-primary)' }}>Outbound Campaign — Aging Inventory</h2>
            </div>
            <p className="spyne-caption mt-1" style={{ color: 'var(--spyne-text-muted)' }}>
              Step {step + 1} of {steps.length} · {steps[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 flex" style={{ background: 'var(--spyne-border)' }}>
          <div
            className="h-full transition-all"
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
              background: 'var(--spyne-warning)',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: 320 }}>
          {step === 0 && (
            <div className="space-y-4">
              {/* Summary banner */}
              <div
                className="flex items-center gap-4 px-4 py-3 rounded-lg"
                style={{ background: 'var(--spyne-warning-subtle)', border: '1px solid var(--spyne-warning-muted)' }}
              >
                <div className="flex-1">
                  <span className="spyne-label font-bold" style={{ color: 'var(--spyne-warning-text)' }}>
                    {vehicles.length} high-cost vehicles selected
                  </span>
                  <span className="spyne-caption block mt-0.5" style={{ color: 'var(--spyne-warning-text)', opacity: 0.8 }}>
                    ${totalHoldingCost.toLocaleString()} total holding cost · Avg {avgDays} days on lot · {totalMatchedLeads} matched leads
                  </span>
                </div>
                <AlertTriangle size={20} style={{ color: 'var(--spyne-warning)', flexShrink: 0 }} />
              </div>

              {/* Vehicle list */}
              <div className="space-y-2">
                {vehicles.map((v) => {
                  const isHigh = v.daysOnLot >= 45
                  return (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg"
                      style={{ border: '1px solid var(--spyne-border)', background: 'var(--spyne-surface)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'var(--spyne-surface-hover)' }}
                      >
                        <Car size={14} style={{ color: 'var(--spyne-text-muted)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>
                          {v.year} {v.make} {v.model} {v.trim}
                        </span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>
                          ${v.price.toLocaleString()} · {v.matchedLeads} lead{v.matchedLeads !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="spyne-label tabular-nums font-bold block" style={{ color: isHigh ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }}>
                          ${v.holdingCost.toLocaleString()}
                        </span>
                        <span className="spyne-caption tabular-nums" style={{ color: isHigh ? 'var(--spyne-danger-text)' : 'var(--spyne-warning-text)' }}>
                          {v.daysOnLot}d on lot
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="spyne-caption font-semibold block mb-1.5" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="spyne-input w-full"
                  style={{ fontSize: 14 }}
                  autoFocus
                />
              </div>

              {/* AI recommendation */}
              <div
                className="px-4 py-3 rounded-lg"
                style={{ background: 'var(--spyne-brand-subtle)', border: '1px solid var(--spyne-brand-muted)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} style={{ color: 'var(--spyne-brand)' }} />
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-brand-dark)' }}>Vini AI Recommendation</span>
                </div>
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-brand-dark)' }}>
                  Target matched leads ({totalMatchedLeads}) with personalized outreach highlighting
                  price flexibility and urgency on aging units. SMS + voice combo has shown 68% response
                  rate for inventory-push campaigns.
                </p>
              </div>

              {/* Channels */}
              <div>
                <label className="spyne-caption font-semibold block mb-3" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Outreach Channels
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'sms',   label: 'SMS',           icon: MessageSquare, desc: 'Text messages with vehicle pricing & offers' },
                    { key: 'voice', label: 'AI Voice Call',  icon: Phone,         desc: 'AI-powered calls highlighting deals' },
                    { key: 'email', label: 'Email',          icon: Mail,          desc: 'Email with vehicle photos & incentives' },
                  ].map((ch) => (
                    <label
                      key={ch.key}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        borderRadius: 'var(--spyne-radius-md)',
                        border: `1px solid ${channels[ch.key] ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`,
                        background: channels[ch.key] ? 'var(--spyne-brand-subtle)' : 'var(--spyne-surface)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={channels[ch.key]}
                        onChange={() => setChannels({ ...channels, [ch.key]: !channels[ch.key] })}
                      />
                      <ch.icon size={16} style={{ color: channels[ch.key] ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)' }} />
                      <div>
                        <span className="spyne-label font-semibold block" style={{ color: 'var(--spyne-text-primary)' }}>{ch.label}</span>
                        <span className="spyne-caption" style={{ color: 'var(--spyne-text-muted)' }}>{ch.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workflow preview */}
              <div>
                <span className="spyne-caption font-semibold block mb-2" style={{ color: 'var(--spyne-text-secondary)' }}>
                  Suggested Workflow
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { type: 'trigger', label: 'Aging Inventory' },
                    { type: 'sms',     label: 'Deal SMS' },
                    { type: 'wait',    label: 'Wait 1h' },
                    { type: 'call',    label: 'AI Call' },
                    { type: 'condition', label: 'Connected?' },
                    { type: 'action',  label: 'Book Appt' },
                    { type: 'end',     label: 'End' },
                  ].map((s, i, arr) => {
                    const cfg = STEP_TYPE_CONFIG[s.type] || STEP_TYPE_CONFIG.action
                    const Icon = cfg.icon
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
                          style={{ background: cfg.bg }}
                        >
                          <Icon size={11} strokeWidth={2.2} style={{ color: cfg.color }} />
                          <span className="spyne-caption font-medium" style={{ color: cfg.color }}>{s.label}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <ArrowRight size={10} style={{ color: 'var(--spyne-border-strong)' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Success state */}
              <div className="text-center py-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--spyne-success-subtle)' }}
                >
                  <Rocket size={28} style={{ color: 'var(--spyne-success)' }} />
                </div>
                <h3 className="spyne-title mb-2" style={{ color: 'var(--spyne-text-primary)' }}>Ready to Launch</h3>
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-text-muted)', maxWidth: 400, margin: '0 auto' }}>
                  Campaign will target {totalMatchedLeads} matched leads across {vehicles.length} aging vehicles
                  with ${totalHoldingCost.toLocaleString()} in accumulated holding costs.
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="spyne-card p-4">
                  <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Campaign</span>
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{campaignName}</span>
                </div>
                <div className="spyne-card p-4">
                  <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Vehicles</span>
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{vehicles.length} units</span>
                </div>
                <div className="spyne-card p-4">
                  <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Target Leads</span>
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>{totalMatchedLeads} leads</span>
                </div>
                <div className="spyne-card p-4">
                  <span className="spyne-caption block mb-1" style={{ color: 'var(--spyne-text-muted)' }}>Channels</span>
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-text-primary)' }}>
                    {[channels.sms && 'SMS', channels.voice && 'Voice', channels.email && 'Email'].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>

              {/* AI insight */}
              <div
                className="px-4 py-3 rounded-lg"
                style={{ background: 'var(--spyne-brand-subtle)', border: '1px solid var(--spyne-brand-muted)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} style={{ color: 'var(--spyne-brand)' }} />
                  <span className="spyne-label font-semibold" style={{ color: 'var(--spyne-brand-dark)' }}>Projected Impact</span>
                </div>
                <p className="spyne-body-sm" style={{ color: 'var(--spyne-brand-dark)' }}>
                  Based on similar campaigns, expect ~45% response rate and 3–5 appointments
                  within 48 hours. This could save an estimated ${Math.round(totalHoldingCost * 0.3).toLocaleString()} in
                  future holding costs by accelerating sales.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--spyne-border)' }}>
          <button
            className="spyne-btn-secondary"
            onClick={step === 0 ? onClose : () => setStep(step - 1)}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <span className="spyne-caption tabular-nums" style={{ color: 'var(--spyne-text-muted)' }}>
              {step + 1} / {steps.length}
            </span>
            <button
              className="spyne-btn-primary"
              onClick={step === steps.length - 1 ? onLaunch : () => setStep(step + 1)}
              style={{
                gap: 6,
                background: step === steps.length - 1 ? 'var(--spyne-success)' : undefined,
              }}
            >
              {step === steps.length - 1 ? (
                <><Rocket size={14} /> Launch Campaign</>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}

/* ─── Shared modal overlay ───────────────────────────────────────── */

function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}
