import React, { useEffect, useState } from 'react';

import Image from 'next/image';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-() ]*$/;
const MAX_INPUT_LENGTH = 250;

export interface ImsNotListedScreenProps {
  providerName?: string;
  showHeader?: boolean;
  showPocFields?: boolean;
  onBack: () => void;
  partnerName: string;
  onPartnerNameChange: (value: string) => void;
  pocName: string;
  onPocNameChange: (value: string) => void;
  pocEmail: string;
  onPocEmailChange: (value: string) => void;
  pocContact: string;
  onPocContactChange: (value: string) => void;
  onValidationChange?: (hasError: boolean) => void;
}

const ImsNotListedScreen: React.FC<ImsNotListedScreenProps> = ({
  providerName = 'IMS',
  showHeader = true,
  showPocFields = true,
  onBack,
  partnerName,
  onPartnerNameChange,
  pocName,
  onPocNameChange,
  pocEmail,
  onPocEmailChange,
  pocContact,
  onPocContactChange,
  onValidationChange,
}) => {
  const [pocNameError, setPocNameError] = useState('');
  const [pocEmailError, setPocEmailError] = useState('');
  const [pocContactError, setPocContactError] = useState('');

  // Notify parent about validation state whenever errors or required fields change
  useEffect(() => {
    const hasPocError = showPocFields
      ? pocNameError !== '' ||
        pocEmailError !== '' ||
        pocContactError !== '' ||
        (pocEmail.trim() !== '' && !EMAIL_REGEX.test(pocEmail))
      : false;

    const hasValidationError = partnerName.trim() === '' || hasPocError;

    onValidationChange?.(hasValidationError);
  }, [
    showPocFields,
    pocNameError,
    pocEmailError,
    pocContactError,
    partnerName,
    pocEmail,
    onValidationChange,
  ]);

  const handlePocNameChange = (value: string) => {
    if (value.length > MAX_INPUT_LENGTH) {
      setPocNameError(
        `POC Name must be ${MAX_INPUT_LENGTH} characters or less`
      );
      return;
    }
    setPocNameError('');
    onPocNameChange(value);
  };

  const handlePocEmailChange = (value: string) => {
    onPocEmailChange(value);
    if (value === '') {
      setPocEmailError('');
    } else if (!EMAIL_REGEX.test(value)) {
      setPocEmailError('Please enter a valid email address');
    } else {
      setPocEmailError('');
    }
  };

  const handlePocContactChange = (value: string) => {
    if (value !== '' && !PHONE_REGEX.test(value)) {
      setPocContactError('Please enter a valid phone number');
      return;
    }
    setPocContactError('');
    onPocContactChange(value);
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-y-auto pt-11">
      {/* <button
        type="button"
        onClick={onBack}
        className="absolute left-10 top-8 flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white transition-colors hover:bg-gray-50"
      >
        <BiArrowBack className="h-7 w-7 text-black/80" />
      </button> */}

      {/* Header with Spyne logo */}
      {showHeader && (
        <div className="mb-10 flex flex-col items-center gap-6">
          {/* Spyne icon */}
          <Image
            src="https://media.spyneai.com/unsafe/filters:format(webp)/d20uiuzezo3er4.cloudfront.net/onboarding/spyne-logo-new.svg"
            alt="Spyne"
            width={500}
            height={500}
            className="relative z-10 h-[200px] w-[200px]"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="justify-start text-center font-['Inter'] text-3xl font-bold leading-9 text-neutral-900">
              Request a New Integration
            </div>
            <div className="justify-start text-center font-['Inter'] text-base font-normal leading-6 text-stone-500">
              Provide your platform details and contact information, our team
              will get the integration started right away
            </div>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="inline-flex w-full max-w-[800px] flex-col items-start justify-start gap-6 rounded-2xl bg-white p-20 outline outline-1 outline-offset-[-1px] outline-zinc-100">
        {/* Integration Name */}
        <div className="flex w-full flex-col gap-2">
          <label
            htmlFor="ims-name"
            className="font-['Inter'] text-base font-semibold text-black"
          >
            Your {providerName} name
          </label>
          <div className="flex h-12 items-center gap-4 rounded-xl bg-white px-3 py-2 outline outline-2 outline-offset-[-2px] outline-gray-200">
            <input
              id="ims-name"
              type="text"
              value={partnerName}
              onChange={(e) => onPartnerNameChange(e.target.value)}
              maxLength={MAX_INPUT_LENGTH}
              placeholder={`Enter your ${providerName} name here`}
              className="w-full bg-transparent font-['Inter'] text-base font-normal leading-6 text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* POC Fields */}
        {showPocFields && (
          <>
            {/* POC Name */}
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="poc-name"
                className="font-['Inter'] text-base font-semibold text-black"
              >
                POC Name
              </label>
              <div
                className={`flex h-12 items-center gap-4 rounded-xl bg-white px-3 py-2 outline outline-2 outline-offset-[-2px] ${pocNameError ? 'outline-red-500' : 'outline-gray-200'}`}
              >
                <input
                  id="poc-name"
                  type="text"
                  value={pocName}
                  onChange={(e) => handlePocNameChange(e.target.value)}
                  maxLength={MAX_INPUT_LENGTH}
                  placeholder="Enter your POC name here"
                  className="w-full bg-transparent font-['Inter'] text-base font-normal leading-6 text-neutral-900 outline-none placeholder:text-neutral-400"
                />
              </div>
              {pocNameError && (
                <p className="mt-1 text-sm text-red-500">{pocNameError}</p>
              )}
            </div>

            {/* POC Email */}
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="poc-email"
                className="font-['Inter'] text-base font-semibold text-black"
              >
                Your POC email address
              </label>
              <div
                className={`flex h-12 items-center gap-4 rounded-xl bg-white px-3 py-2 outline outline-2 outline-offset-[-2px] ${pocEmailError ? 'outline-red-500' : 'outline-gray-200'}`}
              >
                <input
                  id="poc-email"
                  type="email"
                  value={pocEmail}
                  onChange={(e) => handlePocEmailChange(e.target.value)}
                  placeholder="Enter POC email address here"
                  className="w-full bg-transparent font-['Inter'] text-base font-normal leading-6 text-neutral-900 outline-none placeholder:text-neutral-400"
                />
              </div>
              {pocEmailError && (
                <p className="mt-1 text-sm text-red-500">{pocEmailError}</p>
              )}
            </div>

            {/* POC Mobile Number */}
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="poc-contact"
                className="font-['Inter'] text-base font-semibold text-black"
              >
                Your POC Mobile Number
              </label>
              <div
                className={`flex h-12 items-center gap-4 rounded-xl bg-white px-3 py-2 outline outline-2 outline-offset-[-2px] ${pocContactError ? 'outline-red-500' : 'outline-gray-200'}`}
              >
                <input
                  id="poc-contact"
                  type="tel"
                  value={pocContact}
                  onChange={(e) => handlePocContactChange(e.target.value)}
                  placeholder="Enter POC mobile number here"
                  className="w-full bg-transparent font-['Inter'] text-base font-normal leading-6 text-neutral-900 outline-none placeholder:text-neutral-400"
                />
              </div>
              {pocContactError && (
                <p className="mt-1 text-sm text-red-500">{pocContactError}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImsNotListedScreen;
