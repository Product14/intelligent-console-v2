'use client';

import 'react-phone-input-2/lib/style.css';
import { useState } from 'react';
// @ts-ignore - JS kit component without type declarations
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';
// @ts-ignore - JS kit component without type declarations
import OnboardingRooftopDetails from '@spyne-console/components/onboarding/rooftop-profile/onboarding-rooftop-details';
import { useConsoleContext } from '@/lib/settings/bridge/console-bridge-provider';
import { useSubStep } from '@/components/settings/shell/step-scaffold';

export function ProfileForm({ subStepId }: { subStepId: string }) {
  const ctx = useConsoleContext();
  const [isValid, setIsValid] = useState(false);
  useSubStep(subStepId, isValid);

  return (
    <div className="flex h-full min-h-[520px] w-full flex-col gap-6">
      <OnboardingStepHeader
        title="Let's setup your Rooftop Profile"
        description="Confirm basic details of your rooftop"
      />
      <div className="min-h-0 flex-1">
        <OnboardingRooftopDetails
          enterpriseId={ctx?.enterpriseId}
          teamId={ctx?.teamId}
          isProductVini={true}
          onFormChange={() => {}}
          onErrorsChange={(e: { isValid?: boolean }) => setIsValid(!!e?.isValid)}
        />
      </div>
    </div>
  );
}
