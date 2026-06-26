import React from 'react';

import SVG from '@spyne-console/design-system/svg';

import { ProductPlan } from '../types/common';
import {
  getProductFeatureStyles,
  getProductStyles,
  normalizeProductName,
} from '../utils/product-styles';

interface ProductPlanCardProps {
  plan: ProductPlan;
  onMoreDetails?: () => void;
}

export default function ProductPlanCard({
  plan,
  onMoreDetails,
}: ProductPlanCardProps) {
  const { logo, bgImage, textColor, borderColor } = getProductStyles(plan.name);

  return (
    <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white p-1.5">
      {/* Top Section with Background */}
      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-gray-200 bg-cover bg-center bg-no-repeat p-4"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >
        {/* Header */}
        <div className="relative z-10 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg">
              <img src={logo} alt={plan.name} className="h-12 w-12" />
            </div>
            <h3 className={`text-xl font-semibold ${textColor}`}>
              {plan.name}
            </h3>
          </div>
          <button
            onClick={onMoreDetails}
            className="group flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-normal text-black/60 hover:text-violet-600"
          >
            More Details
            <SVG
              iconName="redirectionArrow"
              className="h-2.5 w-2.5 !fill-black/60 group-hover:!fill-violet-600"
            />
          </button>
        </div>

        {/* Features */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {plan.features.map((feature, index) => {
            const { bgColor, borderColor, textColor } = getProductFeatureStyles(
              plan.name
            );
            return (
              <div
                key={index}
                className={`relative flex items-center gap-3 rounded-lg border px-2 py-1 shadow-sm ${bgColor} ${borderColor}`}
              >
                {feature.logoUrl && (
                  <>
                    <img
                      src={feature.logoUrl}
                      alt={feature.label}
                      className="h-4 w-4 flex-shrink-0"
                    />
                    <div className="absolute bottom-0 left-[26px] top-0 w-px bg-gray-300" />
                  </>
                )}
                <span className={`text-xs font-medium ${textColor}`}>
                  {feature.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info - White Background */}
      <div className="flex items-start justify-between rounded-b-lg border-gray-100 bg-white p-4">
        {normalizeProductName(plan.name).toLowerCase() !== 'vini ai' && (
          <div>
            <p className="text-xs font-normal text-black/60">Plan</p>
            <p className="text-sm font-medium text-black/80">{plan.planType}</p>
          </div>
        )}
        <div
          className={
            normalizeProductName(plan.name).toLowerCase() !== 'vini ai'
              ? `border-l ${borderColor} pl-8`
              : ''
          }
        >
          <p className="text-xs font-normal text-black/60">Billing</p>
          <p className="text-sm font-medium text-black/80">
            {plan.billingCycle}
          </p>
        </div>
        <div className={`border-l ${borderColor} pl-8`}>
          <p className="text-xs font-normal text-black/60">Total Rooftops</p>
          <p className="text-sm font-medium text-black/80">
            {plan.totalRooftops}
          </p>
        </div>
        <div className={`border-l ${borderColor} pl-8 pr-1`}>
          <p className="text-xs font-normal text-black/60">Pricing</p>
          <p className="text-sm font-medium text-black/80">
            ${plan.pricing}{' '}
            <span className="text-sm font-normal text-gray-500">/Rooftop</span>
          </p>
        </div>
      </div>
    </div>
  );
}
