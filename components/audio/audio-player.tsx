import WavesurferPlayer, { useWavesurfer } from '@wavesurfer/react';

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { IoMdPause, IoMdPlay } from 'react-icons/io';
import { MdVolumeDownAlt, MdVolumeOff, MdVolumeUp } from 'react-icons/md';
import { RiForward5Line, RiReplay5Line } from 'react-icons/ri';

interface AudioPlayerProps {
  audioUrl: string;
  showWaveform?: boolean;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export interface AudioPlayerRef {
  seek: (time: number) => void;
  play: () => void;
}

const formatTime = (time: number) => {
  if (!time || isNaN(time) || !isFinite(time) || time < 0) {
    return '0:00';
  }

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const AudioPlayerButton = ({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 p-2 transition-colors"
      onClick={onClick}
    >
      {icon}
    </div>
  );
};

const AudioPlayer = React.forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ audioUrl, showWaveform = false, onTimeUpdate, onPlay, onPause }, ref) => {
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const wavesurferContainerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [wavesurferDuration, setWavesurferDuration] = useState(0);
    const progressRef = useRef<HTMLDivElement>(null);

    const {
      wavesurfer,
      isPlaying: wavesurferIsPlaying,
      currentTime: wavesurferCurrentTime,
    } = useWavesurfer({
      container: wavesurferContainerRef,
      url: audioUrl,
      waveColor: '#e5e5e5',
      progressColor: '#666666',
      cursorColor: '#4600F2',
      height: 84,
      barHeight: 2,
      barWidth: 2,
      barGap: 1.5,
      barRadius: 5,
      fillParent: true,
    });

    // Track playing state and notify parent
    const isPlaying = showWaveform
      ? wavesurferIsPlaying
      : audioPlayerRef.current && !audioPlayerRef.current.paused;

    useEffect(() => {
      if (isPlaying) {
        onPlay?.();
      } else {
        onPause?.();
      }
    }, [isPlaying]);

    useEffect(() => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.volume = volume / 100;
      }
    }, [volume]);

    useEffect(() => {
      if (!audioUrl) return;
      if (showWaveform) return;
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      const handleMetadata = () => {
        setDuration(audio.duration);
      };

      const handleTimeUpdate = () => {
        setProgress(audio.currentTime);
      };

      audio.addEventListener('loadedmetadata', handleMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('loadedmetadata', handleMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);

        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
        }
      };
    }, [audioUrl, showWaveform]);

    useEffect(() => {
      if (showWaveform && wavesurfer) {
        const getDuration = async () => {
          try {
            const duration = wavesurfer.getDuration();
            setWavesurferDuration(duration);
          } catch (error) {
            console.error('Error getting wavesurfer duration:', error);
          }
        };

        getDuration();

        const handleReady = () => {
          getDuration();
        };

        wavesurfer.on('ready', handleReady);

        return () => {
          wavesurfer.un('ready', handleReady);
        };
      }
    }, [showWaveform, wavesurfer]);

    useEffect(() => {
      onTimeUpdate?.(
        showWaveform ? wavesurferCurrentTime : progress
      );
    }, [showWaveform, wavesurferCurrentTime, progress]);

    // Listen for seek events from transcript clicks
    useEffect(() => {
      const handleSeekEvent = (event: CustomEvent) => {
        const { time } = event.detail;
        handleSeek(time);
      };

      window.addEventListener('seekAudioToTime', handleSeekEvent as EventListener);
      
      return () => {
        window.removeEventListener('seekAudioToTime', handleSeekEvent as EventListener);
      };
    }, []);

    // Listen for play/pause toggle events
    useEffect(() => {
      const handleToggleEvent = () => {
        console.log('Audio player received toggleAudioPlayPause event')
        if (showWaveform) {
          console.log('Toggling wavesurfer play/pause')
          wavesurfer?.playPause();
        } else {
          console.log('Toggling HTML audio play/pause')
          if (!audioPlayerRef.current) return;
          if (audioPlayerRef.current.paused) {
            audioPlayerRef.current.play();
          } else {
            audioPlayerRef.current.pause();
          }
        }
      };

      window.addEventListener('toggleAudioPlayPause', handleToggleEvent);
      
      return () => {
        window.removeEventListener('toggleAudioPlayPause', handleToggleEvent);
      };
    }, [showWaveform, wavesurfer]);

    // Listen for ensure audio playing events (after seek)
    useEffect(() => {
      const handleEnsurePlayingEvent = () => {
        console.log('Audio player received ensureAudioPlaying event')
        if (showWaveform) {
          // For wavesurfer, ensure it's playing
          if (!wavesurferIsPlaying) {
            wavesurfer?.play();
          }
        } else {
          // For HTML audio, ensure it's playing
          if (audioPlayerRef.current && audioPlayerRef.current.paused) {
            audioPlayerRef.current.play();
          }
        }
      };

      window.addEventListener('ensureAudioPlaying', handleEnsurePlayingEvent);
      
      return () => {
        window.removeEventListener('ensureAudioPlaying', handleEnsurePlayingEvent);
      };
    }, [showWaveform, wavesurfer, wavesurferIsPlaying]);

    const handleSeek = (time: number) => {
      if (showWaveform) {
        wavesurfer?.setTime(time);
        return;
      }
      if (audioPlayerRef.current && time >= 0 && time <= duration) {
        audioPlayerRef.current.currentTime = time;
      }
    };

    useImperativeHandle(ref, () => ({
      seek(time: number) {
        handleSeek(time);
      },
      play() {
        togglePlayPause();
      },
    }));

    const pause = () => {
      if (showWaveform) {
        wavesurfer?.pause();
        return;
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };

    const stop = () => {
      if (showWaveform) {
        wavesurfer?.stop();
        return;
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !audioPlayerRef.current || duration === 0)
        return;

      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickPercentage = clickX / width;
      const seekTime = clickPercentage * duration;

      handleSeek(seekTime);
    };

    const togglePlayPause = () => {
      if (showWaveform) {
        wavesurfer?.playPause();
        return;
      }
      if (!audioPlayerRef.current) return;
      if (audioPlayerRef.current.paused) {
        audioPlayerRef.current.play();
        return;
      }
      audioPlayerRef.current.pause();
    };

    const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

    return (
      <div className="flex w-full items-center gap-3 px-[14px] py-3">
        <div className="flex items-center gap-3">
          <AudioPlayerButton
            icon={<RiReplay5Line className="text-black-80 h-4 w-4" />}
            onClick={() =>
              handleSeek(
                showWaveform
                  ? wavesurferCurrentTime - 5
                  : (audioPlayerRef?.current?.currentTime || 0) - 5
              )
            }
          />
          <div
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-[#4600F2] relative"
            onClick={togglePlayPause}
          >
            {(showWaveform && wavesurferIsPlaying) ||
            (!showWaveform &&
              audioPlayerRef.current &&
              !audioPlayerRef.current.paused) ? (
              <IoMdPause className="h-5 w-5 text-white absolute inset-0 m-auto" />
            ) : (
              <IoMdPlay className="h-5 w-5 text-white absolute inset-0 m-auto" />
            )}
          </div>
          <AudioPlayerButton
            icon={<RiForward5Line className="text-black-80 h-4 w-4" />}
            onClick={() =>
              handleSeek(
                showWaveform
                  ? wavesurferCurrentTime + 5
                  : (audioPlayerRef?.current?.currentTime || 0) + 5
              )
            }
          />
        </div>
        <div className="text-sm font-normal tabular-nums text-gray-700">
          <span>
            {formatTime(showWaveform ? wavesurferCurrentTime : progress)}
          </span>{' '}
          /{' '}
          <span>
            {formatTime(showWaveform ? wavesurferDuration : duration)}
          </span>
        </div>
        {showWaveform ? (
          <div ref={wavesurferContainerRef} className="flex-1 bg-gray-50 rounded-lg p-2 h-16"></div>
        ) : (
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-1 flex-1 cursor-pointer overflow-hidden rounded-[200px] bg-black/10"
          >
            <div
              className="transition-width absolute left-0 top-0 h-full rounded-[200px] bg-[#4600F2] duration-100"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}
        {!showWaveform && (
          <button
            className="relative flex cursor-pointer items-center justify-center"
            onClick={() => {
              if (showWaveform) {
                wavesurfer?.setVolume(volume === 0 ? 1 : 0);
                return;
              }
              setVolume(volume === 0 ? 100 : 0);
            }}
          >
            {volume === 0 ? (
              <MdVolumeOff className="h-[22px] w-[22px]" />
            ) : (
              <MdVolumeUp className="h-[22px] w-[22px]" />
            )}
          </button>
        )}
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;