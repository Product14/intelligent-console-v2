// US state codes + names. Used by the Shipping policy out-of-state
// registration multi-select. Includes DC for completeness — dealers
// regularly register to DC residents.

export interface UsState {
  value: string; // 2-letter code
  label: string; // 2-letter code shown to user (compact display)
  name: string; // full name (used in summaries)
}

export const US_STATES: UsState[] = [
  { value: 'AL', label: 'AL', name: 'Alabama' },
  { value: 'AK', label: 'AK', name: 'Alaska' },
  { value: 'AZ', label: 'AZ', name: 'Arizona' },
  { value: 'AR', label: 'AR', name: 'Arkansas' },
  { value: 'CA', label: 'CA', name: 'California' },
  { value: 'CO', label: 'CO', name: 'Colorado' },
  { value: 'CT', label: 'CT', name: 'Connecticut' },
  { value: 'DE', label: 'DE', name: 'Delaware' },
  { value: 'DC', label: 'DC', name: 'District of Columbia' },
  { value: 'FL', label: 'FL', name: 'Florida' },
  { value: 'GA', label: 'GA', name: 'Georgia' },
  { value: 'HI', label: 'HI', name: 'Hawaii' },
  { value: 'ID', label: 'ID', name: 'Idaho' },
  { value: 'IL', label: 'IL', name: 'Illinois' },
  { value: 'IN', label: 'IN', name: 'Indiana' },
  { value: 'IA', label: 'IA', name: 'Iowa' },
  { value: 'KS', label: 'KS', name: 'Kansas' },
  { value: 'KY', label: 'KY', name: 'Kentucky' },
  { value: 'LA', label: 'LA', name: 'Louisiana' },
  { value: 'ME', label: 'ME', name: 'Maine' },
  { value: 'MD', label: 'MD', name: 'Maryland' },
  { value: 'MA', label: 'MA', name: 'Massachusetts' },
  { value: 'MI', label: 'MI', name: 'Michigan' },
  { value: 'MN', label: 'MN', name: 'Minnesota' },
  { value: 'MS', label: 'MS', name: 'Mississippi' },
  { value: 'MO', label: 'MO', name: 'Missouri' },
  { value: 'MT', label: 'MT', name: 'Montana' },
  { value: 'NE', label: 'NE', name: 'Nebraska' },
  { value: 'NV', label: 'NV', name: 'Nevada' },
  { value: 'NH', label: 'NH', name: 'New Hampshire' },
  { value: 'NJ', label: 'NJ', name: 'New Jersey' },
  { value: 'NM', label: 'NM', name: 'New Mexico' },
  { value: 'NY', label: 'NY', name: 'New York' },
  { value: 'NC', label: 'NC', name: 'North Carolina' },
  { value: 'ND', label: 'ND', name: 'North Dakota' },
  { value: 'OH', label: 'OH', name: 'Ohio' },
  { value: 'OK', label: 'OK', name: 'Oklahoma' },
  { value: 'OR', label: 'OR', name: 'Oregon' },
  { value: 'PA', label: 'PA', name: 'Pennsylvania' },
  { value: 'RI', label: 'RI', name: 'Rhode Island' },
  { value: 'SC', label: 'SC', name: 'South Carolina' },
  { value: 'SD', label: 'SD', name: 'South Dakota' },
  { value: 'TN', label: 'TN', name: 'Tennessee' },
  { value: 'TX', label: 'TX', name: 'Texas' },
  { value: 'UT', label: 'UT', name: 'Utah' },
  { value: 'VT', label: 'VT', name: 'Vermont' },
  { value: 'VA', label: 'VA', name: 'Virginia' },
  { value: 'WA', label: 'WA', name: 'Washington' },
  { value: 'WV', label: 'WV', name: 'West Virginia' },
  { value: 'WI', label: 'WI', name: 'Wisconsin' },
  { value: 'WY', label: 'WY', name: 'Wyoming' },
];
