import { useEffect, useState } from 'react';

const bottomFadeStyle = `linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 10%, rgba(255, 255, 255, 1) 50%)`;

export default function OnboardingBackgroundGrid({
  width = null,
  height = '200px',
  fadeRight = false,
}) {
  const [fadeStyle, setFadeStyle] = useState('');

  useEffect(() => {
    if (fadeRight) {
      setFadeStyle(
        `${bottomFadeStyle}, linear-gradient(to right, transparent 10%, white 100%)`
      );
    } else {
      setFadeStyle(bottomFadeStyle);
    }
  }, [fadeRight]);

  return (
    <div
      className="absolute inset-0 z-[-1]"
      style={{ width: width ?? '100%', height: height }}
    >
      <div
        className="absolute inset-0 z-[-3] h-full w-full"
        style={{
          background:
            'linear-gradient(90deg, #efefef 1px, transparent 1px) 0 0, linear-gradient(0deg, #efefef 1px, transparent 1px) 0 0, #fff',
          backgroundSize: '40px 40px, 40px 40px',
        }}
      ></div>

      <div
        className="absolute inset-0 z-[-2] h-full w-full"
        style={{
          background: fadeStyle,
        }}
      ></div>
    </div>
  );
}
