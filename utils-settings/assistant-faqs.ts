export type AssistantType =
  | 'sales'
  | 'service'
  | 'finance'
  | 'parts'
  | 'marketing';
export type AgentCallType = 'inbound' | 'outbound';

export interface AssistantFAQs {
  [assistantType: string]: {
    [callType: string]: string[];
  };
}

export const ASSISTANT_FAQS: AssistantFAQs = {
  sales: {
    inbound: [
      'Do you have a 2020 Toyota Camry available in white?',
      'Can I get the Carfax report for the silver 2019 Ford Escape you have listed online?',
      'Is the black BMW X3 still available, and can I come in for a test drive tomorrow?',
    ],
  },
  service: {
    inbound: [
      'Can I schedule my oil change for this Friday morning?',
      'Do you offer tire alignment services?',
      'My check engine light came on, can I bring the car in today?',
    ],
    outbound: [
      'Your vehicle is part of a safety recall. When can we schedule the repair?',
      "We need to complete a recall service on your car - it's free of charge. What day works best?",
      "There's an urgent recall affecting your model. Can you bring it in this week?",
    ],
  },
};

export const getFAQsByType = (type: string, callType?: string): string[] => {
  const normalizedType = type.toLowerCase() as AssistantType;

  // Try to get FAQs for specific assistant type and call type
  if (callType && ASSISTANT_FAQS[normalizedType]) {
    const normalizedCallType = callType.toLowerCase();
    if (ASSISTANT_FAQS[normalizedType][normalizedCallType]) {
      return ASSISTANT_FAQS[normalizedType][normalizedCallType];
    }
  }

  // Fallback to first available call type for the assistant type
  if (ASSISTANT_FAQS[normalizedType]) {
    const availableCallTypes = Object.keys(ASSISTANT_FAQS[normalizedType]);
    if (availableCallTypes.length > 0) {
      return ASSISTANT_FAQS[normalizedType][availableCallTypes[0]];
    }
  }

  // Final fallback to sales inbound
  return ASSISTANT_FAQS.sales.inbound;
};

export const getFallbackFAQs = (): string[] => {
  return ASSISTANT_FAQS.sales.inbound;
};
