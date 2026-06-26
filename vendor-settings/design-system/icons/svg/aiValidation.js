import React from 'react';

const AiValidation = ({ className = '' }) => {
  return (
    <svg
      className={className}
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.351562" width="24" height="24" rx="12" fill="black" />
      <path
        d="M6.2474 15.5L7.98909 8.46289H9.87151L11.6132 15.5H10.4257L8.95669 9.31614H8.84234L7.35575 15.5H6.2474ZM7.36454 13.2129V12.131H10.4961V13.2129H7.36454ZM12.7672 15.5V14.4092H14.5177V9.55364H12.7672V8.46289H17.4117V9.55364H15.6613V14.4092H17.4117V15.5H12.7672Z"
        fill="white"
      />
    </svg>
  );
};

export default AiValidation;
