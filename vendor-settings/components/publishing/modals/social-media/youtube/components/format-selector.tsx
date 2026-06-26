import React from 'react';

import Image from 'next/image';

import { YoutubePublishFormat } from '../types';

interface FormatSelectorProps {
  availableFormats: YoutubePublishFormat[];
  selectedFormats: ('video' | 'shorts')[];
  disabledFormats?: ('video' | 'shorts')[];
  onToggle: (format: string) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  availableFormats,
  selectedFormats,
  disabledFormats = [],
  onToggle,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-900">
      Choose post format
    </label>
    <div className="flex gap-4">
      {availableFormats.map((format) => (
        <button
          key={format.type}
          type="button"
          disabled={disabledFormats.includes(format.type)}
          onClick={() => onToggle(format.type)}
          className={`flex flex-col gap-3 rounded-lg border px-16 py-4 transition-all ${
            disabledFormats.includes(format.type)
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
              : selectedFormats.includes(format.type)
                ? 'border-blue-light bg-blue-light/10'
                : 'bg-gray-50'
          }`}
        >
          <Image
            src={format.imageUrl}
            alt={format.label}
            className="h-20 w-auto"
            width={80}
            height={80}
          />
          <span className="text-black-80 text-sm font-medium">
            {format.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);
