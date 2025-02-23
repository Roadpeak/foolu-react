const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/videos', async (req, res) => {
    const { category } = req.query;

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 10,
                type: 'video',
                q: category || '',
                key: process.env.API_KEY
            }
        });
        //console.log("YouTube API Response:", response.data);
        const videos = response.data.items
            .filter(item => item.id.videoId)
            .map(item => ({
                thumbnailUrl: item.snippet.thumbnails.high.url,
                videoId: item.id.videoId
            }))
            .slice(0, 10);

        res.send(videos);
    } catch (error) {
        console.error('Error fetching videos:', error.message);
        res.status(500).send('Error fetching videos');
    }
});

module.exports = router;
