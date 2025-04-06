import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './Home.css';
import axios from 'axios';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos(category, page);
  }, [category, page]);

  const loadVideos = (category, page) => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/videos?category=${category}`)
      .then(response => {
        //console.log("API Response:", response.data); // Debugging line
        const fetchedVideos = Array.isArray(response.data) ? response.data : []; // Ensure it's an array
  
        setVideos(prevVideos => (page === 1 ? fetchedVideos : [...prevVideos, ...fetchedVideos]));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
        setVideos([]); // Ensure videos is never undefined
        setLoading(false);
      });
  };

  const handleVideoClick = (videoId) => {
    navigate('/VideoWatch', { state: { videoId } });
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setVideos([]);
    setCategory(newCategory);
    setPage(1);
  };

  return (
    <div className="font-sans">
      <div className="categories mb-6 p-6">
        <h3 className="text-xl font-semibold mb-4">Video Categories</h3>
        <div className="flex space-x-6 overflow-x-auto">
          {['Trending', 'Music', 'Gaming', 'Sports', 'News', 'Technology', 'Lifestyle', 'Comedy', 'Education','Recipe','Kenya','Travel','Fashion','ASMR'].map(cat => (
            <button 
              key={cat} 
              className="category text-blue-500 hover:underline bg-transparent border-none cursor-pointer" 
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div 
        className="video-section max-h-[70vh] overflow-y-auto p-6"
        onScroll={handleScroll}
      >
        <div className="video-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <div 
              key={index} 
              className="video-item" 
              onClick={() => handleVideoClick(video.videoId)}
            >
              <img src={video.thumbnailUrl} alt="Video thumbnail" />
            </div>
          ))}
        </div>
        {loading && <p>Loading more videos...</p>}
      </div>
    </div>
  );
};

export default Home;
