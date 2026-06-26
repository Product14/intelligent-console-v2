import React from 'react';

import SVG from '../svg/SVG';

const Footer = ({ modalType, setModalType, isAnyUnreadTicket }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white py-2 shadow-2xl">
      <div className="flex items-center justify-center">
        <button
          className={`flex flex-1 flex-col items-center gap-1 px-4 py-2 ${
            modalType === 'home'
              ? 'text-[#8A61EE]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setModalType('home')}
        >
          <SVG
            iconName="Home"
            fill={modalType === 'home' ? '#8A61EE' : 'black'}
            fillOpacity={modalType === 'home' ? '1' : '0.6'}
          />
          <span className="text-sm font-medium">Home</span>
        </button>

        <button
          className={`relative flex flex-1 flex-col items-center gap-1 px-4 py-2 ${
            modalType === 'allTickets'
              ? 'text-[#8A61EE]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setModalType('allTickets')}
        >
          <SVG
            iconName="Chat"
            fill={modalType === 'allTickets' ? '#8A61EE' : 'black'}
            fillOpacity={modalType === 'allTickets' ? '1' : '0.6'}
          />
          <span className="text-sm font-medium">Messages</span>
          {isAnyUnreadTicket && (
            <div className="absolute left-[56%] top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-red-500" />
          )}
        </button>
        <button
          className={`relative flex flex-1 flex-col items-center gap-1 px-4 py-2 ${
            modalType === 'guide'
              ? 'text-[#8A61EE]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setModalType('guide')}
        >
          <SVG
            iconName="MenuBook"
            fill={modalType === 'guide' ? '#8A61EE' : 'black'}
            fillOpacity={modalType === 'guide' ? '1' : '0.6'}
          />
          <span className="text-sm font-medium">Guide</span>
        </button>
      </div>
    </div>
  );
};

export default Footer;
