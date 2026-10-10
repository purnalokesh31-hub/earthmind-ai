// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Secure Cookie Utilities
// ──────────────────────────────────────────────────────────────

import { envConfig } from '../config';

export interface CookieOptions {
  maxAgeSeconds?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  path?: string;
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];

  const path = options.path || '/';
  parts.push(`Path=${path}`);

  if (options.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  const isSecure = options.secure !== undefined ? options.secure : envConfig.NODE_ENV === 'production';
  if (isSecure) {
    parts.push('Secure');
  }

  const sameSite = options.sameSite || 'Lax';
  parts.push(`SameSite=${sameSite}`);

  return parts.join('; ');
}

export function serializeClearCookie(name: string, path = '/'): string {
  return serializeCookie(name, '', { maxAgeSeconds: 0, path });
}

export function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};

  cookieHeader.split(';').forEach((pair) => {
    const [key, val] = pair.split('=');
    if (key && val) {
      cookies[key.trim()] = decodeURIComponent(val.trim());
    }
  });

  return cookies;
}
