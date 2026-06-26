import { Partner } from '@/models/integrations.model';

import { PartnerDetailsForm } from '@spyne-console/components/onboarding/integrations';

interface CRMDetailsProps {
  selectedProviderId: string;
  getOnSecondaryButtonClickHandler: () => () => void;
  isSubmitting: boolean;
  dealerId: string;
  setDealerId: (value: string) => void;
  partners: Partner[];
  enterpriseId?: string;
  teamId?: string;
}

export const CRMDetails = ({
  selectedProviderId,
  getOnSecondaryButtonClickHandler,
  isSubmitting,
  dealerId,
  setDealerId,
  partners,
  enterpriseId,
  teamId,
}: CRMDetailsProps) => {
  return (
    <PartnerDetailsForm
      selectedProviderId={selectedProviderId}
      onBack={getOnSecondaryButtonClickHandler()}
      providerName="CRM"
      loading={isSubmitting}
      dealerId={dealerId}
      onDealerIdChange={setDealerId}
      partners={partners}
      channelTypes={['API']}
      enterpriseId={enterpriseId}
      teamId={teamId}
      providerType="crm"
      showVerify
      knowYourDealerUrl="https://docs.google.com/document/d/172adgXnpRPqaEUogTVYMt_i9VT_RFmtH-IIX2SDbcgs/edit?usp=sharing"
    />
  );
};
