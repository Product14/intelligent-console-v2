import { Error } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import Badge from '../badge';

export default function FailedBadge({ className, isTextVisible = true, t }) {
  return (
    <Badge
      text={t ? t('inventory.failed') : 'Failed'}
      className={cn('bg-red-lightest text-orange-red', className)}
      icon={<Error className="fill-orange-red h-4 w-4" />}
      isTextVisible={isTextVisible}
    />
  );
}
