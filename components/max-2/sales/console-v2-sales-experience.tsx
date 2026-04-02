"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import "@/styles/console-v2-sales.css"
import SecondaryNav from "@/components/max-2/sales/console-v2/components/SecondaryNav"
import AgentCard from "@/components/max-2/sales/console-v2/components/AgentCard"
import UpcomingAppointments from "@/components/max-2/sales/console-v2/components/UpcomingAppointments"
import PriorityFollowUps from "@/components/max-2/sales/console-v2/components/PriorityFollowUps"
import MetricsBar from "@/components/max-2/sales/console-v2/components/MetricsBar"
import SpeedToLeadPanel from "@/components/max-2/sales/console-v2/components/SpeedToLeadPanel"
import ReEngagementPanel from "@/components/max-2/sales/console-v2/components/ReEngagementPanel"
import ActivityChart from "@/components/max-2/sales/console-v2/components/ActivityChart"
import ActionItemsPage from "@/components/max-2/sales/console-v2/components/ActionItemsPage"
import AppointmentsPage from "@/components/max-2/sales/console-v2/components/AppointmentsPage"
import CustomerListingPage from "@/components/max-2/sales/console-v2/components/CustomerListingPage"
import CustomerProfilePage from "@/components/max-2/sales/console-v2/components/CustomerProfilePage"
import CampaignsPage from "@/components/max-2/sales/console-v2/components/CampaignsPage"
import LeadsBySourceCard from "@/components/max-2/sales/console-v2/components/LeadsBySourceCard"
import OutboundCampaignsCard from "@/components/max-2/sales/console-v2/components/OutboundCampaignsCard"
import CallbacksFollowups from "@/components/max-2/sales/console-v2/components/CallbacksFollowups"
import {
  salesAgentData,
  salesOutboundAgentData,
  appointmentsData,
  priorityFollowUpsData,
  dateRangeOptions,
  getOverviewData,
  getOutboundOverviewData,
  leadsBySourceData,
  outboundCampaignsData,
  callbacksData,
  campaignsData,
  outboundAgentData,
  lotInventoryData,
} from "@/components/max-2/sales/console-v2/mockData"
import { useMax2Ui } from "@/components/max-2/max-2-ui-context"

export function ConsoleV2SalesExperience() {
  const { sidebarCollapsed } = useMax2Ui()
  const [activePage, setActivePage] = useState<string>("overview")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  return (
    <div
      className="console-v2-sales-root relative min-h-[calc(100dvh-4rem)] -mx-6 -my-6"
      style={{ background: "var(--spyne-bg)" }}
    >
      <SecondaryNav activePage={activePage} embedded onPageChange={setActivePage} />

      <main className="transition-all duration-200">
        <div className="px-6 py-5">
          {activePage === "overview" && <OverviewPage />}
          {activePage === "campaigns" && (
            <CampaignsPage
              data={campaignsData}
              outboundData={outboundAgentData}
              agent={salesAgentData}
              prefillVehicles={null}
              onClearPrefill={() => {}}
              lotData={lotInventoryData}
            />
          )}
          {activePage === "action-items" && <ActionItemsPage sidebarCollapsed={sidebarCollapsed} />}
          {activePage === "appointments" && <AppointmentsPage />}
          {activePage === "customers" && (
            <CustomerListingPage
              onViewProfile={(id: string) => {
                setSelectedCustomerId(id)
                setActivePage("customer-profile")
              }}
            />
          )}
          {activePage === "customer-profile" && (
            <CustomerProfilePage
              customerId={selectedCustomerId}
              onBack={() => setActivePage("customers")}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function AppointmentsPageContent() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="spyne-title" style={{ color: "var(--spyne-text-primary)" }}>
          Appointments
        </h1>
        <p className="spyne-body-sm mt-0.5" style={{ color: "var(--spyne-text-muted)" }}>
          Upcoming visits and callback queue
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <UpcomingAppointments appointments={appointmentsData} />
        <CallbacksFollowups data={callbacksData} />
      </div>
    </div>
  )
}

function DateRangeFilter({
  value,
  onChange,
  customLabel,
}: {
  value: string
  onChange: (range: string, start: string, end: string) => void
  customLabel: string
}) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [tempStart, setTempStart] = useState("")
  const [tempEnd, setTempEnd] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPopoverOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v === "Custom range") {
      setTempStart("")
      setTempEnd("")
      setPopoverOpen(true)
    } else {
      setPopoverOpen(false)
    }
    onChange(v, "", "")
  }

  function handleApply() {
    if (tempStart && tempEnd) {
      onChange("Custom range", tempStart, tempEnd)
      setPopoverOpen(false)
    }
  }

  function handleCancel() {
    setPopoverOpen(false)
    if (value === "Custom range" && !customLabel) onChange("Last 30 days", "", "")
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="relative">
        <select
          value={value}
          onChange={handleSelectChange}
          className="spyne-input appearance-none pl-3 pr-7 cursor-pointer"
          style={{ fontSize: 12 }}
          aria-label="Date range"
        >
          {dateRangeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "Custom range" && customLabel ? customLabel : opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--spyne-text-muted)" }}
        />
      </div>

      {popoverOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 100,
            background: "var(--spyne-surface)",
            border: "1px solid var(--spyne-border)",
            borderRadius: "var(--spyne-radius-lg)",
            padding: 16,
            boxShadow: "var(--spyne-shadow-lg)",
            width: 256,
          }}
        >
          <p className="spyne-label mb-3" style={{ color: "var(--spyne-text-primary)", fontWeight: 600 }}>
            Custom date range
          </p>
          <div className="flex flex-col gap-2 mb-4">
            <div>
              <label className="spyne-caption block mb-1" style={{ color: "var(--spyne-text-muted)" }}>
                From
              </label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="spyne-input w-full cursor-pointer"
                style={{ fontSize: 12 }}
              />
            </div>
            <div>
              <label className="spyne-caption block mb-1" style={{ color: "var(--spyne-text-muted)" }}>
                To
              </label>
              <input
                type="date"
                value={tempEnd}
                min={tempStart || undefined}
                onChange={(e) => setTempEnd(e.target.value)}
                className="spyne-input w-full cursor-pointer"
                style={{ fontSize: 12 }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="spyne-btn-ghost flex-1 justify-center"
              style={{ height: 32, fontSize: 12 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="spyne-btn-primary flex-1 justify-center"
              style={{
                height: 32,
                fontSize: 12,
                opacity: tempStart && tempEnd ? 1 : 0.4,
                pointerEvents: tempStart && tempEnd ? "auto" : "none",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AgentToggle({
  activeAgent,
  onSwitch,
}: {
  activeAgent: string
  onSwitch: (id: string) => void
}) {
  const agents = [
    { id: "inbound", data: salesAgentData },
    { id: "outbound", data: salesOutboundAgentData },
  ]

  return (
    <div
      className="flex"
      style={{
        border: "1px solid var(--spyne-border)",
        borderRadius: "var(--spyne-radius-md)",
        overflow: "hidden",
        background: "var(--spyne-surface)",
      }}
    >
      {agents.map(({ id, data }, i) => {
        const active = activeAgent === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSwitch(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 12px",
              height: 32,
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              fontFamily: "inherit",
              border: "none",
              cursor: "pointer",
              background: active ? "var(--spyne-brand-subtle)" : "transparent",
              color: active ? "var(--spyne-brand)" : "var(--spyne-text-muted)",
              borderRight: i === 0 ? "1px solid var(--spyne-border)" : "none",
              transition: "all 150ms",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: data.status === "online" ? "var(--spyne-success)" : "var(--spyne-text-muted)",
                flexShrink: 0,
              }}
            />
            {data.name} · {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        )
      })}
    </div>
  )
}

function OverviewPage() {
  const [activeAgent, setActiveAgent] = useState("inbound")
  const [dateRange, setDateRange] = useState("Last 30 days")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const isOutbound = activeAgent === "outbound"
  const agentData = isOutbound ? salesOutboundAgentData : salesAgentData
  const inboundOverview = getOverviewData(dateRange)
  const outboundOverview = getOutboundOverviewData(dateRange)
  const metricsBar = isOutbound ? outboundOverview.metricsBar : inboundOverview.metricsBar
  const activityChart = isOutbound ? outboundOverview.activityChart : inboundOverview.activityChart

  const customLabel = customStart && customEnd ? `${customStart} – ${customEnd}` : ""

  function handleDateChange(range: string, start: string, end: string) {
    setDateRange(range)
    setCustomStart(start)
    setCustomEnd(end)
  }

  return (
    <div className="space-y-5">
      <div
        style={{
          position: "sticky",
          top: 44,
          zIndex: 20,
          background: "var(--spyne-bg)",
          paddingTop: 20,
          paddingBottom: 12,
          marginTop: -20,
          borderBottom: "1px solid var(--spyne-border)",
          marginLeft: -24,
          marginRight: -24,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="spyne-title" style={{ color: "var(--spyne-text-primary)" }}>
              Hello Adam, Welcome back
            </h1>
            <p className="spyne-body-sm mt-0.5" style={{ color: "var(--spyne-text-muted)" }}>
              Sales overview · {dateRange === "Custom range" && customLabel ? customLabel : dateRange}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AgentToggle activeAgent={activeAgent} onSwitch={setActiveAgent} />
            <DateRangeFilter value={dateRange} onChange={handleDateChange} customLabel={customLabel} />
          </div>
        </div>
      </div>

      <MetricsBar metrics={metricsBar} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
        {isOutbound ? (
          <OutboundCampaignsCard data={outboundCampaignsData} />
        ) : (
          <LeadsBySourceCard data={leadsBySourceData} />
        )}
        {isOutbound ? (
          <ReEngagementPanel data={outboundOverview.reEngagement} />
        ) : (
          <SpeedToLeadPanel data={inboundOverview.speedToLead} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AgentCard agent={agentData} />
        <UpcomingAppointments appointments={appointmentsData} />
        <PriorityFollowUps followUps={priorityFollowUpsData} />
      </div>

      <ActivityChart data={activityChart} agentType={activeAgent} />
    </div>
  )
}
