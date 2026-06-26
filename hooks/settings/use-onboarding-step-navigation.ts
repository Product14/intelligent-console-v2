'use client';

// Shim for use-onboarding-step-navigation. Navigation is driven by the onboarding
// context's active step (set by the shell). These are no-ops by default; the shell
// wires real navigation via onStepClick / footer.
import { getNavHandlers } from '@/lib/settings/bridge/context-store';

export const useOnboardingStepNavigation = () => {
  return {
    goToNextStep: () => getNavHandlers().goNext(),
    goToPrevStep: () => getNavHandlers().goPrev(),
  };
};
