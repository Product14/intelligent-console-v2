import React from 'react';
import Spinner from '@spyne-console/design-system/spinner';

const Loading = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default Loading;
