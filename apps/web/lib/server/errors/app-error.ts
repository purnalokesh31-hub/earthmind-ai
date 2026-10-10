// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Enterprise Error Hierarchy
// ──────────────────────────────────────────────────────────────
// All server errors extend AppError.
// Controllers throw typed errors — the global handler serializes them.
// ──────────────────────────────────────────────────────────────

// ── Base Error ─────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, string[]>;
  public readonly traceId?: string;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = 'INTERNAL_ERROR',
    options?: {
      isOperational?: boolean;
      details?: Record<string, string[]>;
      traceId?: string;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;
    this.traceId = options?.traceId;
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ── 400 Bad Request Error ──────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: Record<string, string[]>) {
    super(message, 400, 'BAD_REQUEST', { isOperational: true, details });
  }
}

// ── 400 Validation Error ───────────────────────────────────────
export class ValidationError extends AppError {
  constructor(
    message = 'Request validation failed',
    details?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', { isOperational: true, details });
  }
}

// ── 401 Unauthorized Error ─────────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required to access this resource') {
    super(message, 401, 'UNAUTHORIZED', { isOperational: true });
  }
}

// ── 403 Forbidden Error ────────────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN', { isOperational: true });
  }
}

// ── 404 Not Found Error ────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string) {
    const message = id
      ? `${resource} with ID '${id}' was not found`
      : `${resource} was not found`;
    super(message, 404, 'NOT_FOUND', { isOperational: true });
  }
}

// ── 409 Conflict Error ─────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists or conflicts with current state') {
    super(message, 409, 'CONFLICT', { isOperational: true });
  }
}

// ── 413 Payload Too Large Error ────────────────────────────────
export class PayloadTooLargeError extends AppError {
  constructor(message = 'Request payload exceeds maximum allowed size') {
    super(message, 413, 'PAYLOAD_TOO_LARGE', { isOperational: true });
  }
}

// ── 422 Unprocessable Entity ───────────────────────────────────
export class UnprocessableError extends AppError {
  constructor(message = 'Request could not be processed') {
    super(message, 422, 'UNPROCESSABLE_ENTITY', { isOperational: true });
  }
}

// ── 429 Rate Limit Error ───────────────────────────────────────
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please slow down.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { isOperational: true });
  }
}

// ── 500 Database Error ─────────────────────────────────────────
export class DatabaseError extends AppError {
  constructor(message = 'A database error occurred', originalError?: unknown) {
    super(message, 500, 'DATABASE_ERROR', { isOperational: false });
    if (originalError instanceof Error) {
      this.cause = originalError;
    }
  }
}

// ── 500 Internal Server Error ──────────────────────────────────
export class InternalServerError extends AppError {
  constructor(message = 'An unexpected internal error occurred') {
    super(message, 500, 'INTERNAL_ERROR', { isOperational: false });
  }
}

// ── 502 External Service Error ─────────────────────────────────
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message ?? `External service '${service}' is unavailable`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      { isOperational: true }
    );
  }
}

// ── Type Guard ─────────────────────────────────────────────────
export function isAppError(error: unknown): error is AppError {
  if (!error || typeof error !== 'object') return false;
  return (
    error instanceof AppError ||
    ('statusCode' in error && 'errorCode' in error && typeof (error as any).statusCode === 'number')
  );
}
