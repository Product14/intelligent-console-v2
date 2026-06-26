import { useState } from 'react';

import Footer from './footer';
import Guide from './guide';
import Home from './home';
import AllTickets from './messages/all-tickets';
import DirectMessages from './messages/direct-messages';
import SendMessage from './send-message';

const MainModal = ({
  isOpen,
  onClose,
  isAnyUnreadTicket,
  setIsAnyUnreadTicket,
  isIframe = false,
}) => {
  const [modalType, setModalType] = useState('home');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [from, setFrom] = useState(null);

  return (
    <div
      className={`${isIframe ? 'relative h-full w-full' : 'absolute bottom-full right-0 z-[10000] mb-4 w-[380px]'} origin-bottom-right transform overflow-hidden ${isIframe ? 'rounded-none' : 'rounded-[20px]'} bg-[#FCFCFC] ${isIframe ? '' : 'shadow-2xl'} ${
        isOpen
          ? 'pointer-events-auto scale-100 opacity-100 transition-all duration-300 ease-out'
          : 'pointer-events-none scale-0 opacity-0 transition-all duration-0'
      }`}
    >
      <Home
        isOpen={modalType === 'home'}
        onClose={onClose}
        setModalType={setModalType}
        setFrom={setFrom}
        isIframe={isIframe}
      />
      <SendMessage
        isOpen={modalType === 'sendMessage'}
        onClose={onClose}
        setModalType={setModalType}
        from={from}
        isIframe={isIframe}
      />
      <AllTickets
        isOpen={modalType === 'allTickets'}
        onClose={onClose}
        setModalType={setModalType}
        setSelectedTicket={setSelectedTicket}
        setFrom={setFrom}
        setIsAnyUnreadTicket={setIsAnyUnreadTicket}
        isIframe={isIframe}
      />
      <DirectMessages
        isOpen={modalType === 'directMessages'}
        onClose={onClose}
        setModalType={setModalType}
        selectedTicket={selectedTicket}
        setSelectedTicket={setSelectedTicket}
        isIframe={isIframe}
      />
      <Guide
        isOpen={modalType === 'guide'}
        onClose={onClose}
        setModalType={setModalType}
        isIframe={isIframe}
      />

      {modalType !== 'sendMessage' && modalType !== 'directMessages' && (
        <Footer
          modalType={modalType}
          setModalType={setModalType}
          isAnyUnreadTicket={isAnyUnreadTicket}
        />
      )}
    </div>
  );
};

export default MainModal;
