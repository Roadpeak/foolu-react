const express = require('express');
const router = express.Router();

const watchParties = {}; // Store active watch parties

// Check if a watch party is active for a specific video
router.get('/checkWatchParty', (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: "Missing videoId parameter" });
  }

  const isActive = watchParties[videoId] && watchParties[videoId].users.length > 0;
  res.json({ isActive });
});

module.exports = router;
