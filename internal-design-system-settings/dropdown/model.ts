export interface CIDropdownMenuOption {
  onClick?: () => void;
  id?: string | number;
  label: string; // This is the label that will be displayed in the dropdown
  value: string | number; // This is the value that will be returned when the option is selected
  icon?: React.ReactNode; // This is the icon that will be displayed in the dropdown
  selectedIcon?: React.ReactNode; // This is the selected icon that will be displayed in the dropdown
  disabled?: boolean; // This is the disabled state of the option
  sectionHeader?: string; // This will show a header at the top of the option
  showSeparator?: boolean; // This will show a border at the bottom of the option for creating a separation
  subOptions?: CIDropdownMenuOption[]; // If any option has sub options, then this will trigger a sub menu
  isSelected?: boolean; // This is the selected state of the option
  hideLabel?: boolean; // This is the hide label state of the option
  /** Optional custom content to render inside a submenu panel (e.g., datepicker) */
  customContent?: React.ReactNode;
  /** Controlled open state for the sub-menu (used when customContent needs programmatic close) */
  subOpen?: boolean;
  /** Callback when the sub-menu open state changes */
  onSubOpenChange?: (open: boolean) => void;
}
