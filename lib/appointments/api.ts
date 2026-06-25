import type { Meeting } from "./types";

export type ChatRole = "ai" | "customer" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string | null;
}

export interface Conversation {
  conversationId: string;
  type: string; // "call" | "sms" | future
  status?: string;
  audioUrl?: string | null;
  createdAt?: string;
  messages: ChatMessage[];
}

// 5-minute in-memory cache per conversation/call id.
const CONV_TTL_MS = 5 * 60_000;
const convCache = new Map<string, { at: number; conv: Conversation | null }>();

// Fetch the booking conversation for a meeting.
// - callId present → endpoint uses callId (call-booked appointments)
// - conversationId present → endpoint uses conversationId (SMS/chat-booked)
// - neither → returns null (CRM/floor-booked, no agent conversation)
// Without API credentials, falls back to a realistic mock conversation.
export async function fetchConversation(m: Meeting): Promise<Conversation | null> {
  if (m.callId) return null; // calls use the rich call-report drawer, not messages

  if (!m.conversationId) return null;

  const cacheKey = m.conversationId;
  const cached = convCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CONV_TTL_MS) return cached.conv;

  // No live API config in this context — return a demo conversation so the
  // drawer shows realistic message bubbles. Swap this branch for a real fetch
  // once API credentials are available.
  const conv = mockConversation(m);
  convCache.set(cacheKey, { at: Date.now(), conv });
  return conv;
}

function mockConversation(m: Meeting): Conversation {
  const name = m.customerData?.name?.split(" ")[0] || "there";
  const v = m.proposedVinsData?.[0] || m.meta?.vehicles?.[0];
  const veh = v ? [v.year, v.make, v.model].filter(Boolean).join(" ") : "the vehicle";
  return {
    conversationId: m.conversationId ?? "demo",
    type: "sms",
    status: "completed",
    audioUrl: null,
    createdAt: m.createdAt,
    messages: [
      {
        role: "ai",
        content: `Hi ${name}, is the ${veh} still on your list? Happy to set up a visit.`,
        timestamp: m.createdAt,
      },
      { role: "customer", content: "Yes — what times do you have?", timestamp: m.createdAt },
      {
        role: "ai",
        content: "I can do tomorrow afternoon or the next morning. Reply STOP to opt out.",
        timestamp: m.createdAt,
      },
      { role: "customer", content: "Afternoon works.", timestamp: m.createdAt },
      {
        role: "ai",
        content: "Great, you're booked. We'll have everything ready. See you then!",
        timestamp: m.createdAt,
      },
    ],
  };
}
