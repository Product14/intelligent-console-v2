export interface Agent {
  teamAgentMappingId: string;
  enterpriseId: string;
  teamId: string;
  agentTypeId: string;
  agentType: string;
  agentCallType: string;
  agentUseCase: string;

  name: string;
  imageUrl: string;
  step: string[];
  progress: number;
  isOnboarded: boolean;
  phoneNumber: string;
}
