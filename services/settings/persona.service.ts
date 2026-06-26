import {
  FetchPersonasParams,
  GetPersonasResponseDto,
  Persona,
} from '@/store-settings/models/persona.model';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

export const fetchPersonasAPI = async (
  params?: FetchPersonasParams
): Promise<GetPersonasResponseDto> => {
  const {
    enterpriseId,
    teamId,
    languageId,
    agentTypeId,
    gender,
    page,
    limit,
    voiceId,
    templateName,
    templateId,
  } = params || {};

  const url = `${process.env.APP_BACKEND_BASEURL}/conversation/templates`;

  let qParams: any = {};

  if (enterpriseId) {
    qParams.enterpriseId = enterpriseId;
  }
  if (teamId) {
    qParams.teamId = teamId;
  }
  if (agentTypeId) {
    qParams.agentTypeId = agentTypeId;
  }

  if (voiceId) {
    qParams.voiceId = voiceId;
  }
  if (templateName) {
    qParams.templateName = templateName;
  }
  if (templateId) {
    qParams.templateId = templateId;
  }
  if (languageId) {
    qParams.languageId = languageId;
  }
  if (gender) {
    qParams.gender = gender;
  }
  if (page !== undefined) {
    qParams.page = page;
  }
  if (limit !== undefined) {
    qParams.limit = limit;
  }

  const response = await CentralAPIHandler.handleGetRequest(url, qParams);
  return response as GetPersonasResponseDto;
};
