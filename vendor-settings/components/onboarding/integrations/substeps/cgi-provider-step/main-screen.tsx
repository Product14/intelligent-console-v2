import React from 'react';

import Image from 'next/image';

type CgiOption = 'media-cloning' | 'different-partner';

interface MainCgiProviderScreenProps {
  selectedOption: CgiOption;
  onOptionChange: (option: CgiOption) => void;
  onUseDifferentPartner: () => void;
  loading: boolean;
}

const MainCgiProviderScreen: React.FC<MainCgiProviderScreenProps> = ({
  selectedOption,
  onOptionChange,
  onUseDifferentPartner,
  loading,
}) => {
  return (
    <div className="flex w-full flex-col gap-6 overflow-visible pl-3 pt-3">
      {/* Option 1: Connect your CGI Provider */}
      <div
        onClick={() => onOptionChange('different-partner')}
        className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
          selectedOption === 'different-partner'
            ? 'border-2 border-[#111] bg-white'
            : 'border border-[rgba(17,17,17,0.1)] bg-white hover:border-[rgba(17,17,17,0.3)]'
        }`}
      >
        <div className="flex h-full items-center justify-between">
          <div className="flex items-start gap-4">
            {/* Radio button */}
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                selectedOption === 'different-partner'
                  ? 'border-[#111] bg-white'
                  : 'border-[#e5e5e5] bg-white'
              }`}
            >
              {selectedOption === 'different-partner' && (
                <div className="h-[10.5px] w-[10.5px] rounded-full bg-[#111]" />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold leading-6 text-[#111]">
                Connect your CGI Provider
              </h3>
              <p className="w-[433px] text-sm font-normal leading-6 text-[rgba(17,17,17,0.6)]">
                Connect your CGI source to import CGI images
              </p>
            </div>
          </div>

          {/* Partner logos illustration */}
          <div className="absolute bottom-2 right-0 top-2 h-[80px] w-[150px] flex-shrink-0">
            <Image
              src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/dealer-collection-icon.svg"
              alt="CGI Partners"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Option 2: Spyne Media Cloning - Disabled / Coming Soon */}
      <div className="relative cursor-not-allowed rounded-2xl border border-[rgba(17,17,17,0.1)] bg-white p-6 opacity-60">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-4">
            {/* Radio button - always unchecked & greyed */}
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#e5e5e5] bg-white" />

            {/* Content */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold leading-6 text-[#111]">
                  Spyne-Media Cloning
                </h3>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm font-normal leading-6 text-[rgba(17,17,17,0.6)]">
                Import media automatically for every new vehicle with the same
                make, model, year, trim, and color
              </p>
            </div>
          </div>

          {/* Cloning icon illustration */}
          <div className="absolute bottom-2 right-0 top-2 h-[100px] w-[250px] flex-shrink-0">
            <Image
              src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/cloning-icon.png"
              alt="Media Cloning"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainCgiProviderScreen;
