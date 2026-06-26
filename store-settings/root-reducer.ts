import actionItemsReducer from '@/store-settings/reducers/action-items.reducer';
import appointmentReducer from '@/store-settings/reducers/appointment.reducer';
import assistantReducer from '@/store-settings/reducers/assistant.reducer';
import conversationReducer from '@/store-settings/reducers/conversation.reducer';
import leadsReducer from '@/store-settings/reducers/leads.reducer';
import onboardingReducer from '@/store-settings/reducers/onboarding.reducer';
import personasReducer from '@/store-settings/reducers/persona.reducer';
import serviceReducer from '@/store-settings/reducers/service.reducer';
import servicesReducer from '@/store-settings/reducers/services.reducer';
import { combineReducers } from '@reduxjs/toolkit';
// @ts-ignore
import { globalReducers } from '@spyne-console/store';

import activitiesReducer from './reducers/activities.reducer';
import agentTypesReducer from './reducers/agent-types.reducer';
import agentsReducer from './reducers/agents.reducer';
import analyticsReducer from './reducers/analytics.reducer';
import campaignReducer from './reducers/campaign.reducer';
import customersReducer from './reducers/customers.reducer';
import onboardingProgressReducer from './reducers/onboarding-progress.reducer';
import personaReducer from './reducers/persona.reducer';
import sourcesReducer from './reducers/sources.reducer';

const rootReducer = combineReducers({
  ...globalReducers,
  campaign: campaignReducer,
  assistant: assistantReducer,
  analytics: analyticsReducer,
  conversation: conversationReducer,
  leads: leadsReducer,
  services: servicesReducer,
  service: serviceReducer,
  onboarding: onboardingReducer,
  appointment: appointmentReducer,
  actionItems: actionItemsReducer,
  activities: activitiesReducer,
  agentTypes: agentTypesReducer,
  agents: agentsReducer,
  onboardingProgress: onboardingProgressReducer,
  persona: personaReducer,
  customers: customersReducer,
  sources: sourcesReducer,
  // Add any local reducers here if needed
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
