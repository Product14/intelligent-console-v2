import React from 'react';

import Image from 'next/image';

interface RecommendedBadgeProps {
  className?: string;
  style?: React.CSSProperties;
}

const RECOMMENDED_OVERLAY_URL =
  'https://media.spyneai.com/unsafe/filters:format(webp)/d20uiuzezo3er4.cloudfront.net/onboarding/spyne-recommended-overlay.svg';

const RecommendedBadge: React.FC<RecommendedBadgeProps> = ({
  className = '',
  style = { left: '-11px', top: '-11px' },
}) => {
  return (
    <div className={`absolute z-20 ${className}`} style={style}>
      <Image
        src={RECOMMENDED_OVERLAY_URL}
        alt="Spyne's Recommended"
        width={192}
        height={42}
      />
    </div>
  );
};

export default RecommendedBadge;
