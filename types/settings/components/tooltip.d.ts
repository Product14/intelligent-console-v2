declare module '@spyne-console/design-system/tooltip' {
  export interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    showTooltip?: boolean;
    className?: string;
    wrapperClassName?: string;
  }

  export default function Tooltip(props: TooltipProps): JSX.Element;
}
