export interface AgentType {
  agentTypeId: string;
  agentType: string;
  description: string;
  agentCallType: string;
  agentUseCase: string;
  imageUrl: string;
  availableCount: number;
  name?: string;
  templateId: string;
  firstMessage: string;
  voicemailMessage: string;
}
