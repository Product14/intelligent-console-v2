import React from 'react';

import { usePublishingModal } from './hooks/use-publishing-modal';
import { ShareModal } from './modals/share-modal';
import { PublishingProps } from './types';

const Publishing: React.FC<PublishingProps> = ({
  data,
  trigger,
  buttonClassName = 'bg-blue-light text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors',
  buttonText = 'Open Publishing',
  onDownloadClick,
  showToast,
}) => {
  const { isOpen, open, close } = usePublishingModal();

  return (
    <>
      {trigger ? (
        trigger({ onClick: open })
      ) : (
        <button className={buttonClassName} onClick={open}>
          {buttonText}
        </button>
      )}
      <ShareModal
        isOpen={isOpen}
        onClose={close}
        data={data}
        onDownloadClick={onDownloadClick}
        showToast={showToast}
      />
    </>
  );
};

export default Publishing;
