/**@format */
import React from 'react';

const IceBlueTag = ({ className, pathClass }) => {
  return (
    <svg
      width="74"
      height="22"
      viewBox="0 0 74 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className ? className : 'fill-[#EFF8FF]'}`}
    >
      <path d="M65.9141 1.34L72.3144 8.52799C73.2877 9.62107 73.3302 11.2569 72.4149 12.399L65.9219 20.5014C65.1627 21.4487 64.0145 22 62.8005 22H-6V0H62.9267C64.0681 0 65.1551 0.48758 65.9141 1.34Z" />
      <path
        d="M71.941 8.86049L65.5407 1.6725C64.8765 0.926633 63.9254 0.5 62.9267 0.5H-5.5V21.5H62.8005C63.8627 21.5 64.8674 21.0176 65.5317 20.1887L72.0247 12.0864C72.7874 11.1346 72.752 9.77139 71.941 8.86049Z"
        className={`${pathClass ? pathClass : 'stroke-[#175CD3] opacity-5'}`}
      />
    </svg>
  );
};

export default IceBlueTag;
