// Onboarding tracker — cherry-picked from
// apps/converse-ai/services/onboarding.service.ts (imports adapted to @/lib/settings/api).

import CentralAPIHandler, { APP_BACKEND_BASEURL } from '@/lib/settings/api/http';
import { OnboardingTaskName } from '@/lib/settings/onboarding-model';

export interface OnboardingTask {
  taskName: string;
  segmentName: string;
  status: 'COMPLETED' | 'INPROGRESS' | 'PENDING';
  startTime: string | null;
  endTime: string | null;
}

export interface OnboardingProgressData {
  onboardingProgress: OnboardingTask[];
  percentageCompletion: number;
  onboardingStartTime: string;
}

export interface UpdateTaskPayload {
  productLineId: string;
  taskName: OnboardingTaskName;
  segmentName: string;
  isCompleted?: boolean;
}

export async function getOnboardingProgress(payload: {
  teamId: string;
  productLineId: string;
}): Promise<OnboardingProgressData> {
  const url = `${APP_BACKEND_BASEURL}/console/v1/product-onboarding/onboarding-tracker/get-onboarding-tracker`;
  const res = await CentralAPIHandler.handleGetRequest<{ data: OnboardingProgressData }>(url, {
    teamId: payload.teamId,
    productLineId: payload.productLineId,
  });
  return res.data;
}

export async function updateOnboardingTask(payload: UpdateTaskPayload): Promise<unknown> {
  const url = `${APP_BACKEND_BASEURL}/console/v1/product-onboarding/onboarding-tracker/update-onboarding-task`;
  return CentralAPIHandler.handlePostRequest(url, payload);
}
