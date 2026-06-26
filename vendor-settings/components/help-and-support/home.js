import { sendEventToApp } from '@spyne-console/utils';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Fuse from 'fuse.js';

import { ACCORDION_CONTENT } from '../header/supportConfig';
import SVG from '../svg/SVG';
import { GUIDE_CONTENT } from './constants';

const Home = ({ isOpen, onClose, setModalType, setFrom, isIframe = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  const fuseOptions = {
    keys: ['title'],
    threshold: 0.4,
  };

  const fuse = new Fuse(ACCORDION_CONTENT.content, fuseOptions);
  const filteredContent =
    searchTerm.trim() === ''
      ? ACCORDION_CONTENT.content
      : fuse.search(searchTerm).map((result) => result.item);

  const toggleItem = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

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

  if (!isOpen) return null;

  return (
    <div className={`pb-4 ${isIframe ? 'flex h-full flex-col' : ''}`}>
      <SVG
        iconName="crossIcon"
        className="absolute right-6 top-[28px] cursor-pointer text-white"
        onClick={onClose}
      />
      <div className="absolute left-5 top-4 flex flex-col gap-7">
        <SVG iconName="spyne" className="text-white" />
        <div className="flex flex-col gap-0">
          <div className="text-2xl font-semibold leading-[34px] text-white">
            Hey there,
          </div>
          <div className="text-2xl font-semibold leading-[34px] text-white">
            How can we help?
          </div>
        </div>
      </div>
      <Image
        src={
          'https://spyne-static.s3.us-east-1.amazonaws.com/Group+1000001849.png'
        }
        width={400}
        height={100}
        alt="help"
        priority={true}
        className="w-full"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      <div
        className={`flex ${isIframe ? 'min-h-0 flex-1 overflow-y-auto' : 'h-[48.5vh] overflow-y-auto'} flex-col gap-3 px-4`}
      >
        <button
          className="flex justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm backdrop-blur-[18px] hover:border-b hover:border-black/20"
          onClick={() => {
            setModalType('sendMessage');
            setFrom('home');
          }}
        >
          <span className="text-sm font-normal leading-tight text-black/80">
            Send us a message
          </span>
          <SVG iconName="chevron" rotate={270} />
        </button>
        <div
          className={`flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm backdrop-blur-[18px] ${isIframe ? 'flex-shrink-0' : ''}`}
        >
          <div className="flex justify-between">
            <span className="text-sm font-normal leading-tight text-black/80">
              Guide
            </span>
            <button
              className="border-none bg-white text-sm font-normal leading-tight text-black/80"
              onClick={() => {
                setModalType('guide');
              }}
            >
              View all
            </button>
          </div>
          <div className="scrollbar-hide flex max-w-full items-center gap-3 overflow-x-auto">
            {GUIDE_CONTENT.map((item, index) => (
              <div
                key={index}
                className="flex min-w-[190px] flex-col items-start gap-2 rounded-xl border-[1px] border-[#E5E5E5] bg-white px-1 pb-2 pt-1"
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
                    width={185}
                    height={76}
                    className="!h-[68px] !w-full cursor-pointer rounded-xl"
                    priority={true}
                    loading="eager"
                  />
                </Link>
                <div className="flex flex-col gap-2 px-3">
                  <span className="whitespace-nowrap text-sm font-normal leading-tight text-black/80">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className={`mb-[80px] flex flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm backdrop-blur-[18px]`}
        >
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search for help"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-[#F9F9F9] py-2 pl-4 pr-10 text-sm"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <SVG iconName="searchIcon" className="h-3 w-3 text-black" />
            </div>
          </div>
          {filteredContent.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => toggleItem(index)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-black/60 hover:bg-[#F7F7F7] ${
                  expandedItem === index
                    ? 'rounded-t-lg bg-[#F7F7F7]'
                    : 'rounded-lg'
                }`}
              >
                <span
                  className={`flex-1 pr-2 text-sm font-normal ${
                    expandedItem === index ? 'text-black/80' : 'text-black/60'
                  }`}
                >
                  {item.title}
                </span>
                <SVG
                  iconName="chevron"
                  rotate={expandedItem === index ? 180 : 0}
                />
              </button>
              {expandedItem === index && (
                <div className="mb-1 rounded-b-lg bg-[#F7F7F7] px-4 py-2">
                  <p className="text-sm leading-relaxed text-black/60">
                    {item.content}
                  </p>
                </div>
              )}
            </div>
          ))}
          {filteredContent.length === 0 && (
            <div className="flex items-center justify-center pt-1">
              <span className="text-sm font-normal italic leading-tight text-black/60">
                No results found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
