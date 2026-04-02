"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Car,
  DollarSign,
  Clock,
  Calendar,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CircleCheck,
  CircleX,
  User,
  MapPin,
  PhoneCall,
  FileText,
} from "lucide-react"

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

type BuyingStage = "RESEARCH" | "SHOPPING" | "EVALUATION" | "NEGOTIATION" | "CLOSING"
type StockStatus = "in_stock" | "sold" | "unavailable"
type EngagementTrend = "improving" | "flat" | "cooling"

interface StageTransition {
  stage: BuyingStage
  label: string
  timestamp: string
  source: "agent" | "salesperson"
}

interface LiveVehicle {
  year: number
  make: string
  model: string
  trim?: string
  stockStatus: StockStatus
  price: number
  daysOnLot: number
  vin?: string
}

interface SimilarVehicle extends LiveVehicle {
  id: string
}

interface BuyerProfile {
  budget?: string
  monthlyTarget?: string
  financeType: "finance" | "lease" | "cash"
  tradeIn?: string
  features: string[]
  useCase: string
}

interface TimelineEntry {
  id: string
  type: "call" | "sms" | "stage_change" | "appointment" | "agent_action" | "note"
  timestamp: string
  sortKey: number
  agent: boolean
  title: string
  body?: string
  outcome?: "qualified" | "unqualified" | "appointment_set" | "no_answer" | "callback"
  duration?: string
  transcript?: string[]
}

interface Lead {
  id: string
  name: string
  initials: string
  phone: string
  email?: string
  language?: string
  buyingStage: BuyingStage
  stageHistory: StageTransition[]
  engagementTrend: EngagementTrend
  engagementDetail: string
  conversationSummary: string
  conversationOpener: string
  primaryVehicle: LiveVehicle
  secondaryVehicles?: LiveVehicle[]
  similarVehicles: SimilarVehicle[]
  buyerProfile: BuyerProfile
  timeline: TimelineEntry[]
  nextAppointment?: { date: string; type: string }
  actionItems?: string[]
}

/* ────────────────────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────────────────────── */

const STAGE_LABELS: Record<BuyingStage, string> = {
  RESEARCH:    "Just Looking",
  SHOPPING:    "Comparing Options",
  EVALUATION:  "Ready to Visit",
  NEGOTIATION: "Talking Numbers",
  CLOSING:     "Ready to Buy",
}

/* ────────────────────────────────────────────────────────────
   MOCK DATA — keyed by leadId
   Replace each entry with a real API fetch.
   ──────────────────────────────────────────────────────────── */

const MOCK_LEADS: Record<string, Lead> = {
  "lead-001": {
    id: "lead-001",
    name: "Sarah Delgado",
    initials: "SD",
    phone: "+1 (555) 234-7890",
    email: "sdelgado@email.com",
    buyingStage: "CLOSING",
    stageHistory: [
      { stage: "CLOSING",     label: "Ready to Buy",      timestamp: "Today, 9:14 AM",   source: "agent" },
      { stage: "NEGOTIATION", label: "Talking Numbers",   timestamp: "Yesterday, 4:02 PM", source: "agent" },
      { stage: "EVALUATION",  label: "Ready to Visit",    timestamp: "Mar 18, 11:30 AM",  source: "agent" },
    ],
    engagementTrend: "improving",
    engagementDetail: "Responded to agent message 2 hours ago. 4 messages exchanged today.",
    conversationSummary: "Confirmed $450/mo budget and prefers financing. Came in last week to test drive the Camry XSE and loved it. Agent confirmed availability and pricing — she's ready to move forward.",
    conversationOpener: "Sarah confirmed her $450/mo budget and loved the Camry XSE on her test drive last week. Lead with financing — she's comparing with another dealer. Push on the rate and the availability of the XSE in her color (Midnight Black).",
    primaryVehicle: {
      year: 2024, make: "Toyota", model: "Camry", trim: "XSE",
      stockStatus: "in_stock", price: 31200, daysOnLot: 14,
      vin: "4T1G11AK2RU456789",
    },
    similarVehicles: [
      { id: "v-101", year: 2024, make: "Toyota", model: "Camry", trim: "SE", stockStatus: "in_stock", price: 28900, daysOnLot: 8 },
      { id: "v-102", year: 2023, make: "Honda",  model: "Accord", trim: "Sport", stockStatus: "in_stock", price: 29800, daysOnLot: 31 },
    ],
    buyerProfile: {
      monthlyTarget: "$450/mo",
      financeType: "finance",
      features: ["Sunroof", "Sport package", "Black exterior"],
      useCase: "Daily commute — 35 miles each way",
    },
    nextAppointment: { date: "Today, TBD", type: "Follow-up call" },
    actionItems: [
      "Confirm financing rate — she's comparing with another dealer",
      "Check Midnight Black XSE availability before calling",
    ],
    timeline: [
      { id: "t1", type: "sms",          sortKey: 6, timestamp: "Today, 9:14 AM",    agent: true,  title: "Agent follow-up",           body: "Hi Sarah! Following up on your test drive last week. The Camry XSE in Midnight Black is still available. Ready to talk numbers?", outcome: "qualified" },
      { id: "t2", type: "sms",          sortKey: 7, timestamp: "Today, 9:20 AM",    agent: false, title: "Sarah replied",              body: "Yes I am! Can I come in this week? I have a $450/mo limit in mind.", outcome: "qualified" },
      { id: "t3", type: "stage_change", sortKey: 8, timestamp: "Today, 9:21 AM",    agent: true,  title: "Stage: Ready to Buy",        body: "Agent updated stage based on budget confirmation and buy intent." },
      { id: "t4", type: "call",         sortKey: 3, timestamp: "Mar 20, 3:15 PM",   agent: true,  title: "Outbound call · 6 min",      body: "Discussed availability and pricing. Lead confirmed test drive interest. Appointment set for Mar 21.", outcome: "appointment_set", duration: "6:12",
        transcript: [
          "Agent: Hi Sarah! Just following up — how was the test drive experience?",
          "Sarah: It was really great. I love the XSE.",
          "Agent: Glad to hear it. I wanted to walk you through the financing numbers. At $31,200, you're looking at roughly $470-480 a month on a 60-month term.",
          "Sarah: Hmm. I really need to stay under $450.",
          "Agent: Understood. We can look at a loyalty rate or the SE trim to get you there. Let me pull the numbers and follow up.",
        ],
      },
      { id: "t5", type: "appointment",  sortKey: 4, timestamp: "Mar 21, 11:00 AM",  agent: false, title: "Test drive — attended",      body: "Drove Camry XSE. Positive feedback on sport package and fuel economy." },
      { id: "t6", type: "call",         sortKey: 1, timestamp: "Mar 19, 10:00 AM",  agent: true,  title: "Speed-to-lead call · 4 min", body: "First contact after internet inquiry. Confirmed interest, discussed available trims.", outcome: "qualified", duration: "4:30",
        transcript: [
          "Agent: Hi Sarah, thanks for reaching out about the Camry. I see you were interested in the XSE trim?",
          "Sarah: Yeah, I saw it on the website. What's the difference between the XSE and the SE?",
          "Agent: The XSE has the sport package — paddle shifters, sport-tuned suspension, and the mesh grille. The SE is the standard setup.",
          "Sarah: I definitely want the XSE. Does it come in black?",
          "Agent: Yes, Midnight Black Metallic is available in stock right now. We're at $31,200 for the XSE.",
          "Sarah: That's a bit more than I was thinking. Can I come in this week to take a look?",
          "Agent: Absolutely — I'll get you set up for a test drive.",
        ],
      },
    ],
  },

  "lead-002": {
    id: "lead-002",
    name: "Marcus Webb",
    initials: "MW",
    phone: "+1 (555) 891-3344",
    buyingStage: "EVALUATION",
    stageHistory: [
      { stage: "EVALUATION",  label: "Ready to Visit",  timestamp: "Today, 7:48 AM",    source: "agent" },
      { stage: "SHOPPING",    label: "Comparing Options", timestamp: "Mar 1, 2:10 PM", source: "agent" },
    ],
    engagementTrend: "improving",
    engagementDetail: "Responded to agent follow-up 2 hours ago after 3 weeks of silence.",
    conversationSummary: "Initially contacted 3 weeks ago about the CR-V. Went cold after a price discussion. Re-engaged this morning — responded to the 21-day recovery sequence. Open to revisiting options.",
    conversationOpener: "Marcus went cold after a price pushback 3 weeks ago. He just re-engaged — don't lead with price. Lead with the update: new inventory, current incentives. Ask what changed. The window is open but it's warm, not hot — let him talk first.",
    primaryVehicle: {
      year: 2023, make: "Honda", model: "CR-V", trim: "EX-L",
      stockStatus: "in_stock", price: 36500, daysOnLot: 22,
      vin: "5J6RW2H8XPL012345",
    },
    similarVehicles: [
      { id: "v-201", year: 2024, make: "Honda",  model: "CR-V", trim: "EX",    stockStatus: "in_stock", price: 33200, daysOnLot: 5 },
      { id: "v-202", year: 2024, make: "Toyota", model: "RAV4", trim: "XLE",   stockStatus: "in_stock", price: 33800, daysOnLot: 9 },
    ],
    buyerProfile: {
      budget: "$35,000",
      financeType: "finance",
      features: ["All-wheel drive", "Heated seats", "Apple CarPlay"],
      useCase: "Family of 4 — school runs and weekend trips",
    },
    actionItems: [
      "Don't lead with price. Ask what changed — re-engagement is warm, not hot.",
    ],
    timeline: [
      { id: "t1", type: "sms",          sortKey: 5, timestamp: "Today, 7:48 AM",    agent: true,  title: "Recovery sequence · Day 21", body: "Hey Marcus — just wanted to check back in. We have some new CR-V inventory and current Honda incentives that might work better for you. Still interested?", outcome: "qualified" },
      { id: "t2", type: "sms",          sortKey: 6, timestamp: "Today, 8:05 AM",    agent: false, title: "Marcus replied",              body: "Yeah I've been thinking about it actually. What incentives are available right now?" },
      { id: "t3", type: "stage_change", sortKey: 7, timestamp: "Today, 8:06 AM",    agent: true,  title: "Stage: Ready to Visit",      body: "Re-engagement confirmed. Stage updated." },
      { id: "t4", type: "call",         sortKey: 3, timestamp: "Mar 1, 2:10 PM",    agent: true,  title: "Outbound call · 8 min",      body: "Price discussion. Lead pushed back on $36,500 — said they found similar for $34K online. Call ended without resolution.", outcome: "callback", duration: "8:02" },
      { id: "t5", type: "call",         sortKey: 1, timestamp: "Feb 26, 11:30 AM",  agent: true,  title: "Speed-to-lead call · 5 min", body: "First contact after Cars.com inquiry. Strong interest in CR-V EX-L. Requested test drive.", outcome: "qualified", duration: "5:18" },
    ],
  },
}

// Fallback for unrecognized lead IDs
const FALLBACK_LEAD: Lead = MOCK_LEADS["lead-001"]

/* ────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────────────────────── */

function StageBadge({ stage }: { stage: BuyingStage }) {
  const label = STAGE_LABELS[stage]
  const isHot  = stage === "CLOSING" || stage === "NEGOTIATION"
  const isWarm = stage === "EVALUATION"

  const style = isHot
    ? { background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", border: "1px solid var(--spyne-brand-muted)" }
    : isWarm
    ? { background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-text)", border: "1px solid var(--spyne-warning-muted)" }
    : { background: "var(--secondary)", color: "var(--spyne-text-secondary)", border: "1px solid var(--spyne-border)" }

  return (
    <span className="spyne-badge text-sm px-3 py-1" style={{ ...style, fontSize: "12px", padding: "4px 10px" }}>
      {label}
    </span>
  )
}

function EngagementSignal({ trend, detail }: { trend: EngagementTrend; detail: string }) {
  const icon =
    trend === "improving" ? <TrendingUp  size={13} /> :
    trend === "cooling"   ? <TrendingDown size={13} /> :
                            <Minus size={13} />

  const color =
    trend === "improving" ? "var(--spyne-success-text)" :
    trend === "cooling"   ? "var(--spyne-danger-text)"  :
                            "var(--spyne-text-muted)"

  const bg =
    trend === "improving" ? "var(--spyne-success-subtle)" :
    trend === "cooling"   ? "var(--spyne-danger-subtle)"  :
                            "var(--secondary)"

  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2.5"
      style={{ background: bg }}
    >
      <span style={{ color, marginTop: "1px", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: "12px", color, lineHeight: 1.45 }}>{detail}</span>
    </div>
  )
}

function StockStatusRow({ vehicle }: { vehicle: LiveVehicle }) {
  const isSold        = vehicle.stockStatus === "sold"
  const isLotAged     = vehicle.daysOnLot > 30
  const stockColor    = isSold ? "var(--spyne-danger)" : "var(--spyne-success)"
  const stockLabel    = isSold ? "Sold" : vehicle.stockStatus === "in_stock" ? "In Stock" : "Unavailable"

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: isSold ? "var(--spyne-danger-subtle)" : "var(--spyne-surface)",
        borderColor: isSold ? "var(--spyne-danger-muted)" : "var(--spyne-border)",
      }}
    >
      {/* Vehicle name */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold" style={{ fontSize: "14px", color: "var(--spyne-text-primary)" }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.trim ? ` ${vehicle.trim}` : ""}
          </p>
          {vehicle.vin && (
            <p className="spyne-caption mt-0.5">VIN: {vehicle.vin}</p>
          )}
        </div>
        {isSold && (
          <span
            className="spyne-badge spyne-badge-danger flex-shrink-0 flex items-center gap-1"
          >
            <CircleX size={10} />
            Vehicle Sold
          </span>
        )}
        {!isSold && (
          <span
            className="spyne-badge spyne-badge-success flex-shrink-0 flex items-center gap-1"
          >
            <CircleCheck size={10} />
            {stockLabel}
          </span>
        )}
      </div>

      {/* Price + days on lot */}
      {!isSold && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <DollarSign size={13} style={{ color: "var(--spyne-text-muted)" }} />
            <span
              className="font-semibold"
              style={{ fontSize: "15px", color: "var(--spyne-text-primary)", fontVariantNumeric: "tabular-nums" }}
            >
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5"
            style={{ color: isLotAged ? "var(--spyne-warning-text)" : "var(--spyne-text-muted)" }}
          >
            <Clock size={12} />
            <span style={{ fontSize: "12px", fontWeight: isLotAged ? 600 : 400 }}>
              {vehicle.daysOnLot} days on lot
              {isLotAged ? " ⚠" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function SimilarVehicleCard({ v }: { v: SimilarVehicle }) {
  const isLotAged = v.daysOnLot > 20

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors hover:border-[var(--spyne-border-strong)]"
      style={{
        borderColor: isLotAged ? "var(--spyne-warning-muted)" : "var(--spyne-border)",
        background: isLotAged ? "var(--spyne-warning-subtle)" : "var(--spyne-surface)",
      }}
    >
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--spyne-text-primary)" }}>
          {v.year} {v.make} {v.model} {v.trim ?? ""}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span style={{ fontSize: "12px", color: "var(--spyne-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
            ${v.price.toLocaleString()}
          </span>
          <span style={{ color: "var(--spyne-border-strong)" }}>·</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: isLotAged ? 600 : 400,
              color: isLotAged ? "var(--spyne-warning-text)" : "var(--spyne-text-muted)",
            }}
          >
            {v.daysOnLot}d on lot{isLotAged ? " ⚠" : ""}
          </span>
        </div>
      </div>
      <ChevronRight size={14} style={{ color: "var(--spyne-text-muted)", flexShrink: 0 }} />
    </div>
  )
}

function TranscriptToggle({ lines }: { lines: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1"
        style={{ fontSize: "11px", color: "var(--spyne-brand)", fontWeight: 500 }}
      >
        <FileText size={11} />
        {open ? "Hide transcript" : "View transcript"}
        <ChevronDown
          size={11}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-lg p-3 space-y-1.5" style={{ background: "var(--secondary)" }}>
          {lines.map((line, i) => (
            <p key={i} style={{ fontSize: "11px", lineHeight: 1.55, color: "var(--spyne-text-secondary)" }}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const iconMap: Record<TimelineEntry["type"], React.ReactNode> = {
    call:         <PhoneCall  size={13} />,
    sms:          <MessageSquare size={13} />,
    stage_change: <TrendingUp size={13} />,
    appointment:  <Calendar size={13} />,
    agent_action: <Sparkles size={13} />,
    note:         <User size={13} />,
  }

  const colorMap: Record<TimelineEntry["type"], string> = {
    call:         "var(--spyne-brand)",
    sms:          "var(--spyne-info)",
    stage_change: "var(--spyne-success)",
    appointment:  "var(--spyne-warning)",
    agent_action: "var(--spyne-brand)",
    note:         "var(--spyne-text-muted)",
  }

  const bgMap: Record<TimelineEntry["type"], string> = {
    call:         "var(--spyne-brand-subtle)",
    sms:          "var(--spyne-info-subtle)",
    stage_change: "var(--spyne-success-subtle)",
    appointment:  "var(--spyne-warning-subtle)",
    agent_action: "var(--spyne-brand-subtle)",
    note:         "var(--secondary)",
  }

  return (
    <div className="flex gap-3">
      {/* Icon + vertical line */}
      <div className="flex flex-col items-center">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
          style={{ background: bgMap[entry.type], color: colorMap[entry.type] }}
        >
          {iconMap[entry.type]}
        </div>
        <div
          className="w-px flex-1 mt-1"
          style={{ background: "var(--spyne-border)", minHeight: "12px" }}
        />
      </div>

      {/* Content */}
      <div className="pb-5 min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--spyne-text-primary)" }}>
            {entry.title}
          </span>
          <span className="spyne-caption flex-shrink-0">{entry.timestamp}</span>
        </div>
        {entry.body && (
          <p
            className="rounded-lg px-3 py-2"
            style={{
              fontSize: "12px",
              lineHeight: 1.5,
              color: "var(--spyne-text-secondary)",
              background: entry.agent ? "var(--secondary)" : "var(--spyne-brand-subtle)",
              color: entry.agent ? "var(--spyne-text-secondary)" : "var(--spyne-text-primary)",
            }}
          >
            {entry.body}
          </p>
        )}
        {entry.duration && (
          <div className="flex items-center gap-1 mt-1.5">
            <Clock size={10} style={{ color: "var(--spyne-text-muted)" }} />
            <span className="spyne-caption">{entry.duration}</span>
          </div>
        )}
        {entry.type === "call" && entry.transcript && (
          <TranscriptToggle lines={entry.transcript} />
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

export default function CustomerCardPage({
  params,
}: {
  params: Promise<{ leadId: string }>
}) {
  const { leadId } = use(params)
  const router = useRouter()
  const lead = MOCK_LEADS[leadId] ?? FALLBACK_LEAD
  const sortedTimeline = [...lead.timeline].sort((a, b) => b.sortKey - a.sortKey)

  return (
    <div
      className="min-h-full"
      style={{ background: "var(--spyne-bg)" }}
    >
      {/* ── Sticky top bar ───────────────────────────────────── */}
      <div
        className="sticky top-0 md:top-[49px] z-10 flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: "var(--spyne-surface)",
          borderColor: "var(--spyne-border)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="spyne-btn-ghost"
          style={{ height: "36px", paddingLeft: "8px" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Call now — launches tel: and stays on page */}
        <a
          href={`tel:${lead.phone.replace(/\D/g, "")}`}
          className="spyne-btn-primary"
          style={{ height: "36px", minHeight: "44px" }}
        >
          <Phone size={14} />
          Call Now
        </a>
      </div>

      {/* ── Desktop two-pane / Mobile single column ───────────── */}
      <div className="md:flex md:gap-0 md:divide-x" style={{ borderColor: "var(--spyne-border)" }}>

        {/* ── LEFT PANE — context (one screen on mobile) ───────── */}
        <div className="md:w-[55%] md:sticky md:top-[110px] md:self-start md:max-h-[calc(100vh-110px)] md:overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4">

            {/* Section 1: Identity + Signal */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm flex-shrink-0"
                  style={{ background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)" }}
                >
                  {lead.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="spyne-title" style={{ fontSize: "18px" }}>{lead.name}</h1>
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, "")}`}
                    className="spyne-caption"
                    style={{ color: "var(--spyne-text-secondary)", textDecoration: "none" }}
                  >
                    {lead.phone}
                  </a>
                </div>
                <div className="flex-shrink-0">
                  <StageBadge stage={lead.buyingStage} />
                </div>
              </div>
              <EngagementSignal trend={lead.engagementTrend} detail={lead.engagementDetail} />
              {/* Stage progression */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[...lead.stageHistory].reverse().map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight size={10} style={{ color: "var(--spyne-text-muted)" }} />}
                    <StageBadge stage={t.stage} />
                  </div>
                ))}
              </div>
              <p className="spyne-caption mt-1">
                Updated {lead.stageHistory[0].timestamp} · by {lead.stageHistory[0].source}
              </p>
            </div>

            {/* Next appointment */}
            {lead.nextAppointment && (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
                style={{ background: "var(--spyne-warning-subtle)", borderColor: "var(--spyne-warning-muted)" }}
              >
                <Calendar size={13} style={{ color: "var(--spyne-warning)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--spyne-warning-text)" }}>
                    {lead.nextAppointment.type}
                  </p>
                  <p className="spyne-caption">{lead.nextAppointment.date}</p>
                </div>
              </div>
            )}

            {/* Action items */}
            {lead.actionItems && lead.actionItems.length > 0 && (
              <div
                className="rounded-xl border p-3.5"
                style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
              >
                <p className="spyne-subheading mb-2">Action Items</p>
                <div className="flex flex-col gap-2">
                  {lead.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ fontSize: "12px", color: "var(--spyne-brand)", marginTop: "2px", flexShrink: 0 }}>•</span>
                      <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--spyne-text-secondary)" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Buyer Intent — compact grid */}
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--spyne-border)", background: "var(--spyne-surface)" }}
            >
              <p className="spyne-subheading mb-3">Buyer Intent</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {lead.buyerProfile.budget && (
                  <div>
                    <p className="spyne-caption">Budget</p>
                    <p className="spyne-label">{lead.buyerProfile.budget}</p>
                  </div>
                )}
                {lead.buyerProfile.monthlyTarget && (
                  <div>
                    <p className="spyne-caption">Monthly target</p>
                    <p className="spyne-label">{lead.buyerProfile.monthlyTarget}</p>
                  </div>
                )}
                <div>
                  <p className="spyne-caption">Finance type</p>
                  <p className="spyne-label" style={{ textTransform: "capitalize" }}>
                    {lead.buyerProfile.financeType}
                  </p>
                </div>
                {lead.buyerProfile.tradeIn && (
                  <div>
                    <p className="spyne-caption">Trade-in</p>
                    <p className="spyne-label">{lead.buyerProfile.tradeIn}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="spyne-caption">Use case</p>
                  <p className="spyne-label">{lead.buyerProfile.useCase}</p>
                </div>
              </div>
              {lead.buyerProfile.features.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--spyne-border)" }}>
                  <p className="spyne-caption mb-1.5">Must-haves</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.buyerProfile.features.map((f) => (
                      <span key={f} className="spyne-badge spyne-badge-neutral">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Lead with this */}
            <div
              className="rounded-xl p-4 border-l-4"
              style={{
                background: "var(--spyne-brand-subtle)",
                borderLeftColor: "var(--spyne-brand)",
                borderTop: "1px solid var(--spyne-brand-muted)",
                borderRight: "1px solid var(--spyne-brand-muted)",
                borderBottom: "1px solid var(--spyne-brand-muted)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={13} style={{ color: "var(--spyne-brand)" }} />
                <p className="spyne-subheading" style={{ color: "var(--spyne-brand)", letterSpacing: "0.04em" }}>
                  Lead with this
                </p>
              </div>
              <p style={{ fontSize: "13px", lineHeight: 1.55, color: "var(--spyne-text-primary)" }}>
                {lead.conversationOpener}
              </p>
            </div>

            {/* Divider */}
            <div className="spyne-divider" />

            {/* Section 4: Vehicle Interest */}
            <div>
              <p className="spyne-subheading mb-2">Primary Vehicle</p>
              <StockStatusRow vehicle={lead.primaryVehicle} />
            </div>

            {lead.secondaryVehicles?.map((v, i) => (
              <div key={i}>
                <p className="spyne-subheading mb-2">Also Considering</p>
                <StockStatusRow vehicle={v} />
              </div>
            ))}

            {/* Section 5: Conversation context */}
            <div>
              <p className="spyne-subheading mb-1.5">Context</p>
              <p className="spyne-body-sm">{lead.conversationSummary}</p>
            </div>

            {/* Language preference */}
            {lead.language && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "var(--spyne-info-subtle)", fontSize: "12px", color: "var(--spyne-info-text)" }}
              >
                <MapPin size={12} />
                Preferred language: {lead.language}
              </div>
            )}

            {/* Section 6: Similar vehicles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="spyne-subheading">Similar Vehicles</p>
                <span className="spyne-caption">In stock · preference-matched</span>
              </div>
              <div className="space-y-2">
                {lead.similarVehicles.map((v) => (
                  <SimilarVehicleCard key={v.id} v={v} />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANE — full timeline ────────────────────────── */}
        <div className="md:w-[45%] md:border-l" style={{ borderColor: "var(--spyne-border)" }}>
          <div className="p-4 md:p-6">
            <p className="spyne-subheading mb-4">Activity Timeline</p>
            <div>
              {sortedTimeline.map((entry) => (
                <TimelineItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
