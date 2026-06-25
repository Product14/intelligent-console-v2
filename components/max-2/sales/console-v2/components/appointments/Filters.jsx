"use client";

import React, { useState } from "react";
import { MaterialSymbol } from "@/components/max-2/material-symbol";

const PRIMARY = "#4600F2";

function FilterPopover({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="animate-appt-pop-in absolute left-0 z-40 mt-1 min-w-[220px] max-w-[min(320px,90vw)] rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-lg"
        style={{ boxShadow: "0 8px 24px rgb(0 0 0 / 0.1)" }}
      >
        {children}
      </div>
    </>
  );
}

const optionRowCls =
  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-[#374151] hover:bg-[#f9fafb]";

export function MultiFilter({
  label,
  options,
  selected,
  onChange,
  format = (v) => v,
  searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const count = selected.size;

  function toggle(o) {
    const next = new Set(selected);
    if (next.has(o)) next.delete(o);
    else next.add(o);
    onChange(next);
  }

  const needle = q.trim().toLowerCase();
  const shown =
    searchable && needle
      ? options.filter((o) => format(o).toLowerCase().includes(needle) || o.toLowerCase().includes(needle))
      : options;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        style={count > 0 ? { borderColor: "#c4b5fd", color: "#1a1a1a" } : {}}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12px] font-semibold text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
      >
        {label}
        {count > 0 && (
          <span
            className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            style={{ background: PRIMARY }}
          >
            {count}
          </span>
        )}
        <MaterialSymbol name="expand_more" size={16} className="text-[#9ca3af]" />
      </button>
      <FilterPopover open={open} onClose={() => setOpen(false)}>
        {searchable && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="mb-1 w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-[12px] text-[#111] outline-none placeholder:text-[#9ca3af]"
            style={{ "--tw-ring-color": "#c4b5fd" }}
            autoFocus
          />
        )}
        <div className="max-h-[240px] overflow-auto">
          {shown.length === 0 ? (
            <p className="px-2 py-2 text-[12px] text-[#9ca3af]">
              {options.length === 0 ? "No options" : "No matches"}
            </p>
          ) : (
            shown.map((o) => (
              <label key={o} className={optionRowCls}>
                <input
                  type="checkbox"
                  checked={selected.has(o)}
                  onChange={() => toggle(o)}
                  className="h-3.5 w-3.5 flex-shrink-0"
                  style={{ accentColor: PRIMARY }}
                />
                <span className="min-w-0 truncate" title={format(o)}>
                  {format(o)}
                </span>
              </label>
            ))
          )}
        </div>
      </FilterPopover>
    </div>
  );
}

const BOOKED_OPTIONS = [
  { value: "any", label: "Booked: Any time" },
  { value: "today", label: "Booked: Today" },
  { value: "yesterday", label: "Booked: Yesterday" },
  { value: "7d", label: "Booked: Last 7 days" },
  { value: "30d", label: "Booked: Last 30 days" },
  { value: "custom", label: "Booked: Custom…" },
];

export function BookedDateFilter({ value, from, to, onValue, onFrom, onTo }) {
  const [open, setOpen] = useState(false);
  const dateInput =
    "h-8 rounded-lg border border-[#e5e7eb] bg-white px-2 text-[12px] text-[#111] outline-none";
  const current = BOOKED_OPTIONS.find((o) => o.value === value) ?? BOOKED_OPTIONS[0];

  function select(v) {
    onValue(v);
    setOpen(false);
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          style={value !== "any" ? { borderColor: "#c4b5fd", color: "#1a1a1a" } : {}}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[12px] font-semibold text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
        >
          {current.label}
          <MaterialSymbol name="expand_more" size={16} className="text-[#9ca3af]" />
        </button>
        <FilterPopover open={open} onClose={() => setOpen(false)}>
          {BOOKED_OPTIONS.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => select(o.value)}
                className={`${optionRowCls} ${active ? "text-[#111]" : ""}`}
              >
                <MaterialSymbol
                  name="check"
                  size={14}
                  className="flex-shrink-0"
                  style={{ color: active ? PRIMARY : "transparent" }}
                />
                <span className="min-w-0 truncate">{o.label}</span>
              </button>
            );
          })}
        </FilterPopover>
      </div>
      {value === "custom" && (
        <>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => onFrom(e.target.value)}
            className={dateInput}
            aria-label="Booked from"
          />
          <span className="text-[11px] text-[#9ca3af]">to</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => onTo(e.target.value)}
            className={dateInput}
            aria-label="Booked to"
          />
        </>
      )}
    </div>
  );
}
