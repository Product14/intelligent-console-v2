export interface DealershipCustomizationFormValues {
  firstMessage: string;
  voicemailMessage: string;
  preferredAreaCode?: string;
  [key: string]: any;
}

export const DEAFULT_DEALERSHIP_CUSTOMIZATION: DealershipCustomizationFormValues =
  {
    firstMessage: '',
    voicemailMessage: '',
    preferredAreaCode: '',
  };
