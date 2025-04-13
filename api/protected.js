export default function handler(req, res) {
  const referer = req.headers.referer || '';
  const allowedDomain = 'https://yourdomain.vercel.app'; // Replace with your actual domain
  if (!referer || !referer.includes(allowedDomain)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.status(200).json({ allowed: true });
}