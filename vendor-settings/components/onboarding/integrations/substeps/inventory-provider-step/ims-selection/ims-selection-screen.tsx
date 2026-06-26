import React from 'react';

import {
  IMS_ALTERNATIVE_OPTIONS,
  ImsOptionType,
  PartnersSelection,
} from '../../../index';
import type { Partner } from '../../../types';
import ImsAlternativeOption from '../ims-alternative-option';

export type SelectionType =
  | 'ims-provider'
  | 'public-api'
  | 'no-ims'
  | 'ims-not-listed'
  | null;

interface ImsSelectionScreenProps {
  selectedProviderId: string | null;
  selectedOptionType: SelectionType;
  onProviderSelect: (providerId: string) => void;
  onProviderDeselect: () => void;
  onAlternativeSelect: (optionType: ImsOptionType) => void;
  onImsNotListedSelect: () => void;
  partners: Partner[];
  loadingPartners?: boolean;
}

const ImsSelectionScreen: React.FC<ImsSelectionScreenProps> = ({
  selectedProviderId,
  selectedOptionType,
  onProviderSelect,
  onProviderDeselect,
  onAlternativeSelect,
  onImsNotListedSelect,
  partners,
  loadingPartners,
}) => {
  const handleProviderClick = (providerId: string) => {
    onProviderSelect(providerId);
  };

  const handleAlternativeClick = (optionId: string) => {
    onAlternativeSelect(optionId as ImsOptionType);
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-2">
      <PartnersSelection
        providerName={'IMS'}
        partnersData={partners}
        selectedPartnerId={selectedProviderId}
        selectedOptionType={
          selectedOptionType === 'ims-provider'
            ? 'partner'
            : selectedOptionType === 'ims-not-listed'
              ? 'not-listed'
              : null
        }
        handlePartnerClick={handleProviderClick}
        onImsNotListedSelect={onImsNotListedSelect}
        onPartnerDeselect={onProviderDeselect}
        loading={loadingPartners}
      />

      {/* OR Divider */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="h-px w-[30%] bg-[rgba(0,0,0,0.1)]" />
        <span className="text-lg font-normal leading-7 text-[rgba(0,0,0,0.1)]">
          OR
        </span>
        <div className="h-px w-[30%] bg-[rgba(0,0,0,0.1)]" />
      </div>

      {/* Alternative Options */}
      <div className="mb-8 flex flex-col gap-5">
        {IMS_ALTERNATIVE_OPTIONS.map((option) => (
          <ImsAlternativeOption
            key={option.id}
            id={option.id}
            title={option.title}
            description={option.description}
            externalLink={option.externalLink}
            isSelected={selectedOptionType === option.id}
            onClick={handleAlternativeClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ImsSelectionScreen;
