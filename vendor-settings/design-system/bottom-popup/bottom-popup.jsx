import Svg from '@spyne-console/design-system/svg';

import { cn } from '@spyne-console/utils/cn';

/**
 *
 * @param {*} HeaderType 1:text in left and image in right
 * @param {*} HeaderType 2:text in right and image in left
 * @param {*} children: content of the popup
 * @param {*} onClose: function to close the popup
 * @param {*} headerTitle: title of the popup
 * @param {*} leftIcon: icon of the left side of the popup
 * @param {*} rightIcon: icon of the right side of the popup
 * @param {*} leftIconClassName: class name of the left icon
 * @param {*} rightIconClassName: class name of the right icon
 * @param {*} onLeftIconClick: function to click the left icon
 * @param {*} onRightIconClick: function to click the right icon
 */
export default function BottomPopup({
  children,
  headerType = 1,
  onClose,
  headerTitle,
  leftIcon = headerType === 1 ? null : 'BackIcon',
  rightIcon = headerType === 1 ? 'cross' : null,
  leftIconClassName = 'opacity-50',
  rightIconClassName = '',
  onLeftIconClick,
  onRightIconClick,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancelButton = false,
  showConfirmButton = true,
  containerClassName = 'fixed inset-0 z-50 flex items-end justify-center',
  confirmButtonClassName = '',
  cancelButtonClassName = '',
  confirmButtonDisabled = false,
  cancelButtonDisabled = false,
}) {
  const handleLeftIconClick = () => {
    if (onLeftIconClick) {
      onLeftIconClick();
    } else {
      onClose();
    }
  };

  const handleRightIconClick = () => {
    if (onRightIconClick) {
      onRightIconClick();
    } else {
      onClose();
    }
  };

  return (
    <div className={cn(containerClassName, 'bg-black bg-opacity-40')}>
      <div className="mx-auto w-full max-w-md rounded-2xl rounded-b-none bg-white p-0 shadow-2xl">
        {/* header */}
        <div
          className={cn(
            'flex',
            headerType === 1 ? 'items-start justify-between' : 'items-center',
            'border-b p-4'
          )}
        >
          {leftIcon && (
            <button
              onClick={handleLeftIconClick}
              className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Svg iconName={leftIcon} className={leftIconClassName} />
            </button>
          )}
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
          {rightIcon && (
            <button
              onClick={handleRightIconClick}
              className="ml-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <Svg iconName={rightIcon} className={rightIconClassName} />
            </button>
          )}
        </div>
        {children}
        {showConfirmButton && (
          <div className="border-t p-3">
            {showCancelButton ? (
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className={cn(
                    'flex-1 rounded-xl border border-gray-300 py-3 text-lg font-semibold text-gray-700 transition hover:bg-gray-50',
                    cancelButtonClassName
                  )}
                  disabled={cancelButtonDisabled}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={cn(
                    'bg-blue-light flex-1 rounded-xl py-3 text-lg font-semibold text-white transition hover:bg-blue-600',
                    confirmButtonClassName
                  )}
                  disabled={confirmButtonDisabled}
                >
                  {confirmText}
                </button>
              </div>
            ) : (
              <button
                onClick={onConfirm}
                className={cn(
                  'bg-blue-light w-full rounded-xl py-3 text-lg font-semibold text-white transition hover:bg-blue-600',
                  confirmButtonClassName
                )}
                disabled={confirmButtonDisabled}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
