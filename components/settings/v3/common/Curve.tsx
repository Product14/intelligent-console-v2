export const Curve = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-[32px] w-full bg-transparent">
      {children && (
        <div className="absolute left-1/2 top-0 z-[4] -translate-x-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="32px"
        viewBox="0 0 1272 32"
        fill="transparent"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="paint0_linear_595_128825"
            x1="15.2529"
            y1="26.1819"
            x2="1272"
            y2="26.1819"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#851AFF" stop-opacity="0" />
            <stop offset="0.33" stop-color="#D600FF" />
            <stop offset="0.66" stop-color="#3BD0FA" />
            <stop offset="1" stop-color="#FF4794" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 32 C 0 32 177.488 0 636 0 C 1094.51 0 1272 32 1272 32 C 1272 32 1094.51 2.9091 636 3 C 177.488 
           0 32 0 32 Z"
          fill="url(#paint0_linear_595_128825)"
        />

        <path
          d="M 0 34 C 0 34 177.1488 2.5 636 2.5 C 1094.51 2.5 1272 34 1272 34 V 61 H 0"
          fill="white"
        />
      </svg>
    </div>
  );
};
