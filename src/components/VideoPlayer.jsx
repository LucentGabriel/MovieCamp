import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export const VideoPlayer = (props) => {
    const videoNode = useRef(null);
    const player = useRef(null);
    const { options, onReady } = props;

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!player.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
            const videoElement = document.createElement("video-js");

            videoElement.classList.add('vjs-big-play-centered');
            videoNode.current.appendChild(videoElement);

            player.current = videojs(videoElement, options, () => {
                videojs.log('player is ready');
                onReady && onReady(player.current);
            });

            // You can update player in the `else` block here, for example:
        } else {
            const p = player.current;

            p.autoplay(options.autoplay);
            p.src(options.sources);
        }
    }, [options, onReady]);

    // Dispose the player on unmount
    useEffect(() => {
        const playerCurrent = player.current;

        return () => {
            if (playerCurrent && !playerCurrent.isDisposed()) {
                playerCurrent.dispose();
                player.current = null;
            }
        };
    }, [player]);

    return (
        <div data-vjs-player>
            <div ref={videoNode} />
        </div>
    );
}

export default VideoPlayer;
