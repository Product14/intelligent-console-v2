import type { Meeting, VehicleData } from "./types";

function tz(m: Meeting): string | undefined {
  return m.timezone || undefined;
}

export function fmtTime(iso?: string, timezone?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    });
  } catch {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
}

export function fmtTimeRange(m: Meeting, timezone?: string): string {
  const z = timezone ?? tz(m);
  const s = fmtTime(m.meetingStartTime, z);
  const e = fmtTime(m.meetingEndTime, z);
  return e ? `${s} – ${e}` : s;
}

export function fmtDateLong(iso?: string, timezone?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  });
}

export function fmtPhone(p?: string): string {
  if (!p) return "";
  const d = p.replace(/[^\d]/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}

export function customerName(m: Meeting): string {
  return m.customerData?.name || m.customerData?.extractedName || "Unknown customer";
}

export function vehicleFor(m: Meeting): VehicleData | undefined {
  if (m.meta?.vehicles?.length) return m.meta.vehicles[0];
  if (m.proposedVinsData?.length) return m.proposedVinsData[0];
  return undefined;
}

export function vehicleLabel(v?: VehicleData): string {
  if (!v) return "";
  const parts = [v.year, v.make, v.model, v.trim].filter(Boolean);
  const label = parts.join(" ").trim();
  return label || (v.vin || v.dealerVinId ? `VIN ···${String(v.vin || v.dealerVinId).slice(-6)}` : "");
}

export function vin(v?: VehicleData): string {
  return (v?.vin || v?.dealerVinId || "").toString();
}

export function assigneeName(m: Meeting): string {
  if (m.advisor?.name) return m.advisor.name;
  const u = m.assignedTo;
  if (u && typeof u.userName === "string" && u.userName) return u.userName;
  if (u?.userId && u.userId !== "SYSTEM") return u.userId;
  return "Unassigned";
}

export function isServiceType(t?: string): boolean {
  return (t || "").toLowerCase() === "service";
}

export function fmtSource(s?: string | null): string {
  return (s || "").toUpperCase();
}

export function fmtDateShort(iso?: string, timezone?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: timezone });
}

const TRANSPORT_LABELS: Record<string, string> = {
  wait: "Wait at the Dealership",
  waiter: "Wait at the Dealership",
  loaner: "Loaner Vehicle",
  shuttle: "Shuttle",
  pickup: "Pickup",
  dropoff: "Drop-off",
  "drop-off": "Drop-off",
};
export function fmtTransport(v?: string | null): string {
  if (!v) return "";
  return (
    TRANSPORT_LABELS[v.toLowerCase()] ??
    v.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function customerEmail(m: Meeting): string {
  return (m.customerData?.emails ?? []).find((e) => e && e.trim()) ?? "";
}

export function customerStanding(m: Meeting): string {
  const s = m.customerData?.customerStatus;
  if (!s) return "";
  return s.toLowerCase() === "old" ? "Returning customer" : "New customer";
}
