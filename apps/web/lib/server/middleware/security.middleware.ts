// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Security Middleware (CORS, Headers, Payload Limits)
// ──────────────────────────────────────────────────────────────

import { PayloadTooLargeError } from '../errors/app-error';
import { envConfig } from '../config';

const MAX_JSON_PAYLOAD_BYTES = 1 * 1024 * 1024;    // 1 MB default
const MAX_UPLOAD_PAYLOAD_BYTES = 100 * 1024 * 1024; // 100 MB for file uploads

export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'X-XSS-Protection': '1; mode=block',
} as const;

// ── Injects Security & CORS Headers into Response ──────────────
export function applySecurityHeaders(res: Response, reqOrigin?: string | null): Response {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
    res.headers.set(key, val);
  });

  // CORS Headers
  const origin = reqOrigin || '*';
  res.headers.set('Access-Control-Allow-Origin', origin);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Trace-Id, X-Request-Id, X-CSRF-Token, X-User-Id, X-Incident-Id'
  );
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Max-Age', '86400');

  return res;
}

// ── Enforce Request Payload Size Limits ────────────────────────
export function enforcePayloadSizeLimit(req: Request): void {
  const contentLength = req.headers.get('content-length');
  if (!contentLength) return;

  const bytes = parseInt(contentLength, 10);
  if (isNaN(bytes)) return;

  const contentType = req.headers.get('content-type') || '';
  const isFileUpload = contentType.includes('multipart/form-data');
  const maxAllowed = isFileUpload ? MAX_UPLOAD_PAYLOAD_BYTES : MAX_JSON_PAYLOAD_BYTES;

  if (bytes > maxAllowed) {
    const limitMb = Math.round(maxAllowed / (1024 * 1024));
    throw new PayloadTooLargeError(
      `Request payload size (${Math.round(bytes / 1024)}KB) exceeds limit of ${limitMb}MB`
    );
  }
}
