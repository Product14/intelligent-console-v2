import { DealershipCustomizationFormValues } from '@/app-models-settings/onboarding/AgentCustomizationConfig';
import { ViniConfigResponse } from '@/services/settings/vini-config.service';

export interface AgentCustomizationTransformContext {
  isOutboundAgent: boolean;
  hasPhoneNumber: boolean;
}

/**
 * Transforms component state to the format expected by the API builder function.
 * Only includes fields that correspond to visible form sections for the given agent type.
 */
export const transformFormToApiFormat = (
  customizationValues: DealershipCustomizationFormValues,
  context: AgentCustomizationTransformContext
) => {
  return {
    ...(!context.isOutboundAgent && {
      firstMessage: customizationValues.firstMessage,
    }),
    ...(context.isOutboundAgent && {
      voicemailMessage: customizationValues.voicemailMessage,
    }),
    ...(!context.hasPhoneNumber && {
      areaCode: customizationValues.preferredAreaCode || null,
    }),
  };
};

export const transformApiToFormFormat = (
  config: ViniConfigResponse,
  initialValues: DealershipCustomizationFormValues
): DealershipCustomizationFormValues => {
  return {
    firstMessage: config.agents?.firstMessage || initialValues.firstMessage,
    voicemailMessage:
      config.agents?.voicemailMessage || initialValues.voicemailMessage,
    preferredAreaCode:
      config.agents?.areaCode || initialValues.preferredAreaCode,
  };
};
