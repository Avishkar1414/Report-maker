const { createPublicKey, verify } = require('node:crypto');

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let signingKeys;
let keysExpireAt = 0;
let keyFetchPromise;

class GoogleKeyServiceError extends Error {}

async function loadGoogleSigningKeys(forceRefresh = false) {
  if (!forceRefresh && signingKeys && Date.now() < keysExpireAt) return signingKeys;
  if (keyFetchPromise) return keyFetchPromise;

  keyFetchPromise = (async () => {
    let response;
    try {
      response = await fetch(GOOGLE_CERTS_URL, { signal: AbortSignal.timeout(5000) });
    } catch {
      throw new GoogleKeyServiceError('Unable to reach Google signing keys');
    }
    if (!response.ok) throw new GoogleKeyServiceError('Unable to load Google signing keys');

    const body = await response.json();
    if (!body.keys || !Array.isArray(body.keys)) throw new Error('Invalid Google signing-key response');
    const keys = new Map();
    for (const jwk of body.keys) {
      if (jwk.kty !== 'RSA' || !jwk.kid || !jwk.n || !jwk.e) continue;
      keys.set(jwk.kid, createPublicKey({ key: jwk, format: 'jwk' }));
    }
    if (keys.size === 0) throw new Error('No usable Google signing keys');

    const maxAge = response.headers.get('cache-control')?.match(/max-age=(\d+)/i)?.[1];
    const cacheDurationMs = maxAge ? Number(maxAge) * 1000 : 5 * 60 * 1000;
    signingKeys = keys;
    keysExpireAt = Date.now() + Math.max(cacheDurationMs, 1000);
    return signingKeys;
  })();

  try {
    return await keyFetchPromise;
  } finally {
    keyFetchPromise = undefined;
  }
}

function decodeBase64UrlJson(segment) {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) throw new Error('Malformed Google token');
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
}

async function verifyGoogleIdToken(token, clientId) {
  const pieces = token.split('.');
  if (pieces.length !== 3) throw new Error('Malformed Google token');

  const [encodedHeader, encodedPayload, encodedSignature] = pieces;
  const header = decodeBase64UrlJson(encodedHeader);
  const payload = decodeBase64UrlJson(encodedPayload);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') {
    throw new Error('Unsupported Google token signature');
  }

  let keys = await loadGoogleSigningKeys();
  let publicKey = keys.get(header.kid);
  if (!publicKey) {
    keys = await loadGoogleSigningKeys(true);
    publicKey = keys.get(header.kid);
  }
  if (!publicKey) throw new Error('Unknown Google signing key');

  const signedContent = Buffer.from(`${encodedHeader}.${encodedPayload}`);
  const signature = Buffer.from(encodedSignature, 'base64url');
  if (!verify('RSA-SHA256', signedContent, publicKey, signature)) {
    throw new Error('Invalid Google token signature');
  }

  const now = Math.floor(Date.now() / 1000);
  const audienceMatches = payload.aud === clientId ||
    (Array.isArray(payload.aud) && payload.aud.includes(clientId) && payload.azp === clientId);
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss) ||
      !audienceMatches ||
      (payload.azp && payload.azp !== clientId) ||
      !Number.isFinite(payload.exp) || payload.exp <= now ||
      !Number.isFinite(payload.iat) || payload.iat > now + 300 ||
      (payload.nbf != null && (!Number.isFinite(payload.nbf) || payload.nbf > now)) ||
      typeof payload.sub !== 'string' ||
      !payload.email || payload.email_verified !== true) {
    throw new Error('Google token claims are invalid or expired');
  }
  return payload;
}

async function requireGoogleSignIn(req, res, next) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return res.status(503).json({ error: 'Google sign-in is not configured on this server' });
  }

  const authorization = req.get('authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return res.status(401).json({ error: 'Sign in with Google to access reports' });
  }

  try {
    const payload = await verifyGoogleIdToken(token, clientId);
    req.user = { email: payload.email, name: payload.name || payload.email };
    next();
  } catch (error) {
    if (error instanceof GoogleKeyServiceError) {
      return res.status(503).json({ error: 'Google sign-in verification is temporarily unavailable' });
    }
    return res.status(401).json({ error: 'Google sign-in expired or could not be verified' });
  }
}

module.exports = { requireGoogleSignIn };
