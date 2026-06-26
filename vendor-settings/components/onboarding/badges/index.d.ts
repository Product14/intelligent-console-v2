import { FC } from 'react';

export interface PlanBadgeProps {
  plan: 'PRO' | 'LITE';
}

export interface StudioAiBadgeProps {
  plan: 'PRO' | 'LITE';
  className?: string;
  labelClassName?: string;
  badgeClassName?: string;
}

export declare const PlanBadge: FC<PlanBadgeProps>;
export declare const StudioAiBadge: FC<StudioAiBadgeProps>;
