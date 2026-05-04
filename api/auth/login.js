// POST /api/auth/login
// Validates the visitor's password against SITE_PASSWORD and, on success,
// issues an HMAC-signed `auth` cookie that middleware.js verifies on every
// subsequent request. Standalone Node serverless function — no external deps,
// no shared Express app, so the bundle stays tiny.

const crypto = require('crypto');

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function base64url(buf) {
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signCookieValue(secret, expiryMs) {
  const sig = base64url(
    crypto.createHmac('sha256', secret).update(String(expiryMs)).digest(),
  );
  return `${expiryMs}.${sig}`;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024) reject(new Error('payload too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const expected = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!expected || !secret) {
    const missing = [];
    if (!expected) missing.push('SITE_PASSWORD');
    if (!secret) missing.push('AUTH_SECRET');
    console.error('[auth] missing env vars:', missing.join(', '));
    // Surface the missing variable names (not values) to help debug deploys.
    res.status(500).json({
      success: false,
      message: 'Server not configured',
      missing,
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    res.status(400).json({ success: false, message: 'Invalid request body' });
    return;
  }

  const password = typeof body.password === 'string' ? body.password : '';
  // Constant-time compare so attacker can't time-side-channel the password.
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    // Small fixed delay to slow brute force.
    await new Promise((r) => setTimeout(r, 400));
    res.status(401).json({ success: false, message: 'Invalid password' });
    return;
  }

  const expiry = Date.now() + COOKIE_MAX_AGE_MS;
  const cookieValue = signCookieValue(secret, expiry);
  res.setHeader(
    'Set-Cookie',
    `auth=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(
      COOKIE_MAX_AGE_MS / 1000,
    )}`,
  );
  res.status(200).json({ success: true });
};
