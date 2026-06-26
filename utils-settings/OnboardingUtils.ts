import { OnboardingStep } from '@/app/models/Onboarding';

export class OnboardingUtils {
  static isCurrentlyOnboarding(firstOnboardingProgress: OnboardingStep[]) {
    return (
      !OnboardingUtils.isOnboardingCompleted(firstOnboardingProgress) &&
      !OnboardingUtils.isOnboardingNotStarted(firstOnboardingProgress)
    );
  }

  static isOnboardingCompleted(firstOnboardingProgress: OnboardingStep[]) {
    return (
      firstOnboardingProgress.length > 1 &&
      firstOnboardingProgress.includes(OnboardingStep.COMPLETED)
    );
  }

  static isOnboardingNotStarted(firstOnboardingProgress: OnboardingStep[]) {
    return (
      firstOnboardingProgress.length === 1 &&
      firstOnboardingProgress[0] === OnboardingStep.NOT_STARTED
    );
  }
}
