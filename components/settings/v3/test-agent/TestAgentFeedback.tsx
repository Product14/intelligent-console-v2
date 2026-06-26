import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';

import { useMemo } from 'react';

import { useAgentsRedux } from '@/hooks/settings/use-agents-redux';

import VoteScreen from './VoteScreen';

export const TestAgentFeedback = ({
  onTestAgain,
}: {
  onTestAgain: () => void;
}) => {
  // const [isVoteScreen, setIsVoteScreen] = useState(true);
  const { activeAgentId } = useActiveAgent();
  const { availableAgents, isLoading } = useAgentsRedux({});
  const agent = useMemo(
    () => availableAgents.find((a) => a.teamAgentMappingId === activeAgentId),
    [availableAgents, activeAgentId]
  );
  if (!agent) {
    return null;
  }

  return (
    <div className="relative flex h-full overflow-hidden">
      <VoteScreen
        agent={agent}
        onTestAgain={onTestAgain}
        onShareFeedback={() => {}}
      />
    </div>
  );
};
