import React from 'react';

import SupportContainer from './SupportContainer';

function HelpAndSupport(props) {
  return (
    <div
      className={`fixed inset-0 z-10 ${props.showHelpAndSupport ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity duration-300 ease-in-out`}
    >
      <div className="bg-black-60 fixed inset-0 bg-opacity-80"></div>
      <div
        className={`items-top z-40 flex h-full transform justify-end gap-4 duration-300 ease-in-out ${props.showHelpAndSupport ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button
          onClick={props.openHelpAndSupport}
          className="relative top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-white text-xl text-gray-800 shadow-md"
        >
          &times;
        </button>
        <div className="modal-content relative h-full w-[600px] max-w-full overflow-y-auto rounded-l-3xl bg-white shadow-lg">
          <SupportContainer />
        </div>
      </div>
    </div>
  );
}

export default HelpAndSupport;
