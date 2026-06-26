import React from 'react';

import { cn } from '@spyne-console/utils/cn';

const PlayStoreIcon = ({ className, height = 24, width = 24 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M3.609 2.5l10.57 10.57-10.57 10.57c-.519-.418-.835-1.054-.835-1.764V4.264c0-.71.316-1.346.835-1.764zm11.89 11.89l2.828-2.828 3.535 1.414c.71.284 1.179.959 1.179 1.764s-.469 1.48-1.179 1.764l-3.535 1.414-2.828-2.828zm-1.32-1.32L3.609 2.5C4.127 2.082 4.763 1.766 5.473 1.766h13.054c.71 0 1.346.316 1.764.835L9.721 13.07zm0 2.64l10.57 10.57c-.418.519-1.054.835-1.764.835H5.473c-.71 0-1.346-.316-1.764-.835l10.57-10.57z"
        fill="currentColor"
      />
    </svg>
  );
};

export default PlayStoreIcon;
