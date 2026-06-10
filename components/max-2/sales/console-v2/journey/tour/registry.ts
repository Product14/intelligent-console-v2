/**
 * Guided-tour step registry — the 0→end narration, synced to the journey stages.
 * Every dollar figure is templated from journey/state.ts so copy degrades
 * gracefully and stays credible. One declarative array = the single place to
 * tune order/copy.
 */

import { type Stage, TOTAL_PIPELINE_K, OPPORTUNITY_TOTAL_K, CONNECT_STEPS, OPPORTUNITIES } from "../state";

const k = (id: string) => CONNECT_STEPS.find((c) => c.id === id)?.valueK ?? 0;
const serviceK = OPPORTUNITIES.find((o) => o.needs === "Service CRM")?.stakeK ?? 32;

export type Placement = "bottom" | "top" | "auto";

export interface TourStep {
  n: number;
  stage: Stage;
  anchor: string; // data-tour key
  title: string;
  body: string;
  placement?: Placement;
}

export const TOUR_STEPS: TourStep[] = [
  { n: 0, stage: "new", anchor: "hero", title: "Welcome to VINI", body: `This is your command center — and your way into about $${TOTAL_PIPELINE_K}K of pipeline already sitting in the systems you use every day. In two minutes, here's how VINI turns that into ready-to-launch campaigns.` },
  { n: 1, stage: "new", anchor: "value-bar", title: `$${TOTAL_PIPELINE_K}K is hiding in your systems`, body: "That's real pipeline VINI can find — but only from sources you connect. Blind, it guesses; connected, it can name the customer, the vehicle, and the dollar amount. Watch this meter climb as you switch each source on." },
  { n: 2, stage: "new", anchor: "connect-panel", title: "It all starts with your data", body: "Nothing here is guesswork — every opportunity is sourced from data you already own. Connect a system once and it stays in sync. The more you connect, the more pipeline unlocks." },
  { n: 3, stage: "new", anchor: "connect-crm", title: `Your CRM is the keystone (+$${k("crm")}K)`, body: "It carries every lead and interaction, and it's what lets VINI collapse duplicate rows into one clean customer. Without it there's no campaign at all — with it you unlock speed-to-lead and re-engagement." },
  { n: 4, stage: "new", anchor: "connect-dms", title: `No DMS = ~$${k("dms")}K you can't touch`, body: "CDK is the richest source: deals, payoffs, ownership. It's how VINI finds owners with >$5K equity and leases maturing in 60–90 days. Leave it off and that money stays grayed out as locked dollars." },
  { n: 5, stage: "new", anchor: "analyze-cta", title: "Connect your CRM, then analyze", body: "Skip a source and you leave money locked — Service-to-sales stays dim until you add Tekion. Value is never hidden; VINI always shows the dollars you haven't switched on. CRM live? Hit Analyze." },
  { n: 6, stage: "connecting", anchor: "sync-status", title: "The first sync is running", body: "VINI pulls from every connected source at once — CRM live, DMS backfilling, Service syncing. It runs in the background and keeps itself fresh. The real work is in the card below." },
  { n: 7, stage: "connecting", anchor: "identity-card", title: "31,240 rows → 14,820 real customers", body: "This is the part nobody else does well. The same person shows up as a lead, a buyer, and a service visit — VINI matches on phone, email, and name to collapse them into ONE customer. That's why every later number is trustworthy." },
  { n: 8, stage: "analyzing", anchor: "analyzing-result", title: `VINI read everything — and found ~$${Math.round(OPPORTUNITY_TOTAL_K)}K`, body: "No new integrations, no manual lists. VINI scanned every resolved customer, owned vehicle, and deal for equity-positive owners, maturing leases, aging inventory, and recoverable no-shows — and surfaced your opportunities." },
  { n: 9, stage: "ready", anchor: "opps-header", title: "Ranked by money on the table", body: "Your first-time experience: every opportunity VINI found, sorted by gross at stake. You don't have to know which campaign to run — VINI already did the thinking. You just pick where to start." },
  { n: 10, stage: "ready", anchor: "opp-card-1", title: "One click to a drafted campaign", body: "Hit Draft campaign and the outreach builds itself, pre-filled, in seconds. See the 'from your data' tag — every card traces back to a real source. This is your data, not a canned demo." },
  { n: 11, stage: "ready", anchor: "opp-locked", title: "Locked value = a reason to connect more", body: `This one's greyed out because it needs your Service CRM. That's the loop closing — the ~$${serviceK}K here is real money you unlock by connecting one more source you already pay for.` },
  { n: 12, stage: "ready", anchor: "use-case-card", title: "Or start from a proven playbook", body: "Prefer a head start? Spyne-curated templates — Equity Mining, Lease End, Service-Drive Trade-In — come with the brains and workflows pre-built. Either path lands you live." },
  { n: 13, stage: "active", anchor: "nav-strip", title: "Everything's unlocked now", body: "You earned the full console — Overview, Data Health, Campaigns, Action Items, Appointments, Customers. Every tab is live now that your data flows." },
  { n: 14, stage: "active", anchor: "daily-brief", title: "Your daily brief + four shortcuts", body: "This replaces the welcome screen for good. VINI tells you the single most important thing to do today — and you can ask in plain English. Connect once, and VINI keeps finding the money. Replay anytime from 'Take the tour'." },
  { n: 15, stage: "active", anchor: "new-campaign", title: "Spin up a campaign anytime", body: "Don't wait for an opportunity card. Describe what you want in plain English — 'reach owners with maturing leases' — or pick a proven template, and VINI drafts the whole campaign for you, pre-filled and ready to launch." },
];

export const TOUR_FLAG = "vini-tour-seen";
