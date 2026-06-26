import React, {
  FC,
  MouseEvent,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import OutsideClickHandler from 'react-outside-click-handler';

import Image from 'next/image';

import classNames from 'classnames';

/** Context shape for UI state only (open/close). */
interface DropdownContextProps {
  isOpen: boolean;
  openDropdown: () => void;
  closeDropdown: () => void;
  dropdownPosition: 'top' | 'bottom';
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

/** Create the context. */
const DropdownContext = createContext<DropdownContextProps | null>(null);

/** Hook for subcomponents to access context. */
function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown subcomponents must be used within <Dropdown>.');
  }
  return context;
}

/** Main constructor pattern: Parent + Subcomponents. */
interface DropdownProps {
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  floatingLabel?: boolean;
  placeholder?: string;
  hasContent?: boolean;
  /** If provided, parent will control the open/close state */
  isOpen?: boolean;
  /** Callback when dropdown open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

const Dropdown: FC<DropdownProps> & {
  Trigger: FC<TriggerProps>;
  Menu: FC<MenuProps>;
  SearchInput: FC<SearchInputProps>;
  Options: FC<OptionsProps>;
  Option: FC<OptionProps>;
} = ({
  children,
  className = '',
  triggerClassName = '',
  floatingLabel = false,
  placeholder = 'Select',
  hasContent = false,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(
    'bottom'
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled state
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const handleDropdownToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const estimatedMenuHeight = 300; // Approximate max height of dropdown
      const spaceBelow = windowHeight - triggerRect.bottom;

      setDropdownPosition(
        spaceBelow < estimatedMenuHeight &&
          triggerRect.top > estimatedMenuHeight
          ? 'top'
          : 'bottom'
      );
    }
    const newIsOpen = !isOpen;
    if (onOpenChange) {
      onOpenChange(newIsOpen);
    } else {
      setInternalIsOpen(newIsOpen);
    }
  };

  const openDropdown = () => {
    if (!isOpen) {
      if (onOpenChange) {
        onOpenChange(true);
      } else {
        setInternalIsOpen(true);
      }
    }
  };

  const closeDropdown = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        openDropdown,
        closeDropdown,
        dropdownPosition,
        triggerRef,
      }}
    >
      <div className={`relative block ${className}`} ref={dropdownRef}>
        {floatingLabel && (
          <label
            className={`absolute left-3 text-nowrap bg-white pl-1 pr-2 text-xs font-light text-black transition-all ${
              isOpen || hasContent ? '-top-2' : 'top-2'
            }`}
          >
            {placeholder}
          </label>
        )}
        <div className={triggerClassName} ref={triggerRef}>
          {children}
        </div>
      </div>
    </DropdownContext.Provider>
  );
};

export default Dropdown;

//
// 1) Trigger
//
interface TriggerProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  showArrow?: boolean;
  arrowClass?: string;
  disableTriggerStyle?: boolean;
}
const Trigger: FC<TriggerProps> = ({
  children,
  className = '',
  disabled,
  showArrow = true,
  arrowClass = '',
  disableTriggerStyle = false,
}) => {
  const { isOpen, openDropdown, closeDropdown } = useDropdownContext();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Direct toggle without relying on isOpen from context
    isOpen ? closeDropdown() : openDropdown();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        !disableTriggerStyle &&
          'flex items-center justify-between gap-x-1 border p-2',
        className,
        {
          'cursor-not-allowed opacity-50': disabled,
        }
      )}
      disabled={disabled}
    >
      {children}
      {showArrow && (
        <span className={`${arrowClass}`}>
          {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
        </span>
      )}
    </button>
  );
};

Dropdown.Trigger = Trigger;

//
// 2) Menu
//
interface MenuProps {
  children: ReactNode;
  className?: string;
}

const Menu: FC<MenuProps> = ({ children, className = '' }) => {
  const { isOpen, triggerRef, closeDropdown, openDropdown } =
    useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  // Handle SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const menuRect = menuRef.current!.getBoundingClientRect();

      // Calculate available space
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Determine vertical position
      const positionTop =
        spaceBelow > menuRect.height
          ? triggerRect.bottom + window.scrollY // Position below if space
          : triggerRect.top + window.scrollY - menuRect.height; // Position above if not enough space below

      // Calculate horizontal position
      const left = Math.max(
        16,
        Math.min(
          triggerRect.left + window.scrollX,
          window.innerWidth - menuRect.width - 16
        )
      );

      setPositionStyle({
        position: 'absolute',
        top: `${positionTop + 5}px`,
        left: `${left}px`,
        minWidth: `${triggerRect.width}px`,
        zIndex: 9999,
      });
    };

    // Initial calculation
    calculatePosition();

    // Create observer for dynamic updates
    const resizeObserver = new ResizeObserver(calculatePosition);
    resizeObserver.observe(menuRef.current);

    return () => resizeObserver.disconnect();
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <OutsideClickHandler
      onOutsideClick={(e: any) => {
        // Only close if click is outside both trigger and menu
        // and not within any data-dropdown-content element
        if (
          !triggerRef.current?.contains(e.target as Node) &&
          !menuRef.current?.contains(e.target as Node) &&
          !(e.target as Element).closest('[data-dropdown-content]')
        ) {
          closeDropdown();
        }
      }}
    >
      <div
        ref={menuRef}
        style={positionStyle}
        className={`z-30 min-w-[200px] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-md ${className}`}
        data-dropdown-content
      >
        {children}
      </div>
    </OutsideClickHandler>,
    document.body
  );
};

Dropdown.Menu = Menu;

//
// 3) SearchInput
//
interface SearchInputProps {
  /**
   * onChange is handled by the parent (business logic).
   * The common dropdown only handles UI (like styling).
   */
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  icon?: string;
}

const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  icon,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={`flex rounded-lg border border-[#1D006629] px-2 py-1 ${className}`}
    >
      {icon && (
        <Image className="mr-2" src={icon} alt="" height={20} width={20} />
      )}
      <input
        type="text"
        className="w-full rounded py-1"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value);
        }}
      />
    </div>
  );
};

Dropdown.SearchInput = SearchInput;

//
// 4) Options
//
interface OptionsProps {
  children: ReactNode;
  className?: string;
  id?: string;
  autoCloseOnSelect?: boolean;
}

const Options: FC<OptionsProps> = ({
  children,
  className = '',
  id,
  autoCloseOnSelect = true,
}) => {
  return (
    <div
      className={`scrollbar-hide flex flex-col overflow-auto ${className}`}
      id={id}
      data-auto-close={autoCloseOnSelect}
    >
      {children}
    </div>
  );
};

Dropdown.Options = Options;

//
// 5) Option
//
interface OptionProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  /**
   * If you want an "edit" icon or action, you can pass a callback or
   * render a child. We'll keep it simple: pass an onEdit if needed.
   */
  onEdit?: () => void;
}

const Option: FC<OptionProps> = ({
  children,
  className = '',
  onClick,
  onEdit,
}) => {
  const { closeDropdown } = useDropdownContext();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e);
    }
    // Check if parent Options has autoCloseOnSelect set to true
    const optionsElement = (e.currentTarget as HTMLElement).closest(
      '[data-auto-close]'
    );
    const shouldAutoClose =
      optionsElement?.getAttribute('data-auto-close') !== 'false';

    if (shouldAutoClose) {
      closeDropdown();
    }
  };

  return (
    <div
      className={`flex w-full cursor-pointer items-center px-3 py-2 hover:bg-gray-100 ${className} `}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

Dropdown.Option = Option;
