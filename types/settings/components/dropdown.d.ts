declare module '@spyne-console/design-system/dropdown' {
  import { ReactNode } from 'react';

  export interface DropdownOption {
    key?: string | number;
    id?: string | number;
    text?: string;
    class?: string;
    selected?: boolean;
    [key: string]: any;
  }

  export interface DropdownProps {
    handleOptionClick: (option: DropdownOption) => void;
    dropdownOptions?: DropdownOption[];
    loadMoreData?: () => void;
    hasMoreData?: boolean;
    loader?: ReactNode;
    endMessage?: ReactNode;
    dropdownClassName?: string;
    dropdownOptionClassName?: string;
    maxHeight?: string;
    id?: string;
  }

  const Dropdown: React.FC<DropdownProps>;
  export default Dropdown;
}
