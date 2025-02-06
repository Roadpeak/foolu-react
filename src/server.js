const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2')

require('dotenv').config();

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json())

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
db.connect((err) => {
    if(err){
        console.error('Error connecting to database', err.message)
        return;
    }
    console.log('Connected to database')
});

app.post('/api/signup', async (req, res) =>{
        const { name, username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { name, username, email, password: hashedPassword, role: role || 'viewer' }; 
      
        const query = 'INSERT INTO foolu_users (foolu_name, foolu_username, foolu_email, foolu_pass, foolu_role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [user.name, user.username, user.email, user.password, user.role], (err, result) => {
          if (err) {
            console.error('Error inserting user into the database:', err);
            return res.status(500).send('Error registering user');
          }
          res.status(201).send('User registered successfully');
        });
})

app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received data:', { username, password }); // Debugging log
  
    const query = 'SELECT * FROM foolu_users WHERE foolu_username = ?';
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error('Error fetching user from the database:', err);
        return res.status(500).send('Error signing in');
      }
      if (results.length === 0) {
        return res.status(400).send('User not found');
      }
  
      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.foolu_pass);
      if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
      }
  
      const token = jwt.sign({ email: user.foolu_email, role: user.foolu_role }, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.send({ token });
    });
  });
  


  app.get('/api/videos', async (req, res) => {
    const { category } = req.query; // Get the category from query params
  
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          maxResults: 20,
          type: 'video',
          q: category || '', // Use the category if provided, otherwise search all
          key: process.env.API_KEY
        }
      });
  
      const videos = response.data.items
        .filter(item => item.id.videoId)
        .map(item => ({
          thumbnailUrl: item.snippet.thumbnails.high.url,
          videoId: item.id.videoId // Return the video ID
        }))
        .slice(0, 10);
  
      res.send(videos);
    } catch (error) {
      console.error('Error fetching videos:', error.message);
      res.status(500).send('Error fetching videos');
    }
  });
  
  
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
