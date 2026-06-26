import React from 'react';

export interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const sizeConfig = {
  small: {
    width: '28px',
    height: '16px',
    knobSize: '10px',
    knobTop: '3px',
    knobOffLeft: '3px',
    knobOnLeft: '15px',
  },
  medium: {
    width: '36px',
    height: '20px',
    knobSize: '14px',
    knobTop: '3px',
    knobOffLeft: '3px',
    knobOnLeft: '19px',
  },
  large: {
    width: '44px',
    height: '24px',
    knobSize: '18px',
    knobTop: '3px',
    knobOffLeft: '3px',
    knobOnLeft: '23px',
  },
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isOn,
  onToggle,
  disabled = false,
  size = 'medium',
}) => {
  const config = sizeConfig[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative rounded-full transition-colors ${
        isOn ? 'bg-black' : 'bg-gray-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{ width: config.width, height: config.height }}
      aria-pressed={isOn}
      role="switch"
    >
      <span
        className="absolute rounded-full bg-white transition-all duration-200"
        style={{
          width: config.knobSize,
          height: config.knobSize,
          top: config.knobTop,
          left: isOn ? config.knobOnLeft : config.knobOffLeft,
        }}
      />
    </button>
  );
};

export default ToggleSwitch;
