import { animated } from '@react-spring/web';
import { useSelector } from '@spyne-console/store';

import { useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

import Image from 'next/image';

import useClickOutside from '@spyne-console/hooks/useClickOutside';
import useQueryParams from '@spyne-console/hooks/useQueryParams';

import { cn } from '@spyne-console/utils/cn';
import { formatNumber } from '@spyne-console/utils/config';

// import { capture_plan_info_clicked } from '../utils';
import {
  isGoldProduct,
  isPaidProduct,
  noTotalCredits,
  showCreditsJSX,
  showGlobalUpgrade,
  showOverallUpgrade,
} from './config';

export default function HeaderCredits({ setOpenUpgradeModal }) {
  const { setQueryParams } = useQueryParams();
  const credits = useSelector((state) => state.credit);
  const creditsDropdownRef = useRef(null);
  const [creditsDropdown, setCreditsDropdown] = useState(false);

  const {
    currentSelectedToggle,
    inventoryDetails,
    outputProcessingList,
    showDeductCreditAnimation,
    hideCreditButtonTemporary,
  } = useSelector((state) => state.imageStudioReducer);

  useClickOutside(creditsDropdownRef, () => setCreditsDropdown(false));

  const openPricingModal = (item) => {
    setOpenUpgradeModal(true);
    setCreditsDropdown(false);
    setQueryParams({ upgradecard: true });
  };

  const closeCreditDropDown = (e) => {
    e.stopPropagation();
    // capture_plan_info_clicked(
    //   inventoryDetails?.dealerVinId,
    //   inventoryDetails?.mediaId
    // );
    setCreditsDropdown(!creditsDropdown);
  };

  const freeCreditsInfo = [
    {
      product: 'Images',
      title: 'Vehicles Left',
      icon: 'https://spyne-prod-video.s3.amazonaws.com/static/website/2024-08-20/gallery.svg',
      value: credits?.credits_v5?.credit_data?.images?.credits ?? 0,
      key: 'images',
    },
    {
      product: '360 spin',
      title: 'Vehicles Left',
      icon: 'https://spyne-prod-video.s3.amazonaws.com/static/website/2024-08-20/360.svg',
      value: credits?.credits_v5?.credit_data?.['360']?.credits ?? 0,
      key: '360',
    },
    {
      product: 'Video tour',
      title: 'Vehicles Left',
      icon: 'https://spyne-prod-video.s3.amazonaws.com/static/website/2024-08-20/video.svg',
      value: credits?.credits_v5?.credit_data?.video?.credits ?? 0,
      key: 'video',
    },
  ];

  const renderTrialPlanButton = () => (
    <button className="relative flex w-fit flex-row items-center justify-center gap-2 rounded-full px-1 py-2 text-sm font-bold leading-6 text-white">
      <span className="text-[10px] font-medium leading-[12px] text-white lg:text-xs lg:leading-6">
        {noTotalCredits(credits?.credits_v5)
          ? 'Free Vehicles Exhausted'
          : 'Trial Plan'}
      </span>
      <span>
        <MdKeyboardArrowDown
          className={cn(
            'h-6 w-6 text-white transition-transform duration-300',
            creditsDropdown ? 'rotate-180' : 'rotate-0'
          )}
        />
      </span>
    </button>
  );

  const renderCreditsDropdownContent = () => (
    <div className="border-black-10 absolute right-0 top-14 z-[2300] min-w-[22.5rem] max-w-[24rem] rounded-lg border bg-white shadow-lg">
      {showGlobalUpgrade(credits?.credits_v5) && (
        <div className="flex flex-col gap-4 rounded-t-lg bg-gray-100 p-[20px] px-4">
          <div className={`flex justify-between py-[11px]`}>
            <img
              src="https://spyne-static.s3.us-east-1.amazonaws.com/console/combined-vs/commonlogo.svg"
              alt="virtual studio logo"
              loading="lazy"
              height={24}
              width={24}
              className="h-auto w-[10rem]"
            />
          </div>
          <button
            className="bg-blue-light inline-flex h-[36px] w-[150px] items-center justify-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold leading-6 text-white"
            onClick={openPricingModal}
          >
            Upgrade
          </button>
        </div>
      )}

      <div className="p-[12px]">
        {freeCreditsInfo?.map((item, idx) => (
          <div
            className="border-black-10 flex items-start justify-between gap-2 border-b-[0.6px] px-4 py-2"
            key={`${item?.product}`}
          >
            <div className="flex items-center justify-between gap-3 align-middle">
              <div>
                <p className="text-black-80 flex items-center justify-center gap-2 text-sm font-medium">
                  <Image
                    src={item.icon}
                    alt={item.product}
                    width={15}
                    height={15}
                  />
                  <span className="text-black-80 text-sm font-medium">
                    {item?.product}
                  </span>
                  <span className="text-gray-40 font-extralight">|</span>
                  {showCreditsJSX(credits?.credits_v5, item?.key)}
                </p>
                {console.log(
                  item?.key,
                  isGoldProduct(credits?.credits_v5, item?.key),
                  isPaidProduct(credits?.credits_v5, item?.key)
                )}
                {!isPaidProduct(credits?.credits_v5, item?.key) && (
                  <p className="text-black-40 mt-3 text-sm font-medium">
                    {item?.title}:&nbsp;
                    <strong>{formatNumber(item?.value)}</strong>
                  </p>
                )}
              </div>
            </div>
            {!isGoldProduct(credits?.credits_v5, item?.key) && (
              <div
                className="text-blue-light cursor-pointer text-xs"
                onClick={openPricingModal}
              >
                Upgrade plan
              </div>
            )}
          </div>
        ))}
        {showGlobalUpgrade(credits?.credits_v5) && (
          <button
            onClick={() =>
              window.open('https://www.spyne.ai/pricing', '_blank')
            }
            className="text-blue-light mt-2 px-4 py-2 text-xs font-semibold"
          >
            View Pricing
          </button>
        )}
      </div>
    </div>
  );

  const creditDeductionCount = () => {
    let count = 0;
    if (
      currentSelectedToggle.toggleImage &&
      credits?.credits_v5?.credit_data?.images?.subscription_type === 'free' &&
      credits?.credits_v5?.credit_data?.images?.credits > 0 &&
      !outputProcessingList?.catalog
    )
      count++;
    if (
      currentSelectedToggle.toggle360 &&
      credits?.credits_v5?.credit_data?.['360']?.subscription_type === 'free' &&
      credits?.credits_v5?.credit_data?.['360']?.credits > 0 &&
      !outputProcessingList?.spin
    )
      count++;
    if (
      currentSelectedToggle.toggleVideo &&
      credits?.credits_v5?.credit_data?.video?.subscription_type === 'free' &&
      credits?.credits_v5?.credit_data?.video?.credits > 0 &&
      !outputProcessingList?.featureVideo
    )
      count++;
    if (count > 0) {
      return `-${count}`;
    }
    return null;
  };

  const isAllPaid = () => {
    return (
      credits?.credits_v5?.credit_data?.images?.subscription_type === 'paid' &&
      credits?.credits_v5?.credit_data?.video?.subscription_type === 'paid' &&
      credits?.credits_v5?.credit_data?.['360']?.subscription_type === 'paid'
    );
  };

  return (
    <div className="relative flex flex-row items-center">
      {showGlobalUpgrade(credits?.credits_v5) && (
        <div
          className={`mr-3 flex h-[38px] items-center rounded-[8px] md:mr-0 ${noTotalCredits(credits?.credits_v5) ? 'bg-[#B42318]' : 'bg-[linear-gradient(94.71deg,_#0070E1_5.38%,_#FF19FF_94.16%)]'}`}
        >
          <div className="hidden flex-row items-center pl-1 md:flex lg:pl-3">
            {noTotalCredits(credits?.credits_v5) && (
              <Image
                src="https://spyne-static.s3.us-east-1.amazonaws.com/console/coin_pic_vehicles_CVS.svg"
                height={22}
                width={22}
              />
            )}
            {hideCreditButtonTemporary && (
              <button
                className="relative flex w-fit flex-row items-center justify-center gap-1 rounded-full px-1 py-2 text-sm font-bold leading-6 text-white"
                onClick={closeCreditDropDown}
              >
                {renderTrialPlanButton()}
              </button>
            )}

            {!isAllPaid() && creditDeductionCount() && (
              <animated.span
                style={
                  showDeductCreditAnimation
                    ? {
                        opacity: 1,
                        transform: 'translateY(40px)',
                        transition: 'all 0.3s ease-out',
                      }
                    : {
                        opacity: 0,
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease-in',
                      }
                }
                className="text-orange-red bg-red-lightest absolute left-0 top-0 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white !text-sm"
              >
                {creditDeductionCount()}
              </animated.span>
            )}
          </div>

          {showGlobalUpgrade(credits?.credits_v5) && (
            <>
              <span className="text-xs font-semibold text-white">|</span>
              <button
                className="inline-flex w-fit items-center justify-center gap-3 rounded-full px-3 py-2 text-xs font-semibold leading-6 text-white"
                onClick={openPricingModal}
              >
                Upgrade
              </button>
            </>
          )}
        </div>
      )}

      <div className="relative" ref={creditsDropdownRef}>
        {!showGlobalUpgrade(credits?.credits_v5) && (
          <div
            className="relative flex flex-row items-center"
            onClick={closeCreditDropDown}
          >
            {showOverallUpgrade(
              credits?.credits_v5,
              creditsDropdown,
              setCreditsDropdown
            )}
            {!isAllPaid() && creditDeductionCount() && (
              <animated.span
                style={
                  showDeductCreditAnimation
                    ? {
                        opacity: 1,
                        transform: 'translateY(40px)',
                        transition: 'all 0.3s ease-out',
                      }
                    : {
                        opacity: 0,
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease-in',
                      }
                }
                className="text-orange-red bg-red-lightest absolute left-0 top-0 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white !text-sm"
              >
                {creditDeductionCount()}
              </animated.span>
            )}
          </div>
        )}

        {creditsDropdown && renderCreditsDropdownContent()}
      </div>
    </div>
  );
}
