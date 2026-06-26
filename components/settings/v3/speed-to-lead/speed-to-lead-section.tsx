import CIDropdown from '@/internal-design-system-settings/dropdown/ci-dropdown';
import type { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';

import SpeedLeadCard from './speed-lead-card';
import type { SpeedToLeadSourceConfig } from './speed-to-lead-responses';
import { getOrderedEntryKeys } from './static-config';

type SectionType = 'source' | 'leadType';

interface SpeedToLeadSectionProps {
  readonly type: SectionType;
  readonly title: string;
  readonly entries: Record<string, SpeedToLeadSourceConfig>;
  readonly options: string[];
  readonly modeValidationErrors?: Record<string, string>;
  readonly onUpdate: (key: string, config: SpeedToLeadSourceConfig) => void;
  readonly onAdd: (key: string) => void;
  readonly onRemove: (key: string) => void;
  readonly disabled?: boolean;
}

export default function SpeedToLeadSection({
  type,
  title,
  entries,
  options,
  modeValidationErrors,
  onUpdate,
  onAdd,
  onRemove,
  disabled = false,
}: SpeedToLeadSectionProps) {
  const orderedKeys = getOrderedEntryKeys(entries);
  const selectedKeys = Object.keys(entries);
  const sectionError = modeValidationErrors?.[`${type}-_section`];

  const allOptions: CIDropdownMenuOption[] = options.map((key) => ({
    label: key,
    value: key,
  }));

  const selectedOptions: CIDropdownMenuOption[] = allOptions.filter((opt) =>
    selectedKeys.includes(opt.value as string)
  );

  const handleSelectionChange = (
    nextSelectedOptions: CIDropdownMenuOption[]
  ) => {
    const nextSelectedKeys = nextSelectedOptions.map(
      (opt) => opt.value as string
    );

    const added = nextSelectedKeys.filter((key) => !selectedKeys.includes(key));
    const removed = selectedKeys.filter(
      (key) => !nextSelectedKeys.includes(key)
    );

    added.forEach((key) => onAdd(key));
    removed.forEach((key) => onRemove(key));
  };

  return (
    <div
      className={`bg-gray-light relative flex h-full max-h-[35vh] min-h-[33vh] flex-col rounded-2xl p-4 shadow-sm transition-all ${sectionError ? 'ring-2 ring-red-400' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold uppercase text-black/80">
            Lead {title}
          </h3>
        </div>
        {!disabled && (
          <div className="flex min-w-[150px] justify-end gap-2">
            <CIDropdown
              selectedValues={selectedOptions}
              options={allOptions}
              onChange={handleSelectionChange}
              placeholder={`${title}`}
              isMultiSelect={true}
              variant="clean"
              showCheckmark={true}
              allowDeselection={true}
              allowContentOverflow={true}
              allowSearch={true}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        {disabled ? (
          <p className="text-sm font-medium text-black/40">
            No lead source available
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {orderedKeys.length === 0 && sectionError && (
              <p className="text-xs font-medium text-red-500">{sectionError}</p>
            )}
            {orderedKeys.map((key) => (
              <SpeedLeadCard
                key={key}
                idPrefix={type}
                title={key}
                config={entries[key]}
                onChange={(newConfig) => onUpdate(key, newConfig)}
                onRemove={() => onRemove(key)}
                canRemove={true}
                error={modeValidationErrors?.[`${type}-${key}`]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
