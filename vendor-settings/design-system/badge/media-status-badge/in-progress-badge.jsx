import { Sync } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import Badge from '../badge';

export default function InProgressBadge({
  className,
  isTextVisible = true,
  t,
}) {
  return (
    <Badge
      text={t ? t('inventory.inProgress') : 'In Progress'}
      className={cn('bg-[#3538CD]/10 text-[#3538CD]', className)}
      icon={<Sync className="h-4 w-4 fill-[#3538CD]" />}
      isTextVisible={isTextVisible}
    />
  );
}
