import React from 'react';
import { useLocation } from 'react-router-dom'; 
const VideoWatch = () => {
  const location = useLocation(); 
  const { videoUrl } = location.state || {}; 

  if (!videoUrl) {
    return <div>No video URL provided</div>; 
  }

  console.log("Video URL received:", videoUrl); 

  return (
    <div className="video-watch-container">
      <h1>Watch Video</h1>
      <div className="video-player">
        <iframe 
          width="560" 
          height="315" 
          src={videoUrl} 
          title="Video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen 
        />
      </div>
    </div>
  );
};

export default VideoWatch;
