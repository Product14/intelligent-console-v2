import { useEffect, useState } from 'react';

import { cn } from '@spyne-console/utils/cn';

const ASPECT_RATIOS = [
  {
    viewMode: 'landscape',
    label: 'Website Video',
  },
  {
    viewMode: 'portrait',
    label: 'Reel',
  },
];

export default function VideoEmbedAspectRatioSwitcher({
  elementId,
  className,
  options = ASPECT_RATIOS,
}) {
  const iframeElement = document.getElementById(elementId);
  if (!iframeElement) {
    return null;
  }
  // Remove direct DOM access and use state for toggle
  const [selected, setSelected] = useState(
    options.find((item) => item.viewMode === 'landscape')?.viewMode ||
      options[0].viewMode
  );

  useEffect(() => {
    if (iframeElement?.contentWindow) {
      // this is for default view mode at start
      iframeElement.contentWindow.postMessage(
        { type: 'SWITCH_RATIO', value: selected },
        '*'
      );
    }
  }, []);

  const switchAspectRatio = (value) => {
    if (!['landscape', 'portrait'].includes(value)) {
      return;
    }
    setSelected(value);
    if (iframeElement?.contentWindow) {
      iframeElement.contentWindow.postMessage(
        { type: 'SWITCH_RATIO', value },
        '*'
      );
    }
  };

  return (
    <div
      className={cn(
        'flex w-fit items-center justify-center gap-4 rounded border border-black/10 bg-white p-1',
        className
      )}
    >
      {options
        .sort((a) => (a.viewMode === 'landscape' ? -1 : 1))
        .map((item) => (
          <button
            type="button"
            className={`flex min-w-5 items-center gap-2 rounded px-2 text-xs font-semibold leading-6 tracking-wide transition-colors duration-150 ${
              selected === item.viewMode
                ? 'bg-blue-lightest/10 text-blue-light'
                : ''
            }`}
            onClick={() => switchAspectRatio(item.viewMode)}
          >
            <span
              className={`${item.viewMode === 'landscape' ? 'h-3 w-4' : 'h-4 w-3'} rounded-sm border-2 ${selected === item.viewMode ? 'border-blue-light' : 'border-gray-400'}`}
            ></span>
            <span>{item.label}</span>
          </button>
        ))}
    </div>
  );
}
