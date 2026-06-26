import { useOnboardingContext } from '@/contexts/settings/onboarding-context';
import { SupportedLanguage } from '@/store-settings/models/persona.model';

import React, { useEffect, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IoClose, IoPlay } from 'react-icons/io5';
import { SlControlPause, SlControlPlay } from 'react-icons/sl';

import { getSafeStaticAssetUrl } from '@/utils-settings/image-util';

import { cn } from '@/lib/settings/utils';

interface PersonaAudioPlayerProps {
  id: string;
  supportedLanguages: SupportedLanguage[];
  className?: string;
  label?: string;
}

export const PersonaAudioPlayer: React.FC<PersonaAudioPlayerProps> = ({
  id,
  supportedLanguages,
  className = '',
  label = 'Play greeting',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>(
    'top'
  );
  const [currentPlayingLanguageId, setCurrentPlayingLanguageId] = useState<
    string | null
  >(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { playingAudioId, setPlayingAudioId } = useOnboardingContext();

  const isSingleLanguage = supportedLanguages.length === 1;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentPlayingLanguageId(null);
      setPlayingAudioId(null);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      handleStop();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const currentAudioId = currentPlayingLanguageId
      ? `${id}-${currentPlayingLanguageId}`
      : null;
    if (
      playingAudioId !== null &&
      playingAudioId !== currentAudioId &&
      isPlaying
    ) {
      handleStop();
    }
  }, [playingAudioId, id, isPlaying, currentPlayingLanguageId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = supportedLanguages.length * 64;
      const spaceAbove = buttonRect.top;
      const spaceBelow = window.innerHeight - buttonRect.bottom;

      if (spaceAbove >= dropdownHeight || spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [showDropdown, supportedLanguages.length]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentPlayingLanguageId(null);
      setPlayingAudioId(null);
      setShowDropdown(false);
    }
  };

  const handleLanguagePlay = (
    language: SupportedLanguage,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    if (audioRef.current) {
      audioRef.current.src = getSafeStaticAssetUrl(language.sampleAudioUrl);
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentPlayingLanguageId(language.languageId);
      setPlayingAudioId(`${id}-${language.languageId}`);
    }
  };

  const handleLanguagePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleStop();
  };

  const handleClick = () => {
    if (!isPlaying) {
      if (isSingleLanguage) {
        const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
        handleLanguagePlay(supportedLanguages[0], mockEvent);
      } else {
        setShowDropdown(!showDropdown);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        ref={buttonRef}
        className={cn(
          'flex h-[46px] min-w-[150px] items-center rounded-full border bg-white shadow-[2px_4px_4px_0px_rgba(17,17,17,0.04)]',
          !isPlaying
            ? 'cursor-pointer justify-center gap-3 border-[#ddd] px-4 py-0.5 transition-all hover:border-[#111] hover:shadow-sm'
            : 'justify-between gap-4 border-[#ececec] px-4 py-[5.5px] pr-1',
          className
        )}
        onClick={!isPlaying ? handleClick : undefined}
      >
        {!isPlaying ? (
          <>
            <IoPlay className="h-5 w-5 text-[#111]" />
            <p className="text-nowrap text-base font-semibold leading-[22px] text-[#111]">
              {label}
            </p>
          </>
        ) : (
          <>
            <p className="text-nowrap text-base font-medium leading-5 text-[#111]">
              {formatTime(currentTime)}
            </p>
            <button
              onClick={handleStop}
              className="flex shrink-0 items-center justify-center rounded-full border border-[#c51919] bg-[#FF4343] p-[5.5px] shadow-[1.368px_1.368px_1.368px_0px_rgba(17,17,17,0.04)] transition-all hover:opacity-80"
              aria-label="Stop audio"
            >
              <IoClose className="h-5 w-5 text-white" />
            </button>
          </>
        )}
      </div>

      {showDropdown && (
        <div
          className={cn(
            'absolute left-1/2 z-50 w-max min-w-[200px] -translate-x-1/2 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg',
            dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {supportedLanguages.map((language) => {
            const isCurrentlyPlaying =
              currentPlayingLanguageId === language.languageId && isPlaying;

            return (
              <div
                key={language.languageId}
                className="flex w-full items-center justify-between border-b border-black/10 p-4 transition-colors last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-center gap-6">
                  <ReactCountryFlag
                    countryCode={language.countryCode}
                    svg
                    className="h-[22px] w-[32px] rounded"
                    style={{ fontSize: '22px' }}
                  />
                  <span className="whitespace-nowrap text-base font-medium text-black/80">
                    {language.languageName}
                  </span>
                </div>
                <button
                  onClick={(e) =>
                    isCurrentlyPlaying
                      ? handleLanguagePause(e)
                      : handleLanguagePlay(language, e)
                  }
                  className="flex h-5 w-5 items-center justify-center transition-opacity hover:opacity-70"
                  aria-label={
                    isCurrentlyPlaying
                      ? `Pause ${language.languageName}`
                      : `Play ${language.languageName}`
                  }
                >
                  {isCurrentlyPlaying ? (
                    <SlControlPause className="h-5 w-5 text-[#111]" />
                  ) : (
                    <SlControlPlay className="h-5 w-5 text-[#111]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};
