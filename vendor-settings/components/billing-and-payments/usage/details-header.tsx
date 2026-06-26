import React from 'react';

import { PRODUCT_LABELS } from './config';
import { DetailsHeaderProps, ProductKey } from './utils';

export default function DetailsHeader({
  rooftop,
  activeProduct,
  onChangeProduct,
  availableProducts,
  productLabels,
}: DetailsHeaderProps) {
  const initials = rooftop?.initials ?? '--';
  const name = rooftop?.name ?? 'N/A';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-purpleGradient/85 flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold text-white/90">
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-black/90">{name}</div>
        </div>
      </div>

      {availableProducts && availableProducts.length > 0 && (
        <div className="flex items-center rounded-lg border border-black/10 bg-white p-1">
          {availableProducts.map((productKey: ProductKey) => {
            const isActive = activeProduct === productKey;
            const label =
              (productLabels && productLabels[productKey]) ??
              PRODUCT_LABELS[productKey];
            return (
              <button
                key={productKey}
                type="button"
                onClick={() => onChangeProduct(productKey)}
                className={`flex min-w-[145px] items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-light bg-blue-light/5'
                    : 'hover:text-blue-light font-normal text-black/60'
                }`}
              >
                {label === 'Conversational AI' ? 'Vini AI' : label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
