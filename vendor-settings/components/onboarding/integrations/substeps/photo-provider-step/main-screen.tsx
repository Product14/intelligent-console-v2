import React, { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { IoIosInformationCircle } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';

import Image from 'next/image';

import PartnerIconWithFallback from '../../partner-icon-with-fallback';
import RecommendedBadge from './recommended-badge';

interface InventoryProviderInfo {
  partnerId: string;
  partnerName: string;
  icon: string;
}

interface MainPhotoProviderScreenProps {
  hasInventoryFtp: boolean;
  inventoryProviderInfo: InventoryProviderInfo | null;
  useInventoryIms: boolean;
  useDifferentPartner: boolean;
  onSelectInventoryIms: () => void;
  onSelectDifferentPartner: () => void;
  loading: boolean;
}

const MainPhotoProviderScreen: React.FC<MainPhotoProviderScreenProps> = ({
  hasInventoryFtp,
  inventoryProviderInfo,
  useInventoryIms,
  useDifferentPartner,
  onSelectInventoryIms,
  onSelectDifferentPartner,
  loading,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="scrollbar-hide flex w-full flex-col overflow-x-auto overflow-y-auto">
      {/* Main Content Card */}
      <div className="flex-1 pl-4 pt-4">
        <div
          className="relative mb-6 overflow-visible rounded-[32px] p-[2px]"
          style={{
            background:
              'linear-gradient(135deg, #8514FF 0%, #3ECEF9 33%, #C901FF 66%, #FF4894 100%)',
          }}
        >
          <RecommendedBadge style={{ left: '-13px', top: '-13px' }} />

          <div
            className="overflow-hidden px-10 py-8"
            style={{
              background:
                'linear-gradient(97deg, rgba(255, 255, 255, 1) 20%, rgba(244, 237, 255, 1) 100%)',
              borderRadius: '30px',
              borderTopLeftRadius: '0',
            }}
          >
            <div className="relative z-10 flex justify-between">
              {/* Left Content */}
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-[#111]">Spnye App</h2>
                  <span className="border-navy_blue-2/10 text-navy_blue-2 bg-navy_blue-2/10 inline-flex items-center rounded-full border px-3 py-1 text-base font-medium">
                    Included in Plan
                  </span>
                </div>

                <p className="mb-6 text-base font-normal leading-6 text-[#666]">
                  Complete default media solution with App &amp; Console for
                  seamless workflow
                </p>

                <div className="mb-6 flex flex-col gap-4">
                  <p className="text-sm font-medium text-[#666]">Why app?</p>
                  <ul className="flex flex-col gap-4">
                    <FeatureItem text="Go live faster" />
                    <FeatureItem text="Guided shoot flow with On-edge technology" />
                    <FeatureItem text="Fast Inventory syncing and tracking" />
                    <FeatureItem text="High quality 360 spins & Videos of your vehicle" />
                  </ul>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://play.google.com/store"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Image
                        src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/google-play.svg"
                        alt="Get it on Google Play"
                        width={140}
                        height={42}
                        className="h-[42px] w-auto"
                      />
                    </a>
                    <a
                      href="https://apps.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Image
                        src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/app-store.svg"
                        alt="Download on App Store"
                        width={140}
                        height={42}
                        className="h-[42px] w-auto"
                      />
                    </a>
                  </div>

                  <a
                    href="https://play.google.com/store/apps/details?id=com.spyneai&hl=en_IN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                  >
                    <div className="h-20 w-20 rounded-lg border border-gray-200 bg-white p-1">
                      <Image
                        src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/spyne-app-android.jpeg"
                        alt="Scan to download App"
                        width={64}
                        height={64}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="mt-1 flex flex-col items-center">
                      <span className="text-xs text-[#666]">
                        Scan to download App
                      </span>
                      <div className="text-xs text-[#666]">(Android)</div>
                    </div>
                  </a>
                  <a
                    href="https://apps.apple.com/in/app/spyne-automotive/id1570801766"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                  >
                    <div className="h-20 w-20 rounded-lg border border-gray-200 bg-white p-1">
                      <Image
                        src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/spyne-app-ios.jpeg"
                        alt="Scan to download App"
                        width={64}
                        height={64}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="mt-1 flex flex-col items-center">
                      <span className="text-xs text-[#666]">
                        Scan to download App
                      </span>
                      <div className="text-xs text-[#666]">(iOS)</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Content - Phone mockups */}
              <div className="relative h-[400px] w-[500px] flex-shrink-0">
                <div className="absolute right-0 top-0 z-20">
                  <Image
                    src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/iphone-vertical.svg"
                    alt="Spyne App Preview - Vertical"
                    width={182}
                    height={350}
                    className="h-[350px] w-auto object-contain"
                  />
                </div>
                <div className="absolute bottom-14 left-0 z-10">
                  <Image
                    src="https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/iphone-horizontal.svg"
                    alt="Spyne App Preview - Horizontal"
                    width={380}
                    height={172}
                    className="h-auto w-[380px] object-contain"
                  />
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="border-blue-light/10 absolute bottom-0 right-0 z-30 flex items-center gap-2 rounded-lg border bg-transparent px-4 py-2 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <HiOutlineDocumentText className="text-blue-light h-4 w-4" />
                  <span className="text-blue-light text-sm font-medium">
                    View App Tutorial
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Tutorial Modal */}
        {isVideoModalOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-50 cursor-default bg-black/50 backdrop-blur-sm"
              onClick={() => setIsVideoModalOpen(false)}
              aria-label="Close modal"
            />
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
              <div className="pointer-events-auto relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 pb-10">
                  <div className="flex items-center gap-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-cyan-100">
                      <Image
                        src="https://spyne-static.s3.us-east-1.amazonaws.com/spyne-logo-new.svg"
                        alt="Spyne"
                        width={24}
                        height={24}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="mb-1 font-['Inter'] text-lg font-semibold leading-7 text-black/90">
                        Spyne App Tutorial
                      </h3>
                      <p className="font-['Inter'] text-sm font-normal leading-5 text-black/60">
                        Watch Spyne App tutorial for media input, inventory
                        management & more
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                    aria-label="Close modal"
                  >
                    <IoClose className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube.com/embed/1gfkrAmR4Dg?autoplay=1"
                    title="How To Use Spyne App For Cataloging"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Additional Options Section - Only show if inventory has FTP config */}
        {hasInventoryFtp && inventoryProviderInfo ? (
          <div className="mb-6">
            <p className="mb-4 text-base font-normal leading-6 text-[#666]">
              Add more options for media with Spyne App
            </p>
            <div className="flex flex-col gap-3">
              {/* Option 1: Read Media from IMS partner */}
              <div
                className="relative cursor-pointer rounded-xl p-[1.5px] transition-all duration-200"
                style={
                  useInventoryIms
                    ? {
                        background:
                          'linear-gradient(135deg, #8514FF 0%, #3ECEF9 33%, #C901FF 66%, #FF4894 100%)',
                      }
                    : undefined
                }
                onClick={onSelectInventoryIms}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    onSelectInventoryIms();
                }}
                role="button"
                tabIndex={0}
              >
                <div
                  className={`flex cursor-pointer items-center justify-between rounded-[10px] bg-white p-4 transition-colors ${!useInventoryIms ? 'rounded-xl border border-[rgba(0,0,0,0.1)] hover:border-gray-300' : ''}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="media-source"
                        checked={useInventoryIms}
                        onChange={() => {}}
                        className="pointer-events-none h-5 w-5 cursor-pointer border-gray-300 accent-black"
                      />
                      <span className="text-lg font-medium text-[#111]">
                        Read Media from IMS partner
                      </span>
                      {inventoryProviderInfo.partnerId ? (
                        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                          <PartnerIconWithFallback
                            icon={inventoryProviderInfo.icon}
                            name={inventoryProviderInfo.partnerName}
                            size={20}
                            rounded="rounded"
                          />
                          <span className="text-sm font-medium text-[#666]">
                            {inventoryProviderInfo.partnerName}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(133, 20, 255, 0.1) 0%, rgba(62, 206, 249, 0.1) 100%)',
                            border: '1px solid rgba(133, 20, 255, 0.3)',
                            color: '#0891b2',
                          }}
                        >
                          Not Listed-Request Raised for IMS partner
                        </span>
                      )}
                    </div>
                    <p className="ml-8 text-sm text-[#666]">
                      Get Media for existing Inventory from Spyne platforms
                      &amp; partners
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Use different Partner for media input */}
              <div
                className="relative cursor-pointer rounded-xl p-[1.5px] transition-all duration-200"
                style={
                  useDifferentPartner
                    ? {
                        background:
                          'linear-gradient(135deg, #8514FF 0%, #3ECEF9 33%, #C901FF 66%, #FF4894 100%)',
                      }
                    : undefined
                }
                onClick={onSelectDifferentPartner}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    onSelectDifferentPartner();
                }}
                role="button"
                tabIndex={0}
              >
                <div
                  className={`flex cursor-pointer items-center rounded-[10px] bg-white p-4 transition-colors ${!useDifferentPartner ? 'rounded-xl border border-[rgba(0,0,0,0.1)] hover:border-gray-300' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="media-source"
                      checked={useDifferentPartner}
                      onChange={() => {}}
                      className="pointer-events-none h-5 w-5 cursor-pointer border-gray-300 accent-black"
                    />
                    <span className="text-lg font-medium text-[#111]">
                      Use different Partner for media input
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="inline-flex w-full items-center justify-start gap-3 self-stretch rounded-lg bg-[#EBFAFF] py-2 pl-4 pr-3 outline outline-1 outline-offset-[-1px] outline-sky-500/20">
              <IoIosInformationCircle className="h-5 w-5 text-[#1890FF]" />
              <span className="font-['Inter'] text-sm font-semibold leading-5 text-blue-900">
                You will be using Spyne App to add Inventory & Media
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for feature list items
const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center gap-2">
    <FaCheckCircle className="h-5 w-5 text-green-600" />
    <span className="text-sm text-[#333]">{text}</span>
  </li>
);

export default MainPhotoProviderScreen;
