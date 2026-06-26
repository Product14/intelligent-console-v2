import { Draft } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import Badge from '../badge';

export default function DraftBadge({ className, isTextVisible = true, t }) {
  return (
    <Badge
      text={t ? t('inventory.draft') : 'Draft'}
      className={cn('bg-gray-lighter text-black', className)}
      icon={<Draft className="h-4 w-4 fill-black" />}
      isTextVisible={isTextVisible}
    />
  );
}
