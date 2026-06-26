import React, { useEffect, useMemo, useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { MdContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';

import CentralAPIHandler from '@spyne-console/utils/centralAPIHandler';

import StudioAiBadge from '../badges/studio-ai-badge';
import OnboardingPdfViewer from '../onboarding-pdf-viewer';
import OnboardingRooftopSubscriptionShimmer from './onboarding-rooftop-subscription-shimmer';

const OnboardingRooftopSubscription = ({
  enterpriseId,
  teamId,
  className,
  isProductVini = false,
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formatContractDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  };

  useEffect(() => {
    if (!enterpriseId || !teamId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchContractingData = async () => {
      setLoading(true);

      try {
        const response = await CentralAPIHandler.handleGetRequest(
          `${process.env.BACKEND_BASEURL}/credit/v6/get-team-contracting-data?enterpriseId=${enterpriseId}&teamId=${teamId}`
        );

        setData(response.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractingData();
  }, [enterpriseId, teamId]);

  const relevantContract = useMemo(
    () =>
      data?.contracts?.find((contract) =>
        contract?.productLines?.some(
          (productLine) =>
            productLine?.productLineDisplayName ===
            (isProductVini ? 'Conversational AI' : 'Studio AI')
        )
      ),
    [data, isProductVini]
  );

  const studioPlan = useMemo(() => {
    if (!relevantContract) return '';
    return (
      relevantContract?.productLines?.find(
        (productLine) => productLine?.productLineDisplayName === 'Studio AI'
      )?.plan ?? ''
    );
  }, [relevantContract]);

  const agents = useMemo(() => {
    if (!relevantContract) return [];

    const conversationalAIProduct = relevantContract?.productLines?.find(
      (productLine) =>
        productLine?.productLineDisplayName === 'Conversational AI'
    );
    if (conversationalAIProduct?.displayProductNames?.length > 0) {
      if (conversationalAIProduct?.displayProductNames?.length > 1) {
        return [
          conversationalAIProduct?.displayProductNames?.[0],
          `+ ${conversationalAIProduct?.displayProductNames?.length - 1}`,
        ];
      }
      return [conversationalAIProduct?.displayProductNames?.[0]];
    }

    return [];
  }, [relevantContract]);

  const openPdf = () => {
    // if (relevantContract?.contractUrl) {
    //   window.open(relevantContract?.contractUrl, '_blank');
    // }
    setIsPdfModalOpen(true);
  };

  const handleCopyId = async () => {
    if (data?.enterpriseId) {
      try {
        await navigator.clipboard.writeText(data.enterpriseId);
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      } catch (error) {
        console.error('Failed to copy Enterprise ID:', error);
      }
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  if (loading) {
    return <OnboardingRooftopSubscriptionShimmer />;
  }

  return (
    <div
      className={`flex h-fit w-full max-w-[300px] flex-col items-center gap-6 overflow-hidden rounded-2xl bg-[#f9fafb] px-5 py-3 ${className || ''}`}
      data-testid="onboarding-rooftop-subscription"
    >
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4600f214] text-center text-[32px] font-semibold leading-[42.24px] text-black">
              {data?.enterpriseName?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold leading-6 text-[#000000cc]">
              {data?.enterpriseName}
            </p>
            {/* <div className="flex items-center gap-1">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-[10px] font-medium leading-4 text-[#00000066]">
                ENT ID: {data?.enterpriseId}
              </span>
              <button
                onClick={handleCopyId}
                className="flex shrink-0 cursor-pointer items-center justify-center gap-0.5"
                aria-label="Copy ID"
              >
                <MdContentCopy className="h-2.5 w-2.5 text-[#00000066]" />
                {isCopied && (
                  <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#027a48] transition-opacity duration-300">
                    <IoCheckmark className="h-2 w-2 text-white" />
                  </span>
                )}
              </button>
            </div> */}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          {relevantContract?.arr && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="shrink-0 text-sm font-medium leading-5 text-[#000000cc]">
                Subscription (Monthly):
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap rounded-2xl border border-[#3440541a] bg-[#f2f4f7] px-3 py-0.5 text-center text-xs font-medium leading-5 text-[#344054]">
                $ {relevantContract?.arr ?? '-'}
              </span>
            </div>
          )}

          {!!studioPlan.trim() && !isProductVini && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="shrink-0 text-sm font-medium leading-5 text-[#000000cc]">
                Plan:
              </span>
              <div className="min-w-0 overflow-hidden">
                <StudioAiBadge
                  plan={studioPlan.toLowerCase() === 'pro' ? 'PRO' : studioPlan}
                  showLabel={false}
                  badgeClassName="!rounded-2xl border border-[#3440541a] !px-3 !py-0.5 text-center !h-auto"
                  badgeTextClassName="text-xs font-medium leading-5 uppercase"
                  badgeIconClassName="text-xs"
                />
              </div>
            </div>
          )}

          {isProductVini && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="shrink-0 text-sm font-medium leading-5 text-[#000000cc]">
                Agents:
              </span>
              <div className="flex items-center gap-2">
                {agents.map((agent) => (
                  <span
                    key={agent}
                    className="overflow-hidden text-ellipsis whitespace-nowrap rounded-2xl border border-[#3440541a] bg-[#f2f4f7] px-3 py-0.5 text-center text-xs font-medium leading-5 text-[#344054]"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relevantContract?.contractStage && (
            <div className="flex w-full items-center justify-between gap-2">
              <span className="shrink-0 text-sm font-medium leading-5 text-[#000000cc]">
                Status:
              </span>
              <span className="shrink-0 rounded-2xl border border-[#027a481a] bg-[#ecfdf3] px-3 py-0.5 text-center text-xs font-medium leading-5 text-[#027a48]">
                {relevantContract?.contractStage ?? '-'}
              </span>
            </div>
          )}
        </div>
      </div>

      {relevantContract?.contractUrl && relevantContract?.contractedDate && (
        <div className="flex max-h-[calc(100%-208px)] w-full flex-1 flex-col gap-4 rounded-xl bg-white p-3 shadow-[0px_0px_4px_0px_#0000001a]">
          {relevantContract?.contractedDate && (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <span className="text-base font-bold leading-6 text-[#000000cc]">
                Contract Date:
              </span>
              <span className="shrink-0 rounded-2xl border border-[#363f721a] bg-[#f8f9fc] px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-[#363f72]">
                {formatContractDate(relevantContract?.contractedDate)}
              </span>
            </div>
          )}

          {/* {relevantContract?.summary && (
          <div className="flex min-h-0 w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium leading-5 text-[#000000cc]">
                Summary
              </span>
              <span
                className="shrink-0 bg-clip-text text-[10px] font-medium italic leading-[21px] text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(103.684deg, rgb(3, 125, 247) 5.3839%, rgb(255, 106, 255) 94.159%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI generated
              </span>
            </div>
            <p className="max-h-[calc(100%-30px)] flex-1 overflow-hidden text-ellipsis text-xs font-normal leading-5 text-[#00000080]">
              {relevantContract?.summary}
            </p>
          </div>
        )} */}

          {relevantContract?.contractUrl && (
            <button
              onClick={openPdf}
              className="cursor-pointer self-end text-xs font-medium leading-5 text-[#4600f2] transition-opacity hover:opacity-80"
            >
              View Contract →
            </button>
          )}
        </div>
      )}

      {isPdfModalOpen && (
        <OnboardingPdfViewer
          isOpen={isPdfModalOpen}
          onClose={handleClosePdfModal}
          pdfUrl={relevantContract?.contractUrl}
          title="Preview Contract"
          subtitle="Manage your group dealership details here"
          summaryTitle="Contract Summary"
          summaryText={relevantContract?.summary}
          showAiBadge={true}
          downloadButtonText="Download Contract"
          cancelButtonText="Cancel"
        />
      )}
    </div>
  );
};

export default OnboardingRooftopSubscription;
