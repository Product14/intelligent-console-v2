import React from 'react';

const Slider = ({
  label = 'Hello',
  min = 0,
  max = 100,
  name = '',
  value = 0,
  onChange = () => {},
}) => {
  return (
    <div className="space-y-4">
      {label && (
        <label htmlFor={name} className="block text-black-80 font-semibold">
          {label}
        </label>
      )}
      <div className="flex items-center justify-between gap-4">
        <input
          id={name}
          type="range"
          min={min}
          max={max}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full h-1 bg-violet-200 rounded-xl accent-primary"
        />
        <div className="text-sm w-12 text-center">{value}</div>
      </div>
    </div>
  );
};

export default Slider;
