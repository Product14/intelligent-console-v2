import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const ExcelFileIcon = ({ className }) => {
  return (
    <svg
      width="27"
      height="32"
      viewBox="0 0 27 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('fill-[#217346]', className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.0664062 3.6C0.0664063 2.77783 0.393013 1.98933 0.974375 1.40797C1.55574 0.826606 2.34424 0.5 3.16641 0.5L20.1275 0.5L26.9331 7.30553V28.4C26.9331 29.2222 26.6065 30.0107 26.0251 30.592C25.4437 31.1734 24.6552 31.5 23.8331 31.5H3.16641C2.34424 31.5 1.55574 31.1734 0.974375 30.592C0.393013 30.0107 0.0664063 29.2222 0.0664062 28.4V3.6Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 13H23V22H4V13ZM5.5 14.5V16.5H9.5V14.5H5.5ZM11 14.5V16.5H15V14.5H11ZM16.5 14.5V16.5H21.5V14.5H16.5ZM5.5 18.5V20.5H9.5V18.5H5.5ZM11 18.5V20.5H15V18.5H11ZM16.5 18.5V20.5H21.5V18.5H16.5Z"
        fill="white"
      />
    </svg>
  );
};

export default ExcelFileIcon;
