import React, { FC, ReactNode } from 'react';

import classNames from 'classnames';

interface BreadcrumbProps {
  items: { label: string; id: number; onClick?: () => void }[];
  activeIndex: number;
  className?: string;
  type?: 'default' | 'rounded';
  highLightSelected?: boolean;
  triggerClassName?: string;
}

const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  activeIndex,
  className,
  triggerClassName,
  type = 'default',
  highLightSelected = true,
}) => {
  return (
    <div
      className={classNames(
        'border-black-10 flex items-center gap-x-4',
        className
      )}
    >
      {items.map((item, index) => (
        <div
          onClick={item.onClick}
          key={index}
          className={classNames(
            'flex w-full cursor-pointer items-center text-sm font-medium',
            triggerClassName,
            {
              'text-black-80 border-[#4600F2] font-semibold':
                index === activeIndex && highLightSelected,
              'border-b-[2px] border-[#4600F2] text-[#4600F2]':
                index === activeIndex && !highLightSelected,
              'text-black-40 font-medium': index !== activeIndex,
              'text-black-60 rounded-full border-[1.5px]':
                index !== activeIndex && type === 'rounded',
              'rounded-full border-[1.5px]':
                index === activeIndex && type === 'rounded',
              'border-b-[2px]': index === activeIndex && type !== 'rounded',
            },
            index !== activeIndex ? triggerClassName : ''
          )}
          style={{ minHeight: '40px' }}
        >
          <div className="mx-auto cursor-pointer whitespace-nowrap">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumb;
