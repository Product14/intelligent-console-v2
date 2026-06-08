/**
 * Field taxonomy for the visual audience query builder.
 * Each field declares its data type, available operators, and (where relevant)
 * a closed set of options.
 */

export type FieldType = "select" | "multiselect" | "number" | "text" | "bool";
export type Operator =
  | "="
  | "!="
  | "in"
  | "not_in"
  | "contains"
  | "≤"
  | "≥"
  | "between";

export type FieldCategory =
  | "demographic"
  | "vehicle_interest"
  | "lead_source"
  | "engagement"
  | "lifecycle"
  | "intent"
  | "status";

export interface FieldDef {
  id: string;
  label: string;
  category: FieldCategory;
  type: FieldType;
  operators: Operator[];
  /** For select / multiselect — closed option set. */
  options?: { value: string; label: string }[];
  /** For number — display unit (e.g. "days", "miles", "$"). */
  unit?: string;
}

export const CATEGORY_META: Record<FieldCategory, { label: string; color: string }> = {
  demographic: { label: "Buyer profile", color: "#0891b2" },
  vehicle_interest: { label: "Vehicle interest", color: "#6366f1" },
  lead_source: { label: "Lead source", color: "#059669" },
  engagement: { label: "Engagement", color: "#dc2626" },
  lifecycle: { label: "Lifecycle", color: "#f59e0b" },
  intent: { label: "Intent signals", color: "#8b5cf6" },
  status: { label: "Status flags", color: "#374151" },
};

export const FIELD_LIBRARY: FieldDef[] = [
  /* Buyer profile */
  {
    id: "buyer_type",
    label: "Buyer type",
    category: "demographic",
    type: "select",
    operators: ["=", "!="],
    options: [
      { value: "first_time", label: "First-time buyer" },
      { value: "returning", label: "Returning customer" },
      { value: "fleet", label: "Fleet / Corporate" },
    ],
  },
  {
    id: "location_miles",
    label: "Distance from dealer",
    category: "demographic",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "miles",
  },
  {
    id: "zip_prefix",
    label: "ZIP prefix",
    category: "demographic",
    type: "text",
    operators: ["=", "!=", "contains"],
  },

  /* Vehicle interest */
  {
    id: "vehicle_interest",
    label: "Vehicle interest",
    category: "vehicle_interest",
    type: "multiselect",
    operators: ["in", "not_in"],
    options: [
      { value: "ev_hybrid", label: "EV / Hybrid" },
      { value: "suv", label: "SUV" },
      { value: "truck", label: "Truck" },
      { value: "sedan", label: "Sedan" },
      { value: "coupe", label: "Coupe" },
      { value: "luxury", label: "Luxury" },
    ],
  },
  {
    id: "price_range",
    label: "Price ceiling",
    category: "vehicle_interest",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "$",
  },
  {
    id: "specific_model",
    label: "Specific model mentioned",
    category: "vehicle_interest",
    type: "text",
    operators: ["contains", "="],
  },

  /* Lead source */
  {
    id: "lead_source",
    label: "Lead source",
    category: "lead_source",
    type: "multiselect",
    operators: ["in", "not_in"],
    options: [
      { value: "facebook", label: "Facebook" },
      { value: "google", label: "Google" },
      { value: "instagram", label: "Instagram" },
      { value: "cars_com", label: "Cars.com" },
      { value: "autotrader", label: "AutoTrader" },
      { value: "website", label: "Website / Web form" },
      { value: "walk_in", label: "Walk-in" },
      { value: "referral", label: "Referral" },
      { value: "phone", label: "Inbound phone" },
      { value: "email", label: "Email" },
    ],
  },

  /* Engagement */
  {
    id: "last_contact_days",
    label: "Last contact",
    category: "engagement",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "days",
  },
  {
    id: "website_visit_days",
    label: "Last website visit",
    category: "engagement",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "days",
  },
  {
    id: "email_engagement",
    label: "Email engagement",
    category: "engagement",
    type: "select",
    operators: ["=", "!="],
    options: [
      { value: "opened", label: "Opened last email" },
      { value: "clicked", label: "Clicked a link" },
      { value: "replied", label: "Replied" },
      { value: "none", label: "No engagement" },
    ],
  },
  {
    id: "engagement_score",
    label: "Engagement score",
    category: "engagement",
    type: "select",
    operators: ["=", "!="],
    options: [
      { value: "hot", label: "Hot" },
      { value: "warm", label: "Warm" },
      { value: "cold", label: "Cold" },
      { value: "dormant", label: "Dormant" },
    ],
  },
  {
    id: "conversation_count",
    label: "Total conversations",
    category: "engagement",
    type: "number",
    operators: ["=", "≤", "≥", "between"],
  },

  /* Lifecycle */
  {
    id: "lease_ends_days",
    label: "Lease ends in",
    category: "lifecycle",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "days",
  },
  {
    id: "service_due_days",
    label: "Service due in",
    category: "lifecycle",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "days",
  },
  {
    id: "warranty_expires_days",
    label: "Warranty expires in",
    category: "lifecycle",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "days",
  },
  {
    id: "last_purchase_days",
    label: "Last purchase",
    category: "lifecycle",
    type: "number",
    operators: ["≤", "≥", "between"],
    unit: "days",
  },
  {
    id: "appointment_status",
    label: "Appointment status",
    category: "lifecycle",
    type: "select",
    operators: ["=", "!="],
    options: [
      { value: "booked", label: "Booked" },
      { value: "no_show", label: "No-show" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "none", label: "Never booked" },
    ],
  },
  {
    id: "is_recall_eligible",
    label: "Recall eligible",
    category: "lifecycle",
    type: "bool",
    operators: ["="],
  },

  /* Intent signals */
  {
    id: "asked_about",
    label: "Asked about",
    category: "intent",
    type: "multiselect",
    operators: ["in", "not_in"],
    options: [
      { value: "trade_in", label: "Trade-in" },
      { value: "financing", label: "Financing" },
      { value: "discount", label: "Discount / incentive" },
      { value: "test_drive", label: "Test drive" },
      { value: "warranty", label: "Warranty" },
      { value: "specific_feature", label: "Specific feature" },
      { value: "lease_buyout", label: "Lease buyout" },
    ],
  },
  {
    id: "mentioned_competitor",
    label: "Mentioned competitor",
    category: "intent",
    type: "bool",
    operators: ["="],
  },

  /* Status flags */
  {
    id: "do_not_contact",
    label: "Do-not-contact flag",
    category: "status",
    type: "bool",
    operators: ["="],
  },
  {
    id: "has_active_campaign",
    label: "Currently in a campaign",
    category: "status",
    type: "bool",
    operators: ["="],
  },
];

export function findField(id: string): FieldDef | undefined {
  return FIELD_LIBRARY.find((f) => f.id === id);
}

export const OPERATOR_LABEL: Record<Operator, string> = {
  "=": "is",
  "!=": "is not",
  "in": "any of",
  "not_in": "none of",
  "contains": "contains",
  "≤": "≤",
  "≥": "≥",
  "between": "between",
};

/** Default value for a field — keeps inputs from rendering empty. */
export function defaultValueFor(field: FieldDef): string | string[] | number {
  if (field.type === "multiselect") return [];
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  if (field.type === "number") return 30;
  if (field.type === "bool") return "true";
  return "";
}
