// server.js (Main Backend Entry Point - Outside src folder)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // bodyParser is deprecated, use express.json() / express.urlencoded()
const path = require('path');             // For serving static files
const http = require('http');
const { Server } = require('socket.io');   // Import Server class from socket.io
require('dotenv').config();               // Load .env variables

// --- Database Connection ---
// Make sure the path is correct relative to THIS server.js file
const db = require('./src/backend/config/db.js');

// --- Initialize Express App and HTTP Server ---
const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const PORT = process.env.PORT || 5000; // Use environment variable or default

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Replace bodyParser.json()
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- Static File Serving ---
// Serve files from the 'public' directory (for profile pics etc.)
app.use(express.static(path.join(__dirname, 'public')));

// --- Import Route Files ---
// Adjust paths relative to THIS server.js file
const authRoutes = require('./src/backend/routes/auth');
const videoRoutes = require('./src/backend/routes/videos'); // We'll create this
const watchPartyRoutes = require('./src/backend/routes/watchPartyRoutes');
const userchangeRoutes = require('./src/backend/routes/user');

app.use('/api/user', userchangeRoutes);  // <<< CORRECT: Handles /api/user/details, /api/user/profile-picture

// Mount other routes under /api
app.use('/api', authRoutes);       // Handles /api/signup, /api/signin
app.use('/api', videoRoutes);      // Handles /api/videos
app.use('/api', watchPartyRoutes); // Handles /api/... (watch party routes)


// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: {
    // Be more specific in production! '*' is insecure.
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow your React app's origin
    methods: ["GET", "POST","PUT","OPTIONS"]
  }
});

// --- Socket.IO Event Handlers ---
// (You can keep this here for now, or move to a separate module later)
let watchParties = {}; // Simple in-memory store for parties

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Store username on socket for easier tracking on disconnect
    socket.username = 'Unknown User'; // Default

    socket.on("startWatchParty", ({ username, videoId }) => {
        if (!videoId || !username) return;
        console.log(`${username} started watch party for ${videoId}`);
        socket.username = username; // Store username
        socket.currentVideoId = videoId; // Store current video ID

        if (!watchParties[videoId]) { watchParties[videoId] = { users: [], messages: [] }; }
        if (!watchParties[videoId].users.some(u => u.id === socket.id)) {
             watchParties[videoId].users.push({id: socket.id, name: username});
        }
        socket.join(videoId);

        const startMessage = { system: true, message: `${username} started the watch party`, timestamp: new Date() };
        watchParties[videoId].messages.push(startMessage);
        io.to(videoId).emit("receiveMessage", startMessage); // Use receiveMessage for consistency
        io.to(videoId).emit('updateParticipants', watchParties[videoId].users.length); // Update count
        // Maybe emit current messages to the starter?
        // socket.emit('initialChatMessages', watchParties[videoId].messages);
    });

    socket.on('joinWatchParty', ({ videoId, username }) => {
        if (!videoId || !username) return;
        console.log(`${username} joining watch party ${videoId}`);
        socket.username = username;
        socket.currentVideoId = videoId;

        if (!watchParties[videoId]) { watchParties[videoId] = { users: [], messages: [] }; }
        if (!watchParties[videoId].users.some(u => u.id === socket.id)) {
             watchParties[videoId].users.push({id: socket.id, name: username});
        }
        socket.join(videoId);

        const joinMessage = { system: true, message: `${username} joined the chat`, timestamp: new Date() };
        watchParties[videoId].messages.push(joinMessage);
        // Send only to others in the room
        socket.to(videoId).emit('receiveMessage', joinMessage);
        // Send previous messages and participant count to the joining user
        socket.emit('initialChatMessages', watchParties[videoId].messages);
        socket.emit('updateParticipants', watchParties[videoId].users.length);
        // Broadcast updated count to everyone
        io.to(videoId).emit('updateParticipants', watchParties[videoId].users.length);
    });

    socket.on('sendMessage', ({ username, videoId, message }) => {
        if (!username || !videoId || !message?.trim() || !watchParties[videoId]) return;
        console.log(`Message from ${username} in ${videoId}: ${message}`);
        const newMessage = { username, message: message.trim(), timestamp: new Date() };
        watchParties[videoId].messages.push(newMessage);
        io.to(videoId).emit('receiveMessage', newMessage); // Broadcast to everyone including sender
    });

    socket.on('leaveWatchParty', ({ videoId, username }) => {
        // Optional: Explicit leave event from frontend
         if (!videoId || !username || !watchParties[videoId]) return;
         socket.leave(videoId);
         watchParties[videoId].users = watchParties[videoId].users.filter(u => u.id !== socket.id);
         const leaveMessage = { system: true, message: `${username} left the chat`, timestamp: new Date() };
         watchParties[videoId].messages.push(leaveMessage);
         io.to(videoId).emit('receiveMessage', leaveMessage);
         io.to(videoId).emit('updateParticipants', watchParties[videoId].users.length);
         console.log(`${username} explicitly left ${videoId}`);
          // TODO: Clean up empty watch party rooms if needed
    });


    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id, 'Username:', socket.username);
        const userLeft = socket.username || 'Unknown User';
        const videoId = socket.currentVideoId; // Use stored videoId

        if(videoId && watchParties[videoId]) {
             // Remove user from the specific party they were in
             const initialLength = watchParties[videoId].users.length;
             watchParties[videoId].users = watchParties[videoId].users.filter(u => u.id !== socket.id);
             const finalLength = watchParties[videoId].users.length;

             if(initialLength > finalLength) { // Only emit if user was actually removed
                 const leaveMessage = { system: true, message: `${userLeft} left the chat`, timestamp: new Date() };
                 watchParties[videoId].messages.push(leaveMessage);
                 io.to(videoId).emit('receiveMessage', leaveMessage);
                 io.to(videoId).emit('updateParticipants', finalLength);
                 console.log(`${userLeft} removed from watch party ${videoId} due to disconnect.`);
                  // TODO: Clean up empty watch party rooms if needed
             }
        }
        // Optional: Iterate through all parties if user could be in multiple (unlikely with current setup)
    });
});

// --- Database Connection Check ---
db.connect((err) => {
    if (err) {
        console.error('--- DATABASE CONNECTION ERROR ---');
        console.error('Error connecting to database:', err.message);
        console.error('Ensure DB server is running and credentials in .env are correct.');
        console.error('DB Host:', process.env.DB_HOST);
        console.error('DB User:', process.env.DB_USER);
        console.error('DB Name:', process.env.DB_NAME);
        console.error('DB Port:', process.env.DB_PORT);
        console.error('-------------------------------');
        process.exit(1); // Exit if DB connection fails on startup
    }
    console.log('Successfully connected to database.');

    // --- Start the HTTP Server (which includes Express and Socket.IO) ---
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});

// Optional: Graceful shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    io.close(() => {
        console.log('Socket.IO server closed.');
    });
    db.end((err) => {
        if (err) console.error('Error closing DB connection:', err.message);
        else console.log('Database connection closed.');
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    });
});