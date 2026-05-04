// POST /api/auth/logout — clears the auth cookie.

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }
  res.setHeader(
    'Set-Cookie',
    'auth=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
  );
  res.status(200).json({ success: true });
};
