import React, { useEffect, useState } from 'react';
import Header from './Header';

const SubscribePage = () => {
  const [channelData, setChannelData] = useState([]);
  
  const subscriptions = [
    {
      id: '@IShowSpeed',  // Channel ID for IShowSpeed
      type: 'channel',
      price: 'ksh5',
      url: 'https://www.youtube.com/@IShowSpeed',
    },
    {
      id: '@AMPEXCLUSIVE',  // Channel ID for AMPEXCLUSIVE
      type: 'channelid',
      price: 'ksh10',
      url: 'https://www.youtube.com/@AMPEXCLUSIVE',
    },
  ];

  // Fetch channel logo using YouTube Data API
  const fetchChannelLogo = async (channelId) => {
    const apiKey = '432921900594-8k1vb0erfnfooc7vdeefbssthre8l6cf.apps.googleusercontent.com';  
    const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`);
    const data = await response.json();
    if (data.items && data.items[0]) {
      return data.items[0].snippet.thumbnails.default.url;
    }
    return null;  // Return null if no logo is found
  };

  // Get the channel logos on component mount
  useEffect(() => {
    const getChannelLogos = async () => {
      const logos = await Promise.all(
        subscriptions.map(async (sub) => {
          const logo = await fetchChannelLogo(sub.id);
          return { ...sub, logo };
        })
      );
      setChannelData(logos);
    };

    getChannelLogos();
  }, []);

  return (
    <div>
      {/* Header */}
      <Header />

      {/* Container */}
      <div style={styles.container}>
        {channelData.map((sub, index) => (
          <div key={index} style={styles.channelItem}>
            {/* Display YouTube Channel Logo */}
            {sub.logo ? (
              <img src={sub.logo} alt={sub.id} style={styles.channelLogo} />
            ) : (
              <div style={styles.placeholderLogo}>No Logo</div>
            )}

            {/* Display YouTube Channel Name */}
            <a href={sub.url} target="_blank" rel="noopener noreferrer" style={styles.channelLink}>
              {sub.id}
            </a>

            {/* YouTube Subscribe Button */}
            <div
              className="g-ytsubscribe"
              data-channel={sub.type === 'channel' ? sub.id : null}
              data-channelid={sub.type === 'channelid' ? sub.id : null}
              data-layout="full"
              data-theme="dark"
              data-count="default"
            ></div>

            <p style={styles.price}>{sub.price}</p>
            {/* Subscribe Button */}
            <button style={styles.subscribeButton}>Subscribe</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  navbar: {
    backgroundColor: '#b6c9d5',
    padding: '10px 20px',
    borderRadius: '20px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'space-around',
    padding: 0,
    margin: 0,
  },
  container: {
    margin: '20px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  channelItem: {
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    margin: '10px',
    textAlign: 'center',
    flex: '1 0 calc(45% - 20px)',
  },
  price: {
    marginTop: '10px',
    fontWeight: 'bold',
    color: '#333',
  },
  channelLink: {
    display: 'block',
    marginBottom: '10px',
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  subscribeButton: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#ff6f61',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  channelLogo: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    marginBottom: '10px',
  },
  placeholderLogo: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    marginBottom: '10px',
  },
};

export default SubscribePage;
