import { AiOutlineDollar } from 'react-icons/ai';
import { FaRegClock } from 'react-icons/fa';

export enum CallAnalyticsFields {
  AVERAGE_CALL_DURATION = 'average_call_duration',
  FIRST_CALL_RESOLUTION = 'first_call_resolution',
  CONCURRENT_CALLS = 'concurrent_calls',
  MANUAL_INTERVENTION = 'manual_intervention',
}

export enum AnalyticsTabs {
  CONVERSATIONS = 'Conversations',
  CALLS = 'Calls',
}

export enum ColorScheme {
  VIOLET = 'violet',
  SKY = 'sky',
  PINK = 'pink',
  AMBER = 'amber',
}

interface CallAnalyticsFieldConfig {
  label: string;
  colorScheme: ColorScheme;
  icon?: React.ReactNode;
}
export const CallAnalyticsFieldsMap: Record<
  CallAnalyticsFields,
  CallAnalyticsFieldConfig
> = {
  [CallAnalyticsFields.AVERAGE_CALL_DURATION]: {
    label: 'Average Call Duration',
    colorScheme: ColorScheme.VIOLET,
    icon: <FaRegClock />,
  },
  [CallAnalyticsFields.FIRST_CALL_RESOLUTION]: {
    label: 'First Call Resolution',
    colorScheme: ColorScheme.SKY,
    icon: <AiOutlineDollar />,
  },
  [CallAnalyticsFields.CONCURRENT_CALLS]: {
    label: 'Concurrent Calls',
    colorScheme: ColorScheme.AMBER,
    icon: <FaRegClock />,
  },
  [CallAnalyticsFields.MANUAL_INTERVENTION]: {
    label: 'Manual Intervention',
    colorScheme: ColorScheme.PINK,
    icon: <FaRegClock />,
  },
};

export interface ColorSchemeConfig {
  outlineColor: string;
  backgroundGradient: string;
  iconOutlineColor: string;
  color: string;
  colorCode: string;
}

export const ColorSchemeMap: Record<ColorScheme, ColorSchemeConfig> = {
  [ColorScheme.VIOLET]: {
    outlineColor: 'outline-violet-700',
    backgroundGradient: 'from-violet-700/5',
    iconOutlineColor: 'outline-violet-700',
    color: 'text-violet-700',
    colorCode: '#8B5CF6',
  },
  [ColorScheme.SKY]: {
    outlineColor: 'outline-sky-500',
    backgroundGradient: 'from-sky-500/5',
    iconOutlineColor: 'outline-sky-500',
    color: 'text-sky-500',
    colorCode: '#0EA5E9',
  },
  [ColorScheme.PINK]: {
    outlineColor: 'outline-pink-700',
    backgroundGradient: 'from-pink-700/5',
    iconOutlineColor: 'outline-pink-700',
    color: 'text-pink-700',
    colorCode: '#EC4899',
  },
  [ColorScheme.AMBER]: {
    outlineColor: 'outline-amber-400',
    backgroundGradient: 'from-amber-400/10',
    iconOutlineColor: 'outline-amber-400',
    color: 'text-amber-400',
    colorCode: '#F59E0B',
  },
};

export const getColorScheme = (colorScheme: ColorScheme) => {
  return ColorSchemeMap[colorScheme];
};
