import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import { CreateFeedbackPayload, FeedbackResponse } from '../types/feedback';

const BASE_URL = `${process.env.APP_BACKEND_BASEURL}/conversation/feedbacks`;

export const createFeedbackAPI = async (
  payload: CreateFeedbackPayload
): Promise<FeedbackResponse> => {
  const response = await CentralAPIHandler.handlePostRequest(BASE_URL, payload);

  return response;
};

export const fetchFeedbacksAPI = async (
  enterpriseId: string,
  teamId: string,
  agentId: string
): Promise<FeedbackResponse> => {
  const url = `${BASE_URL}/enterprise/${enterpriseId}/team/${teamId}/agent/${agentId}`;

  const response = await CentralAPIHandler.handleGetRequest(url);

  return response || null;
};
