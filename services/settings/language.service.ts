import { SupportedLanguage } from '@/store-settings/models/persona.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const fetchLanguagesAPI = async (): Promise<SupportedLanguage[]> => {
  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/linguistics/languages/all`;

  const response = await CentralAPIHandler.handleGetRequest(url);
  return response as SupportedLanguage[];
};
