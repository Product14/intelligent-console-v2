import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const DashedDivder = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'h-[1px] border-none bg-[linear-gradient(90deg,transparent,transparent_50%,#fff_50%,#fff_100%),linear-gradient(90deg,#363F721A,#363F721A,#363F721A,#363F721A,#363F721A)] bg-[length:10px_2px,100%_2px]',
        className
      )}
      {...props}
    />
  );
};

export default DashedDivder;
