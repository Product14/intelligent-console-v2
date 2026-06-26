import { createAction } from '@reduxjs/toolkit';

export const FETCH_CONVERSATION_ANALYTICS_DASHBOARD =
  'analytics/fetchConversationAnalyticsDashboard';
export const SET_CONVERSATION_ANALYTICS_DASHBOARD =
  'analytics/setConversationAnalyticsDashboard';
export const SET_CONVERSATION_ANALYTICS_LOADING =
  'analytics/setConversationAnalyticsLoading';
export const SET_CONVERSATION_ANALYTICS_ERROR =
  'analytics/setConversationAnalyticsError';

export const fetchConversationAnalyticsDashboard = createAction(
  FETCH_CONVERSATION_ANALYTICS_DASHBOARD,
  (payload: {
    enterpriseId: string;
    teamId: string;
    startDate: string;
    endDate: string;
    agentType?: string;
  }) => ({
    payload,
  })
);

export const setConversationAnalyticsDashboard = createAction(
  SET_CONVERSATION_ANALYTICS_DASHBOARD,
  (payload: any) => ({ payload })
);

export const setConversationAnalyticsLoading = createAction(
  SET_CONVERSATION_ANALYTICS_LOADING,
  (payload: boolean) => ({ payload })
);

export const setConversationAnalyticsError = createAction(
  SET_CONVERSATION_ANALYTICS_ERROR,
  (payload: string | null) => ({ payload })
);
