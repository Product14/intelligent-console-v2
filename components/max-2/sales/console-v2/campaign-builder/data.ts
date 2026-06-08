/**
 * Data tables for the AI-first campaign builder.
 * Ported from Agent-Workflow reference repo, consolidated into one file.
 */

export type CampaignCategory = "sales" | "service" | "";
export type CampaignSubType =
  | "appointment_setting"
  | "lead_generation"
  | "follow_up"
  | "recall"
  | "service_reminder"
  | "birthday"
  | "anniversary"
  | "";
export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export interface AudienceFilter {
  id: string;
  label: string;
  category: "intent" | "behavior" | "segment";
}

export interface AudienceSegment {
  id: string;
  label: string;
  description: string;
  count: number;
  category: "intent" | "behavior" | "segment";
  icon: string;
}

export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  { id: "discount_seekers", label: "Discount Seekers", description: "Leads who inquired about promotions or price drops", count: 342, category: "intent", icon: "%" },
  { id: "ev_interest", label: "EV Interested", description: "Leads who asked about electric or hybrid vehicles", count: 218, category: "intent", icon: "⚡" },
  { id: "trade_in_ready", label: "Trade-In Ready", description: "Leads who mentioned trading in their current vehicle", count: 189, category: "intent", icon: "🔄" },
  { id: "financing_inquiry", label: "Financing Inquiry", description: "Leads who asked about loan rates or financing options", count: 276, category: "intent", icon: "$" },
  { id: "feature_seeker", label: "Feature Seekers", description: "Leads who asked about specific features like sunroof, AWD, etc.", count: 154, category: "intent", icon: "★" },
  { id: "hot_leads", label: "Hot Leads", description: "Leads with multiple touchpoints in last 7 days", count: 98, category: "behavior", icon: "🔥" },
  { id: "dormant_leads", label: "Dormant Leads", description: "Leads with no activity in the last 30+ days", count: 467, category: "behavior", icon: "💤" },
  { id: "test_drive_booked", label: "Test Drive Booked", description: "Leads who scheduled but didn't show up", count: 63, category: "behavior", icon: "🚗" },
  { id: "website_visitors", label: "Recent Website Visitors", description: "Leads who visited the website in the last 14 days", count: 391, category: "behavior", icon: "🌐" },
  { id: "luxury_segment", label: "Luxury Segment", description: "Leads browsing vehicles over $60k", count: 112, category: "segment", icon: "💎" },
  { id: "first_time_buyers", label: "First-Time Buyers", description: "Leads who flagged as first vehicle purchase", count: 203, category: "segment", icon: "🎯" },
  { id: "fleet_buyers", label: "Fleet Buyers", description: "Corporate or multi-vehicle purchase leads", count: 45, category: "segment", icon: "🏢" },
];

export interface AgentOption {
  id: string;
  name: string;
  location: string;
  languages: string[];
  totalCalls: number;
  successRate: number;
}

export const AGENT_OPTIONS: AgentOption[] = [
  { id: "vini", name: "VINI", location: "Texas", languages: ["English"], totalCalls: 3240, successRate: 82 },
  { id: "frankie", name: "Frankie", location: "London", languages: ["English"], totalCalls: 1240, successRate: 75 },
  { id: "maria", name: "Maria Lopez", location: "Miami", languages: ["English", "Spanish"], totalCalls: 870, successRate: 75 },
  { id: "james", name: "James Carter", location: "Chicago", languages: ["English"], totalCalls: 1105, successRate: 81 },
  { id: "priya", name: "Priya Sharma", location: "Dallas", languages: ["English", "Hindi"], totalCalls: 643, successRate: 78 },
];

export const SUB_TYPES: Record<string, { value: CampaignSubType; label: string }[]> = {
  sales: [
    { value: "appointment_setting", label: "Appointment Setting" },
    { value: "lead_generation", label: "Lead Generation" },
    { value: "follow_up", label: "Follow Up" },
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Anniversary" },
  ],
  service: [
    { value: "recall", label: "Recall" },
    { value: "service_reminder", label: "Service Reminder" },
  ],
};

export const CUSTOM_FILTER_OPTIONS: AudienceFilter[] = [
  { id: "cf_discount", label: "Asked about discount", category: "intent" },
  { id: "cf_feature_sunroof", label: "Interested in sunroof", category: "intent" },
  { id: "cf_feature_awd", label: "Looking for AWD", category: "intent" },
  { id: "cf_feature_ev", label: "EV / Hybrid preference", category: "intent" },
  { id: "cf_budget_under40", label: "Budget under $40k", category: "intent" },
  { id: "cf_budget_over60", label: "Budget over $60k", category: "intent" },
  { id: "cf_no_contact_7d", label: "No contact in 7 days", category: "behavior" },
  { id: "cf_no_contact_30d", label: "No contact in 30 days", category: "behavior" },
  { id: "cf_website_visit", label: "Visited website recently", category: "behavior" },
  { id: "cf_opened_email", label: "Opened last email", category: "behavior" },
  { id: "cf_called_in", label: "Called dealership before", category: "behavior" },
  { id: "cf_first_time", label: "First-time buyer", category: "segment" },
  { id: "cf_returning", label: "Returning customer", category: "segment" },
  { id: "cf_fleet", label: "Fleet / Corporate", category: "segment" },
  { id: "cf_local", label: "Within 25 miles", category: "segment" },
];

export interface UseCaseTemplate {
  id: string;
  name: string;
  description: string;
  category: CampaignCategory;
  subType: CampaignSubType;
  icon: string;
  audienceHint: string;
  recommendedFor: string;
  mustDo: string[];
  goodToHave: string[];
  mustNotDo: string[];
}

export const USE_CASE_TEMPLATES: UseCaseTemplate[] = [
  {
    id: "tpl_appointment_setting",
    name: "Appointment Setting",
    description: "Book interested leads onto the calendar with a low-pressure intro call.",
    category: "sales",
    subType: "appointment_setting",
    icon: "📅",
    audienceHint: "Hot leads, recent website visitors",
    recommendedFor: "Sales BDC",
    mustDo: [
      "Confirm the lead is actively shopping before proposing a date",
      "Offer at least two specific time slots, not an open-ended ask",
      "Capture name, phone, and vehicle of interest before ending",
    ],
    goodToHave: [
      "Mention any active offer if it's relevant to their stated interest",
      "Confirm the showroom location and parking info on booking",
    ],
    mustNotDo: [
      "Do not commit to a specific price",
      "Do not quote a trade-in value over the phone",
      "Do not discuss financing terms or interest rates",
      "Do not promise inventory availability beyond what is in the system",
    ],
  },
  {
    id: "tpl_lead_generation",
    name: "Lead Generation",
    description: "Re-engage dormant leads and qualify intent before passing to a rep.",
    category: "sales",
    subType: "lead_generation",
    icon: "🎯",
    audienceHint: "Dormant leads, EV interest",
    recommendedFor: "Sales BDC",
    mustDo: [
      "Re-introduce the dealership and reason for the call within the first turn",
      "Ask what changed since their last inquiry",
      "Qualify timeline and budget at a high level only",
    ],
    goodToHave: [
      "Reference the original vehicle they inquired about if available",
      "Offer a callback at a time the lead specifies",
    ],
    mustNotDo: [
      "Do not push for a same-day decision",
      "Do not quote a price or APR",
      "Do not transfer cold leads to a rep without their consent",
    ],
  },
  {
    id: "tpl_follow_up",
    name: "Follow-Up",
    description: "Multi-touch follow-up on a previous conversation that didn't close.",
    category: "sales",
    subType: "follow_up",
    icon: "🔄",
    audienceHint: "Cold leads, prior contacts",
    recommendedFor: "Sales BDC",
    mustDo: [
      "Reference the prior conversation by topic, not date",
      "Ask whether the original need is still open",
      "Offer a clear next step before ending the call",
    ],
    goodToHave: [
      "Offer to send a summary by SMS",
      "Suggest a slightly different vehicle if the original is no longer available",
    ],
    mustNotDo: [
      "Do not repeat the same pitch from the prior call verbatim",
      "Do not ignore an explicit prior objection",
      "Do not transfer without confirming the lead wants to be transferred",
    ],
  },
  {
    id: "tpl_recall",
    name: "Service Recall",
    description: "Voice-only outreach for safety recalls. DNC-exempt and compliance-grade.",
    category: "service",
    subType: "recall",
    icon: "🛠️",
    audienceHint: "Recall-eligible VINs",
    recommendedFor: "Service ops",
    mustDo: [
      "State this is a recall notification within the first 10 seconds",
      "Confirm the caller is the registered owner before discussing details",
      "Cite the recall reference number if asked",
      "Offer at least two service appointment slots",
    ],
    goodToHave: [
      "Mention loaner-car availability if applicable",
      "Confirm the customer received any prior recall mailers",
    ],
    mustNotDo: [
      "Do not characterize the recall as optional",
      "Do not estimate repair time beyond what the system provides",
      "Do not discuss unrelated service items in the same call",
      "Do not promise indemnity, replacement, or compensation",
    ],
  },
  {
    id: "tpl_service_reminder",
    name: "Service Reminder",
    description: "Reminder waves for due maintenance or inspection appointments.",
    category: "service",
    subType: "service_reminder",
    icon: "🔔",
    audienceHint: "Service-due customers",
    recommendedFor: "Service ops",
    mustDo: [
      "Reference the specific service that is due",
      "Offer at least two appointment slots",
      "Confirm vehicle make/model on file is correct",
    ],
    goodToHave: [
      "Mention any current service offer if relevant",
      "Offer SMS reminder before the appointment",
    ],
    mustNotDo: [
      "Do not quote a final price — quote a starting range only",
      "Do not list other deferred service items in the same call",
      "Do not pressure the customer if they decline twice",
    ],
  },
  {
    id: "tpl_lease_end",
    name: "Lease-End Outreach",
    description: "Reach lease-end customers 60–90 days before expiry with renewal or buy-back offers.",
    category: "sales",
    subType: "follow_up",
    icon: "📆",
    audienceHint: "Lease ends in 60–90 days",
    recommendedFor: "Sales BDC",
    mustDo: [
      "Confirm the customer is the leaseholder on file",
      "Reference the specific vehicle and remaining lease term",
      "Offer at least two options: renew, buy-out, or upgrade",
    ],
    goodToHave: [
      "Mention current lease-loyalty incentives if applicable",
      "Offer to send a no-obligation buy-out quote by SMS",
    ],
    mustNotDo: [
      "Do not give a final buyout price over the phone",
      "Do not threaten penalties or repossession",
      "Do not pressure customers near end-of-call",
    ],
  },
];
