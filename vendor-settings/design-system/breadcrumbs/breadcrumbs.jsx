import Image from 'next/image';

import { cn } from '@spyne-console/utils/cn';

function Breadcrumb({
  crumbs,
  currentCrumb,
  onInactiveCrumbClick,
  subheading,
  userName,
  headingClassName,
  intermediateCrumb,
  onIntermediateCrumbClick,
  sourceType,
}) {
  const defaultStyles = {
    headingClassName:
      'text-2xl leading-8 font-semibold text-black-80 cursor-pointer w-fit',
  };

  return (
    <div className="breadcrumbs col-span-5 grid sm:mb-6">
      <div className="inline-flex items-center gap-2 pt-7">
        <h5
          className={headingClassName || defaultStyles.headingClassName}
          onClick={onInactiveCrumbClick}
          role={onInactiveCrumbClick ? 'button' : undefined}
          tabIndex={onInactiveCrumbClick ? 0 : undefined}
        >
          {crumbs?.inactive}
        </h5>

        {intermediateCrumb && sourceType === 'folder' && (
          <span className="flex items-center gap-2">
            {crumbs?.separator}
            <div
              className="flex cursor-pointer gap-1 items-center"
              onClick={onIntermediateCrumbClick}
              role={onIntermediateCrumbClick ? 'button' : undefined}
              tabIndex={onIntermediateCrumbClick ? 0 : undefined}
            >
              {crumbs?.icon && (
                <Image
                  src={crumbs.icon}
                  height={20}
                  width={20}
                  alt="Breadcrumb icon"
                />
              )}
              <span>{intermediateCrumb}</span>
            </div>
          </span>
        )}

        <small className="inline-flex gap-2 align-middle text-sm font-medium leading-5 text-black-60">
          {crumbs?.separator}
          <div className="flex gap-1">
            {crumbs?.icon && (
              <Image
                src={crumbs.icon}
                height={20}
                width={20}
                alt="Breadcrumb icon"
              />
            )}
            {currentCrumb}
          </div>
        </small>
      </div>

      <p className="text-sm font-normal leading-4 text-black-60">
        {subheading} <span>{userName}</span>
      </p>
    </div>
  );
}

export default Breadcrumb;
