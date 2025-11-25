import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import StreamingModal from './StreamingModal';

const GlobalPlayer = () => {
    const { isOpen, closeVideo, videoUrl } = usePlayer();

    return (
        <StreamingModal
            isOpen={isOpen}
            onClose={closeVideo}
            videoUrl={videoUrl}
        />
    );
};

export default GlobalPlayer;
