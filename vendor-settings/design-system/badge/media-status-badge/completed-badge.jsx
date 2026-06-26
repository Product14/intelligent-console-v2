import { TaskAlt } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

import Badge from '../badge';

export default function CompletedBadge({ className, isTextVisible = true, t }) {
  return (
    <Badge
      text={t ? t('inventory.completed') : 'Completed'}
      className={cn('bg-green-lighter text-spring-green', className)}
      icon={<TaskAlt className="fill-spring-green h-4 w-4" />}
      isTextVisible={isTextVisible}
    />
  );
}
