import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { fetchAgentTypesAPI } from '@/services/settings/agent-types.service';
import { createOrUpdateAgentMappingAPI } from '@/services/settings/agents.service';
import { fetchOnboardedAgentsAPI } from '@/services/settings/agents.service';
import { OnboardingTaskName } from '@/services/settings/onboarding.service';
import { setAgentTypes } from '@/store-settings/actions/agent-types.actions';
import { fetchAssistants } from '@/store-settings/actions/assistant.actions';
import { Persona } from '@/store-settings/models/persona.model';
import { setAvailableAgents } from '@/store-settings/reducers/agents.reducer';
import { Spinner } from '@spyne-console/design-system';

import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { useRouter } from 'next/navigation';

import { useQueryParams } from '@spyne-console/hooks';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';
import { useOnboardingUpdateTask } from '@/hooks/settings/use-onboarding-update-task-hook';
import useUserDetails from '@/hooks/settings/useUserDetails';

import AgentCustomization from '../agent-customization/AgentCustomization';
import { PersonaListing } from './PersonaListing';
import { PersonaRenderer } from './PersonaRenderer';

enum PersonaSelectionStep {
  PERSONA_LISTING = 'persona-listing',
  PERSONA_RENDERER = 'persona-renderer',
  AGENT_CUSTOMIZATION = 'agent-customization',
}

export const PersonaSelection = ({
  exisitingTeamAgentMappingId,
}: {
  exisitingTeamAgentMappingId?: string;
}) => {
  const [currentStep, setCurrentStep] = useState(
    PersonaSelectionStep.PERSONA_RENDERER
  );
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const { productLineId } = useMainContext();
  const { updateTaskAndRefresh } = useOnboardingUpdateTask();
  const { queryParams } = useQueryParams();
  const { enterpriseId, teamId } = useUserDetails();
  const { activeAgentTypeId, setActiveAgentId } = useActiveAgent();
  const { availableAgents } = useAgentsRedux({});
  const { agentTypes } = useAgentTypesRedux({});
  const teamAgentMappingId = queryParams?.teamAgentMappingId?.trim();
  const router = useRouter();
  const agentTypeData = useMemo(() => {
    return agentTypes.find((agent) => agent.agentTypeId === activeAgentTypeId);
  }, [agentTypes, activeAgentTypeId]);
  const agentData = useMemo(() => {
    return availableAgents.find(
      (a) => a.teamAgentMappingId === exisitingTeamAgentMappingId
    );
  }, [availableAgents, exisitingTeamAgentMappingId]);
  const dispatch = useDispatch();

  const handleAgentCreation = async (persona: Persona, name: string) => {
    try {
      setIsCreatingAgent(true);
      const agentType = agentTypes.find(
        (agentType) => agentType.agentTypeId === activeAgentTypeId
      );
      if (!agentType) {
        toast.error('Invalid configuration, please restart onboarding');
        return;
      }
      let payload = {
        enterpriseId,
        teamId,
        agentType: agentType?.agentType,
        agentCallType: agentType?.agentCallType,
        templateId: persona.templateId,
        agentTypeId: activeAgentTypeId,
        agentName: name,
      };
      if (!!exisitingTeamAgentMappingId) {
        payload = {
          ...payload,
          ...(exisitingTeamAgentMappingId && {
            teamAgentMappingId: exisitingTeamAgentMappingId,
          }),
        };
      }
      const response = await createOrUpdateAgentMappingAPI(payload);

      if (response?.data?.teamAgentMappingId || exisitingTeamAgentMappingId) {
        const agents = await fetchOnboardedAgentsAPI({
          enterpriseId,
          teamId,
          forceRefresh: true,
        });
        dispatch(setAvailableAgents({ agents }));
        dispatch(
          fetchAssistants({ enterpriseId: enterpriseId!, teamId: teamId! })
        );
        const agentTypesResponse = await fetchAgentTypesAPI(
          enterpriseId,
          teamId
        );
        dispatch(
          setAgentTypes({
            agentTypes: agentTypesResponse.contractedAgents,
            contractLink: agentTypesResponse.contractLink || '',
          })
        );
        setActiveAgentId(
          response?.data?.teamAgentMappingId ?? exisitingTeamAgentMappingId
        );
        if (!!exisitingTeamAgentMappingId) {
          toast.success('Agent updated successfully');
        } else {
          router.push(
            `/converse-ai/onboarding?enterprise_id=${enterpriseId}&team_id=${teamId}&teamAgentMappingId=${response.data.teamAgentMappingId}`
          );
          toast.success('Agent created successfully');
        }
        setCurrentStep(PersonaSelectionStep.AGENT_CUSTOMIZATION);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'An error occurred while creating the agent'
      );
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const onboardAgent = async (persona: Persona, name: string) => {
    const isEditingSamePersona =
      !!exisitingTeamAgentMappingId &&
      name === persona.name &&
      persona.templateId === agentData?.templateId;
    if (teamAgentMappingId || isEditingSamePersona) {
      setActiveAgentId(teamAgentMappingId ?? exisitingTeamAgentMappingId);
      setCurrentStep(PersonaSelectionStep.AGENT_CUSTOMIZATION);
      return;
    }

    if (!enterpriseId || !teamId || !activeAgentTypeId || !persona.templateId) {
      toast.error('Missing required information to create agent');
      return;
    }

    handleAgentCreation(persona, name);
  };

  useEffect(() => {
    if (!!exisitingTeamAgentMappingId) return;
    updateTaskAndRefresh(
      {
        productLineId: productLineId,
        taskName: OnboardingTaskName.AGENT_CUSTOMIZATION,
        agentType: agentTypeData?.agentType ?? '',
        agentCallType: agentTypeData?.agentCallType ?? '',
      },
      false
    );
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case PersonaSelectionStep.PERSONA_LISTING:
        return (
          <PersonaListing
            onPersonaSelect={onboardAgent}
            onBack={() => setCurrentStep(PersonaSelectionStep.PERSONA_RENDERER)}
            isEditMode={!!exisitingTeamAgentMappingId}
          />
        );
      case PersonaSelectionStep.AGENT_CUSTOMIZATION:
        return (
          <AgentCustomization
            goBack={() => setCurrentStep(PersonaSelectionStep.PERSONA_RENDERER)}
            isEditMode={!!exisitingTeamAgentMappingId}
          />
        );
      case PersonaSelectionStep.PERSONA_RENDERER:
      default:
        return (
          <PersonaRenderer
            isEditMode={!!exisitingTeamAgentMappingId}
            showListing={() =>
              setCurrentStep(PersonaSelectionStep.PERSONA_LISTING)
            }
            onPersonaSelect={onboardAgent}
          />
        );
    }
  };

  if (isCreatingAgent) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return renderStepContent();
};
