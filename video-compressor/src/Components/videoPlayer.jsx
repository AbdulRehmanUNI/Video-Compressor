import { useState, useRef, useEffect } from 'react';
import { ReactCompareSlider } from 'react-compare-slider';
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";

export default function VideoPlayer({ originalVidSrc, compressedVidSrc }) {
  const [sliderValue, setSliderValue] = useState(0); // Slider value in seconds
  const [duration, setDuration] = useState(0); // Duration of the video
  const [isPlaying, setIsPlaying] = useState(true);
  const [showStats, setShowStats] = useState(true);

  const [originalStats, setOriginalStats] = useState({});
  const [compressedStats, setCompressedStats] = useState({});

  const originalVideoRef = useRef(null);
  const compressedVideoRef = useRef(null);

  const updateStats = () => {
    if (originalVideoRef.current) {
      const originalVideo = originalVideoRef.current;
      const originalSize = (originalVideo.videoWidth * originalVideo.videoHeight * 24 * originalVideo.duration) / (8 * 1e6); // Estimated size in MB
      setOriginalStats({
        resolution: `${originalVideo.videoWidth}x${originalVideo.videoHeight}`,
        duration: `${formatTime(originalVideo.duration)}`,
        currentTime: `${formatTime(originalVideo.currentTime)}`,
        codec: "H.264/AVC",
        estimatedSize: `${originalSize.toFixed(2)} MB`,
        playbackState: originalVideo.paused ? "Paused" : "Playing",
      });
    }
    if (compressedVideoRef.current) {
      const compressedVideo = compressedVideoRef.current;
      const compressedSize = (compressedVideo.videoWidth * compressedVideo.videoHeight * 24 * compressedVideo.duration) / (8 * 1e6); // Estimated size in MB
      setCompressedStats({
        resolution: `${compressedVideo.videoWidth}x${compressedVideo.videoHeight}`,
        duration: `${formatTime(compressedVideo.duration)}`,
        currentTime: `${formatTime(compressedVideo.currentTime)}`,
        codec: "H.264/AVC",
        estimatedSize: `${compressedSize.toFixed(2)} MB`,
        playbackState: compressedVideo.paused ? "Paused" : "Playing",
      });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const calculateCompression = () => {
    const originalSize = parseFloat(originalStats.estimatedSize || "0");
    const compressedSize = parseFloat(compressedStats.estimatedSize || "0");
    if (originalSize && compressedSize) {
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
      return compressionRatio.toFixed(1);
    }
    return "Calculating...";
  };

  const handleTimeUpdate = () => {
    if (originalVideoRef.current) {
      setSliderValue(originalVideoRef.current.currentTime);
      updateStats();
    }
  };

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setSliderValue(newTime);

    if (originalVideoRef.current) originalVideoRef.current.currentTime = newTime;
    if (compressedVideoRef.current) compressedVideoRef.current.currentTime = newTime;
  };

  const handlePausePlay = () => {
    if (originalVideoRef.current.paused) {
      originalVideoRef.current.play();
      compressedVideoRef.current.play();
      setIsPlaying(true);
    } else {
      originalVideoRef.current.pause();
      compressedVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const handleLoadedMetadata = () => updateStats();

    if (originalVideoRef.current) {
      originalVideoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      originalVideoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    if (compressedVideoRef.current) {
      compressedVideoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      compressedVideoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (originalVideoRef.current) {
        originalVideoRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        originalVideoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
      if (compressedVideoRef.current) {
        compressedVideoRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        compressedVideoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Stats for Nerds */}
      {showStats && (
        <>
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded-md z-10">
            <button onClick={() => setShowStats(false)} className="absolute top-1 right-1 text-sm text-white">
              ✕
            </button>
            <h3 className="font-semibold">Original Video</h3>
            <p>Resolution: {originalStats.resolution || "Loading..."}</p>
            <p>Duration: {originalStats.duration || "Loading..."}</p>
            <p>Current Time: {originalStats.currentTime || "0:00"}</p>
            <p>Codec: {originalStats.codec || "N/A"}</p>
            {/* <p>Estimated Size: {originalStats.estimatedSize || "Calculating..."} MB</p> */}
            <p>Playback State: {originalStats.playbackState || "N/A"}</p>
          </div>

          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded-md z-10">
            <h3 className="font-semibold">Compressed Video</h3>
            <p>Resolution: {compressedStats.resolution || "Loading..."}</p>
            <p>Duration: {compressedStats.duration || "Loading..."}</p>
            <p>Current Time: {compressedStats.currentTime || "0:00"}</p>
            <p>Codec: {compressedStats.codec || "N/A"}</p>
            {/* <p>Estimated Size: {compressedStats.estimatedSize || "Calculating..."} MB</p> */}
            <p>Playback State: {compressedStats.playbackState || "N/A"}</p>
            {/* <p className="mt-2 font-bold text-green-400">
              Compression: {calculateCompression()}%
            </p> */}
          </div>
        </>
      )}

      {/* Show Stats Button */}
      {!showStats && (
        <button
          onClick={() => setShowStats(true)}
          className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded-md z-10"
        >
          Show Stats
        </button>
      )}

      {/* Compare Slider */}
      <ReactCompareSlider
        itemOne={
          <video autoPlay muted ref={originalVideoRef} playsInline className="rounded-t-xl size-full">
            <source src={originalVidSrc} type="video/mp4" />
          </video>
        }
        itemTwo={
          <video autoPlay muted ref={compressedVideoRef} playsInline className="rounded-t-xl size-full">
            <source src={compressedVidSrc} type="video/mp4" />
          </video>
        }
      />

      {/* Play/Pause and Slider */}
      <div className="flex items-center bg-zinc-800 rounded-b-xl px-3 py-2">
        <button onClick={() => handlePausePlay()} className="group mr-2">
          {isPlaying ? (
            <BsPauseFill className="text-zinc-200 size-6 group-hover:text-zinc-50" />
          ) : (
            <BsFillPlayFill className="text-zinc-200 size-6 group-hover:text-zinc-50" />
          )}
        </button>
        <input
          id="video-slider"
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={sliderValue}
          onChange={(e) => handleSliderChange(e)}
          className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-zinc-200"
        />
      </div>
    </div>
  );
}
