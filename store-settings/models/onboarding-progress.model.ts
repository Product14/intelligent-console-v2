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
