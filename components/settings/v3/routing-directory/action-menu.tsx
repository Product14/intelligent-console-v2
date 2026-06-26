import { RoutingDirectoryEmployee } from '@/app-models-settings/routing-directory/routing-directory.model';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiDotsHorizontal } from 'react-icons/hi';
import { LuPencil } from 'react-icons/lu';

export interface ActionMenuProps {
  employee: RoutingDirectoryEmployee;
  onEdit?: (employee: RoutingDirectoryEmployee) => void;
}

export const ActionMenu = ({ employee, onEdit }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverStyle({
      position: 'fixed',
      top: rect.top + rect.height / 2,
      left: rect.left - 168,
      transform: 'translateY(-50%)',
      zIndex: 9999,
    });
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative flex items-center justify-center">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
      >
        <HiDotsHorizontal className="h-4 w-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="min-w-[168px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
          >
            <button
              onClick={() => {
                onEdit?.(employee);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neutral-800 hover:bg-gray-50"
            >
              <LuPencil className="h-4 w-4 shrink-0 text-gray-400" />
              Edit Details
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};
