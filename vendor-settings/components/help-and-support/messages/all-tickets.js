import { SelectDropdown, Tooltip } from '@spyne-console/design-system';

import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import axios from 'axios';

import useRouting from '@spyne-console/hooks/useRouting';

import SVG from '../../svg/SVG';
import { MESSAGE_STATUS_OPTIONS, MESSAGE_TYPE_OPTIONS } from '../constants';
import { debounce, formatDate } from '../utils';

const AllTickets = ({
  isOpen,
  onClose,
  setModalType,
  setSelectedTicket,
  setFrom,
  setIsAnyUnreadTicket,
  isIframe = false,
}) => {
  const [page, setPage] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouting();
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [selectedMessageType, setSelectedMessageType] = useState(
    MESSAGE_TYPE_OPTIONS[1]
  );
  const [defaultBearerToken, setDefaultBearerToken] = useState('');
  const [selectedMessageStatus, setSelectedMessageStatus] = useState(
    MESSAGE_STATUS_OPTIONS[0]
  );
  let { enterprise_id, team_id, bearer_token, user_email } = router.query;

  if (team_id?.[0] === '[') {
    team_id = team_id?.slice(1, -1);
  }

  const debouceSearch = debounce(setSearch, 500);

  const onTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalType('directMessages');
  };

  const handleSearchChange = async (e) => {
    if (e.target.value.length < 50) {
      debouceSearch(e.target.value);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let query = `?page=${page}&enterprise_id=${enterprise_id}&team_id=${team_id}&per_page=10&search=${search}`;

      if (selectedMessageStatus && selectedMessageStatus.value !== 'all') {
        query += `&status=${selectedMessageStatus.value}`;
      }

      if (selectedMessageType && selectedMessageType.value === 'user') {
        query += `&requester_email=${userDetails.emailId}`;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_CONSOLE_BACKEND_SERVICE_URL}/v1/freshdesk/get-freshdesk-tickets${query}`,
        {
          headers: {
            Authorization: defaultBearerToken,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response?.data?.data;
      setFetchError(null);
      setIsAnyUnreadTicket(
        data?.tickets?.some((ticket) => ticket?.is_unread === true)
      );

      if (page === 1) {
        setTickets(data?.tickets || []);
      } else {
        setTickets((prev) => [...prev, ...(data?.tickets || [])]);
      }

      setHasMore(data?.tickets?.length === 10);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setFetchError(
        `Error fetching tickets: ${error?.message || 'Unknown error occurred'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserDetails = localStorage.getItem('userDetails');
      setUserDetails(JSON.parse(storedUserDetails || '{}'));
    }
  }, []);

  useEffect(() => {
    if (enterprise_id && team_id && isOpen) {
      fetchTickets();
    }
  }, [enterprise_id, team_id, page, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (page === 1) {
        fetchTickets();
      } else {
        setPage(1);
      }
    }
  }, [search, selectedMessageType, selectedMessageStatus, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTickets([]);
      setPage(1);
      setHasMore(true);
      setSearch('');
      setSelectedMessageType(MESSAGE_TYPE_OPTIONS[1]);
      setSelectedMessageStatus(MESSAGE_STATUS_OPTIONS[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('defaultBearerToken');
      setDefaultBearerToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (isIframe && bearer_token) {
      setDefaultBearerToken(bearer_token);
      setUserDetails({ emailId: user_email });
    }
  }, [isIframe, bearer_token]);

  if (!isOpen) return null; // added here to avoid un necessary side effects

  return (
    <div className={`${isIframe ? 'flex h-full flex-col' : ''}`}>
      <div className="flex items-center justify-between border-b p-5">
        <div className="flex items-center gap-3">
          <SVG
            iconName="chevron"
            rotate={90}
            className="h-5 w-5 cursor-pointer text-black/80"
            onClick={() => setModalType('home')}
          />
          <span className="text-xl font-semibold leading-7 text-black/80">
            Message
          </span>
        </div>
        <SVG
          iconName="crossIcon"
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>
      <div className="relative flex min-h-[66vh] flex-col pt-3">
        <div className="flex flex-col gap-2 border-b px-3 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-black/10 bg-white py-2 pl-3 pr-10 text-sm font-normal text-black/80"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <SVG iconName="searchIcon" className="h-3 w-3 text-black" />
            </div>
          </div>
          <div className="flex gap-3">
            <SelectDropdown
              options={MESSAGE_TYPE_OPTIONS}
              dropdownClassName="px-3 py-2 w-full"
              dropdownDrawerClassName="min-w-full"
              selectedOption={selectedMessageType}
              onChange={(option) => setSelectedMessageType(option)}
              selectedOptionClass="text-sm font-normal text-black/80 w-full"
            />
            <SelectDropdown
              options={MESSAGE_STATUS_OPTIONS}
              className="w-full"
              placeholder="All Status"
              dropdownClassName="px-3 py-2 w-full"
              dropdownDrawerClassName="min-w-full"
              selectedOptionClass="text-sm font-normal text-black/80 w-full"
              selectedOption={selectedMessageStatus}
              onChange={(option) => setSelectedMessageStatus(option)}
            />
          </div>
        </div>
        {fetchError && (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-red-500">{fetchError}</span>
          </div>
        )}
        <div
          id="scrollableDiv"
          className={`${isIframe ? 'flex-1' : 'max-h-[340px]'} overflow-y-auto`}
        >
          <InfiniteScroll
            dataLength={tickets.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              loading && (
                <div className="py-4 text-center text-sm text-black/60">
                  Loading tickets...
                </div>
              )
            }
            scrollableTarget="scrollableDiv"
            endMessage={
              <div className="flex h-[30vh] items-center justify-center py-4 text-center text-sm font-normal italic text-black/60">
                {search?.length > 0
                  ? 'No result matches your search'
                  : `No ${tickets?.length > 0 ? 'more' : ''} tickets to load.`}
              </div>
            }
          >
            {tickets?.map((ticket) => (
              <div
                key={ticket.freshdesk_ticket_id}
                className="flex cursor-pointer items-center justify-between border-b bg-white py-[18px] pl-6 pr-5"
                onClick={() => onTicketClick(ticket)}
              >
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {ticket.subject.length > 25 ? (
                      <Tooltip content={ticket.subject} position="bottom">
                        <span className="cursor-help text-sm font-medium leading-tight text-black/80">
                          {ticket.subject.substring(0, 25)}...
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-sm font-medium leading-tight text-black/80">
                        {ticket.subject}
                      </span>
                    )}
                    <div
                      className={`px-2 py-0.5 text-xs font-medium ${ticket.status === 'Open' ? 'bg-[#FFFAEB] text-[#866800]' : 'bg-[#ECFDF3] text-[#027A48]'}`}
                    >
                      {ticket.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-normal leading-none text-black/60">
                      ID: {ticket.freshdesk_ticket_id}
                    </span>
                    <span className="text-xs font-normal leading-none text-black/60">
                      Started: {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SVG iconName="chevron" rotate={270} />
                  {ticket?.is_unread && (
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  )}
                </div>
              </div>
            ))}
          </InfiniteScroll>
        </div>
        <button
          className={`shadow-xs ${isIframe ? 'fixed bottom-28 left-1/2 -translate-x-1/2' : 'absolute bottom-28 left-1/2 -translate-x-1/2'} z-50 flex w-[360px] transform justify-between rounded-xl border border-gray-200 bg-white p-5 backdrop-blur-sm hover:shadow-sm`}
          onClick={() => {
            setModalType('sendMessage');
            setFrom('allTickets');
          }}
        >
          <span className="text-sm font-normal leading-tight text-black/80">
            Send us a message
          </span>
          <SVG iconName="chevron" rotate={270} />
        </button>
      </div>
    </div>
  );
};

export default AllTickets;
