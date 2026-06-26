import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const Loader = () => {
  return (
    <div
      className="w-[107px] p-3 bg-primary aspect-square rounded-full box-border animate-[load_1s_linear_infinite]"
      style={{
        WebkitMask:
          'conic-gradient(#0000, #000), linear-gradient(#000 0 0) content-box',
        mask: 'conic-gradient(#0000, #000), linear-gradient(#000 0 0) content-box',
        WebkitMaskComposite: 'source-out',
        maskComposite: 'subtract',
      }}
    >
      <style>{`
            @keyframes load {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
    </div>
  );
};

export default Loader;
