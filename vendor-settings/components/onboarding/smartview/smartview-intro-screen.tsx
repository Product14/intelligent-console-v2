import React, { useState } from 'react';

import Image from 'next/image';

import Toggle from '@spyne-console/design-system/toggle';

import { cn } from '@spyne-console/utils/cn';

import type { SmartViewEntityConfig } from './types';

interface SmartViewIntroScreenProps {
  readonly onNext: () => void;
  readonly product: 'studio' | 'vini';
  readonly entityConfig: SmartViewEntityConfig | null;
  readonly toggle: boolean;
  readonly isToggleUpdating: boolean;
  readonly onToggle: () => void;
  readonly onChangeScript?: () => void;
}

const FEATURES = [
  'Studio-grade images & 360 spins in minutes',
  'Integration with internal systems',
  'Instant syndication to all platforms',
  'High Engagement',
  'Faster Time Go-Live',
];

const VINI_FEATURES = [
  'Instant answers without leaving the page',
  'One-click access to call, chat, or email',
  'Skip long forms and connect immediately',
  'Personalised support at every stage of your search',
  'A faster, more seamless car-buying experience',
];

const BULLET_STAR_URL =
  'https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/bullet-star.svg';

const VINI_PILL_URL =
  'https://spyne-static.s3.us-east-1.amazonaws.com/smartViewPillScaled.png';

const TEMPLATE_URLS = {
  t1: 'https://assets.spyne.ai/360?version=v3&enterprise_id=88135ef45&sku_name=2e59c01f60ed4e38990e1c8796f7deeb_683d9e2175c6691b10745c53&template=t1&spin=1&catalog=3&feature_video=2&demo=true',
  t2: 'https://assets.spyne.ai/360?version=v3&enterprise_id=88135ef45&sku_name=2e59c01f60ed4e38990e1c8796f7deeb_683d9e2175c6691b10745c53&template=t2&spin=1&catalog=3&feature_video=2&demo=true',
};

const SmartViewIntroScreen: React.FC<SmartViewIntroScreenProps> = ({
  onNext,
  product,
  entityConfig,
  toggle,
  isToggleUpdating,
  onToggle,
  onChangeScript,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'t1' | 't2'>('t1');
  return (
    <div className="mt-6 flex h-full w-full flex-col">
      {/* Main content */}
      <div className="flex flex-1 gap-8">
        {/* Left side - Template preview */}
        <div className="flex w-full flex-col bg-white">
          <div className="mb-4 inline-flex items-start justify-between self-stretch rounded-xl p-4 outline outline-1 outline-offset-[-1px] outline-black/10">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <div className="font-['Inter'] text-lg font-semibold leading-6 text-neutral-900">
                  {product === 'studio'
                    ? 'Enable Smart View '
                    : 'Enable VINI widget in Smart View '}
                </div>
                <div className="font-['Inter'] text-sm font-normal leading-5 text-stone-500">
                  Enable automated quick responses to new leads
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Toggle
                id="smartview-toggle"
                toggle={toggle}
                toggleHandler={onToggle}
                disabled={isToggleUpdating}
              />
              <div className="font-['Inter'] text-base font-medium leading-5 text-black">
                {toggle ? 'ON' : 'OFF'}
              </div>
              {entityConfig?.script_url && (
                <div className="ml-2 inline-flex items-center justify-center gap-4 rounded-full px-3 py-1.5 outline outline-1 outline-offset-[-1px] outline-emerald-700/10">
                  <div className="flex items-center gap-[6px]">
                    <svg
                      className="h-3.5 w-3.5 text-emerald-700"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-['Inter'] text-sm font-semibold leading-6 text-emerald-700">
                      Script Generated
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onChangeScript}
                    className="rounded-full font-['Inter'] text-sm font-semibold leading-5 text-violet-700 hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Template tabs */}
          <div className="mb-4 inline-flex h-8 w-fit items-center justify-center rounded-md bg-[#000033]/[5.88%] p-0.5">
            <button
              type="button"
              onClick={() => setSelectedTemplate('t1')}
              className={`rounded-md px-[14px] py-1 text-sm leading-5 transition-colors ${
                selectedTemplate === 't1'
                  ? 'bg-black text-white'
                  : 'bg-transparent font-normal text-black/80 hover:bg-gray-50'
              }`}
            >
              Template 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('t2')}
              className={`rounded-md px-[14px] py-1 text-sm leading-5 transition-colors ${
                selectedTemplate === 't2'
                  ? 'bg-black text-white'
                  : 'bg-transparent font-normal text-black/80 hover:bg-gray-50'
              }`}
            >
              Template 2
            </button>
          </div>
          <div className="flex gap-4">
            {/* Preview iframe container */}
            <div
              className={`relative min-h-[300px] flex-1 overflow-hidden rounded-2xl bg-gray-100 ${
                selectedTemplate === 't1' ? 'aspect-[1.41]' : 'aspect-[3]'
              }`}
            >
              {/* VINI pill overlay */}
              {product === 'vini' && (
                <div
                  className={cn(
                    'pointer-events-none absolute top-[12px] z-10 flex h-fit w-full',
                    selectedTemplate === 't1'
                      ? 'right-[16px] justify-end'
                      : 'left-[16px]'
                  )}
                >
                  <img
                    src={VINI_PILL_URL}
                    alt="VINI widget"
                    width={selectedTemplate === 't1' ? '65%' : '50%'}
                    height="auto"
                  />
                </div>
              )}
              {/* Template 1 iframe - hidden when t2 is selected */}
              <iframe
                src={TEMPLATE_URLS.t1}
                title="SmartView Template 1"
                className={`absolute inset-0 h-full w-full border-0 ${
                  selectedTemplate === 't1' ? 'visible' : 'invisible'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {/* Template 2 iframe - hidden when t1 is selected */}
              <iframe
                src={TEMPLATE_URLS.t2}
                title="SmartView Template 2"
                className={`absolute inset-0 h-full w-full border-0 ${
                  selectedTemplate === 't2' ? 'visible' : 'invisible'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Right side - Features list (only shown for Template 1) */}
            {selectedTemplate === 't1' && (
              <div className="flex w-1/2 flex-col gap-4">
                {(product === 'vini' ? VINI_FEATURES : FEATURES).map(
                  (feature, index) => (
                    <div
                      key={feature}
                      className="inline-flex items-center justify-start gap-4 self-stretch rounded-xl bg-white p-4 shadow-[0px_4px_30px_0px_rgba(0,0,0,0.08)] outline outline-1 outline-offset-[-1px] outline-zinc-100"
                    >
                      <div className="flex-shrink-0">
                        <Image
                          src={BULLET_STAR_URL}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                      </div>
                      <span className="text-base font-semibold text-gray-900">
                        {feature}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartViewIntroScreen;
