import React from 'react';

interface CustomizationRadioProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const CustomizationRadio: React.FC<CustomizationRadioProps> = ({
  name,
  value,
  label,
  checked,
  onChange,
}) => {
  return (
    <label
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3.5 py-3 transition-all hover:border-black/20`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-black/20 transition-all checked:border-[5px] checked:border-[#4600f2]"
        />
      </div>
      <span className="text-sm font-normal leading-tight text-black/80">
        {label}
      </span>
    </label>
  );
};

export default CustomizationRadio;
