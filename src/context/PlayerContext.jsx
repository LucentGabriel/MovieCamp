import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const playVideo = (url) => {
    setVideoUrl(url);
    setIsOpen(true);
  };

  const closeVideo = () => {
    setIsOpen(false);
    setVideoUrl('');
  };

  const value = {
    isOpen,
    videoUrl,
    playVideo,
    closeVideo,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
