import React, { useState } from 'react';
import ThreeSixtyViewer from './ThreeSixtyViewer';
import VideoPlayerNonLoggedInDemo from './VideoPlayerNonLoggedInDemo';
import ImageBeforeAfterSlider from './ImageBeforeAfterSlider';
import { getDemoItemsConfig, TAB_ENUM } from './config';
import Skeleton from '@/components/common/skeleton&spinner/Skeleton';
import { COMMON_NON_LOGGED_IN_DEMO_PAGES } from '@spyne-console/common-config/home';
import { useTranslation } from 'react-i18next';
import { updateAuthProp } from '@spyne-console/store'
import { useScreenWidth } from '@/hook/useScreenWidth';
import { useDispatch } from '@spyne-console/store';

const InteractiveDemoItems = ({
  type,
  data,
  handleRedirectTo,
  hovered,
  handleMouseEnter,
  handleMouseLeave
}) => {
  const { t: translate } = useTranslation();
  return (
    <div
      className={`flex flex-row sm:flex-col gap-3 rounded-lg border-[1.13px] p-2 sm:p-0 ${hovered ? 'bg-blue-6 scale-105' : ''} transition-all duration-300 ease-in-out`}
    >
      <div className="w-[50%] sm:w-full">
        {type === TAB_ENUM.images && (
          <ImageBeforeAfterSlider
            beforeImg={data.beforeImg}
            afterImg={data.afterImg}
          />
        )}
        {type === TAB_ENUM.demo360 && (
          <ThreeSixtyViewer interval={100} imageUrls={data.imageUrls} />
        )}
        {type === TAB_ENUM.video && (
          <VideoPlayerNonLoggedInDemo src={data.videoSrc} />
        )}
      </div>
      <div
        onClick={() => handleRedirectTo(data.redirectTo)}
        onMouseEnter={() => handleMouseEnter(type)}
        onMouseLeave={() => handleMouseLeave(type)}
        className="w-[50%] cursor-pointer sm:w-full flex flex-col gap-2 justify-items-end px-4 sm:pb-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <img
              src={data.icon}
              alt={type}
              height={20}
              width={20}
            />
            <p className="text-sm md:text-base text-black-80 font-semibold whitespace-nowrap truncate">
              {translate(data.itemName)}
            </p>
          </div>
          {/* {hovered && (
            <img
              src={COMMON_NON_LOGGED_IN_DEMO_PAGES.FORWARD_ICON}
              alt="forward"
              height={15}
              width={15}
            />
          )} */}
        </div>
        <p className="text-xs md:text-sm text-black-60 h-10 md:h-16 ltb:h-10 font-medium text-start self-start">
          {translate(data.itemDescription)}
        </p>
        <div className={` flex  h-10 w-full items-center justify-center gap-8 rounded-lg p-3 ${hovered ? "bg-blue-light" : "bg-[#4600F214] " }`} >
          <p className={`text-sm font-semibold leading-6 ${hovered ? "text-white": "text-blue-light"}`}>{translate(data.buttonDescription)}</p>
        </div>
      </div>
    </div>
  );
};


const GuestInteractiveDemo = ({ demoData, handleRedirectTo }) => {
  const dispatch = useDispatch()
  const [hovered, setHovered] = useState({ image: false, video: false, th60: false });
  
  const screenWidth = useScreenWidth()

  const handleMouseEnter = (type) => {
    setHovered((prev) => ({ ...prev, [type]: true }));
  };

  const handleMouseLeave = (type) => {
    setHovered((prev) => ({ ...prev, [type]: false }));
  };

  const demoItemsConfig = getDemoItemsConfig(demoData);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full md:w-[80%]">
        {Object.keys(demoData?.[TAB_ENUM.images])?.length ? (
          <div className={`w-full grid grid-cols-1 ${screenWidth > 960 ? "sm:grid-cols-3" : "sm:grid-cols-2"}  gap-2 md:gap-8`}>
            {demoItemsConfig.map((item) => {
              if ((screenWidth < 960) && item.type === TAB_ENUM.demo360) {
                return null;
              }
              return (
                <InteractiveDemoItems
                  key={item.type}
                  type={item.type}
                  data={item.data}
                  hovered={hovered[item.hoveredKey]}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  handleRedirectTo={handleRedirectTo}
                />
              );
            })}


          </div>
        ) : null}

        {!Object.keys(demoData?.[TAB_ENUM.images])?.length && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="relative h-[140px] md:h-[210px]">
                <Skeleton classSTYLE="rounded-lg" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestInteractiveDemo;
