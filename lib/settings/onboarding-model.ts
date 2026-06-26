// Onboarding model — regroups the existing converse-ai 15-step flow
// (apps/converse-ai/app/models/Onboarding.tsx + OnboardingTaskName from
// services/onboarding.service.ts) into the 3 Figma top-level steps.

/** Backend task names (cherry-picked from converse-ai onboarding.service.ts). */
export enum OnboardingTaskName {
  ROOFTOP_SETUP = 'RoofTop Setup',
  BRAND_REGISTRATION = 'CNAM Registration',
  USER_SETUP = 'User Setup',
  ROUTING_DIRECTORY = 'Employee Directory',
  AGENT_CUSTOMIZATION = 'Agent Customization',
  IMS_INTEGRATION = 'IMS Integration',
  CRM_INTEGRATION = 'CRM Integration',
  CAR_HISTORY_INTEGRATION = 'Vehicle History Integration',
  SERVICE_SCHEDULER_INTEGRATION = 'Service Scheduler',
  CONSENT_APPROVAL = 'Consent',
  COMPLIANCE_DOCUMENT_CHECK = 'Compliance Document',
  SPEED_TO_LEAD_CONFIGURATION = 'Speed To Lead',
  SMART_VIEW_SETUP = 'Smart View',
  AGENT_TESTING = 'Agent Testing',
  DEPLOY_AGENT = 'Deploy Agent',
}

export type TopStepId = 'general' | 'rooftop' | 'sales' | 'service';
export type AgentVariant = 'inbound' | 'outbound';
export type AgentType = 'sales' | 'service' | 'reception';

export interface SubStep {
  id: string;
  label: string;
  /** Backend task this sub-step maps to (for the onboarding tracker). */
  task?: OnboardingTaskName;
  /** True for action sub-steps (assign number, test, deploy) vs config forms. */
  action?: boolean;
  /** Agent sub-step that only applies to inbound call type (e.g. speed-to-lead). */
  inboundOnly?: boolean;
}

export interface TopStep {
  id: TopStepId;
  label: string;
  /** Whether this step has inbound/outbound agent variants. */
  hasAgentVariants: boolean;
  subSteps: SubStep[];
}

/** segmentName the backend expects, e.g. "inboundSales". Mirrors
 *  updateOnboardingTaskAPI: `${agentCallType}${Capitalize(agentType)}`. */
export function segmentName(agentCallType: AgentVariant, agentType: AgentType): string {
  return `${agentCallType}${agentType.charAt(0).toUpperCase()}${agentType.slice(1)}`;
}

const AGENT_SUBSTEPS: SubStep[] = [
  { id: 'agent-profile', label: 'Agent Persona & Voice', task: OnboardingTaskName.AGENT_CUSTOMIZATION },
  { id: 'first-message', label: 'First Message & Voicemail', task: OnboardingTaskName.AGENT_CUSTOMIZATION },
  { id: 'ims', label: 'Connect Inventory (IMS)', task: OnboardingTaskName.IMS_INTEGRATION },
  { id: 'crm', label: 'Connect CRM', task: OnboardingTaskName.CRM_INTEGRATION },
  { id: 'car-history', label: 'Vehicle History', task: OnboardingTaskName.CAR_HISTORY_INTEGRATION },
  { id: 'speed-to-lead', label: 'Speed to Lead', task: OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION },
  { id: 'phone', label: 'Assign Number', task: OnboardingTaskName.AGENT_CUSTOMIZATION, action: true },
  { id: 'chatbot', label: 'Website Chatbot', task: OnboardingTaskName.SMART_VIEW_SETUP },
  { id: 'voice-test', label: 'Voice Testing', task: OnboardingTaskName.AGENT_TESTING, action: true },
  { id: 'deploy', label: 'Deploy Agent', task: OnboardingTaskName.DEPLOY_AGENT, action: true },
];

export const ONBOARDING_MODEL: TopStep[] = [
  {
    id: 'rooftop',
    label: 'Rooftop Setup',
    hasAgentVariants: false,
    subSteps: [
      { id: 'profile', label: 'Rooftop Profile', task: OnboardingTaskName.ROOFTOP_SETUP },
      { id: 'caller-id', label: 'Caller ID (CNAM)', task: OnboardingTaskName.BRAND_REGISTRATION },
      { id: 'departments', label: 'Department Timings' },
      { id: 'team', label: 'Team & Directory', task: OnboardingTaskName.USER_SETUP },
      { id: 'preferences', label: 'Email & SMS Preferences' },
      { id: 'plan', label: 'Your Plan' },
      { id: 'review', label: 'Review & Send', action: true },
    ],
  },
  {
    id: 'sales',
    label: 'Sales Agent Setup',
    hasAgentVariants: true,
    subSteps: AGENT_SUBSTEPS,
  },
  {
    id: 'service',
    label: 'Service Agent Setup',
    hasAgentVariants: true,
    subSteps: [
      ...AGENT_SUBSTEPS.slice(0, 6),
      { id: 'service-scheduler', label: 'Service Scheduler', task: OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION },
      { id: 'service-facilities', label: 'Service Facilities' },
      { id: 'human-transfer', label: 'Human Transfer' },
      { id: 'consent', label: 'Consent & Compliance', task: OnboardingTaskName.CONSENT_APPROVAL },
      ...AGENT_SUBSTEPS.slice(6),
    ],
  },
];

export function getTopStep(id: TopStepId): TopStep {
  const step = ONBOARDING_MODEL.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown top step: ${id}`);
  return step;
}

export const TOP_STEP_ORDER: TopStepId[] = ['rooftop', 'sales', 'service'];

export function isValidTopStep(id: string): id is TopStepId {
  return TOP_STEP_ORDER.includes(id as TopStepId);
}

// ============================================================================
// 3-tier model (TopStep → Section → SubStep) for the restructured flow.
// General (common, once) / Sales / Service. Sales & Service each have a SHARED
// integrations section + per-agent (inbound/outbound) sub-flows.
// ============================================================================

export type SectionKind = 'flat' | 'shared' | 'agent';

export interface SectionTemplate {
  id: string;
  kind: SectionKind;
  /** Header label shown in the stepper (e.g. "Integrations"). Agent sections
   *  derive their per-call-type label at resolve time. */
  label?: string;
  subSteps: SubStep[];
}

export interface TopStepTemplate {
  id: TopStepId;
  label: string;
  agentType?: AgentType; // undefined for 'general'
  sections: SectionTemplate[];
}

const SALES_AGENT_SUBSTEPS: SubStep[] = [
  { id: 'persona', label: 'Agent Persona & Voice', task: OnboardingTaskName.AGENT_CUSTOMIZATION },
  { id: 'first-message', label: 'First Message & Voicemail', task: OnboardingTaskName.AGENT_CUSTOMIZATION },
  { id: 'speed-to-lead', label: 'Speed to Lead', task: OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION, inboundOnly: true },
  { id: 'smart-view', label: 'Smart View', task: OnboardingTaskName.SMART_VIEW_SETUP, inboundOnly: true },
  { id: 'voice-test', label: 'Voice Testing', task: OnboardingTaskName.AGENT_TESTING, action: true },
  { id: 'deploy', label: 'Deploy Agent', task: OnboardingTaskName.DEPLOY_AGENT, action: true },
];

const SERVICE_AGENT_SUBSTEPS: SubStep[] = [
  { id: 'persona', label: 'Agent Persona & Voice', task: OnboardingTaskName.AGENT_CUSTOMIZATION },
  { id: 'first-message', label: 'First Message & Voicemail', task: OnboardingTaskName.AGENT_CUSTOMIZATION },
  { id: 'service-facilities', label: 'Service Facilities' },
  { id: 'human-transfer', label: 'Human Transfer' },
  { id: 'voice-test', label: 'Voice Testing', task: OnboardingTaskName.AGENT_TESTING, action: true },
  { id: 'deploy', label: 'Deploy Agent', task: OnboardingTaskName.DEPLOY_AGENT, action: true },
];

export const ONBOARDING_TEMPLATES: TopStepTemplate[] = [
  {
    id: 'general',
    label: 'General Details',
    sections: [
      {
        id: 'general',
        kind: 'flat',
        subSteps: [
          { id: 'profile', label: 'Rooftop Profile', task: OnboardingTaskName.ROOFTOP_SETUP },
          { id: 'dept-details', label: 'Department Details & Hours' },
          { id: 'caller-id', label: 'Caller ID (CNAM)', task: OnboardingTaskName.BRAND_REGISTRATION },
          { id: 'users', label: 'Users & Directory', task: OnboardingTaskName.USER_SETUP },
          // Website Chatbot: rooftop-wide master toggle + common appearance settings;
          // when on, reveals Sales/Service sub-sections (URLs + entry suggestions) gated
          // by contracted inbound agents. Saved: common + per-inbound-segment. Last step.
          { id: 'chatbot', label: 'Website Chatbot' },
        ],
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales Agent Setup',
    agentType: 'sales',
    sections: [
      {
        id: 'sales-integrations',
        kind: 'shared',
        label: 'Integrations',
        subSteps: [
          { id: 'crm', label: 'Connect CRM', task: OnboardingTaskName.CRM_INTEGRATION },
          { id: 'ims', label: 'Connect Inventory (IMS)', task: OnboardingTaskName.IMS_INTEGRATION },
          { id: 'car-history', label: 'Vehicle History', task: OnboardingTaskName.CAR_HISTORY_INTEGRATION },
        ],
      },
      { id: 'sales-agent', kind: 'agent', subSteps: SALES_AGENT_SUBSTEPS },
    ],
  },
  {
    id: 'service',
    label: 'Service Agent Setup',
    agentType: 'service',
    sections: [
      {
        id: 'service-integrations',
        kind: 'shared',
        label: 'Integrations',
        subSteps: [
          { id: 'service-scheduler', label: 'Service Scheduler', task: OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION },
          { id: 'dms', label: 'DMS Integration' },
        ],
      },
      { id: 'service-agent', kind: 'agent', subSteps: SERVICE_AGENT_SUBSTEPS },
    ],
  },
];

export function getTemplate(id: TopStepId): TopStepTemplate | undefined {
  return ONBOARDING_TEMPLATES.find((t) => t.id === id);
}

/** A sub-step resolved for a concrete rooftop (with section + agent context). */
export interface ResolvedSubStep extends SubStep {
  key: string; // unique within the resolved top step (e.g. "sales-agent:inbound:persona")
  sectionId: string;
  sectionKind: SectionKind;
  sectionLabel?: string;
  isSectionStart: boolean;
  agentType?: AgentType;
  agentCallType?: AgentVariant;
  segment?: string; // segmentName(callType,type) for agent sub-steps
}

export interface ResolvedTopStep {
  id: TopStepId;
  label: string;
  subSteps: ResolvedSubStep[];
}

export const NEW_TOP_STEP_ORDER: TopStepId[] = ['general', 'sales', 'service'];

// ============================================================================
// Vini Settings flat model — the 8-screen IA approved 2026-06-16.
// Account / Studio AI (out of scope) / Integrations (Vini tab) / Vini AI.
// Each screen has its own route and is independently iframe-able.
// ============================================================================

export type SettingsGroupId = 'account' | 'studio' | 'integrations' | 'vini';

export type SettingsScreenId =
  | 'rooftop'
  | 'team'
  | 'departments'
  | 'studio-general'
  | 'studio-app'
  | 'studio-smart-campaigns'
  | 'studio-smart-match'
  | 'studio-smart-view'
  | 'integrations-vini'
  | 'vini-general'
  | 'telephony'
  | 'sales'
  | 'service'
  | 'reception'
  | 'chatbot';

export interface SettingsScreen {
  id: SettingsScreenId;
  label: string;
  route: string;
  group: SettingsGroupId;
  /** Backend tasks this screen contributes to (for the onboarding tracker). */
  tasks?: OnboardingTaskName[];
  /** Render only when the rooftop has this agent type contracted. */
  requiresAgent?: AgentType;
}

export interface SettingsGroup {
  id: SettingsGroupId;
  label: string;
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  { id: 'account', label: 'Account' },
  { id: 'studio', label: 'Studio AI' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'vini', label: 'Vini AI' },
];

export const VINI_SETTINGS_SCREENS: SettingsScreen[] = [
  // Account
  {
    id: 'rooftop',
    label: 'Rooftop Profile',
    route: '/max-2/settings/rooftop',
    group: 'account',
    tasks: [OnboardingTaskName.ROOFTOP_SETUP],
  },
  {
    id: 'team',
    label: 'Team & Directory',
    route: '/max-2/settings/team',
    group: 'account',
    tasks: [OnboardingTaskName.USER_SETUP],
  },
  {
    id: 'departments',
    label: 'Department Details',
    route: '/max-2/settings/departments',
    group: 'account',
  },

  // Studio AI — IA only here; screens render Coming Soon placeholders.
  // Real implementations live in Studio AI's onboarding app (different codebase).
  {
    id: 'studio-general',
    label: 'General',
    route: '/max-2/settings/studio/general',
    group: 'studio',
  },
  {
    id: 'studio-app',
    label: 'App',
    route: '/max-2/settings/studio/app',
    group: 'studio',
  },
  {
    id: 'studio-smart-campaigns',
    label: 'Smart Campaigns',
    route: '/max-2/settings/studio/smart-campaigns',
    group: 'studio',
  },
  {
    id: 'studio-smart-match',
    label: 'Smart Match',
    route: '/max-2/settings/studio/smart-match',
    group: 'studio',
  },
  {
    id: 'studio-smart-view',
    label: 'Smart View',
    route: '/max-2/settings/studio/smart-view',
    group: 'studio',
  },

  // Integrations (cross-product top-level; Studio tab lives in Studio's app)
  {
    id: 'integrations-vini',
    label: 'Integrations',
    route: '/max-2/settings/integrations/vini',
    group: 'integrations',
    tasks: [
      OnboardingTaskName.CRM_INTEGRATION,
      OnboardingTaskName.IMS_INTEGRATION,
      OnboardingTaskName.CAR_HISTORY_INTEGRATION,
      OnboardingTaskName.SERVICE_SCHEDULER_INTEGRATION,
    ],
  },

  // Vini AI
  {
    id: 'vini-general',
    label: 'General',
    route: '/max-2/settings/vini/general',
    group: 'vini',
  },
  {
    id: 'telephony',
    label: 'Telephony',
    route: '/max-2/settings/vini/telephony',
    group: 'vini',
    tasks: [OnboardingTaskName.BRAND_REGISTRATION],
  },
  {
    id: 'sales',
    label: 'Sales',
    route: '/max-2/settings/vini/sales',
    group: 'vini',
    requiresAgent: 'sales',
    tasks: [
      OnboardingTaskName.AGENT_CUSTOMIZATION,
      OnboardingTaskName.SPEED_TO_LEAD_CONFIGURATION,
      OnboardingTaskName.AGENT_TESTING,
      OnboardingTaskName.DEPLOY_AGENT,
    ],
  },
  {
    id: 'service',
    label: 'Service',
    route: '/max-2/settings/vini/service',
    group: 'vini',
    requiresAgent: 'service',
    tasks: [
      OnboardingTaskName.AGENT_CUSTOMIZATION,
      OnboardingTaskName.CONSENT_APPROVAL,
      OnboardingTaskName.AGENT_TESTING,
      OnboardingTaskName.DEPLOY_AGENT,
    ],
  },
  {
    id: 'reception',
    label: 'Reception',
    route: '/max-2/settings/vini/reception',
    group: 'vini',
    requiresAgent: 'reception',
  },
  {
    id: 'chatbot',
    label: 'Chatbot',
    route: '/max-2/settings/vini/chatbot',
    group: 'vini',
    tasks: [OnboardingTaskName.SMART_VIEW_SETUP],
  },
];

