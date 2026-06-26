import { useRef, useEffect, useState, useCallback } from 'react';
import { GUEST_DEMO_SAMPLE } from './config';

const VideoPlayerNonLoggedInDemo = ({ src }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showControls, setShowControls] = useState(false);

    const playVideo = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error('Error attempting to play video:', error);
            });
        }
    }, []);

    const pauseVideo = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const togglePlayPause = useCallback(() => {
        if (isPlaying) {
            pauseVideo();
        } else {
            playVideo();
        }
    }, [isPlaying, pauseVideo, playVideo]);

    const forward10 = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime += 10;
        }
    }, []);

    const rewind10 = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.currentTime -= 10;
        }
    }, []);

    const handleMouseEnter = () => setShowControls(true);
    const handleMouseLeave = () => setShowControls(false);

    return (
        <div
            className={`relative flex flex-col items-center h-full`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <video
                ref={videoRef}
                src={src}
                className={`w-full h-full bg-black rounded-lg sm:rounded-none sm:rounded-t-lg aspect-video object-contain`}
                playsInline
                autoPlay
                muted
                loop
            />
            {(showControls) && (
                <div className={`absolute bottom-[20%] flex items-center p-2`}>
                    <button onClick={rewind10} className={`w-6 md:w-10 mx-2 cursor-pointer flex justify-center`}>
                        <img src={GUEST_DEMO_SAMPLE.backward} alt="Rewind 10 seconds" />
                    </button>
                    <button onClick={togglePlayPause} className={`w-8 md:w-12 cursor-pointer flex justify-center`}>
                        <img src={isPlaying ? GUEST_DEMO_SAMPLE.pauseButton : GUEST_DEMO_SAMPLE.playButton} alt="Play/Pause" />
                    </button>
                    <button onClick={forward10} className={`w-6 md:w-10 mx-2 cursor-pointer flex justify-center`}>
                        <img src={GUEST_DEMO_SAMPLE.forward} alt="Forward 10 seconds" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoPlayerNonLoggedInDemo;
