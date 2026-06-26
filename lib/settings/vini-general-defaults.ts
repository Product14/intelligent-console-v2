// Defaults + hydration for the Vini AI → General settings screen.

import type { ViniGeneralConfig } from '@/types/settings/vini-general-config';

export const VINI_GENERAL_DEFAULTS: ViniGeneralConfig = {
  askForMobile: {
    triggerNumbers: [],
  },
};

export function hydrateViniGeneralConfig(
  stored?: ViniGeneralConfig | null
): ViniGeneralConfig {
  return {
    askForMobile: {
      triggerNumbers:
        stored?.askForMobile?.triggerNumbers ??
        VINI_GENERAL_DEFAULTS.askForMobile.triggerNumbers,
    },
  };
}
