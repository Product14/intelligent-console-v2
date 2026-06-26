'use client';

// Shim for use-onboarding-update-task-hook. Calls the (vendored) onboarding
// service to update a task; no Redux caching. Safe-fails in mock mode.
// @ts-ignore - vendored service
import { updateOnboardingTaskAPI, getOnboardingProgressAPI } from '@/services/settings/onboarding.service';
import useUserDetails from '@/hooks/settings/useUserDetails';
import { useMainContext } from '@/contexts/settings/mainContext';

export const useOnboardingUpdateTask = () => {
  const { teamId } = useUserDetails();
  const { productLineId } = useMainContext();

  const updateTaskAndRefresh = async (payload: unknown, shouldCompleteTask = true) => {
    try {
      await updateOnboardingTaskAPI(payload, shouldCompleteTask);
      if (teamId && productLineId) {
        const res = await getOnboardingProgressAPI({ teamId, productLineId });
        return res?.data ?? null;
      }
    } catch {
      /* mock mode / no backend — ignore */
    }
    return null;
  };

  return { updateTaskAndRefresh };
};
