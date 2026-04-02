"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Phone,
  MessageSquare,
  Calendar,
  ArrowRight,
  Eye,
  Star,
  Zap,
  Package,
  CircleDot,
  ChevronRight,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

type BuyingStage = "RESEARCH" | "SHOPPING" | "EVALUATION" | "NEGOTIATION" | "CLOSING"
type StockStatus = "in_stock" | "sold" | "unavailable"
type CardType    = "standard" | "urgent" | "appointment" | "lot_match" | "high_value"
type ActionType  = "call_now" | "pick_up" | "view_prep" | "reach_out" | "view_context"
type VehicleCat  = "new" | "used"
type FilterTab   = "all" | "new" | "used"

interface Vehicle {
  year: number
  make: string
  model: string
  trim?: string
  category: VehicleCat
  stockStatus: StockStatus
  daysOnLot?: number
  price?: number
}

interface QueueCard {
  id: string
  type: CardType
  name: string
  initials: string
  buyingStage: BuyingStage
  reason: string
  vehicle: Vehicle
  action: ActionType
  appointmentTime?: string
  urgentBadge?: string
  lotMatchDays?: number
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
   MOCK DATA
   Replace with real API call — shape matches the types above.
   ──────────────────────────────────────────────────────────── */

const MOCK_QUEUE: QueueCard[] = [
  {
    id: "lead-001",
    type: "standard",
    name: "Sarah Delgado",
    initials: "SD",
    buyingStage: "CLOSING",
    reason: "Confirmed $450/mo budget and wants to talk financing. Agent hit ceiling — she's ready to close.",
    vehicle: { year: 2024, make: "Toyota", model: "Camry", trim: "XSE", category: "new", stockStatus: "in_stock", price: 31200 },
    action: "call_now",
  },
  {
    id: "lead-002",
    type: "urgent",
    name: "Marcus Webb",
    initials: "MW",
    buyingStage: "EVALUATION",
    reason: "Went cold 3 weeks ago. Responded to agent follow-up 2 hours ago — window is open.",
    vehicle: { year: 2023, make: "Honda", model: "CR-V", trim: "EX-L", category: "new", stockStatus: "in_stock", price: 36500 },
    action: "pick_up",
    urgentBadge: "Re-engaged",
  },
  {
    id: "lead-003",
    type: "appointment",
    name: "Diana Torres",
    initials: "DT",
    buyingStage: "EVALUATION",
    reason: "Appointment tomorrow at 2:00 PM. Has been comparing the RAV4 and CR-V — came in once before.",
    vehicle: { year: 2024, make: "Toyota", model: "RAV4", trim: "XLE", category: "new", stockStatus: "in_stock", price: 33800 },
    action: "view_prep",
    appointmentTime: "Tomorrow, 2:00 PM",
  },
  {
    id: "lead-004",
    type: "lot_match",
    name: "James Whitfield",
    initials: "JW",
    buyingStage: "SHOPPING",
    reason: "3-row SUV preferences and $650/mo budget align with a Tahoe that's been on your lot 47 days.",
    vehicle: { year: 2022, make: "Chevrolet", model: "Tahoe", trim: "LT", category: "used", stockStatus: "in_stock", daysOnLot: 47, price: 52900 },
    action: "reach_out",
    lotMatchDays: 47,
  },
  {
    id: "lead-005",
    type: "standard",
    name: "Kevin Park",
    initials: "KP",
    buyingStage: "NEGOTIATION",
    reason: "Asked to speak to someone directly. Wants to discuss trade-in — 2019 Accord, estimated equity.",
    vehicle: { year: 2023, make: "Honda", model: "Accord", trim: "Sport", category: "new", stockStatus: "in_stock", price: 30400 },
    action: "call_now",
  },
  {
    id: "lead-006",
    type: "high_value",
    name: "Fleet Auto Group",
    initials: "FA",
    buyingStage: "NEGOTIATION",
    reason: "Fleet inquiry — 12 commercial vehicles, mixed use. High-value flag. Wants a dedicated contact.",
    vehicle: { year: 2024, make: "Ford", model: "Transit", trim: "150 Cargo", category: "new", stockStatus: "in_stock", price: 46000 },
    action: "view_context",
  },
]

/* ────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────────────────────── */

function StageBadge({ stage }: { stage: BuyingStage }) {
  const label = STAGE_LABELS[stage]

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

function StockDot({ status }: { status: StockStatus }) {
  const color =
    status === "in_stock"   ? "var(--spyne-success)" :
    status === "sold"       ? "var(--spyne-danger)"  :
                              "var(--spyne-text-muted)"
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: color, marginTop: "2px" }}
    />
  )
}

function ActionButton({ action, id }: { action: ActionType; id: string }) {
  const router = useRouter()

  const configs: Record<ActionType, { label: string; icon: React.ReactNode; style: "primary" | "secondary" | "ghost" }> = {
    call_now:     { label: "Call Now",            icon: <Phone size={13} />,        style: "primary" },
    pick_up:      { label: "Pick Up Conversation",icon: <MessageSquare size={13} />, style: "secondary" },
    view_prep:    { label: "View Prep",           icon: <Calendar size={13} />,      style: "secondary" },
    reach_out:    { label: "Reach Out",           icon: <ArrowRight size={13} />,    style: "secondary" },
    view_context: { label: "View Context",        icon: <Eye size={13} />,           style: "ghost" },
  }

  const { label, icon, style } = configs[action]

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/max-2/sales/${id}`)
      }}
      className={cn(
        style === "primary"   ? "spyne-btn-primary"   : "",
        style === "secondary" ? "spyne-btn-secondary" : "",
        style === "ghost"     ? "spyne-btn-ghost"     : "",
        "text-sm"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function QueueCardItem({ card }: { card: QueueCard }) {
  const isUrgent   = card.type === "urgent"
  const isLotMatch = card.type === "lot_match"
  const isAppt     = card.type === "appointment"
  const isHighVal  = card.type === "high_value"

  return (
    <Link
      href={`/max-2/sales/${card.id}`}
      className="block h-full"
      style={{ textDecoration: "none" }}
    >
      <div
        className="spyne-card-interactive relative overflow-hidden h-full"
        style={{
          // Urgent: amber left border accent
          borderLeft: isUrgent
            ? "3px solid var(--spyne-warning)"
            : isLotMatch
            ? "3px solid var(--spyne-info)"
            : isHighVal
            ? "3px solid var(--spyne-brand)"
            : "1px solid var(--spyne-border)",
          // Adjust left padding to compensate for thicker border
          paddingLeft: isUrgent || isLotMatch || isHighVal ? "calc(16px - 2px)" : undefined,
        }}
      >
        <div className="p-3 flex flex-col h-full">

          {/* ── Row 1: name | type badge ─────────────────────── */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar */}
              <div
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-xs"
                style={{
                  background: "var(--spyne-brand-subtle)",
                  color: "var(--spyne-brand)",
                  fontWeight: 700,
                }}
              >
                {card.initials}
              </div>
              <span
                className="font-semibold truncate"
                style={{ fontSize: "14px", color: "var(--spyne-text-primary)" }}
              >
                {card.name}
              </span>
            </div>

            {/* Urgency / type badges */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              {isUrgent && (
                <span className="spyne-badge spyne-badge-warning flex items-center gap-1">
                  <Zap size={10} />
                  {card.urgentBadge}
                </span>
              )}
              {isLotMatch && (
                <span className="spyne-badge spyne-badge-info flex items-center gap-1">
                  <Package size={10} />
                  Lot Match
                </span>
              )}
              {isHighVal && (
                <span className="spyne-badge spyne-badge-brand flex items-center gap-1">
                  <Star size={10} />
                  High Value
                </span>
              )}
              {isAppt && (
                <span className="spyne-badge spyne-badge-neutral flex items-center gap-1">
                  <Clock size={10} />
                  Appointment
                </span>
              )}
            </div>
          </div>

          {/* ── Row 1b: stage badge (own row = consistent alignment) */}
          <div className="mb-2 ml-[calc(32px+10px)]">
            <StageBadge stage={card.buyingStage} />
          </div>

          {/* ── Row 2: vehicle ───────────────────────────────── */}
          <div
            className="flex items-center gap-1.5 mb-1.5"
            style={{ fontSize: "12px", color: "var(--spyne-text-secondary)" }}
          >
            <StockDot status={card.vehicle.stockStatus} />
            <span className="font-medium" style={{ color: "var(--spyne-text-primary)" }}>
              {card.vehicle.year} {card.vehicle.make} {card.vehicle.model}
              {card.vehicle.trim ? ` ${card.vehicle.trim}` : ""}
            </span>
            <span style={{ color: "var(--spyne-border-strong)" }}>·</span>
            <span style={{ textTransform: "capitalize" }}>{card.vehicle.category}</span>
            {card.vehicle.price && (
              <>
                <span style={{ color: "var(--spyne-border-strong)" }}>·</span>
                <span className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                  ${card.vehicle.price.toLocaleString()}
                </span>
              </>
            )}
            {isLotMatch && card.vehicle.daysOnLot && (
              <>
                <span style={{ color: "var(--spyne-border-strong)" }}>·</span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--spyne-warning-text)" }}
                >
                  {card.vehicle.daysOnLot} days on lot
                </span>
              </>
            )}
          </div>

          {/* ── Row 3: appointment time (if applicable) ──────── */}
          {isAppt && card.appointmentTime && (
            <div
              className="flex items-center gap-1.5 mb-1.5"
              style={{ fontSize: "12px" }}
            >
              <Calendar size={11} style={{ color: "var(--spyne-warning)" }} />
              <span className="font-medium" style={{ color: "var(--spyne-warning-text)" }}>
                {card.appointmentTime}
              </span>
            </div>
          )}

          {/* ── Row 4: reason / context ───────────────────────── */}
          <p
            className="leading-snug"
            style={{
              fontSize: "13px",
              color: "var(--spyne-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {card.reason}
          </p>

          {/* ── Row 5: action button ──────────────────────────── */}
          <div
            className="mt-auto pt-3 flex items-center justify-end border-t"
            style={{ borderColor: "var(--spyne-border)" }}
            onClick={(e) => e.preventDefault()} // prevent card nav when clicking button
          >
            <ActionButton action={card.action} id={card.id} />
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyQueue() {
  return (
    <div className="spyne-empty">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
        style={{ background: "var(--spyne-brand-subtle)" }}
      >
        <CircleDot size={28} style={{ color: "var(--spyne-brand)" }} />
      </div>
      <p className="spyne-heading" style={{ color: "var(--spyne-text-primary)" }}>
        Queue is clear
      </p>
      <p className="spyne-body-sm" style={{ maxWidth: "260px" }}>
        Vini is working the leads. When one is ready for a human touch, it'll show up here.
      </p>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

export default function QueuePage() {
  const [filter, setFilter] = useState<FilterTab>("all")

  const filteredQueue = MOCK_QUEUE.filter((card) => {
    if (filter === "all") return true
    return card.vehicle.category === filter
  })

  const urgentCount = MOCK_QUEUE.filter(
    (c) => c.type === "urgent" || c.type === "lot_match"
  ).length

  return (
    <div
      className="min-h-full"
      style={{ background: "var(--spyne-bg)" }}
    >
      {/* ── Page header ──────────────────────────────────────── */}
      <div
        className="px-4 md:px-6 pt-5 pb-3 sticky top-0 md:top-[49px] z-10"
        style={{
          background: "var(--spyne-bg)",
          borderBottom: "1px solid var(--spyne-border)",
        }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h1 className="spyne-title">Action Items</h1>
            {urgentCount > 0 && (
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                style={{
                  background: "var(--spyne-brand)",
                  color: "var(--spyne-brand-on)",
                }}
              >
                {urgentCount}
              </span>
            )}
          </div>
          <span className="spyne-caption">
            {filteredQueue.length} lead{filteredQueue.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {(["all", "new", "used"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              className={cn("spyne-pill", filter === tab && "spyne-pill-active")}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Queue list ───────────────────────────────────────── */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        {filteredQueue.length === 0 ? (
          <EmptyQueue />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 spyne-stagger">
            {filteredQueue.map((card) => (
              <div key={card.id} className="spyne-animate-fade-in h-full">
                <QueueCardItem card={card} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Role switcher (Sales Manager view) ───────────────── */}
      <div
        className="fixed bottom-[72px] md:bottom-6 right-4 md:right-6"
        style={{ zIndex: 50 }}
      >
        <button
          className="spyne-btn-ghost rounded-full shadow-sm border"
          style={{
            height: "36px",
            fontSize: "12px",
            border: "1px solid var(--spyne-border)",
            background: "var(--spyne-surface)",
          }}
        >
          My leads
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
