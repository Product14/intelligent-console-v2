import WavesurferPlayer, { useWavesurfer } from '@wavesurfer/react';

import React, { useEffect, useImperativeHandle, useRef, useState, useMemo, useCallback } from 'react';
import { IoMdPause, IoMdPlay } from 'react-icons/io';
import { MdVolumeDownAlt, MdVolumeOff, MdVolumeUp } from 'react-icons/md';
import { RiForward5Line, RiReplay5Line } from 'react-icons/ri';

// Global audio state store to persist across component re-renders
class AudioStateStore {
  private state = {
    currentTime: 0,
    isPlaying: false,
    volume: 1,
    audioUrl: '',
    lastRestoreTime: 0,
  };

  setState(newState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...newState };

  }

  getState() {
    return { ...this.state };
  }

  shouldRestore(audioUrl: string) {
    const now = Date.now();
    const timeSinceLastRestore = now - this.state.lastRestoreTime;
    const shouldRestore = this.state.audioUrl === audioUrl && 
                         this.state.currentTime > 0 && 
                         timeSinceLastRestore > 500; // Prevent rapid restoration attempts
    
    if (shouldRestore) {
      this.state.lastRestoreTime = now;
    }
    
    return shouldRestore;
  }

  markRestored() {
    this.state.lastRestoreTime = Date.now();
  }
}

const audioStateStore = new AudioStateStore();

interface AudioPlayerProps {
  audioUrl: string;
  showWaveform?: boolean;
  duration: number; // Duration in seconds (required)
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
  ({ audioUrl, showWaveform = false, duration, onTimeUpdate, onPlay, onPause }, ref) => {
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const wavesurferContainerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(100);
    const progressRef = useRef<HTMLDivElement>(null);
    
    // Initialize audio URL in the store
    useEffect(() => {
      audioStateStore.setState({ audioUrl });
    }, [audioUrl]);

    // Memoize wavesurfer options to prevent unnecessary re-creations
    const wavesurferOptions = useMemo(() => ({
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
    }), [audioUrl]); // Only recreate when audioUrl changes

    const {
      wavesurfer,
      isPlaying: wavesurferIsPlaying,
      currentTime: wavesurferCurrentTime,
    } = useWavesurfer(wavesurferOptions);

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
        // Restore state for HTML audio
        if (audioStateStore.shouldRestore(audioUrl)) {
          const { currentTime, isPlaying } = audioStateStore.getState();

          audio.currentTime = currentTime;
          if (isPlaying) {

            audio.play();
          }
          audioStateStore.markRestored();
        }
      };

      const handleTimeUpdate = () => {
        setProgress(audio.currentTime);
      };

      audio.addEventListener('loadedmetadata', handleMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('loadedmetadata', handleMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);

        // Just pause the audio, state is continuously saved in the effect above
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
      };
    }, [audioUrl, showWaveform]);


    // Continuously save current audio state to global store
    useEffect(() => {
      if (showWaveform && wavesurfer) {
        audioStateStore.setState({
          currentTime: wavesurferCurrentTime,
          isPlaying: wavesurferIsPlaying,
          volume: volume / 100,
        });
      } else if (!showWaveform && audioPlayerRef.current) {
        audioStateStore.setState({
          currentTime: progress,
          isPlaying: !audioPlayerRef.current.paused,
          volume: volume / 100,
        });
      }
    }, [showWaveform, wavesurferCurrentTime, wavesurferIsPlaying, progress, volume]);

    useEffect(() => {
      onTimeUpdate?.(
        showWaveform ? wavesurferCurrentTime : progress
      );
    }, [showWaveform, wavesurferCurrentTime, progress]);

    // Restore state when wavesurfer is ready
    useEffect(() => {
      if (showWaveform && wavesurfer && audioStateStore.shouldRestore(audioUrl)) {
        const restoreState = () => {
          const { currentTime, isPlaying } = audioStateStore.getState();

          wavesurfer.setTime(currentTime);
          if (isPlaying) {
            setTimeout(() => {

              wavesurfer.play();
            }, 100);
          }
          audioStateStore.markRestored();
        };

        if (wavesurfer.getDuration() > 0) {
          // Audio is already loaded, restore immediately
          restoreState();
        } else {
          // Wait for audio to be ready
          const handleReady = () => {

            restoreState();
          };
          
          wavesurfer.on('ready', handleReady);
          
          return () => {
            wavesurfer.un('ready', handleReady);
          };
        }
      }
    }, [showWaveform, wavesurfer, audioUrl]);

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

        if (showWaveform) {

          wavesurfer?.playPause();
        } else {

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

    // Listen for pause audio events
    useEffect(() => {
      const handlePauseEvent = () => {

        if (showWaveform) {
          // For wavesurfer, pause if playing
          if (wavesurferIsPlaying) {
            wavesurfer?.pause();
          }
        } else {
          // For HTML audio, pause if playing
          if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
            audioPlayerRef.current.pause();
          }
        }
      };

      window.addEventListener('pauseAudio', handlePauseEvent);
      
      return () => {
        window.removeEventListener('pauseAudio', handlePauseEvent);
      };
    }, [showWaveform, wavesurfer, wavesurferIsPlaying]);

    const handleSeek = (time: number) => {
      // Update the global store immediately to reflect the seek
      audioStateStore.setState({ currentTime: time });
      
      if (showWaveform && wavesurfer) {
        wavesurfer.setTime(time);
        return;
      }
      
      if (audioPlayerRef.current) {
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
          {duration === 0 ? (
            <span className="inline-block w-8 h-3 bg-gray-200 animate-pulse rounded"></span>
          ) : (
            <span>{formatTime(duration)}</span>
          )}
        </div>
        {showWaveform ? (
          <div ref={wavesurferContainerRef} className="flex-1 rounded-lg p-3 h-[100px]"></div>
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