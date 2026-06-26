import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import { OnboardedAgent } from '@/store-settings/models/agents.model';
import { Persona } from '@/store-settings/models/persona.model';
import { Spinner } from '@spyne-console/design-system';

import React, { useMemo } from 'react';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';
import { usePersonaRedux } from '@/hooks/settings/use-persona-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { StringUtils } from '@/utils-settings/StringUtils';
import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { Curve } from '../common/Curve';
import { PersonaAudioPlayer } from './PersonaAudioPlayer';
import { PersonaDetails } from './PersonaDetails';

export const PersonaRenderer: React.FC<{
  isEditMode?: boolean;
  showListing: () => void;
  onPersonaSelect: (persona: Persona, name: string) => void;
}> = ({ isEditMode, showListing, onPersonaSelect }) => {
  const { activeAgentTypeId, activeAgentId } = useActiveAgent();
  const { agentTypes } = useAgentTypesRedux({});
  const { availableAgents } = useAgentsRedux({});
  const { personas, isLoading } = usePersonaRedux({
    agentTypeId: activeAgentTypeId ?? '',
  });
  const { teamId } = useUserDetails();
  const { productLineId } = useMainContext();
  const agentType = useMemo(() => {
    return agentTypes.find(
      (agentType) => agentType.agentTypeId === activeAgentTypeId
    );
  }, [agentTypes, activeAgentTypeId]);

  const persona = useMemo(() => {
    return (
      personas.find(
        (persona) => persona.templateId === agentType?.templateId
      ) ?? personas[0]
    );
  }, [personas, agentType]);

  const agent = useMemo(() => {
    return availableAgents.find((a) => a.teamAgentMappingId === activeAgentId);
  }, [availableAgents, activeAgentId]);

  const displayAgent: OnboardedAgent | Persona = agent ?? persona;

  return isLoading ? (
    <div className="flex h-full w-full items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-cover bg-center pb-0 pt-6"
      style={{
        backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/main-grad-bg.png')})`,
      }}
    >
      <div className="relative flex h-3/4 w-full flex-col items-center justify-center gap-8">
        <div className="relative h-[50vh] w-full overflow-hidden">
          <img
            src={getSafeStaticAssetUrl(displayAgent.imageUrl)}
            alt={displayAgent.name}
            className="absolute left-1/2 top-1/2 h-[200%] w-auto -translate-x-1/2 -translate-y-1/4"
          />
        </div>
        <div className="z-2 absolute bottom-0 left-0 flex h-[29px] w-full flex-col">
          <Curve>
            <PersonaAudioPlayer
              id={`persona-audio-${displayAgent.templateId}`}
              supportedLanguages={displayAgent.supportedLanguages}
            />
          </Curve>
        </div>
      </div>
      <PersonaDetails
        isEditMode={isEditMode}
        persona={displayAgent}
        agentType={StringUtils.toCapitalize(
          (displayAgent as OnboardedAgent).agentType ??
            agentType?.agentType ??
            ''
        )}
        agentCallType={StringUtils.toCapitalize(
          (displayAgent as OnboardedAgent).agentCallType ??
            agentType?.agentCallType ??
            ''
        )}
        onSelectDifferentPersonas={showListing}
        onSelectMe={(name) => onPersonaSelect(displayAgent, name)}
      />
    </div>
  );
};
