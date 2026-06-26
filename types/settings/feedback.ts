export enum FeedbackIssueType {
  LACK_GENERAL_KNOWLEDGE = 'lackGeneralKnowledge',
  REPETITIVE_CONVERSATION_LOOP = 'repetitiveConversationLoop',
  VOICEMAIL_DETECTION = 'voicemailDetection',
  RESPONSE_QUALITY = 'responseQuality',
  INTEGRATION_REQUIRED = 'integrationRequired',
  OTHER = 'other',
}

export interface FeedbackIssue {
  id: string;
  type: FeedbackIssueType;
  label: string;
  isIssueResolved: boolean;
  details?: string;
  reportedAt?: Date;
  resolvedAt?: Date;
}

export const FEEDBACK_ISSUE_LABELS: Record<FeedbackIssueType, string> = {
  [FeedbackIssueType.LACK_GENERAL_KNOWLEDGE]: 'Lacks General Knowledge',
  [FeedbackIssueType.REPETITIVE_CONVERSATION_LOOP]:
    'Repetitive Conversation Loop',
  [FeedbackIssueType.VOICEMAIL_DETECTION]: 'Voicemail Detection',
  [FeedbackIssueType.RESPONSE_QUALITY]: 'Response Quality',
  [FeedbackIssueType.INTEGRATION_REQUIRED]: 'Integration Required',
  [FeedbackIssueType.OTHER]: 'Other',
};

// New types for feedback API
export interface FeedbackAspect {
  aspect: string;
  description: string;
  satisfied: boolean;
  status?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface CreateFeedbackPayload {
  enterpriseId: string;
  teamId: string;
  agentId: string;
  aspects: FeedbackAspect[];
}

export interface UpdateFeedbackPayload {
  enterpriseId?: string;
  teamId?: string;
  agentId?: string;
  aspects?: FeedbackAspect[];
}

export interface FeedbackResponse {
  teamId: string;
  enterpriseId: string;
  agentId: string;
  aspects: FeedbackAspect[];
  createdAt: string;
  updatedAt: string;
}

export interface FetchFeedbackParams {
  enterpriseId?: string;
  teamId?: string;
  agentId?: string;
  feedbackId?: string;
}
