// Central onboarding config knobs. Flip these as backend contracts firm up.

// How "General Details" common-step completion is tracked:
//  - 'common-segment'          : one tracker call against COMMON_SEGMENT (cleanest; needs backend support)
//  - 'replicate-across-segments': mark complete for every contracted agent's segment (no backend change)
export type TrackingMode = 'common-segment' | 'replicate-across-segments';

export const TRACKING_MODE: TrackingMode = 'replicate-across-segments';

// Segment used for rooftop/common tasks when TRACKING_MODE === 'common-segment'.
export const COMMON_SEGMENT = 'common';

// In stub/dev (no real contracted-agents API), render this representative set so
// all sections are exercisable. Live mode replaces this via getContractedAgentsAPI.
export const DEV_DEFAULT_CONTRACTED = true;
