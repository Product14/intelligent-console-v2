"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  Calendar,
  TrendingUp,
  Sparkles,
  X,
  Clock,
  ArrowUpRight,
  ChevronDown,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

type ConvoOutcome  = "qualified" | "unqualified" | "appointment_set" | "no_show" | "closed" | "in_progress"
type Department    = "sales" | "service"
type MessageType   = "sms" | "call" | "agent_action" | "stage_change" | "appointment"
type FilterMode    = ConvoOutcome | "all" | "attention" | "lot_match"

interface ThreadMessage {
  id: string
  type: MessageType
  timestamp: string
  agent: boolean          // true = Vini/outbound, false = customer inbound
  body: string
  duration?: string       // calls only, "M:SS"
  campaign?: string       // what triggered this interaction
  callOutcome?: "connected" | "no_answer" | "voicemail"
  signal?: string         // key insight to surface (e.g. "Budget confirmed: $450/mo")
  transcript?: string[]   // call transcript lines
}

interface Conversation {
  id: string
  leadId: string
  customerName: string
  initials: string
  lastMessage: string
  lastActivity: string
  outcome: ConvoOutcome
  department: Department
  salesperson: string
  vehicle: string
  thread: ThreadMessage[]
  needsAttention?: boolean
  vehicleAgeAlert?: boolean
  vehicleDaysOnLot?: number
  buyingStage?: "RESEARCH" | "SHOPPING" | "EVALUATION" | "NEGOTIATION" | "CLOSING"
  lastSignal?: string
}

/* ────────────────────────────────────────────────────────────
   CONSTANTS
   ──────────────────────────────────────────────────────────── */

const OUTCOME_CONFIG: Record<ConvoOutcome, { label: string; badgeClass: string }> = {
  qualified:       { label: "Qualified",       badgeClass: "spyne-badge spyne-badge-success" },
  unqualified:     { label: "Unqualified",     badgeClass: "spyne-badge spyne-badge-neutral" },
  appointment_set: { label: "Appointment Set", badgeClass: "spyne-badge spyne-badge-brand"   },
  no_show:         { label: "No Show",         badgeClass: "spyne-badge spyne-badge-danger"  },
  closed:          { label: "Closed",          badgeClass: "spyne-badge spyne-badge-success" },
  in_progress:     { label: "In Progress",     badgeClass: "spyne-badge spyne-badge-warning" },
}

const STAGE_LABELS: Record<string, string> = {
  RESEARCH:    "Just Looking",
  SHOPPING:    "Comparing Options",
  EVALUATION:  "Ready to Visit",
  NEGOTIATION: "Talking Numbers",
  CLOSING:     "Ready to Buy",
}

/* ────────────────────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────────────────────── */

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c-001",
    leadId: "lead-001",
    customerName: "Sarah Delgado",
    initials: "SD",
    lastMessage: "Yes I am! Can I come in this week? I have a $450/mo limit in mind.",
    lastActivity: "2h ago",
    outcome: "qualified",
    department: "sales",
    salesperson: "Jordan M.",
    vehicle: "2024 Toyota Camry XSE",
    buyingStage: "CLOSING",
    lastSignal: "Budget confirmed: $450/mo · Ready to talk numbers",
    thread: [
      {
        id: "m1",
        type: "call",
        timestamp: "Mar 19, 10:00 AM",
        agent: true,
        body: "Confirmed interest in Camry XSE. Lead asked about trim differences between XSE and SE. Explained sport package and fuel economy advantages.",
        duration: "4:30",
        campaign: "Speed-to-lead Response",
        callOutcome: "connected",
        signal: "Strong intent — asked for pricing on XSE specifically",
        transcript: [
          "Agent: Hi Sarah, thanks for reaching out about the Camry. I see you were interested in the XSE trim?",
          "Sarah: Yeah, I saw it on the website. What's the difference between the XSE and the SE?",
          "Agent: Great question. The XSE comes with the sport package — V6 option, paddle shifters, mesh grille, and the sport-tuned suspension. The SE is the more standard setup.",
          "Sarah: I definitely want the XSE. Does it come in black?",
          "Agent: Yes, Midnight Black Metallic is available in stock right now. Price-wise we're at $31,200 for the XSE.",
          "Sarah: That's a bit more than I was thinking. Can I come in this week?",
          "Agent: Absolutely — I'll get you set up for a test drive.",
        ],
      },
      {
        id: "m2",
        type: "sms",
        timestamp: "Mar 20, 9:05 AM",
        agent: true,
        body: "Hi Sarah! Just following up on our call. The Camry XSE you were interested in is available for a test drive this week. Would Tuesday or Wednesday work?",
        campaign: "Post-call Follow-up",
      },
      {
        id: "m3",
        type: "sms",
        timestamp: "Mar 20, 9:22 AM",
        agent: false,
        body: "Wednesday works! What time?",
      },
      {
        id: "m4",
        type: "sms",
        timestamp: "Mar 20, 9:23 AM",
        agent: true,
        body: "Perfect — I'll book 11:00 AM. See you then!",
      },
      {
        id: "m4b",
        type: "agent_action",
        timestamp: "Mar 20, 9:24 AM",
        agent: true,
        body: "Appointment booked: Test drive · Mar 21, 11:00 AM",
        campaign: "Appointment Confirmed",
      },
      {
        id: "m5",
        type: "appointment",
        timestamp: "Mar 21, 11:00 AM",
        agent: false,
        body: "Test drive completed. Sarah drove the XSE. Very positive reaction to sport package and fuel economy. Expressed interest in proceeding.",
        campaign: "Test Drive",
      },
      {
        id: "m6",
        type: "call",
        timestamp: "Mar 21, 3:15 PM",
        agent: true,
        body: "Discussed financing options post-test-drive. Lead confirmed $450/mo budget ceiling. Explained financing terms and monthly payment estimates for XSE.",
        duration: "6:12",
        campaign: "Post-test-drive Follow-up",
        callOutcome: "connected",
        signal: "Budget confirmed: $450/mo · Ready to talk numbers",
        transcript: [
          "Agent: Hi Sarah! How did you feel about the test drive?",
          "Sarah: I loved it honestly. The sport package feels really nice.",
          "Agent: I'm glad to hear that. I wanted to walk you through the financing numbers. At $31,200, with a standard 60-month term and around 7% APR, you're looking at roughly $470-480 a month.",
          "Sarah: Hmm. I really need to stay under $450.",
          "Agent: Understood. We have a few options — I can look at the SE trim which would get you to $445, or if you qualify for our loyalty financing rate we might get the XSE into range.",
          "Sarah: I'd really like the XSE. Can we try the loyalty rate?",
          "Agent: Absolutely. I'll put together the numbers and follow up with you by email.",
        ],
      },
      {
        id: "m6b",
        type: "agent_action",
        timestamp: "Mar 21, 3:17 PM",
        agent: true,
        body: "Action item created: Send financing comparison — XSE at loyalty rate vs SE standard rate before next call.",
      },
      {
        id: "m7",
        type: "sms",
        timestamp: "Today, 9:14 AM",
        agent: true,
        body: "Hi Sarah! Following up on your test drive last week. The Camry XSE in Midnight Black is still available. Ready to talk numbers?",
        campaign: "7-Day Follow-up Sequence",
      },
      {
        id: "m8",
        type: "sms",
        timestamp: "Today, 9:20 AM",
        agent: false,
        body: "Yes I am! Can I come in this week? I have a $450/mo limit in mind.",
        signal: "Lead re-confirmed budget and intent — handoff triggered",
      },
    ],
  },
  {
    id: "c-002",
    leadId: "lead-002",
    customerName: "Marcus Webb",
    initials: "MW",
    lastMessage: "Yeah I've been thinking about it actually. What incentives are available right now?",
    lastActivity: "2h ago",
    outcome: "in_progress",
    department: "sales",
    salesperson: "Mike D.",
    vehicle: "2023 Honda CR-V EX-L",
    needsAttention: true,
    vehicleAgeAlert: true,
    vehicleDaysOnLot: 47,
    buyingStage: "EVALUATION",
    lastSignal: "Re-engaged after 3 weeks cold — window is open",
    thread: [
      {
        id: "m1",
        type: "call",
        timestamp: "Feb 26, 11:30 AM",
        agent: true,
        body: "Strong interest in CR-V EX-L. Requested test drive. Discussed trim comparison with Sport model.",
        duration: "5:18",
        campaign: "Speed-to-lead Response",
        callOutcome: "connected",
        signal: "Requested test drive — high intent",
        transcript: [
          "Agent: Hi Marcus, thanks for reaching out about the CR-V EX-L.",
          "Marcus: Yeah I saw it online. What's the difference between the EX-L and the Sport?",
          "Agent: The EX-L gives you the premium interior — leather seats, heated front seats, power liftgate. The Sport is more performance-focused with a different wheel and suspension setup.",
          "Marcus: The EX-L sounds more like what I need. What's the price on that one?",
          "Agent: The EX-L AWD is at $36,500. Can I set you up for a test drive this week?",
          "Marcus: Yeah, let's do it.",
        ],
      },
      {
        id: "m2",
        type: "sms",
        timestamp: "Mar 1, 10:00 AM",
        agent: true,
        body: "Hi Marcus! Checking in — the CR-V EX-L is still available. Ready to set up that test drive?",
        campaign: "Day 3 Follow-up",
      },
      {
        id: "m3",
        type: "call",
        timestamp: "Mar 1, 2:10 PM",
        agent: true,
        body: "Price discussion. Lead pushed back at $36,500 — mentioned finding similar listing online for $34K. Call ended without resolution.",
        duration: "8:02",
        campaign: "Outbound — Price Objection",
        callOutcome: "connected",
        signal: "Price objection: competing listing at $34K",
        transcript: [
          "Agent: Hi Marcus! Just checking in. Ready to set up that test drive?",
          "Marcus: Actually I've been doing more research. I found a similar CR-V EX-L at another dealer for $34K.",
          "Agent: Thanks for sharing that. Could you tell me the year and mileage on that one?",
          "Marcus: It's a 2023, about 8,000 miles. Used.",
          "Agent: Got it — that would be used versus our new model. But I hear you on price. Let me see what I can do.",
          "Marcus: If you can get close to $34K I'd probably come in.",
          "Agent: I'll check with the manager and follow up today.",
        ],
      },
      {
        id: "m3b",
        type: "agent_action",
        timestamp: "Mar 1, 2:12 PM",
        agent: true,
        body: "Action item created: Follow up in 7 days with updated incentives. Note: price sensitivity at $34K — comparing with used EX-L at another dealer.",
      },
      {
        id: "m4",
        type: "sms",
        timestamp: "Mar 8, 9:00 AM",
        agent: true,
        body: "Hi Marcus — following up on our conversation. Any questions I can answer about the CR-V?",
        campaign: "Day 7 Follow-up",
      },
      {
        id: "m5",
        type: "sms",
        timestamp: "Mar 15, 9:00 AM",
        agent: true,
        body: "Hey Marcus! Just wanted to check in. We have some new CR-V inventory arriving soon.",
        campaign: "Day 14 Follow-up",
      },
      {
        id: "m6",
        type: "sms",
        timestamp: "Today, 7:48 AM",
        agent: true,
        body: "Hey Marcus — just wanted to check back in. We have some new CR-V inventory and current Honda incentives that might work better for you. Still interested?",
        campaign: "30-Day Re-engagement",
      },
      {
        id: "m7",
        type: "sms",
        timestamp: "Today, 8:05 AM",
        agent: false,
        body: "Yeah I've been thinking about it actually. What incentives are available right now?",
        signal: "Re-engaged after 3 weeks cold — window is open",
      },
    ],
  },
  {
    id: "c-003",
    leadId: "lead-011",
    customerName: "Tom Bradley",
    initials: "TB",
    lastMessage: "I'm not really looking right now. Maybe in a few months.",
    lastActivity: "Yesterday",
    outcome: "unqualified",
    department: "sales",
    salesperson: "Jordan M.",
    vehicle: "2024 Chevrolet Silverado LT",
    needsAttention: true,
    buyingStage: "RESEARCH",
    lastSignal: "Explicitly not ready — archive after 60-day sequence",
    thread: [
      {
        id: "m1",
        type: "call",
        timestamp: "Mar 19, 2:00 PM",
        agent: true,
        body: "Lead inquired online but not actively shopping. Mentioned casually browsing. No test drive interest at this time.",
        duration: "3:05",
        campaign: "Speed-to-lead Response",
        callOutcome: "connected",
        transcript: [
          "Agent: Hi Tom! Thanks for reaching out about the Silverado. What brought you in today?",
          "Tom: Honestly just browsing. I might need a truck in a few months.",
          "Agent: No problem at all. Any particular trim you had in mind?",
          "Tom: Not really. I'm just getting a feel for pricing right now.",
          "Agent: Totally understand. I'll send you some info. Feel free to reach back out when you're ready.",
        ],
      },
      {
        id: "m2",
        type: "sms",
        timestamp: "Mar 20, 10:00 AM",
        agent: true,
        body: "Hi Tom! Following up on your Silverado inquiry. Any questions I can answer?",
        campaign: "Day 1 Follow-up",
      },
      {
        id: "m3",
        type: "sms",
        timestamp: "Yesterday, 3:30 PM",
        agent: false,
        body: "I'm not really looking right now. Maybe in a few months.",
        signal: "Explicitly not ready — archive after 60-day sequence",
      },
    ],
  },
  {
    id: "c-004",
    leadId: "lead-003",
    customerName: "Diana Torres",
    initials: "DT",
    lastMessage: "Perfect, I'll be there at 10. Can't wait to see the RAV4 in person!",
    lastActivity: "Mar 20",
    outcome: "appointment_set",
    department: "sales",
    salesperson: "Jordan M.",
    vehicle: "2024 Toyota RAV4 XLE",
    vehicleAgeAlert: true,
    vehicleDaysOnLot: 34,
    buyingStage: "EVALUATION",
    lastSignal: "Appointment confirmed for Friday 10:00 AM",
    thread: [
      {
        id: "m1",
        type: "call",
        timestamp: "Mar 18, 11:30 AM",
        agent: true,
        body: "Strong interest in RAV4 XLE. Comparing with CR-V. Liked the interior space and AWD standard on XLE.",
        duration: "7:14",
        campaign: "Speed-to-lead Response",
        callOutcome: "connected",
        signal: "Comparing RAV4 XLE vs CR-V — AWD is a priority",
        transcript: [
          "Agent: Hi Diana! Thanks for reaching out about the RAV4.",
          "Diana: Hi! I've been looking at both the RAV4 XLE and the Honda CR-V. Trying to decide between the two.",
          "Agent: Great comparison. The XLE gives you standard AWD, 8-inch touchscreen, and the larger cargo area. The CR-V is slightly smaller but more fuel efficient.",
          "Diana: The space matters a lot to me — I have two kids and we do a lot of weekend trips.",
          "Agent: The RAV4 would be the better fit then. The XLE has the power liftgate which is great for loading up on trips.",
          "Diana: I'd love to come see it. When can I do a test drive?",
          "Agent: I can get you in any day this week. What works best?",
        ],
      },
      {
        id: "m2",
        type: "sms",
        timestamp: "Mar 19, 9:00 AM",
        agent: true,
        body: "Hi Diana! Great speaking with you. The RAV4 XLE is in stock and ready for a test drive. Are you free this week?",
        campaign: "Post-call Follow-up",
      },
      {
        id: "m3",
        type: "sms",
        timestamp: "Mar 19, 9:45 AM",
        agent: false,
        body: "Yes! I can do Friday morning.",
      },
      {
        id: "m4",
        type: "sms",
        timestamp: "Mar 19, 9:46 AM",
        agent: true,
        body: "Friday at 10:00 AM works perfectly! I've booked you in. You'll get a reminder the morning before.",
      },
      {
        id: "m5",
        type: "sms",
        timestamp: "Mar 20, 8:00 AM",
        agent: false,
        body: "Perfect, I'll be there at 10. Can't wait to see the RAV4 in person!",
      },
    ],
  },
]

/* ────────────────────────────────────────────────────────────
   THREAD COMPONENTS
   ──────────────────────────────────────────────────────────── */

/** Campaign label — shown when a new outreach sequence or event starts */
function CampaignLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px" style={{ background: "var(--spyne-border)" }} />
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border flex-shrink-0"
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--spyne-text-muted)",
          borderColor: "var(--spyne-border)",
          background: "var(--spyne-bg)",
        }}
      >
        <Sparkles size={9} />
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--spyne-border)" }} />
    </div>
  )
}

/** Signal chip — key insight surfaced from a message */
function SignalChip({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-1.5 mt-2 rounded-lg px-2.5 py-2"
      style={{
        background: "var(--spyne-brand-subtle)",
        border: "1px solid var(--spyne-brand-muted)",
      }}
    >
      <TrendingUp size={11} style={{ color: "var(--spyne-brand)", marginTop: "2px", flexShrink: 0 }} />
      <span style={{ fontSize: "11px", color: "var(--spyne-brand)", fontWeight: 500, lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  )
}

/** Call event — full-width card, never a bubble */
function CallEvent({ msg }: { msg: ThreadMessage }) {
  const noAnswer = msg.callOutcome === "no_answer" || msg.callOutcome === "voicemail"
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  return (
    <div className="my-3">
      {msg.campaign && <CampaignLabel label={msg.campaign} />}
      <div
        className="rounded-xl border p-3.5"
        style={{
          background: noAnswer ? "var(--secondary)" : "var(--spyne-surface)",
          borderColor: "var(--spyne-border)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
              style={{
                background: noAnswer ? "var(--secondary)" : "var(--spyne-brand-subtle)",
                color: noAnswer ? "var(--spyne-text-muted)" : "var(--spyne-brand)",
              }}
            >
              {noAnswer ? <PhoneOff size={13} /> : <PhoneCall size={13} />}
            </div>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--spyne-text-primary)" }}>
                {noAnswer ? "No answer" : "Call connected"}
              </span>
              {msg.duration && (
                <span className="spyne-caption ml-2">
                  <Clock size={9} style={{ display: "inline", marginRight: "3px" }} />
                  {msg.duration}
                </span>
              )}
            </div>
          </div>
          <span className="spyne-caption">{msg.timestamp}</span>
        </div>

        {/* Summary */}
        {!noAnswer && (
          <p style={{ fontSize: "13px", lineHeight: 1.55, color: "var(--spyne-text-secondary)" }}>
            {msg.body}
          </p>
        )}

        {/* Signal */}
        {msg.signal && <SignalChip text={msg.signal} />}

        {/* Transcript toggle */}
        {msg.transcript && (
          <div className="mt-2.5">
            <button
              onClick={() => setTranscriptOpen((o) => !o)}
              className="flex items-center gap-1"
              style={{ fontSize: "11px", color: "var(--spyne-brand)", fontWeight: 500 }}
            >
              <FileText size={11} />
              {transcriptOpen ? "Hide transcript" : "View transcript"}
              <ChevronDown
                size={11}
                style={{ transform: transcriptOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms" }}
              />
            </button>
            {transcriptOpen && (
              <div
                className="mt-2 rounded-lg p-3 space-y-1.5"
                style={{ background: "var(--secondary)" }}
              >
                {msg.transcript.map((line, i) => (
                  <p key={i} style={{ fontSize: "11px", lineHeight: 1.55, color: "var(--spyne-text-secondary)" }}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Appointment event — inline milestone card */
function AppointmentEvent({ msg }: { msg: ThreadMessage }) {
  return (
    <div className="my-3">
      <div
        className="rounded-xl border px-3.5 py-3"
        style={{
          background: "var(--spyne-warning-subtle)",
          borderColor: "var(--spyne-warning-muted)",
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Calendar size={13} style={{ color: "var(--spyne-warning)", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--spyne-warning-text)" }}>
            {msg.campaign ?? "Appointment"}
          </span>
          <span className="spyne-caption ml-auto">{msg.timestamp}</span>
        </div>
        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--spyne-warning-text)" }}>
          {msg.body}
        </p>
      </div>
    </div>
  )
}

/** SMS bubble — Vini right (agent), customer left */
function SmsBubble({ msg }: { msg: ThreadMessage }) {
  const isAgent = msg.agent
  return (
    <div className="my-1">
      {/* Campaign label only on first agent message of a new sequence */}
      {isAgent && msg.campaign && <CampaignLabel label={msg.campaign} />}

      <div className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
        <div style={{ maxWidth: "84%" }}>
          <div
            className="rounded-2xl px-3.5 py-2.5"
            style={{
              background: isAgent ? "var(--spyne-brand)" : "var(--secondary)",
              color: isAgent ? "white" : "var(--spyne-text-primary)",
              borderBottomRightRadius: isAgent ? "6px" : undefined,
              borderBottomLeftRadius: isAgent ? undefined : "6px",
            }}
          >
            <p style={{ fontSize: "14px", lineHeight: 1.5 }}>{msg.body}</p>
          </div>
          <p className={cn("mt-1", isAgent ? "mr-1 text-right" : "ml-1")} style={{ fontSize: "11px", color: "var(--spyne-text-muted)" }}>
            {isAgent ? `Vini · ${msg.timestamp}` : msg.timestamp}
          </p>
          {msg.signal && <SignalChip text={msg.signal} />}
        </div>
      </div>
    </div>
  )
}

/** Agent action event — branded inline card for appointments booked, action items logged */
function AgentActionEvent({ msg }: { msg: ThreadMessage }) {
  return (
    <div className="my-3">
      {msg.campaign && <CampaignLabel label={msg.campaign} />}
      <div
        className="rounded-xl border px-3.5 py-3"
        style={{ background: "var(--spyne-brand-subtle)", borderColor: "var(--spyne-brand-muted)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={12} style={{ color: "var(--spyne-brand)", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--spyne-brand)" }}>Agent action</span>
          <span className="spyne-caption ml-auto">{msg.timestamp}</span>
        </div>
        <p style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--spyne-text-primary)" }}>{msg.body}</p>
      </div>
    </div>
  )
}

function MessageItem({ msg }: { msg: ThreadMessage }) {
  if (msg.type === "call")         return <CallEvent msg={msg} />
  if (msg.type === "appointment")  return <AppointmentEvent msg={msg} />
  if (msg.type === "agent_action") return <AgentActionEvent msg={msg} />
  return <SmsBubble msg={msg} />
}

/* ────────────────────────────────────────────────────────────
   STAGE BADGE
   ──────────────────────────────────────────────────────────── */

function StageBadge({ stage }: { stage: string }) {
  const label = STAGE_LABELS[stage] ?? stage

  const style =
    stage === "CLOSING"
      ? { background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", border: "1px solid var(--spyne-brand-muted)" }
      : stage === "NEGOTIATION"
      ? { background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", border: "1px solid var(--spyne-brand-muted)", opacity: 0.75 }
      : stage === "EVALUATION"
      ? { background: "var(--spyne-warning-subtle)", color: "var(--spyne-warning-text)", border: "1px solid var(--spyne-warning-muted)" }
      : { background: "var(--secondary)", color: "var(--spyne-text-secondary)", border: "1px solid var(--spyne-border)" }

  return (
    <span className="spyne-badge" style={style}>
      {label}
    </span>
  )
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

const FILTER_CHIPS: { key: FilterMode; label: string }[] = [
  { key: "all",             label: "All" },
  { key: "qualified",       label: "Qualified" },
  { key: "appointment_set", label: "Appointment Set" },
  { key: "in_progress",     label: "In Progress" },
  { key: "unqualified",     label: "Unqualified" },
  { key: "attention",       label: "Needs Attention" },
  { key: "lot_match",       label: "Lot Match" },
]

export default function ConversationsPage() {
  const [dept,        setDept]        = useState<Department>("sales")
  const [search,      setSearch]      = useState("")
  const [filter,      setFilter]      = useState<FilterMode>("all")
  const [drawerConvo, setDrawerConvo] = useState<Conversation | null>(null)

  const drawerSignals = drawerConvo
    ? drawerConvo.thread.filter((m) => m.signal).map((m) => m.signal!)
    : []

  const filtered = MOCK_CONVERSATIONS.filter((c) => {
    if (c.department !== dept) return false
    if (filter === "attention") {
      if (!c.needsAttention) return false
    } else if (filter === "lot_match") {
      if (!c.vehicleAgeAlert) return false
    } else if (filter !== "all") {
      if (c.outcome !== filter) return false
    }
    if (search) {
      const q = search.toLowerCase()
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.vehicle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="min-h-full" style={{ background: "var(--spyne-bg)" }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 md:top-[49px] z-10 border-b px-4 md:px-6 pt-4 pb-0"
        style={{ background: "var(--spyne-surface)", borderColor: "var(--spyne-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="spyne-title">Conversations</h1>
          <span
            className="flex items-center justify-center rounded-full text-xs font-bold px-2 py-0.5"
            style={{ background: "var(--spyne-brand)", color: "var(--spyne-brand-on)" }}
          >
            {filtered.length}
          </span>
        </div>

        {/* Dept toggle + search row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            {(["sales", "service"] as Department[]).map((d) => (
              <button
                key={d}
                className={cn("spyne-pill", dept === d && "spyne-pill-active")}
                onClick={() => setDept(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--spyne-text-muted)" }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="spyne-input pl-9 w-full"
              style={{ height: "34px", fontSize: "13px" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--spyne-text-muted)" }}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {FILTER_CHIPS.map((chip, idx) => (
            <>
              {/* Divider before Needs Attention */}
              {idx === 5 && (
                <div
                  key="divider"
                  className="w-px h-4 flex-shrink-0"
                  style={{ background: "var(--spyne-border)" }}
                />
              )}
              <button
                key={chip.key}
                className={cn("spyne-pill flex-shrink-0", filter === chip.key && "spyne-pill-active")}
                style={{ height: "26px", fontSize: "11px", padding: "0 10px" }}
                onClick={() => setFilter(chip.key)}
              >
                {chip.label}
              </button>
            </>
          ))}
        </div>
      </div>

      {/* Mobile card list (hidden on md+) */}
      <div className="md:hidden flex flex-col divide-y" style={{ borderColor: "var(--spyne-border)" }}>
        {filtered.map((convo) => (
          <button
            key={convo.id}
            onClick={() => setDrawerConvo(convo)}
            className="w-full text-left px-4 py-4 flex items-start gap-3"
            style={{
              background: convo.needsAttention ? "var(--spyne-warning-subtle)" : "var(--spyne-surface)",
              borderLeft: convo.needsAttention ? "3px solid var(--spyne-warning)" : "3px solid transparent",
            }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold"
              style={{ background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", fontSize: "11px" }}
            >
              {convo.initials}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--spyne-text-primary)" }}>
                  {convo.customerName}
                </span>
                <span className="spyne-caption flex-shrink-0">{convo.lastActivity}</span>
              </div>
              <p className="spyne-caption truncate mb-1.5">
                {convo.vehicle}{convo.vehicleAgeAlert ? ` · ${convo.vehicleDaysOnLot}d on lot` : ""}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={OUTCOME_CONFIG[convo.outcome].badgeClass}>
                  {OUTCOME_CONFIG[convo.outcome].label}
                </span>
                {convo.buyingStage && <StageBadge stage={convo.buyingStage} />}
                {convo.needsAttention && (
                  <span style={{ fontSize: "11px", color: "var(--spyne-warning-text)", fontWeight: 600 }}>
                    Needs attention
                  </span>
                )}
              </div>
              {convo.lastSignal && (
                <p className="mt-1.5" style={{ fontSize: "12px", color: "var(--spyne-text-muted)", fontStyle: "italic" }}>
                  {convo.lastSignal.length > 70 ? convo.lastSignal.slice(0, 70) + "…" : convo.lastSignal}
                </p>
              )}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-2">
            <MessageSquare size={24} style={{ color: "var(--spyne-text-muted)" }} />
            <p className="spyne-body-sm">No conversations match.</p>
          </div>
        )}
      </div>

      {/* Desktop table (hidden on mobile) */}
      <div className="hidden md:block px-4 md:px-6 py-4">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--spyne-border)" }}>
              {["Customer", "Vehicle", "Stage", "Outcome", "Last Signal", "Activity", "Salesperson", "Flags"].map((col) => (
                <th
                  key={col}
                  className="text-left spyne-subheading py-2.5 px-3"
                  style={{ fontWeight: 600 }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare size={24} style={{ color: "var(--spyne-text-muted)" }} />
                    <p className="spyne-body-sm">No conversations match.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((convo) => (
                <tr
                  key={convo.id}
                  onClick={() => setDrawerConvo(convo)}
                  className="cursor-pointer transition-colors hover:bg-[var(--spyne-surface-hover)]"
                  style={{
                    borderBottom: "1px solid var(--spyne-border)",
                    background: convo.needsAttention ? "var(--spyne-warning-subtle)" : "transparent",
                  }}
                >
                  {/* Customer */}
                  <td className="py-3 px-3 align-top">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 font-bold"
                        style={{ background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", fontSize: "10px" }}
                      >
                        {convo.initials}
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--spyne-text-primary)" }}>
                        {convo.customerName}
                      </span>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="py-3 px-3 align-top">
                    <span style={{ fontSize: "13px", color: "var(--spyne-text-secondary)" }}>
                      {convo.vehicle}
                    </span>
                    {convo.vehicleAgeAlert && convo.vehicleDaysOnLot && (
                      <div className="mt-0.5">
                        <span
                          className="spyne-badge"
                          style={{
                            background: "rgba(245, 158, 11, 0.1)",
                            color: "#b45309",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            fontSize: "10px",
                          }}
                        >
                          {convo.vehicleDaysOnLot}d on lot
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Stage */}
                  <td className="py-3 px-3 align-top">
                    {convo.buyingStage ? (
                      <StageBadge stage={convo.buyingStage} />
                    ) : (
                      <span className="spyne-caption">—</span>
                    )}
                  </td>

                  {/* Outcome */}
                  <td className="py-3 px-3 align-top">
                    <span className={OUTCOME_CONFIG[convo.outcome].badgeClass}>
                      {OUTCOME_CONFIG[convo.outcome].label}
                    </span>
                  </td>

                  {/* Last Signal */}
                  <td className="py-3 px-3 align-top" style={{ maxWidth: "220px" }}>
                    {convo.lastSignal ? (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--spyne-text-muted)",
                          fontStyle: "italic",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {convo.lastSignal.length > 60 ? convo.lastSignal.slice(0, 60) + "…" : convo.lastSignal}
                      </span>
                    ) : (
                      <span className="spyne-caption">—</span>
                    )}
                  </td>

                  {/* Activity */}
                  <td className="py-3 px-3 align-top">
                    <span style={{ fontSize: "12px", color: "var(--spyne-text-muted)" }}>
                      {convo.lastActivity}
                    </span>
                  </td>

                  {/* Salesperson */}
                  <td className="py-3 px-3 align-top">
                    <span style={{ fontSize: "12px", color: "var(--spyne-text-secondary)" }}>
                      {convo.salesperson}
                    </span>
                  </td>

                  {/* Flags */}
                  <td className="py-3 px-3 align-top">
                    <div className="flex items-center gap-1.5">
                      {convo.needsAttention && (
                        <span style={{ fontSize: "16px", color: "#f59e0b" }} title="Needs attention">●</span>
                      )}
                      {convo.vehicleAgeAlert && (
                        <span
                          className="spyne-badge"
                          style={{
                            background: "rgba(249, 115, 22, 0.1)",
                            color: "#c2410c",
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                            fontSize: "10px",
                          }}
                        >
                          Aged
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over drawer */}
      <Sheet open={drawerConvo !== null} onOpenChange={(open) => { if (!open) setDrawerConvo(null) }}>
        <SheetContent side="right" className="w-full md:w-[640px] max-w-[100vw] p-0 flex flex-col">
          {drawerConvo && (
            <>
              <SheetHeader
                className="px-5 py-4 border-b flex-row items-center justify-between"
                style={{ borderColor: "var(--spyne-border)" }}
              >
                <div>
                  <SheetTitle style={{ fontSize: "15px", color: "var(--spyne-text-primary)" }}>
                    {drawerConvo.customerName}
                  </SheetTitle>
                  <p className="spyne-caption">{drawerConvo.vehicle} · {drawerConvo.salesperson}</p>
                </div>
                <Link
                  href={`/max-2/sales/${drawerConvo.leadId}`}
                  className="spyne-btn-secondary flex items-center gap-1"
                  style={{ height: "32px", minHeight: "32px", fontSize: "12px" }}
                >
                  View Card <ArrowUpRight size={12} />
                </Link>
              </SheetHeader>

              {/* Key signals panel */}
              {drawerSignals.length > 0 && (
                <div
                  className="px-5 py-3 border-b flex-shrink-0"
                  style={{
                    background: "var(--spyne-brand-subtle)",
                    borderColor: "var(--spyne-brand-muted)",
                  }}
                >
                  <p
                    className="spyne-subheading mb-2"
                    style={{ color: "var(--spyne-brand)", fontSize: "11px", letterSpacing: "0.05em" }}
                  >
                    KEY SIGNALS
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {drawerSignals.map((sig, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <TrendingUp
                          size={11}
                          style={{ color: "var(--spyne-brand)", marginTop: "3px", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "12px", color: "var(--spyne-text-primary)", lineHeight: 1.4 }}>
                          {sig}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {drawerConvo.thread.map((msg) => (
                  <MessageItem key={msg.id} msg={msg} />
                ))}
                <div className="h-6" />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
