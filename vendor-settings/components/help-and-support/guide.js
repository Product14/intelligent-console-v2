import { sendEventToApp } from '@spyne-console/utils';

import Image from 'next/image';
import Link from 'next/link';

import SVG from '../svg/SVG';
import { GUIDE_CONTENT } from './constants';

const Guide = ({ isOpen, onClose, isIframe = false }) => {
  if (!isOpen) return null;

  const handleGuideContentClick = (contentUrl, title) => {
    // Determine if it's a video or PDF based on URL extension
    const isVideo = contentUrl.toLowerCase().includes('.mp4');
    const isPdf = contentUrl.toLowerCase().includes('.pdf');

    if (isVideo) {
      // Send event to mobile app (Android/iOS) for video
      const messageData = {
        type: 'OPEN_GUIDE_VIDEO',
        data: {
          title: title,
          url: contentUrl,
        },
      };
      sendEventToApp(messageData);
    } else if (isPdf) {
      // Send event to mobile app (Android/iOS) for PDF
      const messageData = {
        type: 'OPEN_GUIDE_PDF',
        data: {
          title: title,
          url: contentUrl,
        },
      };
      sendEventToApp(messageData);
    }
  };

  return (
    <div className={`${isIframe ? 'flex h-full flex-col pb-20' : ''}`}>
      <div className="flex items-center justify-between border-b p-5">
        <span className="text-xl font-semibold leading-7 text-black/80">
          Guide
        </span>
        <SVG
          iconName="crossIcon"
          className="cursor-pointer"
          onClick={onClose}
        />
      </div>
      <div
        className={`relative flex ${isIframe ? 'min-h-0 flex-1' : 'min-h-[66vh]'} flex-col`}
      >
        <div
          id="scrollableDiv"
          className={`flex ${isIframe ? 'min-h-0 flex-1' : 'max-h-[440px]'} flex-col gap-4 overflow-y-auto px-5 pb-3 pt-6`}
        >
          {GUIDE_CONTENT.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border-[1px] border-[#E5E5E5] bg-white px-1 pb-3 pt-1 shadow-sm"
            >
              <Link
                href={item.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  handleGuideContentClick(item.contentUrl, item.title)
                }
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={320}
                  height={128}
                  className="!w-full cursor-pointer rounded-lg"
                  priority={true}
                  loading="eager"
                />
              </Link>

              <div className="flex flex-col gap-2 px-3">
                <span className="text-base font-medium leading-tight text-black/80">
                  {item.title}
                </span>
                <span className="text-sm font-normal leading-tight text-black/60">
                  {item.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guide;
