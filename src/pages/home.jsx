import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import Header from './Header'; 
import './Home.css'; 

const Home = () => {  
  const [videos, setVideos] = useState([
    "https://www.youtube.com/embed/videoID1",
    "https://www.youtube.com/embed/videoID2",
    "https://www.youtube.com/embed/videoID3",
    "https://www.youtube.com/embed/videoID4",
    "https://www.youtube.com/embed/videoID5",
    "https://www.youtube.com/embed/videoID6",
    "https://www.youtube.com/embed/videoID7",
    "https://www.youtube.com/embed/videoID8",
    "https://www.youtube.com/embed/videoID9",
    "https://www.youtube.com/embed/videoID10",
    "https://www.youtube.com/embed/videoID11",
    "https://www.youtube.com/embed/videoID12",
    "https://www.youtube.com/embed/videoID13",  
    "https://www.youtube.com/embed/videoID14",  
    "https://www.youtube.com/embed/videoID15",  
    "https://www.youtube.com/embed/MQ5IQiynrjU?si=VmIoqsqC8LjpE56v", 
    "https://www.youtube.com/embed/_lz_icer6YQ?si=WhTlBa7cr9RjFOC9"  
  ]);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleVideoClick = (videoUrl) => {
    // Navigate to VideoWatch page with the video URL as a state
    navigate('/VideoWatch', { state: { videoUrl } });
  };

  const loadMoreVideos = () => {
    setVideos(prevVideos => [
      ...prevVideos,
      "https://www.youtube.com/embed/videoID16",
      "https://www.youtube.com/embed/videoID17",
      "https://www.youtube.com/embed/videoID18",
      "https://www.youtube.com/embed/videoID19",
      "https://www.youtube.com/embed/videoID20",
      "https://www.youtube.com/embed/videoID21"
    ]);
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom) {
      loadMoreVideos();
    }
  };

  return (
    <div className="font-sans">
      <Header />
      <div className="categories mb-6 p-6">
        <h3 className="text-xl font-semibold mb-4">Video Categories</h3>
        <div className="flex space-x-6 overflow-x-auto">
          <a href="#" className="category text-blue-500 hover:underline">Trending</a>
          <a href="#" className="category text-blue-500 hover:underline">Music</a>
          <a href="#" className="category text-blue-500 hover:underline">Gaming</a>
          <a href="#" className="category text-blue-500 hover:underline">Sports</a>
          <a href="#" className="category text-blue-500 hover:underline">News</a>
          <a href="#" className="category text-blue-500 hover:underline">Technology</a>
          <a href="#" className="category text-blue-500 hover:underline">Lifestyle</a>
          <a href="#" className="category text-blue-500 hover:underline">Comedy</a>
          <a href="#" className="category text-blue-500 hover:underline">Education</a>
        </div>
      </div>

      <div 
        className="video-section max-h-[70vh] overflow-y-auto p-6"
        onScroll={handleScroll}
      >
        <div className="video-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {videos.map((videoUrl, index) => (
            <div key={index} className="video-item" onClick={() => handleVideoClick(videoUrl)}>
              <iframe 
                width="560"  // Set width to 560px
                height="315"  // Set height to 315px
                src={videoUrl} 
                title={`YouTube video ${index + 1}`} 
                frameBorder="0" 
                className="rounded-lg"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
