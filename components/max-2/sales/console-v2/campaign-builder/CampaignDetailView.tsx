"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  Pause,
  Play,
  Copy,
  Sparkles,
  Phone,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  GitBranch,
  Zap,
  UserCheck,
  Check,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  Search,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  Voicemail,
  Volume2,
  Calendar,
  ChevronRight,
  X,
  User,
  ShieldCheck,
  ShieldAlert,
  Square,
  Download,
  UserMinus,
  BadgeCheck,
  Layers,
  FlaskConical,
  Car,
  Wallet,
  Repeat,
} from "lucide-react";
import { getLeadBrief, type LeadBrief } from "./lead-briefs";
import { SEVERITY, type Severity } from "../shared";

const CHANNEL_ICON: Record<string, typeof Phone> = {
  SMS: MessageSquare,
  Voice: Phone,
  Email: Mail,
};

const STEP_ICON: Record<string, typeof Zap> = {
  trigger: Zap,
  sms: MessageSquare,
  call: Phone,
  email: Mail,
  wait: Clock,
  condition: GitBranch,
  action: Sparkles,
  transfer: UserCheck,
  end: Check,
};

// Reduced to brand + a few semantic tokens: touchpoints (sms/email/call/trigger/action)
// ride the brand; wait is muted; condition is a warning fork; transfer/end resolve as success.
const STEP_COLOR: Record<string, { ink: string; soft: string }> = {
  trigger:   { ink: "var(--spyne-primary)",      soft: "var(--spyne-primary-soft)" },
  sms:       { ink: "var(--spyne-primary)",      soft: "var(--spyne-primary-soft)" },
  call:      { ink: "var(--spyne-primary)",      soft: "var(--spyne-primary-soft)" },
  email:     { ink: "var(--spyne-primary)",      soft: "var(--spyne-primary-soft)" },
  action:    { ink: "var(--spyne-primary)",      soft: "var(--spyne-primary-soft)" },
  wait:      { ink: "var(--spyne-text-muted)",   soft: "var(--spyne-surface-hover)" },
  condition: { ink: "var(--spyne-warning-ink)",  soft: "var(--spyne-warning-subtle)" },
  transfer:  { ink: "var(--spyne-success-text)", soft: "var(--spyne-success-subtle)" },
  end:       { ink: "var(--spyne-success-text)", soft: "var(--spyne-success-subtle)" },
};

const STATUS_STYLE: Record<string, { label: string; severity: Severity }> = {
  active:    { label: "Active",    severity: "success" },
  paused:    { label: "Paused",    severity: "warning" },
  draft:     { label: "Draft",     severity: "neutral" },
  completed: { label: "Completed", severity: "brand" },
};

interface WorkflowStep {
  id: string;
  type: string;
  label: string;
  config?: any;
  metrics?: { conversionPct?: number; sent?: number; connected?: number; replied?: number; delivered?: number; opened?: number } | null;
}

interface FunnelStage {
  label: string;
  count: number;
  pct: number;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  leadsEnrolled: number;
  leadsActive: number;
  responseRate: number;
  appointmentsBooked: number;
  conversionRate?: number;
  channels: string[];
  triggerDescription?: string;
  channelBreakdown?: { channel: string; sent: number; responseRate: number }[];
  workflowSteps?: WorkflowStep[];
  enrolledLeads?: any[];
  funnel?: FunnelStage[];
  analytics?: { avgResponseTime?: string; avgTimeToBook?: string; bestChannel?: string; bestChannelRate?: number };
  createdAt?: string;
}

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
  onEditWorkflow?: () => void;
}

type DetailTab = "overview" | "leads";

export default function CampaignDetailView({ campaign, onBack, onEditWorkflow }: CampaignDetailViewProps) {
  const st = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft;
  const stTok = SEVERITY[st.severity];
  const [paused, setPaused] = useState(campaign.status === "paused");
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const observations = useMemo(() => buildObservations(campaign), [campaign]);
  const leads = campaign.enrolledLeads ?? [];
  const selectedLead = leads.find((l: any) => l.id === selectedLeadId) ?? null;

  return (
    <div className="space-y-5 spyne-animate-fade-in">
      {/* Hero */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={onBack}
            className="spyne-focus-ring mt-1 rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] p-1.5 text-[var(--spyne-text-secondary)] transition-colors hover:border-[var(--spyne-text-muted)] hover:text-[var(--spyne-text-primary)]"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                style={{ background: stTok.fill, color: stTok.ink, borderColor: stTok.border }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: stTok.ink }} />
                {paused ? "Paused" : st.label}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--spyne-text-muted)]">{campaign.type}</span>
              {campaign.channels.map((ch) => {
                const Icon = CHANNEL_ICON[ch] ?? MessageSquare;
                return (
                  <span key={ch} className="inline-flex items-center gap-1 rounded-full bg-[var(--spyne-primary-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--spyne-primary)]">
                    <Icon size={9} /> {ch}
                  </span>
                );
              })}
            </div>
            <h1 className="text-[20px] font-bold text-[var(--spyne-text-primary)] tracking-tight leading-tight">{campaign.name}</h1>
            {campaign.description && (
              <p className="mt-1 text-[12.5px] text-[var(--spyne-text-secondary)] leading-snug max-w-[680px]">{campaign.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ActionButton onClick={() => setPaused((p) => !p)} variant="secondary">
            {paused ? <Play size={11} /> : <Pause size={11} />}
            {paused ? "Resume" : "Pause"}
          </ActionButton>
          <ActionButton onClick={onEditWorkflow} variant="secondary">
            <Edit3 size={11} />
            Edit
          </ActionButton>
          <ActionButton variant="secondary">
            <Copy size={11} />
            Clone
          </ActionButton>
          <ActionButton variant="secondary">
            <Download size={11} />
            Export
          </ActionButton>
          <ActionButton variant="secondary">
            <Square size={11} />
            Stop
          </ActionButton>
        </div>
      </div>

      {/* Manage bar — provenance · compliance · freshness (PRD: ops won't trust a campaign they can't see) */}
      <ManageBar campaign={campaign} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPI label="Leads enrolled" value={campaign.leadsEnrolled.toLocaleString()} sub="all-time" />
        <KPI label="Active in sequence" value={campaign.leadsActive.toLocaleString()} sub="in flight now" accent={campaign.leadsActive > 0 ? "good" : undefined} />
        <KPI label="Response rate" value={`${campaign.responseRate}%`} sub={campaign.analytics?.bestChannel ? `best: ${campaign.analytics.bestChannel}` : ""} accent={campaign.responseRate >= 50 ? "good" : campaign.responseRate < 25 ? "warn" : undefined} />
        <KPI label="Appointments booked" value={campaign.appointmentsBooked.toLocaleString()} sub={campaign.conversionRate ? `${campaign.conversionRate}% conversion` : ""} accent="good" />
      </div>

      {/* Tabs */}
      <div className="spyne-line-tab-strip spyne-line-tab-strip--compact border-b border-[var(--spyne-border)]">
        {([
          { id: "overview", label: "Overview" },
          { id: "leads", label: `Leads`, count: leads.length },
        ] as const).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTab)}
              aria-selected={active}
              className={`spyne-line-tab spyne-focus-ring cursor-pointer ${active ? "spyne-line-tab--active" : ""}`}
            >
              {tab.label}
              {"count" in tab && tab.count !== undefined && (
                <span className="spyne-line-tab__badge tabular-nums">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leads tab */}
      {activeTab === "leads" && (
        <LeadsTab
          leads={leads}
          selectedId={selectedLeadId}
          onSelect={(id) => setSelectedLeadId(id)}
          onClose={() => setSelectedLeadId(null)}
          selectedLead={selectedLead}
        />
      )}

      {/* Two-pane — Overview tab only */}
      {activeTab === "overview" && (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* LEFT — main body */}
        <div className="space-y-4 min-w-0">
          {/* Funnel */}
          {campaign.funnel && campaign.funnel.length > 0 && (
            <Card title="Funnel" icon={<Target size={13} />}>
              <div className="flex flex-col gap-1.5">
                {campaign.funnel.map((stage) => (
                  <FunnelRow key={stage.label} stage={stage} />
                ))}
              </div>
            </Card>
          )}

          {/* Workflow visualization */}
          {campaign.workflowSteps && campaign.workflowSteps.length > 0 && (
            <Card
              title="Workflow"
              icon={<GitBranch size={13} />}
              right={
                onEditWorkflow && (
                  <button
                    onClick={onEditWorkflow}
                    className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] px-2 py-1 text-[10.5px] font-semibold text-[var(--spyne-text-secondary)] transition-colors hover:border-[var(--spyne-text-muted)] hover:text-[var(--spyne-text-primary)] cursor-pointer"
                  >
                    <Edit3 size={10} />
                    Edit script
                  </button>
                )
              }
            >
              <WorkflowDiagram steps={campaign.workflowSteps} />
            </Card>
          )}

          {/* Channel breakdown */}
          {campaign.channelBreakdown && campaign.channelBreakdown.length > 0 && (
            <Card title="Channel performance" icon={<Activity size={13} />}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {campaign.channelBreakdown.map((ch) => {
                  const Icon = CHANNEL_ICON[ch.channel] ?? MessageSquare;
                  return (
                    <div key={ch.channel} className="rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon size={11} className="text-[var(--spyne-text-secondary)]" />
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--spyne-text-secondary)]">{ch.channel}</span>
                      </div>
                      <p className="text-[18px] font-bold text-[var(--spyne-text-primary)] tabular-nums leading-tight">{ch.responseRate}%</p>
                      <p className="text-[10.5px] text-[var(--spyne-text-muted)] tabular-nums">{ch.sent.toLocaleString()} sent</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT — VINI observations + live activity */}
        <aside className="space-y-4 min-w-0">
          <ObservationsCard observations={observations} />
          <BriefCard campaign={campaign} />
        </aside>
      </div>
      )}
    </div>
  );
}

/* ── Manage bar — provenance · compliance · freshness ───────────── */

function hashInt(s: string, mod: number, base = 0): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return base + (h % mod);
}

function ManageBar({ campaign }: { campaign: Campaign }) {
  // Provenance — every campaign is a Use Case run at a pinned prompt version,
  // validated by a batch test (gate ≥75%). Deterministic mock values.
  const promptVersion = hashInt(campaign.id, 6, 3); // v3–v8
  const testPass = hashInt(campaign.id + "t", 18, 80); // 80–97%
  const testPassed = testPass >= 75;
  // Compliance — recall/service is the exempt risk that must be unmissable.
  const isExempt = /recall|service/i.test(`${campaign.type} ${campaign.name}`);
  const smsOn = campaign.channels.includes("SMS");
  // Freshness — derived as the most recent top-of-hour snapshot relative to now.
  const audienceAsOf = useMemo(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, []);

  const sx = SEVERITY.success;
  const wx = SEVERITY.warning;
  const dx = SEVERITY.danger;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] px-3.5 py-2.5">
      {/* Provenance */}
      <div className="flex items-center gap-1.5">
        <Layers size={12} className="text-[var(--spyne-primary)]" />
        <span className="text-[11px] text-[var(--spyne-text-secondary)]">
          Use case <strong className="text-[var(--spyne-text-primary)]">{campaign.type}</strong> · prompt <strong className="text-[var(--spyne-text-primary)]">v{promptVersion}</strong>
        </span>
      </div>
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--spyne-text-secondary)]">
        <FlaskConical size={12} style={{ color: testPassed ? sx.ink : wx.ink }} />
        Test pass <strong className="tabular-nums" style={{ color: testPassed ? sx.ink : wx.ink }}>{testPass}%</strong>
        {testPassed && <BadgeCheck size={12} style={{ color: sx.ink }} />}
      </span>

      {/* Compliance / exempt — unmissable */}
      {isExempt ? (
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: dx.fill, color: dx.ink, borderColor: dx.border }}
        >
          <ShieldAlert size={11} /> DNC-exempt · recall
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: sx.fill, color: sx.ink, borderColor: sx.border }}
        >
          <ShieldCheck size={11} /> TCPA · quiet hours 8a–9p
        </span>
      )}
      {smsOn && (
        <span className="text-[10.5px] text-[var(--spyne-text-muted)]">10DLC <strong style={{ color: sx.ink }}>approved</strong></span>
      )}

      {/* Freshness */}
      <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-[var(--spyne-text-muted)]" title="Phase-1: counts are point-in-time seeds, not a live recompute.">
        <Clock size={11} /> audience as of <strong className="text-[var(--spyne-text-secondary)] tabular-nums">{audienceAsOf}</strong>
      </span>
    </div>
  );
}

/* ── Leads tab — list + master-detail drilldown ─────────────────── */

const CALL_OUTCOME_META: Record<string, { label: string; bg: string; text: string; Icon: typeof Phone }> = {
  connected: { label: "Connected", bg: SEVERITY.success.fill, text: SEVERITY.success.ink, Icon: PhoneCall },
  voicemail: { label: "Voicemail", bg: SEVERITY.warning.fill, text: SEVERITY.warning.ink, Icon: Voicemail },
  no_answer: { label: "No answer", bg: SEVERITY.danger.fill,  text: SEVERITY.danger.ink,  Icon: PhoneMissed },
  no_speak:  { label: "No speak",  bg: SEVERITY.neutral.fill, text: SEVERITY.neutral.ink, Icon: PhoneOff },
};

const LEAD_STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active:     { label: "In sequence", bg: SEVERITY.brand.fill,   text: SEVERITY.brand.ink,   dot: SEVERITY.brand.ink },
  responded:  { label: "Responded",   bg: SEVERITY.success.fill, text: SEVERITY.success.ink, dot: SEVERITY.success.ink },
  booked:     { label: "Appt booked", bg: SEVERITY.brand.fill,   text: SEVERITY.brand.ink,   dot: SEVERITY.brand.ink },
  no_response:{ label: "No response", bg: SEVERITY.neutral.fill, text: SEVERITY.neutral.ink, dot: SEVERITY.neutral.ink },
};

function LeadsTab({
  leads,
  selectedId,
  selectedLead,
  onSelect,
  onClose,
}: {
  leads: any[];
  selectedId: string | null;
  selectedLead: any | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return l.name.toLowerCase().includes(q) || (l.vehicle ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  if (leads.length === 0) {
    return (
      <div className="spyne-card border-dashed px-6 py-16 text-center">
        <User size={28} className="mx-auto mb-3 text-[var(--spyne-text-muted)]" />
        <p className="text-[14px] font-semibold text-[var(--spyne-text-primary)]">No leads enrolled yet</p>
        <p className="mt-1 text-[12px] text-[var(--spyne-text-muted)]">Leads will appear here as the campaign runs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-4">
      {/* LIST */}
      <div className="spyne-card overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-[var(--spyne-border)] px-3 py-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--spyne-text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or vehicle…"
              className="spyne-focus-ring w-full rounded-lg border border-[var(--spyne-border)] bg-[var(--spyne-surface)] pl-7 pr-2 py-1.5 text-[12px] text-[var(--spyne-text-primary)] placeholder:text-[var(--spyne-text-muted)] outline-none"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "active", "responded", "booked", "no_response"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`spyne-pill text-[10.5px] !h-auto !px-2.5 !py-1 font-semibold cursor-pointer ${
                  statusFilter === s ? "spyne-pill-active" : ""
                }`}
              >
                {s === "all" ? "All" : (LEAD_STATUS_META[s]?.label ?? s)}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="max-h-[640px] overflow-y-auto">
          {filtered.map((lead) => {
            const isSelected = lead.id === selectedId;
            const statusMeta = LEAD_STATUS_META[lead.status] ?? LEAD_STATUS_META.active;
            const outcomeMeta = lead.callOutcome ? CALL_OUTCOME_META[lead.callOutcome] : null;
            return (
              <button
                key={lead.id}
                onClick={() => onSelect(lead.id)}
                className={`w-full text-left grid grid-cols-[auto_1fr_auto] gap-3 px-3 py-3 border-b border-[var(--spyne-border)] last:border-0 transition-colors cursor-pointer ${
                  isSelected ? "bg-[var(--spyne-primary-soft)]" : "hover:bg-[var(--spyne-surface-hover)]"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                  style={{ background: statusMeta.bg, color: statusMeta.text }}
                >
                  {lead.initials ?? lead.name?.slice(0, 2).toUpperCase() ?? "?"}
                </div>

                {/* Body */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[13px] font-semibold text-[var(--spyne-text-primary)] truncate">{lead.name}</p>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                      style={{ background: statusMeta.bg, color: statusMeta.text }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: statusMeta.dot }} />
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--spyne-text-secondary)] truncate">{lead.vehicle ?? "—"}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10.5px] text-[var(--spyne-text-muted)]">
                    <span>{lead.source}</span>
                    {outcomeMeta && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1" style={{ color: outcomeMeta.text }}>
                          <outcomeMeta.Icon size={9} />
                          {outcomeMeta.label}
                        </span>
                      </>
                    )}
                    {lead.appointmentDate && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-[var(--spyne-primary)]">
                          <Calendar size={9} />
                          {lead.appointmentDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right meta */}
                <div className="flex flex-col items-end justify-center gap-0.5 shrink-0">
                  <span className="text-[10px] text-[var(--spyne-text-muted)]">{lead.lastActivity ?? "—"}</span>
                  <span className="text-[10px] font-semibold text-[var(--spyne-primary)]">Next: {lead.nextTouch ?? "—"}</span>
                  <ChevronRight size={11} className="text-[var(--spyne-text-muted)]" />
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-[12px] text-[var(--spyne-text-muted)]">No leads match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL */}
      {selectedLead ? (
        <LeadDetailPanel lead={selectedLead} onClose={onClose} />
      ) : (
        <div className="spyne-card border-dashed flex items-center justify-center py-16 px-4 text-center">
          <div>
            <User size={24} className="mx-auto mb-2 text-[var(--spyne-text-muted)]" />
            <p className="text-[12.5px] font-semibold text-[var(--spyne-text-primary)]">Pick a lead</p>
            <p className="mt-0.5 text-[11px] text-[var(--spyne-text-muted)]">Their full activity, call notes, and transcript will show here.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadDetailPanel({ lead, onClose }: { lead: any; onClose: () => void }) {
  const statusMeta = LEAD_STATUS_META[lead.status] ?? LEAD_STATUS_META.active;
  const outcomeMeta = lead.callOutcome ? CALL_OUTCOME_META[lead.callOutcome] : null;
  const brief = getLeadBrief(lead?.id);

  return (
    <aside className="spyne-card overflow-hidden flex flex-col max-h-[640px]">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--spyne-border)] px-4 py-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[14px] font-bold"
            style={{ background: statusMeta.bg, color: statusMeta.text }}
          >
            {lead.initials ?? lead.name?.slice(0, 2).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-[14.5px] font-bold text-[var(--spyne-text-primary)] truncate leading-tight">{lead.name}</p>
            <p className="text-[11px] text-[var(--spyne-text-secondary)] truncate">{lead.vehicle ?? "—"} · {lead.source}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="spyne-focus-ring rounded-lg p-1 transition-colors hover:bg-[var(--spyne-surface-hover)]"
          aria-label="Close lead"
        >
          <X size={13} className="text-[var(--spyne-text-secondary)]" />
        </button>
      </div>

      {/* Status + contact */}
      <div className="shrink-0 border-b border-[var(--spyne-border)] px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: statusMeta.bg, color: statusMeta.text }}
          >
            <span className="w-1 h-1 rounded-full" style={{ background: statusMeta.dot }} />
            {statusMeta.label}
          </span>
          {outcomeMeta && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: outcomeMeta.bg, color: outcomeMeta.text }}
            >
              <outcomeMeta.Icon size={9} />
              {outcomeMeta.label}
            </span>
          )}
          {lead.appointmentDate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--spyne-primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-primary)]">
              <Calendar size={9} />
              {lead.appointmentDate}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11.5px]">
          <div className="flex flex-col">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--spyne-text-muted)]">Phone</span>
            <span className="font-semibold text-[var(--spyne-text-primary)] tabular-nums">{lead.phone ?? "—"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--spyne-text-muted)]">Email</span>
            <span className="font-semibold text-[var(--spyne-text-primary)] truncate">{lead.email ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {/* Agent brief — the complete brief handed to the agent at dispatch */}
        {brief && <AgentBriefPanel brief={brief} />}

        {/* Highlights / Summary */}
        {(lead.highlights || lead.summary) && (
          <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-primary-soft)] p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={11} className="text-[var(--spyne-primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-primary)]">VINI summary</span>
            </div>
            {lead.highlights && (
              <p className="text-[12px] font-semibold text-[var(--spyne-text-primary)] leading-snug">{lead.highlights}</p>
            )}
            {lead.summary && (
              <p className="mt-1 text-[11.5px] text-[var(--spyne-text-secondary)] leading-snug">{lead.summary}</p>
            )}
          </div>
        )}

        {/* Last call info */}
        {lead.callTimestamp && (
          <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface-hover)] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Phone size={11} className="text-[var(--spyne-text-secondary)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-text-secondary)]">Last call</span>
              </div>
              {lead.hasRecording && (
                <button className="spyne-focus-ring inline-flex items-center gap-1 rounded text-[10.5px] font-semibold text-[var(--spyne-primary)] hover:underline cursor-pointer">
                  <Volume2 size={10} />
                  Play recording
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1 text-[11.5px]">
              <Row k="When" v={lead.callTimestamp} />
              <Row k="Duration" v={lead.callDuration ?? "—"} />
              {outcomeMeta && <Row k="Outcome" v={outcomeMeta.label} />}
            </div>
          </div>
        )}

        {/* Transcript */}
        {lead.transcript && (
          <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare size={11} className="text-[var(--spyne-text-secondary)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-text-secondary)]">Transcript</span>
            </div>
            <div className="flex flex-col gap-2 text-[11.5px] leading-snug">
              {lead.transcript.split("\n").map((line: string, i: number) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const isAgent = /^agent\s*:/i.test(trimmed);
                const speaker = trimmed.match(/^([^:]+):/);
                const content = trimmed.replace(/^[^:]+:\s*/, "");
                return (
                  <div key={i} className="flex flex-col">
                    <span
                      className="text-[9.5px] font-bold uppercase tracking-wider"
                      style={{ color: isAgent ? "var(--spyne-primary)" : SEVERITY.info.ink }}
                    >
                      {speaker?.[1] ?? "Speaker"}
                    </span>
                    <p className={`${isAgent ? "text-[var(--spyne-text-secondary)]" : "text-[var(--spyne-text-primary)]"} leading-snug`}>{content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sequence progress */}
        <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-surface)] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-[var(--spyne-text-secondary)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-text-secondary)]">Sequence progress</span>
            </div>
            <span className="text-[10.5px] font-semibold text-[var(--spyne-primary)]">Step {lead.currentStep ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1 text-[11.5px]">
            <Row k="Last activity" v={lead.lastActivity ?? "—"} />
            <Row k="Next touch" v={lead.nextTouch ?? "—"} />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-[var(--spyne-border)] px-3 py-2 flex items-center gap-1.5">
        <button
          className="spyne-focus-ring inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors"
          style={{ borderColor: SEVERITY.danger.border, color: SEVERITY.danger.ink, background: "var(--spyne-surface)" }}
          title="Remove this lead from the campaign"
        >
          <UserMinus size={11} /> Pull from campaign
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <button className="spyne-btn-secondary text-[11px] !px-2.5 !py-1.5">
            Hand off to rep
          </button>
          <button className="spyne-btn-primary text-[11px] !px-2.5 !py-1.5">
            Call now
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── Agent brief — the per-lead dispatch brief ──────────────────── */

const BRIEF_STAGE_META: Record<LeadBrief["stage"], { bg: string; text: string }> = {
  RESEARCH:    { bg: SEVERITY.neutral.fill, text: SEVERITY.neutral.ink },
  SHOPPING:    { bg: SEVERITY.info.fill,    text: SEVERITY.info.ink },
  EVALUATION:  { bg: SEVERITY.brand.fill,   text: SEVERITY.brand.ink },
  NEGOTIATION: { bg: SEVERITY.warning.fill, text: SEVERITY.warning.ink },
  CLOSING:     { bg: SEVERITY.success.fill, text: SEVERITY.success.ink },
};

function AgentBriefPanel({ brief }: { brief: LeadBrief }) {
  const sm = BRIEF_STAGE_META[brief.stage];
  const v = brief.vehicleOfInterest;
  const vLabel = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
  return (
    <div className="rounded-xl border border-[var(--spyne-border)] bg-[var(--spyne-primary-soft)] p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles size={11} className="text-[var(--spyne-primary)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-primary)]">Agent brief</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider" style={{ background: sm.bg, color: sm.text }}>
          {brief.stage}
          <span className="opacity-70 tabular-nums">· {Math.round(brief.stageConfidence * 100)}%</span>
        </span>
      </div>

      {/* Memory — what to pick up from */}
      <p className="text-[11.5px] leading-snug text-[var(--spyne-text-secondary)]">{brief.memory}</p>

      {/* Structured facts */}
      <div className="mt-2.5 flex flex-col gap-1.5">
        <BriefFact icon={<Car size={11} />} label="Vehicle of interest">
          <span className="font-semibold text-[var(--spyne-text-primary)]">{vLabel}</span>
          {v.color && <span className="text-[var(--spyne-text-secondary)]"> · {v.color}</span>}
          {v.vin && <span className="ml-1 rounded bg-[var(--spyne-surface-hover)] px-1 py-0.5 font-mono text-[9.5px] text-[var(--spyne-text-secondary)]">{v.vin}</span>}
        </BriefFact>

        {(brief.budgetMax || brief.paymentMethod) && (
          <BriefFact icon={<Wallet size={11} />} label="Budget & payment">
            {brief.budgetMax != null && Number.isFinite(brief.budgetMax) && <span className="font-semibold text-[var(--spyne-text-primary)] tabular-nums">up to ${brief.budgetMax.toLocaleString()}</span>}
            {brief.paymentMethod && <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase" style={{ background: SEVERITY.success.fill, color: SEVERITY.success.ink }}>{brief.paymentMethod}</span>}
            {brief.financeNote && <span className="mt-0.5 block text-[10.5px] text-[var(--spyne-text-secondary)]">{brief.financeNote}</span>}
          </BriefFact>
        )}

        {brief.tradeVehicles && brief.tradeVehicles.length > 0 && (
          <BriefFact icon={<Repeat size={11} />} label="Trade-in">
            {brief.tradeVehicles.map((t) => {
              const tl = [t.year, t.make, t.model].filter(Boolean).join(" ");
              return (
                <span key={tl} className="mr-1 rounded-md bg-[var(--spyne-surface-hover)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--spyne-text-secondary)]">
                  {tl}
                </span>
              );
            })}
          </BriefFact>
        )}

        {brief.featurePreferences && brief.featurePreferences.length > 0 && (
          <BriefFact icon={<Check size={11} />} label="Wants">
            {brief.featurePreferences.map((f) => (
              <span key={f} className="mr-1 rounded-md bg-[var(--spyne-surface-hover)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--spyne-text-secondary)]">{f}</span>
            ))}
          </BriefFact>
        )}

        <BriefFact icon={<Calendar size={11} />} label="Appointment">
          {brief.appointment.bookedOn ? (
            <span className="font-semibold text-[var(--spyne-primary)]">Booked · {brief.appointment.bookedOn}</span>
          ) : brief.appointment.promisedToBook ? (
            <span className="font-semibold" style={{ color: SEVERITY.warning.ink }}>Promised to book — not yet on the calendar</span>
          ) : (
            <span className="text-[var(--spyne-text-secondary)]">Not discussed</span>
          )}
          {brief.timelineToBuy && <span className="ml-1 text-[10.5px] text-[var(--spyne-text-muted)]">· timeline: {brief.timelineToBuy}</span>}
        </BriefFact>
      </div>

      {/* Motivations / objections / do-not-repeat */}
      {brief.motivations && brief.motivations.length > 0 && (
        <BriefChips title="Motivations" items={brief.motivations} bg={SEVERITY.success.fill} text={SEVERITY.success.ink} />
      )}
      {brief.objections && brief.objections.length > 0 && (
        <BriefChips title="Objections" items={brief.objections} bg={SEVERITY.warning.fill} text={SEVERITY.warning.ink} icon={<AlertTriangle size={9} />} />
      )}
      {brief.doNotRepeat && brief.doNotRepeat.length > 0 && (
        <BriefChips title="Do not repeat" items={brief.doNotRepeat} bg={SEVERITY.danger.fill} text={SEVERITY.danger.ink} />
      )}

      {brief.persona && (
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--spyne-text-secondary)]">
          <User size={10} /> {brief.persona}
        </p>
      )}
    </div>
  );
}

function BriefFact({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-[11.5px]">
      <span className="mt-0.5 text-[var(--spyne-text-muted)]">{icon}</span>
      <div className="min-w-0">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--spyne-text-muted)]">{label}</span>
        <div className="leading-snug">{children}</div>
      </div>
    </div>
  );
}

function BriefChips({ title, items, bg, text, icon }: { title: string; items: string[]; bg: string; text: string; icon?: React.ReactNode }) {
  return (
    <div className="mt-2">
      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider" style={{ color: icon ? text : "var(--spyne-text-muted)" }}>
        {icon}{title}
      </span>
      <div className="mt-1 flex flex-wrap gap-1">
        {items.map((it) => (
          <span key={it} className="rounded-md px-1.5 py-0.5 text-[10.5px] font-medium" style={{ background: bg, color: text }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* ── VINI observations ── */

function buildObservations(c: Campaign): { tone: "good" | "warn" | "info"; text: string; cta?: string }[] {
  const out: { tone: "good" | "warn" | "info"; text: string; cta?: string }[] = [];

  if (c.responseRate >= 60) {
    out.push({ tone: "good", text: `Response rate ${c.responseRate}% is in the top decile. Want me to scale this campaign's audience by 50%?`, cta: "Scale up" });
  }
  if (c.responseRate < 25 && c.leadsEnrolled > 30) {
    out.push({ tone: "warn", text: `Response rate ${c.responseRate}% is below threshold. Want me to A/B test the opening line on the next 100 leads?`, cta: "Start A/B test" });
  }
  if (c.analytics?.bestChannel) {
    out.push({ tone: "info", text: `${c.analytics.bestChannel} is your highest-performing channel (${c.analytics.bestChannelRate}%). The other channels could be repositioned later in the sequence.`, cta: "Reorder cadence" });
  }
  if (c.analytics?.avgTimeToBook) {
    out.push({ tone: "info", text: `Average time to book: ${c.analytics.avgTimeToBook}. Adding a 24-hour confirmation SMS could shorten this by 30%.`, cta: "Add confirmation step" });
  }
  if (c.appointmentsBooked > 0 && c.appointmentsBooked / Math.max(c.leadsEnrolled, 1) >= 0.1) {
    out.push({ tone: "good", text: `Strong appointment conversion (${Math.round((c.appointmentsBooked / c.leadsEnrolled) * 100)}%). This pattern matches your last quarter's winner.`, cta: "View pattern" });
  }
  if (out.length === 0) {
    out.push({ tone: "info", text: "Performance is on track with baseline. I'll flag any drift in the next 24 hours." });
  }
  return out;
}

function ObservationsCard({ observations }: { observations: ReturnType<typeof buildObservations> }) {
  return (
    <div className="spyne-card p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--spyne-primary-soft)" }}>
          <Sparkles size={12} style={{ color: "var(--spyne-primary)" }} />
        </div>
        <p className="text-[12.5px] font-bold" style={{ color: "var(--spyne-text-primary)" }}>VINI · live observations</p>
      </div>
      <div className="flex flex-col gap-2">
        {observations.map((o, i) => {
          const accent =
            o.tone === "good" ? { bg: "var(--spyne-success-subtle)", border: "color-mix(in srgb, var(--spyne-success-text) 22%, transparent)", text: "var(--spyne-success-text)", icon: "var(--spyne-success-text)", Icon: TrendingUp } :
            o.tone === "warn" ? { bg: "var(--spyne-warning-subtle)", border: "color-mix(in srgb, var(--spyne-warning-ink) 22%, transparent)", text: "var(--spyne-warning-ink)", icon: "var(--spyne-warning-ink)", Icon: AlertTriangle } :
                                { bg: "var(--spyne-primary-soft)", border: "var(--spyne-brand-muted)", text: "var(--spyne-primary)", icon: "var(--spyne-primary)", Icon: Sparkles };
          return (
            <div
              key={i}
              className="rounded-xl border px-3 py-2.5 flex items-start gap-2"
              style={{ background: accent.bg, borderColor: accent.border }}
            >
              <div className="mt-0.5 w-5 h-5 rounded-md bg-white flex items-center justify-center shrink-0">
                <accent.Icon size={11} style={{ color: accent.icon }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] leading-snug" style={{ color: accent.text }}>{o.text}</p>
                {o.cta && (
                  <button
                    className="mt-1 text-[10.5px] font-semibold underline-offset-2 hover:underline cursor-pointer"
                    style={{ color: accent.icon }}
                  >
                    {o.cta} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Brief card (right pane) ── */

function BriefCard({ campaign }: { campaign: Campaign }) {
  return (
    <div className="spyne-card p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <Target size={13} className="text-[var(--spyne-text-muted)]" />
        <p className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">Campaign brief</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <BriefRow label="Trigger" value={campaign.triggerDescription ?? "Manual"} />
        <BriefRow label="Type" value={campaign.type} />
        <BriefRow label="Channels" value={campaign.channels.join(" · ")} />
        {campaign.analytics?.avgResponseTime && (
          <BriefRow label="Avg response" value={campaign.analytics.avgResponseTime} />
        )}
        {campaign.analytics?.avgTimeToBook && (
          <BriefRow label="Time to book" value={campaign.analytics.avgTimeToBook} />
        )}
        {campaign.createdAt && (
          <BriefRow label="Created" value={campaign.createdAt} />
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--spyne-text-muted)]">{k}</span>
      <span className="text-[11.5px] font-semibold text-[var(--spyne-text-primary)] text-right truncate">{v}</span>
    </div>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--spyne-text-muted)]">{label}</span>
      <span className="text-[12px] font-semibold text-[var(--spyne-text-primary)] leading-snug">{value}</span>
    </div>
  );
}

/* ── Workflow diagram ── */

function WorkflowDiagram({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Live marker — this is the live overlay on the touchpoint shape */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: "var(--spyne-success)" }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--spyne-success-text)" }} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--spyne-success-text)" }}>Live · dispatched / connected / converted per touch</span>
      </div>

      {steps.map((step, idx) => {
        const Icon = STEP_ICON[step.type] ?? Sparkles;
        const c = STEP_COLOR[step.type] ?? { ink: "var(--spyne-text-muted)", soft: "var(--spyne-surface-hover)" };
        const conv = step.metrics?.conversionPct;
        const isLast = idx === steps.length - 1;
        const m = step.metrics;
        // Map per-touch runtime counts onto the dispatch → reply funnel.
        const dispatched = m?.sent;
        const connected = m?.connected ?? m?.delivered;
        const converted = m?.replied;
        const hasOverlay = dispatched !== undefined || connected !== undefined || converted !== undefined;
        return (
          <div key={step.id} className="flex">
            <div className="flex flex-col items-center shrink-0 mr-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: c.soft, color: c.ink }}
              >
                <Icon size={12} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 my-0.5" style={{ background: "var(--spyne-border)" }} />}
            </div>
            <div className="flex-1 min-w-0 pb-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.ink }}>
                  {step.type}
                </span>
                {conv !== undefined && conv < 100 && (
                  <span className="text-[10.5px] font-semibold text-[var(--spyne-text-muted)] tabular-nums">{conv}% pass</span>
                )}
              </div>
              <p className="text-[12.5px] font-semibold text-[var(--spyne-text-primary)] leading-snug">{step.label}</p>
              {step.config?.delay && (
                <p className="mt-0.5 text-[10.5px] text-[var(--spyne-text-muted)]">Delay: {step.config.delay}</p>
              )}
              {hasOverlay && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {dispatched !== undefined && <OverlayChip label="dispatched" value={dispatched} tone="neutral" />}
                  {connected !== undefined && <OverlayChip label={step.type === "sms" ? "delivered" : "connected"} value={connected} tone="info" />}
                  {converted !== undefined && <OverlayChip label="converted" value={converted} tone="good" />}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverlayChip({ label, value, tone }: { label: string; value: number; tone: "neutral" | "info" | "good" }) {
  const c =
    tone === "good" ? { bg: SEVERITY.success.fill, text: SEVERITY.success.ink, dot: SEVERITY.success.ink } :
    tone === "info" ? { bg: SEVERITY.info.fill, text: SEVERITY.info.ink, dot: SEVERITY.info.ink } :
                      { bg: SEVERITY.neutral.fill, text: SEVERITY.neutral.ink, dot: SEVERITY.neutral.ink };
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums" style={{ background: c.bg, color: c.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      {Number.isFinite(value) ? value.toLocaleString() : "—"} <span className="font-medium opacity-70">{label}</span>
    </span>
  );
}

/* ── Funnel ── */

function FunnelRow({ stage }: { stage: FunnelStage }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-[12px] font-semibold" style={{ color: "var(--spyne-text-secondary)" }}>{stage.label}</span>
      <div className="flex-1 h-7 rounded-lg overflow-hidden relative" style={{ background: "var(--spyne-page-bg)" }}>
        <div
          className="h-full flex items-center justify-end pr-2 transition-[width] duration-[350ms] ease-[cubic-bezier(0,0,0.2,1)]"
          style={{ width: `${stage.pct}%`, background: "linear-gradient(90deg, var(--spyne-primary), var(--spyne-primary-hover))" }}
        >
          <span className="text-[11px] font-bold text-white tabular-nums">{stage.count.toLocaleString()}</span>
        </div>
      </div>
      <span className="w-12 text-right text-[11.5px] font-semibold text-[#6b7280] tabular-nums">{stage.pct}%</span>
    </div>
  );
}

/* ── Small utilities ── */

function Card({
  title,
  icon,
  right,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="spyne-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[var(--spyne-text-secondary)]">
          {icon}
          <span className="text-[12.5px] font-bold text-[var(--spyne-text-primary)]">{title}</span>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function KPI({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "good" | "warn" }) {
  const color =
    accent === "good" ? SEVERITY.success.ink :
    accent === "warn" ? SEVERITY.danger.ink :
    "var(--spyne-text-primary)";
  return (
    <div className="spyne-card px-4 py-3">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#9ca3af]">{label}</p>
      <p className="mt-1 text-[22px] font-bold tabular-nums leading-tight" style={{ color }}>{value}</p>
      {sub && <p className="mt-0.5 text-[10.5px] text-[#9ca3af]">{sub}</p>}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "secondary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {
  const cls = variant === "primary" ? "spyne-btn-primary" : "spyne-btn-secondary";
  return (
    <button
      onClick={onClick}
      className={`${cls} !h-8 !text-[11.5px] inline-flex items-center gap-1`}
    >
      {children}
    </button>
  );
}
