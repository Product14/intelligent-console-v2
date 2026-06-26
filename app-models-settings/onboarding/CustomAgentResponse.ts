export interface CustomAgentResponse {
  agent: AgentResponseData;
  agentMapping: AgentMappingData;
}

export interface AgentResponseData {
  agentId: string;
  agentName: string;
  agentTypeId: string;
  agentSource: string;
  isActive: boolean;
  voiceId: string;
  frontendConfigs: {
    colorTheme: string;
    homepageImage: string;
    imageUrl: string;
    available?: boolean;
  };
  callConfigs: {
    backgroundSound: string;
    languageId: string;
    voiceConfig: Record<string, any>;
  };
  agentType: string;
  assistantSource?: string;
  order?: number;
}

export interface AgentMappingData {
  enterpriseId: string;
  teamId: string;
  agentId: string;
  firstMessage: string;
  isActive: boolean;
  id: string;
}
