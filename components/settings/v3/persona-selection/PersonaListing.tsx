import { useActiveAgent } from '@/contexts/settings/ActiveAgentContext';
import { useMainContext } from '@/contexts/settings/mainContext';
import CIDropdown from '@/internal-design-system-settings/dropdown/ci-dropdown';
import { CIDropdownMenuOption } from '@/internal-design-system-settings/dropdown/model';
import { Persona } from '@/store-settings/models/persona.model';

import React, { useEffect, useMemo, useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { toast } from 'react-toastify';

import OnboardingBackgroundGrid from '@spyne-console/components/onboarding/onboarding-background-grid';
import OnboardingStepHeader from '@spyne-console/components/onboarding/onboarding-step-header';

import { PaginationController } from '@/components/settings/shared/PaginationController';
import { SvgRenderer } from '@/components/settings/shared/RenderSvg/SvgRenderer';

import { useAgentTypesRedux } from '@/hooks/settings/use-agent-types-redux';
import { usePersonaRedux } from '@/hooks/settings/use-persona-redux';
import useUserDetails from '@/hooks/settings/useUserDetails';

import { StringUtils } from '@/utils-settings/StringUtils';

import DurationHolder from '../common/DurationHolder';
import { PersonaCard } from '../common/PersonaCard';
import { PersonaCardSkeleton } from '../common/PersonaCardSkeleton';

interface PersonaListingProps {
  personas?: Persona[];
  selectedPersonaId?: string;
  onPersonaSelect?: (persona: Persona, name: string) => void;
  agentType?: string;
  agentCallType?: string;
  onBack?: () => void;
  isEditMode?: boolean;
}

const ITEMS_PER_PAGE = 12;

const genderOptions: CIDropdownMenuOption[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export const PersonaListing: React.FC<PersonaListingProps> = ({
  onPersonaSelect,
  onBack,
  isEditMode,
}) => {
  const { activeAgentTypeId, activePersonaId } = useActiveAgent();
  const { teamId } = useUserDetails();
  const { productLineId } = useMainContext();
  const [selectedGender, setSelectedGender] = useState<CIDropdownMenuOption[]>(
    []
  );
  const { disableConverseSidebar, setDisableConverseSidebar } =
    useMainContext();
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Extract filter values for API call
  const gender =
    selectedGender.length > 0 ? String(selectedGender[0].value) : undefined;

  const { personas, isLoading, isLoaded } = usePersonaRedux({
    agentTypeId: activeAgentTypeId!,
    gender,
    autoFetch: true,
    forceRefresh: true,
  });
  const { agentTypes } = useAgentTypesRedux({});

  const agentTypeData = useMemo(() => {
    return agentTypes.find(
      (agentType) => agentType.agentTypeId === activeAgentTypeId
    );
  }, [agentTypes, activeAgentTypeId]);

  const agentTypeLabel = useMemo(() => {
    return agentTypeData
      ? `${StringUtils.toCapitalize(agentTypeData.agentType)} ${StringUtils.toCapitalize(agentTypeData.agentCallType)}`
      : '';
  }, [agentTypeData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [gender]);

  useEffect(() => {
    if (isEditMode && !disableConverseSidebar) {
      setDisableConverseSidebar(true);
    }
    return () => {
      if (isEditMode && disableConverseSidebar) {
        setDisableConverseSidebar(false);
      }
    };
  }, []);

  // Sort personas with recommended first
  const sortedPersonas = useMemo(() => {
    return personas
      .slice()
      .sort((a, b) => (a.templateId === agentTypeData?.templateId ? -1 : 1));
  }, [personas, agentTypeData?.templateId]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedPersonas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPersonas = sortedPersonas.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const hasActiveFilters = selectedGender.length > 0;

  const handleClearFilters = () => {
    setSelectedGender([]);
  };

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative flex h-full overflow-hidden">
        <OnboardingBackgroundGrid fadeRight={true} width="50%" />

        <div className="flex h-full w-full flex-col gap-6 p-8 pb-0">
          <OnboardingStepHeader
            title={`Choose your ${agentTypeLabel} Agent's Persona`}
            description="Confirm basic details of your rooftop"
          >
            <DurationHolder />
          </OnboardingStepHeader>

          <div className="flex w-full items-center justify-between pr-4">
            <div className="flex items-center gap-2">
              {isEditMode && !!onBack && (
                <IoChevronBack
                  className="h-5 w-5 cursor-pointer text-[#111]"
                  onClick={onBack}
                />
              )}
              <p className="text-lg font-semibold leading-7 text-[#111]">
                Select Agent
              </p>
            </div>

            <div className="flex items-center gap-2">
              <CIDropdown
                selectedValues={selectedGender}
                options={genderOptions}
                onChange={setSelectedGender}
                placeholder="Gender"
                variant="filter"
                isMultiSelect={false}
                showCheckmark={true}
                allowDeselection={true}
              />
            </div>
          </div>

          {personas.length === 0 && isLoaded ? (
            <div className="flex h-full flex-col items-center justify-center gap-8 py-8">
              <div className="relative h-[166px] w-[177px] shrink-0">
                <SvgRenderer fileName="empty-service" />
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-center text-lg font-semibold leading-7 text-neutral-950">
                    No Personas Available{' '}
                    {hasActiveFilters ? 'for this selection' : ''}
                  </p>
                  {hasActiveFilters && (
                    <p className="text-center text-sm font-normal leading-5 text-[#8f8f8f]">
                      There are no personas matching your selected filters
                    </p>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center justify-center gap-2 rounded-md bg-[#010101] px-4 py-2 transition-colors hover:bg-[#333333]"
                  >
                    <span className="text-sm font-medium leading-6 text-white">
                      Clear Filters
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="h-calc[100%-240px] grid grid-cols-3 gap-6 overflow-y-auto p-2 pb-2 pr-4">
                {isLoading
                  ? Array.from({ length: 12 }).map((_, index) => (
                      <PersonaCardSkeleton key={index} />
                    ))
                  : paginatedPersonas.map((persona) => (
                      <PersonaCard
                        key={persona.templateId}
                        persona={persona}
                        onSelect={onPersonaSelect}
                        isAgentSelected={
                          agentTypeData?.templateId === persona.templateId
                        }
                        isRecommended={
                          agentTypeData?.templateId === persona.templateId
                        }
                      />
                    ))}
              </div>
              {!isLoading && totalPages > 1 && (
                <div className="pb-4 pr-4">
                  <PaginationController
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
