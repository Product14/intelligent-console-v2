"use client";

import React, { useMemo, useState } from "react";
import { MaterialSymbol } from "@/components/max-2/material-symbol";
import { TzContext } from "@/lib/appointments/tz";
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  weekDays,
  monthGrid,
  addDays,
  fmtWeekRange,
  fmtMonthYear,
  dayKeyInTz,
  dayKeyLocal,
  sameDay,
} from "@/lib/appointments/dates";
import {
  customerName,
  vehicleLabel,
  vehicleFor,
  assigneeName,
  fmtSource,
} from "@/lib/appointments/format";
import { humanize } from "@/lib/appointments/status";
import { getMeetings } from "@/lib/appointments/data";
import TableView from "./TableView";
import { MonthView, AgendaWeek } from "./CalendarView";
import DetailDrawer from "./DetailDrawer";
import { MultiFilter, BookedDateFilter } from "./Filters";

const PRIMARY = "#4600F2";

const VIEWS = [
  { id: "daily", label: "Daily", icon: "today" },
  { id: "weekly", label: "Weekly", icon: "date_range" },
  { id: "monthly", label: "Monthly", icon: "calendar_month" },
];

function EmptyState({ title, body }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <MaterialSymbol name="calendar_month" size={24} className="text-[#d1d5db]" />
      <p className="text-[13.5px] font-bold text-[#1a1a1a]">{title}</p>
      <p className="max-w-[360px] text-[12px] leading-snug text-[#6b7280]">{body}</p>
    </div>
  );
}

export default function AppointmentsRoot() {
  const [today] = useState(() => startOfDay(new Date()));
  const [view, setView] = useState("daily");
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  // filters
  const [fStatus, setFStatus] = useState(new Set());
  const [fAssignee, setFAssignee] = useState(new Set());
  const [fSource, setFSource] = useState(new Set());
  const [fType, setFType] = useState(new Set());
  const [fBooked, setFBooked] = useState("any");
  const [fBookedFrom, setFBookedFrom] = useState("");
  const [fBookedTo, setFBookedTo] = useState("");

  function clearFilters() {
    setFStatus(new Set());
    setFAssignee(new Set());
    setFSource(new Set());
    setFType(new Set());
    setFBooked("any");
    setFBookedFrom("");
    setFBookedTo("");
  }
  const activeFilterCount =
    fStatus.size + fAssignee.size + fSource.size + fType.size + (fBooked !== "any" ? 1 : 0);

  const monthMode = view === "monthly";

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (monthMode) {
      const g = monthGrid(anchor);
      return { rangeStart: startOfDay(g[0][0]), rangeEnd: endOfDay(g[5][6]) };
    }
    return { rangeStart: startOfWeek(anchor), rangeEnd: endOfWeek(anchor) };
  }, [anchor, monthMode]);

  // Load from mock fixture (swap getMeetings for an API call to go live)
  const periodMeetings = useMemo(
    () => getMeetings({ startDate: rangeStart, endDate: rangeEnd }),
    [rangeStart, rangeEnd],
  );

  const filterOptions = useMemo(() => {
    const status = new Set();
    const assignee = new Set();
    const sourceSet = new Set();
    const type = new Set();
    for (const m of periodMeetings) {
      if (m.status) status.add(m.status);
      assignee.add(assigneeName(m));
      if (m.source) sourceSet.add(m.source);
      if (m.intent) type.add(m.intent);
    }
    const sorted = (s) => [...s].sort();
    return {
      status: sorted(status),
      assignee: sorted(assignee),
      source: sorted(sourceSet),
      type: sorted(type),
    };
  }, [periodMeetings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = today.getTime();
    return periodMeetings.filter((m) => {
      if (q) {
        const veh = vehicleLabel(vehicleFor(m)).toLowerCase();
        if (!customerName(m).toLowerCase().includes(q) && !veh.includes(q)) return false;
      }
      if (fStatus.size && !fStatus.has(m.status || "")) return false;
      if (fAssignee.size && !fAssignee.has(assigneeName(m))) return false;
      if (fSource.size && !fSource.has(m.source || "")) return false;
      if (fType.size && !fType.has(m.intent || "")) return false;
      if (fBooked !== "any" && m.createdAt) {
        const c = new Date(m.createdAt).getTime();
        const day = 86400000;
        if (fBooked === "today" && now - c > day) return false;
        if (fBooked === "yesterday") {
          const ys = addDays(today, -1).getTime();
          const ye = endOfDay(addDays(today, -1)).getTime();
          if (c < ys || c > ye) return false;
        }
        if (fBooked === "7d" && now - c > 7 * day) return false;
        if (fBooked === "30d" && now - c > 30 * day) return false;
        if (fBooked === "custom") {
          if (fBookedFrom && c < new Date(`${fBookedFrom}T00:00:00`).getTime()) return false;
          if (fBookedTo && c > new Date(`${fBookedTo}T23:59:59.999`).getTime()) return false;
        }
      }
      return true;
    });
  }, [periodMeetings, query, fStatus, fAssignee, fSource, fType, fBooked, fBookedFrom, fBookedTo, today]);

  const days = weekDays(anchor);
  const countsByDay = useMemo(() => {
    const map = new Map();
    for (const m of filtered) {
      const k = dayKeyInTz(m.meetingStartTime, m.timezone);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [filtered]);

  const dayMeetings = useMemo(
    () => filtered.filter((m) => dayKeyInTz(m.meetingStartTime, m.timezone) === dayKeyLocal(anchor)),
    [filtered, anchor],
  );

  function step(delta) {
    if (view === "monthly") {
      setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + delta, 1));
    } else if (view === "daily") {
      setAnchor((a) => addDays(a, delta));
    } else {
      setAnchor((a) => addDays(a, delta * 7));
    }
    setSelected(null);
  }
  function goToday() {
    setAnchor(today);
    setSelected(null);
  }
  function openDay(d) {
    setView("daily");
    setAnchor(d);
    setSelected(null);
  }

  const periodLabel =
    view === "monthly"
      ? fmtMonthYear(anchor)
      : view === "daily"
        ? anchor.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : fmtWeekRange(anchor);

  const totalCount = view === "daily" ? dayMeetings.length : filtered.length;

  const segBase =
    "px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all inline-flex items-center gap-1.5";
  const navBtnBase =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] hover:text-[#1a1a1a] hover:bg-[#f9fafb] transition-colors";

  return (
    <TzContext.Provider value={undefined}>
      <div>
        {/* toolbar: search + view toggle (left) · period + nav (right) */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* search */}
            <div className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-2.5">
              <MaterialSymbol name="search" size={16} className="text-[#9ca3af]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or vehicle…"
                className="w-44 bg-transparent text-[12px] text-[#1a1a1a] outline-none placeholder:text-[#9ca3af]"
              />
            </div>
            {/* view toggle */}
            <div className="inline-flex items-center gap-1 rounded-lg bg-[#f3f4f6] p-1">
              {VIEWS.map((vw) => {
                const active = view === vw.id;
                return (
                  <button
                    key={vw.id}
                    onClick={() => {
                      setView(vw.id);
                      setSelected(null);
                    }}
                    className={`${segBase} ${
                      active ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b7280] hover:text-[#1a1a1a]"
                    }`}
                  >
                    <MaterialSymbol name={vw.icon} size={14} />
                    {vw.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* period + nav */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6b7280]">
              <span className="font-bold text-[#1a1a1a]">{periodLabel}</span> · {totalCount} appt
              {totalCount !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => step(-1)} className={navBtnBase}>
                <MaterialSymbol name="chevron_left" size={20} />
              </button>
              <button
                onClick={goToday}
                className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] font-semibold text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
              >
                Today
              </button>
              <button onClick={() => step(1)} className={navBtnBase}>
                <MaterialSymbol name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
            Filters
          </span>
          <MultiFilter
            label="Status"
            options={filterOptions.status}
            selected={fStatus}
            onChange={setFStatus}
            format={humanize}
          />
          <MultiFilter
            label="Rep"
            options={filterOptions.assignee}
            selected={fAssignee}
            onChange={setFAssignee}
          />
          <MultiFilter
            label="Source"
            options={filterOptions.source}
            selected={fSource}
            onChange={setFSource}
            format={fmtSource}
          />
          <MultiFilter
            label="Type"
            options={filterOptions.type}
            selected={fType}
            onChange={setFType}
            format={humanize}
          />
          <BookedDateFilter
            value={fBooked}
            from={fBookedFrom}
            to={fBookedTo}
            onValue={setFBooked}
            onFrom={setFBookedFrom}
            onTo={setFBookedTo}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-[12px] font-semibold hover:underline"
              style={{ color: PRIMARY }}
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>

        {/* body */}
        {view === "daily" ? (
          <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
            {/* week day strip */}
            <div className="grid grid-cols-7 gap-1 border-b border-[#f0f0f0] p-3">
              {days.map((d) => {
                const count = countsByDay.get(dayKeyLocal(d)) ?? 0;
                const isSel = sameDay(d, anchor);
                const isToday = sameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => {
                      setAnchor(d);
                      setSelected(null);
                    }}
                    className="flex flex-col items-center gap-0.5 rounded-xl py-2.5 transition-colors hover:bg-[#f9fafb]"
                    style={isSel ? { background: "#ede9ff" } : isToday ? { outline: "1px solid #ddd8f5" } : {}}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: isSel ? PRIMARY : "#9ca3af" }}
                    >
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span
                      className="text-[18px] font-bold leading-tight"
                      style={{
                        color: isSel ? PRIMARY : isToday ? "#1a1a1a" : "#374151",
                      }}
                    >
                      {d.getDate()}
                    </span>
                    {count > 0 ? (
                      <span
                        className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                        style={
                          isSel
                            ? { background: PRIMARY, color: "white" }
                            : { background: "#eaecef", color: "#6b7280" }
                        }
                      >
                        {count}
                      </span>
                    ) : (
                      <span className="mt-0.5 text-[10px] leading-4 text-[#cbd0d6]">—</span>
                    )}
                  </button>
                );
              })}
            </div>
            {dayMeetings.length > 0 ? (
              <TableView meetings={dayMeetings} service={false} onSelect={setSelected} />
            ) : (
              <EmptyState
                title="No appointments this day"
                body="Pick another day above, or navigate to a different week."
              />
            )}
          </div>
        ) : totalCount > 0 ? (
          view === "monthly" ? (
            <MonthView
              meetings={filtered}
              service={false}
              anchor={anchor}
              today={today}
              onSelect={setSelected}
              onOpenDay={openDay}
            />
          ) : (
            <AgendaWeek
              meetings={filtered}
              service={false}
              anchor={anchor}
              today={today}
              onSelect={setSelected}
              onOpenDay={openDay}
            />
          )
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
            <EmptyState
              title="No appointments in this range"
              body="Try a different period or navigate to another week."
            />
          </div>
        )}

        <DetailDrawer meeting={selected} onClose={() => setSelected(null)} />
      </div>
    </TzContext.Provider>
  );
}
