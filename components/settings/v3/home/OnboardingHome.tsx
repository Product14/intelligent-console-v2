import { useMainContext } from '@/contexts/settings/mainContext';

import React, { useEffect } from 'react';

import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import useAgentsRedux from '@/hooks/settings/use-agents-redux';

import { AgentTypeCard } from '../common/AgentTypeCard';
import { AgentTypeCardShimmer } from '../common/AgentTypeCardShimmer';
import ViniContractBanner from '../common/ViniContractBanner';

export default function OnboardingHome() {
  const { availableAgents, isLoading: isAvailableAgentsLoading } =
    useAgentsRedux({ autoFetch: true });
  const { agentTypes, isLoading: isAgentTypesLoading } = useAgentTypesRedux({
    autoFetch: true,
  });
  const { setDisableConverseSidebar, setIsConverseSidebarOpen } =
    useMainContext();

  useEffect(() => {
    setDisableConverseSidebar(true);
    setIsConverseSidebarOpen(false);
  }, []);

  return (
    <div className="relative flex flex-col gap-8 p-8">
      <OnboardingBackgroundGrid height="100%" />

      <ViniContractBanner />

      <div className="flex flex-col">
        <div className="text-xl font-semibold leading-8 text-black/90">
          Your Chosen agent
        </div>
        <div className="text-base leading-6 text-black/50">
          Complete the onboarding process to deploy your Al agents
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(isAvailableAgentsLoading || isAgentTypesLoading) &&
          Array.from({ length: 4 }).map((_, index) => (
            <AgentTypeCardShimmer key={index} />
          ))}
        {(availableAgents ?? []).map((agent) => (
          <AgentTypeCard
            key={agent.teamAgentMappingId}
            agentData={agent}
            onClick={() => {}}
            isAgentOnboarded={agent.isOnboarded}
          />
        ))}
        {(agentTypes ?? [])
          .filter((agentType) => agentType.availableCount > 0)
          .map((agentType) => (
            <AgentTypeCard
              key={agentType.agentTypeId}
              agentData={agentType}
              onClick={() => {}}
            />
          ))}
      </div>
    </div>
  );
}
