"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  CircleCheck,
  AlertCircle,
  CircleX,
  ChevronRight,
  User,
  Car,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

type BuyingStage     = "RESEARCH" | "SHOPPING" | "EVALUATION" | "NEGOTIATION" | "CLOSING"
type ConfirmStatus   = "confirmed" | "unconfirmed" | "no_response"
type DayFilter       = "today" | "tomorrow" | "week"

interface Appointment {
  id: string
  leadId: string
  customerName: string
  initials: string
  time: string
  date: string
  dateGroup: DayFilter
  buyingStage: BuyingStage
  vehicle: string
  salesperson: string
  confirmStatus: ConfirmStatus
  reminderSent: boolean
  notes?: string
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

const CONFIRM_CONFIG: Record<ConfirmStatus, {
  label: string
  icon: React.ReactNode
  badgeClass: string
  style: React.CSSProperties
}> = {
  confirmed: {
    label: "Confirmed",
    icon: <CircleCheck size={11} />,
    badgeClass: "spyne-badge spyne-badge-success",
    style: {},
  },
  unconfirmed: {
    label: "Unconfirmed",
    icon: <AlertCircle size={11} />,
    badgeClass: "spyne-badge spyne-badge-warning",
    style: {},
  },
  no_response: {
    label: "No Response",
    icon: <CircleX size={11} />,
    badgeClass: "spyne-badge spyne-badge-danger",
    style: {},
  },
}

/* ────────────────────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────────────────────── */

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-001",
    leadId: "lead-003",
    customerName: "Diana Torres",
    initials: "DT",
    time: "10:00 AM",
    date: "Today",
    dateGroup: "today",
    buyingStage: "EVALUATION",
    vehicle: "2024 Toyota RAV4 XLE",
    salesperson: "Jordan M.",
    confirmStatus: "confirmed",
    reminderSent: true,
    notes: "Test drive scheduled. Lead previously visited — knows the RAV4 well.",
  },
  {
    id: "apt-002",
    leadId: "lead-007",
    customerName: "Robert Chen",
    initials: "RC",
    time: "1:30 PM",
    date: "Today",
    dateGroup: "today",
    buyingStage: "NEGOTIATION",
    vehicle: "2024 Ford F-150 XLT",
    salesperson: "Mike D.",
    confirmStatus: "unconfirmed",
    reminderSent: true,
  },
  {
    id: "apt-003",
    leadId: "lead-008",
    customerName: "Patricia Walsh",
    initials: "PW",
    time: "3:00 PM",
    date: "Today",
    dateGroup: "today",
    buyingStage: "EVALUATION",
    vehicle: "2023 Honda Pilot TrailSport",
    salesperson: "Jordan M.",
    confirmStatus: "no_response",
    reminderSent: true,
    notes: "Reminder sent 24h ago. No reply. Show rate risk.",
  },
  {
    id: "apt-004",
    leadId: "lead-001",
    customerName: "Sarah Delgado",
    initials: "SD",
    time: "2:00 PM",
    date: "Tomorrow",
    dateGroup: "tomorrow",
    buyingStage: "CLOSING",
    vehicle: "2024 Toyota Camry XSE",
    salesperson: "Mike D.",
    confirmStatus: "confirmed",
    reminderSent: true,
  },
  {
    id: "apt-005",
    leadId: "lead-009",
    customerName: "Marcus Webb",
    initials: "MW",
    time: "11:00 AM",
    date: "Tomorrow",
    dateGroup: "tomorrow",
    buyingStage: "EVALUATION",
    vehicle: "2023 Honda CR-V EX-L",
    salesperson: "Jordan M.",
    confirmStatus: "unconfirmed",
    reminderSent: false,
  },
  {
    id: "apt-006",
    leadId: "lead-010",
    customerName: "Elena Fontaine",
    initials: "EF",
    time: "4:30 PM",
    date: "Thu Mar 24",
    dateGroup: "week",
    buyingStage: "SHOPPING",
    vehicle: "2024 Kia Telluride SX",
    salesperson: "Mike D.",
    confirmStatus: "confirmed",
    reminderSent: false,
  },
]

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
    <span className="spyne-badge" style={style}>{label}</span>
  )
}

function AppointmentCard({ apt }: { apt: Appointment }) {
  const confirm      = CONFIRM_CONFIG[apt.confirmStatus]
  const isNoResponse = apt.confirmStatus === "no_response"

  return (
    <Link href={`/max-2/sales/${apt.leadId}`} className="block h-full" style={{ textDecoration: "none" }}>
      <div
        className="spyne-card-interactive p-4 h-full flex flex-col"
        style={{
          borderLeft: isNoResponse
            ? "3px solid var(--spyne-danger)"
            : "1px solid var(--spyne-border)",
        }}
      >
        {/* Row 1: time + name + confirmation badge */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Time */}
            <div
              className="flex-shrink-0 text-center"
              style={{ minWidth: "52px" }}
            >
              <p
                className="font-bold"
                style={{ fontSize: "14px", color: "var(--spyne-text-primary)", lineHeight: 1.1 }}
              >
                {apt.time.split(" ")[0]}
              </p>
              <p className="spyne-caption">{apt.time.split(" ")[1]}</p>
            </div>

            {/* Divider */}
            <div
              className="w-px h-8 flex-shrink-0"
              style={{ background: "var(--spyne-border)" }}
            />

            {/* Name + stage */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: "var(--spyne-brand-subtle)", color: "var(--spyne-brand)", fontSize: "10px" }}
                >
                  {apt.initials}
                </div>
                <span
                  className="font-semibold truncate"
                  style={{ fontSize: "14px", color: "var(--spyne-text-primary)" }}
                >
                  {apt.customerName}
                </span>
              </div>
              <StageBadge stage={apt.buyingStage} />
            </div>
          </div>

          {/* Confirmation badge */}
          <div className="flex-shrink-0">
            <span className={`${confirm.badgeClass} flex items-center gap-1`}>
              {confirm.icon}
              {confirm.label}
            </span>
          </div>
        </div>

        {/* Row 2: vehicle */}
        <div
          className="flex items-center gap-1.5 mb-1.5"
          style={{ fontSize: "12px", color: "var(--spyne-text-secondary)" }}
        >
          <Car size={11} style={{ flexShrink: 0 }} />
          <span>{apt.vehicle}</span>
        </div>

        {/* Row 3: salesperson + reminder status */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1.5"
            style={{ fontSize: "12px", color: "var(--spyne-text-muted)" }}
          >
            <User size={11} />
            <span>{apt.salesperson}</span>
          </div>
          {apt.reminderSent && (
            <div
              className="flex items-center gap-1"
              style={{ fontSize: "11px", color: "var(--spyne-text-muted)" }}
            >
              <Bell size={10} />
              <span>Reminder sent</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {apt.notes && (
          <p
            className="mt-2.5 pt-2.5 border-t"
            style={{
              fontSize: "12px",
              lineHeight: 1.5,
              color: isNoResponse ? "var(--spyne-danger-text)" : "var(--spyne-text-secondary)",
              borderColor: "var(--spyne-border)",
              fontWeight: isNoResponse ? 500 : 400,
            }}
          >
            {apt.notes}
          </p>
        )}
      </div>
    </Link>
  )
}

function DaySection({
  label,
  appointments,
}: {
  label: string
  appointments: Appointment[]
}) {
  if (appointments.length === 0) return null

  const noResponseCount = appointments.filter((a) => a.confirmStatus === "no_response").length
  const confirmedCount  = appointments.filter((a) => a.confirmStatus === "confirmed").length

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="spyne-subheading">{label}</p>
          <span
            className="spyne-badge spyne-badge-neutral"
            style={{ fontSize: "10px" }}
          >
            {appointments.length}
          </span>
        </div>
        <div
          className="flex items-center gap-3"
          style={{ fontSize: "11px", color: "var(--spyne-text-muted)" }}
        >
          <span style={{ color: "var(--spyne-success-text)" }}>
            {confirmedCount} confirmed
          </span>
          {noResponseCount > 0 && (
            <span style={{ color: "var(--spyne-danger-text)", fontWeight: 600 }}>
              {noResponseCount} at risk
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {appointments.map((apt) => (
          <AppointmentCard key={apt.id} apt={apt} />
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

export default function AppointmentsPage() {
  const [dayFilter, setDayFilter] = useState<DayFilter>("today")

  const today    = MOCK_APPOINTMENTS.filter((a) => a.dateGroup === "today")
  const tomorrow = MOCK_APPOINTMENTS.filter((a) => a.dateGroup === "tomorrow")
  const thisWeek = MOCK_APPOINTMENTS.filter((a) => a.dateGroup === "week")

  const visibleToday    = dayFilter === "today" || dayFilter === "week"
  const visibleTomorrow = dayFilter === "tomorrow" || dayFilter === "week"
  const visibleWeek     = dayFilter === "week"

  const totalCount = MOCK_APPOINTMENTS.length
  const atRiskCount = MOCK_APPOINTMENTS.filter(
    (a) => a.confirmStatus === "no_response"
  ).length

  return (
    <div className="min-h-full" style={{ background: "var(--spyne-bg)" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div
        className="px-4 md:px-6 pt-5 pb-3 sticky top-0 md:top-[49px] z-10 border-b"
        style={{
          background: "var(--spyne-bg)",
          borderColor: "var(--spyne-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <h1 className="spyne-title">Appointments</h1>
            {atRiskCount > 0 && (
              <span className="spyne-badge spyne-badge-danger flex items-center gap-1">
                <AlertCircle size={10} />
                {atRiskCount} at risk
              </span>
            )}
          </div>
          <span className="spyne-caption">
            {totalCount} this week
          </span>
        </div>

        {/* Day filter */}
        <div className="flex items-center gap-2">
          {(["today", "tomorrow", "week"] as DayFilter[]).map((d) => (
            <button
              key={d}
              className={cn("spyne-pill", dayFilter === d && "spyne-pill-active")}
              onClick={() => setDayFilter(d)}
            >
              {d === "today" ? "Today" : d === "tomorrow" ? "Tomorrow" : "This Week"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Appointment list ─────────────────────────────────── */}
      <div className="px-4 md:px-6 py-4 md:py-6">
        {visibleToday    && <DaySection label="Today"    appointments={today} />}
        {visibleTomorrow && <DaySection label="Tomorrow" appointments={tomorrow} />}
        {visibleWeek     && <DaySection label="This Week" appointments={thisWeek} />}

        {/* Empty */}
        {MOCK_APPOINTMENTS.length === 0 && (
          <div className="spyne-empty">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
              style={{ background: "var(--spyne-brand-subtle)" }}
            >
              <Calendar size={28} style={{ color: "var(--spyne-brand)" }} />
            </div>
            <p className="spyne-heading">No appointments</p>
            <p className="spyne-body-sm" style={{ maxWidth: "260px" }}>
              Vini will book them directly to your calendar as leads get qualified.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
