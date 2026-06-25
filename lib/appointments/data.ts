import type { Meeting } from "./types";
import salesJson from "./fixtures/sales.json";

const SALES = salesJson as unknown as Meeting[];

interface MeetingsQuery {
  startDate?: Date;
  endDate?: Date;
}

export function getMeetings({ startDate, endDate }: MeetingsQuery): Meeting[] {
  const inRange = SALES.filter((m) => {
    if (!m.meetingStartTime) return false;
    const t = new Date(m.meetingStartTime).getTime();
    if (startDate && t < startDate.getTime()) return false;
    if (endDate && t > endDate.getTime()) return false;
    return true;
  });
  return inRange.sort(
    (a, b) =>
      new Date(a.meetingStartTime || 0).getTime() - new Date(b.meetingStartTime || 0).getTime(),
  );
}
