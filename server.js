const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');

const app = express();
const port = 3000;

// Load the video URL from the server-side config file
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/video.json'), 'utf8'));

// Serve static files (index.html, player.css, player.js)
app.use(express.static(path.join(__dirname, 'public')));

// Streaming proxy endpoint
app.get('/stream', (req, res) => {
  // Fetch the video from the URL in config
  http.get(config.videoUrl, (response) => {
    // Forward relevant headers
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Accept-Ranges', 'bytes'); // Support range requests for seeking

    // Handle range requests for video seeking
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : response.headers['content-length'] - 1;
      const chunksize = end - start + 1;
      res.writeHeader('Content-Range', `bytes ${start}-${end}/${response.headers['content-length']}`);
      res.writeHeader('Content-Length', chunksize);
      res.status(206); // Partial Content
      response.pipe(res, { start, end });
    } else {
      // Stream the entire video if no range is specified
      res.setHeader('Content-Length', response.headers['content-length']);
      response.pipe(res);
    }
  }).on('error', (err) => {
    console.error('Error fetching video:', err);
    res.status(500).send('Error streaming video');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
