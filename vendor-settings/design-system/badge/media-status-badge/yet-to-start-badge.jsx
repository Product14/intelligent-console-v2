import { Downloading } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import Badge from '../badge';

export default function YetToStartBadge({
  className,
  isTextVisible = true,
  t,
}) {
  return (
    <Badge
      text={t ? t('inventory.yetToStart') : 'Yet To Start'}
      icon={<Downloading className="fill-orange h-4 w-4" />}
      className={cn('bg-orange-lighter text-orange', className)}
      isTextVisible={isTextVisible}
    />
  );
}
