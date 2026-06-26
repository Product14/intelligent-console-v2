import React from 'react';

export interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

declare const ToggleSwitch: React.FC<ToggleSwitchProps>;
export { ToggleSwitch };
export default ToggleSwitch;
