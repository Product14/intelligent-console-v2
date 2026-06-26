import React from 'react';

// @ts-ignore
import SVG from '@spyne-console/design-system/svg';

import { YoutubePublishType } from '../types';

interface PublishTypeSelectorProps {
  publishTypes: YoutubePublishType[];
  onToggle: (type: string) => void;
}

export const PublishTypeSelector: React.FC<PublishTypeSelectorProps> = ({
  publishTypes,
  onToggle,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-900">What to publish</label>
    <div className="flex flex-wrap gap-3">
      {publishTypes.map((type) => (
        <button
          key={type.type}
          type="button"
          disabled={type.disabled}
          onClick={() => onToggle(type.type)}
          className={`flex min-w-[180px] items-center justify-between gap-3 rounded-xl border px-2 py-1.5 text-base font-medium transition-colors ${
            type.selected
              ? 'border-blue-light bg-blue-light/10 text-blue-light'
              : type.disabled
                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <SVG
              iconName={type.iconName}
              width={24}
              height={24}
              className={`h-8 w-8 rounded-full p-2 ${
                type.selected
                  ? 'text-blue-light bg-white'
                  : type.disabled
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-gray-100 text-gray-700'
              }`}
              fill={type.selected ? 'blue' : type.disabled ? '#9ca3af' : 'gray'}
            />
            <span>{type.label}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);
