export interface ChipStyle {
  dot: string;
  bg: string;
  text: string;
}

const NEUTRAL: ChipStyle = { dot: "#9ca3af", bg: "#f3f4f6", text: "#374151" };

const KNOWN_STATUS: Record<string, ChipStyle> = {
  scheduled: { dot: "#6366f1", bg: "#eef2ff", text: "#3730a3" },
  confirmed: { dot: "#027A48", bg: "#E8F5EF", text: "#027A48" },
  unconfirmed: { dot: "#FACC15", bg: "#FFFBEB", text: "#854D0E" },
  rescheduled: { dot: "#4600F2", bg: "#ede9ff", text: "#4600F2" },
  cancelled: { dot: "#D13313", bg: "#FDE8E6", text: "#D13313" },
  canceled: { dot: "#D13313", bg: "#FDE8E6", text: "#D13313" },
  no_show: { dot: "#D13313", bg: "#FDE8E6", text: "#D13313" },
  "no-show": { dot: "#D13313", bg: "#FDE8E6", text: "#D13313" },
  showed: { dot: "#027A48", bg: "#E8F5EF", text: "#027A48" },
  visited: { dot: "#027A48", bg: "#E8F5EF", text: "#027A48" },
  completed: { dot: "#027A48", bg: "#E8F5EF", text: "#027A48" },
};

export function humanize(raw?: string | null): string {
  if (!raw) return "Unknown";
  return raw
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusStyle(raw?: string | null): ChipStyle {
  if (!raw) return NEUTRAL;
  return KNOWN_STATUS[raw.toLowerCase()] ?? NEUTRAL;
}

const ACCENTS: ChipStyle[] = [
  { dot: "#4600F2", bg: "#ede9ff", text: "#4600F2" },
  { dot: "#6366f1", bg: "#eef2ff", text: "#3730a3" },
  { dot: "#0891b2", bg: "#cffafe", text: "#155e75" },
  { dot: "#ca8a04", bg: "#fef9c3", text: "#854d0e" },
];
export function accentFor(raw?: string | null): ChipStyle {
  if (!raw) return NEUTRAL;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}
