import { Toggle } from '@spyne-console/design-system';

interface SpeedToLeadToggleProps {
  readonly id: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

export default function SpeedToLeadToggle({
  id,
  checked,
  onChange,
  disabled = false,
  className = '',
}: SpeedToLeadToggleProps) {
  return (
    <Toggle
      id={id}
      toggle={checked}
      toggleHandler={() => onChange(!checked)}
      disabled={disabled}
      className={className}
    />
  );
}
