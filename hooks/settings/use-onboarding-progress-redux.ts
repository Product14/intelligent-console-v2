'use client';

// Shim for use-onboarding-progress-redux. Returns onboarding progress data
// (mock for now; wire to api/tracker when backend is available).

export interface AgentProgressResult {
  progressSteps: Array<{ taskName: string; status: string }>;
}

export const useOnboardingProgressRedux = (_params?: unknown) => {
  return {
    data: { onboardingStartTime: null as string | null, onboardingProgress: [], percentageCompletion: 0 },
    onboardingSteps: [] as unknown[],
    progressSteps: [] as unknown[],
    isLoading: false,
    refetch: () => {},
    getAgentProgressByType: (_agentType?: string, _agentCallType?: string): AgentProgressResult => ({
      progressSteps: [],
    }),
  };
};
