import { FC } from 'react';

interface ToggleProps {
  id: string;
  toggle: boolean;
  toggleHandler: () => void;
  disabled?: boolean;
  className?: string;
}

declare const Toggle: FC<ToggleProps>;

export default Toggle;
