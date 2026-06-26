import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { OnboardedAgent } from '@/store-settings/models/agents.model';
import { Persona } from '@/store-settings/models/persona.model';

import React, { useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IoFemale, IoLanguage, IoMale } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';
import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';

import { useQueryParams } from '@spyne-console/hooks';

import { StringUtils } from '@/utils-settings/StringUtils';

interface PersonaDetailsProps {
  isEditMode?: boolean;
  persona: Persona | OnboardedAgent;
  agentType: string;
  agentCallType: string;
  onSelectDifferentPersonas?: () => void;
  onSelectMe?: (name: string) => void;
}

export const PersonaDetails: React.FC<PersonaDetailsProps> = ({
  isEditMode,
  persona,
  agentType,
  agentCallType,
  onSelectDifferentPersonas,
  onSelectMe,
}) => {
  const { activeAgentId } = useActiveAgent();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(persona.name ?? '');
  const [savedName, setSavedName] = useState(persona.name ?? '');
  const { queryParams } = useQueryParams();
  const teamAgentMappingId = queryParams?.teamAgentMappingId?.trim();

  const personaType = useMemo(() => {
    return `${StringUtils.toCapitalize(agentType)} ${StringUtils.toCapitalize(agentCallType)} Agent`;
  }, [agentType, agentCallType]);

  const handleEdit = () => {
    if (teamAgentMappingId) return;
    setIsEditing(true);
  };

  const handleSave = () => {
    setSavedName(editedName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(savedName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between gap-8 bg-white px-0 pb-8 pt-5">
      <div className="flex shrink-0 flex-col items-center gap-8">
        <div className="flex w-full shrink-0 flex-col items-center gap-2">
          {isEditing ? (
            <div className="flex w-full items-center justify-between border-b border-solid border-black/10 pb-0 pl-0.5 pr-0">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-[32px] font-medium leading-[44px] tracking-[0px] text-black/80 outline-none"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="text-[20px] font-semibold leading-[24px] text-[#4600f2] transition-opacity hover:opacity-70"
                aria-label="Save persona name"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex w-full shrink-0 items-center justify-center gap-3">
              <p className="text-nowrap text-center text-[40px] font-bold leading-[56px] tracking-[-0.4px] text-[#111]">
                {savedName}
              </p>
              {!teamAgentMappingId && (
                <button
                  onClick={handleEdit}
                  className="flex h-8 w-8 shrink-0 items-center justify-center transition-colors hover:opacity-70"
                  aria-label="Edit persona name"
                >
                  <MdEdit className="h-8 w-8 text-[#111]" />
                </button>
              )}
            </div>
          )}
          <p className="text-nowrap text-center text-2xl leading-[33.6px] text-[#666]">
            {personaType}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2.5">
          <div className="flex shrink-0 items-center gap-2.5 rounded-[125px] bg-black/[0.04] px-4 py-2">
            <ReactCountryFlag
              countryCode={persona.countryCode}
              svg
              style={{
                width: '1.5em',
                height: '1.5em',
                borderRadius: '4px',
              }}
            />
            <p className="text-nowrap text-center text-[15px] leading-[25px] text-black/90">
              {persona.nationality} ({persona.city})
            </p>
          </div>

          {persona.supportedLanguages.length > 0 && (
            <div className="flex shrink-0 items-center gap-2.5 rounded-[125px] bg-black/[0.04] px-4 py-2">
              <IoLanguage className="h-5 w-5 text-black/90" />
              <p className="text-nowrap text-center text-[15px] leading-[25px] text-black/90">
                {persona.supportedLanguages[0].languageName}
              </p>
            </div>
          )}

          <div className="flex shrink-0 items-center rounded-[125px] bg-black/[0.04] px-4 py-2">
            {persona.gender === 'male' ? (
              <IoMale className="h-5 w-5 text-black/90" />
            ) : (
              <IoFemale className="h-5 w-5 text-black/90" />
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-5">
        {(!activeAgentId || isEditMode) && (
          <OnboardingSecondaryButton
            onClick={onSelectDifferentPersonas}
            className="!w-[320px] !rounded-lg !text-lg !font-semibold !leading-7"
          >
            Select Different Personas
          </OnboardingSecondaryButton>
        )}

        <OnboardingPrimaryButton
          onClick={() => onSelectMe?.(savedName)}
          className="!w-[340px]"
        >
          {activeAgentId || isEditMode ? 'Continue' : 'Select Me'}
        </OnboardingPrimaryButton>
      </div>
    </div>
  );
};
