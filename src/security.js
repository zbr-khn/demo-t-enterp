/**
 * Security & Sanitization Utilities for Tuba Enterprises
 */

// Strip HTML tags and control characters to prevent Stored & Reflected XSS
export function sanitizeText(input, maxLength = 250) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>'"`;(){}[\]\\]/g, '') // remove HTML & scripting characters
    .replace(/[\x00-\x1F\x7F]/g, '')    // remove control characters
    .slice(0, maxLength);
}

// Phone number sanitizer (only digits, optional leading plus, spaces/dashes)
export function sanitizePhone(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[^\d+\-\s]/g, '')
    .slice(0, 16);
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
 * SHA-256 password hash using standard Web Crypto API (PBKDF2/SHA-256 standard)
 */
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
