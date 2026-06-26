declare module '@spyne-console/design-system/button' {
  import { ReactNode } from 'react';

  export interface ButtonProps {
    label?: string | ReactNode;
    icon?: ReactNode;
    iconUrl?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
    disabled?: boolean;
    type?: 'primary' | 'bordered' | 'outline';
    size?: 'A' | 'AA' | 'AAA';
    isLoading?: boolean;
    iconPosition?: 'left' | 'right';
    title?: string;
    spinnerType?: string;
    showTooltip?: boolean;
    tooltipContent?: string;
    tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  }

  const Button: React.FC<ButtonProps>;
  export default Button;
}
