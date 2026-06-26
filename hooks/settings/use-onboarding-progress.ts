'use client';
// Shim — onboarding progress (mock). Same shape as the redux hook's consumers expect.
export const useOnboardingProgress = (_p?: unknown) => ({
  onboardingSteps: [] as unknown[],
  isLoading: false,
  progressData: null as unknown,
});
export default useOnboardingProgress;
