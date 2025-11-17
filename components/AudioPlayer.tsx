import React, { useState, useRef } from 'react';

interface AudioPlayerProps {
  audioSrc: string; // The source URL of the audio file
  isDarkMode?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, isDarkMode = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };
  
  const theme = {
    bg: isDarkMode ? 'bg-inputBg' : 'bg-gray-100',
    text: isDarkMode ? 'text-primaryText' : 'text-gray-800',
    icon: isDarkMode ? 'text-secondaryText' : 'text-gray-500',
    accent: 'accent-primaryAccent',
    progressBg: isDarkMode ? 'bg-borderColor' : 'bg-gray-300',
  };

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg w-full ${theme.bg}`}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
      <button
        onClick={togglePlayPause}
        className={`p-2 rounded-full ${theme.text} hover:bg-gray-700 transition`}
        aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
        )}
      </button>
      <div className="w-full h-2 rounded-full bg-borderColor overflow-hidden">
         <div className="h-full bg-primaryAccent" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default AudioPlayer;