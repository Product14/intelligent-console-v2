import SVG from '@spyne-console/design-system/svg';

import RadioSelectDropdown from './radio-select-dropdown';
import type { SpeedToLeadSourceConfig } from './speed-to-lead-responses';
import { SPEED_TO_LEAD_MODES } from './static-config';

interface SpeedLeadCardProps {
  readonly title: string;
  readonly config: SpeedToLeadSourceConfig;
  readonly onChange: (config: SpeedToLeadSourceConfig) => void;
  readonly onRemove?: () => void;
  readonly canRemove?: boolean;
  readonly idPrefix?: string;
  readonly error?: string;
}

export default function SpeedLeadCard({
  title,
  config,
  onChange,
  onRemove,
  canRemove = false,
  idPrefix = 'speed-lead',
  error,
}: SpeedLeadCardProps) {
  const id = `${idPrefix}-${title.replaceAll(/\s+/g, '-').toLowerCase()}`;

  const handleModeChange = (mode: SpeedToLeadSourceConfig['mode']) => {
    onChange({ ...config, mode, isEnabled: true });
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-black/10 bg-white p-2 pl-3 shadow-sm`}
    >
      <span className="text-sm font-medium text-black/80">{title}</span>
      <div className="flex flex-wrap items-center gap-3">
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer"
            aria-label={`Remove ${title}`}
          >
            <SVG
              iconName="delete"
              className="h-5 w-5 fill-black/50 transition-all duration-200 hover:fill-red-600"
            />
          </button>
        )}
        <RadioSelectDropdown
          id={`${id}-mode`}
          value={config.mode}
          options={SPEED_TO_LEAD_MODES}
          onChange={handleModeChange}
          placeholder="Select"
          disabled={false}
          error={error}
        />
      </div>
    </div>
  );
}
