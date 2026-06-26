'use client';

import { memo } from 'react';

import { NavigateButtonType } from '../models/navigateButtonType';

interface NavigateButtonProps {
  type: NavigateButtonType;
  isPageLimitReached: boolean;
  navigate: () => void;
}

const SvgRenderer = ({ type }: { type: NavigateButtonType }) => {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={type === NavigateButtonType.NEXT ? 'M1 9L5 5L1 1' : 'M5 9L1 5L5 1'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const NavigateButton = ({
  type,
  isPageLimitReached,
  navigate,
}: NavigateButtonProps) => {
  return (
    <button
      onClick={navigate}
      disabled={isPageLimitReached}
      type="button"
      className={`p-2 ${isPageLimitReached ? 'text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
    >
      <SvgRenderer type={type} />
    </button>
  );
};

export default memo(NavigateButton);
