/**
 * Security & Sanitization Utilities for Tuba Enterprises
 */

// Strip HTML tags and control characters to prevent Stored & Reflected XSS
export function sanitizeText(input, maxLength = 250) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>'"`;(){}[\]\\]/g, '') // remove HTML & scripting characters
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')    // remove control characters
    .slice(0, maxLength);
}

// Phone number sanitizer (strictly digits only, maximum 10 digits)
export function sanitizePhone(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\D/g, '')
    .slice(0, 10);
}

// Client-side rate limiter using in-memory rolling window
export class ClientRateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.timestamps = [];
  }

  canAttempt() {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);
    return this.timestamps.length < this.maxAttempts;
  }

  recordAttempt() {
    this.timestamps.push(Date.now());
  }

  getRemainingTime() {
    if (this.timestamps.length === 0) return 0;
    const oldest = this.timestamps[0];
    const diff = this.windowMs - (Date.now() - oldest);
    return Math.max(0, Math.ceil(diff / 1000));
  }
}

/**
 * Constant-time string equality check to prevent timing attacks
 */
export function secureTimingEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let mismatch = a.length === b.length ? 0 : 1;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= (charA ^ charB);
  }
  return mismatch === 0;
}

/**
 * Cryptographically-secure PBKDF2 password derivation (100,000 iterations of HMAC-SHA-256)
 * Salted to prevent rainbow tables and dictionary attacks.
 */
export async function hashPassword(password, salt = 'tuba-enterprises-salt-2026') {
  if (typeof password !== 'string') return '';
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
