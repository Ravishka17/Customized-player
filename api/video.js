const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Simple token-based authentication
    const authToken = req.headers['authorization'];
    if (!authToken || authToken !== 'Bearer YOUR_SECRET_TOKEN') {
        return res.status(401).send('Unauthorized');
    }

    const videoUrl = 'https://ia804603.us.archive.org/12/items/please-stand-by-video-effect_202409/SpongeBob%20SquarePants%20Season%201%20Episode%201%20Help%20Wanted%20%E2%80%93%20Reef%20Blower%20%E2%80%93%20Tea%20at%20the%20Treedome%20-%20SpongeBob%20SquarePants.mp4';

    try {
        const response = await fetch(videoUrl, {
            headers: {
                'Range': req.headers.range || 'bytes=0-',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch video');
        }

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');

        if (req.headers.range) {
            const range = req.headers.range;
            const contentLength = response.headers.get('content-length');
            const [start, end] = range.replace(/bytes=/, '').split('-').map(Number);
            const chunkEnd = end || contentLength - 1;
            const chunkSize = chunkEnd - start + 1;

            res.status(206);
            res.setHeader('Content-Range', `bytes ${start}-${chunkEnd}/${contentLength}`);
            res.setHeader('Content-Length', chunkSize);
        } else {
            res.setHeader('Content-Length', response.headers.get('content-length'));
        }

        response.body.pipe(res);
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).send('Error streaming video');
    }
};
