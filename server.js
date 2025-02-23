const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
//console.log("Loaded API Key:", process.env.API_KEY);
const db = require('./src/backend/config/db.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Routes
const authRoutes = require('./src/backend/routes/auth');
const videoRoutes = require('./src/backend/routes/videos');

app.use('/api', authRoutes);
app.use('/api', videoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
