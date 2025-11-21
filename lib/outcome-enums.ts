/**
 * Outcome enums based on agent type
 * These enums define the possible outcomes for calls based on the agent type (sales or service)
 */

// Allowed enums for service calls
export const serviceOutcomeEnums = [
  "Service Appointment Booked",
  "Service Appointment Rescheduled",
  "Service Appointment Cancelled",
  "Connect with Service Team",
  "Engaged – Needs Reconnect",
  "Follow-Up Required",
  "Drop Off/Pickup Info Shared",
  "Loaner Info Shared",
  "General Information Shared",
  "Transferred to Human",
  "No Empty Slots",
  "Call Disconnected",
  "Call Aborted"
] as const

// Allowed enums for sales calls
export const salesOutcomeEnums = [
  "Vehicle Availability Inquiry",
  "Schedule Test Drive",
  "Reschedule Test Drive",
  "Cancel Test Drive",
  "Request Vehicle Information",
  "Request Price/Quote",
  "Financing/Leasing Inquiry",
  "Trade-in Inquiry",
  "Promotions/Incentives Inquiry",
  "Inventory/Brochure Request",
  "Salesperson/Manager Request",
  "Appointment for Purchase Discussion",
  "Check Order/Delivery Status",
  "Extended Warranty/Protection Plan Inquiry",
  "Insurance/Registration Assistance Inquiry",
  "Operating Hours/Location Inquiry",
  "General Sales Inquiry"
] as const

/**
 * Get available outcomes based on agent type
 * @param agentType - The selected agent type ('sales', 'service', or 'all')
 * @returns Array of outcome strings based on the agent type
 */
export function getOutcomesByAgentType(agentType: string): string[] {
  if (agentType === 'sales') {
    return [...salesOutcomeEnums]
  } else if (agentType === 'service') {
    return [...serviceOutcomeEnums]
  } else {
    // If 'all' is selected, show both sales and service outcomes
    return [...salesOutcomeEnums, ...serviceOutcomeEnums]
  }
}

