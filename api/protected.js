export default function handler(req, res) {
  const referer = req.headers.referer;

  if (!referer || !referer.includes('customize-player.vercel.app')) {
    // Redirect to custom 403 page
    return res.redirect(302, '/404.html');
  }

  res.status(200).json({ message: 'Access granted' });
}