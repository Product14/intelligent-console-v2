import React from 'react';

interface ProgressBadgeProps {
  percentage: number;
  className?: string;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  percentage,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-full bg-[#fff2c4] px-7 py-2 ${className}`}
    >
      <div className="relative h-5 w-5 shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="transparent"
            stroke="#66530f"
            strokeWidth="2"
            strokeOpacity="0.2"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="transparent"
            stroke="#66530f"
            strokeWidth="2"
            strokeDasharray={`${(percentage / 100) * 50.27} 50.27`}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="shrink-0 text-base font-semibold leading-6 text-[#66530f]">
        {percentage}% Completed
      </p>
    </div>
  );
};
