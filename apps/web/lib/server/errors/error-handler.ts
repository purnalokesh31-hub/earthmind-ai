// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Global API Handler with Pino Logging & Security
// ──────────────────────────────────────────────────────────────

import { isAppError } from './app-error';
import { logger } from '../logger';
import { applySecurityHeaders, enforcePayloadSizeLimit } from '../middleware/security.middleware';

export interface RequestOptions {
  userId?: string;
  incidentId?: string;
}

// ── Core utility — call inside any route handler ───────────────
export async function handleRequest(
  req: Request,
  fn: (ctx: { requestId: string; traceId: string }) => Promise<Response>,
  opts?: RequestOptions
): Promise<Response> {
  const url = new URL(req.url);
  const requestId = req.headers.get('x-request-id') || `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const traceId = req.headers.get('x-trace-id') || `em-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const userId = opts?.userId || req.headers.get('x-user-id') || 'anonymous';
  const incidentId = opts?.incidentId || req.headers.get('x-incident-id') || extractIncidentIdFromUrl(url.pathname);
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const reqOrigin = req.headers.get('origin');

  const startMs = Date.now();

  try {
    // ── Pre-execution security check: Payload limits ───────
    enforcePayloadSizeLimit(req);

    // ── Handle CORS Preflight ──────────────────────────────
    if (req.method === 'OPTIONS') {
      const preflightRes = new Response(null, { status: 204 });
      return applySecurityHeaders(preflightRes, reqOrigin);
    }

    const response = await fn({ requestId, traceId });
    const durationMs = Date.now() - startMs;

    // Attach tracing header to response & apply security headers
    response.headers.set('X-Trace-Id', traceId);
    response.headers.set('X-Request-Id', requestId);
    applySecurityHeaders(response, reqOrigin);

    // Log structured Pino request event
    logger.logRequest({
      requestId,
      traceId,
      userId,
      incidentId,
      method: req.method,
      url: url.pathname,
      statusCode: response.status,
      durationMs,
      ip,
      userAgent,
    });

    return response;
  } catch (error: unknown) {
    const durationMs = Date.now() - startMs;
    const errorRes = serializeError(error, req, {
      requestId,
      traceId,
      userId,
      incidentId,
      ip,
      userAgent,
      durationMs,
    });
    return applySecurityHeaders(errorRes, reqOrigin);
  }
}

// ── Extract incident ID from route pathname if available ──────
function extractIncidentIdFromUrl(pathname: string): string | undefined {
  const match = pathname.match(/\/incidents\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : undefined;
}

// ── Error → Response Serializer ────────────────────────────────
function serializeError(
  error: unknown,
  req: Request,
  meta: {
    requestId: string;
    traceId: string;
    userId: string;
    incidentId?: string;
    ip: string;
    userAgent: string;
    durationMs: number;
  }
): Response {
  const isProd = process.env.NODE_ENV === 'production';
  const url = new URL(req.url);

  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred. Please try again later.';
  let details: Record<string, string[]> | undefined;

  if (isAppError(error)) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
    message = error.message;
    details = error.details;

    logger.warn(`Operational Error: ${error.errorCode} - ${error.message}`, {
      ...meta,
      errorCode,
      statusCode,
      details,
    });
  } else {
    if (!isProd && error instanceof Error) {
      message = error.message;
    }

    logger.error(`Fatal Unhandled Server Error: ${url.pathname}`, error, {
      ...meta,
      errorCode,
      statusCode,
    });
  }

  logger.logRequest(
    {
      requestId: meta.requestId,
      traceId: meta.traceId,
      userId: meta.userId,
      incidentId: meta.incidentId,
      method: req.method,
      url: url.pathname,
      statusCode,
      durationMs: meta.durationMs,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
    'API Request Error'
  );

  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details ? { details } : {}),
      },
      traceId: meta.traceId,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-Id': meta.traceId,
        'X-Request-Id': meta.requestId,
      },
    }
  );
}
