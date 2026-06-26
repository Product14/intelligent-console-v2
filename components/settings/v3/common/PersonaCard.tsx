import { Persona } from '@/store-settings/models/persona.model';

import React, { useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IoArrowForward, IoFemale, IoMale } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';

import OnboardingPrimaryButton from '@spyne-console/components/onboarding/buttons/onboarding-primary-button';
import OnboardingSecondaryButton from '@spyne-console/components/onboarding/buttons/onboarding-secondary-button';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { PersonaAudioPlayer } from '../persona-selection/PersonaAudioPlayer';
import { RecommendedTag } from './RecommendedTag';

interface PersonaCardProps {
  persona: Persona;
  isAgentSelected?: boolean;
  isRecommended?: boolean;
  onSelect?: (persona: Persona, name: string) => void;
  onNameUpdate?: (newName: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  isAgentSelected = false,
  isRecommended = false,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(persona.name);
  const [savedName, setSavedName] = useState(persona.name);

  const handleEdit = () => {
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
    <div className="relative flex h-fit w-full p-[3px]">
      {isRecommended && (
        <RecommendedTag svgClassName="absolute left-[-13px] top-[60px] -translate-y-1/2 z-[20]" />
      )}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: isAgentSelected
            ? 'linear-gradient(to right, #8400FF 20%, #E100FF 40%, #32D6FF 60%, #90C2FF 75%, #FF4894 90%)'
            : '#ECECEC',
        }}
      />
      <div className="relative z-10 flex h-fit w-full flex-col gap-5 rounded-[10px] bg-white p-4">
        <div className="flex w-full flex-col gap-3">
          <div
            className="flex h-[328px] w-full items-center justify-center overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getSafeStaticAssetUrl('https://spyne-static.s3.us-east-1.amazonaws.com/card-grad-bg.png')})`,
            }}
          >
            <img
              src={getSafeStaticAssetUrl(persona.imageUrl)}
              alt={persona.name}
              className="relative z-10 h-full w-auto object-contain"
            />
          </div>

          <div className="flex w-full items-center justify-between bg-white">
            <div className="flex flex-1 flex-col items-start justify-center gap-1">
              {isEditing ? (
                <div className="flex w-full items-center justify-between gap-3 border-b border-solid border-[#1111111A] pb-0">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-xl font-semibold leading-7 tracking-[0px] text-[#111] outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    className="text-xl font-semibold leading-6 text-[#4600f2] transition-opacity hover:opacity-70"
                    aria-label="Save persona name"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold leading-7 text-[#111]">
                    {savedName}
                  </h3>
                  <button
                    onClick={handleEdit}
                    className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
                    aria-label="Edit persona name"
                  >
                    <MdEdit className="h-6 w-6 text-[#111]" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-1">
                <div className="flex items-center gap-3">
                  <ReactCountryFlag
                    countryCode={persona.countryCode}
                    svg
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '100%',
                    }}
                  />
                  <p className="text-sm font-medium leading-5 text-[#111]">
                    {persona.supportedLanguages.length > 1
                      ? 'Multilingual'
                      : persona.supportedLanguages[0].languageName}
                    , {persona.nationality}
                  </p>
                </div>
                <div className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFFFF26] p-1 backdrop-blur-md backdrop-filter">
                  {persona.gender === 'male' ? (
                    <IoMale className="h-[18px] w-[18px] text-[#111]" />
                  ) : (
                    <IoFemale className="h-[18px] w-[18px] text-[#111]" />
                  )}
                </div>
              </div>
            </div>

            {!isEditing && (
              <PersonaAudioPlayer
                id={`persona-audio-${persona.templateId}`}
                supportedLanguages={persona.supportedLanguages}
                label="Listen"
                className="!w-[120px] !min-w-[120px]"
              />
            )}
          </div>
        </div>

        {isAgentSelected ? (
          <OnboardingPrimaryButton
            onClick={() => onSelect?.(persona, savedName)}
            className="w-full"
          >
            Select {savedName.split(' ')[0]}
          </OnboardingPrimaryButton>
        ) : (
          <OnboardingSecondaryButton
            onClick={() => onSelect?.(persona, savedName)}
            className="w-full"
          >
            <span className="flex items-center gap-2">
              Select {savedName.split(' ')[0]}{' '}
              <IoArrowForward className="h-7 w-7" />
            </span>
          </OnboardingSecondaryButton>
        )}
      </div>
    </div>
  );
};
