import { Info } from '@spyne-console/design-system/icons';

import { cn } from '@spyne-console/utils/cn';

const InfoBanner = ({
  text,
  bgColor,
  textColor,
  showButton = false,
  buttonText = '',
  buttonOnClick = () => {},
  className,
  color = 'blue',
  buttonDisabled = false,
}) => {
  return (
    <div
      className={cn(
        'flex gap-1 rounded-md px-3 py-2 text-xs font-semibold',
        color === 'blue' && 'bg-[#EFF6FF] text-[#1E40AF]',
        color === 'yellow' && 'bg-[#FCEED8] text-[#73321B]',
        bgColor && `bg-${bgColor}`,
        textColor && `text-${textColor}`,
        className
      )}
    >
      <Info
        className={cn(
          'h-4 w-4',
          color === 'blue' && 'fill-[#1E40AF]',
          color === 'yellow' && 'fill-[#73321B]',
          textColor && `fill-${textColor}`
        )}
      />
      <div className="flex w-full flex-col justify-start gap-1 md:flex-row md:justify-between">
        {text}
        {showButton && (
          <div
            className={cn(
              'text-blue-light cursor-pointer whitespace-nowrap text-xs font-medium',
              buttonDisabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={buttonDisabled ? () => {} : buttonOnClick}
          >
            {buttonText}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoBanner;
