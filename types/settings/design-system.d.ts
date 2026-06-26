declare module '@spyne-console/design-system/dropdown/select-dropdown' {
  interface SelectDropdownOption {
    text: string;
    value: string;
  }

  interface SelectDropdownProps {
    options: SelectDropdownOption[];
    onChange: (option: SelectDropdownOption | null) => void;
    selectedOption: SelectDropdownOption | null;
    dropdownClassName?: string;
    width?: 'auto' | 'full';
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    required?: boolean;
    textAtTop?: string;
    error?: string;
    className?: string;
    icon?: React.ReactNode;
    scrollIntoView?: boolean;
  }

  const SelectDropdown: React.FC<SelectDropdownProps>;
  export default SelectDropdown;
}
