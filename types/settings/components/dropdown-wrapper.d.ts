declare module '@spyne-console/design-system/dropdown-wrapper' {
  import * as React from 'react';

  export interface DropdownWrapperProps {
    dropdownContent: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    dropdownClassName?: string;
    triggerClassName?: string;
    closeOnScroll?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    scrollIntoView?: boolean;
    position?: 'bottom' | 'top' | 'left' | 'right';
    align?: 'left' | 'right' | 'center' | 'top' | 'bottom';
    offset?: number;
    verticalOffset?: number;
    horizontalOffset?: number;
    maxHeight?: number | string;
    width?: 'auto' | 'full' | number | string;
    zIndex?: number;
    portal?: boolean;
    useSimplePositioning?: boolean;
    triggerId?: string;
    dropdownId?: string;
    ariaLabel?: string;
    role?: string;
  }

  const DropdownWrapper: React.FC<DropdownWrapperProps>;
  export default DropdownWrapper;
}
