import type {
  AudienceFilter,
  CampaignCategory,
  CampaignSubType,
  RecurringFrequency,
} from "./data";
import type { ParsedAudience } from "./audience-parser";
import type { AgentScript } from "./agent-script-generator";

export interface CampaignSchedule {
  startDate: string;
  endDate: string;
  callingHoursStart: string;
  callingHoursEnd: string;
  timezone: string;
}

export interface CampaignCadence {
  maxAttempts: number;
  retryDelayHours: number;
  followUpDelayHours: number;
  confirmationLeadHours: number;
}

export interface NewCampaignDraft {
  name: string;
  category: CampaignCategory;
  subType: CampaignSubType;
  agentId: string;
  isRecurring: boolean;
  recurringFrequency: RecurringFrequency;
  selectedSegments: string[];
  customFilters: AudienceFilter[];
  useCaseId: string;
  /** Natural-language description of the audience. */
  audiencePrompt: string;
  /** Parsed INCLUDE/EXCLUDE filter tree built from the audience prompt. */
  parsedAudience: ParsedAudience | null;
  /** Natural-language description of what the agent should say. */
  scriptPrompt: string;
  /** Generated talking points + must-do / must-not-do. */
  agentScript: AgentScript | null;
  schedule: CampaignSchedule;
  cadence: CampaignCadence;
  contactsFileName: string;
  contactsCount: number;
  successCriteria: string;
  autoRemoveOnOutcome: boolean;
}

export const DEFAULT_DRAFT: NewCampaignDraft = {
  name: "",
  category: "",
  subType: "",
  agentId: "",
  isRecurring: false,
  recurringFrequency: "weekly",
  selectedSegments: [],
  customFilters: [],
  useCaseId: "",
  audiencePrompt: "",
  parsedAudience: null,
  scriptPrompt: "",
  agentScript: null,
  schedule: {
    startDate: "",
    endDate: "",
    callingHoursStart: "09:00",
    callingHoursEnd: "17:00",
    timezone: "America/Chicago",
  },
  cadence: {
    maxAttempts: 3,
    retryDelayHours: 24,
    followUpDelayHours: 48,
    confirmationLeadHours: 24,
  },
  contactsFileName: "",
  contactsCount: 0,
  successCriteria: "",
  autoRemoveOnOutcome: true,
};
