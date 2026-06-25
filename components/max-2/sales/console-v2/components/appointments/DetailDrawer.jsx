"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MaterialSymbol } from "@/components/max-2/material-symbol";
import {
  customerName,
  fmtTime,
  fmtTimeRange,
  fmtDateLong,
  fmtPhone,
  fmtSource,
  fmtTransport,
  customerEmail,
  customerStanding,
  vehicleFor,
  vehicleLabel,
  vin,
  assigneeName,
  isServiceType,
} from "@/lib/appointments/format";
import { useTz } from "@/lib/appointments/tz";
import { humanize, statusStyle, accentFor } from "@/lib/appointments/status";
import { fetchConversation } from "@/lib/appointments/api";

const PRIMARY = "#4600F2";

function Label({ children }) {
  return (
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.07em] text-[#9ca3af]">
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--spyne-border, #e5e7eb)" }} />;
}

function CopyableId({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      title="Copy to clipboard"
      className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#e5e7eb] bg-[#fafafa] px-1.5 py-0.5 font-mono text-[10.5px] text-[#374151] hover:bg-[#f3f4f6]"
    >
      <span className="max-w-[150px] truncate">{value}</span>
      <MaterialSymbol
        name={copied ? "check" : "content_copy"}
        size={14}
        className={copied ? "text-green-600" : "text-[#9ca3af]"}
      />
    </button>
  );
}

function StatusChip({ status }) {
  const s = statusStyle(status);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {humanize(status)}
    </span>
  );
}

function IntentChip({ value }) {
  const s = accentFor(value);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      {humanize(value)}
    </span>
  );
}

function TypeChip({ label }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: "#ede9ff", color: PRIMARY }}
    >
      {label}
    </span>
  );
}

function MessageBubble({ msg, tz }) {
  const dtz = useTz();
  if (msg.role === "system") {
    return <p className="py-0.5 text-center text-[10.5px] text-[#9ca3af]">{msg.content}</p>;
  }
  const isAgent = msg.role === "ai";
  return (
    <div className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-1.5 text-[12px] leading-snug ${
          isAgent ? "text-[#4c2389]" : "bg-[#f3f4f6] text-[#374151]"
        }`}
        style={isAgent ? { background: "#f3eaff" } : {}}
      >
        {msg.content}
      </div>
      {msg.timestamp && (
        <span className="mt-0.5 px-1 text-[9.5px] text-[#9ca3af]">
          {fmtTime(msg.timestamp, tz ?? dtz)}
        </span>
      )}
    </div>
  );
}

export default function DetailDrawer({ meeting, onClose }) {
  const dtz = useTz();
  const [conversation, setConversation] = useState(null);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txError, setTxError] = useState(null);

  useEffect(() => {
    // Calls use the rich call-report drawer — skip the messages fetch for them.
    if (meeting?.callId || !meeting?.conversationId) {
      setConversation(null);
      return;
    }
    let cancelled = false;
    setLoadingTx(true);
    fetchConversation(meeting)
      .then((conv) => {
        if (cancelled) return;
        setConversation(conv);
        setTxError(null);
      })
      .catch((e) => {
        if (!cancelled) setTxError(e instanceof Error ? e.message : "Couldn't load conversation");
      })
      .finally(() => {
        if (!cancelled) setLoadingTx(false);
      });
    return () => { cancelled = true; };
  }, [meeting]);

  if (!meeting) return null;
  if (typeof document === "undefined") return null;

  const m = meeting;
  const service = isServiceType(m.serviceType);
  const v = vehicleFor(m);
  const phone = m.customerData?.mobileNumber;
  const email = customerEmail(m);
  const standing = customerStanding(m);
  const services = m.servicesRequested ?? [];
  const notes = m.notes ?? [];
  const tradeReq = m.meta?.tradeInData?.tradeRequested;
  const tags = m.tags ?? [];

  const panel = (
    <div>
      <div
        onClick={onClose}
        className="animate-appt-overlay-in fixed inset-0 z-[59] bg-black/20"
      />
      <aside
        className="animate-appt-drawer-in fixed right-0 top-0 bottom-0 z-[60] flex w-[400px] max-w-full flex-col overflow-y-auto border-l bg-white"
        style={{ borderColor: "var(--spyne-border, #e5e7eb)" }}
      >
        {/* header */}
        <div
          className="sticky top-0 z-10 flex-shrink-0 border-b bg-white px-5 pb-4 pt-5"
          style={{ borderColor: "var(--spyne-border, #e5e7eb)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <TypeChip label={service ? "service" : "sales"} />
                {m.intent && <IntentChip value={m.intent} />}
                {m.status && <StatusChip status={m.status} />}
              </div>
              <h2 className="truncate text-[18px] font-bold text-[#1a1a1a]">{customerName(m)}</h2>
              <p className="mt-1 text-[12.5px] text-[#6b7280]">
                {fmtDateLong(m.meetingStartTime, dtz ?? m.timezone)} ·{" "}
                {fmtTimeRange(m, dtz ?? m.timezone)}
              </p>
              <p className="mt-0.5 text-[12px] text-[#9ca3af]">
                {assigneeName(m)}
                {m.source ? ` · ${fmtSource(m.source)}` : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-md p-1 text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#1a1a1a] transition-colors"
            >
              <MaterialSymbol name="close" size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          {/* vehicle */}
          <div>
            <Label>{service ? "Service vehicle" : "Vehicle of interest"}</Label>
            <div className="flex items-start gap-2.5">
              <MaterialSymbol name="directions_car" size={16} className="mt-0.5 flex-shrink-0 text-[#9ca3af]" />
              {v ? (
                <div>
                  <p className="text-[14px] font-semibold text-[#1a1a1a]">
                    {vehicleLabel(v) || "Vehicle"}
                  </p>
                  {vin(v) && (
                    <p className="mt-0.5 font-mono text-[11px] text-[#6b7280]">VIN {vin(v)}</p>
                  )}
                  {v.price ? (
                    <p className="mt-0.5 text-[12px] text-[#6b7280]">{String(v.price)}</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-[13px] text-[#9ca3af]">
                  {service ? "No vehicle on file" : "No specific vehicle yet"}
                </p>
              )}
            </div>
          </div>

          {/* services (service tab) */}
          {service && (services.length > 0 || m.transportationOption) && (
            <>
              <Divider />
              <div>
                <Label>Services requested</Label>
                {services.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {services.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-[13px] text-[#374151]">
                        <MaterialSymbol name="build" size={14} className="flex-shrink-0 text-[#9ca3af]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-[#9ca3af]">None specified</p>
                )}
                {m.transportationOption && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] text-[#9ca3af]">Transportation:</span>
                    <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10.5px] font-semibold text-[#3730a3]">
                      {fmtTransport(m.transportationOption)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* trade-in / tags (sales) */}
          {!service && (tradeReq || tags.length > 0) && (
            <>
              <Divider />
              <div>
                <Label>Appointment content</Label>
                {tradeReq && (
                  <div className="mb-2 flex items-center gap-2 text-[13px] text-[#374151]">
                    <MaterialSymbol name="refresh" size={14} className="text-[#9ca3af]" />
                    {/^(yes|true|y|1)$/i.test(String(tradeReq))
                      ? "Trade-in requested"
                      : "No trade-in requested"}
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tags.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10.5px] font-medium text-[#6b7280]"
                      >
                        <MaterialSymbol name="label" size={14} />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Divider />

          {/* customer */}
          <div>
            <Label>Customer</Label>
            <div className="flex flex-col gap-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-[13px] font-semibold"
                  style={{ color: PRIMARY }}
                >
                  <MaterialSymbol name="phone" size={14} />
                  {fmtPhone(phone)}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 truncate text-[13px] font-semibold"
                  style={{ color: PRIMARY }}
                >
                  <MaterialSymbol name="mail" size={14} className="flex-shrink-0" />
                  <span className="truncate">{email}</span>
                </a>
              )}
              {m.source && (
                <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
                  <MaterialSymbol name="location_on" size={14} className="text-[#9ca3af]" />
                  Source: {fmtSource(m.source)}
                </div>
              )}
              {standing && <div className="text-[12px] text-[#9ca3af]">{standing}</div>}
              {m.externalCrmAppointmentId && (
                <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                  <MaterialSymbol name="tag" size={14} className="flex-shrink-0 text-[#9ca3af]" />
                  <span className="flex-shrink-0">External appt ID</span>
                  <CopyableId value={m.externalCrmAppointmentId} />
                </div>
              )}
            </div>
          </div>

          {/* notes */}
          {notes.length > 0 && (
            <>
              <Divider />
              <div>
                <Label>Notes</Label>
                <div className="flex flex-col gap-1">
                  {notes.map((n, i) => (
                    <p key={i} className="text-[13px] leading-relaxed text-[#374151]">
                      {n}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          <Divider />

          {/* booking conversation */}
          <div>
            <Label>
              <span className="inline-flex items-center gap-1">
                <MaterialSymbol name="forum" size={14} style={{ color: PRIMARY }} />
                Booking conversation
              </span>
            </Label>
            {m.callId ? (
              // Call-booked: rich call-report drawer (CTA only; transcript lives there)
              <button
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[12px] font-semibold hover:bg-[#faf8ff] transition-colors"
                style={{ color: PRIMARY }}
              >
                <MaterialSymbol name="phone_in_talk" size={14} />
                View call details
              </button>
            ) : !m.conversationId ? (
              // No agent conversation (CRM/floor-booked)
              <p className="text-[12px] text-[#9ca3af]">
                Booked via {fmtSource(m.source) || "CRM"} — no agent conversation.
              </p>
            ) : loadingTx ? (
              <p className="text-[12px] text-[#9ca3af]">Loading conversation…</p>
            ) : txError ? (
              <p className="text-[12px] text-[#dc2626]">{txError}</p>
            ) : !conversation || conversation.messages.length === 0 ? (
              <p className="text-[12px] text-[#9ca3af]">No messages.</p>
            ) : (
              // SMS/chat conversation: inline message bubbles
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9ca3af]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3730a3]">
                    <MaterialSymbol
                      name={conversation.type === "call" ? "call" : "chat"}
                      size={14}
                    />
                    {conversation.type === "call"
                      ? "Call"
                      : conversation.type === "sms"
                        ? "SMS"
                        : humanize(conversation.type)}
                  </span>
                  {conversation.status && (
                    <StatusChip status={conversation.status} />
                  )}
                </div>
                <div className="flex flex-col gap-2 rounded-xl bg-[#fafafa] p-3">
                  {conversation.messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} tz={dtz ?? m.timezone} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );

  return createPortal(panel, document.body);
}
