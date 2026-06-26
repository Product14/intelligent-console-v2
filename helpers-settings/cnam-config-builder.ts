export const BUSINESS_TYPES = [
  { value: 'cooperative', code: 'Co-operative', label: 'Co-operative' },
  { value: 'corporation', code: 'Corporation', label: 'Corporation' },
  { value: 'government', code: 'Government', label: 'Government' },
  {
    value: 'limited_liability_corporation',
    code: 'Limited Liability Corporation',
    label: 'Limited Liability Corporation',
  },
  {
    value: 'non_profit_corporation',
    code: 'Non-profit Corporation',
    label: 'Non-profit Corporation',
  },
  { value: 'partnership', code: 'Partnership', label: 'Partnership' },
  {
    value: 'private_corporation',
    code: 'Private Corporation',
    label: 'Private Corporation',
  },
  {
    value: 'public_corporation',
    code: 'Public Corporation',
    label: 'Public Corporation',
  },
  {
    value: 'sole_proprietorship',
    code: 'Sole Proprietorship',
    label: 'Sole Proprietorship',
  },
] as const;

export const BUSINESS_INDUSTRIES = [
  { value: 'agriculture', code: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'automotive', code: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'banking', code: 'BANKING', label: 'Banking' },
  { value: 'consumer', code: 'CONSUMER', label: 'Consumer' },
  { value: 'education', code: 'EDUCATION', label: 'Education' },
  { value: 'electronics', code: 'ELECTRONICS', label: 'Electronics' },
  { value: 'energy', code: 'ENERGY', label: 'Energy' },
  { value: 'engineering', code: 'ENGINEERING', label: 'Engineering' },
  {
    value: 'fast_moving_consumer_goods',
    code: 'FAST_MOVING_CONSUMER_GOODS',
    label: 'Fast Moving Consumer Goods',
  },
  { value: 'financial', code: 'FINANCIAL', label: 'Financial' },
  { value: 'fintech', code: 'FINTECH', label: 'Fintech' },
  {
    value: 'food_and_beverage',
    code: 'FOOD_AND_BEVERAGE',
    label: 'Food And Beverage',
  },
  { value: 'government', code: 'GOVERNMENT', label: 'Government' },
  { value: 'healthcare', code: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'hospitality', code: 'HOSPITALITY', label: 'Hospitality' },
  { value: 'insurance', code: 'INSURANCE', label: 'Insurance' },
  { value: 'jewelry', code: 'JEWELRY', label: 'Jewelry' },
  { value: 'legal', code: 'LEGAL', label: 'Legal' },
  {
    value: 'manufacturing',
    code: 'MANUFACTURING',
    label: 'Manufacturing',
  },
  { value: 'media', code: 'MEDIA', label: 'Media' },
  {
    value: 'not_for_profit',
    code: 'NOT_FOR_PROFIT',
    label: 'Not For Profit',
  },
  { value: 'oil_and_gas', code: 'OIL_AND_GAS', label: 'Oil And Gas' },
  { value: 'online', code: 'ONLINE', label: 'Online' },
  {
    value: 'raw_materials',
    code: 'RAW_MATERIALS',
    label: 'Raw Materials',
  },
  {
    value: 'real_estate',
    code: 'REAL_ESTATE',
    label: 'Real Estate',
  },
  { value: 'religion', code: 'RELIGION', label: 'Religion' },
  { value: 'retail', code: 'RETAIL', label: 'Retail' },
  { value: 'technology', code: 'TECHNOLOGY', label: 'Technology' },
  {
    value: 'telecommunications',
    code: 'TELECOMMUNICATIONS',
    label: 'Telecommunications',
  },
  {
    value: 'transportation',
    code: 'TRANSPORTATION',
    label: 'Transportation',
  },
  { value: 'travel', code: 'TRAVEL', label: 'Travel' },
] as const;

export const buildCnameRegistrationPayload = (
  formData: any,
  enterpriseId: string,
  teamId: string
) => {
  const business = formData?.businessDetails;
  const rooftopAddress = formData?.rooftopAddress;

  const selectedType =
    BUSINESS_TYPES.find((type) => type.value === business?.businessType) ??
    null;

  const selectedIndustry =
    BUSINESS_INDUSTRIES.find(
      (industry) => industry.value === business?.businessIndustry
    ) ?? null;

  return {
    enterpriseId,
    teamId,
    businessDetails: {
      name: business?.legalBusinessName ?? '',
      displayName: business?.callerIdDisplayName ?? '',
      identity: 'direct',
      type: selectedType?.label ?? '',
      industry: selectedIndustry?.code ?? 'AUTOMOTIVE',
      operationRegion: 'USA_AND_CANADA',
      registrationIdType: 'USA: Employer Identification Number (EIN)',
      registrationIdValue: business?.employerIdentificationNumber ?? '',
      website: formData?.website ?? '',
      address: {
        street:
          `${rooftopAddress?.addressLine1}${rooftopAddress?.addressLine2 ? `, ${rooftopAddress?.addressLine2}` : ''}` ||
          '',
        city: rooftopAddress?.city ?? '',
        state: rooftopAddress?.state || '',
        zip: rooftopAddress?.zipcode || '',
        country: 'US',
      },
    },
    authorizedRepresentatives:
      business?.representatives
        ?.filter(
          (rep: any) =>
            rep.firstName || rep.lastName || rep.email || rep.phoneNumber
        )
        ?.map((rep: any) => ({
          firstName: rep.firstName ?? '',
          lastName: rep.lastName ?? '',
          email: rep.email ?? '',
          phoneNumber: rep.phoneNumber ?? '',
          title: rep.title ?? '',
          position: rep.position ?? '',
        })) ?? [],
  };
};
