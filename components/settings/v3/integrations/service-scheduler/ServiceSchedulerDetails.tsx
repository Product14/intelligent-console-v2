import { Partner } from '@/models/integrations.model';

import { PartnerDetailsForm } from '@spyne-console/components/onboarding/integrations';

interface ServiceSchedulerDetailsProps {
  selectedProviderId: string;
  getOnSecondaryButtonClickHandler: () => () => void;
  dealerId: string;
  setDealerId: (value: string) => void;
  partners: Partner[];
  oemName: string;
  setOemName: (value: string) => void;
}

export const ServiceSchedulerDetails = ({
  selectedProviderId,
  getOnSecondaryButtonClickHandler,
  dealerId,
  setDealerId,
  partners,
  oemName,
  setOemName,
}: ServiceSchedulerDetailsProps) => {
  return (
    <PartnerDetailsForm
      selectedProviderId={selectedProviderId}
      onBack={getOnSecondaryButtonClickHandler()}
      providerName="Service Scheduler"
      loading={false}
      dealerId={dealerId}
      onDealerIdChange={setDealerId}
      setOemName={setOemName}
      oemName={oemName}
      channelTypes={['API']}
      partners={partners}
      knowYourDealerUrl="https://docs.google.com/document/d/172adgXnpRPqaEUogTVYMt_i9VT_RFmtH-IIX2SDbcgs/edit?usp=sharing"
    />
  );
};
