import React from 'react';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

interface AvatarGradientProps {
  agentImage?: string;
  additionalClassName?: string;
}

const GradientSvg = ({ className }: { className: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 96 96"
      fill="none"
      className={className}
    >
      <g filter="url(#filter0_f_595_89068)">
        <ellipse
          cx="43.7313"
          cy="71.9592"
          rx="37.6893"
          ry="29.0712"
          transform="rotate(-90 43.7313 71.9592)"
          fill="#0077FF"
        />
      </g>
      <g filter="url(#filter1_f_595_89068)">
        <ellipse
          cx="80.8282"
          cy="94.6169"
          rx="28.4651"
          ry="21.8146"
          transform="rotate(-90 80.8282 94.6169)"
          fill="#FF5900"
        />
      </g>
      <g opacity="0.6" filter="url(#filter2_f_595_89068)">
        <ellipse
          cx="80.9148"
          cy="37.3424"
          rx="43.578"
          ry="33.4931"
          transform="rotate(-91.45 80.9148 37.3424)"
          fill="url(#paint0_linear_595_89068)"
        />
      </g>
      <g filter="url(#filter3_f_595_89068)">
        <ellipse
          cx="76.7902"
          cy="3.91315"
          rx="23.4111"
          ry="17.88"
          transform="rotate(-90 76.7902 3.91315)"
          fill="#FFA8D9"
        />
      </g>
      <g filter="url(#filter4_f_595_89068)">
        <ellipse
          cx="29.6839"
          cy="22.7659"
          rx="29.6839"
          ry="22.7659"
          transform="matrix(-0.82493 -0.565235 0.565242 -0.824925 40.9727 57.8359)"
          fill="url(#paint1_linear_595_89068)"
        />
      </g>
      <g filter="url(#filter5_f_595_89068)">
        <ellipse
          cx="19.0321"
          cy="32.4723"
          rx="9.00426"
          ry="6.9462"
          transform="rotate(-90 19.0321 32.4723)"
          fill="#FF3680"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_595_89068"
          x="-25.3398"
          y="-5.7301"
          width="138.143"
          height="155.379"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="20"
            result="effect1_foregroundBlur_595_89068"
          />
        </filter>
        <filter
          id="filter1_f_595_89068"
          x="19.0137"
          y="26.1518"
          width="123.629"
          height="136.93"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="20"
            result="effect1_foregroundBlur_595_89068"
          />
        </filter>
        <filter
          id="filter2_f_595_89068"
          x="17.4141"
          y="-36.23"
          width="127.002"
          height="147.145"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="15"
            result="effect1_foregroundBlur_595_89068"
          />
        </filter>
        <filter
          id="filter3_f_595_89068"
          x="28.9102"
          y="-49.4979"
          width="95.7598"
          height="106.822"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="15"
            result="effect1_foregroundBlur_595_89068"
          />
        </filter>
        <filter
          id="filter4_f_595_89068"
          x="-28.3145"
          y="-32.9064"
          width="115.336"
          height="110.367"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="15"
            result="effect1_foregroundBlur_595_89068"
          />
        </filter>
        <filter
          id="filter5_f_595_89068"
          x="-27.9141"
          y="-16.532"
          width="93.8926"
          height="98.0085"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="20"
            result="effect1_foregroundBlur_595_89068"
          />
        </filter>
        <linearGradient
          id="paint0_linear_595_89068"
          x1="124.493"
          y1="37.3424"
          x2="37.3368"
          y2="37.3424"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3010FF" stopOpacity="0" />
          <stop offset="1" stopColor="#3010FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_595_89068"
          x1="59.3677"
          y1="22.7659"
          x2="0"
          y2="22.7659"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#36FFA5" stopOpacity="0" />
          <stop offset="1" stopColor="#36FFA5" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const AvatarGradient: React.FC<AvatarGradientProps> = ({
  additionalClassName = '',
  agentImage,
}) => {
  return (
    <div className="relative overflow-hidden rounded-full">
      <GradientSvg className="h-full w-full" />
      {agentImage && (
        <img
          src={getSafeStaticAssetUrl(agentImage)}
          alt="agent"
          className={`absolute left-1/2 top-1/2 h-auto w-full -translate-x-1/2 -translate-y-1/4 object-cover ${additionalClassName}`}
        />
      )}
    </div>
  );
};

export default AvatarGradient;
