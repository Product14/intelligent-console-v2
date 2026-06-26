import React from 'react';

const magnifyingGlass = ({ className }) => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17 17.6426L13.6167 14.2592M15.4444 9.8648C15.4444 13.3012 12.6587 16.087 9.22222 16.087C5.78578 16.087 3 13.3012 3 9.8648C3 6.42836 5.78578 3.64258 9.22222 3.64258C12.6587 3.64258 15.4444 6.42836 15.4444 9.8648Z"
        stroke="black"
        stroke-opacity="0.8"
        stroke-width="1.55556"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default magnifyingGlass;
