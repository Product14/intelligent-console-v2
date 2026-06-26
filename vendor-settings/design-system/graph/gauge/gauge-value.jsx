import React from 'react';

const GaugeValue = ({ value }) => {
  return (
    <h2 className="absolute text-2xl font-extrabold leading-8 text-black text-opacity-80 bottom-6">
      {value}
    </h2>
  );
};

export default GaugeValue;
