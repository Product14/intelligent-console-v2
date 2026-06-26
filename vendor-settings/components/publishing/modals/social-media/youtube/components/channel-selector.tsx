import React from 'react';

// @ts-ignore
import SVG from '@spyne-console/design-system/svg';

import { YoutubeChannel } from '../types';

interface ChannelSelectorProps {
  selectedChannel: YoutubeChannel | null;
  availableChannels: YoutubeChannel[];
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelect: (channel: YoutubeChannel) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  selectedChannel,
  availableChannels,
  showDropdown,
  onToggleDropdown,
  onSelect,
}) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-900">Select Channel</label>
    <div className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm hover:border-gray-400"
        onClick={onToggleDropdown}
      >
        {selectedChannel ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <span className="text-sm font-semibold text-purple-600">
                {selectedChannel.name.charAt(0)}
              </span>
            </div>
            <span className="font-medium">{selectedChannel.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select a channel</span>
        )}
        <SVG iconName="downArrow" width={24} height={24} />
      </button>

      {showDropdown && availableChannels.length > 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {availableChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50"
              onClick={() => onSelect(channel)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <span className="text-sm font-semibold text-purple-600">
                  {channel.name.charAt(0)}
                </span>
              </div>
              <span className="font-medium">{channel.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);
