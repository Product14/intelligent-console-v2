declare module '@spyne-console/design-system/select-chip' {
  export default function SelectChip({
    id,
    label,
    value,
    isSelected = false,
    onClick,
    disabled = false,
    className = '',
    activeClassName = 'bg-purple-100 text-blue-light border-blue-light',
    inactiveClassName = 'bg-white text-black-60 border-grey-light',
  }: {
    id: string;
    label: string;
    value: string;
    isSelected?: boolean;
    onClick?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    activeClassName?: string;
    inactiveClassName?: string;
  }): JSX.Element;

  export interface SelectChipProps {
    id: string;
    label: string;
    value: string;
    isSelected?: boolean;
    onClick?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    activeClassName?: string;
    inactiveClassName?: string;
  }

  export const SelectChip: React.FC<SelectChipProps>;
}
