import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; 

const VideoWatch = () => {
  const location = useLocation(); 
  const { videoId } = location.state || {}; 
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      window.onYouTubeIframeAPIReady = () => {
        playerRef.current = new window.YT.Player('player', {
          height: '315',
          width: '560',
          videoId,
          events: {
            onReady: (event) => {
              event.target.playVideo();
            }
          }
        });
      };

      if (window.YT) {
        window.onYouTubeIframeAPIReady();
      }
    }
  }, [videoId]);

  if (!videoId) {
    return <div>No video ID provided</div>; 
  }

  console.log("Video ID received:", videoId);

  return (
    <div className="video-watch-container">
      <h1>Watch Video</h1>
      <div className="video-player" id="player" />
    </div>
  );
};

export default VideoWatch;
