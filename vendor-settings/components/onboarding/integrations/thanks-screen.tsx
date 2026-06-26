import React from 'react';

export interface ThanksScreenProps {
  title?: string;
  imageUrl?: string;
  backgroundUrl?: string;
}

const ThanksScreen: React.FC<ThanksScreenProps> = ({
  title = 'Thank you! Our Onboarding team will get back to you',
  imageUrl = 'https://spyne-static.s3.us-east-1.amazonaws.com/spyne-shimmer.png',
  backgroundUrl = 'https://spyne-static.s3.us-east-1.amazonaws.com/onboarding/welcome-grad.png',
}) => {
  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center justify-center">
      {/* Welcome Gradient */}
      <img
        src={backgroundUrl}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      />
      <img src={imageUrl} alt="Spyne" className="z-10 h-80 w-80" />
      <div className="z-10 mt-16 justify-start text-center font-['Inter'] text-4xl font-bold leading-[60px] text-neutral-900">
        {title}
      </div>
    </div>
  );
};

export default ThanksScreen;
