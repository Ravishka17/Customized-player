// /api/protected.js
export default function handler(req, res) {
  const referer = req.headers.referer || '';

  if (!referer.includes('yourdomain.vercel.app')) {
    res.redirect(302, '/404.html');
    return;
  }

  res.status(200).json({ allowed: true });
}