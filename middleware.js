// Vercel Edge Middleware — gates the entire site behind a login.
// Runs at the edge before any route matches. Unauthenticated requests
// are redirected to /login. Authenticated requests carry an HMAC-signed
// cookie set by /api/auth/login.

export const config = {
  matcher: '/((?!_next/|favicon\\.ico).*)',
};

// Paths that must remain reachable without auth.
const PUBLIC_PATHS = new Set([
  '/login',
  '/login.html',
  '/api/auth/login',
  '/api/auth/logout',
  '/robots.txt',
  '/favicon.ico',
]);

// Assets the login page itself needs.
const LOGIN_ASSET_PREFIXES = [
  '/css/login',
  '/js/login',
];

async function verifyAuthCookie(cookieValue, secret) {
  if (!cookieValue || !secret) return false;
  const dot = cookieValue.indexOf('.');
  if (dot < 1) return false;
  const expiryStr = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const macBuf = await crypto.subtle.sign('HMAC', key, enc.encode(expiryStr));
  const expected = base64url(new Uint8Array(macBuf));

  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function base64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (PUBLIC_PATHS.has(pathname)) return;
  if (LOGIN_ASSET_PREFIXES.some((p) => pathname.startsWith(p))) return;

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return new Response('Server misconfigured: AUTH_SECRET missing', {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    });
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)auth=([^;]+)/);
  const authCookie = match ? match[1] : null;

  if (await verifyAuthCookie(authCookie, secret)) return;

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname + url.search);
  return Response.redirect(loginUrl, 307);
}
