import { useSelector } from '@spyne-console/store';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import Accordian from '@spyne-console/design-system/accordian';

import { ACCORDION_CONTENT, SUPPORT_CONTENT } from './supportConfig';

function SupportContainer() {
  const authReducer = useSelector((state) => state.authReducer);
  const [activeIcon, setActiveIcon] = useState(-1);
  const [heartWidth, setHeartWidth] = useState(15);
  const [paramsState, setParamsState] = useState({
    enterpriseId: '',
    teamId: '',
  });
  const videoRef = useRef();
  const URLparams = () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const enterpriseId = queryParams.get('enterprise_id');
      const teamId = queryParams.get('team_id');
      return { enterpriseId, teamId };
    } catch (error) {
      console.log(error);
    }
  };
  const handleHeart = () => {
    setHeartWidth(20);
    setTimeout(() => {
      setHeartWidth(15);
    }, 100);
  };
  useEffect(() => {
    // videoRef.current.play()
    const { enterpriseId, teamId } = URLparams();

    setParamsState({
      ...paramsState,
      enterpriseId: enterpriseId,
      teamId: teamId,
    });
  }, []);
  const customerSupportHandeler = () => {
    try {
      // Get the iframe element (adjust the selector based on your iframe's identification)
      const iframe = document.querySelector('iframe[id*="launcher"]'); // or whatever identifies your iframe

      if (iframe && iframe.contentDocument) {
        // Access the button inside iframe
        const launcherButton =
          iframe.contentDocument.querySelector('.launcher-button');
        if (launcherButton) {
          launcherButton.click();
        } else {
          console.log('Launcher button not found inside iframe');
        }
      } else {
        console.log('Iframe not found or cannot access content');
      }
    } catch (error) {
      console.error('Error accessing iframe content:', error);
    }
  };
  return (
    <div className="flex min-h-[85vh] flex-col justify-between gap-8 pb-10">
      <div>
        <div className="mb-10 flex justify-between">
          <div className="col-span-5 flex w-[280px] flex-col justify-between pl-8 pt-5">
            <div className="flex flex-col gap-2">
              <h3 className="text-blue_purple text-3xl font-bold leading-tight">
                {SUPPORT_CONTENT?.heading1}
                <span className="font-light"> & </span>
                {SUPPORT_CONTENT?.heading2}
              </h3>
              <p className="!text-blue_purple-80 text-sm font-medium">
                {SUPPORT_CONTENT?.subheading}
              </p>
            </div>
            <button
              onClick={customerSupportHandeler}
              className="secondary-btn mt-3 flex w-[250px] justify-center"
            >
              <Image
                src="https://spyne-static.s3.amazonaws.com/console/support_agent.svg"
                alt=""
                width="20"
                height="20"
                className="mr-2 inline align-middle"
              />
              Contact Us
            </button>
          </div>

          <div className="avatar-image col-span-7 my-auto pr-5 pt-5 text-right">
            {/* <video width="auto" height="216px" autoPlay muted loop className="ml-auto mr-0 h-[150px] object-contain" ref={videoRef}>
                            <source src={SUPPORT_CONTENT?.bannerImage} type="video/webm" />
                        </video> */}
            <Image
              src="https://spyne-static.s3.amazonaws.com/console/HelpAndSupportAvatar.svg"
              width={24}
              height={36}
              alt="avatar"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-black-60 px-8 text-2xl font-bold">
            {ACCORDION_CONTENT?.heading}
          </h2>
          <div className="bg-blue-2 gap-6 rounded-2xl p-8">
            <div className="flex flex-col justify-start gap-1">
              {ACCORDION_CONTENT?.content.map((accordion, index) => {
                return (
                  <Accordian
                    key={index}
                    title={accordion?.title}
                    content={accordion?.content}
                    activeIcon={activeIcon}
                    setActiveIcon={setActiveIcon}
                    idx={index}
                    classArrow={'opacity-60'}
                    class1="bg-white text-black rounded-lg"
                    class2="flex justify-between items-center px-4 py-3 w-full"
                    class3="text-black-60 text-base text-left font-semibold leading-6"
                    class4="p-4 pt-0 text-black-60 text-sm leading-5 font-normal"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 flex h-3 cursor-pointer justify-center">
        <div className="flex items-center">
          <span className="text-gray-dark_80 text-xs font-medium">
            made with{' '}
          </span>
          <div className="flex w-5 justify-center">
            <Image
              onClick={handleHeart}
              src="https://spyne-static.s3.amazonaws.com/console/help-support/withLoveImg.svg"
              alt="Heart icon"
              width={heartWidth}
              height={10}
              className="duration-100"
            />
          </div>
          <span className="text-gray-dark_80 text-xs font-medium">
            {' '}
            by{' '}
            {authReducer?.resellerData?.is_reseller
              ? authReducer?.resellerData?.name
              : 'spyne'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SupportContainer;
