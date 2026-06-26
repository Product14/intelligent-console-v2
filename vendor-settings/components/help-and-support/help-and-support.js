import { useSelector } from '@spyne-console/store';

import { useEffect, useState } from 'react';

import useRouting from '@spyne-console/hooks/useRouting';

import CentralAPIHandler from '../../../utils/src/centralAPIHandler/centralAPIHandler';
import SVG from '../svg/SVG';
import MainModal from './main-modal';

const FloatingHelpAndSupport = ({
  helpVisible,
  closeHelp,
  modalOpen,
  setModalOpen,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isAnyUnreadTicket, setIsAnyUnreadTicket] = useState(false);
  const router = useRouting();
  let { enterprise_id, team_id } = router.query;

  if (team_id?.[0] === '[') {
    team_id = team_id?.slice(1, -1);
  }

  const resellerData = useSelector((state) => state.authReducer?.resellerData);
  const isReseller = resellerData?.is_reseller;

  const handleGotItClick = () => {
    setIsTooltipVisible(false);
    localStorage.setItem('help-and-support-tooltip-visible', 'false');
  };

  const fetchTickets = async () => {
    const { data } = await CentralAPIHandler.handleGetRequest(
      `${process.env.NEXT_PUBLIC_CONSOLE_BACKEND_SERVICE_URL}/v1/freshdesk/get-freshdesk-tickets?enterprise_id=${enterprise_id}&team_id=${team_id}&per_page=20&page=1`
    );
    setIsAnyUnreadTicket(
      data?.tickets?.some((ticket) => ticket?.is_unread === true)
    );
  };

  const handleHelpClick = () => {
    if (modalOpen) {
      setModalOpen(false);
      return;
    }
    localStorage.setItem('help-and-support-tooltip-visible', 'false');
    setModalOpen(true);
  };

  const handleCloseHelp = (e) => {
    e.preventDefault();
    closeHelp();
  };

  useEffect(() => {
    const visible = localStorage.getItem('help-and-support-tooltip-visible');
    if (visible !== 'false') {
      // if not yet acknowledged, show tooltip
      setIsTooltipVisible(true);
    }
  }, []);
  useEffect(() => {
    if (enterprise_id && team_id) {
      fetchTickets();
    }
  }, [enterprise_id, team_id]);

  if (!helpVisible || isReseller) {
    return null;
  }

  return (
    <div className="fixed bottom-[92px] right-6 z-[9999] md:bottom-6">
      <button
        onClick={handleHelpClick}
        className="group relative flex items-center justify-center rounded-full bg-white px-4 py-2 text-black/80 shadow-md"
        aria-label="Help and Support"
      >
        <SVG iconName="chatIcon" />
        <span className="text-sm font-medium">Help</span>

        {isAnyUnreadTicket && (
          <div className="absolute -top-1 right-0 h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-sm" />
        )}

        <div className="absolute -top-1.5 right-0 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-[#DBD9D9] opacity-0 transition-opacity duration-200 hover:bg-[#C2C1C1] group-hover:opacity-100">
          <SVG
            iconName="crossIcon"
            className="h-2 w-2 text-black"
            onClick={handleCloseHelp}
          />
        </div>
      </button>

      {isTooltipVisible && !modalOpen && (
        <div className="absolute bottom-full right-0 mb-4">
          <div className="relative w-72 rounded-[30px] bg-[#402387] p-4 text-white shadow-2xl">
            <span className="font-semibold text-white">Need Assistance?</span>
            <p className="mb-4 mt-2 text-sm text-white/70">
              Use our Help Chat for questions, support, or to share your
              feedback!
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleGotItClick}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[#402387] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
              >
                Got it!
              </button>
            </div>

            <div className="absolute -bottom-[6px] right-3 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-[#402387]" />
          </div>
        </div>
      )}

      <MainModal
        isAnyUnreadTicket={isAnyUnreadTicket}
        setIsAnyUnreadTicket={setIsAnyUnreadTicket}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default FloatingHelpAndSupport;
