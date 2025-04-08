import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header'; // Assuming Header component exists and is needed here
import io from 'socket.io-client';

// Initialize Socket.IO connection
const socket = io("http://localhost:5000", {
  reconnection: false, // Disable auto reconnection if desired
  transports: ["websocket", "polling"] // Specify transports
});

// --- CONSTANTS ---
const SEEK_DETECTION_THRESHOLD = 1.5; // Seconds: How much time jump is considered a seek

const VideoWatch = () => {
  // --- Hooks ---
  const location = useLocation();
  const navigate = useNavigate();

  // --- State ---
  const { videoId } = location.state || {}; // Get videoId from navigation state
  const [progress, setProgress] = useState(0); // Video playback progress percentage
  const [fastForwarded, setFastForwarded] = useState(false); // Flag if seeking is detected
  const [watchComplete, setWatchComplete] = useState(false); // Flag if video completed successfully
  const [participants, setParticipants] = useState(0); // Number of watch party participants
  const [chatMessages, setChatMessages] = useState([]); // Array of chat messages
  const [message, setMessage] = useState(''); // Current message input value
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Toggle emoji picker visibility
  const [emojis] = useState(['😀', '😂', '😍', '😎', '🤩', '🥳', '😜']); // Static emoji list

  // --- Refs ---
  const playerRef = useRef(null); // Reference to the YouTube player instance
  const intervalRef = useRef(null); // Reference to the progress tracking interval ID
  const maxReachedTimeRef = useRef(0); // Stores the maximum playback time reached linearly

  // --- Effects ---

  // Effect to handle missing videoId on component mount
  useEffect(() => {
    if (!videoId) {
      console.error("No videoId found in location state. Cannot load video.");
      // Optional: Redirect back or show a persistent error message to the user
      // navigate(-1); // Example: Go back to the previous page
    }
  }, [videoId, navigate]);

  // Effect for Socket.IO event listeners
  useEffect(() => {
    // Only set up listeners if videoId exists
    if (!videoId) return;

    const username = localStorage.getItem('username') || `User_${Date.now().toString().slice(-4)}`; // Get username or generate fallback

    console.log(`Socket: Attempting to join watch party for ${videoId} as ${username}`);
    socket.emit('joinWatchParty', { videoId, username });

    // Define handlers
    const handleReceiveMessage = (msg) => {
      console.log("Socket: Message received:", msg);
      setChatMessages((prev) => [...prev, msg]);
    };
    const handleUpdateParticipants = (count) => {
      console.log("Socket: Participants updated:", count);
      setParticipants(count);
    };
    const handleWatchPartyStarted = (data) => {
      console.log("Socket: Watch party started by:", data.username);
      const starter = data?.username || 'Someone';
      setChatMessages((prev) => [...prev, { system: true, message: `${starter} started a watch party` }]);
    };

    // Add listeners
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('updateParticipants', handleUpdateParticipants);
    socket.on("watchPartyStarted", handleWatchPartyStarted);

    // Cleanup: Remove listeners and leave party on unmount or videoId change
    return () => {
      console.log(`Socket: Leaving watch party for ${videoId}`);
      socket.emit('leaveWatchParty', { videoId, username }); // Good practice to have a leave event on backend
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('updateParticipants', handleUpdateParticipants);
      socket.off('watchPartyStarted', handleWatchPartyStarted);
    };
  }, [videoId]); // Re-run if videoId changes

  // --- YouTube Player Event Handlers ---

  const onPlayerReady = useCallback((event) => {
    console.log("Player Ready");
    // You could potentially autoplay here if desired: event.target.playVideo();
  }, []); // Empty dependency array as it doesn't depend on component state/props

  const onPlayerError = useCallback((event) => {
    console.error("YouTube Player Error:", event.data);
    // TODO: Handle different error codes (e.g., video not found, embedding disabled)
  }, []); // Empty dependency array

  const onPlayerStateChange = useCallback((event) => {
    // Defensive Check: Ensure YouTube API objects are available
    if (!window.YT || !window.YT.PlayerState) {
      console.warn("YT API or PlayerState not available yet in onPlayerStateChange.");
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return; // Exit if API isn't ready
    }

    // Clear any existing progress interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const playerState = event.data; // Get the new player state code

    // Handle different player states
    switch (playerState) {
      case window.YT.PlayerState.PLAYING:
        console.log("Player Playing");
        // Start interval to track progress and detect seeking
        intervalRef.current = setInterval(() => {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.getDuration === 'function' ) {
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();
        
            if (duration && duration > 0) {
              const timeDiff = currentTime - maxReachedTimeRef.current;
        
              // Log values BEFORE checks/updates
              console.log(`Tick: CurrentTime=${currentTime.toFixed(2)}, MaxReached=${maxReachedTimeRef.current.toFixed(2)}, Diff=${timeDiff.toFixed(2)}, FastForwarded=${fastForwarded}`);
        
              // Seek Detection Check
              if (timeDiff > SEEK_DETECTION_THRESHOLD && maxReachedTimeRef.current > 0 && !fastForwarded) {
                console.warn(`>>> SEEK DETECTED! <<<`);
                setFastForwarded(true);
              }
        
              // Update Max Reached Time
              if (!fastForwarded) {
                if (timeDiff <= SEEK_DETECTION_THRESHOLD) { // Allow small jumps/staying put
                    const previousMax = maxReachedTimeRef.current; // Store previous value
                    maxReachedTimeRef.current = Math.max(maxReachedTimeRef.current, currentTime);
                    // Log if it actually changed
                    if (maxReachedTimeRef.current > previousMax) {
                        console.log(`MaxReached updated to: ${maxReachedTimeRef.current.toFixed(2)}`);
                    }
                } else {
                    // Log large jumps even if already fastForwarded (for debugging)
                    if (timeDiff > SEEK_DETECTION_THRESHOLD && maxReachedTimeRef.current > 0) {
                         console.log(`Tick: Large forward jump (${timeDiff.toFixed(2)}s) but fastForwarded flag is already true.`);
                    }
                     // Log rewinds
                     if (timeDiff < -SEEK_DETECTION_THRESHOLD) { // Check for significant rewind
                          console.log(`Tick: Rewind detected (Diff: ${timeDiff.toFixed(2)}s). MaxReached stays at ${maxReachedTimeRef.current.toFixed(2)}.`);
                     }
                }
              }
        
              // Progress Update
              const newProgress = (currentTime / duration) * 100;
              setProgress(Math.min(100, newProgress));
            }
          } else {
             if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }, 1000); 
        break;
        
      case window.YT.PlayerState.ENDED:
        console.log("Player Ended");
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } // Clear interval

        const duration = playerRef.current?.getDuration() || 0;
        const timeNearEnd = duration > 1 ? duration - SEEK_DETECTION_THRESHOLD : duration; // Watched till close to the end

        // Check if completed without seeking AND reached near the actual end
        if (!fastForwarded && maxReachedTimeRef.current >= timeNearEnd) {
          console.log("Watch completed without fast forwarding detected.");
          setWatchComplete(true);
          // TODO: Trigger reward logic here or emit event
        } else if (fastForwarded) {
          console.log("Video ended, but fast forward was detected earlier. No completion credit.");
        } else {
          console.log(`Video ended, but max time reached (${maxReachedTimeRef.current.toFixed(2)}s) was not near the end (${timeNearEnd.toFixed(2)}s). No completion credit.`);
        }
        setProgress(100); // Ensure progress bar shows 100% visually
        break;

      case window.YT.PlayerState.PAUSED:
        console.log("Player Paused");
        // Interval is cleared automatically above
        break;

      case window.YT.PlayerState.BUFFERING:
        console.log("Player Buffering");
        // Interval should be cleared, will restart on PLAYING
        break;

      case window.YT.PlayerState.CUED:
        console.log("Player Cued (Video loaded/reloaded)");
        // Reset state for a fresh viewing session when video is cued
        maxReachedTimeRef.current = 0;
        setFastForwarded(false);
        setProgress(0);
        setWatchComplete(false);
        break;

      default:
        // Handle other potential states if necessary
        break;
    }
  // Dependencies for useCallback: Include all state and setters used inside
  }, [fastForwarded, setFastForwarded, setProgress, setWatchComplete]);

  // --- Player Initialization Function (Memoized) ---
  const initializePlayer = useCallback(() => {
    // Ensure prerequisites are met
    if (!videoId || !window.YT || typeof window.YT.Player !== 'function' || !document.getElementById('player')) {
      console.warn("Cannot initialize player: videoId, YT API/Player, or element missing.");
      return;
    }

    // Reset state for the new player instance
    maxReachedTimeRef.current = 0;
    setFastForwarded(false);
    setProgress(0);
    setWatchComplete(false);
    if (intervalRef.current) clearInterval(intervalRef.current); // Clear any old interval

    console.log("Initializing YouTube player for videoId:", videoId);
    try {
      // Destroy previous player instance if it exists (important for cleanup)
       if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
             console.log("Destroyed previous player instance.");
        }

      // Create the new player instance
      playerRef.current = new window.YT.Player('player', {
        height: '400', // Adjust as needed, consider aspect ratio CSS
        width: '100%',
        videoId,
        playerVars: {
          // 'playsinline': 1, // Good for mobile playback without fullscreen
          'controls': 1, // Show controls (0 hides them, but seek detection is needed)
          'disablekb': 1, // Disable keyboard shortcuts (helps prevent seeking)
          'modestbranding': 1, // Less YouTube branding
          'rel': 0 // Don't show related videos at the end
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    } catch (error) {
      console.error("Error creating YT Player instance:", error);
    }
  // Dependencies: Re-create initializer if videoId or event handlers change
  }, [videoId, onPlayerReady, onPlayerStateChange, onPlayerError, setFastForwarded, setProgress, setWatchComplete]);

  // --- Effect for Loading the YouTube IFrame Player API ---
  useEffect(() => {
    if (!videoId) return; // Don't load API if no video ID

    const playerElement = document.getElementById('player');
     if (!playerElement) {
         console.warn("Player element #player not found in DOM when API effect ran.");
         return; // Don't proceed if the target div isn't rendered
     }

    console.log("Setting up YouTube API loading effect.");
    let scriptTag = null; // Keep track of script added by this effect instance

    // Assign the global callback function that the YouTube API will trigger
    // This ensures initialization happens only when the API confirms it's ready
    window.onYouTubeIframeAPIReady = () => {
      console.log("window.onYouTubeIframeAPIReady fired by API.");
      initializePlayer();
    };

    // Check if the API seems ready already (e.g., navigated back to page)
    if (window.YT && typeof window.YT.Player === 'function' && window.YT.PlayerState) {
      console.log("YT API appears ready on initial effect run.");
      // If ready, initialize directly
      initializePlayer();
    } else {
      // If API is not ready, check if the script tag already exists
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        // If script doesn't exist, create and add it to the page
        console.log("YT API script not found, adding it...");
        scriptTag = document.createElement('script');
        scriptTag.src = "https://www.youtube.com/iframe_api";
        scriptTag.async = true;
        scriptTag.onerror = () => console.error("Failed to load YouTube IFrame API script.");
        document.body.appendChild(scriptTag);
        // Now wait for the onYouTubeIframeAPIReady callback to fire...
      } else {
        // Script exists, but API objects aren't ready yet (might be loading)
        console.log("YT API script exists, but API objects not ready. Waiting for callback...");
        // Wait for onYouTubeIframeAPIReady to fire...
      }
    }

    // --- Cleanup Function ---
    return () => {
      console.log("Cleaning up YT API effect.");
      // Remove the global callback to prevent errors after unmount
       if (window.onYouTubeIframeAPIReady && typeof initializePlayer === 'function' && window.onYouTubeIframeAPIReady.toString() === initializePlayer.toString()) {
           // Check if it's still our function before removing
           window.onYouTubeIframeAPIReady = null;
           console.log("Removed window.onYouTubeIframeAPIReady callback.");
       }

      // Destroy the player instance to free resources
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
          console.log("Destroyed YT player instance on cleanup.");
        } catch (destroyError) {
          console.error("Error destroying YT player on cleanup:", destroyError);
        }
      }

      // Clear any lingering interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
         console.log("Cleared progress interval on cleanup.");
      }

      // Optional: remove the script tag *if* this instance added it.
      // Generally safer to leave it unless causing conflicts.
      // if (scriptTag && scriptTag.parentNode) {
      //    scriptTag.parentNode.removeChild(scriptTag);
      // }
    };
  // Dependencies: Re-run effect if videoId or the initializer function changes
  }, [videoId, initializePlayer]);

  // --- Chat & Watch Party Functions ---
  const sendMessage = useCallback(() => {
    const username = localStorage.getItem('username');
    if (!username) { alert("Sign in to send messages."); return; }
    if (!videoId) { alert("Video context lost."); return; }
    if (!message.trim()) return; // Don't send empty messages

    const msgData = { username, videoId, message: message.trim() };
    console.log("Socket: Sending message:", msgData);
    socket.emit("sendMessage", msgData);
    setMessage(""); // Clear input after sending
    setShowEmojiPicker(false); // Hide emoji picker
  }, [message, videoId]); // Dependencies: message and videoId

  const startWatchParty = useCallback(() => {
    const username = localStorage.getItem('username');
    if (!username) { alert("Sign in to start a watch party."); return; }
    if (!videoId) { alert("Video context lost."); return; }

    console.log(`Socket: User ${username} starting watch party for: ${videoId}`);
    socket.emit("startWatchParty", { username, videoId });
  }, [videoId]); // Dependency: videoId

  // --- Effect for Interval Cleanup on Unmount (Belt-and-suspenders) ---
  useEffect(() => {
    // This effect only runs on mount and returns a cleanup for unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array ensures it runs only once on mount/unmount

  // --- Render Logic ---

  // Render loading or error if videoId is missing
  if (!videoId) {
    return (
      <div className="font-sans">
        <Header />
        <div className="flex justify-center items-center h-screen p-4 text-center">
          <p className="text-red-500 text-xl bg-red-100 p-4 rounded-md shadow">
            Error: No video selected or video ID is missing. Please go back and select a video.
          </p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="font-sans">
      <div className="video-watch-container flex flex-col md:flex-row items-stretch overflow-hidden p-4 gap-4">
        {/* Video Section */}
        <div className="video-section w-full md:w-3/4 flex flex-col items-center">
          <h1 className="text-xl font-bold mb-4 text-center text-gray-800">Watch Video & Earn</h1>
          {/* Player container - aspect ratio helps maintain shape */}
          <div className="w-full max-w-4xl aspect-video bg-black mb-4 shadow-lg rounded-lg overflow-hidden">
            <div id="player"></div> {/* YouTube player will attach here */}
          </div>
          {/* Progress Bar */}
          <div className="progress-container w-full max-w-4xl mb-2 px-1">
            <div className="progress-bar bg-gray-300 rounded-full h-2.5 overflow-hidden">
              <div
                className="progress bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 text-right mt-1">{(progress || 0).toFixed(0)}%</div>
          </div>
          {/* User Feedback Messages */}
          <div className="messages-container w-full max-w-4xl min-h-[4em] text-center py-1"> {/* Reserve space */}
            {fastForwarded && (
              <p className="text-red-500 text-sm mb-2 animate-pulse"> {/* Optional pulse effect */}
                Video skipping detected. Completion credit may not be granted.
              </p>
            )}
            {watchComplete && !fastForwarded && (
              <p className="text-green-600 text-lg font-semibold mb-2">
                🎉 Video watch complete! 🎉
              </p>
            )}
            {watchComplete && fastForwarded && (
              <p className="text-orange-500 text-sm mb-2">
                Video finished, but skipping was detected.
              </p>
            )}
          </div>
        </div>

        {/* Reward & Chat Section */}
        <aside className="reward-section w-full md:w-1/4 p-4 bg-gray-50 rounded-lg shadow-md flex flex-col border border-gray-200 max-h-[calc(100vh-120px)]"> {/* Adjusted max-h */}
          <h2 className="text-lg font-bold mb-2 text-center text-gray-800 border-b pb-2">Rewards & Chat</h2>
          <p className="mb-4 text-center text-sm text-gray-600">Potential Earn: <span className="text-green-600 font-semibold">$0.05</span></p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 text-sm rounded mb-2 w-full transition-colors duration-150 shadow">
            Subscribe to Creator
          </button>
          <button onClick={startWatchParty} className="bg-purple-500 hover:bg-purple-600 text-white p-2 text-sm rounded mb-4 w-full transition-colors duration-150 shadow">
            Start Watch Party ({participants} watching)
          </button>

          {/* Chat Box */}
          <div className="chat-box flex-1 flex flex-col min-h-0 border border-gray-300 rounded-lg overflow-hidden bg-white">
            <h3 className="font-semibold p-2 bg-gray-100 border-b border-gray-300 text-sm text-gray-700">Watch Party Chat</h3>
            {/* Messages Area */}
            <div className="chat-messages flex-1 p-2 overflow-y-auto space-y-2">
              {chatMessages.map((msg, index) => (
                msg.system ? (
                  <p key={index} className="text-center text-gray-500 italic text-xs my-1">{msg.message}</p>
                ) : (
                  <div key={index} className="message-item max-w-[90%]">
                    <p className="bg-indigo-100 p-1.5 px-2.5 rounded-lg break-words text-sm shadow-sm">
                      <span className="font-semibold text-indigo-700 text-xs block mb-0.5">{msg.username || 'Anon'}: </span>
                      {msg.message}
                    </p>
                  </div>
                )
              ))}
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="emoji-picker bg-gray-50 p-2 border-t border-gray-300 max-h-32 overflow-y-auto flex flex-wrap gap-1 justify-center">
                {emojis.map((emoji, index) => (
                  <button key={index} onClick={() => setMessage(message + emoji)} className="text-xl p-1 hover:bg-gray-200 rounded">
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input */}
            <div className="flex items-center p-2 border-t border-gray-300 bg-gray-50">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
                placeholder="Type a message..."
                className="border border-gray-300 p-1.5 px-2 flex-1 rounded-md mr-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emojis" className="p-1 text-xl hover:bg-gray-200 rounded mr-1">😀</button>
              <button onClick={sendMessage} title="Send Message" className="bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 px-3 text-sm rounded shadow transition-colors duration-150">Send</button>
            </div>
          </div> {/* End Chat Box */}
        </aside> {/* End Reward Section */}
      </div> {/* End Container */}
    </div>
  );
}

export default VideoWatch;