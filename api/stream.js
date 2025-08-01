const https = require('https'); // Changed from 'http' to 'https'
const fs = require('fs');
const path = require('path');

// Load the video URL from the server-side config file
const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config/video.json'), 'utf8'));

module.exports = (req, res) => {
  // Handle the /api/stream endpoint
  https.get(config.videoUrl, (response) => { // Changed from http.get to https.get
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
      res.setHeader('Content-Range', `bytes ${start}-${end}/${response.headers['content-length']}`);
      res.setHeader('Content-Length', chunksize);
      res.status(206); // Partial Content
      response.pipe(res, { start, end });
    } else {
      // Stream the entire video if no range is specified
      res.setHeader('Content-Length', response.headers['content-length']);
      response.pipe(res);
    }
  }).on('error', (err) => {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Error streaming video' });
  });
};
