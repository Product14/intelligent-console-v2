// Resolver: turns declarative templates + the rooftop's contracted agents into a
// flat ordered ResolvedSubStep[] per top step (with section + agent context).

import {
  ONBOARDING_TEMPLATES,
  NEW_TOP_STEP_ORDER,
  segmentName,
  type AgentType,
  type AgentVariant,
  type ResolvedSubStep,
  type ResolvedTopStep,
  type SectionTemplate,
  type TopStepId,
  type TopStepTemplate,
} from '@/lib/settings/onboarding-model';

export interface ContractedAgent {
  agentType: AgentType;
  agentCallType: AgentVariant;
  agentId?: string;
  agentTypeId?: string;
}

const CALL_TYPE_ORDER: AgentVariant[] = ['inbound', 'outbound'];

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function resolveFlatOrShared(section: SectionTemplate): ResolvedSubStep[] {
  return section.subSteps.map((s, i) => ({
    ...s,
    key: `${section.id}:${s.id}`,
    sectionId: section.id,
    sectionKind: section.kind,
    sectionLabel: i === 0 ? section.label : undefined,
    isSectionStart: i === 0,
  }));
}

function resolveAgentSection(
  section: SectionTemplate,
  agentType: AgentType,
  callTypes: AgentVariant[]
): ResolvedSubStep[] {
  const out: ResolvedSubStep[] = [];
  for (const callType of callTypes) {
    const subs = section.subSteps.filter((s) => !(s.inboundOnly && callType !== 'inbound'));
    const blockLabel = `${cap(callType)} ${cap(agentType)}`; // "Inbound Sales"
    subs.forEach((s, i) => {
      out.push({
        ...s,
        key: `${section.id}:${callType}:${s.id}`,
        sectionId: `${section.id}:${callType}`,
        sectionKind: 'agent',
        sectionLabel: i === 0 ? blockLabel : undefined,
        isSectionStart: i === 0,
        agentType,
        agentCallType: callType,
        segment: segmentName(callType, agentType),
      });
    });
  }
  return out;
}

export function resolveTopStep(
  id: TopStepId,
  agents: ContractedAgent[]
): ResolvedTopStep | null {
  const template: TopStepTemplate | undefined = ONBOARDING_TEMPLATES.find((t) => t.id === id);
  if (!template) return null;

  // General is always present.
  if (template.id === 'general') {
    return {
      id: template.id,
      label: template.label,
      subSteps: template.sections.flatMap(resolveFlatOrShared),
    };
  }

  // Sales/Service only if the rooftop contracted that agent type.
  const typeAgents = agents.filter((a) => a.agentType === template.agentType);
  if (typeAgents.length === 0) return null;

  const callTypes = CALL_TYPE_ORDER.filter((ct) =>
    typeAgents.some((a) => a.agentCallType === ct)
  );

  const subSteps: ResolvedSubStep[] = [];
  for (const section of template.sections) {
    if (section.kind === 'agent') {
      subSteps.push(...resolveAgentSection(section, template.agentType!, callTypes));
    } else {
      subSteps.push(...resolveFlatOrShared(section));
    }
  }
  return { id: template.id, label: template.label, subSteps };
}

/** All top steps that should render for this rooftop, in order. */
export function resolveTopSteps(agents: ContractedAgent[]): ResolvedTopStep[] {
  return NEW_TOP_STEP_ORDER.map((id) => resolveTopStep(id, agents)).filter(
    (s): s is ResolvedTopStep => s !== null
  );
}
