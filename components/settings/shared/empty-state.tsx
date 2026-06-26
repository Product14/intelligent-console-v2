import React from 'react';

import Button from '@spyne-console/design-system/button';

interface EmptyStateProps {
  // Visual content
  title: string;
  subtitle: string;

  // Action button (optional)
  buttonLabel?: string;
  onButtonClick?: () => void;

  // Optional custom SVG override
  customSvg?: React.ReactNode;

  // Styling options
  className?: string;
  centerContent?: boolean;
}

const EmptyStateIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="177"
    height="167"
    viewBox="0 0 177 167"
    fill="none"
    className="mx-auto"
  >
    <path
      d="M119.242 63.4715C106.68 63.4715 93.8933 62.9613 81.9318 59.6294C70.1953 56.3726 59.4194 50.0542 49.8142 42.7452C43.5257 37.9876 37.8076 34.2055 29.6431 34.7758C21.649 35.2134 14.0081 38.2129 7.85112 43.3305C-2.53458 52.3354 -0.973724 69.1897 3.18356 81.0312C9.42698 98.861 28.4274 111.213 44.5763 119.287C63.2315 128.607 83.7328 134.01 104.279 137.132C122.289 139.863 145.432 141.86 161.04 130.093C175.373 119.287 179.305 94.6136 175.793 77.9545C174.942 73.0286 172.322 68.583 168.424 65.4526C158.354 58.0986 143.33 63.0063 132.014 63.2614C127.812 63.3515 123.535 63.4565 119.242 63.4715Z"
      fill="#F2F2F2"
    />
    <path
      d="M88.5015 166.327C118.93 166.327 143.597 164.788 143.597 162.89C143.597 160.992 118.93 159.453 88.5015 159.453C58.0732 159.453 33.4062 160.992 33.4062 162.89C33.4062 164.788 58.0732 166.327 88.5015 166.327Z"
      fill="#F2F2F2"
    />
    <path
      d="M144.805 45.1328V51.6014"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M141.57 48.375H148.024"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M36.4141 99.4922V105.946"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M33.1719 102.719H39.6404"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.3594 18.2422V24.6957"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.1172 21.4688H30.5857"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M97.6896 3.26193C98.5019 3.26193 99.1604 2.60342 99.1604 1.79112C99.1604 0.978815 98.5019 0.320312 97.6896 0.320312C96.8773 0.320312 96.2188 0.978815 96.2188 1.79112C96.2188 2.60342 96.8773 3.26193 97.6896 3.26193Z"
      fill="#CFCFCF"
    />
    <path
      d="M94.1817 146.738C94.994 146.738 95.6526 146.08 95.6526 145.268C95.6526 144.455 94.994 143.797 94.1817 143.797C93.3694 143.797 92.7109 144.455 92.7109 145.268C92.7109 146.08 93.3694 146.738 94.1817 146.738Z"
      fill="#CFCFCF"
    />
    <path
      d="M125.767 10.2807L40.1707 19.1716C38.2168 19.3745 36.7973 21.123 37.0003 23.077L48.707 135.783C48.9099 137.737 50.6584 139.156 52.6124 138.953L138.209 130.062C140.163 129.859 141.582 128.111 141.38 126.157L129.673 13.4512C129.47 11.4972 127.721 10.0778 125.767 10.2807Z"
      fill="#D2D2D2"
    />
    <path
      d="M122.079 15.4834L44.827 23.5075C42.873 23.7105 41.4536 25.459 41.6565 27.4129L52.2437 129.341C52.4467 131.295 54.1952 132.714 56.1491 132.511L133.401 124.487C135.355 124.284 136.775 122.536 136.572 120.582L125.984 18.6539C125.781 16.6999 124.033 15.2805 122.079 15.4834Z"
      fill="white"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M108.747 20.4753L107.547 8.91893C107.487 8.43927 107.241 8.00236 106.862 7.70208C106.483 7.40181 106.001 7.26212 105.521 7.31305L91.2328 8.81387C91.1166 7.66089 90.7743 6.5421 90.2257 5.52139C89.677 4.50067 88.9327 3.59801 88.0352 2.86496C87.1377 2.1319 86.1045 1.5828 84.9948 1.249C83.8851 0.915209 82.7205 0.803256 81.5675 0.91954C80.4145 1.03582 79.2958 1.37806 78.275 1.92672C77.2543 2.47538 76.3517 3.21972 75.6186 4.11722C74.1381 5.92982 73.4384 8.25629 73.6732 10.5848L59.3403 12.0857C59.0988 12.11 58.8644 12.1818 58.6507 12.2969C58.4369 12.412 58.248 12.5681 58.0946 12.7563C57.9413 12.9445 57.8265 13.1611 57.757 13.3937C57.6875 13.6263 57.6645 13.8703 57.6894 14.1118L58.8901 25.6681C58.9145 25.9097 58.9862 26.144 59.1013 26.3578C59.2164 26.5715 59.3725 26.7605 59.5607 26.9139C59.7489 27.0672 59.9655 27.1819 60.1981 27.2514C60.4307 27.321 60.6747 27.3439 60.9162 27.319L107.112 22.5164C107.354 22.4922 107.589 22.4199 107.803 22.3036C108.017 22.1874 108.206 22.0296 108.358 21.8396C108.511 21.6495 108.624 21.4309 108.69 21.1966C108.757 20.9624 108.777 20.7171 108.747 20.4753Z"
      fill="white"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M71.6094 90.9248C72.1009 86.4712 74.1024 82.3201 77.2808 79.162C80.4592 76.0038 84.623 74.029 89.0797 73.566C93.5363 73.103 98.0172 74.1796 101.777 76.6169C105.537 79.0542 108.349 82.7052 109.745 86.9626"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M73.7983 56.5547L66.6094 65.4095"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M65.7812 57.3984L74.6211 64.5724"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M108.556 52.9531L101.367 61.793"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M100.539 53.7812L109.379 60.9702"
      stroke="#BABABA"
      strokeWidth="1.50082"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  customSvg,
  className = '',
  centerContent = true,
}) => {
  const containerClasses = `
    flex size-full flex-col items-center justify-center gap-8
    ${centerContent ? 'text-center' : ''}
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Icon/SVG */}
      <div className="h-[166.007px] w-[177px] shrink-0">
        {customSvg || <EmptyStateIcon />}
      </div>

      {/* Content */}
      <div
        className={`flex shrink-0 flex-col items-center justify-start ${buttonLabel ? 'gap-6' : 'gap-4'}`}
      >
        {/* Title and Subtitle */}
        <div className="flex shrink-0 flex-col items-center justify-start gap-3 text-nowrap leading-[0]">
          <div className="font-inter shrink-0 text-[18px] font-semibold leading-[28px] text-neutral-950">
            {title}
          </div>
          <div className="font-inter shrink-0 text-[14px] font-normal leading-[20px] text-[#8f8f8f]">
            {subtitle}
          </div>
        </div>

        {/* Action Button */}
        {buttonLabel && onButtonClick && (
          <button
            onClick={onButtonClick}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#4600f2] px-4 py-2 transition-colors hover:bg-[#3d00d9]"
          >
            <div className="font-inter shrink-0 text-[14px] font-medium leading-[24px] text-white">
              {buttonLabel}
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
