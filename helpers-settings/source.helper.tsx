import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';
import { Source } from '@/models/sources.model';

import Image from 'next/image';

import { StringUtils } from '@/utils-settings/StringUtils';

export const validateForMainSource = (source: Source) => {
  const readableSourceType = StringUtils.toReadableString(
    source.source
  ).toLowerCase();
  const readableSourceCategory = StringUtils.toReadableString(
    source.category
  ).toLowerCase();
  return readableSourceType === readableSourceCategory;
};

export const transformSourcesToDropdownOptions = (
  sources: Source[]
): CIDropdownMenuOption[] => {
  const mainOptions = sources.filter((source) => validateForMainSource(source));
  const allSubOptions = sources.filter(
    (source) => !validateForMainSource(source)
  );
  const categoryWiseSubSources = organizeSourcesByCategory(allSubOptions);
  return mainOptions.map((mainOption) => ({
    label: mainOption.name,
    value: mainOption.source || mainOption.name,
    id: mainOption.source_id || mainOption.source || mainOption.name,
    icon: (
      <Image
        src={mainOption.icon}
        alt={mainOption.name}
        width={16}
        height={16}
      />
    ),
    subOptions: (categoryWiseSubSources[mainOption.category] ?? []).map(
      (subOption) => mapSourceToDropdownOption(subOption)
    ),
  }));
};

export const mapSourceToDropdownOption = (
  source: Source
): CIDropdownMenuOption => {
  return {
    label: source.name,
    value: source.source,
    id: source._id || source.source_id || source.name,
    icon: <Image src={source.icon} alt={source.name} width={16} height={16} />,
  };
};

export const organizeSourcesByCategory = (
  sources: Source[]
): { [key: string]: Source[] } => {
  return sources.reduce(
    (acc, source: Source) => {
      if (!acc[source.category]) {
        acc[source.category] = [];
      } else {
        acc[source.category].push(source);
      }
      return acc;
    },
    {} as Record<string, Source[]>
  );
};
