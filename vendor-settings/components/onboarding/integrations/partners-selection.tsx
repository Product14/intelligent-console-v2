import { Spinner } from '@spyne-console/design-system';

import React, { useMemo, useState } from 'react';
import { HiOutlineArrowRight } from 'react-icons/hi';
import { IoSearchOutline } from 'react-icons/io5';

import ModalWrapper from '@spyne-console/design-system/modal/modal-wrapper';

import ImsNotListedCard from './ims-not-listed-button';
import PartnerCard from './partner-card';

interface Partner {
  id: string;
  name: string;
  icon: string;
  type?: 'ftp' | 'api' | 'manual';
}

type SelectionType = 'partner' | 'not-listed' | null;

interface PartnersSelectionProps {
  providerName: string;
  partnersData: Partner[];
  selectedPartnerId: string | null;
  selectedOptionType: SelectionType;
  handlePartnerClick: (partnerId: string) => void;
  onImsNotListedSelect: () => void;
  onPartnerDeselect?: () => void;
  loading?: boolean;
  notListedLabel?: string;
  showNotListed?: boolean;
}

// Top 8 IMS providers to show first (case-insensitive matching)
const TOP_PARTNER_NAMES = [
  'homenet',
  'vauto',
  'nexteppe',
  'reynolds',
  'inventory+',
  'vincue',
  'trueimages',
  'dealer eprocess',
];

const PAGE_SIZE = 8;

const PartnersSelection = ({
  providerName,
  partnersData,
  selectedPartnerId,
  selectedOptionType,
  handlePartnerClick,
  onImsNotListedSelect,
  onPartnerDeselect,
  loading,
  notListedLabel,
  showNotListed = true,
}: PartnersSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Handle partner click with toggle behavior
  const handlePartnerToggle = (partnerId: string) => {
    if (selectedPartnerId === partnerId && selectedOptionType === 'partner') {
      onPartnerDeselect?.();
    } else {
      handlePartnerClick(partnerId);
    }
  };

  // Handle partner click from modal — select and close modal
  const handleModalPartnerSelect = (partnerId: string) => {
    handlePartnerToggle(partnerId);
    setIsModalOpen(false);
    setModalSearchQuery('');
  };

  // Sort partners: top 8 first (in defined order), then rest alphabetically
  const { topPartners, restPartners } = useMemo(() => {
    const top: Partner[] = [];

    for (const topName of TOP_PARTNER_NAMES) {
      const match = partnersData.find((p) => p.name.toLowerCase() === topName);
      if (match) {
        top.push(match);
      }
    }

    const topIds = new Set(top.map((p) => p.id));
    const rest = partnersData
      .filter((p) => !topIds.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { topPartners: top, restPartners: rest };
  }, [partnersData]);

  // All sorted partners (top 8 first, then rest) with selected partner moved to front
  // only if it's outside the visible top 8 (e.g. picked from the modal)
  const allSortedPartners = useMemo(() => {
    const sorted = [...topPartners, ...restPartners];
    if (selectedPartnerId && selectedOptionType === 'partner') {
      const selectedIndex = sorted.findIndex((p) => p.id === selectedPartnerId);
      if (selectedIndex >= PAGE_SIZE) {
        const [selected] = sorted.splice(selectedIndex, 1);
        sorted.unshift(selected);
      }
    }
    return sorted;
  }, [topPartners, restPartners, selectedPartnerId, selectedOptionType]);

  // Filter providers based on search query (main screen)
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSortedPartners;
    }
    return allSortedPartners.filter((provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allSortedPartners]);

  // Filter all sorted partners for modal search (same order with selected on top)
  const filteredModalPartners = useMemo(() => {
    if (!modalSearchQuery.trim()) {
      return allSortedPartners;
    }
    return allSortedPartners.filter((provider) =>
      provider.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
    );
  }, [modalSearchQuery, allSortedPartners]);

  // When searching on main screen, show all matches; otherwise show top 8 only
  const isSearching = searchQuery.trim() !== '';
  const displayedPartners = isSearching
    ? filteredProviders
    : allSortedPartners.slice(0, PAGE_SIZE);
  const hasMore = partnersData.length > PAGE_SIZE;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold leading-6 text-[#111]">
          Choose your {providerName}
        </h3>

        {/* Search input */}
        <div className="relative">
          <div className="flex w-60 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
            <IoSearchOutline className="h-5 w-5 text-black/40" />
            <input
              type="text"
              placeholder={`Search ${providerName}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-normal leading-6 text-black/90 outline-none placeholder:text-black/40"
            />
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-5">
            {displayedPartners.map((provider: Partner) => (
              <PartnerCard
                key={provider.id}
                id={provider.id}
                name={provider.name}
                icon={provider.icon}
                isSelected={
                  selectedPartnerId === provider.id &&
                  selectedOptionType === 'partner'
                }
                onClick={handlePartnerToggle}
              />
            ))}

            {/* "My IMS is not listed here" card */}
            {showNotListed && (
              <ImsNotListedCard
                isSelected={selectedOptionType === 'not-listed'}
                onClick={onImsNotListedSelect}
                providerName={providerName}
              />
            )}
          </div>

          {/* View More button — opens modal */}
          {!isSearching && hasMore && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mx-auto flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-black/80 transition-colors hover:bg-gray-200"
            >
              View All Partners ({restPartners.length} more){' '}
              <HiOutlineArrowRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}

      {/* Modal for all partners */}
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalSearchQuery('');
        }}
        className="flex max-h-[80vh] max-w-[750px] flex-col overflow-hidden"
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-[5] flex items-center justify-between bg-white pb-4 pr-8">
          <h3 className="text-lg font-semibold text-[#111]">
            Choose your {providerName}
          </h3>

          {/* Modal Search */}
          <div className="flex w-60 items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
            <IoSearchOutline className="h-5 w-5 text-black/40" />
            <input
              type="text"
              placeholder={`Search ${providerName}`}
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-normal leading-6 text-black/90 outline-none placeholder:text-black/40"
            />
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            {filteredModalPartners.map((provider: Partner) => (
              <PartnerCard
                key={provider.id}
                id={provider.id}
                name={provider.name}
                icon={provider.icon}
                isSelected={
                  selectedPartnerId === provider.id &&
                  selectedOptionType === 'partner'
                }
                onClick={handleModalPartnerSelect}
              />
            ))}

            {/* "My IMS is not listed here" card */}
            <ImsNotListedCard
              isSelected={selectedOptionType === 'not-listed'}
              onClick={() => {
                onImsNotListedSelect();
                setIsModalOpen(false);
                setModalSearchQuery('');
              }}
              providerName={providerName}
            />
          </div>

          {filteredModalPartners.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              No partners found matching &quot;{modalSearchQuery}&quot;
            </div>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
};

export default PartnersSelection;
