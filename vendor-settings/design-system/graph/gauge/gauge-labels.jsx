import React from 'react';

const GaugeLabels = () => {
  return (
    <div className="absolute bottom-0 flex w-full justify-between">
      <span className="absolute bottom-[10.341px] left-0 text-xs font-semibold leading-5 text-black text-opacity-40">
        LOW
      </span>
      <span className="absolute bottom-[10.341px] right-0 text-xs font-semibold leading-5 text-black text-opacity-40">
        HIGH
      </span>
    </div>
  );
};

export default GaugeLabels;
