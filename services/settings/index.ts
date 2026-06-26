// API seam — UI imports only `api`. Mock by default; flip NEXT_PUBLIC_API_MODE=live
// to use the cherry-picked converse-ai services (wired per-domain as contracts land).

import { delay, readMock, writeMock } from './mock-store';
import type {
  CallerIdConfig,
  DepartmentConfig,
  HolidayConfig,
  Preferences,
  PlanInfo,
  RooftopProfile,
  TeamMember,
  AgentPersona,
  Voice,
  Avatar,
  IntegrationPartner,
  ImsConfig,
  CrmConfig,
  LeadSource,
  LeadSourceGroup,
  SpeedToLead,
  PhoneAssignment,
  VoiceTestResult,
  ChatbotConfig,
} from './types';
import type { SalesPolicies } from '@/types/settings/sales-policies';
import type { ServicePolicies } from '@/types/settings/service-policies';
import type { ViniGeneralConfig } from '@/types/settings/vini-general-config';
import {
  autofillDepartmentsAPI,
  fetchDepartmentsConfigAPI,
  fetchRooftopProfileAPI,
  saveDepartmentsConfigAPI,
  updateRooftopTimezoneAPI,
} from './vini-config.service';
import type { FetchRooftopProfileResponse } from './vini-config.service';
import {
  fetchAgentConfigAPI,
  saveAgentConfigAPI,
} from './agent-config.service';
import {
  apiToUi as stlApiToUi,
  buildFullPayload as stlBuildFullPayload,
  diffBlocks as stlDiffBlocks,
  extractReachOutBlock,
  groupsFromStlConfig,
  hasBlockChanges as stlHasBlockChanges,
} from '@/lib/settings/adapters/stl-follow-up-adapter';
import type { ViniDepartmentsConfigResponse } from '@/types/settings/vini-departments-api';
import {
  buildSavePayload,
  mapApiResponseToDepartments,
  mapApiResponseToHolidays,
} from '@/lib/settings/adapters/departments-adapter';
import {
  buildAgentConfigSalesPoliciesPayload,
  extractSalesPoliciesFromAgentConfig,
} from '@/lib/settings/adapters/sales-policies-adapter';
import {
  buildAgentConfigIgnoreAniPayload,
  extractIgnoreAniFromAgentConfig,
} from '@/lib/settings/adapters/ignore-ani-adapter';
import { getConsoleContext } from '@/lib/settings/bridge/context-store';
import { isDeptReady } from '@/lib/settings/dept-validation';

export interface OnboardingApi {
  rooftop: {
    getProfile(): Promise<RooftopProfile>;
    saveProfile(dto: RooftopProfile, status?: 'draft' | 'published'): Promise<RooftopProfile>;
    /** Single-field upsert — POSTs only the new timezone (no full rooftop blob).
     *  teamName is required by the backend as a top-level identifier; pass
     *  through the value loaded by getProfile (never user-edited). */
    saveTimezone(timezone: string, teamName: string): Promise<{ success: boolean; message?: string }>;
  };
  callerId: {
    get(): Promise<CallerIdConfig>;
    save(dto: CallerIdConfig): Promise<CallerIdConfig>;
  };
  departments: {
    list(): Promise<DepartmentConfig[]>;
    save(dto: DepartmentConfig[]): Promise<DepartmentConfig[]>;
  };
  holidays: {
    list(): Promise<HolidayConfig[]>;
    save(dto: HolidayConfig[]): Promise<HolidayConfig[]>;
  };
  /** Combined upsert for departments + holidays — one POST per save. */
  viniConfig: {
    save(input: { departments: DepartmentConfig[]; holidays: HolidayConfig[] }): Promise<{
      success: boolean;
      message?: string;
    }>;
    /** Scrape the dealership's website and return a populated form state.
     *  Does NOT persist to the backend — caller must trigger save() after. */
    autofill(website: string): Promise<{
      success: boolean;
      message?: string;
      departments?: DepartmentConfig[];
      holidays?: HolidayConfig[];
    }>;
  };
  team: {
    list(): Promise<TeamMember[]>;
    invite(member: Omit<TeamMember, 'id' | 'status'>): Promise<TeamMember>;
  };
  preferences: {
    get(): Promise<Preferences>;
    save(dto: Preferences): Promise<Preferences>;
  };
  plan: {
    get(): Promise<PlanInfo>;
  };
  review: {
    sendConfirmationEmail(): Promise<{ sent: boolean }>;
  };
  // ---- Agent setup (segment = e.g. "inboundSales") ----
  agent: {
    getPersona(segment: string): Promise<AgentPersona>;
    savePersona(segment: string, dto: AgentPersona): Promise<AgentPersona>;
    listVoices(): Promise<Voice[]>;
    listAvatars(): Promise<Avatar[]>;
  };
  integrations: {
    listPartners(kind: 'ims' | 'crm'): Promise<IntegrationPartner[]>;
    getIms(segment: string): Promise<ImsConfig>;
    saveIms(segment: string, dto: ImsConfig): Promise<ImsConfig>;
    syncIms(segment: string): Promise<ImsConfig>;
    getCrm(segment: string): Promise<CrmConfig>;
    saveCrm(segment: string, dto: CrmConfig): Promise<CrmConfig>;
    syncCrm(segment: string): Promise<CrmConfig>;
  };
  speedToLead: {
    listSources(): Promise<LeadSource[]>;
    listSourceGroups(): Promise<LeadSourceGroup[]>;
    get(segment: string): Promise<SpeedToLead>;
    /** Save the STL config. When `previous` is supplied the service diffs
     *  block-by-block and only POSTs the blocks that actually changed —
     *  the backend treats omitted blocks as "preserve existing". `groups`
     *  is the master list used to expand `sources[]` into the per-group
     *  `speedToLeadSources` payload shape. */
    save(
      segment: string,
      dto: SpeedToLead,
      options?: {
        previous?: SpeedToLead | null;
        groups?: LeadSourceGroup[];
      }
    ): Promise<{ success: boolean; message?: string; saved?: SpeedToLead }>;
  };
  phone: {
    get(segment: string): Promise<PhoneAssignment>;
    assign(segment: string, areaCode: string): Promise<PhoneAssignment>;
  };
  voiceTest: {
    run(segment: string): Promise<VoiceTestResult>;
    get(segment: string): Promise<VoiceTestResult | null>;
  };
  chatbot: {
    get(segment: string): Promise<ChatbotConfig>;
    save(segment: string, dto: ChatbotConfig): Promise<ChatbotConfig>;
  };
  /** Per-rooftop sales-agent policy facts (dealership-configs-prd.md +
   *  RETCONVAI-2535 payment estimates). NOT keyed by segment — these are
   *  rooftop-wide facts the sales agent reads at runtime. */
  salesPolicies: {
    get(): Promise<SalesPolicies>;
    save(dto: SalesPolicies): Promise<SalesPolicies>;
  };
  /** Per-rooftop service-agent policy facts (after-hours drop-off, service
   *  capabilities). */
  servicePolicies: {
    get(): Promise<ServicePolicies>;
    save(dto: ServicePolicies): Promise<ServicePolicies>;
  };
  /** Rooftop-wide Vini AI behavior that isn't agent-specific (e.g. ask for
   *  mobile when caller-ID matches configured numbers). */
  viniGeneral: {
    get(): Promise<ViniGeneralConfig>;
    save(dto: ViniGeneralConfig): Promise<ViniGeneralConfig>;
  };
}

const defaultProfile: RooftopProfile = {
  rooftopName: 'Marina Ford of San Leandro',
  websiteUrl: 'https://www.marinaford.com',
  rooftopAddress: '1100 Marina Blvd, San Leandro, CA 94577',
  timezone: 'America/Los_Angeles',
  region: 'West',
  dealerType: 'Franchise',
  vehicleType: { new: true, preOwned: true },
};

const defaultCallerId: CallerIdConfig = {
  ein: '',
  legalBusinessName: 'Marina Ford LLC',
  businessClassification: 'Private',
  areaCode: '510',
  authorizedReps: [],
};

function defaultOperatingHours() {
  const day = (open: boolean) => ({
    isAvailable: open,
    startTime: '09:00',
    endTime: '18:00',
    isTransferAvailable: open,
  });
  return {
    monday: day(true),
    tuesday: day(true),
    wednesday: day(true),
    thursday: day(true),
    friday: day(true),
    saturday: day(true),
    sunday: day(false),
  };
}

const defaultDepartments: DepartmentConfig[] = [
  { id: 'sales',   kind: 'sales',   name: 'Sales',   isCustom: false, countryCode: '+1', phone: '510-555-0101', operatingHours: defaultOperatingHours() },
  { id: 'service', kind: 'service', name: 'Service', isCustom: false, countryCode: '+1', phone: '510-555-0102', operatingHours: defaultOperatingHours(), addressInheritFrom: 'sales' },
  { id: 'parts',   kind: 'parts',   name: 'Parts',   isCustom: false, countryCode: '+1', phone: '510-555-0103', operatingHours: defaultOperatingHours(), addressInheritFrom: 'sales' },
  { id: 'finance', kind: 'finance', name: 'Finance', isCustom: false, countryCode: '+1', phone: '510-555-0104', operatingHours: defaultOperatingHours(), addressInheritFrom: 'sales' },
];

const defaultHolidays: HolidayConfig[] = [];

const defaultTeam: TeamMember[] = [
  { id: 'u1', name: 'Rohit Kalange', email: 'rohit@marinaford.com', designation: 'Sales Representative', status: 'active' },
  { id: 'u2', name: 'Ava Smith', email: 'ava@marinaford.com', designation: 'Marketing Manager', status: 'active' },
  { id: 'u3', name: 'Maya Kumar', email: 'maya@marinaford.com', designation: 'Service Manager', status: 'invited' },
];

const defaultPreferences: Preferences = {
  emailDailySummary: true,
  emailPostCall: true,
  emailCampaigns: false,
  smsPostCall: false,
};

const defaultPlan: PlanInfo = {
  contractId: 'XYZ12345',
  planName: 'Vini Pro',
  agents: ['Sales Agent', 'Service Agent'],
  addOns: ['CNAM', 'SmartView', 'Speed-to-Lead', 'Analytics'],
};

const defaultPersona: AgentPersona = {
  name: 'Mike',
  gender: 'male',
  languages: ['English'],
  tone: 'professional',
  customPrompt: '',
  voiceId: 'v-british-1',
  avatarId: 'av-male-1',
  firstMessage:
    "Hi, thanks for calling Rochester Toyota! This is Mike. How can I help you today?",
  voicemail:
    "You've reached Rochester Toyota. We're sorry we missed you — leave your name and number and we'll call you right back.",
  areaCode: '510',
};

const VOICES: Voice[] = [
  { id: 'v-british-1', name: 'James', descriptor: 'Male · British accent', languages: ['English'] },
  { id: 'v-british-2', name: 'Oliver', descriptor: 'Male · British accent · Multilingual', languages: ['English', 'Spanish', 'French'] },
  { id: 'v-us-1', name: 'Emma', descriptor: 'Female · American (Texas)', languages: ['English'] },
  { id: 'v-us-2', name: 'Sophia', descriptor: 'Female · American accent · Multilingual', languages: ['English', 'Spanish'] },
  { id: 'v-es-1', name: 'Lucia', descriptor: 'Female · Castilian Spanish', languages: ['Spanish'] },
  { id: 'v-fr-1', name: 'Camille', descriptor: 'Female · Parisian French', languages: ['French'] },
];

const AVATARS: Avatar[] = [
  { id: 'av-male-1', name: 'Mason', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mason&backgroundColor=b6e3f4', gender: 'male', languages: ['English', 'Spanish'] },
  { id: 'av-male-2', name: 'Liam', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liam&backgroundColor=ffdfbf', gender: 'male', languages: ['English'] },
  { id: 'av-male-3', name: 'Diego', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego&backgroundColor=ffd5dc', gender: 'male', languages: ['Spanish', 'English'] },
  { id: 'av-female-1', name: 'Ava', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ava&backgroundColor=d1d4f9', gender: 'female', languages: ['English'] },
  { id: 'av-female-2', name: 'Mia', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia&backgroundColor=c0aede', gender: 'female', languages: ['English', 'French'] },
  { id: 'av-female-3', name: 'Sofia', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=ffd5dc', gender: 'female', languages: ['Spanish', 'English'] },
  { id: 'av-neutral-1', name: 'Sage', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sage&backgroundColor=c0aede', gender: 'neutral', languages: ['English', 'Spanish', 'French'] },
];

const IMS_PARTNERS: IntegrationPartner[] = [
  { id: 'cox', name: 'Cox Automotive' },
  { id: 'cdk', name: 'CDK Global' },
  { id: 'dealercentre', name: 'DealerCentre' },
  { id: 'vincue', name: 'VinCue' },
];

const CRM_PARTNERS: IntegrationPartner[] = [
  { id: 'vinsolutions', name: 'VinSolutions' },
  { id: 'dealersocket', name: 'DealerSocket' },
  { id: 'elead', name: 'eLead CRM' },
];

const LEAD_SOURCE_GROUPS: LeadSourceGroup[] = [
  {
    id: 'campaigns',
    label: 'Campaigns',
    sources: [
      { id: 'gm-financial', name: 'GM Financial' },
      { id: 'equity-mining', name: 'Equity Mining' },
      { id: 'data-analysis', name: 'Data Analysis' },
      { id: 'user-engagement', name: 'User Engagement' },
      { id: 'market-segmentation', name: 'Market Segmentation' },
      { id: 'performance-metrics', name: 'Performance Metrics' },
      { id: 'product-optimization', name: 'Product Optimization' },
    ],
  },
  {
    id: 'internet-up',
    label: 'Internet Up',
    sources: [
      { id: 'autotrader', name: 'AutoTrader' },
      { id: 'cars-com', name: 'Cars.com' },
      { id: 'cargurus', name: 'CarGurus' },
      { id: 'dealer-website', name: 'Dealer Website' },
      { id: 'truecar', name: 'TrueCar' },
      { id: 'edmunds', name: 'Edmunds' },
      { id: 'kbb', name: 'KBB' },
    ],
  },
  {
    id: 'phone-up',
    label: 'Phone Up',
    sources: [
      { id: 'inbound-call', name: 'Inbound Call' },
      { id: 'callback-request', name: 'Callback Request' },
      { id: 'missed-call', name: 'Missed Call' },
    ],
  },
  {
    id: 'showroom-up',
    label: 'Showroom Up',
    sources: [
      { id: 'walk-in', name: 'Walk-in' },
      { id: 'appointment', name: 'Showroom Appointment' },
      { id: 'event', name: 'Event Visitor' },
    ],
  },
];

const LEAD_SOURCES: LeadSource[] = LEAD_SOURCE_GROUPS.flatMap((g) => g.sources);

// ---------------------------------------------------------------------------
// Departments + holidays — shared GET against the central-config API.
// ---------------------------------------------------------------------------
//
// The endpoint returns both lists in one envelope. departments.list() and
// holidays.list() are called separately by the form, so we memoise the
// in-flight promise to dedupe to a single network request. The cache is
// cleared on save() so the next read reflects the write.
//
// Tenancy IDs come from the bridge context — the parent can pass them either
// via the iframe URL (`?enterpriseId=…&teamId=…`) or postMessage. In
// standalone dev without overrides, the stub context's IDs are used.
function getDepartmentsTenancy(): { enterpriseId: string; teamId: string } | null {
  const ctx = getConsoleContext();
  if (!ctx?.enterpriseId || !ctx?.teamId) return null;
  return { enterpriseId: ctx.enterpriseId, teamId: ctx.teamId };
}

let viniDepartmentsRequest: Promise<ViniDepartmentsConfigResponse> | null = null;
let viniDepartmentsRequestKey: string | null = null;

function loadViniDepartmentsConfig(): Promise<ViniDepartmentsConfigResponse> {
  const tenancy = getDepartmentsTenancy();
  if (!tenancy) {
    // Bridge hasn't hydrated yet — return an empty payload so callers fall
    // back to mock. Don't cache; the next call retries once context lands.
    return Promise.resolve({} as ViniDepartmentsConfigResponse);
  }
  const key = `${tenancy.enterpriseId}:${tenancy.teamId}`;
  if (!viniDepartmentsRequest || viniDepartmentsRequestKey !== key) {
    viniDepartmentsRequestKey = key;
    viniDepartmentsRequest = fetchDepartmentsConfigAPI(tenancy).catch((err) => {
      // Drop the cached failure so the next retry actually re-fetches.
      // Errors propagate to the caller (the form) so it can render an error
      // state + retry button — we used to swallow these and silently fall
      // back to mock data, which hid real outages from the operator.
      viniDepartmentsRequest = null;
      viniDepartmentsRequestKey = null;
      // eslint-disable-next-line no-console
      console.warn('[vini-config] departments GET failed', err);
      throw err;
    });
  }
  return viniDepartmentsRequest;
}

function invalidateViniDepartmentsCache() {
  viniDepartmentsRequest = null;
  viniDepartmentsRequestKey = null;
}

// In-flight promise memoization for the rooftop profile GET, same pattern as
// loadViniDepartmentsConfig above. Without this, React strict-mode's double
// effect invocation (and the form's Promise.all alongside other consumers)
// fires the same get-team-details request twice. The cached promise is
// shared by concurrent callers and cleared on failure / explicit invalidation.
let rooftopProfileRequest: Promise<FetchRooftopProfileResponse> | null = null;
let rooftopProfileRequestKey: string | null = null;

function loadRooftopProfile(teamId: string): Promise<FetchRooftopProfileResponse> {
  if (!rooftopProfileRequest || rooftopProfileRequestKey !== teamId) {
    rooftopProfileRequestKey = teamId;
    rooftopProfileRequest = fetchRooftopProfileAPI(teamId).catch((err) => {
      rooftopProfileRequest = null;
      rooftopProfileRequestKey = null;
      // eslint-disable-next-line no-console
      console.warn('[rooftop] profile GET failed', err);
      throw err;
    });
  }
  return rooftopProfileRequest;
}

function invalidateRooftopProfileCache() {
  rooftopProfileRequest = null;
  rooftopProfileRequestKey = null;
}

// In-flight memoization for the agent-config endpoint. Same rationale as
// loadViniDepartmentsConfig: React strict-mode double effects + the form
// reading config + listing source groups together would otherwise fire the
// GET twice. Cleared on save() so the next read reflects the write.
let agentConfigRequest: Promise<Awaited<ReturnType<typeof fetchAgentConfigAPI>>> | null = null;
let agentConfigRequestKey: string | null = null;

function loadAgentConfig(tenancy: { enterpriseId: string; teamId: string }) {
  const key = `${tenancy.enterpriseId}:${tenancy.teamId}`;
  if (!agentConfigRequest || agentConfigRequestKey !== key) {
    agentConfigRequestKey = key;
    agentConfigRequest = fetchAgentConfigAPI(tenancy).catch((err) => {
      agentConfigRequest = null;
      agentConfigRequestKey = null;
      // eslint-disable-next-line no-console
      console.warn('[agent-config] GET failed', err);
      throw err;
    });
  }
  return agentConfigRequest;
}

function invalidateAgentConfigCache() {
  agentConfigRequest = null;
  agentConfigRequestKey = null;
}

const mockApi: OnboardingApi = {
  rooftop: {
    async getProfile() {
      // Match the departments+holidays pattern: when tenancy is known, always
      // hit the live backend (regardless of NEXT_PUBLIC_API_MODE) and surface
      // errors. No silent mock fallback — a backend outage should reach the
      // form's LoadErrorState, not be papered over with stale defaults.
      //
      // The mock branch only handles the "no tenancy" case (pre-bridge-hydration
      // or pure standalone dev preview).
      const tenancy = getDepartmentsTenancy();
      if (tenancy?.teamId) {
        // In-flight memoized — strict-mode double effects collapse to one GET.
        const resp = await loadRooftopProfile(tenancy.teamId);
        const team = resp?.data?.team;
        const current = readMock('rooftop.profile', defaultProfile);
        const merged: RooftopProfile = {
          ...current,
          timezone: team?.timeZone || current.timezone,
          region: team?.regionType || current.region,
          websiteUrl: team?.websiteLink || current.websiteUrl,
          dealerType: team?.teamType || current.dealerType,
          rooftopName: team?.teamName || current.rooftopName,
        };
        writeMock('rooftop.profile', merged);
        return merged;
      }
      await delay();
      return readMock('rooftop.profile', defaultProfile);
    },
    async saveProfile(dto) {
      await delay(200);
      return writeMock('rooftop.profile', dto);
    },
    async saveTimezone(timezone, teamName) {
      // Always mirror to local storage so reloads stay consistent even if the
      // backend rejects the partial payload.
      const current = readMock('rooftop.profile', defaultProfile);
      writeMock('rooftop.profile', { ...current, timezone });

      // Partial POST — fires whenever tenancy is known (no API_MODE gate; the
      // departments save uses the same always-live pattern via forceLive at
      // the http layer). The body intentionally omits every other rooftop
      // field; if the backend rejects it with "required field missing",
      // coordinate with the backend team to support a partial upsert on
      // update-rooftop-data.
      const tenancy = getDepartmentsTenancy();
      if (!tenancy) {
        return { success: true };
      }
      try {
        await updateRooftopTimezoneAPI({
          enterpriseId: tenancy.enterpriseId,
          teamId: tenancy.teamId,
          teamName,
          timezone,
        });
        // Drop the cached profile so the next getProfile re-fetches the
        // canonical server value (which now includes the new timeZone).
        invalidateRooftopProfileCache();
        return { success: true };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[rooftop] saveTimezone failed', err);
        const data = (err as { data?: unknown })?.data;
        let message = (err as Error)?.message;
        if (data && typeof data === 'object') {
          const d = data as { message?: string; errors?: Array<{ message?: string; path?: unknown[] }> };
          const first = d.errors?.[0];
          if (first?.message) {
            const path = Array.isArray(first.path) ? first.path.join('.') : '';
            message = path ? `${first.message} (${path})` : first.message;
          } else if (d.message) {
            message = d.message;
          }
        }
        return { success: false, message };
      }
    },
  },
  callerId: {
    async get() {
      await delay();
      return readMock('rooftop.callerId', defaultCallerId);
    },
    async save(dto) {
      await delay(200);
      return writeMock('rooftop.callerId', dto);
    },
  },
  departments: {
    async list() {
      try {
        // Any successful response wins — even an empty one. The adapter
        // synthesises the 4 default kinds when the API returns nothing,
        // which is the right "this tenancy has no data yet" experience.
        // Falling back to localStorage on empty success would leak the
        // PREVIOUS tenancy's data when the operator switches enterpriseId.
        const resp = await loadViniDepartmentsConfig();
        return mapApiResponseToDepartments(resp);
      } catch {
        // Genuine failure (network / 4xx / 5xx) — fall back to local mock
        // so dev continues to work offline. Mock isn't tenancy-keyed; this
        // is a degraded experience the operator can recover from.
        await delay();
        return readMock('rooftop.departments.v5', defaultDepartments);
      }
    },
    async save(dto) {
      // Local-only persistence — the real upsert goes through
      // viniConfig.save which fires one POST for departments + holidays
      // together. We still write to mock as a safety net so reloads keep
      // unsaved work-in-progress visible.
      await delay(200);
      invalidateViniDepartmentsCache();
      return writeMock('rooftop.departments.v5', dto);
    },
  },
  holidays: {
    async list() {
      try {
        // Same rule as departments.list — empty success returns []; only
        // genuine failures fall back to the local mock.
        const resp = await loadViniDepartmentsConfig();
        return mapApiResponseToHolidays(resp);
      } catch {
        await delay();
        return readMock('rooftop.holidays.v1', defaultHolidays);
      }
    },
    async save(dto) {
      await delay(200);
      invalidateViniDepartmentsCache();
      return writeMock('rooftop.holidays.v1', dto);
    },
  },
  viniConfig: {
    async save({ departments, holidays }) {
      const tenancy = getDepartmentsTenancy();
      if (!tenancy) {
        // No tenancy — fall back to mock writes so the UI still functions
        // (e.g. when running pre-bridge-hydration). The next list() will
        // refetch once tenancy lands.
        writeMock('rooftop.departments.v5', departments);
        writeMock('rooftop.holidays.v1', holidays);
        return { success: false, message: 'No tenancy available' };
      }
      // Drop incomplete depts (e.g. an auto-synthesized finance with no phone)
      // so the backend doesn't 4xx with `Required (departments.X.contact.phone)`.
      // The form gates the optional fields on these depts behind a hover
      // tooltip — the operator can fill mandatory fields whenever they want
      // and the dept will start being sent.
      const sendableDepts = departments.filter(isDeptReady);
      const payload = buildSavePayload({
        enterpriseId: tenancy.enterpriseId,
        teamId: tenancy.teamId,
        departments: sendableDepts,
        holidays,
      });
      try {
        await saveDepartmentsConfigAPI(payload);
        // Persist locally too so a reload doesn't flicker stale data while
        // the GET refetch is in flight.
        writeMock('rooftop.departments.v5', departments);
        writeMock('rooftop.holidays.v1', holidays);
        // Invalidate so the next departments.list() / holidays.list()
        // refetches the canonical server state.
        invalidateViniDepartmentsCache();
        return { success: true };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[vini-config] save failed', err);
        // Backend returns { success:false, message:"Validation error",
        // errors:[{path, message}] } on 4xx. Pull the most specific message
        // we can find so the user sees what to fix.
        const data = (err as { data?: unknown })?.data;
        let message = (err as Error)?.message;
        if (data && typeof data === 'object') {
          const d = data as { message?: string; errors?: Array<{ message?: string; path?: unknown[] }> };
          const first = d.errors?.[0];
          if (first?.message) {
            const path = Array.isArray(first.path) ? first.path.join('.') : '';
            message = path ? `${first.message} (${path})` : first.message;
          } else if (d.message) {
            message = d.message;
          }
        }
        return { success: false, message };
      }
    },
    async autofill(website) {
      const tenancy = getDepartmentsTenancy();
      if (!tenancy) {
        // The autofill call itself doesn't carry tenancy on the wire (the
        // backend resolves it from the auth token), but the form is useless
        // without a hydrated bridge — bail loudly rather than scrape into a
        // session that's about to switch.
        return { success: false, message: 'No tenancy available' };
      }
      try {
        const resp = await autofillDepartmentsAPI(website);
        return {
          success: true,
          departments: mapApiResponseToDepartments(resp),
          holidays: mapApiResponseToHolidays(resp),
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[vini-config] autofill failed', err);
        // Mirror viniConfig.save's error extraction so a structured backend
        // error reaches the banner instead of a generic "Request failed".
        const data = (err as { data?: unknown })?.data;
        let message = (err as Error)?.message;
        if (data && typeof data === 'object') {
          const d = data as { message?: string; errors?: Array<{ message?: string; path?: unknown[] }> };
          const first = d.errors?.[0];
          if (first?.message) {
            const path = Array.isArray(first.path) ? first.path.join('.') : '';
            message = path ? `${first.message} (${path})` : first.message;
          } else if (d.message) {
            message = d.message;
          }
        }
        return { success: false, message };
      }
    },
  },
  team: {
    async list() {
      await delay();
      return readMock('rooftop.team', defaultTeam);
    },
    async invite(member) {
      await delay(200);
      const list = readMock('rooftop.team', defaultTeam);
      const created: TeamMember = { ...member, id: `u${Date.now()}`, status: 'invited' };
      return writeMock('rooftop.team', [...list, created]) && created;
    },
  },
  preferences: {
    async get() {
      await delay();
      return readMock('rooftop.preferences', defaultPreferences);
    },
    async save(dto) {
      await delay(200);
      return writeMock('rooftop.preferences', dto);
    },
  },
  plan: {
    async get() {
      await delay();
      return defaultPlan;
    },
  },
  review: {
    async sendConfirmationEmail() {
      await delay(500);
      return { sent: true };
    },
  },
  agent: {
    async getPersona(segment) {
      await delay();
      // Inbound segments ship with a seeded "Mike" persona; outbound starts empty
      // so the Agents list can show the "Set up agent" empty state for first-time users.
      const seeded = segment.startsWith('inbound');
      const fallback: AgentPersona = seeded
        ? defaultPersona
        : { name: '', gender: 'male', languages: [], tone: 'professional', customPrompt: '', voiceId: '', avatarId: '', firstMessage: '', voicemail: '', areaCode: '' };
      return readMock(`agent.persona.${segment}`, fallback);
    },
    async savePersona(segment, dto) {
      await delay(200);
      const saved = writeMock(`agent.persona.${segment}`, dto);
      // Backend-issued phone: if the operator provided an area code and we
      // haven't issued a number for this segment (or they changed the area
      // code), issue one now and persist it.
      if (dto.areaCode) {
        const existing = readMock<PhoneAssignment>(`agent.phone.${segment}`, { areaCode: '', number: null });
        if (!existing.number || existing.areaCode !== dto.areaCode) {
          const number = `+1 (${dto.areaCode}) 555-${Math.floor(1000 + (dto.areaCode.charCodeAt(0) * 7) % 9000)}`;
          writeMock(`agent.phone.${segment}`, { areaCode: dto.areaCode, number });
        }
      }
      return saved;
    },
    async listVoices() {
      await delay(150);
      return VOICES;
    },
    async listAvatars() {
      await delay(150);
      return AVATARS;
    },
  },
  integrations: {
    async listPartners(kind) {
      await delay(150);
      return kind === 'ims' ? IMS_PARTNERS : CRM_PARTNERS;
    },
    async getIms(segment) {
      await delay();
      return readMock(`agent.ims.${segment}`, { provider: '', dealerId: '', status: 'not_connected' } as ImsConfig);
    },
    async saveIms(segment, dto) {
      await delay(200);
      return writeMock(`agent.ims.${segment}`, dto);
    },
    async syncIms(segment) {
      await delay(700);
      const cur = readMock<ImsConfig>(`agent.ims.${segment}`, { provider: '', dealerId: '', status: 'not_connected' });
      return writeMock(`agent.ims.${segment}`, { ...cur, status: 'connected' });
    },
    async getCrm(segment) {
      await delay();
      return readMock(`agent.crm.${segment}`, { provider: '', status: 'not_connected' } as CrmConfig);
    },
    async saveCrm(segment, dto) {
      await delay(200);
      return writeMock(`agent.crm.${segment}`, dto);
    },
    async syncCrm(segment) {
      await delay(700);
      const cur = readMock<CrmConfig>(`agent.crm.${segment}`, { provider: '', status: 'not_connected' });
      return writeMock(`agent.crm.${segment}`, { ...cur, status: 'connected' });
    },
  },
  speedToLead: {
    async listSources() {
      await delay(150);
      return LEAD_SOURCES;
    },
    async listSourceGroups() {
      // Master list — derived from the same agent-config GET that powers
      // `get()`. The in-flight promise is memoized (loadAgentConfig) so
      // the form's parallel call to `get()` + `listSourceGroups()` from
      // useEffect collapses to one network request even under React
      // strict-mode's double effect. Falls back to hardcoded groups if
      // tenancy isn't hydrated yet (standalone dev preview).
      const tenancy = getDepartmentsTenancy();
      if (tenancy) {
        try {
          const config = await loadAgentConfig(tenancy);
          const block = extractReachOutBlock(config);
          const groups = groupsFromStlConfig(block);
          if (groups.length) return groups;
        } catch {
          // Fall through to mock fallback below.
        }
      }
      await delay(150);
      return LEAD_SOURCE_GROUPS;
    },
    async get(segment) {
      const tenancy = getDepartmentsTenancy();
      const forwardEmail = `leads_${tenancy?.teamId ?? 'demo'}@thevini.ai`;
      if (tenancy) {
        try {
          // Memoized — concurrent callers share a single GET.
          const config = await loadAgentConfig(tenancy);
          const block = extractReachOutBlock(config);
          const ui = stlApiToUi(block, { forwardEmail });
          // Persist locally too so a network blip on the next page load can
          // still render the most-recent saved state.
          writeMock(`agent.stl.${segment}`, ui);
          return ui;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[agent-config] GET failed — falling back to mock', err);
          // Fall through to the local mock.
        }
      }
      await delay();
      const fallback: SpeedToLead = {
        enabled: true,
        forwardEmail,
        leadsToPick: 'all',
        leadTypes: [{ externalType: 'internet-up', enabled: true }],
        sourceMode: 'all',
        selectedSources: [],
        firstTouchChannel: 'sms',
        silenceNudge: { channel: 'sms', delayMinutes: 60 },
        followUp: {
          enabled: true,
          touchpoints: [
            { id: 't1', day: 2, time: '09:00 AM', channel: 'sms' },
            { id: 't2', day: 3, time: '09:00 AM', channel: 'sms' },
            { id: 't3', day: 4, time: '09:00 AM', channel: 'sms' },
            { id: 't4', day: 6, time: '09:00 AM', channel: 'sms' },
            { id: 't5', day: 8, time: '09:00 AM', channel: 'sms' },
            { id: 't6', day: 12, time: '09:00 AM', channel: 'sms' },
            { id: 't7', day: 14, time: '09:00 AM', channel: 'sms' },
          ],
        },
      };
      const stored = readMock<Partial<SpeedToLead>>(`agent.stl.${segment}`, fallback);
      return {
        ...fallback,
        ...stored,
        silenceNudge: { ...fallback.silenceNudge, ...(stored.silenceNudge ?? {}) },
        followUp: {
          ...fallback.followUp,
          ...(stored.followUp ?? {}),
          touchpoints: stored.followUp?.touchpoints ?? fallback.followUp.touchpoints,
        },
      };
    },
    async save(segment, dto, options) {
      const tenancy = getDepartmentsTenancy();
      // Persist to local mock unconditionally — a successful save echoes
      // immediately, and a failed live save still keeps the unsaved edits
      // visible across reloads.
      writeMock(`agent.stl.${segment}`, dto);

      if (!tenancy) {
        await delay(200);
        return { success: true, saved: dto };
      }

      // Diff against `previous` so we only POST the blocks that actually
      // changed. Backend treats omitted blocks as "preserve existing", so
      // sending less is safer (no accidental overwrites). Without a prior
      // snapshot, send all four blocks — the first save needs to write a
      // complete record.
      const previous = options?.previous ?? null;
      const groups = options?.groups ?? LEAD_SOURCE_GROUPS;
      const payload = previous
        ? stlDiffBlocks(tenancy, previous, dto, groups)
        : stlBuildFullPayload(tenancy, dto, groups);

      if (!stlHasBlockChanges(payload)) {
        return { success: true, saved: dto };
      }

      try {
        const resp = await saveAgentConfigAPI(payload);
        const ok = resp?.success !== false;
        if (ok) {
          // Drop the cached GET so the next reader (e.g. a remount) sees
          // the canonical server state with this save applied.
          invalidateAgentConfigCache();
        }
        return ok
          ? { success: true, saved: dto, message: resp?.message }
          : { success: false, message: resp?.message };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[agent-config] POST failed', err);
        const data = (err as { data?: unknown })?.data;
        let message = (err as Error)?.message;
        if (data && typeof data === 'object') {
          const d = data as {
            message?: string;
            errors?: Array<{ message?: string; path?: unknown[] }>;
          };
          const first = d.errors?.[0];
          if (first?.message) {
            const path = Array.isArray(first.path) ? first.path.join('.') : '';
            message = path ? `${first.message} (${path})` : first.message;
          } else if (d.message) {
            message = d.message;
          }
        }
        return { success: false, message };
      }
    },
  },
  phone: {
    async get(segment) {
      await delay();
      return readMock(`agent.phone.${segment}`, { areaCode: '510', number: null } as PhoneAssignment);
    },
    async assign(segment, areaCode) {
      await delay(800);
      const number = `+1 (${areaCode}) 555-${Math.floor(1000 + (areaCode.charCodeAt(0) * 7) % 9000)}`;
      return writeMock(`agent.phone.${segment}`, { areaCode, number });
    },
  },
  voiceTest: {
    async run(segment) {
      await delay(1200);
      const result: VoiceTestResult = {
        ready: true,
        checks: [
          { label: 'Greeting & identity', detail: 'Used "Rochester Toyota" and agent name', status: 'pass' },
          { label: 'Hours response', detail: 'Hours match configured shift exactly', status: 'pass' },
          { label: 'Phone transfer', detail: 'Transfer initiated to configured sales number', status: 'pass' },
          { label: 'Appointment booking', detail: 'Offered 2 slots and confirmed booking', status: 'pass' },
          { label: 'Lead capture', detail: 'Lead visible in CRM within 90 seconds', status: 'review' },
        ],
      };
      return writeMock(`agent.voiceTest.${segment}`, result);
    },
    async get(segment) {
      await delay(100);
      return readMock<VoiceTestResult | null>(`agent.voiceTest.${segment}`, null);
    },
  },
  chatbot: {
    async get(segment) {
      await delay();
      return readMock(`agent.chatbot.${segment}`, { enabled: true, visibility: 'entire' } as ChatbotConfig);
    },
    async save(segment, dto) {
      await delay(200);
      return writeMock(`agent.chatbot.${segment}`, dto);
    },
  },
  salesPolicies: {
    async get() {
      // Wired to the live agent-config GET — same in-flight memoization
      // (loadAgentConfig) the STL reach-out tab uses, so two consumers on the
      // same page only fire one network request. Falls back to localStorage
      // when tenancy hasn't hydrated (standalone dev preview) or on error.
      const tenancy = getDepartmentsTenancy();
      if (tenancy) {
        try {
          const config = await loadAgentConfig(tenancy);
          const policies = extractSalesPoliciesFromAgentConfig(config);
          writeMock('rooftop.salesPolicies', policies);
          return policies;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[salesPolicies] GET failed — falling back to mock', err);
        }
      }
      await delay();
      return readMock<SalesPolicies>('rooftop.salesPolicies', {});
    },
    async save(dto) {
      // Local mirror unconditionally so unsaved edits survive a reload even
      // when the live POST is rejected.
      writeMock('rooftop.salesPolicies', dto);
      const tenancy = getDepartmentsTenancy();
      if (!tenancy) return dto;
      try {
        const payload = buildAgentConfigSalesPoliciesPayload({
          enterpriseId: tenancy.enterpriseId,
          teamId: tenancy.teamId,
          policies: dto,
        });
        await saveAgentConfigAPI(payload);
        // Drop the cached GET so any subsequent reader sees the canonical
        // server state including this save.
        invalidateAgentConfigCache();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[salesPolicies] POST failed', err);
      }
      return dto;
    },
  },
  servicePolicies: {
    async get() {
      await delay();
      return readMock<ServicePolicies>('rooftop.servicePolicies', {});
    },
    async save(dto) {
      await delay(200);
      return writeMock('rooftop.servicePolicies', dto);
    },
  },
  viniGeneral: {
    async get() {
      // Live GET — `ignoreAniNumbers` lives inside the agent-config envelope.
      // Memoized via loadAgentConfig so concurrent consumers on the same
      // page collapse to a single network call. Falls back to localStorage
      // when tenancy hasn't hydrated (standalone dev preview) or on error.
      const tenancy = getDepartmentsTenancy();
      if (tenancy) {
        try {
          const config = await loadAgentConfig(tenancy);
          const triggerNumbers = extractIgnoreAniFromAgentConfig(config);
          const result: ViniGeneralConfig = { askForMobile: { triggerNumbers } };
          writeMock('rooftop.viniGeneral', result);
          return result;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[viniGeneral] GET failed — falling back to mock', err);
        }
      }
      await delay();
      return readMock<ViniGeneralConfig>('rooftop.viniGeneral', {
        askForMobile: { triggerNumbers: [] },
      });
    },
    async save(dto) {
      // Local mirror unconditionally so unsaved edits survive a reload even
      // when the live POST is rejected.
      writeMock('rooftop.viniGeneral', dto);
      const tenancy = getDepartmentsTenancy();
      if (!tenancy) return dto;
      try {
        const payload = buildAgentConfigIgnoreAniPayload({
          enterpriseId: tenancy.enterpriseId,
          teamId: tenancy.teamId,
          numbers: dto.askForMobile.triggerNumbers,
        });
        await saveAgentConfigAPI(payload);
        // Drop the cached GET so the next reader sees the canonical server
        // state with this save applied.
        invalidateAgentConfigCache();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[viniGeneral] POST failed', err);
      }
      return dto;
    },
  },
};

// Live impl is wired per-domain as contracts land (see services/tracker.ts,
// and saveRooftopData in the source repo). Until then "live" falls back to mock.
function getApi(): OnboardingApi {
  // const mode = process.env.NEXT_PUBLIC_API_MODE;
  // if (mode === 'live') return liveApi;
  return mockApi;
}

export const api: OnboardingApi = getApi();
