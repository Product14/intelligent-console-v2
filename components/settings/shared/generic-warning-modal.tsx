import React from 'react';

interface GenericWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  position?: 'center' | 'bottom-right';
  className?: string;
}

const GenericWarningModal: React.FC<GenericWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  position = 'center',
  className = '',
}) => {
  if (!isOpen) return null;

  const getPositionClasses = () => {
    if (position === 'bottom-right') {
      return 'fixed bottom-4 right-4 z-[9999]';
    }
    return 'fixed inset-0 z-[9999] flex items-center justify-center';
  };

  const getBackdropClasses = () => {
    if (position === 'center') {
      return 'fixed inset-0 z-[9998]';
    }
    return '';
  };

  return (
    <>
      {/* Backdrop */}
      {position === 'center' && <div className={getBackdropClasses()} />}

      {/* Modal Container */}
      <div className={`${getPositionClasses()} ${className}`}>
        <div className="relative h-[152px] w-[268px] max-w-[600px] shrink-0 rounded-[8px] bg-white shadow-[0px_8px_20px_-8px_rgba(0,0,0,0.08),0px_12px_32px_0px_rgba(0,0,0,0.04),0px_6px_24px_0px_rgba(0,0,0,0.06),0px_16px_40px_0px_rgba(0,0,0,0.08)]">
          <div className="flex h-[152px] w-[268px] flex-col items-start justify-between gap-4 overflow-clip px-0 py-4">
            {/* Text Container */}
            <div className="flex w-full shrink-0 flex-col items-start justify-start gap-1 px-4 py-0">
              {/* Heading */}
              <div className="flex w-full shrink-0 items-start justify-start bg-[rgba(255,255,255,0)]">
                <div
                  className="relative min-h-px min-w-px shrink-0 grow basis-0 text-[14px] font-bold leading-[20px] text-[#1c2024]"
                  style={{
                    fontFamily: 'SF Pro, sans-serif',
                    fontVariationSettings: "'wdth' 100",
                  }}
                >
                  {title}
                </div>
              </div>

              {/* Description */}
              <div className="flex w-full shrink-0 items-start justify-start bg-[rgba(255,255,255,0)]">
                <div
                  className="relative min-h-px min-w-px shrink-0 grow basis-0 text-[12px] font-normal leading-[16px] tracking-[0.04px] text-[#1c2024]"
                  style={{
                    fontFamily: 'SF Pro, sans-serif',
                    fontVariationSettings: "'wdth' 100",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>

            {/* Button Container */}
            <div className="flex w-full shrink-0 items-center justify-end gap-2 px-4 py-0">
              {/* Cancel Button */}
              <div className="relative flex h-8 shrink-0 items-center justify-center gap-2 rounded-[6px] px-3 py-0">
                <div className="pointer-events-none absolute inset-0 rounded-[6px] border border-solid border-neutral-200" />
                <button
                  onClick={onClose}
                  className="flex shrink-0 flex-col justify-center text-nowrap text-[14px] font-[510] leading-[0] text-neutral-950 transition-colors hover:opacity-80"
                  style={{
                    fontFamily: 'SF Pro, sans-serif',
                    fontVariationSettings: "'wdth' 100",
                  }}
                >
                  <p className="whitespace-pre leading-[20px]">{cancelText}</p>
                </button>
              </div>

              {/* Confirm Button */}
              <div className="flex h-8 shrink-0 items-center justify-center gap-2 rounded-[6px] bg-[#4600f2] px-3 py-0">
                <button
                  onClick={onConfirm}
                  className="flex shrink-0 flex-col justify-center text-nowrap text-[14px] font-[510] leading-[0] text-white transition-colors hover:opacity-80"
                  style={{
                    fontFamily: 'SF Pro, sans-serif',
                    fontVariationSettings: "'wdth' 100",
                  }}
                >
                  <p className="whitespace-pre leading-[20px]">{confirmText}</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenericWarningModal;
